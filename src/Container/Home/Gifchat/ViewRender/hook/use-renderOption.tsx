import React, {useCallback} from 'react';
import {useSelector} from 'react-redux';
import {Message_type} from '../../../../../type/Home/Chat_type';
import Conversation from '../../../../../type/Home/Converstation_type';
import userMessage from '../../../../../type/Home/useMessage_type';

const useUserRenderOption = (
  userChat: userMessage,
  conversation: Conversation,
  selectedMessages: Message_type, // Use the defined type
  setMessageMoreAction: React.Dispatch<
    React.SetStateAction<Message_type | null>
  >,
  setSelectedMessages: React.Dispatch<
    React.SetStateAction<Message_type | null>
  >,
) => {
  const user = useSelector((state: any) => state.auth.value);
  const issendMessage = useCallback(() => {
    return user._id === selectedMessages.user.user_id;
  }, []);

  const handlerMore = useCallback(() => {
    setSelectedMessages(null);
    setMessageMoreAction(selectedMessages);
  }, []);

  return {
    handlerMore,
    issendMessage,
  };
};
export default useUserRenderOption;
