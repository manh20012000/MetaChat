import notifee, {AndroidImportance, EventType} from '@notifee/react-native';
import {navigationRef} from '../../../navigation/navigation';
import HandlerReciverVideoCall from '../../../constants/func_utils/handler_incomming_videocall';
import {
  CallNotifiButton,
  CallStatus,
  VIDEO_CALL_TYPE,
} from '../../../constants/type_constants/type_notifi';

import {getCallStatus} from '../../../localstorages/Callstatus';
export const handleVideoCallNotification = async (remoteMessage: any) => {
  try {
    const {data} = remoteMessage;
    if (!data) throw new Error('No data in message');
    const {callerName,converstationVideocall,caller}=data
    const dataconver=JSON.parse(converstationVideocall);
    const {roomId} =dataconver;
    if (!roomId) {
      throw new Error('Missing required fields');
    }

    await notifee.displayNotification({
      id: roomId,
      title: `Cuộc gọi từ ${callerName}`,
      body: 'Nhấn để trả lời',
      data: {...data, type: VIDEO_CALL_TYPE},
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
            icon: 'ic_accept',
            pressAction: {
              id: CallNotifiButton.ACCEPT,
              launchActivity: 'com.metachat.MainActivity',
            },
          },
          {
            title: 'Từ chối',
            icon: 'ic_reject',
            pressAction: {id: CallNotifiButton.REJECT},
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

export const handleVideoCallNotificationPress = async ({type, detail}: any) => {
  const callStatus = await getCallStatus(); // thực hiện lấy ở localstorange
  if (type === EventType.DELIVERED) {
    return; // Dừng lại, không tiếp tục xử lý nữa
  }

  const {data} = detail.notification;
  const {pressAction} = detail;

  console.log(EventType.PRESS, type, EventType.ACTION_PRESS, pressAction?.id);

  if (data?.type !== VIDEO_CALL_TYPE) {
    return; // Không phải notification cuộc gọi thì bỏ qua
  }

  if (
    type === EventType.ACTION_PRESS &&
    pressAction?.id &&
    data?.type === VIDEO_CALL_TYPE
  ) {
    if (pressAction?.id === CallNotifiButton.ACCEPT) {
      HandlerReciverVideoCall(data,  true, CallNotifiButton.ACCEPT);
      if (detail.notification?.id) {
        await notifee.cancelNotification(detail.notification.id);
      }
    } else if (pressAction?.id === CallNotifiButton.REJECT) {
      HandlerReciverVideoCall(data, false, CallNotifiButton.REJECT);
      if (detail.notification?.id) {
        await notifee.cancelNotification(detail.notification.id);
      }
    } else if (!pressAction?.id && type === EventType.PRESS) {
      HandlerReciverVideoCall(data, true, CallNotifiButton.COMMING);

      if (detail.notification?.id) {
        await notifee.cancelNotification(detail.notification.id);
      }
    }
  }
};
