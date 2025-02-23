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
  selectedMessages: any;
  handlerdeleteMessage: (messsage: Message_type) => void;
};
const ModalView: React.FC<modelType> = ({
  userChat,
  conversation,
  selectedMessages,
  handlerdeleteMessage,
}) => {
  return (
    <Modal transparent={true} visible={true} onRequestClose={() => {}}>
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
           backgroundColor:'gray',
          width: '100%',
          height: '100%',
          position: 'relative',
        }}>
    
        <RenderOptionMessage
          userChat={userChat}
          conversation={conversation}
          selectedMessages={selectedMessages}
          handlerdeleteMessage={handlerdeleteMessage}
        />
      </View>
    </Modal>
  );
};

export default ModalView;
