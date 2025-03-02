import { Message_type } from "../../type/Home/Chat_type";
import userMessage from "../../type/Home/useMessage_type";
import Conversation from "../../type/Home/Converstation_type";
import { putData } from "../../service/resfull_api";
import { delete_converStation, deleteMessage } from "../../cache_data/exportdata.ts/converstation_cache";
import { API_ROUTE } from "../../service/api_enpoint";

export const hanldlerPin = async (message: Message_type, user: userMessage,) => {
    
    
}
export const handlerDelete = async (message: any, user: userMessage | null, conversation:Conversation | null,checking:any) => {
    if (message && user && conversation) { 
        if (conversation.messages.length === 1) {
            delete_converStation(conversation, checking);
        } else {
            deleteMessage(conversation._id, message._id)
            try {
                putData(API_ROUTE.DELATE_MESSAGE,message,checking,message._id) 
            } catch (err) {
                console.log(err);   
            }
    }
    

    }

}

export const handlerRecall = async(message: Message_type | null, user: userMessage | null, conversation: Conversation | null) => {


}
