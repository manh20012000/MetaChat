import React, { useRef, useState } from 'react';
import {
  View, Text, Image, useWindowDimensions, Animated,
  PanResponder,
} from 'react-native';
import { Avatar, Bubble, Day, Message } from 'react-native-gifted-chat';
import { useSelector } from 'react-redux';
// import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming, runOnJS } from 'react-native-reanimated';
// import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import userMessage from '../../../interface/userMessage.interface';
interface MessageProps {
  currentMessage: any;
  previousMessage?: any  ,
  user: userMessage;
  handleLongPress: (message: any) => void;
  handlerreplyTo: (message: any) => void; // Thêm function để xử lý reply
  MediaGrid: (attachments: any) => React.ReactNode;
  props: any;
}

const MessageItem: React.FC<MessageProps> = ({ currentMessage,
  previousMessage, user, handleLongPress, handlerreplyTo, MediaGrid, props }) => {
  
  const [color] = useState(useSelector((state: any) => state.colorApp.value));
  const { width } = useWindowDimensions();
  const SWIPE_THRESHOLD = width * 0.2; // Ngưỡng vuốt
  const MAX_SWIPE_DISTANCE = width * 0.3; // Giới hạn vuốt tối đa

  const isMyMessage = currentMessage.user._id === user._id;
  const isFirstMessage =
    !previousMessage || currentMessage.user._id !== previousMessage.user._id;

  const translateX = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (event, gestureState) => {
        if (
          (isMyMessage && gestureState.dx < 0) ||
          (!isMyMessage && gestureState.dx > 0)
        ) {
          if (Math.abs(gestureState.dx) <= MAX_SWIPE_DISTANCE) {
            translateX.setValue(gestureState.dx);
          }
        }
      },
      onPanResponderRelease: (event, gestureState) => {
        if (
          (isMyMessage && gestureState.dx < -SWIPE_THRESHOLD) ||
          (!isMyMessage && gestureState.dx > SWIPE_THRESHOLD)
        ) {
          handlerreplyTo(currentMessage); // Gọi hàm reply nếu vuốt đủ xa
        }

        // Quay lại vị trí ban đầu
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      },
    })
  ).current;
  
  return (
  
    <View style={{ marginBottom: 2, marginHorizontal: 10, }}>
      <Day {...props} />
      <Animated.View
        {...panResponder.panHandlers}
        style={{ transform: [{ translateX }] }}
      >
      {currentMessage.messageType === 'text' && (
        <View style={{ flexDirection: 'row', alignItems: 'flex-end',}}>
          {isFirstMessage && currentMessage.user._id !== user._id && (
            <Avatar
              {...props}
           
            />
          )}
          <Bubble
            {...props}
                onLongPress={(context, message) => handleLongPress(message)}
           
            wrapperStyle={{
              left: {
                backgroundColor: color.gray2, // Màu nền của tin nhắn người nhận
                maxWidth: '65%', // Giới hạn chiều rộng tin nhắn
                marginBottom: 0,
                 padding:59
              },
              right: {
                backgroundColor: isMyMessage ? color.blue : color.gray2, // Màu nền của tin nhắn người gửi
                maxWidth: '65%', // Giới hạn chiều rộng tin nhắn
                marginBottom:0
              },
            }}
            textStyle={{
              left: {
                color: 'white', // Màu chữ của tin nhắn người nhận
              },
              right: {
                color: 'white', // Màu chữ của tin nhắn người gửi
              },
            }}
          />


        </View>
      )}
      {currentMessage.messageType === 'image' && (
        <Image
          source={{ uri: currentMessage.image }}
          style={{ width: 100, height: 100 }}
        />
      )}
          {currentMessage.messageType === 'attachment' && MediaGrid(currentMessage.attachments)}
      </Animated.View>
      {currentMessage.status && (
        <Text
          style={{
            fontSize: 12,
            color: 'white',
            marginTop: 5,
            textAlign: 'right',
           
          }}>
          {currentMessage.status === 'sending'
            ? 'Sending...'
            : currentMessage.status === 'sent'
              ? 'Sent'
              : currentMessage.status === 'failed'
                ? 'Failed'
                : ''}
        </Text>
      )}
      </View>

  );
};

export default MessageItem;
