// NotificationHandler.js
import notifee, { AndroidImportance } from '@notifee/react-native';
import { navigationRef } from '../navigation/navigation';
import messaging from '@react-native-firebase/messaging';

export async function handleBackgroundNotification(remoteMessage) {
  const { data, notification } = remoteMessage;

  if (!data || !data.type) return;

  if (data.type === 'message') {
    await notifee.displayNotification({
      title: notification?.title || 'New message',
      body: notification?.body || '',
      android: {
        channelId: 'default_channel_id',
        importance: AndroidImportance.HIGH,
        actions: [
          { title: 'Like', pressAction: { id: 'like' } },
          { title: 'Reply', pressAction: { id: 'reply' } },
        ],
      },
      data: {
        type: 'message',
        screen: data.screen,
        roomId: data.roomId,
      },
    });
  } else if (data.type === 'call') {
    await notifee.displayNotification({
      title: notification?.title || 'Incoming Call',
      body: notification?.body || 'Someone is calling you...',
      android: {
        channelId: 'call_channel_id',
        importance: AndroidImportance.HIGH,
        actions: [
          { title: 'Accept', pressAction: { id: 'accept' } },
          { title: 'Decline', pressAction: { id: 'decline' } },
        ],
      },
      data: {
        type: 'call',
        roomId: data.roomId,
        screen: 'VideoCallScreen',
      },
    });
  }
}

// Xử lý khi người dùng nhấn vào hành động (action) trong thông báo
notifee.onBackgroundEvent(async ({ type, detail }) => {
  const { pressAction, notification } = detail;

  if (type === 1 && pressAction?.id) {
    const screen = notification?.data?.screen;
    const roomId = notification?.data?.roomId;

    // if (pressAction.id === 'like') {
    //   console.log('User liked the message');
    // } else if (pressAction.id === 'reply') {
    //     navigationRef.navigate(screen, { roomId });
    // } else if (pressAction.id === 'accept') {
    //     navigationRef.navigate(screen, { roomId });
    // } else if (pressAction.id === 'decline') {
    //   console.log('Call declined');
    // }
  }
});
