import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useSelector} from 'react-redux';
import {Animated, FlatList, useWindowDimensions, Easing} from 'react-native';
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

export const useGiftedChatLogic = (conversation: Conversation) => {
  const {width, height} = useWindowDimensions();
  const color = useSelector(
    (value: {colorApp: {value: any}}) => value.colorApp.value,
  );
  const {user, dispatch} = useCheckingService();
  const socket = useSocket();
  const networkConnect = useSelector((value: any) => value.network.value);
  const isPortrait = height > width;

  const [messages, setMessages] = useState<any[]> (Array.from([
    ...conversation.messageError,
    ...conversation.messages,
  ]));
  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  const [buttonScale] = useState(new Animated.Value(1));
  const [maginTextInput, setMaginTextInput] = useState<boolean>(false);
  const [replyMessage, setReplyMessage] = useState<Message_type | null>(null);
  const [selectedMessages, setSelectedMessages] = useState<Message_type | null>(
    null,
  );
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
    bottomSheetModalRef.current?.present();
  }, []);

  const handleSheetChanges = useCallback((index: number) => {
    if (index === -1) {
      setMaginTextInput(false);
      setSelectedItems([]);
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
    if (selectedItems.length > 0) {
      triggerAnimation();
    }
  }, [selectedItems]);

  const flatListRef = useRef<FlatList<any> | null>(null);

  const scrollToMessage = (messageId: string) => {
    const index = messages.findIndex(msg => msg._id === messageId);
    if (index !== -1) {
      flatListRef.current?.scrollToIndex({index, animated: true});
    }
  };

  const handleSelect = useCallback((item: any) => {
    setSelectedItems(prevSelectedItems => {
      const isSelected = prevSelectedItems.some(
        (selected: any) => selected.id === item.node.id,
      );

      if (isSelected) {
        return prevSelectedItems.filter(
          (selected: any) => selected.id !== item.node.id,
        );
      } else {
        return [...prevSelectedItems, item.node];
      }
    });
  }, []);
  // useEffect(() => {
  //   console.log('có connect ', conversation.messageError);
  //   // if (conversation.messageError.length > 0) {
  //   //   console.log('connect lại');
  //   //   conversation.messageError.forEach((message: Message_type) => {
  //   //     onSend(message, [], false);
  //   //   });
  //   // }
  // }, []);
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
    selectedItems,
    buttonScale,
    maginTextInput,
    replyMessage,
    selectedMessages,
    bottomSheetModalRef,
    snapPoints,
    setSelectedMessages,
    handlePresentModalPress,
    handleSheetChanges,
    scrollToMessage,
    handleSelect,
    onSend,
    handlerReaction,
    handlerreplyTo,
    handleLongPress,
    setMessageMoreAction,
    setReplyMessage,
    setReactionPosition,
    reactionPosition,
    messageMoreAction,
    handlerDeleteMessage,
  };
};
