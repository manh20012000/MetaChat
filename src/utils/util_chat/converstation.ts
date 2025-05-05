import {Message_type} from '../../types/home_type/Chat_type';
import Conversation from '../../types/home_type/Converstation_type';

export const converstation = (
  conversation: Conversation,
  messages: Message_type,
) => {
  return {
    _id: conversation._id,
    roomName: conversation.roomName,
    avatar: conversation.avatar,
    participants: conversation.participants,
    color: conversation.color,
    icon: conversation.icon,
    background: conversation.background,
    participantIds: conversation.participantIds,
    messages: [messages],
    lastmessage: messages,
    updatedAt: messages.createdAt,
    permission: conversation.permission,
    isDeleted: conversation.isDeleted,
  };
};
