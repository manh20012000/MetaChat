import { Message_interface } from "../../interface/Chat_interface";
import { getConversations } from "../../cache_data/exportdata.ts/chat_convert_datacache";
 

const HandlerSendMessage = (data: any) => {
  const {user, participateId,message, conversation, filesOrder} = data;
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