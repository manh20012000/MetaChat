import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useSelector} from 'react-redux';
import {Animated, FlatList, useWindowDimensions, Easing, Keyboard, Linking, NativeSyntheticEvent, NativeScrollEvent} from 'react-native';
import {GiftedChat} from 'react-native-gifted-chat';
import {API_ROUTE} from '../../../../service/api_enpoint';
import {useSocket} from '../../../../util/socket.io';
import {BottomSheetModal} from '@gorhom/bottom-sheet';
import {postFormData} from '../../../../service/resfull_api';
import useCheckingService from '../../../../service/Checking_service';
import Conversation from '../../../../type/Home/Converstation_type';
import {Message_type} from '../../../../type/Home/Chat_type';
import {
  Converstation_Message,
  deleteMessageError,
  MessageError,
  update_Converstation,
} from '../../../../cache_data/exportdata.ts/converstation_cache';
import {Vibration} from 'react-native';
import {converstationsend} from '../../../../util/util_chat/converstationSend';
import {updateMessageReaction} from '../../../../service/MesssageService';
import userMessage from '../../../../type/Home/useMessage_type';
import { User } from '@react-native-google-signin/google-signin';

export const useGiftedChatLogic = (conversation: Conversation) => {
  const {width, height} = useWindowDimensions();
  const color = useSelector(
    (value: {colorApp: {value: any}}) => value.colorApp.value,
  );
  const {user, dispatch} = useCheckingService();
  const giftedChatRef = useRef<any>(null);
  const socket = useSocket();
  const networkConnect = useSelector((value: any) => value.network.value);
  const[maginViewGiftedchat,setMaginViewGiftedchat]=useState<number>(0)
  const isPortrait = height > width;
  const sheetHeight40 = height * 0.4;
  const [messages, setMessages] = useState<any[]> (Array.from([
    ...conversation.messageError,
    ...conversation.messages,
  ]));

  const [highlightedMessageId, setHighlightedMessageId] = useState<string | null>(null);
  const [selectedItemsMedia, setSelectedItemsMedia] = useState<any[]>([]);
  const [buttonScale] = useState(new Animated.Value(1));
  const [maginTextInput, setMaginTextInput] = useState<boolean>(false);
  const [replyMessage, setReplyMessage] = useState<Message_type | null>(null);
  const [selectedMessages, setSelectedMessages] = useState<Message_type | null>(
    null,
  );
  const[markMessage,SetMarkMessage]=useState(conversation.isRead)
  const [typingUsers, setTypingUsers] = useState<{user:userMessage,isTyping:boolean}>();
  const [messageMoreAction, setMessageMoreAction] =
    useState<Message_type | null>(null);
  const [reactionPosition, setReactionPosition] = useState({x: 0, y: 0});
  const [userChat] = useState<any>(
    conversation.participants.find(
      (participant: any) => participant.user_id === user._id,
    ),
  );
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ['40%', '90%'], []);

  const handlePresentModalPress = useCallback(() => {
    setMaginViewGiftedchat(sheetHeight40)
    Keyboard.dismiss()
    bottomSheetModalRef.current?.present();
 
  }, []);

 const onPressPhoneNumber=async(phone:number)=>{

    const url = `tel:${phone}`;
    const supported = await Linking.canOpenURL(url);
    
    if (supported) {
      await Linking.openURL(url);
    }
 }
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

  const handlerSelectMedia = useCallback((item: any) => {
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
  }, [selectedItemsMedia]);
  const markMessageAsSeen = (messageId: string) => {
    socket?.emit("message_seen", { readingUser:conversation.isRead.filter(value=>{
       value.user._id===userChat._id
       return value
      }), roomId:conversation._id });
  };
  
  // useEffect(() => {
  //   console.log('có connect ', conversation.messageError);
  //   if (conversation.messageError.length > 0) {
  //     console.log('connect lại');
  //     conversation.messageError.forEach((message: Message_type) => {
  //       onSend(message, [], false);
  //     });
  //   }
  // }, []);
  useEffect(() => {
    socket?.on("userTyping", ({ user, isTyping }) => {
      setTypingUsers({user,isTyping});
    });
    // socket?.emit("message_seen", { messageId:messages[messages.length]._id, userChat, roomId:conversation._id  });
    return () => {
      socket?.off("userTyping");
    };
  }, []);
  // const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
  //   const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
  //   const isAtBottom = contentOffset.y + layoutMeasurement.height >= contentSize.height - 20;
  
  //   if (isAtBottom) {
  //     socket?.emit("message_seen", { messageId:messages[messages.length]._id, userChat, roomId:conversation._id });
  //   }
  // };
  const onSend = useCallback(
    async (message: Message_type, filesOrder: [], statusMessage: boolean) => { 
      const dataSaveSend = await converstationsend(
        message,
        filesOrder,
        userChat,
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
                ? {...msg, status: 'sent', statusSendding: true}
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
        const failedMessage: Message_type = {...message, statusSendding: false};
        if (!statusMessage) {
       
        } else {
         
          await MessageError(failedMessage, conversation, userChat);
        }
        setMessages((previousMessages: Message_type[]) =>
          previousMessages.map((msg: Message_type) =>
            msg._id === newMessage._id
              ? {...msg, status: 'failed', statusSendding: false}
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
          updatedMessages[i] = {...message};
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
          updatedMessages[i] = {...message};
          return updatedMessages;
        }
      }
      return GiftedChat.append(previousMessages, [message]);
    });
    await updateMessageReaction(message, conversation, userChat, {
      user,
      dispatch,
    });
  }, []);

  useEffect(() => {
    socket?.on('update_message', ({message, send_id}) => {
      if (send_id !== userChat.user_id) {
        setMessages(previousMessages => {
          for (let i = previousMessages.length - 1; i >= 0; i--) {
            if (previousMessages[i]._id === message._id) {
              const updatedMessages = [...previousMessages];
              updatedMessages[i] = {...message};
              return updatedMessages;
            }
          }
          return GiftedChat.append(previousMessages, [message]);
        });
      }
    });

    socket?.on('new_message', messages => {
      const {message, send_id} = messages;

      if (send_id !== userChat._id) {
        setMessages(previousMessages =>
          GiftedChat.append(previousMessages, message),
        );
      }
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

  return {
    color,
    userChat,
    messages,
    selectedItemsMedia,
    buttonScale,
    maginTextInput,
    replyMessage,
    selectedMessages,
    bottomSheetModalRef,maginViewGiftedchat,
    snapPoints,onPressPhoneNumber,
    setSelectedMessages,
    handlePresentModalPress,
    handleSheetChanges,setSelectedItemsMedia,
    scrollToMessage,
    handlerSelectMedia,
    onSend,
    handlerReaction,
    handlerreplyTo,
    handleLongPress,
    setMessageMoreAction,
    setReplyMessage,flatListRef,
    setReactionPosition,
    reactionPosition,
    messageMoreAction,
    handlerDeleteMessage,highlightedMessageId,typingUsers
  };
};
