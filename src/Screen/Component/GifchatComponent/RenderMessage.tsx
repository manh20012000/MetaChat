import React, { useState } from 'react';
import { View, Text, Image,useWindowDimensions } from 'react-native';
import { Avatar, Bubble, Day, Message } from 'react-native-gifted-chat';
import { useSelector } from 'react-redux';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming, runOnJS } from 'react-native-reanimated';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
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
  const[currentMessageItem]=useState(currentMessage)
  const [color] = useState(useSelector((state: any) => state.colorApp.value));
  const { width, height } = useWindowDimensions()
  const SWIPE_THRESHOLD = width * 0.2
  const MAX_SWIPE_DISTANCE = width * 0.2;

  const isMyMessage = currentMessage.user._id === user._id;
  const isFirstMessage =
    !previousMessage || currentMessage.user._id !== previousMessage.user._id;
  
  const translateX = useSharedValue(0);

  const gesture = Gesture.Pan()
    .onUpdate((event) => {
      if ((isMyMessage && event.translationX < 0) || (!isMyMessage && event.translationX > 0)) {
        if (Math.abs(event.translationX) <= MAX_SWIPE_DISTANCE) {
          translateX.value = event.translationX;
        }
      }
    })
    .onEnd((event) => {
      
      if (
        (isMyMessage && event.translationX < -SWIPE_THRESHOLD) ||
        (!isMyMessage && event.translationX > SWIPE_THRESHOLD)
      ) {
        
        runOnJS(handlerreplyTo)(currentMessageItem); // Gọi handler khi vuốt
      }
      translateX.value = withTiming(0);
    });
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));
  
  return (
  
    <View style={{ marginBottom: 2, marginHorizontal: 10 }}>
      <Day {...props} />
      <GestureDetector gesture={gesture} >
        <Animated.View style={animatedStyle} >
      {currentMessage.messageType === 'text' && (
        <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
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
      </GestureDetector>
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
