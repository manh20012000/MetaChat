import React, { useEffect, useState } from 'react';
import { Modal, Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import MapView, { Marker } from 'react-native-maps';
import Conversation from '../../../../type/Home/Converstation_type';
import { Message_type } from '../../../../type/Home/Chat_type';
import userMessage from '../../../../type/Home/useMessage_type';
const UseModalMap= ({  
    // onClose,
    // onSend,
    // conversation,
    // replyMessage,
    // userChat, 
}) => {
  const [location, setLocation] = useState(null);

  const onSendMessage=(location:any)=>{

  }

  return (
   { onSendMessage}
  );
};

export default UseModalMap;
