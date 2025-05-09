import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Alert, Button, Dimensions, useWindowDimensions } from 'react-native';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { getData } from '../../../services/resfull_api.ts';
import { API_ROUTE } from '../../../services/api_enpoint.ts';
import {
  getConversations,
  createConversation,
  delete_converStation,
  Converstation_Message,
  updateMessage,
  recallMessage,
  deleteMessageError,
  deleteMessage,
  handlerMarkMessageRead,
  delete_converStation_deviceOther,
} from '../../../cache_datas/exportdata.ts/converstation_cache.ts';
import {
  getListfriend,
  createListfriend,
} from '../../../cache_datas/exportdata.ts/friend_cache.ts';
import { useSocket } from '../../../provinders/socket.io.tsx';
import { realm } from '../../../cache_datas/schema/schema_realm_model.tsx';
import Conversation from '../../../types/home_type/Converstation_type.ts';
import userMessage from '../../../types/home_type/useMessage_type.ts';
dayjs.extend(relativeTime);

export const useHomeLogic = (navigation: any) => {
  const { width, height } = useWindowDimensions();
  const color = useSelector((state: any) => state.colorApp.value);
  const deviceInfo = useSelector(
    (value: { deviceInfor: { value: any } }) => value.deviceInfor.value,
  );

  const user = useSelector((state: any) => state.auth.value);

  const dispatch = useDispatch();
  const user_Status = useSelector((state: any) => state.statusUser.value);
  const checkConnect = useSelector((state: any) => state.network.value);
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const isPortrait = height > width;
  const insets = useSafeAreaInsets();
  const socket = useSocket();
  const [typingUsers, setTypingUsers] = useState<{
    userChat: userMessage;
    isTyping: boolean;
    deviceSend: string;
    roomId: string;
  }>();
  const [data_convertstation, setData_convertStation] = useState<
    Conversation[]
  >([]);
  const [skip, setSkiped] = useState(0);
  const [skipfriend, setSkipfriend] = useState(0);
  const [onloading, setLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState(false);
  const [orientation, setOrientation] = useState(
    Dimensions.get('window').height > Dimensions.get('window').width
      ? 'portrait'
      : 'landscape',
  );

  const [data_friend, setData_friend] = useState([]);
  const [selectConverstion, setSelectConverstation] =
    useState<Conversation | null>(null);
  const snapPoints = useMemo(() => ['70%'], []);
  const [modalVisible, setModalVisible] = useState<boolean>(false);

  const handleDeleteConverStation = useCallback(() => {
    if (!selectConverstion) {
      setModalVisible(false);
      return;
    }
    if (!checkConnect) {
      Alert.alert('warning', 'Kết nối không ổn định vui lòng thử lại');
      return;
    }

    setData_convertStation((previewConverstatiom: Conversation[]) => {
      return previewConverstatiom.filter(
        (item: Conversation) => item._id !== selectConverstion._id,
      );
    });
    setModalVisible(false);
    delete_converStation(selectConverstion, { dispatch, user }, deviceInfo);
    setSelectConverstation(null);
  }, [selectConverstion]);

  const handlerShowmodal = useCallback(
    (status: boolean) => {
      setModalVisible(status);
    },
    [selectConverstion],
  );

  const handlePresentModalPress = useCallback(
    (item: Conversation) => {
      bottomSheetModalRef.current?.present();

      setSelectConverstation(item);
    },
    [selectConverstion],
  );

  const handleSheetChanges = useCallback((index: number) => {
    console.log('handleSheetChanges', index);
  }, []);

  const get_data = useCallback(async () => {
    const data_converstation = await getData(
      API_ROUTE.GET_CONVERTSTATION_CHAT,
      null,
      skip,
      { dispatch, user },
    );
    if (data_converstation.data.length > 0) {
      try {
        setSkiped(data_converstation.data.length);
        data_converstation.data.forEach(async (element: Conversation) => {
          // console.log(element.participants);
          await createConversation(element);
        });
      } catch (err) {
        console.log(err, 'lỗi thêm cuộc thoại vào local');
      } finally {
        setData_convertStation(data_converstation.data);
      }
    }
  }, []);

  const getFriend_user = async () => {
    const listuser = await getData(
      API_ROUTE.GET_LIST_FRIEND_CHAT,
      null,
      skipfriend,
      { dispatch, user },
    );

    if (listuser.friend.length > 0) {
      setData_friend(listuser.friend);
      listuser.friend.forEach(async (element: any) => {
        await createListfriend(element);
      });
      setSkipfriend(listuser.friend.length);
    }
  };

  useEffect(() => {
    const getChatuser = async () => {
      try {
        let data_converstation = await getConversations();
        setSkiped(data_converstation.length);
        if (data_converstation.length > 0) {
          setData_convertStation(data_converstation);
        } else {
          await get_data();
        }
      } catch (error: any) {
        console.log(error, 'error convert api GET_CONVERTSTATION_CHAT ');
        throw new Error();
      }
    };

    const getFriend_user_chat = async () => {
      try {
        let data_friend_chat = await getListfriend();
        if (data_friend_chat.length > 0) {
          setData_friend(data_friend_chat);
          setSkipfriend(data_friend_chat.length);
        } else {
          await getFriend_user();
        }
      } catch (error: any) {
        console.log(error, 'error convert api GET_LIST_FRIEND_CHAT ');
        throw new Error();
      }
    };

    const checkout = async () => {
      try {
        setLoading(true);
        await Promise.allSettled([getChatuser(), getFriend_user_chat()]);
        setLoading(false);
      } catch (err) {
        console.log(err + 'loi promise');
      }
    };
    checkout();
  }, []);
  const typingTimeoutRef = useRef<any>(null);
  const handlerEndReciverTyping = useCallback(
    (userChat, isTyping, deviceSend, roomId) => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current); // Clear timeout cũ nếu có
      }
      // if (isTyping === false) {
      //   console.log('nhảy vào đây ', isTyping);
      //   // Nếu không còn typing thì xử lý ngay
      //   setTypingUsers({ userChat, isTyping, deviceSend, roomId });
      //   return;
      // }
      typingTimeoutRef.current = setTimeout(() => {
        setTypingUsers({ userChat, isTyping, deviceSend, roomId });
      }, 3000);
    },
    [],
  );

  useEffect(() => {
    if (!socket) return;
    const handleConnect = () => {
      data_convertstation.forEach((item: any) => {
        socket.emit('join_room', { conversationId: item._id, user: user.name });
      });
    };

    const handleNewMessage = async (messages: any) => {
      try {
        const { message, conversation, send_id, type, deviceSend, userSend } =
          messages;
        const typeNumber = Number(type);
        if (typeNumber !== 6) {
          setTypingUsers({ userChat: message.user, isTyping: false, deviceSend: deviceSend, roomId: conversation._id });
        }
        if (typeNumber === 1) {

          await Converstation_Message(message, conversation, send_id);
        } else if (typeNumber === 2) {
          if (send_id !== user._id) {
            // thực hiện cập nhật tin nhắn mới
            updateMessage(message, conversation);
          }
        } else if (typeNumber === 3) {
          //xóa tin nhắn
          if (deviceSend !== deviceInfo) {
            recallMessage(conversation._id, message._id);
          }
        } else if (typeNumber === 4) {
          if (send_id === user._id && deviceSend !== deviceInfo) {
            deleteMessage(conversation._id, message._id);
          }
        } else if (typeNumber === 5) {
          // xóa cuộc thoại trên thiết bị của user này xóa nhưng họ đăng nhập trên thiết bị khác
          if (send_id === user._id && deviceSend !== deviceInfo) {
            delete_converStation_deviceOther(conversation._id);
          }
        } else if (typeNumber === 6) {
          // đánh dấu tin nhắn đã đọc
          handlerMarkMessageRead(conversation._id, conversation.participants);
        }
      } catch (error) {
        console.log('lỗi khi chèn message', error);
      }
    };

    if (socket.connected) {
      handleConnect();
    } else {
      socket.on('connect', handleConnect);
    }
    socket?.on('userTyping', ({ userChat, isTyping, deviceSend, roomId }) => {
      if (userChat._id !== user._id && deviceSend !== deviceInfo) {
        setTypingUsers({ userChat, isTyping, deviceSend, roomId });
        handlerEndReciverTyping(userChat, false, deviceSend, roomId);
      }
    });

    socket.on('new_message', handleNewMessage);
    const conversationObjects = realm.objects('Conversation');
    const updateConversations = async () => {
      if (!realm || realm.isClosed) {
        console.warn('Realm đã bị đóng hoặc không hợp lệ.');
        return;
      }
      let data_converstation = await getConversations();
      setData_convertStation(data_converstation);
      // let data_friend_chat = await getListfriend();
      // if (data_friend_chat.length > 0) {
      //   setData_friend(data_friend_chat);
      //   setSkipfriend(data_friend_chat.length);
      // }
    };
    conversationObjects.addListener(updateConversations);
    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('connect', handleConnect);
      conversationObjects.removeListener(updateConversations);
      socket?.off('userTyping');
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [socket?.connected]);
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    const timer = setTimeout(() => {
      setRefreshing(false);
    }, 1000);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  return {
    color,
    user,
    user_Status,
    bottomSheetModalRef,
    isPortrait,
    insets,
    socket,
    data_convertstation,
    onloading,
    data_friend,
    snapPoints,
    modalVisible,
    handleDeleteConverStation,
    setModalVisible,
    handlerShowmodal,
    handlePresentModalPress,
    handleSheetChanges,
    navigation,
    refreshing,
    onRefresh,
    typingUsers,
  };
};
