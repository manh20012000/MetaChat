import { Message_type } from '../../../../types/home_type/Chat_type';
import userMessage from '../../../../types/home_type/useMessage_type';
import Conversation from '../../../../types/home_type/Converstation_type';
import { putData } from '../../../../services/resfull_api';
import {
  delete_converStation,
  deleteMessage,
  deleteMessageError,
  recallMessage,
} from '../../../../cache_datas/exportdata.ts/converstation_cache';
import { API_ROUTE } from '../../../../services/api_enpoint';
import { response } from '../../../../types/response_type';

export const hanldlerPin = async (
  message: Message_type,
  user: userMessage,
) => { };
export const handlerDelete = async (
  message: any,
  user: userMessage | null,
  conversation: Conversation | null,
  checking: any,
  deviceSend: string
) => {
  if (message && user && conversation) {
    // if (
    //   conversation.messages.length === 1 &&
    //   conversation.messageError.length === 0
    // ) {
    //   delete_converStation(conversation, checking);
    // } else {
    // if (message.statusSendding === null || message.statusSendding === false) {
    //   deleteMessageError(conversation._id, message._id);
    //   return null;
    // } else {
    // deleteMessage(conversation._id, message._id);
    try {
      const response = await putData(
        API_ROUTE.DELATE_MESSAGE,
        { message, conversation, deviceSend },
        checking,
        message._id,
      );
      if (response.code) {
        return {
          status: true,
          message: ' nhắn tin thành công',
          data: null,
          code: 0,
        };
      }
    } catch (err) {
      console.log(err);
      return {
        status: false,
        message: ' nhắn thất bại',
        data: null,
        code: 0,
      };
    }
  }
};
// };
// };
export const handlerRecall = async (
  message: any | null,
  user: userMessage | null,
  conversation: Conversation | null,
  checking: any,
  deviceInfo: string
) => {
  if (message && user && conversation) {
    try {
      // if (message.statusSendding === null || message.statusSendding === false) {
      //   deleteMessageError(conversation._id, message._id);
      //   return null;
      // } else {
      //   deleteMessage(conversation._id, message._id);
      //   recallMessage(conversation._id, message._id);
      const response = await putData(
        API_ROUTE.RECALL_MESSAGE,
        { message, conversation, deviceSend: deviceInfo },
        checking,
        message._id,
      );
      if (response.code) {
        return {
          status: true,
          message: ' nhắn tin thành công',
          data: null,
          code: 0,
        };
      }
    } catch (err) {
      console.log(err);
      return {
        status: false,
        message: ' nhắn thất bại',
        data: null,
        code: 0,
      };
    }
  }
};
