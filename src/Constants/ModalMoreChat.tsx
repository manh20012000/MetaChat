import React from 'react';
import {Modal, View, Text} from 'react-native';
import userMessage from '../type/Home/useMessage_type';
import Conversation from '../type/Home/Converstation_type';
import {Message_type} from '../type/Home/Chat_type';
import RenderOptionMessage from '../Screen/Component/Gifchat/RenderOptionMessage';
import {ReactionIcons} from '../Screen/Component/Gifchat/ViewRender/ReactionIcons';
type modelType = {
  userChat: userMessage;
  conversation: Conversation;
  messageMoreAction: Message_type|null;
  setMessageMoreAction:React.Dispatch<React.SetStateAction<any>>
 
};
const ModalChatMore: React.FC<modelType> = ({
  userChat,
  conversation,
  messageMoreAction,
  setMessageMoreAction,
}) => {
  return (
    <Modal transparent={true} visible={true} onRequestClose={() => {
      console.log('hahahah')
    }}>
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          height: '100%',
          position: 'relative',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          
        }}>
         
       
      </View>
    </Modal>
  );
};

export default ModalChatMore;
