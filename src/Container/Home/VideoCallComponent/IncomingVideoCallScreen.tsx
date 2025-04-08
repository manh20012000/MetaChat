import React, {useCallback, useEffect, useRef, useState} from 'react';
import {View, Text, Image, TouchableOpacity, StyleSheet} from 'react-native';
import {useRoute, useNavigation, RouteProp} from '@react-navigation/native';
import {useSocket} from '../../../util/socket.io';
import {navigationRef} from '../../../navigation/navigation';
import {RootStackParamList} from '../../../type/rootStackScreen';
import {useSelector} from 'react-redux';
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

const IncomingVideoCallScreen: React.FC = () => {
  const route = useRoute<RouteProp<RootStackParamList, 'CommingVideoCall'>>();
  const { caller, roomId, participants, isCaller, isOnpenCamera, status } = route.params || {};
  const navigation = useNavigation();
  const socket = useSocket();
  const user = useSelector((state: any) => state.auth.value);

  const [statusCamera, setStatusCamera] = useState<boolean>(isOnpenCamera ?? true);
  const [isMicOn, setIsMicOn] = useState<boolean>(true);
  const [isSpeakerOn, setIsSpeakerOn] = useState<boolean>(false);
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map());
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [callStatus, setCallStatus] = useState<'accept_call' | 'reject_call' | ''>(
    status === 'accept_call' ? 'accept_call' : status === 'reject_call' ? 'reject_call' : ''
  );
  const [permissionsGranted, setPermissionsGranted] = useState(false);

  const localVideoRef = useRef<any>(null);
  const remoteVideoRef = useRef<any>(null);
  const peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map());
  const isCallActive = useRef(false);
  const isProcessingSignal = useRef<Record<string, boolean>>({});
  const hasAcceptedCall = useRef(false);
  const isCreatingOffer = useRef<Record<string, boolean>>({});
  const pendingSignals = useRef<any[]>([]);

  const endCall = useCallback(() => {
    console.log('🛑 [EndCall] Attempting to end call');
    if (!isCallActive.current) {
      navigation.goBack();
      console.log('🛑 [EndCall] Call is not active, skipping');
      return;
    }

    socket?.emit('endCall', { conversationId: roomId });
    console.log('🛑 [EndCall] Emitted endCall to server:', { roomId });

    if (localStream) {
      localStream.getTracks().forEach(track => {
        console.log(`🛑 [EndCall] Stopping track: ${track.kind}`);
        track.stop();
      });
    }

    peerConnections.current.forEach((peer, socketId) => {
      console.log(`🛑 [EndCall] Closing peer connection for ${socketId}`);
      peer.close();
    });

    setLocalStream(null);
    peerConnections.current.clear();
    isCallActive.current = false;
    isCreatingOffer.current = {};
    navigation.goBack();
    console.log('🛑 [EndCall] Call ended successfully');
  }, [socket, localStream, roomId, navigation]);

  const handleDecline = useCallback(() => {
    console.log(`❌ [Decline] Rejecting call from ${caller?.name}`);
    setCallStatus('reject_call');

    if (!socket || !caller || !user?._id) {
      console.error('❌ [Decline] Missing required info:', { socket, caller, userId: user?._id });
      endCall();
      return;
    }

    socket.emit('call_declined', {
      roomId,
      caller,
      userReceiver: { user_id: user._id, socketId: socket.id },
    });
    console.log('❌ [Decline] Emitted call_declined to server:', { roomId, caller });

    endCall();
  }, [socket, caller, user?._id, roomId, endCall]);

  const handleAccept = useCallback(() => {
    if (hasAcceptedCall.current) {
      console.log('✅ [Accept] Call already accepted, skipping');
      return;
    }
    hasAcceptedCall.current = true;

    console.log(`✅ [Accept] Accepting call from ${caller?.name}`);
    setCallStatus('accept_call');

    if (!participants || participants.length === 0 || !socket || !caller?.socketId) {
      console.error('✅ [Accept] Invalid call info:', { participants, socket, callerSocketId: caller?.socketId });
      return;
    }

    const userReceiver = participants.find((p: any) => p.user_id === user._id);
    if (!userReceiver) {
      console.error('✅ [Accept] User receiver not found in participants');
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


  useEffect(() => {
    if (status === 'accept_call') {
      console.log('🔄 [Initial] Auto-accepting call due to status');
      handleAccept();
    } else if (status === 'reject_call') {
      console.log('🔄 [Initial] Auto-rejecting call due to status');
      handleDecline();
    }
  }, [status]);

  const setupPeerConnection = useCallback(
    (targetSocketId: string, stream: MediaStream) => {
      if (peerConnections.current.has(targetSocketId)) {
        const peer = peerConnections.current.get(targetSocketId)!;
        if (peer.connectionState === 'connected' || peer.connectionState === 'connecting') {
          console.log(`🔗 [Peer] Connection to ${targetSocketId} already exists: ${peer.connectionState}`);
          return peer;
        }
        console.log(`🔗 [Peer] Closing old connection to ${targetSocketId}`);
        peer.close();
        peerConnections.current.delete(targetSocketId);
      }

      console.log(`🔗 [Peer] Setting up connection to ${targetSocketId}`);
      const peer = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'turn:your-turn-server.com:3478', username: 'user', credential: 'pass' },
        ],
        iceTransportPolicy: 'all',
      });

      stream.getTracks().forEach(track => {
        peer.addTrack(track, stream);
        console.log(`🔗 [Peer] Added ${track.kind} track to ${targetSocketId}`);
      });

      (peer as any).onicecandidate = ({ candidate }) => {
        if (candidate) {
          console.log(`📡 [ICE] Sending candidate to ${targetSocketId}:`, candidate);
          socket?.emit('sendSignal', {
            signal: { candidate },
            targetSocketId,
            roomId,
            type: 'iceCandidate',
          });
        } else {
          console.log(`📡 [ICE] ICE gathering complete for ${targetSocketId}`);
        }
      };

      (peer as any).ontrack = (event) => {
        const remoteStream = event.streams[0];
        console.log(`📺 [Peer] Received remote stream from ${targetSocketId}:`, remoteStream.id);
        setRemoteStreams(prev => new Map(prev).set(targetSocketId, remoteStream));
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
        }
      };

      (peer as any).oniceconnectionstatechange = () => {
        console.log(`📡 [ICE] State changed for ${targetSocketId}: ${peer.iceConnectionState}`);
        if (peer.iceConnectionState === 'disconnected' || peer.iceConnectionState === 'failed' || peer.iceConnectionState === 'closed') {
          console.log(`📡 [ICE] Peer ${targetSocketId} disconnected`);
          peerConnections.current.delete(targetSocketId);
          setRemoteStreams(prev => {
            const newMap = new Map(prev);
            newMap.delete(targetSocketId);
            return newMap;
          });
          delete isCreatingOffer.current[targetSocketId];
        }
      };

      peerConnections.current.set(targetSocketId, peer);
      return peer;
    },
    [socket, roomId]
  );

  const createOffer = async (peer: RTCPeerConnection, targetSocketId: string) => {
    if (isCreatingOffer.current[targetSocketId]) {
      console.log(`Already creating offer for ${targetSocketId}, skipping`);
      return;
    }

    isCreatingOffer.current[targetSocketId] = true;
    try {
      console.log(`📤 [Offer] Creating offer for ${targetSocketId}`);
      const offer = await peer.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      });
      await peer.setLocalDescription(offer);
      console.log(`📤 [Offer] Offer created for ${targetSocketId}`);
      socket?.emit('sendSignal', {
        signal: { ...offer, type: 'offer' },
        targetSocketId,
        roomId,
        type: 'offer',
      });
    } catch (err) {
      console.error(`📤 [Offer] Error creating offer for ${targetSocketId}:`, err);
    } finally {
      isCreatingOffer.current[targetSocketId] = false;
    }
  };

  const handleSignal = useCallback(
    async ({ signal, senderId, type }: any) => {
      if (isProcessingSignal.current[senderId]) {
        console.log(`📨 [Signal] Skipping duplicate ${type} from ${senderId}`);
        return;
      }

      isProcessingSignal.current[senderId] = true;
      console.log(`📨 [Signal] Processing ${type} from ${senderId}`);

      try {
        if (!localStream) {
          console.log('📨 [Signal] Local stream not ready, queuing signal');
          pendingSignals.current.push({ signal, senderId, type });
          return;
        }

        let peer = peerConnections.current.get(senderId);
        if (!peer) {
          console.log(`📨 [Signal] Creating new peer for ${senderId}`);
          peer = setupPeerConnection(senderId, localStream);
        }

        switch (type) {
          case 'offer':
            console.log(`📨 [Signal] Setting remote offer from ${senderId}`);
            await peer.setRemoteDescription(new RTCSessionDescription(signal));
            const answer = await peer.createAnswer();
            await peer.setLocalDescription(answer);
            console.log(`📨 [Signal] Sending answer to ${senderId}`);
            socket?.emit('sendSignal', {
              signal: answer,
              targetSocketId: senderId,
              roomId,
              type: 'answer',
            });
            break;
          case 'answer':
            console.log(`📨 [Signal] Setting remote answer from ${senderId}`);
            await peer.setRemoteDescription(new RTCSessionDescription(signal));
            break;
          case 'iceCandidate':
            if (signal.candidate) {
              console.log(`📨 [Signal] Adding ICE candidate from ${senderId}`);
              await peer.addIceCandidate(new RTCIceCandidate(signal.candidate));
            }
            break;
          default:
            console.error(`📨 [Signal] Unknown signal type: ${type}`);
        }
      } catch (err) {
        console.error(`📨 [Signal] Error handling ${type} from ${senderId}:`, err);
      } finally {
        isProcessingSignal.current[senderId] = false;
      }
    },
    [localStream, setupPeerConnection, socket, roomId]
  );

  useEffect(() => {
    if (callStatus !== 'accept_call' || isCallActive.current) return;

    const setupWebRTC = async () => {
      // if (!permissionsGranted) {
      //   console.log('Permissions not granted, cannot setup WebRTC');
      //   return;
      // }

      try {
        console.log('🎥 [WebRTC] Initializing media stream');
        const stream = await mediaDevices.getUserMedia({
          audio: true,
          video: { width: 640, height: 480, frameRate: 30 },
        });

        stream.getVideoTracks().forEach(track => {
          track.enabled = statusCamera;
          console.log(`🎥 [WebRTC] Video track: ${track.enabled ? 'ENABLED' : 'DISABLED'}`);
        });
        stream.getAudioTracks().forEach(track => {
          track.enabled = isMicOn;
          console.log(`🎥 [WebRTC] Audio track: ${track.enabled ? 'ENABLED' : 'DISABLED'}`);
        });

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        setLocalStream(stream);
        console.log('🎥 [WebRTC] Local stream set:', stream.id);

        participants.forEach((participant: any) => {
          if (participant.socketId && participant.socketId !== socket?.id) {
            console.log(`🎥 [WebRTC] Setting up peer for ${participant.socketId}`);
            const peer = setupPeerConnection(participant.socketId, stream);
            if (isCaller) createOffer(peer, participant.socketId);
          }
        });

        socket?.on('receiveSignal', handleSignal);
        isCallActive.current = true;
        console.log('🎥 [WebRTC] Call is now active');

        // Xử lý các tín hiệu bị pending
        if (pendingSignals.current.length > 0) {
          console.log('🎥 [WebRTC] Processing pending signals:', pendingSignals.current);
          pendingSignals.current.forEach(signal => handleSignal(signal));
          pendingSignals.current = [];
        }
      } catch (err) {
        console.error('🎥 [WebRTC] Setup error:', err);
        endCall();
      }
    };

    setupWebRTC();

    return () => {
      socket?.off('receiveSignal', handleSignal);
      console.log('🎥 [WebRTC] Cleaned up receiveSignal listener');
    };
  }, [callStatus, socket, participants, setupPeerConnection, handleSignal, endCall, statusCamera, isMicOn, isCaller, permissionsGranted]);

  useEffect(() => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = statusCamera;
        console.log(`🎚️ [Control] Video track updated: ${track.enabled ? 'ENABLED' : 'DISABLED'}`);
        if (track.enabled) {
          peerConnections.current.forEach((peer, socketId) => {
            if (peer.iceConnectionState === 'connected' || (peer as any).iceConnectionState === 'connecting') {
              createOffer(peer, socketId);
            }
          });
        }
      });
      localStream.getAudioTracks().forEach(track => {
        track.enabled = isMicOn;
        console.log(`🎚️ [Control] Audio track updated: ${track.enabled ? 'ENABLED' : 'DISABLED'}`);
      });
    }
  }, [statusCamera, isMicOn, localStream]);

  useEffect(() => {
    socket?.on('new_participant', ({ participant }: any) => {
      console.log(`👤 [Socket] New participant joined: ${participant.socketId}`);
      if (participant.socketId !== socket?.id && localStream) {
        const peer = setupPeerConnection(participant.socketId, localStream);
        if (isCaller) createOffer(peer, participant.socketId);
      }
    });

    socket?.on('call_ended', () => {
      console.log('📞 [Socket] Call ended by server');
      endCall();
    });

    socket?.on('call_cancelled', () => {
      console.log('📞 [Socket] Call cancelled by caller');
      endCall();
    });

    socket?.on('force_end_call', ({ reason }: any) => {
      console.log(`📞 [Socket] Force end call: ${reason}`);
      endCall();
    });

    return () => {
      socket?.off('new_participant');
      socket?.off('call_ended');
      socket?.off('call_cancelled');
      socket?.off('force_end_call');
      console.log('📞 [Socket] Cleaned up all socket listeners');
    };
  }, [socket, localStream, setupPeerConnection, endCall, isCaller]);


  return (
    <View style={{flex: 1}}>
      <View style={styles.previewContainer}>
        <VideoCallPreview
          participants={participants || []}
          isCameraOn={statusCamera}
          localVideoRef={localVideoRef}
          remoteStreams={remoteStreams}
          localStream={localStream}
        />
      </View>

      {callStatus === 'accept_call' && (
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

      {callStatus === '' && (
        <View style={styles.buttonContainer}>
          <TouchableOpacity onPress={handleDecline}>
            <Text>Decline</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleAccept}>
            <Text>Accept</Text>
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
  background: {
    ...StyleSheet.absoluteFillObject,
  },
  previewContainer: {
    flex: 1,
    backgroundColor: 'pink',
  },

  avatar: {width: 150, height: 150, borderRadius: 75, marginBottom: 20},
  name: {fontSize: 24, fontWeight: 'bold', color: 'white', marginBottom: 10},
  message: {fontSize: 16, color: 'white', marginBottom: 40},
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 40,
  },
  button: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  declineButton: {backgroundColor: 'red'},
  acceptButton: {backgroundColor: 'green'},
  buttonText: {color: 'white', fontSize: 18, fontWeight: 'bold'},
});

export default IncomingVideoCallScreen;
