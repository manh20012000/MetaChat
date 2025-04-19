import React from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import {GiftedChat, InputToolbar, Send} from 'react-native-gifted-chat';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const renderInputToolbar = (props:any) => {
  return (
    <InputToolbar
      {...props}
      containerStyle={{
        backgroundColor: '#333',
        borderTopWidth: 0,
        padding: 8,
      }}
      primaryStyle={{alignItems: 'center'}}
    />
  );
};

const renderSend = (props:any) => {
  return (
    <Send {...props}>
      <View style={{marginRight: 10}}>
        <MaterialCommunityIcons name="send-circle" size={32} color="#007AFF" />
      </View>
    </Send>
  );
};

export {renderInputToolbar, renderSend};
