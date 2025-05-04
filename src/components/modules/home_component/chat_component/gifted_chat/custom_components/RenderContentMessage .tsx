import React, { useEffect, useRef } from 'react';
import { Pressable, Text, View, TouchableWithoutFeedback ,TouchableOpacity} from 'react-native';
import { Bubble, Avatar } from 'react-native-gifted-chat';
import userMessage from '../../../../../../types/home_type/useMessage_type';
import { Message_type } from '../../../../../../types/home_type/Chat_type';

import RenderMediaChat from './render_attachment/RenderMedia';
import AudioMessage from './render_attachment/RenderAudio';
import AntDesign from 'react-native-vector-icons/AntDesign';
type TextMessageProps = {
  isFirstMessage: boolean;
  isMyMessage: boolean;
  currentMessage: Message_type;
  props: any;
  highlightedMessageId: any;
  handleLongPressMessage: (
    position: { x: number; y: number },
    message: any,
  ) => void;
  color: any;
  userChat: userMessage;
  setSizeMessage: React.Dispatch<React.SetStateAction<any>>;
  setSelectedMessages: React.Dispatch<React.SetStateAction<any>>;
};

export const MessageComponent: React.FC<TextMessageProps> = ({
  isFirstMessage,
  isMyMessage,
  currentMessage,
  props,
  handleLongPressMessage,
  highlightedMessageId,
  color,
  userChat,
  setSizeMessage,
  setSelectedMessages,
}) => {
  const messageRef = useRef<View>(null);
  const getPosition = () => {
    if (messageRef.current) {
      messageRef.current.measureInWindow((x, y, width, height) => {
        handleLongPressMessage({ x, y }, currentMessage);
      });
    }
  };

  useEffect(() => {
    if (messageRef.current) {
      messageRef.current.measureInWindow((x, y, width, height) => {
        setSizeMessage({ width, height });
        // // handleLongPressMessage({x, y},{width, height} ,currentMessage);
      });
    }
  }, []);
  return (
    <Pressable
      onPress={() => {
        console.log('nhấn onpressble');
        setSelectedMessages(null);
      }}
      ref={messageRef}
      style={{
        flexDirection: 'row',
        marginVertical: 1,
        alignItems: 'flex-end',
        alignSelf: 'flex-end',
      }}>

      {isFirstMessage && currentMessage.user._id !== userChat._id && (
        <Avatar
          {...props}
          imageStyle={{
            left: { width: 25, height: 25 },
            // right: { width: 30, height: 30 },
          }}
          containerStyle={{ bottom: 0, position: 'absolute' }}
        />
      )}
      {currentMessage.messageType === 'text' && (
        <Bubble
          {...props}
          delayLongPress={250}
          onLongPress={getPosition}
          wrapperStyle={{
            left: {
              backgroundColor: color.gray2,
              maxWidth: '65%',
              padding: 5,
              borderRadius: 15,
              borderWidth: currentMessage._id === highlightedMessageId ? 3 : 0, // Highlight viền
              borderColor:
                currentMessage._id === highlightedMessageId
                  ? 'red'
                  : 'transparent', // Màu viền
            },
            right: {
              backgroundColor: isMyMessage ? color.blue : color.gray2,
              maxWidth: '65%',
              padding: 5,
              borderRadius: 15,
              borderWidth: currentMessage._id === highlightedMessageId ? 3 : 0,
              borderColor:
                currentMessage._id === highlightedMessageId
                  ? 'red'
                  : 'transparent',
            },
          }}
          textStyle={{
            left: { color: 'white' },
            right: { color: 'white' },
          }}
        />
      )}
      {currentMessage.messageType === 'attachment' && (
        <View style={{ flex: 1 }}>
          <RenderMediaChat
            highlightedMessageId={highlightedMessageId}
            isMyMessage={isMyMessage}
            currentMessage={currentMessage}
            getPosition={getPosition}
          />
        </View>
      )}
      {currentMessage.messageType === 'audio' && (
        <AudioMessage
          isMyMessage={isMyMessage}
          currentMessage={currentMessage}
          getPosition={getPosition}
        />
      )}
    </Pressable>
  );
};
{
  /* {currentMessage.reactions.length > 0 && (
        <View
          style={{
            flexDirection: 'row',
            alignSelf: isMyMessage ? 'flex-end' : 'flex-start',
            marginLeft: isMyMessage ? 0 : 50,
            borderWidth: 1,
            backgroundColor: '#222222',
            borderRadius: 10,
            justifyContent: 'flex-end',
            alignItems: 'flex-end',
            position:'absolute',
            bottom:-15,
          }}>
          {currentMessage.reactions.slice(-2).map((reaction: any) => {
            const icon = messageIcon.find(
              item => item._id === reaction.reaction,
            );
            return icon ? (
              <TouchableOpacity
                key={reaction.reaction}
                style={{
                  marginHorizontal: 2,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <Text style={{fontSize: 16}}>{icon.icon}</Text>
              </TouchableOpacity>
            ) : null;
          })}
        </View>
      )} */
}
