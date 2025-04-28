import messaging from '@react-native-firebase/messaging';
import notifee, {EventType} from '@notifee/react-native';
import {
  handleMessageNotification,
  handleMessageNotificationPress,
} from '../Container/Notification/NotifeConfige/MessageNotifi';
import {
  handleVideoCallNotificationPress,
  handleVideoCallNotification,
} from '../Container/Notification/NotifeConfige/VideoCallNotif';
// import {createNotificationChannels} from '../confige/NotificationConfige';
import HandlerIncommingVideoCall from '../Constants/HandlerInCommingVideoCall';

import {
  CallNotifiButton,
  MESSAGE_TYPE,
  VIDEO_CALL_TYPE,
} from '../Constants/type_constants/type_notifi';

export const handleBackgroundNotification = async (remoteMessage: any) => {
  const {data} = remoteMessage;

  if (data?.type === MESSAGE_TYPE) {
    await handleMessageNotification(remoteMessage);
  } else if (data?.type === VIDEO_CALL_TYPE) {
    HandlerIncommingVideoCall(data, false, CallNotifiButton.COMMING);
    await handleVideoCallNotification(remoteMessage);
  }
};

export const handleNotificationPress = async ({type, detail}: any) => {
  const {notification} = detail;

  if (notification.data?.type === MESSAGE_TYPE) {
    handleMessageNotificationPress({type, detail});
  } else if (notification.data?.type === VIDEO_CALL_TYPE) {
    handleVideoCallNotificationPress({type, detail});
  }
};

export const initializeNotifications = async () => {
  await messaging().requestPermission();
  // createNotificationChannels().then(() => {
  //   notifee.setNotificationCategories([
  //     {
  //       id: 'incoming_call',
  //       actions: [
  //         {id: 'accept_call', title: 'Nhận'},
  //         {id: 'reject_call', title: 'Từ chối', destructive: true},
  //       ],
  //     },
  //     {
  //       id: 'incoming_message',
  //       actions: [
  //         {id: 'like_message', title: '👍 Like'},
  //         {id: 'reply_message', title: '💬 Reply', input: {}},
  //       ],
  //     },
  //   ]);
  // });

  notifee.getInitialNotification().then(initialNotification => {
    if (initialNotification) {
      handleNotificationPress({
        type: EventType.PRESS,
        detail: initialNotification,
      });
    }
  });

  // Foreground event của notifee (khi user tương tác với thông báo đang hiện)
  const unsubscribeForegroundEvent = notifee.onForegroundEvent(
    handleNotificationPress,
  );

  // Background event của notifee
  notifee.onBackgroundEvent(handleNotificationPress);

  // Xử lý khi app đang foreground (tin nhắn đến khi app mở)
  const unsubscribeForegroundMessage = messaging().onMessage(
    async remoteMessage => {
      await handleBackgroundNotification(remoteMessage);
    },
  );

  // Xử lý khi app background/quit
  messaging().setBackgroundMessageHandler(handleBackgroundNotification); // Chỉ set 1 lần duy nhất!!
  const unsubscribeBackgroundEvent = () => {
    console.log('Unsubscribed from background events');
  };
  return () => {
    unsubscribeForegroundEvent();
    unsubscribeForegroundMessage();
    unsubscribeBackgroundEvent();
  };
};
