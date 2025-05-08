import {useCallback, useEffect, useRef, useState} from 'react';
import {
  RTCPeerConnection,
  RTCSessionDescription,
  RTCIceCandidate,
  mediaDevices,
  MediaStream,
} from 'react-native-webrtc';
import {Socket} from 'socket.io-client';

interface WebRTCHookProps {
  socket: Socket | null;
  roomId: string;
  isCaller: boolean;
  isOnpenCamera: boolean;
  navigation: any;
  participants: any[];
  caller: {user_id: string; id: string; name: string; avatar: string};
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
  isOnpenCamera, // trạng thái mở camera hay tắt camera
  navigation,
  participants,
  caller,
}: WebRTCHookProps) => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<{
    [userId: string]: MediaStream;
  }>({});
  const [participanteds, setParticipanteds] = useState<any[]>(
    participants || [],
  );
  const [isMicOn, setIsMicOn] = useState<boolean>(true);
  const [statusCamera, setStatusCamera] = useState<boolean>(isOnpenCamera);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);

  const peerConnections = useRef<{[userId: string]: RTCPeerConnection}>({});
  const userIdToSocketId = useRef<{[userId: string]: string}>({});
  const pendingSignals = useRef<any[]>([]);
  const isMounted = useRef(false);
  const processingOffer = useRef<Set<string>>(new Set());
  const processingAnswer = useRef<Set<string>>(new Set());
  const processedIceCandidates = useRef<Set<string>>(new Set());

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

  const setupMedia = useCallback(async () => {
    try {
      const stream = await mediaDevices.getUserMedia({
        audio: true,
        video: {
          width: 720,
          height: 1080,
          frameRate: 30,
          facingMode: 'user',
        },
      });

      stream.getVideoTracks().forEach(track => {
        console.log('Video track:', track);
        track.enabled = statusCamera;
      });

      stream.getAudioTracks().forEach(track => {
        console.log('Audio track:', track);
        track.enabled = isMicOn;
      });

      setLocalStream(stream);
      return true;
    } catch (err) {
      console.error('Failed to get media stream:', err);
      return false;
    }
  }, []);

  const setupPeerConnection = useCallback(
    (
      userId: string,
      targetSocketId: string,
      stream: MediaStream,
    ): RTCPeerConnection => {
      if (!userId || !targetSocketId) return {} as RTCPeerConnection;

      const existingPeer = peerConnections.current[userId];
      if (existingPeer && existingPeer.connectionState !== 'closed') {
        return existingPeer;
      }

      if (existingPeer && existingPeer.connectionState === 'closed') {
        delete peerConnections.current[userId];
      }

      const peer = new RTCPeerConnection({
        iceServers,
      }) as ExtendedRTCPeerConnection;

      stream.getTracks().forEach(track => {
        peer.addTrack(track, stream);
      });

      peer.onicecandidate = ({candidate}) => {
        if (candidate) {
          const candidateId = `${userId}-${JSON.stringify(candidate)}`;
          if (!processedIceCandidates.current.has(candidateId)) {
            processedIceCandidates.current.add(candidateId);
            socket?.emit('sendSignal', {
              signal: candidate,
              targetSocketId,
              roomId,
              type: 'ice-candidate',
            });
          }
        }
      };

      peer.ontrack = event => {
        const remoteStream = event.streams[0] as unknown as MediaStream; // Lấy stream đầu tiên
        if (remoteStream) {
          setRemoteStreams(prev => ({...prev, [userId]: remoteStream}));
        }
      };

      peer.oniceconnectionstatechange = () => {
        const state = peer.iceConnectionState;
        if (['disconnected', 'failed', 'closed'].includes(state)) {
          delete peerConnections.current[userId];
          setRemoteStreams(prev => {
            const newStreams = {...prev};
            delete newStreams[userId];
            return newStreams;
          });
        }
      };

      peerConnections.current[userId] = peer;
      userIdToSocketId.current[userId] = targetSocketId;
      return peer;
    },
    [socket],
  );

  const createOffer = useCallback(
    async (peer: RTCPeerConnection, userId: string, targetSocketId: string) => {
      if (processingOffer.current.has(userId)) return;

      processingOffer.current.add(userId);

      try {
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
      } catch (err) {
        console.error(`Error creating offer for ${userId}:`, err);
      } finally {
        processingOffer.current.delete(userId);
      }
    },
    [],
  );

  const handleSignal = useCallback(
    async ({
      signal,
      targetSocketId,
      type,
      userId,
    }: {
      signal: any;
      targetSocketId: string;
      type: string;
      userId: string;
    }) => {
      if (!localStream) {
        pendingSignals.current.push({signal, targetSocketId, type, userId});
        return;
      }

      let peer = peerConnections.current[userId];
      if (!peer) {
        peer = setupPeerConnection(userId, targetSocketId, localStream);
      }

      try {
        switch (type) {
          case 'offer':
            if (processingAnswer.current.has(userId)) {
              pendingSignals.current.push({
                signal,
                targetSocketId,
                type,
                userId,
              });
              return;
            }

            processingAnswer.current.add(userId);

            try {
              await peer.setRemoteDescription(
                new RTCSessionDescription(signal),
              );
              const answer = await peer.createAnswer();
              await peer.setLocalDescription(answer);

              socket?.emit('sendSignal', {
                signal: answer,
                targetSocketId,
                roomId,
                type: 'answer',
              });
            } finally {
              processingAnswer.current.delete(userId);
            }
            break;

          case 'answer':
            await peer.setRemoteDescription(new RTCSessionDescription(signal));
            break;

          case 'ice-candidate':
            if (signal) {
              await peer.addIceCandidate(new RTCIceCandidate(signal));
            }
            break;

          default:
            console.warn(`Unknown signal type: ${type}`);
        }
      } catch (err) {
        console.error(`Error handling signal for ${userId}:`, err);
      }
    },
    [],
  );

  const endCall = useCallback(() => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }

    Object.values(peerConnections.current).forEach(peer => {
      try {
        peer.close();
      } catch (err) {}
    });

    peerConnections.current = {};
    userIdToSocketId.current = {};
    processingOffer.current.clear();
    processingAnswer.current.clear();
    processedIceCandidates.current.clear();

    setLocalStream(null);
    setRemoteStreams({});
    setParticipanteds([]);

    socket?.emit('endCall', {conversationId: roomId});
    navigation.goBack();
  }, [socket, roomId, navigation, localStream]);

  const handleRejoin = useCallback(async () => {
    if (!socket || !socket.connected) return;

    const userId = caller.user_id;
    if (!userId) return;

    // Gửi rejoin_call
    socket.emit('rejoin_call', {roomId, userId});

    // Khôi phục localStream
    const success = await setupMedia();
    if (!success) {
      endCall();
      return;
    }

    // Chờ call_update từ server để tái tạo peerConnections
  }, []);

  useEffect(() => {
    if (!socket) return;

    isMounted.current = true;

    socket.on(
      'receiveSignal',
      ({signal, senderId: targetSocketId, type, userId}) => {
        handleSignal({signal, targetSocketId, type, userId});
      },
    );
    socket.on('request_offer', ({targetSocketId, userId}) => {
      if (localStream) {
        const peer = setupPeerConnection(userId, targetSocketId, localStream);
        createOffer(peer, userId, targetSocketId);
      }
    });
    socket.on('call_update', ({type, participant, allParticipants}) => {
      setParticipanteds(allParticipants);
      if (type === 'participant_joined' && localStream) {
        const userId = participant.user_id;
        const targetSocketId =
          userIdToSocketId.current[userId] || `temp_${userId}`;
        const peer = setupPeerConnection(userId, targetSocketId, localStream);
        if (isCaller) {
          createOffer(peer, userId, targetSocketId);
        }
      }
    });
    socket.on('userLeftCall', ({userId}) => {
      if (peerConnections.current[userId]) {
        peerConnections.current[userId].close();
        delete peerConnections.current[userId];
        delete userIdToSocketId.current[userId];
        setRemoteStreams(prev => {
          const newStreams = {...prev};
          delete newStreams[userId];
          return newStreams;
        });
      }
    });
    socket.on('call_ended', endCall);
    socket.on('call_cancelled', endCall);
    socket.on('force_end_call', endCall);

    socket.on('connect', handleRejoin);

    return () => {
      isMounted.current = false;
      socket.off('receiveSignal');
      socket.off('request_offer');
      socket.off('call_update');
      socket.off('userLeftCall');
      socket.off('call_ended');
      socket.off('call_cancelled');
      socket.off('force_end_call');
      socket.off('connect');
    };
  }, []);

  useEffect(() => {
    if (localStream && pendingSignals.current.length > 0) {
      const signals = [...pendingSignals.current];
      pendingSignals.current = [];
      signals.forEach(signal => handleSignal(signal));
    }
  }, []);

  return {
    localStream,
    remoteStreams,
    participanteds,
    isMicOn,
    setIsMicOn,
    statusCamera,
    setStatusCamera,
    setupMedia,
    setupPeerConnection,
    createOffer,
    endCall,
    isSpeakerOn,
    setIsSpeakerOn,
    setLocalStream,
    setParticipanteds,
    setRemoteStreams,
    handleRejoin,
  };
};
