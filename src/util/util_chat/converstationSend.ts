
import { Message_type } from '../../type/Home/Chat_type';
import Conversation from '../../type/Home/Converstation_type';


export const converstationsend = async (
  message: Message_type,
  filesOrder: any,
  userChat: any,
  deviceSend:string,
  conversation: Conversation,

) => {
  return  {
    user: {
      _id: userChat._id,
      name: userChat.name,
      avatar: userChat.avatar,
      user_id: userChat.user_id,
      role: userChat.role,
      action_notifi: userChat.action_notifi,
      status_read: userChat.status_read,
    },
    conversation: {
      _id: conversation._id,
      participants: conversation.participants,
      roomName: conversation.roomName,
      background: conversation.background,
      color: conversation.color,
      icon: conversation.icon,
      avatar: conversation.avatar,
      participantIds: conversation.participantIds,
      permission: conversation.permission,
      isDeleted: conversation.isDeleted,
    },
    deviceSend,
    message,
    filesOrder,
  };
};
