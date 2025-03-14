import React, {useRef} from 'react';
import {Pressable, Text, View} from 'react-native';
import {Bubble, Avatar} from 'react-native-gifted-chat';
import userMessage from '../../../../type/Home/useMessage_type';
import {messageIcon} from '../../../../type/react-type';
import {Message_type} from '../../../../type/Home/Chat_type';
import {TouchableOpacity} from 'react-native';
import PreviewImage from '../../../../Container/Home/Chat_component/PreviewAttenment/ImagePreview';
type TextMessageProps = {
  isFirstMessage: boolean;
  isMyMessage: boolean;
  currentMessage: Message_type;
  props: any;
  handleLongPressMessage: (
    position: {x: number; y: number},
    message: any,
  ) => void;
  color: any;
  userChat: userMessage;
  handlderHidenIcon: any;
  setSelectedMessages: React.Dispatch<React.SetStateAction<any>>;
};

export const TextMessage: React.FC<TextMessageProps> = ({
  isFirstMessage,
  isMyMessage,
  currentMessage,
  props,
  handleLongPressMessage,
  color,
  userChat,
  handlderHidenIcon,
  setSelectedMessages,
}) => {
  const messageRef = useRef<View>(null);
  const getPosition = () => {
    // console.log('hdhdjshdjsj')
    if (messageRef.current) {
      messageRef.current.measureInWindow((x, y, width, height) => {
        handleLongPressMessage({x, y}, currentMessage);
      });
    }
  };

  return (
    <>
      <Pressable
        onPress={() => {
        
          setSelectedMessages(null);
          handlderHidenIcon(false);
        }}
        ref={messageRef} // Gán ref vào Pressable để đo được tọa độ
        style={{
       
          marginVertical: 1,
        }}>
        {isFirstMessage && currentMessage.user._id !== userChat._id && (
          <Avatar {...props} style={{}} />
        )}
        {currentMessage.messageType === 'text' && (
          <Bubble
            {...props}
            onLongPress={getPosition}
            wrapperStyle={{
              left: {
                backgroundColor: color.gray2,
                maxWidth: '65%',
                padding: 5,
              },
              right: {
                backgroundColor: isMyMessage ? color.blue : color.gray2,
                maxWidth: '65%',
                padding: 5,
              },
            }}
            textStyle={{
              left: {color: 'white'},
              right: {color: 'white'},
            }}
          />
        )}
        {currentMessage.messageType === 'attachment' && (
            <PreviewImage
              isMyMessage={isMyMessage}
              currentMessage={currentMessage}
              getPosition={getPosition}
            />
        )}
      </Pressable>
      {currentMessage.reactions.length > 0 && (
        <View
          style={{
            flexDirection: 'row',
            alignSelf: isMyMessage ? 'flex-end' : 'flex-start',
            marginLeft: isMyMessage ? 0 : 50,
            borderWidth: 1,
            backgroundColor: '#222222',
            borderRadius: 10,
            justifyContent: 'center',
            alignItems: 'center',
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
      )}
    </>
  );
};
