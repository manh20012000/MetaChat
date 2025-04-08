import {useEffect} from 'react';
import messaging from '@react-native-firebase/messaging';
import notifee, {AndroidImportance, EventType} from '@notifee/react-native';
import RNCallKeep from 'react-native-callkeep';
import {Permission, PermissionsAndroid, Platform} from 'react-native';
import {navigationRef} from './src/navigation/navigation';
import {userSchema} from './src/cache_data/Schema/chat_convertstation_schema';

import { AppState } from 'react-native';

const requestPermissions = async () => {
  if (Platform.OS === 'android') {
    try {
      const permissions: Permission[] = [
        PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE,
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        PermissionsAndroid.PERMISSIONS.CAMERA,
        PermissionsAndroid.PERMISSIONS.CALL_PHONE,
      ];

      const permissionsToRequest: Permission[] = [];
      for (const permission of permissions) {
        const status = await PermissionsAndroid.check(permission);
        if (!status) {
          // Nếu quyền chưa được cấp
          permissionsToRequest.push(permission);
        }
      }

      if (permissionsToRequest.length > 0) {
        const results = await PermissionsAndroid.requestMultiple(
          permissionsToRequest,
        );

        // Kiểm tra lại tất cả quyền sau khi yêu cầu
        const allGranted = permissions.every(permission => {
          return results[permission] === PermissionsAndroid.RESULTS.GRANTED;
        });

        console.log('All permissions granted:', allGranted);
        return allGranted;
      }

      // Nếu tất cả quyền đã được cấp
      return true;
    } catch (err) {
      console.error('Error requesting permissions:', err);
      return false;
    }
  }
  return true; // iOS không cần xử lý
};

const setupCallKeep = async () => {
  const hasPermissions = await requestPermissions();
  if (!hasPermissions) {
    console.log('Permissions not granted, showing explanation');
    return;
  }
  const phoneAccountOptions = {
    ios: {
      appName: 'MetaChat', // Tên ứng dụng hiển thị trên iOS
    },
    android: {
      alertTitle: 'Quyền truy cập cuộc gọi',
      alertDescription: 'Cho phép ứng dụng thực hiện cuộc gọi',
      cancelButton: 'Hủy',
      okButton: 'Đồng ý',
      imageName: 'phone_account_icon',
      additionalPermissions: ['android.permission.READ_PHONE_STATE'],
      selfManaged: true,
      foregroundService: {
        channelId: 'com.metachat.call',
        channelName: 'Cuộc gọi MetaChat',
        notificationTitle: 'MetaChat đang hoạt động',
        notificationIcon: 'ic_launcher',
      },
    },
  };
  const options = {
    ios: {appName: 'MetaChat'},
    android: {
      alertTitle: 'Quyền truy cập cuộc gọi',
      alertDescription: 'Cho phép ứng dụng thực hiện cuộc gọi',
      cancelButton: 'Hủy',
      okButton: 'Đồng ý',
      imageName: 'phone_account_icon',
      additionalPermissions: [
        'android.permission.READ_PHONE_STATE',
        'android.permission.CALL_PHONE',
      ],
      selfManaged: true, // Sử dụng selfManaged để linh hoạt hơn
    },
  };

  try {
    await RNCallKeep.setup(options);
    RNCallKeep.registerPhoneAccount(phoneAccountOptions); // Quan trọng
    RNCallKeep.registerAndroidEvents(); // Quan trọng
    RNCallKeep.setAvailable(true);
    console.log('CallKeep setup successfully');
  } catch (error) {
    console.error('Error setting up CallKeep:', error);
  }
};

const AppDeep = () => {
  useEffect(() => {
    console.log('AppDeep useEffect started');

    const handleNotificationPress = async ({type, detail}: any) => {
 
      // Xử lý các sự kiện PRESS (1) và ACTION_PRESS (2 hoặc 3 tùy phiên bản)
      if (
        type === EventType.PRESS ||
        type === 2 ||
        type === EventType.ACTION_PRESS
      ) {
        const {data} = detail.notification;
        const {pressAction} = detail;
        // console.log(type,EventType.ACTION_PRESS,pressAction?.id,navigationRef.isReady(),data?.type)
        // Trường hợp nhấn trực tiếp (type === 1) hoặc nhấn nút "Nhận" (type === 2 hoặc 3 với accept_call)
        if (
          (type === EventType.PRESS || // Nhấn trực tiếp
            ((type === 2 || type === EventType.ACTION_PRESS) &&
              pressAction?.id === 'accept_call')) && // Nhấn nút "Nhận"
          data?.type === 'video_call'
        ) {
          if (navigationRef.isReady()) {
            try {
              const navigationData = {
                caller: JSON.parse(data.caller),
                roomId: data.roomId,
                participants: JSON.parse(data.participants),
                isOnpenCamera: false,
                isCaller: false,
                status: 'accept_call',
              };

              navigationRef.navigate('CommingVideoCall', navigationData);
            } catch (err) {
              console.log('lỗi điều hướng', err);
            }
          }

          // Hủy thông báo sau khi xử lý
          if (detail.notification?.id) {
            await notifee.cancelNotification(detail.notification.id);
          }
        }
        // Trường hợp nhấn nút "Từ chối"
        else if (
          (type === 2 || type === EventType.ACTION_PRESS) &&
          pressAction?.id === 'reject_call'
        ) {
          if (detail.notification?.id) {
            await notifee.cancelNotification(detail.notification.id);
          }
          try {
            const navigationData = {
              caller: JSON.parse(data.caller),
              roomId: data.roomId,
              nameCall: data.callerName,
              isOnpenCamera: false,
              participants: JSON.parse(data.participants),
              isCaller: false,
              status: 'reject',
            };
            navigationRef.navigate('CommingVideoCall', navigationData);
          } catch (err) {
            console.log('lỗi điều hướng', err);
          }
        }
      } else if (type === EventType.DELIVERED) {
        console.log('Notification delivered, no action required:', type);
      } else {
        console.log('Ignored event type:', type);
      }
    };

    const handleIncomingCall = async (remoteMessage: any) => {
      try {
        const {data} = remoteMessage;
        if (!data) throw new Error('No data in message');

        const {roomId, callerName} = data;
        if (!roomId) {
          throw new Error('Missing required fields');
        }

        //   // Hiển thị cả CallKeep và Notifee
        //  RNCallKeep.displayIncomingCall(
        //     roomId,
        //     callerName,
        //     callerName,
        //     'generic',
        //     true
        //   );

        await notifee.displayNotification({
          id: roomId,
          title: `Cuộc gọi từ ${callerName}`,
          body: 'Nhấn để trả lời',
          data: {...data, type: 'video_call'},
          android: {
            channelId: 'incoming_call',
            importance: AndroidImportance.HIGH,
            sound: 'ringtone',
            vibrationPattern: [300, 500],
            fullScreenAction: {
              id: 'default',
              launchActivity: 'com.metachat.MainActivity',
            },
            actions: [
              {
                title: 'Nhận',
                pressAction: {
                  id: 'accept_call',
                  launchActivity: 'com.metachat.MainActivity',
                },
              },
              {
                title: 'Từ chối',
                pressAction: {id: 'reject_call'},
              },
            ],
          },
          ios: {
            sound: 'ringtone.wav',
            categoryId: 'incoming_call',
            interruptionLevel: 'timeSensitive',
          },
        });
      } catch (error) {
        console.error('Error handling call:', error);
      }
    };

    const initialize = async () => {
       await setupCallKeep();

      // Tạo notification channel
      await notifee.createChannel({
        id: 'incoming_call',
        name: 'Cuộc gọi đến',
        importance: AndroidImportance.HIGH,
        sound: 'ringtone',
        vibration: true,
        vibrationPattern: [300, 500],
      });

      // Xử lý thông báo khi app khởi động
      notifee.getInitialNotification().then(initialNotification => {
        if (initialNotification) {
          handleNotificationPress({
            type: EventType.PRESS,
            detail: initialNotification,
          });
        }
      });

      // Đăng ký listeners
      const unsubscribeForegroundEvent = notifee.onForegroundEvent(
        handleNotificationPress,
      );
      notifee.onBackgroundEvent(handleNotificationPress);
      const unsubscribeForegroundMessage =
        messaging().onMessage(handleIncomingCall);
      messaging().setBackgroundMessageHandler(handleIncomingCall);
      const unsubscribeBackgroundEvent = () => {
        console.log('Unsubscribed from background events');
      };
      return () => {
        unsubscribeForegroundEvent();
        unsubscribeBackgroundEvent();
        unsubscribeForegroundMessage();
        RNCallKeep.removeEventListener('answerCall');
        RNCallKeep.removeEventListener('endCall');
      };
    };

    initialize().catch(console.error);
  }, []);

  return null;
};

export default AppDeep;
