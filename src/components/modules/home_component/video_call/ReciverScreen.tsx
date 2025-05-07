import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
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

const ReceiverScreen: React.FC = () => {
  const route = useRoute<RouteProp<RootStackParamList, 'ReciverScreen'>>();
  const {caller, roomId, participants, isCaller, isOnpenCamera, status} =
    route.params || {};

  const navigation = useNavigation();
  const socket = useSocket();
  const user = useSelector((state: any) => state.auth.value);
  const color = useSelector((value: any) => value.colorApp.value);
  const insets = useSafeAreaInsets();
  const localVideoRef = useRef<any>(null);

  // Call status
  const [callStatus, setCallStatus] = useState<
    CallNotifiButton.ACCEPT | CallNotifiButton.REJECT | CallNotifiButton.COMMING
  >(
    status === CallNotifiButton.ACCEPT
      ? CallNotifiButton.ACCEPT
      : status === CallNotifiButton.REJECT
      ? CallNotifiButton.REJECT
      : CallNotifiButton.COMMING,
  );

  // Use WebRTC hook
  const {
    localStream,
    remoteStreams,
    isMicOn,
    participanteds,
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
  } = useWebRTC({
    socket,
    roomId,
    isCaller,
    participants,
    isOnpenCamera,
    navigation,
  });

  // Track if call has been accepted
  const hasAcceptedCall = useRef(false);

  // Handle accepting a call
  const handleAccept = useCallback(() => {
    if (hasAcceptedCall.current) {
      console.log('Call already accepted');
      return;
    }

    hasAcceptedCall.current = true;
    console.log(`Accepting call from ${caller?.name}`);
    setCallStatus(CallNotifiButton.ACCEPT);

    if (
      !participants ||
      participants.length === 0 ||
      !socket ||
      !caller?.socketId
    ) {
      console.error('Invalid call info:', {
        participants,
        socket,
        callerSocketId: caller?.socketId,
      });
      return;
    }

    // Find current user in participants
    const userReceiver = participants.find(
      (p: any) => p.user.user_id === user._id,
    );
    if (!userReceiver) {
      console.error('User receiver not found in participants');
      return;
    }

    socket.emit('call_accepted', {
      roomId,
      caller: {...caller, socketId: caller.socketId},
      userReceiver: {
        _id: userReceiver.user._id,
        user_id: userReceiver.user.user_id,
        name: userReceiver.user.name,
        avatar: userReceiver.user.avatar,
        socketId: socket?.id,
      },
    });

    // Initialize media and connections
    setupMedia().then(success => {
      if (!success) {
        console.error('Failed to set up media');
        endCall();
      }
    });
  }, [socket, caller, participants, user, roomId, setupMedia, endCall]);

  // Handle declining a call
  const handleDecline = useCallback(() => {
    console.log(`Declining call from ${caller?.name}`);
    setCallStatus(CallNotifiButton.REJECT);

    if (!socket || !caller || !user?._id) {
      console.error('Missing required info for declining:', {
        socket,
        caller,
        userId: user?._id,
      });
      endCall();
      return;
    }

    // Notify server of rejection
    socket.emit('call_declined', {
      roomId,
      caller,
      userReceiver: {user_id: user._id, socketId: socket.id},
    });

    endCall();
  }, [socket, caller, user?._id, roomId, endCall]);

  // Auto-accept or auto-reject based on status param
  useEffect(() => {
    if (status === CallNotifiButton.ACCEPT) {
      console.log('Auto-accepting call due to status');
      handleAccept();
    } else if (status === CallNotifiButton.REJECT) {
      console.log('Auto-rejecting call due to status');
      handleDecline();
    }
  }, [status, handleAccept, handleDecline]);

  // Set up WebRTC when call is accepted
  useEffect(() => {
    if (callStatus !== CallNotifiButton.ACCEPT) return;

    const initWebRTC = async () => {
      // Set up media
      const success = await setupMedia();
      if (!success) {
        console.error('Failed to set up media');
        endCall();
        return;
      }

      // Set up connections with existing participants
      if (participants && localStream) {
        for (const participant of participants) {
          const participantSocketId = participant.socketId;
          if (participantSocketId && participantSocketId !== socket?.id) {
            setupPeerConnection(participantSocketId, localStream);
          }
        }
      }
    };

    initWebRTC();
  }, [
    callStatus,
    setupMedia,
    participants,
    localStream,
    socket?.id,
    setupPeerConnection,
    endCall,
  ]);
  console.log(participants);
  // Handle call updates
  useEffect(() => {
    if (!socket) return;

    const handleCallUpdate = (data: {
      type: string;
      participant: any;
      allParticipants: any[];
    }) => {
      console.log(`Call update: ${data.type}`);
      setParticipanteds(data.allParticipants);

      // Handle new participant
      if (data.type === 'participant_joined' && localStream) {
        const participantSocketId = data.participant.socketId;
        if (participantSocketId && participantSocketId !== socket.id) {
          const peer = setupPeerConnection(participantSocketId, localStream);
          if (isCaller) {
            createOffer(peer, participantSocketId);
          }
        }
      }
    };

    // Set up socket event listeners
    socket.on('call_update', handleCallUpdate);
    socket.on('call_ended', () => {
      console.log('Call ended by server');
      endCall();
    });
    socket.on('call_cancelled', () => {
      console.log('Call cancelled by caller');
      endCall();
    });
    socket.on('force_end_call', ({reason}: any) => {
      console.log(`Force end call: ${reason}`);
      endCall();
    });

    // Clean up listeners
    return () => {
      socket.off('call_update', handleCallUpdate);
      socket.off('call_ended');
      socket.off('call_cancelled');
      socket.off('force_end_call');
    };
  }, [
    socket,
    localStream,
    setupPeerConnection,
    endCall,
    isCaller,
    createOffer,
  ]);

  return (
    <View style={styles.container}>
      <StatusBar
        translucent={true}
        barStyle={color.dark ? 'light-content' : 'dark-content'}
        backgroundColor={'transparent'}
      />

      {/* Video preview area */}
      <View style={[styles.previewContainer, {paddingTop: insets.top}]}>
        <>
          {callStatus === CallNotifiButton.ACCEPT && (
            <VideoCallPreview
              participanteds={participanteds || []}
              isCameraOn={statusCamera}
              localVideoRef={localVideoRef}
              remoteStreams={remoteStreams}
              localStream={localStream}
            />
          )}

          {callStatus === CallNotifiButton.COMMING && (

            <IncommingVideoCall
            caller={caller}
              paticipant={participants}
              handleAccept={handleAccept}
              handleDecline={handleDecline}
            />
          )}
        </>
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
});

export default ReceiverScreen;
