import { BSON } from "realm";
import { Message_type } from "../../type/Home/Chat_type";
import Conversation from "../../type/Home/Converstation_type";
import userMessage from "../../type/Home/useMessage_type";
export const renderCreateMessage= (message:Message_type,conversation:Conversation,userChat:userMessage) => {

    return {
        _id: new BSON.ObjectId().toString(),
        conversation_id: conversation._id,
        user: userChat,
        messageType:message.messageType,
        text: message.text,

        attachments: [],
        callDetails:null,
        createdAt: message.createdAt,
        reactions: [],
        receiver: conversation.participantIds,
        isRead: [],
        replyTo:{},
        recall:false
      };

}