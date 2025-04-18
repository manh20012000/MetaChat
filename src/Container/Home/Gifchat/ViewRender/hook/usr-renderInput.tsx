
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  useWindowDimensions,
  Animated,
  Alert,
} from 'react-native';
import _, { debounce, throttle } from "lodash";
import {useSelector} from 'react-redux';

import Conversation from '../../../../../type/Home/Converstation_type';
import {BSON} from 'bson';
import PermissionCamera from '../../../../../util/Permision/CameraChatPermission';
import userMessage from '../../../../../type/Home/useMessage_type';
import { Message_type } from '../../../../../type/Home/Chat_type';
import {NavigationProp, useNavigation} from '@react-navigation/native';
import { RootStackParamList } from '../../../../../type/rootStackScreen';
import { eventEmitter } from '../../../../../eventEmitter/EventEmitter';
import { useSocket } from '../../../../../util/socket.io';
type NavigationProps = NavigationProp<RootStackParamList>;
const useRenderInput = (props: any) => {
  const deviceInfo = useSelector(
    (value: {deviceInfor: {value: any}}) => value.deviceInfor.value,
  );
  const {onSend, userChat, replyMessage, setReplyMessage} = props;

  const color = useSelector(
    (value: {colorApp: {value: any}}) => value.colorApp.value,
  );
  const navigation = useNavigation<NavigationProps>();
  const typingTimeout = useRef<NodeJS.Timeout | null>(null);
  const conversation: Conversation = props.conversation;
  const [isShowSendText, setIsShowSendText] = useState(true);

  const [changeIcon, setChangeIcon] = useState(true);
  const [text, settext] = useState('');
  const [inputHeight, setInputHeight] = useState(30);
  const newdate = new Date().toISOString();
  const [openMap,setOpenMap]=useState<boolean>(false);
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
  const onClose=()=>{
    setOpenMap(!openMap)
  }

 // Hàm throttle để gửi sự kiện typing trong quá trình nhập liệu
  const throttledTyping = throttle((isTyping) => {
    if (!conversation || !socket) return;
    socket.emit("typing", {deviceInfo,  userChat, roomId: conversation._id, isTyping });
  }, 1000); // Throttle mỗi 1 giây

  // Hàm debounce để gửi sự kiện "dừng nhập"
  const debouncedStopTyping = debounce(() => {
    if (!conversation || !socket) return;
    socket.emit("typing", {deviceInfo,userChat, roomId: conversation._id, isTyping: false });
  }, 300); // Debounce 300ms

  const handleTyping = () => {
    // Gửi sự kiện "đang nhập" với throttle
    throttledTyping(true);

    // Đặt timeout để gửi sự kiện "dừng nhập" sau 4 giây
    if (typingTimeout.current) {
      clearTimeout(typingTimeout.current);
    }
    typingTimeout.current = setTimeout(() => {
      debouncedStopTyping();
    }, 4000);
  };

  const onchangeTyping = () => {
    handleTyping();
  };
  
return {
    handlePress,
    handleTyping,onchangeTyping
    ,text,settext,openMap,onClose,
    handleSend,changeIcon,isShowSendText,setIsShowSendText,inputHeight,setInputHeight,setChangeIcon
}
    
}
export default useRenderInput