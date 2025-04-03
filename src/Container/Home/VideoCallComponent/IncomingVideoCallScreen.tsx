import React, {useEffect, useState} from 'react';
import {View, Text, Image, TouchableOpacity, StyleSheet} from 'react-native';
import {useRoute, useNavigation, RouteProp} from '@react-navigation/native';
import {useSocket} from '../../../util/socket.io';
import {navigationRef} from '../../../navigation/navigation';
import {RootStackParamList} from '../../../type/rootStackScreen';
import {useSelector} from 'react-redux';
import ActionButton from './ActionButton';
import userVideoCallHome from './useVideocall/useVideoCallHome';
import VideoCallPreview from './VideoCallPreview';

const IncomingVideoCallScreen = () => {
  const route = useRoute<RouteProp<RootStackParamList, 'CommingVideoCall'>>();
  const navigation = useNavigation(); // Để điều hướng màn hình
  const socket = useSocket(); // Lấy socket từ Context
  const user = useSelector((state: any) => state.auth.value);
  const {caller, userCall, roomId, nameCall, conversation, isFromNotification} =
    route.params || {};
  const [myStream, setMyStream] = useState(null); // Thay bằng stream của bạn
  const [callAccepted, setCallAccepted] = useState(false);
  console.log(route.params,'ndnjsndjsnidjdj');
  useEffect(() => {
    if (!caller || !roomId || !nameCall) {
      console.warn('⚠️ Không có dữ liệu cuộc gọi, tự động thoát...');
      navigation.goBack();
      return;
    }

    const handleCallCancelled = () => {
      console.log('🚫 Cuộc gọi đã bị hủy bởi người gọi.');
      navigation.goBack();
    };

    socket?.on('call_cancelled', handleCallCancelled);

    return () => {
      socket?.off('call_cancelled', handleCallCancelled);
    };
  }, [caller, roomId, conversation]);

  const handleAccept = () => {
    console.log(`✅ Chấp nhận cuộc gọi từ ${userCall?.name}`);
    setCallAccepted(true);

    const userReceiver = conversation?.participants.find(
      (participant: any) => participant.user_id === user._id,
    );

    if (!userReceiver) {
      console.warn('⚠️ Không tìm thấy thông tin người nhận, từ chối cuộc gọi.');
      return;
    }

    socket?.emit('call_accepted', {caller, roomId, userReceiver});

    // Nếu từ notification thì chuyển sang màn hình VideoCallHome
    if (isFromNotification) {
      navigationRef.navigate('VideoCallHome', route.params);
    }
  };

  const handleDecline = () => {
    console.log(`❌ Từ chối cuộc gọi từ ${userCall?.name}`);

    const userReceiver = conversation?.participants.find(
      (participant: any) => participant.user_id === user._id,
    );

    if (!userReceiver) {
      console.warn('⚠️ Không tìm thấy thông tin người nhận.');
      return;
    }

    // Gửi sự kiện từ chối đến server/người gọi
    socket?.emit('call_declined', {caller, roomId, userReceiver});

    // Đóng màn hình
    navigation.goBack();
  };
  const {
    isMuted,
    isSpeakerOn,
    isVideoOn,
    isFrontCamera,
    toggleMute,
    toggleSpeaker,
    toggleVideo,
    switchCamera,
    endCall,
  } = userVideoCallHome(navigation, route);
  return (
    <View style={styles.container}>
      <View style={styles.background} />

      <View style={styles.previewContainer}>
        <VideoCallPreview
          participants={[]}
          myStream={myStream}
          // // navigation={navigation}
          // route={route}
          // isVideoOn={isVideoOn}
          // isFrontCamera={isFrontCamera}
        />
      </View>
      {callAccepted && (
        <ActionButton
          isMuted={isMuted}
          isSpeakerOn={isSpeakerOn}
          isVideoOn={isVideoOn}
          isFrontCamera={isFrontCamera}
          toggleMute={toggleMute}
          toggleSpeaker={toggleSpeaker}
          toggleVideo={toggleVideo}
          switchCamera={switchCamera}
          endCall={endCall}
        />
      )}
      {!callAccepted && (
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.declineButton]}
            onPress={handleDecline}>
            <Text style={styles.buttonText}>Decline</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.acceptButton]}
            onPress={handleAccept}>
            <Text style={styles.buttonText}>Accept</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  background: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
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
