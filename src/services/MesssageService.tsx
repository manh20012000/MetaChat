import { postFormData, putData } from './resfull_api';
import { API_ROUTE } from './api_enpoint';
import { Message_type } from '../types/home_type/Chat_type';
import Conversation from '../types/home_type/Converstation_type';
import { GiftedChat } from 'react-native-gifted-chat';
import useCheckingService from './Checking_service';
import { updateMessage } from '../cache_datas/exportdata.ts/converstation_cache';
import userMessage from '../types/home_type/useMessage_type';

export const updateMessageReaction = async (
  message: Message_type,
  conversation: Conversation,
  userChat: userMessage,
  deviceInfo: string,
  Checking: any,
) => {
  try {
    const { user, dispatch } = Checking;
    const response = await putData(
      API_ROUTE.UPDATE_MESSAGE,
      {
        conversation: conversation,
        send_id: userChat.user_id,
        message: message,
        deviceSend: deviceInfo
      },
      { dispatch, user },
      message._id,
    );

    if (response.status === 200) {
      const failedMessage: Message_type = { ...message, statusSendding: true };
      updateMessage(failedMessage, conversation);
    } else {
      throw new Error('Cập nhật phản ứng thất bại');
    }
  } catch (error) {
    console.log('câp nhât thất baik');
    const failedMessage: Message_type = { ...message, statusSendding: false };
    updateMessage(failedMessage, conversation);
  }
};
