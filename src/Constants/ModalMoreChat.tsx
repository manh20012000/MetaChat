import React, { useState } from 'react';
import { Modal, View, Text, Pressable, TouchableOpacity } from 'react-native';
import userMessage from '../type/Home/useMessage_type';
import Conversation from '../type/Home/Converstation_type';
import { Message_type } from '../type/Home/Chat_type';
import useModalMoreChat from './hook/useModalMoreChat';
import { useSelector } from 'react-redux';

type modelType = {
  userChat: userMessage;
  conversation: Conversation;
  handlerDeleteMessage: (message: Message_type) => void; 
  messageMoreAction: Message_type | null;
  setMessageMoreAction: React.Dispatch<React.SetStateAction<any>>;
};

const ModalChatMore: React.FC<modelType> = ({
  userChat,
  conversation,
  messageMoreAction,
  setMessageMoreAction,
  handlerDeleteMessage,
}) => {

  const { modalVisible, toggleModal, color,handlerMoreMessage, notifiModalVisible, selectedOption, handleConfirmation } = useModalMoreChat(
    userChat,
    conversation,
    messageMoreAction,
    setMessageMoreAction,
    handlerDeleteMessage
  );

  const options = ['Pin', 'Forward', 'Bump', 'Delete', 'Report', 'Recall'];

  return (
    <Modal transparent={true} visible={modalVisible} onRequestClose={toggleModal}>
      <Pressable
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'center',
          alignItems: 'center',
        }}
        onPress={toggleModal}
      >
        {notifiModalVisible ? (
          <View
            style={{
              backgroundColor: '#333',
              borderRadius: 10,
              paddingVertical: 15,
              width: '80%',
              alignItems: 'center',
            }}
          >
            <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
              More
            </Text>

            {options.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={{
                  width: '100%',
                  paddingVertical: 12,
                  paddingHorizontal: 20,
                  borderBottomColor: '#555',
                }}
                onPress={() => {
        
                  handlerMoreMessage(index);
                }}
              >
                <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View
            style={{
              backgroundColor: '#333',
              borderRadius: 10,
              paddingVertical: 15,
              width: '80%',
                alignItems: 'center',
                height: 220,
                flexDirection: "column",
              justifyContent:"space-around"
            }}
          >
            <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold', marginBottom: 10 }}>
              {selectedOption === 'Delete' ? 'Delete Message' : 'Recall Message'}
            </Text>
              <Text style={{ color: 'white', fontSize: 16, marginBottom: 20, textAlign:'center',width:'80%' }}>
              Are you sure you want to {selectedOption === 'Delete' ? 'delete' : 'recall'} this message? Message này bạn sẻ không thể thấy message này nữa
            </Text>

            <View style={{ flexDirection: 'row', justifyContent: 'flex-end' ,alignSelf:'flex-end', }}>
              <TouchableOpacity
                style={{
                    alignItems: 'center',
                  justifyContent:'center',
                    padding: 15,
                }}
                onPress={() => handleConfirmation(false)}
              >
                  <Text style={{ color: color.white, textAlign:'center', fontSize: 18 ,fontWeight:'bold'}}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                    alignItems: 'center',
                    justifyContent: 'center',
                  padding: 15,
                
                  borderRadius: 5,
                }}
                onPress={() => handleConfirmation(true)}
              >
                  <Text style={{ color: 'red', fontSize: 18, fontWeight: 'bold' }}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </Pressable>
    </Modal>
  );
};

export default ModalChatMore;