import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Animated,
  FlatList,
  useWindowDimensions,
  Easing,
  Keyboard,
  Linking,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { GiftedChat } from 'react-native-gifted-chat';
import { API_ROUTE } from '../../../../service/api_enpoint';
import { useSocket } from '../../../../util/socket.io';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { postFormData } from '../../../../service/resfull_api';
import useCheckingService from '../../../../service/Checking_service';
import Conversation, {
  participants,
} from '../../../../type/Home/Converstation_type';
import { Message_type } from '../../../../type/Home/Chat_type';
import {
  Converstation_Message,
  deleteMessage,
  deleteMessageError,
  MessageError,
  recallMessage,
  update_Converstation,
} from '../../../../cache_data/exportdata.ts/converstation_cache';
import { Vibration } from 'react-native';
import { converstationsend } from '../../../../util/util_chat/converstationSend';
import { updateMessageReaction } from '../../../../service/MesssageService';
import userMessage from '../../../../type/Home/useMessage_type';

export const useGiftedChatLogic = (conversation: Conversation) => {
  const { width, height } = useWindowDimensions();
  const color = useSelector(
    (value: { colorApp: { value: any } }) => value.colorApp.value,
  );

  const deviceInfo = useSelector(
    (value: { deviceInfor: { value: any } }) => value.deviceInfor.value,
  );
  const { user, dispatch } = useCheckingService();
  const giftedChatRef = useRef<any>(null);
  const socket = useSocket();
  const networkConnect = useSelector((value: any) => value.network.value);
  const [maginViewGiftedchat, setMaginViewGiftedchat] = useState<number>(0);
  const isPortrait = height > width;
  const sheetHeight40 = height * 0.4;
  const [messages, setMessages] = useState<any[]>(
    Array.from([...conversation.messageError, ...conversation.messages]),
  );

  const [markPaticipantReadMessage, SetMarkPaticipantReadMessage] = useState<
    participants[]
  >(conversation.participants);
  const [checkReadMessage, setCheckReadMessage] = useState<string | null>(null);
  // console.log(conversation.participants)
  const [showUserRead, setShowUserRead] = useState(conversation.participants);
  const [highlightedMessageId, setHighlightedMessageId] = useState<
    string | null
  >(null);

  const [selectedItemsMedia, setSelectedItemsMedia] = useState<any[]>([]);
  const [buttonScale] = useState(new Animated.Value(1));
  const [maginTextInput, setMaginTextInput] = useState<boolean>(false);
  const [replyMessage, setReplyMessage] = useState<Message_type | null>(null);
  const [selectedMessages, setSelectedMessages] = useState<Message_type | null>(
    null,
  );

  const [typingUsers, setTypingUsers] = useState<{
    userChat: userMessage;
    isTyping: boolean;
    deviceSend: string;
    roomId: string;
  }>();
  const [messageMoreAction, setMessageMoreAction] =
    useState<Message_type | null>(null);
  const [reactionPosition, setReactionPosition] = useState({ x: 0, y: 0 });
  const [userChat] = useState<any>(
    conversation.participants.find(
      (participant: any) => participant.user.user_id === user._id,
    )?.user || null,
  );

  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ['40%', '90%'], []);

  const handlePresentModalPress = useCallback(() => {
    setMaginViewGiftedchat(sheetHeight40);
    Keyboard.dismiss();
    bottomSheetModalRef.current?.present();
  }, []);

  const onPressPhoneNumber = async (phone: number) => {
    const url = `tel:${phone}`;
    const supported = await Linking.canOpenURL(url);

    if (supported) {
      await Linking.openURL(url);
    }
  };
  const handleSheetChanges = useCallback((index: number) => {
    if (index === -1) {
      setMaginTextInput(false);
      setSelectedItemsMedia([]);
      setMaginViewGiftedchat(0);
      bottomSheetModalRef.current?.dismiss();
    }
  }, []);

  const triggerAnimation = () => {
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 1.2,
        duration: 150,
        easing: Easing.ease,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 150,
        easing: Easing.ease,
        useNativeDriver: true,
      }),
    ]).start();
  };

  useEffect(() => {
    if (selectedItemsMedia.length > 0) {
      triggerAnimation();
    }
  }, [selectedItemsMedia]);

  const flatListRef = useRef<FlatList>(null); // Ref của FlatList

  const scrollToMessage = (messageId: string) => {
    const index = messages.findIndex(msg => msg._id === messageId);
    if (index !== -1 && flatListRef.current) {
      setHighlightedMessageId(messageId); // Đánh dấu tin nhắn đang highlight
      flatListRef.current.scrollToIndex({ index, animated: true });
      setTimeout(() => setHighlightedMessageId(null), 2000);
    }
  };

  const handlerSelectMedia = useCallback(
    (item: any) => {
      setSelectedItemsMedia(prevSelectedItems => {
        const isSelected = prevSelectedItems.some(
          (selected: any) => selected.id === item.id,
        );

        if (isSelected) {
          return prevSelectedItems.filter(
            (selected: any) => selected.id !== item.id,
          );
        } else {
          return [...prevSelectedItems, item];
        }
      });
    },
    [selectedItemsMedia],
  );

  // useEffect(() => {
  //   console.log('có connect ', conversation.messageError);
  //   if (conversation.messageError.length > 0 && networkConnect) {
  //     console.log('connect lại');
  //     conversation.messageError.forEach((message: Message_type) => {
  //       onSend(message, [], false);
  //     });
  //   }
  // }, [networkConnect]);
  const typingTimeoutRef = useRef<any>(null);

  const handlerEndReciverTyping = useCallback(
    (userChat, isTyping, deviceSend, roomId) => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current); // Clear timeout cũ nếu có
      }

      typingTimeoutRef.current = setTimeout(() => {
        setTypingUsers({ userChat, isTyping, deviceSend, roomId });
      }, 3000);
    },
    [],
  );

  const onSend = useCallback(
    async (message: Message_type, filesOrder: [], statusMessage: boolean) => {
      const dataSaveSend = await converstationsend(
        message,
        filesOrder,
        userChat,
        deviceInfo,
        conversation,
      );

      const newMessage = {
        ...message,
        user: {
          _id: userChat._id,
          name: userChat.name,
          avatar: userChat.avatar,
          use_id: user._id,
        },
        status: 'sending',
      };

      try {
        if (statusMessage) {
          setMessages(previousMessages =>
            GiftedChat.append(previousMessages, [newMessage]),
          );
        }
        const response = await postFormData(
          API_ROUTE.SEND_MESSAGE,
          dataSaveSend,
          {
            dispatch,
            user,
          },
        );

        if (response.status === 200) {
          setMessages(previousMessages =>
            previousMessages.map(msg =>
              msg._id === newMessage._id
                ? { ...msg, status: 'sent', statusSendding: true }
                : msg,
            ),
          );
          if (!statusMessage) {
            deleteMessageError(conversation._id, message._id);
          }
        } else {
          throw new Error('Message sending failed');
        }
      } catch (error) {
        const failedMessage: Message_type = { ...message, statusSendding: false };
        if (!statusMessage) {
        } else {
          await MessageError(failedMessage, conversation, userChat);
        }
        setMessages((previousMessages: Message_type[]) =>
          previousMessages.map((msg: Message_type) =>
            msg._id === newMessage._id
              ? { ...msg, status: 'failed', statusSendding: false }
              : msg,
          ),
        );
        console.error('send message failed:', error);
      }
    },
    [],
  );
  const handlerDeleteMessage = useCallback(async (message: Message_type) => {
    setMessageMoreAction(null);
    setSelectedMessages(null);
    setMessages(previousMessages => {
      for (let i = previousMessages.length - 1; i >= 0; i--) {
        if (previousMessages[i]._id === message._id) {
          const updatedMessages = [...previousMessages];
          updatedMessages[i] = { ...message };
          return updatedMessages;
        }
      }
      return GiftedChat.append(previousMessages, [message]);
    });
  }, []);
  const handlerReaction = useCallback(async (message: Message_type) => {
    setSelectedMessages(null);
    setMessages(previousMessages => {
      for (let i = previousMessages.length - 1; i >= 0; i--) {
        if (previousMessages[i]._id === message._id) {
          const updatedMessages = [...previousMessages];
          updatedMessages[i] = { ...message };
          return updatedMessages;
        }
      }
      return GiftedChat.append(previousMessages, [message]);
    });
    await updateMessageReaction(message, conversation, userChat, deviceInfo, {
      user,
      dispatch,
    });
  }, []);

  const handlerreplyTo = useCallback((props: Message_type) => {
    Vibration.vibrate(50);
    setReplyMessage(props);
  }, []);

  const handleLongPress = useCallback((message: any) => {
    Vibration.vibrate(50);
    setSelectedMessages(message);
  }, []);
  // const checkAndMarkReadMessages =()=>{
  //   if (!messages || messages.length === 0) return;
  // }
  const handlerSendMarkReadMessge = useCallback((message: Message_type) => {
    socket?.emit('send_message_seen', {
      message: message, // mesage lấy id để đánh dấu là xem
      user: userChat, //người xem
      conversation: conversation,
      deviceInfo: deviceInfo,
    });
  }, []);

  const handlerMarkMessage = () => {
    if (!conversation.messages || conversation.messages.length === 0 || !conversation || !userChat)
      return;
    // tin nhắn mới nhất đã được sắp sếp lên đầu 
    const lastMessage = [...conversation.messages]
      .find(msg => msg.user._id !== userChat._id); // tìm tin nhắn cuối cùng KHÔNG phải của mình

    // lấy ra vị trí mình đoc trước đó 
    const currentUserParticipant = conversation.participants.find(
      (value: participants) => value.user._id === userChat._id,
    );

    if (!currentUserParticipant || !lastMessage) return;

    const lastReadMessageId = currentUserParticipant.message_readed_id;
    // console.log(lastReadMessageId)
    // Nếu tin nhắn cuối cùng chưa được đánh dấu là đã đọc
    if (lastReadMessageId !== lastMessage._id) {
      // Gửi sự kiện đã đọc cho người khác biết
      handlerSendMarkReadMessge(lastMessage);
      // setIsReadMessage(lastMessage); // lưu lại tin đã đọc
    }

    // === Xác định vị trí đánh dấu là "bắt đầu tin nhắn chưa đọc" ===

    const indexLastRead = conversation.messages.findIndex(
      msg => msg._id === lastReadMessageId,
    );
    // console.log(indexLastRead)
    // Tìm message tiếp theo sau tin đã đọc trước đó
    const nextUnreadMessage = conversation.messages
      .slice(indexLastRead + 1)
      .find(msg => msg.user._id !== userChat._id); // bỏ qua tin của mình

    if (nextUnreadMessage) {
      setCheckReadMessage(nextUnreadMessage._id);
    } else {
      setCheckReadMessage(null);
    }
  };


  const HandlerUpdateReadMessage = useCallback((message: Message_type, user: userMessage) => {
    const updatedParticipants = markPaticipantReadMessage.map(
      (participant: participants) => {
        if (user._id === participant.user._id) {
          return {
            ...participant,
            user: {
              ...user,
              message_readed_id: message._id, // Cập nhật ID tin nhắn đã đọc
              readAt: new Date().toISOString(),
            },
          };
        }
        return participant;
      },
    );
    if (!updatedParticipants) return;
    SetMarkPaticipantReadMessage(updatedParticipants);
  }, []);
  useEffect(() => {
    handlerMarkMessage();
    socket?.on('new_message', messages => {
      const { message, send_id, type, deviceSend, conversation } = messages;
      const typeNumber = Number(type);
      if (typeNumber === 1) {
        //sự kiện cho tin nhắn mới
        if (deviceSend !== deviceInfo) {
          handlerEndReciverTyping(userChat, false, deviceSend, null);
          setMessages(previousMessages =>
            GiftedChat.append(previousMessages, message),
          );
          handlerSendMarkReadMessge(message);
        }
      } else if (typeNumber === 2) {
        if (deviceSend !== deviceInfo) {
          //sự kiện cập nhật tin nhắn
          setMessages(previousMessages => {
            for (let i = previousMessages.length - 1; i >= 0; i--) {
              if (previousMessages[i]._id === message._id) {
                const updatedMessages = [...previousMessages];
                updatedMessages[i] = { ...message };
                return updatedMessages;
              }
            }
            return GiftedChat.append(previousMessages, [message]);
          });
        }
      } else if (typeNumber === 3) {
        if (deviceSend !== deviceInfo) {
          //sự kiện xóa tin nhắ
          console.log('hpidnsdnsjdnsndsk recall mesage');
          handlerDeleteMessage(message);
        }
      } else if (typeNumber === 4) {
        //sự kiện thu hồi tin nhắn
        if (send_id === userChat.user_id && deviceSend !== deviceInfo) {
          handlerDeleteMessage(message);
        }
      } else if (typeNumber === 6) {

        // sụ kiện đánh dấu message đã đọc
        if (deviceSend !== deviceInfo) {
          SetMarkPaticipantReadMessage(conversation.participants)
          //HandlerUpdateReadMessage(message, userChat);
        }
      }
    });
    socket?.on('userTyping', ({ userChat, isTyping, deviceSend, roomId }) => {
      if (userChat._id !== user._id && deviceSend !== deviceInfo) {
        setTypingUsers({ userChat, isTyping, deviceSend, roomId });
        handlerEndReciverTyping(userChat, false, deviceSend, roomId);
      }
    });
    return () => {
      socket?.off('new_message');
      socket?.off('userTyping');
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);
  return {
    color,
    userChat,
    messages,
    selectedItemsMedia,
    buttonScale,
    maginTextInput,
    replyMessage,
    selectedMessages,
    bottomSheetModalRef,
    maginViewGiftedchat,
    snapPoints,
    onPressPhoneNumber,
    setSelectedMessages,
    handlePresentModalPress,
    handleSheetChanges,
    setSelectedItemsMedia,
    scrollToMessage,
    handlerSelectMedia,
    onSend,
    handlerReaction,
    handlerreplyTo,
    handleLongPress,
    setMessageMoreAction,
    setReplyMessage,
    flatListRef,
    setReactionPosition,
    reactionPosition,
    messageMoreAction,
    handlerDeleteMessage,
    highlightedMessageId,
    typingUsers,
    checkReadMessage,
    markPaticipantReadMessage,
  };
};
//const markMessageAsSeen = (messageId: string) => {
//   socket?.emit('message_seen', {
//     readingUser: conversation.isRead.filter(value => {
//       value.user._id === userChat._id;
//       return value;
//     }),
//     roomId: conversation._id,
//   });
// };
//  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
//   const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
//   const isAtBottom = contentOffset.y + layoutMeasurement.height >= contentSize.height - 20;

//   if (isAtBottom) {
//     socket?.emit("message_seen", { messageId:messages[messages.length]._id, userChat, roomId:conversation._id });
//   }
// };
// useEffect(() => {
//   // 📌 Lọc ra tin nhắn cuối cùng mà người khác gửi
//   const lastMessage = messages
//     .filter(msg => msg.user._id !== user._id) // Chỉ lấy tin nhắn người khác gửi
//     .pop(); // Lấy tin nhắn cuối cùng

//   if (!lastMessage) return; // Nếu không có tin nhắn thì không làm gì cả

//   // 📌 Kiểm tra xem tin nhắn đã có trong isRead chưa
//   const isAlreadyRead = markMessage.some(
//     read => read.messageId === lastMessage._id && read.user._id === user._id
//   );

//   if (!isAlreadyRead) {
//     // 📌 Nếu chưa đọc, gửi sự kiện "message:read" lên server
//     socket?.emit("message:read", {
//       conversationId: conversation._id,
//       messageId: lastMessage._id,
//       user: {
//         _id: user._id,
//         name: user.name,
//         avatar: user.avatar
//       },
//       readAt: new Date().toISOString(),
//     });
//     // Cập nhật state để không gửi lại sự kiện
//     // SetMarkMessage(prev =>

//     //   {
//     //     user: { _id: user._id, name: user.name, avatar: user.avatar },
//     //     messageId: lastMessage._id,
//     //     readAt: new Date().toISOString(),
//     //   },
//     // );
//   }
// }, [messages]); // Chạy khi tin nhắn thay đổi
// const handlerMoreMessage = useCallback(async (message: any) => {
//   console.log(message)
//   setMessageMoreAction(message)
//   // setMessages((prevMessages: any) =>
//   //   prevMessages.filter((id: any) => id._id !== message._id),
//   // );
//   // setSelectedMessages(null);
// }, []);
