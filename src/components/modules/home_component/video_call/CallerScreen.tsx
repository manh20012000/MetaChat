// CallerScreen.tsx
import {
  View,
  StatusBar,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import React, { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import VideoCallPreview from './VideoCallPreview';
import ActionButton from './ActionButton';
import { useSocket } from '../../../../provinders/socket.io';
import { useWebRTC } from './use_video_call/useWebRTC';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface CallerScreenProps {
  navigation: any;
  route: any;
}

const CallerScreen: React.FC<CallerScreenProps> = ({ navigation, route }) => {
  const {
    roomId,
    caller,
    isCaller,
    isOnpenCamera,
    participants,
    roomName,
  } = route.params;
  console.log(participants[0], participants[1])
  // Get socket instance
  const socket = useSocket();
  const color = useSelector((value: any) => value.colorApp.value);
  const insets = useSafeAreaInsets();

  // Video reference
  const localVideoRef = useRef<any>(null);

  // Use WebRTC hook
  const {
    localStream,
    remoteStreams,
    participanteds,
    isMicOn,
    setIsMicOn, setRemoteStreams,
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
  } = useWebRTC({
    socket,
    roomId,
    isCaller,
    isOnpenCamera,
    participants,
    navigation
  });

  // Set up call
  useEffect(() => {
    const initCall = async () => {
      // Set up media
      const success = await setupMedia();
      if (!success) {
        console.error('Failed to set up media');
        endCall();
        return;
      }

      // Initialize connections with existing participants
      if (participants && participants.length > 0 && socket && localStream) {
        participants.forEach(participant => {
          // Don't create connection to self
          if (participant.socketId && participant.socketId !== socket.id) {
            const peer = setupPeerConnection(participant.socketId, localStream);

            // If this is the caller, create an offer for each participant
            if (isCaller) {
              createOffer(peer, participant.socketId);
            }
          }
        });
      }
    };

    initCall();

    // Clean up on unmount
    return () => {
      endCall();
    };
  }, []);

  // Handle call updates from server
  useEffect(() => {
    if (!socket) return;

    const handleCallUpdate = (data: {
      type: string;
      participant: any;
      allParticipants: any[];
    }) => {
      console.log(`Call update: ${data.type}`);

      // Update participants list
      setParticipanteds(data.allParticipants);

      // Handle new participant joining
      if (data.type === 'participant_joined' && localStream) {
        const participantSocketId = data.participant.socketId;

        // Create connection to new participant (if not self)
        if (participantSocketId && participantSocketId !== socket.id) {
          const peer = setupPeerConnection(participantSocketId, localStream);

          // If caller, create an offer
          if (isCaller) {
            createOffer(peer, participantSocketId);
          }
        }
      }
    };

    const handleUserLeft = ({ userId }: { userId: string }) => {
      console.log(`User left: ${userId}`);

      // Find participant and remove their connection
      const participant = participants.find(p => p.user_id === userId);
      if (participant?.socketId) {
        // Remove from remote streams
        setRemoteStreams(prev => {
          const newStreams = new Map(prev);
          newStreams.delete(participant.socketId);
          return newStreams;
        });
      }
    };

    // Set up event listeners
    socket.on('call_update', handleCallUpdate);
    socket.on('userLeftCall', handleUserLeft);

    // Clean up listeners
    return () => {
      socket.off('call_update', handleCallUpdate);
      socket.off('userLeftCall', handleUserLeft);
    };
  }, [socket, participants, localStream, isCaller, setupPeerConnection, createOffer]);

  return (
    <View style={styles.container}>
      <StatusBar
        translucent={true}
        barStyle={color.dark ? 'light-content' : 'dark-content'}
        backgroundColor={'transparent'}
      />

      <View style={[styles.previewContainer, { paddingTop: insets.top }]}>
        <VideoCallPreview
          participanteds={participanteds}
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
        endCall={endCall}
        SetLocalStream={setLocalStream as any}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  previewContainer: {
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
  controlsContainer: {
    position: 'absolute',
    bottom: 30,
    width: '100%',
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
});

export default CallerScreen;