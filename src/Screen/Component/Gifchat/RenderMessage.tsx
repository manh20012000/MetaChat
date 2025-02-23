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



interface MessageProps {
  currentMessage: any;
  previousMessage?: any;
  userChat: userMessage;
  handleLongPress: (message: any) => void;
  handlerreplyTo: (message: any) => void;
  MediaGrid: (attachments: any) => React.ReactNode;
  scrollToMessage: (messageId: string) => void;
  props: any;
  selectedMessages_id: any;
  setSelectedMessages: React.Dispatch<React.SetStateAction<any>>;
  
}

const MessageItem: React.FC<MessageProps> = ({
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
}) => {
  const { user } = useCheckingService();
  const [color] = useState(useSelector((state: any) => state.colorApp.value));
  const { width } = useWindowDimensions();
  const SWIPE_THRESHOLD = width * 0.3; // Tăng ngưỡng vuốt
  const MAX_SWIPE_DISTANCE = width * 0.4; // Tăng khoảng cách tối đa
  const [showReactions, setShowReactions] = useState(false);
  const [currentReaction, setCurrentReaction] = useState(currentMessage.reactions || null);
  const isMyMessage = currentMessage.user._id === userChat._id;
  const isFirstMessage = !previousMessage || currentMessage.user._id !== previousMessage.user._id;
  
  const translateX = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [reactionPosition, setReactionPosition] = useState({ x: 0, y: 0 });

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

  const handleLongPressMessage = () => {
    console.log('hdhdhd')
    handleLongPress(currentMessage);
    setShowReactions(true);
  };

  const handlerReactIcon = async (item: any) => {
    console.log('hahahsss', item)
    // const message = handlerMessage(currentMessage, [
    //   ...currentReaction,
    //   {user: userChat, reaction: item},
    // ]);
    // const data = await putData(
    //   API_ROUTE.UPDATE_MESSAGE,
    //   {
    //     converstation_id: currentMessage.conversation_id,
    //     user: userChat,
    //     message: message,
    //   },
    //   {user, dispatch},
    // );
    // if (data.status === 200) {
    //   console.log('thành côngcông');
    // } else {
    //   console.log('thất bại thất bại');
    // }
  };

  return (
    <Pressable onPress={() => console.log('hahahahdffsd')}>
      <View style={{ marginBottom: 2, marginHorizontal: 10, position: 'relative' }}>
        <Day {...props} />
        <Animated.View {...panResponder.panHandlers} style={{ transform: [{ translateX }] }}>
          {currentMessage.replyTo !== null && (
            <ReplyMessage
              currentMessage={currentMessage}
              isMyMessage={isMyMessage}
              scrollToMessage={scrollToMessage}
              userChat={userChat}
            />
          )}

          {/* {selectedMessages_id === currentMessage._id && (
            <ReactionIcons
              isMyMessage={isMyMessage}
              // handlerReactIcon={handlerReactIcon}
              userChat={userChat}
            />
          )} */}

          {currentMessage.messageType === 'text' && (
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
            <Image source={{ uri: currentMessage.image }} style={{ width: 100, height: 100 }} />
          )}

          {currentMessage.messageType === 'attachment' && MediaGrid(currentMessage.attachments)}
        </Animated.View>

        {currentMessage.status && (
          <MessageStatus currentMessage={currentMessage} isMyMessage={isMyMessage} />
        )}
      </View>
    </Pressable>
  );
};

export default MessageItem;