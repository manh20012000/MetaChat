import {Message_type} from '../../type/Home/Chat_type';
import userMessage from '../../type/Home/useMessage_type';
import Conversation from '../../type/Home/Converstation_type';
import {putData} from '../../service/resfull_api';
import {
  delete_converStation,
  deleteMessage,
  deleteMessageError,
  recallMessage,
} from '../../cache_data/exportdata.ts/converstation_cache';
import {API_ROUTE} from '../../service/api_enpoint';
import {response} from '../../type/response_type';

export const hanldlerPin = async (
  message: Message_type,
  user: userMessage,
) => {};
export const handlerDelete = async (
  message: Message_type,
  user: userMessage | null,
  conversation: Conversation | null,
  checking: any,
) => {
  if (message && user && conversation) {
    if (
      conversation.messages.length === 1 &&
      conversation.messageError.length === 0
    ) {
   
      delete_converStation(conversation, checking);
    } else {
   
      if (message.statusSendding === null || message.statusSendding === false) {
        deleteMessageError(conversation._id, message._id);
        return null;
      } else {
        deleteMessage(conversation._id, message._id);
        try {
          const response = await putData(
            API_ROUTE.DELATE_MESSAGE,
            {message, conversation},
            checking,
            message._id,
          );
          if (response.code) {
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
    }
  }
};
export const handlerRecall = async (
  message: any | null,
  user: userMessage | null,
  conversation: Conversation | null,
  checking: any,
) => {
  if (message && user && conversation) {
    console.log('gỡ luôn tin nhắn ');
    try {
      if (message.statusSendding === null || message.statusSendding === false) {
        deleteMessageError(conversation._id, message._id);
        return null;
      } else {
        deleteMessage(conversation._id, message._id);
        recallMessage(conversation._id, message._id);
        putData(
          API_ROUTE.RECALL_MESSAGE,
          {message, conversation},
          checking,
          message._id,
        );
      }
    } catch (err) {
      console.log(err);
      return;
    }
  }
};
