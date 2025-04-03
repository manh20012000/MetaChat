import { useEffect } from 'react';
import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance, EventType } from '@notifee/react-native';
import RNCallKeep from 'react-native-callkeep';

import { PermissionsAndroid, Platform } from 'react-native';

const requestPermissions = async () => {
  if (Platform.OS === 'android') {
    const granted = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE,
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      PermissionsAndroid.PERMISSIONS.CAMERA,
      PermissionsAndroid.PERMISSIONS.CALL_PHONE, // Thêm quyền này
    ]);
    const allGranted = (
      granted[PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE] === PermissionsAndroid.RESULTS.GRANTED &&
      granted[PermissionsAndroid.PERMISSIONS.RECORD_AUDIO] === PermissionsAndroid.RESULTS.GRANTED &&
      granted[PermissionsAndroid.PERMISSIONS.CAMERA] === PermissionsAndroid.RESULTS.GRANTED &&
      granted[PermissionsAndroid.PERMISSIONS.CALL_PHONE] === PermissionsAndroid.RESULTS.GRANTED
    );
    console.log('Permissions granted:', allGranted);
    return allGranted;
  }
  return true;
};
const setupCallKeep = async () => {
  const hasPermissions = await requestPermissions();
  if (!hasPermissions) {
    console.log('Permissions not granted, CallKeep setup aborted');
    return;
  }

  const options = {
    ios: { appName: 'MetaChat' },
    android: {
      alertTitle: 'Quyền truy cập cuộc gọi',
      alertDescription: 'Cho phép ứng dụng thực hiện cuộc gọi',
      cancelButton: 'Hủy',
      okButton: 'Đồng ý',
      imageName: 'phone_account_icon',
      additionalPermissions: ['android.permission.READ_PHONE_STATE', 'android.permission.CALL_PHONE'],
      selfManaged: false, // Thử dùng giao diện hệ thống
    },
  };
  try {
    await RNCallKeep.setup(options);
    console.log('CallKeep setup successfully');
    RNCallKeep.setAvailable(true); // Đánh dấu app sẵn sàng nhận cuộc gọi
  } catch (error) {
    console.error('Error setting up CallKeep:', error);
  }
};
const AppDeep = () => {
  useEffect(() => {
    console.log('AppDeep useEffect started');
    const initialize = async () => {
      await setupCallKeep(); // Gọi bất đồng bộ
  
      // Tạo kênh thông báo
      const setupNotificationChannel = async () => {
        await notifee.createChannel({
          id: 'incoming_call',
          name: 'Cuộc gọi đến',
          importance: AndroidImportance.HIGH,
          sound: 'ringtone',
          vibration: true,
          vibrationPattern: [300, 500],
        });
        console.log('Notification channel created');
      };
      await setupNotificationChannel();
  
      // Xử lý cuộc gọi đến
      const handleIncomingCall = async (remoteMessage:any) => {
        console.log('shudhsujdkjsdbshjcbhdsshudhsujdkjsdbshjcbhds')
        try {
          const { data } = remoteMessage;
        
         
          if (!data) {
            throw new Error('No data received in remoteMessage');
          }
      
          const { roomId, callerId, callerName } = data;
        
      
          if (!roomId || !callerId || !callerName) {
            throw new Error('Missing required call data');
          }
      
          RNCallKeep.displayIncomingCall(roomId, callerName, callerName, 'generic', true);
      
          await notifee.displayNotification({
            id: roomId,
            title: `Cuộc gọi từ ${callerName}`,
            body: 'Nhấn để trả lời',
            data: { roomId, callerId },
            android: {
              channelId: 'incoming_call',
              importance: AndroidImportance.HIGH,
              sound: 'ringtone',
              vibrationPattern: [300, 500],
              fullScreenAction: { id: 'default' },
              actions: [
                { title: 'Nhận', pressAction: { id: 'accept_call' } },
                { title: 'Từ chối', pressAction: { id: 'reject_call' } },
              ],
            },
            ios: {
              sound: 'ringtone.wav',
              categoryId: 'incoming_call',
              interruptionLevel: 'timeSensitive',
            },
          });
        } catch (error) {
          console.error('Error handling incoming call:', error);
        }
      };
      const unsubscribeForeground = messaging().onMessage(handleIncomingCall);
      messaging().setBackgroundMessageHandler(handleIncomingCall);
  
      RNCallKeep.addEventListener('answerCall', (data) => {
        console.log('Người dùng nhận cuộc gọi:', data.callUUID);
      });
  
      RNCallKeep.addEventListener('endCall', (data) => {
        console.log('Người dùng từ chối cuộc gọi:', data.callUUID);
        notifee.cancelNotification(data.callUUID);
      });
  
      return () => {
        unsubscribeForeground();
        RNCallKeep.removeEventListener('answerCall');
        RNCallKeep.removeEventListener('endCall');
      };
    };
  
    initialize().catch((error) => console.error('Initialize error:', error));
  }, []);

  return null;
};

export default AppDeep;
