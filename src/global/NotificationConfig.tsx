import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance, EventType, Notification, AndroidAction } from '@notifee/react-native';
import { navigationRef } from '../navigation/navigation';
import { NotificationConfig, notificationType } from '../type/notification_type';

// Cấu hình thông báo
const notificationConfigs: any = {
  // Dùng any vì bạn không muốn type chặt chẽ
  // Nên cân nhắc Record<typeof notificationType[keyof typeof notificationType], NotificationConfig>
  [notificationType.NOTIFI_VIDEO_CALL]: {
    channelId: 'incoming_video_call',
    channelName: 'Cuộc gọi video đến',
    importance: AndroidImportance.HIGH,
    sound: 'ringtone',
    vibration: true,
    vibrationPattern: [300, 500],
    actions: [
      {
        title: 'Nhận',
        pressAction: { id: 'accept_call', launchActivity: 'com.metachat.MainActivity' },
      },
      { title: 'Từ chối', pressAction: { id: 'reject_call' } },
    ],
    iosCategoryId: 'incoming_call',
  },
  [notificationType.NOTIFI_MESSAGE]: {
    channelId: 'message',
    channelName: 'Tin nhắn mới',
    importance: AndroidImportance.HIGH,
    sound: 'default',
    vibration: true,
    vibrationPattern: [300, 500],
    actions: [
      {
        title: 'Trả lời',
        pressAction: { id: 'reply_message' },
      },
    ],
    iosCategoryId: 'message',
  },
};

// Tạo notification channels
const createNotificationChannels = async (): Promise<void> => {
  for (const type of Object.keys(notificationConfigs)) {
    const config = notificationConfigs[type];
    await notifee.createChannel({
      id: config.channelId,
      name: config.channelName,
      importance: config.importance,
      sound: config.sound,
      vibration: config.vibration,
      vibrationPattern: config.vibrationPattern,
    });
  }

  // Channel riêng cho reply
  await notifee.createChannel({
    id: 'message_reply',
    name: 'Trả lời tin nhắn',
    importance: AndroidImportance.HIGH,
  });
};

// Xử lý sự kiện nhấn thông báo
const handleNotificationPress = async ({ type, detail }: any) => {
  if (
    type === EventType.PRESS ||
    type === EventType.ACTION_PRESS ||
    type === 2 // Hỗ trợ phiên bản cũ
  ) {
    const { data, id } = detail.notification || {};
    const { pressAction, input } = detail;

    if (!data?.type) return;

    if (data.type === notificationType.NOTIFI_VIDEO_CALL) {
      if (
        type === EventType.PRESS ||
        (type === EventType.ACTION_PRESS && pressAction?.id === 'accept_call')
      ) {
        if (navigationRef.isReady()) {
          try {
            const navigationData = {
              caller: JSON.parse(data.caller),
              roomId: data.roomId,
              participants: JSON.parse(data.participants),
              isOnpenCamera: true,
              isCaller: false,
              status: 'accept_call',
            };
            navigationRef.navigate('CommingVideoCall', navigationData);
          } catch (err) {
            console.log(`Lỗi điều hướng ${data.type}:`, err);
          }
        }
      } else if (type === EventType.ACTION_PRESS && pressAction?.id === 'reject_call') {
        try {
          const navigationData = {
            caller: JSON.parse(data.caller),
            roomId: data.roomId,
            nameCall: data.callerName,
            isOnpenCamera: true,
            participants: JSON.parse(data.participants),
            isCaller: false,
            status: 'reject',
          };
          navigationRef.navigate('CommingVideoCall', navigationData);
        } catch (err) {
          console.log(`Lỗi điều hướng reject ${data.type}:`, err);
        }
      }
    } else if (data.type === notificationType.NOTIFI_MESSAGE) {
      if (type === EventType.PRESS) {
        if (navigationRef.isReady()) {
          try {
            navigationRef.navigate('ChatScreen', {
              conversationId: data.conversationId,
               userId: data.userId,
            });
          } catch (err) {
            console.log('Lỗi điều hướng message:', err);
          }
        }
      } else if (type === EventType.ACTION_PRESS && pressAction?.id === 'reply_message' && input) {
        console.log('Reply message:', input, 'to conversation:', data.conversationId);
        // TODO: Gọi API gửi tin nhắn
        // await sendMessageAPI(data.conversationId, input, data.userId);
      }
    } else {
      console.log('Unknown notification type:', data.type);
    }

    if (id) {
      await notifee.cancelNotification(id);
    }
  } else if (type === EventType.DELIVERED) {
    console.log('Notification delivered:', type);
  } else {
    console.log('Ignored event type:', type);
  }
};

// Hiển thị thông báo
const handleNotificationDisplay = async (remoteMessage: any) => {
  try {
    const { data } = remoteMessage;
    if (!data?.type) {
      console.log('No notification type provided');
      return;
    }

    const config = notificationConfigs[data.type];

    if (!config) {
      console.log('Unsupported notification type:', data.type);
      return;
    }

    const notification: Notification = {
      id: data.roomId || data.id || `${data.type}_${Date.now()}`,
      title:
        data.type === notificationType.NOTIFI_VIDEO_CALL
          ? `Cuộc gọi video từ ${data.callerName || data.senderName || 'Người gọi'}`
          : `${data.senderName || 'Người gửi'}: ${data.body || 'Bạn có tin nhắn mới'}`,
      body:
        data.type === notificationType.NOTIFI_VIDEO_CALL
          ? 'Nhấn để trả lời'
          : data.body || 'Bạn có tin nhắn mới',
      data: { ...data },
      android: {
        channelId: config.channelId,
        importance: config.importance,
        sound: config.sound,
        vibrationPattern: config.vibrationPattern,
        actions:
          data.type === notificationType.NOTIFI_MESSAGE
            ? [
                {
                  title: 'Trả lời',
                  pressAction: { id: 'reply_message' },
                  input: {
                    placeholder: 'Nhập tin nhắn...',
                  },
                } as AndroidAction,
              ]
            : config.actions,
        fullScreenAction:
          data.type === notificationType.NOTIFI_VIDEO_CALL
            ? { id: 'default', launchActivity: 'com.metachat.MainActivity' }
            : undefined,
      },
      ios: {
        sound: config.sound ? `${config.sound}.wav` : undefined,
        categoryId: config.iosCategoryId,
        interruptionLevel:
          data.type === notificationType.NOTIFI_VIDEO_CALL ? 'timeSensitive' : 'active',
      },
    };

    await notifee.displayNotification(notification);
  } catch (error) {
    console.error('Error displaying notification:', error);
  }
};

// Khởi tạo thông báo
export const initializeNotifications = () => {
  // Tạo channels và categories
  createNotificationChannels().then(() => {
    // Cấu hình categories cho iOS
    notifee.setNotificationCategories([
      {
        id: 'message',
        actions: [
            {
              id: 'reply_message',
              title: 'Trả lời',
            //   input: {
            //     buttonTitle: 'Gửi', 
            //   },
            },
          ],
      },
      {
        id: 'incoming_call',
        actions: [
          { id: 'accept_call', title: 'Nhận' },
          { id: 'reject_call', title: 'Từ chối', destructive: true },
        ],
      },
    ]);
  });

  // Xử lý thông báo khi app khởi động
  notifee.getInitialNotification().then((initialNotification) => {
    if (initialNotification) {
      handleNotificationPress({
        type: EventType.PRESS,
        detail: initialNotification,
      });
    }
  });

  // Đăng ký listeners
  const unsubscribeForegroundEvent = notifee.onForegroundEvent(handleNotificationPress);
  notifee.onBackgroundEvent(handleNotificationPress);
  const unsubscribeForegroundMessage = messaging().onMessage(handleNotificationDisplay);
  messaging().setBackgroundMessageHandler(handleNotificationDisplay);

  // Trả về cleanup function
  return () => {
    unsubscribeForegroundEvent();
    unsubscribeForegroundMessage();
  };
};