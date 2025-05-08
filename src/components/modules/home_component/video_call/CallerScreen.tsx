import {
  View,
  StatusBar,
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
    converstationVideocall,
    participantIds,
    caller,
    isCaller,
    isOnpenCamera,
  } = route.params;
  const { roomId, participants, roomName } = converstationVideocall;
  const socket = useSocket();
  const color = useSelector((value: any) => value.colorApp.value);
  const insets = useSafeAreaInsets();

  const localVideoRef = useRef<any>(null);

  const {
    localStream,
    remoteStreams,
    participanteds,
    isMicOn,
    setIsMicOn,
    statusCamera,
    setStatusCamera,
    setupMedia,
    endCall,
    isSpeakerOn,
    setIsSpeakerOn,
    setLocalStream,
    setParticipanteds,
    setRemoteStreams,
    handleRejoin,
  } = useWebRTC({
    socket,
    roomId,
    isCaller,
    isOnpenCamera,
    participants,
    navigation,
    caller,
  });

  useEffect(() => {
    const initCall = async () => {
      const success = await setupMedia();
      if (!success) {
        console.error('Failed to set up media');
        endCall();
        return;
      }
    };

    initCall();

  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleCallUpdate = (data: {
      type: string;
      participant: any;
      allParticipants: any[];
    }) => {

      setParticipanteds(data.allParticipants);
    };

    const handleUserLeft = ({ userId }: { userId: string }) => {
      console.log(`User left: ${userId}`);
      setRemoteStreams(prev => {
        const newStreams = { ...prev };
        delete newStreams[userId];
        return newStreams;
      });
    };

    socket.on('call_update', handleCallUpdate);
    socket.on('userLeftCall', handleUserLeft);
    socket.on('call_ended', endCall);
    socket.on('call_cancelled', endCall);
    socket.on('force_end_call', endCall);
    socket.on('connect', handleRejoin);

    return () => {
      socket.off('call_update');
      socket.off('userLeftCall');
      socket.off('call_ended');
      socket.off('call_cancelled');
      socket.off('force_end_call');
      socket.off('connect');
    };
  }, [socket,]);

  return (
    <View style={styles.container}>
      <StatusBar
        translucent={true}
        barStyle={color.dark ? 'light-content' : 'dark-content'}
        backgroundColor={'transparent'}
      />

      <View style={[styles.previewContainer, { paddingTop: insets.top }]}>
        <VideoCallPreview
          converstationVideocall={converstationVideocall}
          participanteds={participanteds}
          isCameraOn={statusCamera}
          localVideoRef={localVideoRef}
          remoteStreams={remoteStreams}
          localStream={localStream}
          caller={caller}
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