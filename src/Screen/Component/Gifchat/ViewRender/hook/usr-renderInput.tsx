
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  useWindowDimensions,
  Animated,
  Alert,
} from 'react-native';

import {useSelector} from 'react-redux';

import Conversation from '../../../../../type/Home/Converstation_type';
import {BSON} from 'bson';
import PermissionCamera from '../../../../../util/Permision/CameraChatPermission';
import userMessage from '../../../../../type/Home/useMessage_type';
import { Message_type } from '../../../../../type/Home/Chat_type';
import {NavigationProp, useNavigation} from '@react-navigation/native';
import { RootStackParamList } from '../../../../../type/rootStackScreen';
import { eventEmitter } from '../../../../../eventEmitter/EventEmitter';
type NavigationProps = NavigationProp<RootStackParamList>;
const useRenderInput = (props: any) => {
  const {onSend, userChat, replyMessage, setReplyMessage} = props;

  const color = useSelector(
    (value: {colorApp: {value: any}}) => value.colorApp.value,
  );
  const navigation = useNavigation<NavigationProps>();

  const conversation: Conversation = props.conversation;
  const [isShowSendText, setIsShowSendText] = useState(true);

  const [changeIcon, setChangeIcon] = useState(true);
  const [text, settext] = useState('');
  const [inputHeight, setInputHeight] = useState(30);
  const newdate = new Date().toISOString();

  const handMessage = useCallback(() => {
   
    return {
      _id: new BSON.ObjectId().toString(),
      conversation_id: conversation._id,
      user: userChat,
      messageType: 'text',
      text: text,
      voice: '',
      attachments: [],
      callDetails: null,
      createdAt: newdate,
      reactions: [],
      receiver: conversation.participantIds,
      isRead: [],
      replyTo:
        replyMessage === null
          ? null
          : {
              _id: replyMessage._id,
              text:
                replyMessage.messageType === 'text'
                  ? replyMessage.text
                  : 'reply atatment',
              user: replyMessage.user,
              messageType: replyMessage.messageType,
            },
      recall: false,
    };
  }, [text]);

  const handleSend = useCallback(() => {
    if (text.trim() !== '') {
      onSend(handMessage(), [], true);
      settext('');
      setChangeIcon(true);
      setReplyMessage(null);
    }
  }, [text]);

  useEffect(() => {
    const listener = (files: []) => {
      let filesOrder = files.map((file: any, index: number) => {
        return {
          index,
          type: file.type,
        };
      });
    
      if (files.length > 0) {
        const message = {
          _id: new BSON.ObjectId().toString(),
          conversation_id: conversation._id,
          user: userChat,
          messageType: 'attachment',
          text: null,
          voice: null,
          attachments: files,
          callDetails: null,
          createdAt: newdate,
          reactions: [],
          receiver: conversation.participantIds,
          isRead: [],
          replyTo: null,
          recall: false,
        };

        onSend(message, filesOrder, true);
        setChangeIcon(true);
        setReplyMessage(null);
      }
    };

    eventEmitter.on('onCapture', listener);
    return () => {
      eventEmitter.off('onCapture', listener);
    };
  }, []);

  const handlePress = useCallback(async () => {
    const permission = await PermissionCamera();
    if (permission) {
      navigation.navigate('CameraChat');
    } else {
      Alert.alert('Permission camera denied');
    }
  }, []);
return {
    handlePress
    ,text,settext,
    handleSend,changeIcon,isShowSendText,setIsShowSendText,inputHeight,setInputHeight,setChangeIcon
}
    
}
export default useRenderInput