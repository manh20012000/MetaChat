import React, { useState } from "react";
import { handlerDelete, handlerRecall } from "./utilsHandlerMoreChat";
import { Message_type } from "../../type/Home/Chat_type";
import userMessage from "../../type/Home/useMessage_type";
import Conversation from "../../type/Home/Converstation_type";
import { useSelector } from "react-redux";
import useCheckingService from "../../service/Checking_service";

const useModalMoreChat = (
    userChat: userMessage | null,
    conversation: Conversation | null,
    messageMoreAction: Message_type | null,
    setMessageMoreAction: React.Dispatch<React.SetStateAction<Message_type | null>>
) => {
    const color = useSelector((state: any) => state.colorApp.value);
    const [modalVisible, setModalVisible] = useState(true);
    const [notifiModalVisible, setNotifiModalVisible] = useState<boolean>(true);
    const [selectedOption, setSelectedOption] = useState<string>("");
    const { user,dispatch} = useCheckingService()
    const handlerMoreMessage = async (index: number) => {
        if (index === 3) {
            setNotifiModalVisible(false);
            setSelectedOption("Delete");
        } else if (index === 5) {
            setNotifiModalVisible(false);
            setSelectedOption("Recall");
        }
    };

    const handleConfirmation = (confirmed: boolean) => {
            
        if (confirmed) {
            if (selectedOption === "Delete") {
              
                const message = 
                    {
                    ...messageMoreAction,
                    reciver: messageMoreAction?.reciver?.filter((id: string) => id !== userChat?.user_id) || [],
                    
                
                }
                handlerDelete(message, userChat, conversation, { user, dispatch });
            };

                  
        } else if (selectedOption === "Recall") {
            // if (messageMoreAction?.reciver?.length > 0) {
            //     const message = {
            //         ...messageMoreAction,
            //         reciver: messageMoreAction.reciver.filter((id: string) => id !== userChat?.user_id),
            //     };
            //     handlerRecall(message, userChat, conversation);
            // } else {
            //     const message = {
            //         ...messageMoreAction,
            //         reciver: [],
            //     };
            //     handlerRecall(message, userChat, conversation);
            // }
        }
        setNotifiModalVisible(true);
        setModalVisible(false);
        setMessageMoreAction(null);

    }
    return {
        modalVisible,
        setModalVisible,
        toggleModal: () => {
            setModalVisible(!modalVisible);
            setMessageMoreAction(null);
        },
        handlerMoreMessage,
        notifiModalVisible,
        selectedOption,
        handleConfirmation, color
    };
};

export default useModalMoreChat;