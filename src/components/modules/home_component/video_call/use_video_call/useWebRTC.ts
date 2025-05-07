import {useCallback, useEffect, useRef, useState} from 'react';
import {
  RTCPeerConnection,
  RTCSessionDescription,
  RTCIceCandidate,
  mediaDevices,
  MediaStream,
} from 'react-native-webrtc';
import {Socket} from 'socket.io-client';

// Props for the custom hook
interface WebRTCHookProps {
  socket: Socket | null;
  roomId: string;
  isCaller: boolean;
  isOnpenCamera: boolean;
  navigation: any;
  participants: any[];
}

interface ExtendedRTCPeerConnection extends RTCPeerConnection {
  onicecandidate: (event: RTCPeerConnectionIceEvent) => void;
  ontrack: (event: RTCTrackEvent) => void;
  oniceconnectionstatechange: () => void;
}

export const useWebRTC = ({
  socket,
  roomId,
  isCaller,
  isOnpenCamera,
  navigation,
  participants,
}: WebRTCHookProps) => {
  // States
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(
    new Map(),
  );
  const [participanteds, setParticipanteds] = useState<any[]>(
    participants || [],
  );
  const [isMicOn, setIsMicOn] = useState(true);
  const [statusCamera, setStatusCamera] = useState(isOnpenCamera);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);

  // Refs
  const peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map());
  const pendingSignals = useRef<any[]>([]);
  const isMounted = useRef(false);
  const processingOffer = useRef<Set<string>>(new Set());
  const processingAnswer = useRef<Set<string>>(new Set());
  const processedIceCandidates = useRef<Set<string>>(new Set());

  // ICE servers configuration
  const iceServers = [
    {urls: 'stun:stun.l.google.com:19302'},
    {urls: 'stun:stun1.l.google.com:19302'},
    {
      urls: 'turn:openrelay.metered.ca:80',
      username: 'openrelayproject',
      credential: 'openrelayproject',
    },
    {
      urls: 'turn:openrelay.metered.ca:443',
      username: 'openrelayproject',
      credential: 'openrelayproject',
    },
  ];

  // Initialize media stream
  const setupMedia = useCallback(async () => {
    try {
      // console.log('Setting up media streams');
      const stream = await mediaDevices.getUserMedia({
        audio: true,
        video: {
          width: 640,
          height: 480,
          frameRate: 30,
        },
      });

      // Update track states based on initial settings
      stream.getVideoTracks().forEach(track => {
        track.enabled = statusCamera;
      });

      stream.getAudioTracks().forEach(track => {
        track.enabled = isMicOn;
      });

      setLocalStream(stream);
      // console.log('Local stream setup complete');
      return true;
    } catch (err) {
      console.error('Failed to get media stream:', err);
      return false;
    }
  }, [statusCamera, isMicOn]);

  // Set up peer connection
  const setupPeerConnection = useCallback(
    (targetSocketId: string, stream: MediaStream): RTCPeerConnection => {
      // console.log(`Setting up peer connection for ${targetSocketId}`);

      // Close existing connection if present
      if (peerConnections.current.has(targetSocketId)) {
        const existingPeer = peerConnections.current.get(targetSocketId)!;
        if (existingPeer.connectionState !== 'closed') {
          try {
            existingPeer.close();
          } catch (err) {
            console.error('Error closing existing peer connection:', err);
          }
        }
        peerConnections.current.delete(targetSocketId);
      }

      // Create new peer connection
      const peer = new RTCPeerConnection({
        iceServers,
      }) as ExtendedRTCPeerConnection;

      // Add all tracks from local stream to peer connection
      stream.getTracks().forEach(track => {
        peer.addTrack(track, stream);
      });

      // Handle ICE candidates
      peer.onicecandidate = ({candidate}) => {
        if (candidate) {
          const candidateId = `${targetSocketId}-${JSON.stringify(candidate)}`;
          if (!processedIceCandidates.current.has(candidateId)) {
            processedIceCandidates.current.add(candidateId);
            console.log(`Sending ICE candidate to ${targetSocketId}`);
            socket?.emit('sendSignal', {
              signal: {candidate},
              targetSocketId,
              roomId,
              type: 'iceCandidate',
            });
          }
        }
      };

      // Handle incoming tracks
      peer.ontrack = event => {
        // console.log(`Received track from ${targetSocketId}`);
        const remoteStream = event.streams[0];
        if (remoteStream) {
          setRemoteStreams(prev => {
            const newStreams = new Map(prev);
            newStreams.set(targetSocketId, remoteStream as any);
            return newStreams;
          });
        }
      };

      // Handle connection state changes
      peer.oniceconnectionstatechange = () => {
        console.log(
          `ICE connection state for ${targetSocketId}: ${peer.iceConnectionState}`,
        );
        if (
          ['disconnected', 'failed', 'closed'].includes(peer.iceConnectionState)
        ) {
          console.log(
            `Removing peer connection for ${targetSocketId} due to state: ${peer.iceConnectionState}`,
          );
          peerConnections.current.delete(targetSocketId);
          setRemoteStreams(prev => {
            const newStreams = new Map(prev);
            newStreams.delete(targetSocketId);
            return newStreams;
          });
        }
      };

      // Save the peer connection
      peerConnections.current.set(targetSocketId, peer);
      return peer;
    },
    [socket, roomId],
  );

  // Create offer
  const createOffer = useCallback(
    async (peer: RTCPeerConnection, targetSocketId: string) => {
      if (processingOffer.current.has(targetSocketId)) {
        // console.log(`Already creating offer for ${targetSocketId}, skipping`);
        return;
      }

      processingOffer.current.add(targetSocketId);

      try {
        // console.log(`Creating offer for ${targetSocketId}`);
        const offer = await peer.createOffer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: true,
        });

        await peer.setLocalDescription(offer);

        socket?.emit('sendSignal', {
          signal: offer,
          targetSocketId,
          roomId,
          type: 'offer',
        });

        // console.log(`Offer sent to ${targetSocketId}`);
      } catch (err) {
        console.error(`Error creating offer for ${targetSocketId}:`, err);
      } finally {
        processingOffer.current.delete(targetSocketId);
      }
    },
    [socket, roomId],
  );

  // Handle incoming signals
  const handleSignal = useCallback(
    async ({
      signal,
      senderId,
      type,
    }: {
      signal: any;
      senderId: string;
      type: string;
    }) => {
      if (!localStream) {
        console.log(`No local stream yet, queueing signal from ${senderId}`);
        pendingSignals.current.push({signal, senderId, type});
        return;
      }

      try {
        let peer = peerConnections.current.get(senderId);

        // If no peer connection exists for this sender, create one
        if (!peer) {
          // console.log(`Creating new peer connection for ${senderId}`);
          peer = setupPeerConnection(senderId, localStream);
        }

        switch (type) {
          case 'offer':
            if (processingAnswer.current.has(senderId)) {
              // console.log(
              //   `Already processing answer for ${senderId}, queueing offer`,
              // );
              pendingSignals.current.push({signal, senderId, type});
              return;
            }

            processingAnswer.current.add(senderId);

            try {
              // console.log(`Processing offer from ${senderId}`);
              await peer.setRemoteDescription(
                new RTCSessionDescription(signal),
              );

              const answer = await peer.createAnswer();
              await peer.setLocalDescription(answer);

              socket?.emit('sendSignal', {
                signal: answer,
                targetSocketId: senderId,
                roomId,
                type: 'answer',
              });

              // console.log(`Answer sent to ${senderId}`);
            } catch (err) {
              console.error(`Error processing offer from ${senderId}:`, err);
            } finally {
              processingAnswer.current.delete(senderId);
            }
            break;

          case 'answer':
            // console.log(`Processing answer from ${senderId}`);
            await peer.setRemoteDescription(new RTCSessionDescription(signal));
            // console.log(`Remote description set for ${senderId}`);
            break;

          case 'iceCandidate':
            if (signal.candidate) {
              // console.log(`Adding ICE candidate from ${senderId}`);
              await peer.addIceCandidate(new RTCIceCandidate(signal.candidate));
            }
            break;

          default:
            console.warn(`Unknown signal type: ${type}`);
        }
      } catch (err) {
        console.error(`Error handling signal from ${senderId}:`, err);
      }
    },
    [localStream, setupPeerConnection, socket, roomId],
  );

  // End call
  const endCall = useCallback(() => {
    // console.log('Ending call');

    // Stop all tracks in local stream
    if (localStream) {
      localStream.getTracks().forEach(track => {
        track.stop();
      });
    }

    // Close all peer connections
    peerConnections.current.forEach((peer, socketId) => {
      // console.log(`Closing peer connection for ${socketId}`);
      try {
        peer.close();
      } catch (err) {
        console.error(`Error closing peer connection for ${socketId}:`, err);
      }
    });

    // Clear collections
    peerConnections.current.clear();
    processingOffer.current.clear();
    processingAnswer.current.clear();
    processedIceCandidates.current.clear();

    // Reset state
    setLocalStream(null);
    setRemoteStreams(new Map());

    // Notify server
    socket?.emit('endCall', {conversationId: roomId});

    // Navigate back
    navigation.goBack();

    // console.log('Call ended');
  }, [socket, localStream, roomId, navigation]);

  // Process pending signals when stream becomes available
  useEffect(() => {
    if (localStream && pendingSignals.current.length > 0) {
      // console.log(
      //   `Processing ${pendingSignals.current.length} pending signals`,
      // );
      const signals = [...pendingSignals.current];
      pendingSignals.current = [];

      signals.forEach(signal => {
        handleSignal(signal);
      });
    }
  }, [localStream, handleSignal]);

  // Set up socket listeners
  useEffect(() => {
    if (!socket) return;

    isMounted.current = true;

    // Set up socket event listeners
    socket.on('receiveSignal', handleSignal);
    socket.on('call_ended', () => {
      // console.log('Received call_ended event');
      endCall();
    });

    // Cleanup on unmount
    return () => {
      isMounted.current = false;
      socket.off('receiveSignal', handleSignal);
      socket.off('call_ended');
    };
  }, [socket, handleSignal, endCall]);

  // Return everything needed by components
  return {
    localStream,
    participanteds,
    remoteStreams,
    isMicOn,
    setIsMicOn,
    statusCamera,
    setStatusCamera,
    setupMedia,
    setupPeerConnection,
    createOffer,
    handleSignal,
    endCall,
    isSpeakerOn,
    setIsSpeakerOn,
    setLocalStream,
    setParticipanteds,
    setRemoteStreams,
  };
};
