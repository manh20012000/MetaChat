// VideoCallHome.tsx
import {
  View,
  Text,
  StatusBar,
  useWindowDimensions,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import Statusbar from '../../../commons/StatusBar';
import { useSelector } from 'react-redux';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import VideoCallPreview from './VideoCallPreview';
import { RouteProp } from '@react-navigation/native';
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
import { useSocket } from '../../../../provinders/socket.io';

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
  const [statusCamera, setStatusCamera] = useState(isOnpenCamera ?? true);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map());
  const [participants, setParticipants] = useState(initialParticipants);
  const [callActive, setCallActive] = useState(false);

  // Refs
  const localVideoRef = useRef<any>(null);
  const peerConnections = useRef<Record<string, RTCPeerConnection>>({});
  const iceCandidatesSent = useRef<Set<string>>(new Set());
  const isCreatingOffer = useRef<Record<string, boolean>>({});
  const pendingSignals = useRef<any[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const isMounted = useRef(false);

  // Initialize media stream
  const setupMedia = useCallback(async () => {
    try {
      // console.log('🎥 [Media] Initializing media stream...');
      const constraints = {
        audio: true,
        video: { width: 640, height: 480, frameRate: 30 },
      };
      const stream = await mediaDevices.getUserMedia(constraints);

      if (!stream.active) {
        throw new Error('Stream not active');
      }

      stream.getVideoTracks().forEach(track => {
        track.enabled = statusCamera;
        // console.log(`🎥 [Media] Video track: ${track.enabled ? 'ENABLED' : 'DISABLED'}`);
      });

      stream.getAudioTracks().forEach(track => {
        track.enabled = isMicOn;
        // console.log(`🎙️ [Media] Audio track: ${track.enabled ? 'ENABLED' : 'DISABLED'}`);
      });

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      streamRef.current = stream;
      setLocalStream(stream);
      setCallActive(true);

      // console.log('🎥 [Media] Local stream initialized successfully');
      return true;
    } catch (err) {
      // console.error('❌ [Media] Initialization failed:', err);
      return false;
    }
  }, [statusCamera, isMicOn]);

  // Cleanup function
  const endCall = useCallback(() => {
    if (!callActive) {
      // console.log('🛑 [EndCall] Call not active, skipping cleanup');
      navigation.goBack();
      return;
    }

    // console.log('🛑 [EndCall] Performing call cleanup...');

    // Stop local stream
    streamRef.current?.getTracks().forEach(track => {
      // console.log(`🛑 [EndCall] Stopping track: ${track.kind}`);
      track.stop();
    });
    streamRef.current = null;
    setLocalStream(null);

    // Close all peer connections
    Object.entries(peerConnections.current).forEach(([id, peer]) => {
      try {
        // console.log(`🛑 [EndCall] Closing peer connection: ${id}`);
        peer.close();
      } catch (err) {
        // console.error(`🛑 [EndCall] Error closing peer ${id}:`, err);
      }
    });
    peerConnections.current = {};
    iceCandidatesSent.current.clear();
    isCreatingOffer.current = {};

    // Clear remote streams
    setRemoteStreams(new Map());

    // Notify server
    if (socket?.connected) {
      socket.emit('endCall', { conversationId: roomId });
      // console.log('🛑 [EndCall] Emitted endCall to server');
    }

    setCallActive(false);
    navigation.goBack();
    // console.log('🛑 [EndCall] Call ended successfully');
  }, [socket, roomId, navigation, callActive]);

  // Peer Connection Management
  const setupPeerConnection = useCallback((targetSocketId: string, stream: MediaStream): RTCPeerConnection | null => {
    if (peerConnections.current[targetSocketId]) {
      if (peerConnections.current[targetSocketId].connectionState === 'closed') {
        // console.log(`🔗 [Peer] Existing connection to ${targetSocketId} is closed, creating new one`);
      } else {
        // console.log(`🔗 [Peer] Connection to ${targetSocketId} already exists`);
        return peerConnections.current[targetSocketId];
      }
    }

    // console.log(`🔗 [Peer] Creating new peer connection for ${targetSocketId}`);
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

    // Add track event handlers
    stream.getTracks().forEach(track => {
      try {
        peer.addTrack(track, stream);
        // console.log(`🔗 [Peer] Added ${track.kind} track to ${targetSocketId}`);
      } catch (err) {
        // console.error(`🔗 [Peer] Failed to add ${track.kind} track:`, err);
      }
    });

    // ICE candidate handler
    (peer as any).onicecandidate = ({ candidate }) => {
      if (candidate && isMounted.current) {
        const candidateKey = `${candidate.sdpMid}-${candidate.sdpMLineIndex}-${candidate.candidate}`;
        if (!iceCandidatesSent.current.has(candidateKey)) {
          iceCandidatesSent.current.add(candidateKey);
          // console.log(`📡 [ICE] Sending candidate to ${targetSocketId}`);
          socket?.emit('sendSignal', {
            signal: { candidate },
            targetSocketId,
            roomId,
            type: 'iceCandidate',
          });
        }
      }
    };

    // Track handler
    (peer as any).ontrack = (event) => {
      if (!isMounted.current) return;
      // console.log(`📺 [Peer] Received stream from ${targetSocketId}`);
      const remoteStream = event.streams[0];
      setRemoteStreams(prev => {
        if (prev.get(targetSocketId) === remoteStream) return prev;
        const newMap = new Map(prev);
        newMap.set(targetSocketId, remoteStream);
        return newMap;
      });
    };

    // ICE connection state handler
    (peer as any).oniceconnectionstatechange = () => {
      if (!isMounted.current) return;
      const state = peer.iceConnectionState;
      // console.log(`📡 [ICE] ${targetSocketId} state: ${state}`);

      if (state === 'connected') {
        // console.log(`✅ [Peer] Connected to ${targetSocketId}`);
      } else if (['disconnected', 'failed', 'closed'].includes(state)) {
        // console.log(`❌ [Peer] Disconnected from ${targetSocketId}`);
        removePeerConnection(targetSocketId);
      }
    };

    // Negotiation needed handler
    (peer as any).onnegotiationneeded = async () => {
      if (!isMounted.current || peer.signalingState === 'closed') {
        // console.log(`🔄 [Peer] Skipping negotiation for closed connection: ${targetSocketId}`);
        return;
      }

      // console.log(`🔄 [Peer] Negotiation needed for ${targetSocketId}`);
      if (isCaller || peer.signalingState === 'stable') {
        createOffer(peer, targetSocketId);
      }
    };

    peerConnections.current[targetSocketId] = peer;
    return peer;
  }, [socket, roomId, isCaller]);

  // Create offer function
  const createOffer = useCallback(async (peer: RTCPeerConnection, targetSocketId: string) => {
    if (!isMounted.current) return;

    if (isCreatingOffer.current[targetSocketId]) {
      // console.log(`⏳ [Offer] Already creating offer for ${targetSocketId}, skipping`);
      return;
    }

    if (peer.signalingState === 'closed') {
      // console.log(`❌ [Offer] Peer connection closed, skipping offer for ${targetSocketId}`);
      return;
    }

    isCreatingOffer.current[targetSocketId] = true;
    // console.log(`📤 [Offer] Creating offer for ${targetSocketId}`);

    try {
      const offer = await peer.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      });

      if ((peer as any).signalingState === 'closed') {
        // console.log(`❌ [Offer] Peer closed after createOffer for ${targetSocketId}`);
        return;
      }

      await peer.setLocalDescription(offer);
      // console.log(`📤 [Offer] Offer created for ${targetSocketId}`);

      socket?.emit('sendSignal', {
        signal: { ...offer, type: 'offer' },
        targetSocketId,
        roomId,
        type: 'offer',
      });
    } catch (err) {
      // console.error(`❌ [Offer] Failed to create offer for ${targetSocketId}:`, err);
      removePeerConnection(targetSocketId);
    } finally {
      isCreatingOffer.current[targetSocketId] = false;
    }
  }, [socket, roomId]);

  // Remove peer connection
  const removePeerConnection = useCallback((socketId: string) => {
    if (!isMounted.current) return;

    // console.log(`🗑️ [Peer] Removing connection: ${socketId}`);
    const peer = peerConnections.current[socketId];

    if (peer) {
      try {
        if (peer.signalingState !== 'closed') {
          peer.close();
        }
      } catch (err) {
        // console.error(`❌ [Peer] Error closing peer ${socketId}:`, err);
      }

      delete peerConnections.current[socketId];
      delete isCreatingOffer.current[socketId];

      setRemoteStreams(prev => {
        if (!prev.has(socketId)) return prev;
        const newMap = new Map(prev);
        newMap.delete(socketId);
        return newMap;
      });
    }
  }, []);

  // Handle incoming signals
  const handleSignal = useCallback(async ({ signal, senderId, type }: {
    signal: any;
    senderId: string;
    type: string;
  }) => {
    if (!isMounted.current || !streamRef.current) return;

    try {
      // console.log(`📨 [Signal] Received ${type} from ${senderId}`);

      let peer = peerConnections.current[senderId];
      if (!peer) {
        // console.log(`🔗 [Peer] Creating new connection for signal from ${senderId}`);
        peer = setupPeerConnection(senderId, streamRef.current) as any;
        if (!peer) return;
      }

      if (peer.signalingState === 'closed') {
        // console.log(`❌ [Signal] Peer closed, skipping ${type} from ${senderId}`);
        return;
      }

      switch (type) {
        case 'offer':
          // console.log(`📨 [Signal] Setting offer from ${senderId}`);
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
          // console.log(`📨 [Signal] Setting answer from ${senderId}`);
          await peer.setRemoteDescription(new RTCSessionDescription(signal));
          break;

        case 'iceCandidate':
          if (signal.candidate) {
            // console.log(`📨 [Signal] Adding ICE candidate from ${senderId}`);
            await peer.addIceCandidate(new RTCIceCandidate(signal.candidate));
          }
          break;

        default:
        // console.warn(`⚠️ [Signal] Unknown type: ${type}`);
      }
    } catch (err) {
      // console.error(`❌ [Signal] Error handling ${type} from ${senderId}:`, err);
    }
  }, [socket, roomId, setupPeerConnection]);

  // Handle call updates
  const handleCallUpdate = useCallback((data: {
    type: string;
    participant: any;
    allParticipants: any[];
  }) => {
    if (!isMounted.current) return;

    // console.log(`📞 [Call] Update: ${data.type}`);
    setParticipants(data.allParticipants);

    if (data.type === 'participant_joined' && streamRef.current) {
      if (data.participant.socketId && data.participant.socketId !== socket?.id) {
        // console.log(`👤 [Call] New participant: ${data.participant.socketId}`);
        const peer = setupPeerConnection(data.participant.socketId, streamRef.current);
        if (peer && isCaller) {
          createOffer(peer, data.participant.socketId);
        }
      }
    }
  }, [socket?.id, isCaller, setupPeerConnection, createOffer]);

  // Handle user leaving
  const handleUserLeft = useCallback(({ userId }: { userId: string }) => {
    if (!isMounted.current) return;

    // console.log(`👤 [Call] User left: ${userId}`);
    const participant = participants.find(p => p.user_id === userId);
    if (participant?.socketId) {
      removePeerConnection(participant.socketId);
    }
  }, [participants, removePeerConnection]);

  // Setup media and connections
  useEffect(() => {
    isMounted.current = true;

    const initCall = async () => {
      const success = await setupMedia();
      if (!success) {
        // console.log('❌ [Init] Failed to setup media, ending call');
        endCall();
        return;
      }

      // Process any pending signals
      if (pendingSignals.current.length > 0) {
        // console.log('📨 [Signal] Processing pending signals');
        pendingSignals.current.forEach(signal => handleSignal(signal));
        pendingSignals.current = [];
      }
    };

    initCall();

    return () => {
      isMounted.current = false;
      if (callActive) {
        endCall();
      }
    };
  }, [setupMedia, endCall, callActive, handleSignal]);

  // Update media tracks when settings change
  useEffect(() => {
    if (!streamRef.current) return;

    const videoTracks = streamRef.current.getVideoTracks();
    const audioTracks = streamRef.current.getAudioTracks();

    videoTracks.forEach(track => {
      if (track.enabled !== statusCamera) {
        track.enabled = statusCamera;
        // console.log(`🎚️ [Media] Video track ${statusCamera ? 'ENABLED' : 'DISABLED'}`);
      }
    });

    audioTracks.forEach(track => {
      if (track.enabled !== isMicOn) {
        track.enabled = isMicOn;
        // console.log(`🎚️ [Media] Audio track ${isMicOn ? 'ENABLED' : 'DISABLED'}`);
      }
    });
  }, [statusCamera, isMicOn]);

  // Setup socket listeners
  useEffect(() => {
    if (!socket) return;

    const signalHandler = (data: any) => handleSignal(data);
    const callUpdateHandler = (data: any) => handleCallUpdate(data);
    const userLeftHandler = (data: any) => handleUserLeft(data);
    const callEndedHandler = () => {
      // console.log('📞 [Call] Ended by server');
      endCall();
    };

    socket.on('receiveSignal', signalHandler);
    socket.on('call_update', callUpdateHandler);
    socket.on('userLeftCall', userLeftHandler);
    socket.on('call_ended', callEndedHandler);

    return () => {
      socket.off('receiveSignal', signalHandler);
      socket.off('call_update', callUpdateHandler);
      socket.off('userLeftCall', userLeftHandler);
      socket.off('call_ended', callEndedHandler);
    };
  }, [socket, handleSignal, handleCallUpdate, handleUserLeft, endCall]);
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
  videoPlaceholder: { flex: 1, backgroundColor: 'black' },
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
