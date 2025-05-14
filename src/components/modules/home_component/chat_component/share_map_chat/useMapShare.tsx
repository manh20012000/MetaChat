import React, { useEffect, useState } from 'react';
import { Modal, Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import MapView, { Marker } from 'react-native-maps';
import Conversation from '../../../../../types/home_type/Converstation_type';
import { Message_type } from '../../../../../types/home_type/Chat_type';
import userMessage from '../../../../../types/home_type/useMessage_type';
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
