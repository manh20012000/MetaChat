import {Message_type} from '../../types/Chat_type';
import {getConversations} from '../../cache_datas/exportdata.ts/converstation_cache';

const HandlerSendMessage = (data: any) => {
  const {user, participateId, message, conversation, filesOrder} = data;
  return {
    sender: user,
    message: message,
    convertdata: {
      _id: conversation._id,
      roomName: conversation.roomName,
      avatar: conversation.avatar,
      color: conversation.color,
      icon: conversation.icon,
      background: conversation.background,
      participateId: participateId,
    },
  };
};

export default HandlerSendMessage;
