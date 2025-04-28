import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { useSocket } from '../../../util/socket.io';
import { navigationRef } from '../../../navigation/navigation';
import { RootStackParamList } from '../../../type/rootStackScreen';
import { useSelector } from 'react-redux';
import ActionButton from './ActionButton';
import userActionButton from './useVideocall/useActionButton';
import VideoCallPreview from './VideoCallPreview';
import {
  RTCPeerConnection,
  RTCSessionDescription,
  RTCIceCandidate,
  mediaDevices,
  MediaStream,
} from 'react-native-webrtc';
import { CallNotifiButton } from '../../../Constants/type_constants/type_notifi';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
const IncomingVideoCallScreen: React.FC = () => {
  const route = useRoute<RouteProp<RootStackParamList, 'CommingVideoCall'>>();
  const {
    caller,
    roomId,
    participants: initialParticipants,
    isCaller,
    isOnpenCamera,
    status,
  } = route.params || {};
  const navigation = useNavigation();
  const socket = useSocket();
  const user = useSelector((state: any) => state.auth.value);
  const color = useSelector((value: any) => value.colorApp.value);
  const insert = useSafeAreaInsets();

  const [statusCamera, setStatusCamera] = useState<boolean>(
    isOnpenCamera ?? true,
  );
  const [isMicOn, setIsMicOn] = useState<boolean>(true);
  const [isSpeakerOn, setIsSpeakerOn] = useState<boolean>(false);
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(
    new Map(),
  );
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [callStatus, setCallStatus] = useState<
    CallNotifiButton.ACCEPT | CallNotifiButton.REJECT | CallNotifiButton.COMMING
  >(
    status === CallNotifiButton.ACCEPT
      ? CallNotifiButton.ACCEPT
      : status === CallNotifiButton.REJECT
        ? CallNotifiButton.REJECT
        : CallNotifiButton.COMMING,
  );
  const [participants, setParticipants] = useState(initialParticipants || []);

  const localVideoRef = useRef<any>(null);
  const remoteVideoRef = useRef<any>(null);
  const peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map());
  const isCallActive = useRef(false);
  const isProcessingSignal = useRef<Record<string, boolean>>({});
  const hasAcceptedCall = useRef(false);
  const pendingSignals = useRef<any[]>([]);
  const processedSignals = useRef<Set<string>>(new Set());
  const pendingParticipants = useRef<string[]>([]);

  const endCall = useCallback(() => {
    // console.log('🛑 [EndCall] Attempting to end call');
    if (!isCallActive.current) {
      navigation.goBack();
      // console.log('🛑 [EndCall] Call is not active, skipping');
      return;
    }

    socket?.emit('endCall', { conversationId: roomId });
    // console.log('🛑 [EndCall] Emitted endCall to server:', { roomId });

    if (localStream) {
      localStream.getTracks().forEach(track => {
        // console.log(`🛑 [EndCall] Stopping track: ${track.kind}`);
        track.stop();
      });
    }

    peerConnections.current.forEach((peer, socketId) => {
      // console.log(`🛑 [EndCall] Closing peer connection for ${socketId}`);
      peer.close();
    });

    setLocalStream(null);
    peerConnections.current.clear();
    isCallActive.current = false;
    processedSignals.current.clear();
    pendingParticipants.current = [];
    navigation.goBack();
    // console.log('🛑 [EndCall] Call ended successfully');
  }, [socket, localStream, roomId, navigation]);

  const handleDecline = useCallback(() => {
    // console.log(`❌ [Decline] Rejecting call from ${caller?.name}`);
    setCallStatus(CallNotifiButton.REJECT);

    if (!socket || !caller || !user?._id) {
      // console.error('❌ [Decline] Missing required info:', { socket, caller, userId: user?._id });
      endCall();
      return;
    }

    socket.emit('call_declined', {
      roomId,
      caller,
      userReceiver: { user_id: user._id, socketId: socket.id },
    });
    // console.log('❌ [Decline] Emitted call_declined to server:', { roomId, caller });

    endCall();
  }, [socket, caller, user?._id, roomId, endCall]);

  const handleAccept = useCallback(() => {
    if (hasAcceptedCall.current) {
      // console.log('✅ [Accept] Call already accepted, skipping');
      return;
    }
    hasAcceptedCall.current = true;

    // console.log(`✅ [Accept] Accepting call from ${caller?.name}`);
    setCallStatus(CallNotifiButton.ACCEPT);

    if (
      !participants ||
      participants.length === 0 ||
      !socket ||
      !caller?.socketId
    ) {
      // console.error('✅ [Accept] Invalid call info:', { participants, socket, callerSocketId: caller?.socketId });
      return;
    }

    const userReceiver = participants.find((p: any) => p.user_id === user._id);
    if (!userReceiver) {
      // console.error('✅ [Accept] User receiver not found in participants');
      return;
    }

    socket.emit('call_accepted', {
      roomId,
      caller: { ...caller, socketId: caller.socketId },
      userReceiver: {
        ...userReceiver,
        socketId: socket.id,
        user_id: user._id,
        name: user.name,
        avatar: user.avatar,
      },
    });
  }, [socket, caller, participants, user, roomId]);

  const setupPeerConnection = useCallback(
    (targetSocketId: string, stream: MediaStream) => {
      if (peerConnections.current.has(targetSocketId)) {
        const peer = peerConnections.current.get(targetSocketId)!;
        if (
          peer.connectionState === 'connected' ||
          peer.connectionState === 'connecting'
        ) {
          // console.log(`🔗 [Peer] Connection to ${targetSocketId} already exists: ${peer.connectionState}`);
          return peer;
        }
        // console.log(`🔗 [Peer] Closing old connection to ${targetSocketId}`);
        peer.close();
        peerConnections.current.delete(targetSocketId);
      }

      // console.log(`🔗 [Peer] Setting up connection to ${targetSocketId}`);
      const peer = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          {
            urls: 'turn:openrelay.metered.ca:80',
            username: 'openrelayproject',
            credential: 'openrelayproject',
          },
        ],
        iceTransportPolicy: 'all',
      });

      stream.getTracks().forEach(track => {
        try {
          peer.addTrack(track, stream);
          // console.log(`🔗 [Peer] Added ${track.kind} track to ${targetSocketId}`);
        } catch (err) {
          // console.error(`🔗 [Peer] Failed to add ${track.kind} track to ${targetSocketId}:`, err);
        }
      });

      (peer as any).onicecandidate = ({ candidate }) => {
        if (candidate) {
          // console.log(`📡 [ICE] Sending candidate to ${targetSocketId}:`, candidate);
          socket?.emit('sendSignal', {
            signal: { candidate },
            targetSocketId,
            roomId,
            type: 'iceCandidate',
          });
        } else {
          // console.log(`📡 [ICE] ICE gathering complete for ${targetSocketId}`);
        }
      };

      (peer as any).ontrack = event => {
        const remoteStream = event.streams[0];
        // console.log(`📺 [Peer] Received remote stream from ${targetSocketId}:`, remoteStream.id);
        remoteStream.getVideoTracks().forEach(track => {
          // console.log(`📺 [Peer] Remote video track enabled for ${targetSocketId}:`, track.enabled);
        });
        remoteStream.getAudioTracks().forEach(track => {
          // console.log(`📺 [Peer] Remote audio track enabled for ${targetSocketId}:`, track.enabled);
        });
        setRemoteStreams(prev =>
          new Map(prev).set(targetSocketId, remoteStream),
        );
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
        }
      };

      (peer as any).oniceconnectionstatechange = () => {
        const state = peer.iceConnectionState;
        // console.log(`📡 [ICE] State changed for ${targetSocketId}: ${state}`);
        if (state === 'connected') {
          // console.log(`📡 [ICE] WebRTC connection established with ${targetSocketId}`);
        }
        if (['disconnected', 'failed', 'closed'].includes(state)) {
          // console.log(`📡 [ICE] Peer ${targetSocketId} disconnected, state: ${state}`);
          peerConnections.current.delete(targetSocketId);
          setRemoteStreams(prev => {
            const newMap = new Map(prev);
            newMap.delete(targetSocketId);
            return newMap;
          });
        }
      };

      (peer as any).onnegotiationneeded = async () => {
        // console.log(`📤 [Negotiation] Negotiation needed for ${targetSocketId}`);
        if (isCaller || peer.signalingState === 'stable') {
          createOffer(peer, targetSocketId);
        }
      };

      peerConnections.current.set(targetSocketId, peer);
      return peer;
    },
    [socket, roomId, isCaller],
  );

  const createOffer = async (
    peer: RTCPeerConnection,
    targetSocketId: string,
  ) => {
    try {
      // console.log(`📤 [Offer] Creating offer for ${targetSocketId}`);
      const offer = await peer.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      });
      await peer.setLocalDescription(offer);
      // console.log(`📤 [Offer] Offer created for ${targetSocketId}`);
      socket?.emit('sendSignal', {
        signal: { ...offer, type: 'offer' },
        targetSocketId,
        roomId,
        type: 'offer',
      });
    } catch (err) {
      // console.error(`📤 [Offer] Error creating offer for ${targetSocketId}:`, err);
    }
  };

  const handleSignal = useCallback(
    async ({ signal, senderId, type }: any) => {
      const signalKey = `${senderId}-${type}-${JSON.stringify(signal)}`;
      if (processedSignals.current.has(signalKey)) {
        // console.log(`📨 [Signal] Skipping duplicate signal ${type} from ${senderId}`);
        return;
      }
      processedSignals.current.add(signalKey);

      if (isProcessingSignal.current[senderId]) {
        // console.log(`📨 [Signal] Skipping duplicate ${type} from ${senderId}`);
        return;
      }

      isProcessingSignal.current[senderId] = true;
      // console.log(`📨 [Signal] Processing ${type} from ${senderId}`);

      try {
        if (!localStream) {
          // console.log('📨 [Signal] Local stream not ready, queuing signal');
          pendingSignals.current.push({ signal, senderId, type });
          return;
        }

        let peer = peerConnections.current.get(senderId);
        if (!peer) {
          // console.log(`📨 [Signal] Creating new peer for ${senderId}`);
          peer = setupPeerConnection(senderId, localStream);
        }

        if (peer.signalingState === 'closed') {
          // console.log(`📨 [Signal] Peer connection closed, skipping ${type} for ${senderId}`);
          return;
        }

        switch (type) {
          case 'offer':
            // console.log(`📨 [Signal] Setting remote offer from ${senderId}`);
            await peer.setRemoteDescription(new RTCSessionDescription(signal));
            const answer = await peer.createAnswer();
            await peer.setLocalDescription(answer);
            // console.log(`📨 [Signal] Sending answer to ${senderId}`);
            socket?.emit('sendSignal', {
              signal: answer,
              targetSocketId: senderId,
              roomId,
              type: 'answer',
            });
            break;
          case 'answer':
            // console.log(`📨 [Signal] Setting remote answer from ${senderId}`);
            await peer.setRemoteDescription(new RTCSessionDescription(signal));
            break;
          case 'iceCandidate':
            if (signal.candidate) {
              // console.log(`📨 [Signal] Adding ICE candidate from ${senderId}`);
              await peer.addIceCandidate(new RTCIceCandidate(signal.candidate));
            }
            break;
          default:
          // console.error(`📨 [Signal] Unknown signal type: ${type}`);
        }
      } catch (err) {
        // console.error(`📨 [Signal] Signal handling failed:`, err);
      } finally {
        isProcessingSignal.current[senderId] = false;
      }
    },
    [localStream, setupPeerConnection, socket, roomId],
  );

  const handleCallUpdate = (data: {
    type: string;
    participant: any;
    allParticipants: any[];
  }) => {
    // console.log('📞 [Socket] Processing call update:', data.type);
    setParticipants(data.allParticipants);

    if (data.type === 'participant_joined') {
      const participantSocketId = Array.isArray(data.participant.socketId)
        ? data.participant.socketId[0]
        : data.participant.socketId;
      if (participantSocketId && participantSocketId !== socket?.id) {
        // console.log(`👤 [Socket] New participant joined: ${participantSocketId}`);
        if (localStream) {
          const peer = setupPeerConnection(participantSocketId, localStream);
          if (isCaller) createOffer(peer, participantSocketId);
        } else {
          pendingParticipants.current.push(participantSocketId);
        }
      }
    }
  };

  useEffect(() => {
    if (status === 'accept_call') {
      // console.log('🔄 [Initial] Auto-accepting call due to status');
      handleAccept();
    } else if (status === 'reject_call') {
      // console.log('🔄 [Initial] Auto-rejecting call due to status');
      handleDecline();
    }
  }, [status, handleAccept, handleDecline]);

  useEffect(() => {
    if (callStatus !== 'accept_call' || isCallActive.current) return;

    const setupWebRTC = async () => {
      try {
        // console.log('🎥 [WebRTC] Initializing media stream');
        const stream = await mediaDevices.getUserMedia({
          audio: true,
          video: { width: 640, height: 480, frameRate: 30 },
        });

        stream.getVideoTracks().forEach(track => {
          track.enabled = statusCamera;
          // console.log(`🎥 [WebRTC] Video track: ${track.enabled ? 'ENABLED' : 'DISABLED'}`);
        });
        stream.getAudioTracks().forEach(track => {
          track.enabled = isMicOn;
          // console.log(`🎥 [WebRTC] Audio track: ${track.enabled ? 'ENABLED' : 'DISABLED'}`);
        });

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        setLocalStream(stream);
        // console.log('🎥 [WebRTC] Local stream set:', stream.id);

        participants.forEach((participant: any) => {
          const participantSocketId = Array.isArray(participant.socketId)
            ? participant.socketId[0]
            : participant.socketId;
          if (participantSocketId && participantSocketId !== socket?.id) {
            // console.log(`🎥 [WebRTC] Setting up peer for ${participantSocketId}`);
            const peer = setupPeerConnection(participantSocketId, stream);
            if (isCaller) createOffer(peer, participantSocketId);
          }
        });

        if (pendingParticipants.current.length > 0) {
          pendingParticipants.current.forEach(socketId => {
            // console.log(`🎥 [WebRTC] Setting up peer for pending participant ${socketId}`);
            const peer = setupPeerConnection(socketId, stream);
            if (isCaller) createOffer(peer, socketId);
          });
          pendingParticipants.current = [];
        }

        if (pendingSignals.current.length > 0) {
          // console.log('🎥 [WebRTC] Processing pending signals:', pendingSignals.current);
          pendingSignals.current.forEach(signal => handleSignal(signal));
          pendingSignals.current = [];
        }

        isCallActive.current = true;
        // console.log('🎥 [WebRTC] Call is now active');
      } catch (err) {
        // console.error('🎥 [WebRTC] Setup error:', err);
        endCall();
      }
    };

    setupWebRTC();
  }, [
    callStatus,
    socket,
    participants,
    setupPeerConnection,
    handleSignal,
    endCall,
    statusCamera,
    isMicOn,
    isCaller,
  ]);

  useEffect(() => {
    if (!socket) return;

    socket.on('receiveSignal', handleSignal);
    socket.on('call_update', handleCallUpdate);
    socket.on('new_participant', ({ participant }: any) => {
      const participantSocketId = Array.isArray(participant.socketId)
        ? participant.socketId[0]
        : participant.socketId;
      // console.log(`👤 [Socket] New participant joined: ${participantSocketId}`);
      if (participantSocketId !== socket?.id) {
        if (localStream) {
          const peer = setupPeerConnection(participantSocketId, localStream);
          if (isCaller) createOffer(peer, participantSocketId);
        } else {
          pendingParticipants.current.push(participantSocketId);
        }
      }
    });
    socket.on('call_ended', () => {
      // console.log('📞 [Socket] Call ended by server');
      endCall();
    });
    socket.on('call_cancelled', () => {
      // console.log('📞 [Socket] Call cancelled by caller');
      endCall();
    });
    socket.on('force_end_call', ({ reason }: any) => {
      // console.log(`📞 [Socket] Force end call: ${reason}`);
      endCall();
    });
    socket.on('clear_call_notification', ({ roomId }: any) => {
      // console.log(`📞 [Socket] Clear call notification for room ${roomId}`);
      endCall();
    });

    return () => {
      socket.off('receiveSignal', handleSignal);
      socket.off('call_update', handleCallUpdate);
      socket.off('new_participant');
      socket.off('call_ended');
      socket.off('call_cancelled');
      socket.off('force_end_call');
      socket.off('clear_call_notification');
      // console.log('📞 [Socket] Cleaned up all socket listeners');
    };
  }, [
    socket,
    localStream,
    setupPeerConnection,
    handleSignal,
    endCall,
    isCaller,
  ]);

  useEffect(() => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = statusCamera;
        // console.log(`🎚️ [Control] Video track updated: ${track.enabled ? 'ENABLED' : 'DISABLED'}`);
      });
      localStream.getAudioTracks().forEach(track => {
        track.enabled = isMicOn;
        // console.log(`🎚️ [Control] Audio track updated: ${track.enabled ? 'ENABLED' : 'DISABLED'}`);
      });
    }
  }, [statusCamera, isMicOn, localStream]);

  return (
    <View style={{ flex: 1, }}>
      <StatusBar
        translucent={true}
        // hidden={false}
        barStyle={color.dark ? 'light-content' : 'dark-content'}
        backgroundColor={'transparent'}
      />
      <View style={[styles.previewContainer, { paddingTop: insert.top, backgroundColor: color.dark }]}>
        <VideoCallPreview
          participants={participants || []}
          isCameraOn={statusCamera}
          localVideoRef={localVideoRef}
          remoteStreams={remoteStreams}
          localStream={localStream}
        />
      </View>

      {callStatus === CallNotifiButton.ACCEPT && (
        <>
          <ActionButton
            localStream={localStream as any}
            statusCamera={statusCamera}
            setStatusCamera={setStatusCamera}
            isMicOn={isMicOn}
            setIsMicOn={setIsMicOn}
            isSpeakerOn={isSpeakerOn}
            setIsSpeakerOn={setIsSpeakerOn}
            endCall={endCall}
            SetLocalStream={setLocalStream as any} // Cast to MediaStream | null
          />
          <View style={styles.buttonContainer}>
            <TouchableOpacity onPress={endCall}>
              <Text>Kết thúc</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {callStatus === CallNotifiButton.COMMING && (
        <View style={styles.buttonContainer}>

          <TouchableOpacity
            style={[styles.bnt, { backgroundColor: 'green' }]}
            onPress={handleAccept}>
            <Text>Accept</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.bnt, { backgroundColor: 'red' }]}
            onPress={handleDecline}>
            <Text>Decline</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  bnt: {
    width: 80,
    height: 80,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  background: {
    ...StyleSheet.absoluteFillObject,
  },
  previewContainer: {
    flex: 1,
  },

  avatar: { width: 150, height: 150, borderRadius: 75, marginBottom: 20 },
  name: { fontSize: 24, fontWeight: 'bold', color: 'white', marginBottom: 10 },
  message: { fontSize: 16, color: 'white', marginBottom: 40 },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 40,
    position: 'absolute',
    bottom: 30
  },
  button: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  declineButton: { backgroundColor: 'red' },
  acceptButton: { backgroundColor: 'green' },
  buttonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
});

export default IncomingVideoCallScreen;
