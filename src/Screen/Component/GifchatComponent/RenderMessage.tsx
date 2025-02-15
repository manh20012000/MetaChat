import React, { useRef, useState } from 'react';
import {
  View, Text, Image, useWindowDimensions, Animated,
  PanResponder, TouchableOpacity
} from 'react-native';
import { Avatar, Bubble, Day } from 'react-native-gifted-chat';
import { useSelector } from 'react-redux';
import userMessage from '../../../interface/userMessage.interface';

interface MessageProps {
  currentMessage: any;
  previousMessage?: any;
  user: userMessage;
  handleLongPress: (message: any) => void;
  handlerreplyTo: (message: any) => void;
  MediaGrid: (attachments: any) => React.ReactNode;
  scrollToMessage: (messageId: string) => void;
  props: any;
}

const MessageItem: React.FC<MessageProps> = ({
  currentMessage,
  previousMessage,
  user,
  handleLongPress,
  handlerreplyTo,
  MediaGrid,
  scrollToMessage,
  props
}) => {
  const [color] = useState(useSelector((state: any) => state.colorApp.value));
  const { width } = useWindowDimensions();
  const SWIPE_THRESHOLD = width * 0.2;
  const MAX_SWIPE_DISTANCE = width * 0.3;

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
          handlerreplyTo(currentMessage);
        }

        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      },
    })
  ).current;

  return (
    <View style={{ marginBottom: 2, marginHorizontal: 10 }}>
      <Day {...props} />
      <Animated.View
        {...panResponder.panHandlers}
        style={{ transform: [{ translateX }] }}
      >
        {currentMessage.replyTo && (
          <View style={{ alignSelf: isMyMessage ? 'flex-end' : 'flex-start', }}>
            
            <Text>
              {currentMessage.replyTo.user._id === currentMessage.user._id ? "you" : currentMessage.replyTo.user.name} reply to {currentMessage.replyTo.user._id === currentMessage.user._id ? "you" : currentMessage.replyTo.user.name}
         </Text>
          <TouchableOpacity
            onPress={() => scrollToMessage(currentMessage.replyTo._id)}
            style={{
              backgroundColor: '#444',
              padding: 8,
              borderRadius: 10,
              maxWidth: '65%',
              alignSelf: isMyMessage ? 'flex-end' : 'flex-start',
            }}
          > 
            <Text style={{ color: '#ccc', fontSize: 12 }}>
                {currentMessage.replyTo.messageType ==="text"?currentMessage.replyTo.text:"reply attaementattaement"}
            </Text>
            </TouchableOpacity>
          </View>
        )}

        {currentMessage.messageType === 'text' && (
          <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
            {isFirstMessage && currentMessage.user._id !== user._id && (
              <Avatar {...props} />
            )}
            <Bubble
              {...props}
              onLongPress={(context, message) => handleLongPress(message)}
              wrapperStyle={{
                left: {
                  backgroundColor: color.gray2,
                  maxWidth: '65%',
                  marginBottom: 0,
                },
                right: {
                  backgroundColor: isMyMessage ? color.blue : color.gray2,
                  maxWidth: '65%',
                  marginBottom: 0,
                },
              }}
              textStyle={{
                left: { color: 'white' },
                right: { color: 'white' },
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

        {currentMessage.messageType === 'attachment' &&
          MediaGrid(currentMessage.attachments)}
      </Animated.View>

      {currentMessage.status && (
        <Text
          style={{
            fontSize: 12,
            color: 'white',
            marginTop: 5,
            textAlign: isMyMessage ? 'right' : 'left',
          }}
        >
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