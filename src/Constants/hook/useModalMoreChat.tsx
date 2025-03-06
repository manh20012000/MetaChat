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
    setMessageMoreAction: React.Dispatch<React.SetStateAction<Message_type | null>>,
    handlerDeleteMessage: (message: any) => void,
) => {
    const color = useSelector((state: any) => state.colorApp.value);
    const [modalVisible, setModalVisible] = useState(true);
    const [notifiModalVisible, setNotifiModalVisible] = useState<boolean>(true);
    const [selectedOption, setSelectedOption] = useState<string>("");
    const { user, dispatch } = useCheckingService()
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
                console.log('nhảy xuống deleet')
                const message =
                {
                    ...messageMoreAction,
                    receiver: messageMoreAction?.receiver?.filter((id: string) => id !== userChat?.user_id) || [],
                }
                console.log(message.receiver)
                handlerDeleteMessage(message)
                handlerDelete(message, userChat, conversation, { user, dispatch });
            } else if (selectedOption === "Recall") {
                const message = {
                    ...messageMoreAction,
                    receiver: [],
                    recall: true,
                };
                handlerDeleteMessage(message)
             handlerRecall(message, userChat, conversation, { user, dispatch });
            }


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
        handleConfirmation,
        color
    };
};

export default useModalMoreChat;