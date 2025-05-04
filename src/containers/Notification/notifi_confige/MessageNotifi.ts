import notifee, { AndroidStyle, EventType } from '@notifee/react-native';
import { navigationRef } from '../../../navigation/navigation';

export const handleMessageNotification = async (remoteMessage: any) => {

  const {data,notification} = remoteMessage;
  if (!data) throw new Error('No data in message');

  const {roomId} = data;
  if (!roomId) {
    throw new Error('Missing required fields');
  }
  await notifee.displayNotification({
    id:` msg_${Date.now()}`,
    title: notification?.title || 'Tin nhắn mới',
    body: notification?.body || '',
    data,
    android: {
      channelId: data.channelId,
      smallIcon: 'ic_message',
      style: {
        type: AndroidStyle.BIGTEXT,
        text: notification?.body || ''
      },
      actions: [
        {
          title: '👍 Like',
          pressAction: { id: 'like_message' }
        },
        {
          title: '💬 Reply',
          pressAction: { id: 'reply_message' },
          input: {
            placeholder: 'Nhập phản hồi...'
          }
        }
      ]
    }
  });
};

export const handleMessageNotificationPress = ({ type, detail }: any) => {
  if (type === EventType.ACTION_PRESS) {
    const { pressAction, notification } = detail;
    const { data } = notification;
    
    switch (pressAction.id) {
      case 'like_message':
        console.log('Like message:', data.messageId);
        break;
      case 'reply_message':
        console.log('Reply with:', detail.input);
        break;
    }
  }
};