import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  useWindowDimensions,
  Animated,
  PanResponder,
  TouchableOpacity, Pressable,
  TouchableWithoutFeedback,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Avatar, Bubble, Day } from 'react-native-gifted-chat';
import { useDispatch, useSelector } from 'react-redux';
import userMessage from '../../../type/useMessage_type';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Message_type } from '../../../type/Chat_type';
import { API_ROUTE } from '../../../service/api_enpoint';
import { putData } from '../../../service/resfull_api';
import useCheckingService from '../../../service/Checking_service';
import handlerMessage from '../../../util/util_chat/messageReaction';
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
}) => {
  const { user, dispatch } = useCheckingService();
  const [color] = useState(useSelector((state: any) => state.colorApp.value));
  const { width } = useWindowDimensions();
  const SWIPE_THRESHOLD = width * 0.2;
  const MAX_SWIPE_DISTANCE = width * 0.3;
  const [showReactions, setShowReactions] = useState(false);
  const [currentReaction, setCurrentReaction] = useState(
    currentMessage.reactions || null,
  );
  const isMyMessage = currentMessage.user._id === userChat._id;
  const isFirstMessage =
    !previousMessage || currentMessage.user._id !== previousMessage.user._id;
  const messageIcon = [
    { _id: 1, icon: '😍', name: 'wao' },
    { _id: 2, icon: '😢', name: 'sab' },
    { _id: 3, icon: '👍', name: 'like' },
    { _id: 4, icon: '❤️', name: 'love' },
    { _id: 5, icon: '😣', name: 'danger' },
  ];
  const translateX = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [reactionPosition, setReactionPosition] = useState({ x: 0, y: 0 });
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
    }),
  ).current;

  const fadeIn = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const fadeOut = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setShowReactions(false));
  };
  const handleLongPressMessage = () => {
    handleLongPress(currentMessage);
    setShowReactions(true);
    fadeIn();
  };
  const handlePressOutside = () => {
    handleLongPress(currentMessage);
    setShowReactions(false);
    fadeOut();
  };
  const handlerReactIcon = async (item: any) => {
    console.log('hahah', item)
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
    <Pressable onPress={() => {
      console.log('hahahah')
    }}>
      <View style={{ marginBottom: 2, marginHorizontal: 10 }}>
      <Day {...props} />
      <Animated.View
        {...panResponder.panHandlers}
        style={{ transform: [{ translateX }] }}>
        {currentMessage.replyTo !== null && (
          <View
            style={{
              alignSelf: isMyMessage ? 'flex-end' : 'flex-start',
              marginLeft: isMyMessage ? 0 : 40,
            }}>
            <Text style={{ fontSize: 10, fontWeight: 'bold' }}>
              {currentMessage.replyTo.user._id !== currentMessage.user._id
                ? 'You'
                : currentMessage.replyTo.user.name}{' '}
              replied to{' '}
              {currentMessage.replyTo.user._id === currentMessage.user._id
                ? 'yourself'
                : currentMessage.replyTo.user.name}
            </Text>
            <TouchableOpacity
              onPress={() => scrollToMessage(currentMessage.replyTo._id)}
              style={{
                backgroundColor: 'rgba(223, 11, 57, 0.84)',
                padding: 8,
                borderRadius: 10,
                maxWidth: '65%',
                alignSelf: isMyMessage ? 'flex-end' : 'flex-start',
              }}>
              <Text style={{ color: '#ccc', fontSize: 13, fontWeight: 'bold' }}>
                {currentMessage.replyTo.messageType === 'text'
                  ? currentMessage.replyTo.text
                  : 'Attachment'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {selectedMessages_id === currentMessage._id && (
        
            <TouchableOpacity
              style={{
                  position: 'absolute',
                  backgroundColor: 'rgba(189, 8, 53, 0.5)',
                  flexDirection: 'row',
                  borderRadius: 20,
                  padding: 5,
                  bottom: 40,
                  // right: isMyMessage ? 10 : undefined,
                  // left: isMyMessage ? undefined : 10,
                  alignSelf: isMyMessage ? 'flex-end' : 'flex-start',
                  zIndex: 2, // Tăng zIndex để đảm bảo icon hiển thị trên các thành phần khác
              }}>
              {messageIcon.map(item => (
                <TouchableOpacity
                  key={item._id}
                  onPress={() => handlerReactIcon(item)}>
                  <Text style={{ fontSize: 22, marginHorizontal: 5 }}>
                    {item.icon}
                  </Text>
                </TouchableOpacity>
              ))}

              <TouchableOpacity>
                <Ionicons name="add" size={24} color="white" />
              </TouchableOpacity>
            </TouchableOpacity>
         
        )}
        {/* Text Message */}
        {currentMessage.messageType === 'text' && (
          <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
            {isFirstMessage && currentMessage.user._id !== userChat._id && (
              <Avatar {...props} />
            )}
            <Bubble
                {...props}
                onPress={() => {
                  console.log('hahaha')
                }}
                onLayout={() => { console.log('ahhahh')}}
              onLongPress={handleLongPressMessage}
              wrapperStyle={{
                left: {
                  backgroundColor: color.gray2,
                  maxWidth: '65%',
                },
                right: {
                  backgroundColor: isMyMessage ? color.blue : color.gray2,
                  maxWidth: '65%',
                },
              }}
              textStyle={{
                left: { color: 'white' },
                right: { color: 'white' },
              }}
            />
          </View>
        )}
        {currentReaction && currentReaction.length > 0 && (
          <View
            style={{
              position: 'absolute',
              bottom: -10,
              right: isMyMessage ? -10 : undefined,
              left: isMyMessage ? undefined : -10,
              //  backgroundColor:'pink',
              borderRadius: 10,
              padding: 5,
              alignSelf: isMyMessage ? 'flex-end' : 'flex-start',
            }}>
            <Text style={{ fontSize: 16 }}>{currentReaction}</Text>
          </View>
        )}
        {currentMessage.messageType === 'image' && (
          <Image
            source={{ uri: currentMessage.image }}
            style={{ width: 100, height: 100 }}
          />
        )}

        {/* Attachments */}
        {currentMessage.messageType === 'attachment' &&
          MediaGrid(currentMessage.attachments)}
      </Animated.View>

      {/* Reaction Icons */}

      {/* Message Status */}
      {currentMessage.status && (
        <Text
          style={{
            fontSize: 12,
            color: 'white',
            marginTop: 5,
            textAlign: isMyMessage ? 'right' : 'left',
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
    </Pressable>
  );
};

export default MessageItem;
