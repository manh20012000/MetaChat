import {useCallback, useEffect, useRef, useState} from 'react';
import {
  RTCPeerConnection,
  RTCSessionDescription,
  RTCIceCandidate,
  mediaDevices,
  MediaStream,
} from 'react-native-webrtc';
import {Socket} from 'socket.io-client';
import {PermissionsAndroid, Platform} from 'react-native';

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
  isOnpenCamera,
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
  const hasSetupMedia = useRef(false);
  const localStreamRef = useRef<MediaStream | null>(null);

  const iceServers = [
    // Google STUN servers
    {urls: 'stun:stun.l.google.com:19302'},
    {urls: 'stun:stun1.l.google.com:19302'},
    {urls: 'stun:stun2.l.google.com:19302'},
    {urls: 'stun:stun3.l.google.com:19302'},
    {urls: 'stun:stun4.l.google.com:19302'},

    // OpenRelay TURN servers
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
    {
      urls: 'turn:openrelay.metered.ca:443?transport=tcp',
      username: 'openrelayproject',
      credential: 'openrelayproject',
    },
  ];

  const setupMedia = useCallback(async () => {
    if (hasSetupMedia.current) {
      console.log('[setupMedia] Already set up, skipping');
      return true;
    }

    try {
      // Check permissions first
      if (Platform.OS === 'android') {
        console.log('[setupMedia] Checking microphone permission...');
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: 'Microphone Permission',
            message: 'App needs access to your microphone for video calls',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        console.log('[setupMedia] Permission result:', granted);
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          console.error('[setupMedia] Microphone permission denied');
          return false;
        }
      }

      console.log(
        '[setupMedia] Requesting media stream, isOnpenCamera:',
        isOnpenCamera,
      );
      const stream = await mediaDevices.getUserMedia({
        audio: true,
        video: isOnpenCamera
          ? {width: 720, height: 1080, facingMode: 'user'}
          : false,
      });

      console.log('[setupMedia] Stream obtained:', stream.toURL());
      const audioTracks = stream.getAudioTracks();
      console.log('[setupMedia] Number of audio tracks:', audioTracks.length);

      audioTracks.forEach((track, index) => {
        console.log(`[setupMedia] Audio track ${index}:`, {
          enabled: track.enabled,
          muted: track.muted,
          readyState: track.readyState,
          kind: track.kind,
          label: track.label,
        });
        track.enabled = isMicOn;
      });

      const videoTracks = stream.getVideoTracks();
      console.log('[setupMedia] Number of video tracks:', videoTracks.length);

      videoTracks.forEach((track, index) => {
        console.log(`[setupMedia] Video track ${index}:`, {
          enabled: track.enabled,
          muted: track.muted,
          readyState: track.readyState,
          kind: track.kind,
          label: track.label,
        });
        track.enabled = statusCamera;
      });

      setLocalStream(stream);
      localStreamRef.current = stream;
      hasSetupMedia.current = true;

      // Xử lý pending signals ngay khi localStream sẵn sàng
      if (pendingSignals.current.length > 0) {
        console.log(
          '[setupMedia] Processing pending signals:',
          pendingSignals.current.length,
        );
        const signals = [...pendingSignals.current];
        pendingSignals.current = [];
        signals.forEach(signal => handleSignal(signal));
      }

      return true;
    } catch (err) {
      console.error('[setupMedia] Failed to get media stream:', err);
      return false;
    }
  }, []);

  const createOffer = useCallback(
    async (peer: RTCPeerConnection, userId: string, targetSocketId: string) => {
      if (processingOffer.current.has(userId)) {
        // console.log('[createOffer] Already processing offer for userId:', userId);
        return;
      }

      processingOffer.current.add(userId);
      // console.log('[createOffer] Creating offer for userId:', userId);

      try {
        const offer = await peer.createOffer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: true,
        });

        await peer.setLocalDescription(offer);
        // console.log('[createOffer] Offer created and set for userId:', userId);

        socket?.emit('sendSignal', {
          signal: offer,
          targetSocketId,
          roomId,
          type: 'offer',
        });
      } catch (err) {
        console.error(
          '[createOffer] Error creating offer for userId:',
          userId,
          err,
        );
      } finally {
        processingOffer.current.delete(userId);
      }
    },
    [socket],
  );

  const setupPeerConnection = useCallback(
    (
      userId: string,
      targetSocketId: string,
      stream: MediaStream,
    ): RTCPeerConnection => {
      console.log(
        '[setupPeerConnection] Setting up for userId:',
        userId,
        'targetSocketId:',
        targetSocketId,
      );
      if (!userId || !targetSocketId) {
        console.error('[setupPeerConnection] Invalid userId or targetSocketId');
        return {} as RTCPeerConnection;
      }

      const existingPeer = peerConnections.current[userId];
      if (existingPeer && existingPeer.connectionState !== 'closed') {
        console.log(
          '[setupPeerConnection] Reusing existing peer for userId:',
          userId,
        );
        return existingPeer;
      }

      if (existingPeer && existingPeer.connectionState === 'closed') {
        console.log(
          '[setupPeerConnection] Removing closed peer for userId:',
          userId,
        );
        delete peerConnections.current[userId];
      }

      const peer = new RTCPeerConnection({
        iceServers,
        iceTransportPolicy: 'all',
        iceCandidatePoolSize: 10,
        bundlePolicy: 'max-bundle',
        rtcpMuxPolicy: 'require',
      }) as ExtendedRTCPeerConnection;

      stream.getTracks().forEach(track => {
        console.log('[setupPeerConnection] Adding track:', track.kind);
        peer.addTrack(track, stream);
      });

      peer.onicecandidate = ({candidate}) => {
        if (candidate) {
          console.log(
            '[onicecandidate] Candidate:',
            candidate.type,
            'dhsdjsjdskskdks',
            candidate.candidate,
          );
          const candidateId = `${userId}-${candidate.sdpMid}-${candidate.sdpMLineIndex}-${candidate.candidate}`;
          if (!processedIceCandidates.current.has(candidateId)) {
            processedIceCandidates.current.add(candidateId);
            console.log(
              '[onicecandidate] Sending ICE candidate for userId:',
              userId,
            );
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
        console.log(
          '[ontrack] Received remote stream for userId:',
          userId,
          event.streams,
        );
        const remoteStream = event.streams[0] as unknown as MediaStream;
        if (remoteStream) {
          remoteStream.getTracks().forEach(track => {
            console.log(
              '[ontrack] Track type:',
              track.kind,
              'Enabled:',
              track.enabled,
            );
          });
          setIsSpeakerOn(true); // Bật loa
          setRemoteStreams(prev => {
            if (prev[userId] !== remoteStream) {
              return {...prev, [userId]: remoteStream};
            }
            return prev;
          });
        }
      };

      peer.oniceconnectionstatechange = () => {
        const state = peer.iceConnectionState;
        console.log(
          '[oniceconnectionstatechange] ICE state for userId:',
          userId,
          state,
          'Connection state:',
          peer.connectionState,
          'Signaling state:',
          peer.signalingState,
        );

        if (state === 'connected' || state === 'completed') {
          console.log(
            '[oniceconnectionstatechange] Connection established for userId:',
            userId,
          );
        } else if (state === 'failed') {
          console.log(
            '[oniceconnectionstatechange] Peer failed, restarting for userId:',
            userId,
            'Last ICE gathering state:',
            peer.iceGatheringState,
            'Last ICE connection state:',
            peer.iceConnectionState,
          );
          const targetSocketId = userIdToSocketId.current[userId];
          if (targetSocketId && localStreamRef.current) {
            const newPeer = setupPeerConnection(
              userId,
              targetSocketId,
              localStreamRef.current,
            );
            if (isCaller) {
              createOffer(newPeer, userId, targetSocketId);
            }
          }
        } else if (['disconnected', 'closed'].includes(state)) {
          console.log(
            '[oniceconnectionstatechange] Cleaning up peer for userId:',
            userId,
          );
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
    [socket, roomId, isCaller],
  );

  const handleSignal = useCallback(
    async ({
      signal,
      targetSocketId,
      type,
      userId,
      senderUserId,
    }: {
      signal: any;
      targetSocketId: string;
      type: string;
      userId: string;
      senderUserId: string;
    }) => {
      // console.log('[handleSignal] Handling signal:', { type, senderUserId, targetSocketId });
      if (!localStreamRef.current) {
        // console.log('[handleSignal] No localStream, queuing signal for userId:', senderUserId);
        pendingSignals.current.push({
          signal,
          targetSocketId,
          type,
          userId,
          senderUserId,
        });
        return;
      }

      let peer = peerConnections.current[senderUserId];
      if (!peer) {
        // console.log('[handleSignal] Creating new peer for senderUserId:', senderUserId);
        peer = setupPeerConnection(
          senderUserId,
          targetSocketId,
          localStreamRef.current,
        );
      }

      if (peer.connectionState === 'closed') {
        // console.log('[handleSignal] Peer closed for userId:', senderUserId);
        return;
      }

      try {
        switch (type) {
          case 'offer':
            if (processingAnswer.current.has(senderUserId)) {
              // console.log('[handleSignal] Already processing answer for userId:', senderUserId);
              return;
            }

            processingAnswer.current.add(senderUserId);
            // console.log('[handleSignal] Setting remote offer for userId:', senderUserId);

            try {
              await peer.setRemoteDescription(
                new RTCSessionDescription(signal),
              );
              const answer = await peer.createAnswer();
              await peer.setLocalDescription(answer);
              // console.log('[handleSignal] Answer created and set for userId:', senderUserId);

              socket?.emit('sendSignal', {
                signal: answer,
                targetSocketId,
                roomId,
                type: 'answer',
              });
            } finally {
              processingAnswer.current.delete(senderUserId);
            }
            break;

          case 'answer':
            // console.log('[handleSignal] Setting remote answer for userId:', senderUserId);
            await peer.setRemoteDescription(new RTCSessionDescription(signal));
            break;

          case 'ice-candidate':
            if (signal) {
              const candidateId = `${senderUserId}-${signal.sdpMid}-${signal.sdpMLineIndex}-${signal.candidate}`;
              if (!processedIceCandidates.current.has(candidateId)) {
                processedIceCandidates.current.add(candidateId);
                // console.log('[handleSignal] Adding ICE candidate for userId:', senderUserId);
                await peer.addIceCandidate(new RTCIceCandidate(signal));
              }
            }
            break;

          default:
            console.warn('[handleSignal] Unknown signal type:', type);
        }
      } catch (err) {
        console.error(
          '[handleSignal] Error handling signal for userId:',
          senderUserId,
          err,
        );
      }
    },
    [socket, setupPeerConnection],
  );

  const endCall = useCallback(() => {
    // console.log('[endCall] Ending call for roomId:', roomId);
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
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
    hasSetupMedia.current = false;

    setLocalStream(null);
    localStreamRef.current = null;
    setRemoteStreams({});
    setParticipanteds([]);

    socket?.emit('endCall', {conversationId: roomId});
    navigation.goBack();
  }, [socket]);

  const handleRejoin = useCallback(async () => {
    if (!socket || !socket.connected) {
      // console.log('[handleRejoin] Socket not connected');
      return;
    }

    const userId = caller.user_id;
    if (!userId) {
      // console.log('[handleRejoin] No userId');
      return;
    }

    // console.log('[handleRejoin] Sending rejoin_call for userId:', userId);
    socket.emit('rejoin_call', {roomId, userId});

    const success = await setupMedia();
    if (!success) {
      // console.log('[handleRejoin] Failed to setup media, ending call');
      endCall();
      return;
    }
  }, [socket]);

  // Gọi setupMedia ngay khi socket sẵn sàng
  useEffect(() => {
    if (socket && socket.connected) {
      setupMedia();
    }
  }, [socket]);

  useEffect(() => {
    if (!socket) return;

    isMounted.current = true;

    const handleReceiveSignal = ({
      signal,
      senderId: targetSocketId,
      type,
      userId,
      senderUserId,
    }) => {
      if (isMounted.current) {
        handleSignal({signal, targetSocketId, type, userId, senderUserId});
      }
    };

    const handleRequestOffer = ({targetSocketId, userId}) => {
      if (isMounted.current && localStreamRef.current) {
        // console.log('[request_offer] Received for userId:', userId);
        const peer = setupPeerConnection(
          userId,
          targetSocketId,
          localStreamRef.current,
        );
        createOffer(peer, userId, targetSocketId);
      }
    };

    const handleCallUpdate = ({type, participant, allParticipants}) => {
      if (isMounted.current) {
        // console.log('[call_update] Type:', type, 'Participant:', participant);
        setParticipanteds(prev => {
          if (JSON.stringify(prev) === JSON.stringify(allParticipants)) {
            // console.log('[call_update] Skipping duplicate participants');
            return prev;
          }
          return allParticipants;
        });

        if (
          (type === 'participant_joined' || type === 'participant_rejoined') &&
          localStreamRef.current &&
          participant.user_id !== caller.user_id
        ) {
          const userId = participant.user_id;
          const targetSocketId = participant.socketId;
          if (!targetSocketId) {
            console.warn('[call_update] No socketId for userId:', userId);
            return;
          }

          if (peerConnections.current[userId]) {
            // console.log('[call_update] Peer already exists for userId:', userId);
            return;
          }

          // console.log('[call_update] Participant joined/rejoined:', userId, targetSocketId);
          const peer = setupPeerConnection(
            userId,
            targetSocketId,
            localStreamRef.current,
          );
          if (isCaller) {
            createOffer(peer, userId, targetSocketId);
          }
        }
      }
    };

    const handleUserLeft = ({userId}) => {
      if (isMounted.current) {
        // console.log('[userLeftCall] User left:', userId);
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
      }
    };

    const handleCallEnded = () => {
      if (isMounted.current) {
        // console.log('[call_ended] Received from server');
        endCall();
      }
    };

    const handleCallCancelled = () => {
      if (isMounted.current) {
        // console.log('[call_cancelled] Received from server');
        endCall();
      }
    };

    const handleForceEndCall = () => {
      if (isMounted.current) {
        // console.log('[force_end_call] Received from server');
        endCall();
      }
    };

    const handleConnect = () => {
      if (isMounted.current) {
        // console.log('[connect] Socket reconnected');
        handleRejoin();
      }
    };

    socket.on('receiveSignal', handleReceiveSignal);
    socket.on('request_offer', handleRequestOffer);
    socket.on('call_update', handleCallUpdate);
    socket.on('userLeftCall', handleUserLeft);
    socket.on('call_ended', handleCallEnded);
    socket.on('call_cancelled', handleCallCancelled);
    socket.on('force_end_call', handleForceEndCall);
    socket.on('connect', handleConnect);

    return () => {
      isMounted.current = false;
      socket.off('receiveSignal', handleReceiveSignal);
      socket.off('request_offer', handleRequestOffer);
      socket.off('call_update', handleCallUpdate);
      socket.off('userLeftCall', handleUserLeft);
      socket.off('call_ended', handleCallEnded);
      socket.off('call_cancelled', handleCallCancelled);
      socket.off('force_end_call', handleForceEndCall);
      socket.off('connect', handleConnect);
    };
  }, [socket]);

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
