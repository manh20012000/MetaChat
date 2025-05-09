import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  useWindowDimensions,
  Animated,
  Alert,
} from 'react-native';

import { useSelector } from 'react-redux';

import Conversation from '../../../../../../../types/home_type/Converstation_type';
import { BSON } from 'bson';
import PermissionCamera from '../../../../../../../utils/permision_app/CameraChatPermission';
import userMessage from '../../../../../../../types/home_type/useMessage_type';
import { Message_type } from '../../../../../../../types/home_type/Chat_type';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../../../../../../../types/navigation_type/rootStackScreen';
import { eventEmitter } from '../../../../../../../event_emitters/EventEmitter';
import { useSocket } from '../../../../../../../provinders/socket.io';
import { debounce } from '../../../../../../../constants/func_utils/debounce'
type NavigationProps = NavigationProp<RootStackParamList>;
const useRenderInput = (props: any) => {
  const deviceInfo = useSelector(
    (value: { deviceInfor: { value: any } }) => value.deviceInfor.value,
  );
  const { onSend, userChat, replyMessage, setReplyMessage } = props;

  const color = useSelector(
    (value: { colorApp: { value: any } }) => value.colorApp.value,
  );
  const navigation = useNavigation<NavigationProps>();
  const conversation: Conversation = props.conversation;
  const [isShowSendText, setIsShowSendText] = useState(true);
  const [statusTyping, setStatusTyping] = useState(false);
  const [changeIcon, setChangeIcon] = useState(true);
  const [text, setText] = useState('');
  const [inputHeight, setInputHeight] = useState(30);
  const newdate = new Date().toISOString();
  const [openMap, setOpenMap] = useState<boolean>(false);
  const socket = useSocket();
  const handMessage = useCallback(() => {
    return {
      _id: new BSON.ObjectId().toString(),
      conversation_id: conversation._id,
      user: userChat,
      messageType: 'text',
      text: text,
      attachments: [],
      callDetails: null,
      createdAt: newdate,
      reactions: [],
      receiver: conversation.participantIds,

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
      handleStopTyping();
      onSend(handMessage(), [], true);
      setText('');
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

          attachments: files,
          callDetails: null,
          createdAt: newdate,
          reactions: [],
          receiver: conversation.participantIds,

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
  const onClose = () => {
    setOpenMap(!openMap);
  };

  // Hàm debounce để gửi sự kiện "dừng nhập"
  const handleStopTyping = useCallback(() => {
    if (!conversation || !socket) return;
    setStatusTyping(false);
    socket.emit('typing', {
      deviceInfo,
      userChat,
      roomId: conversation._id,
      isTyping: false,
    });
  }, []);

  const debouncedTyping = useRef(
    debounce((value: string) => {

      if (!conversation || !socket) return;
      setStatusTyping(true);
      if (value.trim() === '') {
        handleStopTyping();
      } else {
        socket.emit('typing', {
          deviceInfo,
          userChat,
          roomId: conversation._id,
          isTyping: true,
        });
      }
    }, 1000)
  ).current;

  const onchangeTyping = (value: string) => {
    setText(value);
    debouncedTyping(value); // gọi debounce đã được tạo sẵn
  };
  return {
    handlePress,
    onchangeTyping,
    text,
    openMap,
    onClose,
    handleSend,
    changeIcon,
    isShowSendText,
    setIsShowSendText,
    inputHeight,
    setInputHeight,
    setChangeIcon,
  };
};
export default useRenderInput;
