import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  useWindowDimensions,
  Animated,
  PanResponder,
  TouchableOpacity,
  Pressable,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Avatar, Bubble, Day } from 'react-native-gifted-chat';
import { useDispatch, useSelector } from 'react-redux';
import userMessage from '../../../../../../types/home_type/useMessage_type';
import useCheckingService from '../../../../../../services/Checking_service';
import { ReplyMessage } from './ReplyMessage';
import { ReactionIcons } from './ReactionIcons';
import { MessageComponent } from './RenderContentMessage ';
import { MessageStatus } from './MessageStatus';
import { messageIcon } from '../../../../../../types/react-type';
import { Message_type } from '../../../../../../types/home_type/Chat_type';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { participants } from '../../../../../../types/home_type/Converstation_type';
interface MessageProps {
  currentMessage: Message_type;
  previousMessage?: any;
  userChat: userMessage;
  highlightedMessageId: any;
  handleLongPress: (message: any) => void;
  handlerreplyTo: (message: any) => void;
  scrollToMessage: (messageId: string) => void;
  props: any;
  selectedMessages_id: any;
  setSelectedMessages: React.Dispatch<React.SetStateAction<any>>;
  setReactionPosition: React.Dispatch<React.SetStateAction<any>>;
  markPaticipantReadMessage: participants[];
  checkReadMessage?: any;
}

const MessageItem: React.FC<MessageProps> = ({
  // New comment to explain the component

  currentMessage,
  previousMessage,
  userChat,
  handleLongPress,
  handlerreplyTo,
  highlightedMessageId,
  scrollToMessage,
  props,
  selectedMessages_id,
  setSelectedMessages,
  setReactionPosition,
  markPaticipantReadMessage,
  checkReadMessage,
}) => {
  const { user } = useCheckingService();
  const [color] = useState(useSelector((state: any) => state.colorApp.value));
  const { width } = useWindowDimensions();
  const [sizeMessage, setSizeMessage] = useState<{
    widthMessage: number;
    heightMessage: number;
  }>({ widthMessage: 0, heightMessage: 0 });
  const SWIPE_THRESHOLD = width * 0.4; // Chỉ cần vuốt khoảng 1/4 màn hình
  const MAX_SWIPE_DISTANCE = width * 0.3; // Giảm khoảng cách tối đa
  const [showReactions, setShowReactions] = useState(false);
  const isMyMessage = currentMessage.user._id === userChat._id;
  const isFirstMessage =
    !previousMessage || currentMessage.user._id !== previousMessage.user._id;
  //  console.log(currentMessage.recall,'recal;')
  const translateX = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
      },
      onPanResponderMove: (_, gestureState) => {
        if (
          (isMyMessage && gestureState.dx < 0) ||
          (!isMyMessage && gestureState.dx > 0)
        ) {
          if (Math.abs(gestureState.dx) <= MAX_SWIPE_DISTANCE) {
            translateX.setValue(gestureState.dx);
          }
        }
      },
      onPanResponderRelease: (_, gestureState) => {
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
  // /  console.log(currentMessage.attachments)
  const handleLongPressMessage = (
    { x, y }: { x: number; y: number },
    message: any,
  ) => {
    setReactionPosition({ x, y }); // Lưu vị trí nhấn giữ
    handleLongPress(message); // Gọi hàm xử lý nhấn giữ
    setShowReactions(true);
  };

  return (
    <View style={{ marginBottom: 2, marginHorizontal: 10, position: 'relative' }}>
      <Day {...props} />
      {currentMessage.recall === false ? (
        currentMessage.receiver.includes(userChat.user_id) && (
          <>
            <Animated.View
              {...panResponder.panHandlers}
              style={{ transform: [{ translateX }] }}>
              {currentMessage.replyTo !== null &&
                currentMessage.replyTo.user && (
                  <ReplyMessage
                    currentMessage={currentMessage}
                    isMyMessage={isMyMessage}
                    scrollToMessage={scrollToMessage}
                    userChat={userChat}
                  />
                )}
              {currentMessage.statusSendding === null ||
                (currentMessage.statusSendding === false && isMyMessage && (
                  <View
                    style={{
                      alignSelf: 'flex-end',
                      position: 'absolute',
                      alignItems: 'center',
                      top: -10,
                      zIndex: 1,
                      alignContent: 'center',
                      justifyContent: 'flex-end',
                    }}>
                    <AntDesign name="exclamationcircle" size={18} color="red" />
                  </View>
                ))}
              <View
                style={{
                  flexDirection: 'row',
                }}>
                <View style={{ flex: 1 }}>
                  {checkReadMessage === currentMessage._id && (
                    <View style={{ alignItems: 'center', marginVertical: 10 }}>
                      <Text>Tin nhắn chưa đọc</Text>
                    </View>
                  )}
                  <MessageComponent
                    isFirstMessage={isFirstMessage}
                    isMyMessage={isMyMessage}
                    currentMessage={currentMessage}
                    props={props}
                    setSizeMessage={setSizeMessage}
                    handleLongPressMessage={handleLongPressMessage}
                    color={color}
                    userChat={userChat}
                    setSelectedMessages={setSelectedMessages}
                    highlightedMessageId={highlightedMessageId}
                  />
                  <View
                    style={{
                      width: sizeMessage.widthMessage,
                      height: 'auto',
                      backgroundColor: 'red',
                      bottom: 0,
                      left: 0,
                      alignSelf: 'flex-end',
                    }}></View>
                  {currentMessage.reactions.length > 0 &&
                    currentMessage.reactions.slice(-2).map((reaction: any) => {
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
                            bottom: 1,
                            alignSelf: isMyMessage ? 'flex-end' : 'flex-start',
                            marginLeft: 30
                          }}>
                          <Text style={{ fontSize: 18 }}>{icon.icon}</Text>
                        </TouchableOpacity>
                      ) : null;
                    })}
                </View>
              </View>
            </Animated.View>
            {markPaticipantReadMessage.map((item, index) => {
              if (
                item.message_readed_id === currentMessage._id &&
                item.user._id !== userChat._id
              ) {
                return (
                  <View
                    style={{ alignSelf: 'flex-end', marginTop: 10 }}
                    key={`${item.message_readed_id}-${item.user._id}`}>
                    <Image
                      key={index}
                      style={{ width: 15, height: 15, borderRadius: 25 }}
                      source={{
                        uri: item.user.avatar,
                      }}
                    />
                  </View>
                );
              }
              return null;
            })}
          </>
        )
      ) : (
        <View
          style={{
            alignSelf: isMyMessage ? 'flex-end' : 'flex-start',
            backgroundColor: color.gray,
            padding: 5,
            borderRadius: 5,
          }}>
          <Text style={{ fontWeight: 'bold', fontSize: 15 }}>
            Tin nhắn này bị thu hồi
          </Text>
        </View>
      )}

      {currentMessage.status && (
        <MessageStatus
          currentMessage={currentMessage}
          isMyMessage={isMyMessage}
        />
      )}
    </View>
  );
};

export default MessageItem;
