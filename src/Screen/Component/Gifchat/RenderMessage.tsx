import React, { useRef, useState } from 'react';
import { View, Text, Image, useWindowDimensions, Animated, PanResponder, TouchableOpacity, Pressable } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Avatar, Bubble, Day } from 'react-native-gifted-chat';
import { useDispatch, useSelector } from 'react-redux';
import userMessage from '../../../type/Home/useMessage_type';

import useCheckingService from '../../../service/Checking_service';
import { ReplyMessage } from './ViewRender/ReplyMessage';
import { ReactionIcons } from './ViewRender/ReactionIcons';
import { TextMessage } from './ViewRender/TextMessage ';
import { MessageStatus } from './ViewRender/MessageStatus';
import { messageIcon } from '../../../type/react-type';
import { Message_type } from '../../../type/Home/Chat_type';


interface MessageProps {
  currentMessage: Message_type;
  previousMessage?: any;
  userChat: userMessage;
  handleLongPress: (message: any) => void;
  handlerreplyTo: (message: any) => void;
  MediaGrid: (attachments: any) => React.ReactNode;
  scrollToMessage: (messageId: string) => void;
  props: any;
  selectedMessages_id: any;
  setSelectedMessages: React.Dispatch<React.SetStateAction<any>>;
  setReactionPosition: React.Dispatch<React.SetStateAction<any>>;
}

const MessageItem: React.FC<MessageProps> = ({
  // New comment to explain the component

  currentMessage,
  previousMessage,
  userChat,
  handleLongPress,
  handlerreplyTo,
  MediaGrid,
  scrollToMessage,
  props,
  selectedMessages_id,
  setSelectedMessages,
  setReactionPosition
}) => {
  const { user } = useCheckingService();
  const [color] = useState(useSelector((state: any) => state.colorApp.value));
  const { width } = useWindowDimensions();
  const SWIPE_THRESHOLD = width * 0.3; // Tăng ngưỡng vuốt
  const MAX_SWIPE_DISTANCE = width * 0.4; // Tăng khoảng cách tối đa
  const [showReactions, setShowReactions] = useState(false);
  const isMyMessage = currentMessage.user._id === userChat._id;
  const isFirstMessage = !previousMessage || currentMessage.user._id !== previousMessage.user._id;
    //  console.log(currentMessage.recall,'recal;')
  const translateX = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (event, gestureState) => {
        if ((isMyMessage && gestureState.dx < 0) || (!isMyMessage && gestureState.dx > 0)) {
          if (Math.abs(gestureState.dx) <= MAX_SWIPE_DISTANCE) {
            translateX.setValue(gestureState.dx);
          }
        }
      },
      onPanResponderRelease: (event, gestureState) => {
        if ((isMyMessage && gestureState.dx < -SWIPE_THRESHOLD) || (!isMyMessage && gestureState.dx > SWIPE_THRESHOLD)) {
          handlerreplyTo(currentMessage);
        }
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      },
    }),
  ).current;

const handleLongPressMessage = ({ x, y }: { x: number; y: number }, message: any) => {
  // Handle long press on message

    setReactionPosition({ x, y }); // Lưu vị trí nhấn giữ
    handleLongPress(message); // Gọi hàm xử lý nhấn giữ
    setShowReactions(true);
  };

  return (
    <Pressable onPress={() => {
      setSelectedMessages(null)
    }}
    >
      <View style={{ marginBottom: 2, marginHorizontal: 10, position: 'relative' }}>
        <Day {...props} />
        {
          currentMessage.recall === false ? (
            currentMessage.reciver.includes(userChat.user_id) && (
              <Animated.View {...panResponder.panHandlers} style={{ transform: [{ translateX }] }}>
                {currentMessage.replyTo !== null && currentMessage.replyTo.user && (
                  <ReplyMessage
                    currentMessage={currentMessage}
                    isMyMessage={isMyMessage}
                    scrollToMessage={scrollToMessage}
                    userChat={userChat}
                  />
                )}
                {currentMessage.messageType === 'text' && ( 
                  // Render text message

                  <TextMessage
                    isFirstMessage={isFirstMessage}
                    isMyMessage={isMyMessage}
                    currentMessage={currentMessage}
                    props={props}
                    handleLongPressMessage={handleLongPressMessage}
                    color={color}
                    userChat={userChat}
                    handlderHidenIcon={() => { }}
                    setSelectedMessages={setSelectedMessages}
            
                  />
                )}
                {currentMessage.messageType === 'image' && ( 
                  <Image source={{ uri: currentMessage.attachments[0].url }} style={{ width: 100, height: 100 }} />
                )}

                {currentMessage.messageType === 'attachment' && MediaGrid(currentMessage.attachments)} 
              
              </Animated.View>
            ))
            : (
              <View style={{ alignSelf:  isMyMessage ? 'flex-end' : 'flex-start',backgroundColor:color.gray,padding:5,borderRadius:5 }}>
              <Text style={{fontWeight:'bold',fontSize:15}}>Tin nhắn này bị thu hồi</Text>
            </View>
          )
        }

        {currentMessage.status && (
          <MessageStatus currentMessage={currentMessage} isMyMessage={isMyMessage} />
        )}
      </View>
    </Pressable>
  );
};

export default MessageItem;
