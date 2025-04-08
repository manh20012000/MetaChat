// VideoCallHome.tsx
import {
  View,
  Text,
  StatusBar,
  useWindowDimensions,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import Statusbar from '../../../Constants/StatusBar';
import {useSelector} from 'react-redux';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import VideoCallPreview from './VideoCallPreview';
import {RouteProp} from '@react-navigation/native';
import DraggableVideoView from './DraggableVideoView';
import ActionButton from './ActionButton';
import userActionButton from './useVideocall/useActionButton';
import {
  RTCPeerConnection,
  RTCSessionDescription,
  RTCIceCandidate,
  mediaDevices,
  MediaStream,
} from 'react-native-webrtc';
import {useSocket} from '../../../util/socket.io';

interface VideoCallHomeProps {
  navigation: any;
  route: any;
}

const VideoCallHome: React.FC<VideoCallHomeProps> = ({ navigation, route }) => {
  const { roomId, caller, isCaller, isOnpenCamera, participants: initialParticipants } = route.params;
  const socket = useSocket();

  // State management
  const [isMicOn, setIsMicOn] = useState(true);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [statusCamera, setStatusCamera] = useState(isOnpenCamera ?? true); // Mặc định bật camera
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map());
  const [participants, setParticipants] = useState(initialParticipants);
  const [activePeerIds, setActivePeerIds] = useState<Set<string>>(new Set());
  const [permissionsGranted, setPermissionsGranted] = useState(true)

  // Refs
  const localVideoRef = useRef<any>(null);
  const peerConnections = useRef<Record<string, RTCPeerConnection>>({});
  const iceCandidatesSent = useRef<Set<string>>(new Set());
  const isCreatingOffer = useRef<Record<string, boolean>>({});
  const pendingSignals = useRef<any[]>([]); // Lưu trữ tín hiệu nếu localStream chưa sẵn sàng

  // Kiểm tra và yêu cầu quyền
 
  const setupMedia = async () => {
    if (!permissionsGranted) {
      console.log('Permissions not granted, cannot setup media');
      return;
    }

    try {
      console.log('Initializing media stream...');
      const constraints = {
        audio: true,
        video: { width: 640, height: 480, frameRate: 30 },
      };
      const stream = await mediaDevices.getUserMedia(constraints);

      stream.getVideoTracks().forEach(track => {
        track.enabled = statusCamera;
        console.log(`Video track: ${track.enabled ? 'ENABLED' : 'DISABLED'}`);
      });

      stream.getAudioTracks().forEach(track => {
        track.enabled = isMicOn;
        console.log(`Audio track: ${track.enabled ? 'ENABLED' : 'DISABLED'}`);
      });

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      setLocalStream(stream);
    } catch (err) {
      console.error('Media initialization failed:', err);
      endCall();
    }
  };

  // Cleanup function
  const endCall = () => {
    console.log('Performing call cleanup...');

    localStream?.getTracks().forEach(track => track.stop());

    Object.values(peerConnections.current).forEach(peer => {
      try {
        peer.close();
      } catch (err) {
        console.error('Error closing peer:', err);
      }
    });
    peerConnections.current = {};
    iceCandidatesSent.current.clear();
    isCreatingOffer.current = {};

    socket?.emit('endCall', { conversationId: roomId });
    navigation.goBack();
  };

  // Peer Connection Management
  const setupPeerConnection = (targetSocketId: string, stream: MediaStream): RTCPeerConnection => {
    if (peerConnections.current[targetSocketId]) {
      console.log(`Connection to ${targetSocketId} already exists`);
      return peerConnections.current[targetSocketId];
    }

    console.log(`Creating new peer connection for ${targetSocketId}`);
    const peer = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'turn:your-turn-server.com:3478', username: 'user', credential: 'pass' },
      ],
      iceTransportPolicy: 'all',
    });

    stream.getTracks().forEach(track => {
      try {
        peer.addTrack(track, stream);
        console.log(`Added ${track.kind} track`);
      } catch (err) {
        console.error(`Failed to add ${track.kind} track:`, err);
      }
    });

    (peer as any).onicecandidate = ({ candidate }) => {
      if (candidate) {
        const candidateKey = `${candidate.sdpMid}-${candidate.sdpMLineIndex}-${candidate.candidate}`;
        if (!iceCandidatesSent.current.has(candidateKey)) {
          iceCandidatesSent.current.add(candidateKey);
          console.log(`Sending ICE candidate to ${targetSocketId}`);
          socket?.emit('sendSignal', {
            signal: { candidate },
            targetSocketId,
            roomId,
            type: 'iceCandidate',
          });
        }
      }
    };

    (peer as any).ontrack = (event) => {
      const remoteStream = event.streams[0];
      console.log('Received remote stream:', remoteStream.getTracks());
    
      // Xác minh track video có tồn tại không
      remoteStream.getVideoTracks().forEach(track => {
        console.log('Remote video track enabled:', track.enabled);
      });
    
      setRemoteStreams(prev => {
        const newMap = new Map(prev);
        newMap.set(targetSocketId, remoteStream);
        return newMap;
      });
    };

    (peer as any).oniceconnectionstatechange = () => {
      console.log(`ICE state for ${targetSocketId}:`, peer.iceConnectionState);
      if (['disconnected', 'failed', 'closed'].includes(peer.iceConnectionState)) {
        removePeerConnection(targetSocketId);
      }
    };

    peerConnections.current[targetSocketId] = peer;

    if (isCaller) {
      createOffer(peer, targetSocketId);
    }

    return peer;
  };

  const createOffer = async (peer: RTCPeerConnection, targetSocketId: string) => {
    if (isCreatingOffer.current[targetSocketId]) {
      console.log(`Already creating offer for ${targetSocketId}, skipping`);
      return;
    }

    isCreatingOffer.current[targetSocketId] = true;
    try {
      console.log(`Creating offer for ${targetSocketId}`);
      const offer = await peer.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      });

      await peer.setLocalDescription(offer);
      console.log('Offer created successfully');

      socket?.emit('sendSignal', {
        signal: { ...offer, type: 'offer' },
        targetSocketId,
        roomId,
        type: 'offer', // Đảm bảo type được gửi đúng
      });
    } catch (err) {
      console.error('Offer creation failed:', err);
      removePeerConnection(targetSocketId);
    } finally {
      isCreatingOffer.current[targetSocketId] = false;
    }
  };

  const removePeerConnection = (socketId: string) => {
    console.log(`Removing peer connection ${socketId}`);
    if (peerConnections.current[socketId]) {
      peerConnections.current[socketId].close();
      delete peerConnections.current[socketId];

      setRemoteStreams(prev => {
        const newMap = new Map(prev);
        newMap.delete(socketId);
        return newMap;
      });

      setActivePeerIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(socketId);
        return newSet;
      });

      delete isCreatingOffer.current[socketId];
    }
  };

  // Handle signaling
  const handleSignal = async ({ signal, senderId, type }: any) => {
    try {
      console.log(`Processing ${type} signal from ${senderId}`);

      if (!localStream) {
        console.log('Local stream not ready, queuing signal');
        pendingSignals.current.push({ signal, senderId, type });
        return;
      }

      let peer = peerConnections.current[senderId];
      if (!peer) {
        peer = setupPeerConnection(senderId, localStream);
      }

      switch (type) {
        case 'offer':
          console.log(`Setting remote offer from ${senderId}`);
          await peer.setRemoteDescription(new RTCSessionDescription(signal));
          const answer = await peer.createAnswer();
          await peer.setLocalDescription(answer);
          console.log(`Sending answer to ${senderId}`);
          socket?.emit('sendSignal', {
            signal: answer,
            targetSocketId: senderId,
            roomId,
            type: 'answer',
          });
          break;

        case 'answer':
          console.log(`Setting remote answer from ${senderId}`);
          await peer.setRemoteDescription(new RTCSessionDescription(signal));
          break;

        case 'iceCandidate':
          if (signal.candidate) {
            console.log(`Adding ICE candidate from ${senderId}`);
            await peer.addIceCandidate(new RTCIceCandidate(signal.candidate));
          }
          break;

        default:
          console.error(`Unknown signal type: ${type}`);
      }
    } catch (err) {
      console.error('Signal handling failed:', err);
    }
  };

  // Handle participant updates
  const handleCallUpdate = (data: {
    type: string;
    participant: any;
    allParticipants: any[];
  }) => {
    console.log('Processing call update:', data.type);

    setParticipants(data.allParticipants);

    if (data.type === 'participant_joined' && localStream) {
      if (data.participant.socketId && data.participant.socketId !== socket?.id) {
        const peer = setupPeerConnection(data.participant.socketId, localStream);
        if (isCaller) createOffer(peer, data.participant.socketId);
      }
    }
  };

  
  useEffect(() => {
    if (permissionsGranted) {
      setupMedia();
    }
    return () => endCall();
  }, [permissionsGranted]);

  useEffect(() => {
    if (!localStream) return;

    // Xử lý các tín hiệu bị pending
    if (pendingSignals.current.length > 0) {
      console.log('Processing pending signals:', pendingSignals.current);
      pendingSignals.current.forEach(signal => handleSignal(signal));
      pendingSignals.current = [];
    }

    const newActivePeers = new Set(activePeerIds);
    let hasChanges = false;

    participants.forEach(participant => {
      if (!participant.socketId || participant.socketId === socket?.id) return;

      if (!activePeerIds.has(participant.socketId)) {
        console.log(`Setting up new connection for ${participant.socketId}`);
        setupPeerConnection(participant.socketId, localStream);
        newActivePeers.add(participant.socketId);
        hasChanges = true;
      }
    });

    if (hasChanges) {
      setActivePeerIds(newActivePeers);
    }
  }, [participants, localStream]);

  useEffect(() => {
    if (!localStream) return;

    localStream.getVideoTracks().forEach(track => {
      track.enabled = statusCamera;
      console.log(`Video track updated: ${track.enabled ? 'ENABLED' : 'DISABLED'}`);
      if (track.enabled) {
        Object.entries(peerConnections.current).forEach(([socketId, peer]) => {
          if (peer.iceConnectionState === 'connected' || (peer as any).iceConnectionState === 'connecting') {
            createOffer(peer, socketId);
          }
        });
      }
    });
    localStream.getAudioTracks().forEach(track => {
      track.enabled = isMicOn;
      console.log(`Audio track updated: ${track.enabled ? 'ENABLED' : 'DISABLED'}`);
    });
  }, [statusCamera, isMicOn, localStream]);

  useEffect(() => {
    if (!socket) return;

    const handlers = {
      call_update: handleCallUpdate,
      userLeftCall: ({ userId }: any) => {
        const participant = participants.find(p => p.user_id === userId);
        if (participant?.socketId) {
          removePeerConnection(participant.socketId);
        }
      },
      call_ended: () => {
        console.log('Call ended by server');
        endCall();
      },
      receiveSignal: handleSignal,
    };

    Object.entries(handlers).forEach(([event, handler]) => {
      socket.on(event, handler);
    });

    return () => {
      Object.entries(handlers).forEach(([event, handler]) => {
        socket.off(event, handler);
      });
    };
  }, [localStream, participants]);

  return (
    <View style={styles.container}>
      <View style={styles.previewContainer}>
        <VideoCallPreview
          participants={participants}
          isCameraOn={statusCamera}
          localVideoRef={localVideoRef}
          remoteStreams={remoteStreams}
          localStream={localStream}
        />
      </View>
      <ActionButton
        localStream={localStream as any}
        statusCamera={statusCamera}
        setStatusCamera={setStatusCamera}
        isMicOn={isMicOn}
        setIsMicOn={setIsMicOn}
        isSpeakerOn={isSpeakerOn}
        setIsSpeakerOn={setIsSpeakerOn}
        endCall={endCall} // Truyền endCall trực tiếp từ IncomingVideoCallScreen
        SetLocalStream={setLocalStream as any} // Cast to MediaStream | null
      />
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    position: 'absolute',
    zIndex: 10,
    paddingHorizontal: 10,
    alignItems: 'flex-end',
  },
  closeButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewContainer: {
    flex: 1,
    backgroundColor: 'pink',
  },
  controlsContainer: {
    position: 'absolute',
    bottom: 30,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
  },
  controlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoPlaceholder: {flex: 1, backgroundColor: 'black'},
});

export default VideoCallHome;
{
  /* Header with close button */
}
{
  /* <View style={[styles.header, {width}]}>
        <TouchableOpacity style={styles.closeButton} onPress={endCall}>
          <MaterialIcons name="cancel" size={30} color={color.red} />
        </TouchableOpacity>
      </View> */
}

// // navigation={navigation}
// route={route}
// isVideoOn={isVideoOn}
// isFrontCamera={isFrontCamera}
