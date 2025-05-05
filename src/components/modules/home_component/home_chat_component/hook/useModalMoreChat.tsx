import React, { useState } from 'react';
import { handlerDelete, handlerRecall } from './utilsHandlerMoreChat';
import { Message_type } from '../../../../../types/home_type/Chat_type';
import userMessage from '../../../../../types/home_type/useMessage_type';
import Conversation from '../../../../../types/home_type/Converstation_type';
import { useSelector } from 'react-redux';
import useCheckingService from '../../../../../services/Checking_service';

const useModalMoreChat = (
  userChat: userMessage | null,
  conversation: Conversation | null,
  messageMoreAction: Message_type | null,
  setMessageMoreAction: React.Dispatch<
    React.SetStateAction<Message_type | null>
  >,
  handlerDeleteMessage: (message: any) => void,
) => {
  const color = useSelector((state: any) => state.colorApp.value);
  const deviceInfo = useSelector((value: { deviceInfor: { value: any } }) => value.deviceInfor.value)
  const [modalVisible, setModalVisible] = useState(true);
  const [notifiModalVisible, setNotifiModalVisible] = useState<boolean>(true);
  const [selectedOption, setSelectedOption] = useState<string>('');
  const { user, dispatch } = useCheckingService();
  const handlerMoreMessage = async (index: number) => {
    if (index === 3) {
      setNotifiModalVisible(false);
      setSelectedOption('Delete');
    } else if (index === 5) {
      setNotifiModalVisible(false);
      setSelectedOption('Recall');
    }
  };

  const handleConfirmation = (confirmed: boolean) => {
    if (confirmed) {
      if (selectedOption === 'Delete') {
        console.log('thuc hieenj xoa messsage0')
        const message = {
          ...messageMoreAction,
          receiver:
            messageMoreAction?.receiver?.filter(
              (id: string) => id !== userChat?.user_id,
            ) || [],
        };
        handlerDeleteMessage(message); //này xóa cho việc thực hiện hiển thị giftedchat
        handlerDelete(message, userChat, conversation, { user, dispatch }, deviceInfo); // thực hiện xóa với api
      } else if (selectedOption === 'Recall') {
        const message = {
          ...messageMoreAction,
          receiver: [],
          recall: true,
        };
        handlerDeleteMessage(message);
        handlerRecall(message, userChat, conversation, { user, dispatch }, deviceInfo,);
      }
    }
    setNotifiModalVisible(true);
    setModalVisible(false);
    setMessageMoreAction(null);
  };
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
    color,
  };
};

export default useModalMoreChat;
