import React, {useCallback, useEffect, useRef, useState} from 'react';
import {View, Text, StyleSheet, StatusBar} from 'react-native';
import {useRoute, useNavigation, RouteProp} from '@react-navigation/native';
import {useSocket} from '../../../../provinders/socket.io';
import {RootStackParamList} from '../../../../types/navigation_type/rootStackScreen';
import {useSelector} from 'react-redux';
import ActionButton from './ActionButton';
import VideoCallPreview from './VideoCallPreview';
import {CallNotifiButton} from '../../../../constants/type_constants/type_notifi';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useWebRTC} from './use_video_call/useWebRTC';
import IncommingVideoCall from './InCommingVideoCall';

interface Participant {
  user_id: string;
  socketId: string;
  name?: string;
  avatar?: string;
  [key: string]: any;
}

const ReceiverScreen: React.FC = () => {
  const route = useRoute<RouteProp<RootStackParamList, 'ReciverScreen'>>();
  const {caller, converstationVideocall, isCaller, isOnpenCamera, status} =
    route.params || {};

  const {roomId, participants, roomName} = converstationVideocall || {};
  const navigation = useNavigation();
  const socket = useSocket();
  const user = useSelector((state: any) => state.auth.value);
  const color = useSelector((value: any) => value.colorApp.value);
  const insets = useSafeAreaInsets();
  const localVideoRef = useRef<any>(null);

  const [callStatus, setCallStatus] = useState<
    CallNotifiButton.ACCEPT | CallNotifiButton.REJECT | CallNotifiButton.COMMING
  >(
    status === CallNotifiButton.ACCEPT
      ? CallNotifiButton.ACCEPT
      : status === CallNotifiButton.REJECT
      ? CallNotifiButton.REJECT
      : CallNotifiButton.COMMING,
  );

  const {
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

  const hasAcceptedCall = useRef(false);

  const handleAccept = useCallback(() => {
    if (hasAcceptedCall.current) {
      console.log('Call already accepted');
      return;
    }

    if (!caller || !socket || !user?._id || !roomId) {
  
      navigation.goBack();
      return;
    }

    hasAcceptedCall.current = true;
    setCallStatus(CallNotifiButton.ACCEPT);

    const userReceiver = participants?.find((p: any) => p.user_id === user._id);
    if (!userReceiver) {
      navigation.goBack();
      return;
    }

    socket.emit('call_accepted', {
      roomId,
      caller,
      userReceiver: {
        _id: userReceiver._id,
        user_id: userReceiver.user_id,
        name: userReceiver.name,
        avatar: userReceiver.avatar,
      },
    });

    setupMedia().then(success => {
      if (!success) {
        console.error('Failed to set up media');
        endCall();
      }
    });
  }, [
  ]);

  const handleDecline = useCallback(() => {

    setCallStatus(CallNotifiButton.REJECT);

    if (!socket || !caller || !user?._id || !roomId) {
     
      navigation.goBack();
      return;
    }

    socket.emit('call_declined', {
      roomId,
      caller,
      userReceiver: {_id: user._id, user_id: user.user_id},
    });

    navigation.goBack();
  }, [socket]);

  // Log params and statusCamera
  useEffect(() => {
   
    if (status === CallNotifiButton.ACCEPT) {
      console.log('Auto-accepting call due to status');
      handleAccept();
    } else if (status === CallNotifiButton.REJECT) {
      console.log('Auto-rejecting call due to status');
      handleDecline();
    }

    return () => {
      hasAcceptedCall.current = false;
    };
  }, [
  ]);

  // Sync mic and camera status
  useEffect(() => {
    if (!localStream) return;

   
    localStream.getAudioTracks().forEach(track => {
      track.enabled = isMicOn;
    });

    if (isOnpenCamera && localStream.getVideoTracks().length > 0) {
      console.log('Syncing camera status:', statusCamera);
      localStream.getVideoTracks().forEach(track => {
        track.enabled = statusCamera;
      });
    }
  }, []);

  // Setup WebRTC
  useEffect(() => {
    if (callStatus !== CallNotifiButton.ACCEPT || !localStream) return;
  
    for (const participant of participanteds) {
      const userId = participant.user_id;
      const targetSocketId = participant.socketId;
      if (userId && targetSocketId && userId !== user._id) {
        console.log(`Setting up peer for ${userId} with socketId ${targetSocketId}`);
        setupPeerConnection(userId, targetSocketId, localStream);
      }
    }
  }, []);
  
  useEffect(() => {
    if (!socket) return;
  
    socket.on('call_ended', () => {
      console.log('Received call_ended from server');
      endCall();
    });
    socket.on('call_cancelled', () => {
      console.log('Received call_cancelled from server');
      endCall();
    });
    socket.on('force_end_call', ({ reason }: any) => {
      console.log('Received force_end_call:', reason);
      endCall();
    });
    socket.on('connect', () => {
      console.log('Socket reconnected');
      handleRejoin();
    });
  
    return () => {
      socket.off('call_ended');
      socket.off('call_cancelled');
      socket.off('force_end_call');
      socket.off('connect');
    };
  }, [socket]);

  return (
    <View style={styles.container}>
      <StatusBar
        translucent={true}
        barStyle={color.dark ? 'light-content' : 'dark-content'}
        backgroundColor={'transparent'}
      />
      <View style={[styles.previewContainer, {paddingTop: insets.top}]}>
        {callStatus === CallNotifiButton.ACCEPT && caller ? (
          <VideoCallPreview
            converstationVideocall={converstationVideocall}
            participanteds={participanteds || []}
            isCameraOn={statusCamera}
            localVideoRef={localVideoRef}
            remoteStreams={remoteStreams}
            localStream={localStream}
            caller={caller}
          />
        ) : callStatus === CallNotifiButton.COMMING && caller ? (
          <IncommingVideoCall
            caller={caller}
            converstationVideocall={converstationVideocall}
            handleAccept={handleAccept}
            handleDecline={handleDecline}
          />
        ) : (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Invalid call information</Text>
          </View>
        )}
      </View>
      {callStatus === CallNotifiButton.ACCEPT && (
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
      )}
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#fff',
    fontSize: 18,
  },
});

export default ReceiverScreen;
