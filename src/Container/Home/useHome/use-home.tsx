import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Alert, Button, Dimensions, useWindowDimensions} from 'react-native';
import {BottomSheetModal} from '@gorhom/bottom-sheet';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import {getData} from '../../../service/resfull_api.ts';
import {API_ROUTE} from '../../../service/api_enpoint.ts';
import {
  getConversations,
  createConversation,
  delete_converStation,
  Converstation_Message,
  updateMessage,
} from '../../../cache_data/exportdata.ts/converstation_cache.ts';
import {
  getListfriend,
  createListfriend,
} from '../../../cache_data/exportdata.ts/friend_cache.ts';
import {useSocket} from '../../../util/socket.io.tsx';
import {realm} from '../../../cache_data/Schema/schema_realm_model.tsx';
import Conversation from '../../../type/Home/Converstation_type.ts';
dayjs.extend(relativeTime);

export const useHomeLogic = (navigation: any) => {
  const {width, height} = useWindowDimensions();
  const color = useSelector((state: any) => state.colorApp.value);
  const user = useSelector((state: any) => state.auth.value);
  const dispatch = useDispatch();
  const user_Status = useSelector((state: any) => state.statusUser.value);
  const checkConnect = useSelector((state: any) => state.network.value);
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const isPortrait = height > width;
  const insets = useSafeAreaInsets();
  const socket = useSocket();

  const [data_convertstation, setData_convertStation] = useState<any>([]);
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
    console.log('nhấn vào xxoas', selectConverstion?._id);
    if (!selectConverstion) {
      console.log('retuen1');
      setModalVisible(false);
      return;
    }
    if (!checkConnect) {
      Alert.alert('warning', 'Kết nối không ổn định vui lòng thử lại');
      return;
    }

    // setData_convertStation((previewConverstatiom:Conversation[]) => {
    //   return previewConverstatiom.filter((item: Conversation) => item._id !== selectConverstion._id
    //   )
    // })
    setModalVisible(false);
    delete_converStation(selectConverstion, { dispatch, user });
    setSelectConverstation(null)
     
  }, []);

  const handlerShowmodal = useCallback((status: boolean) => {
    setModalVisible(status);
    console.log(selectConverstion, 'ẩn modal');
  }, []);

  const handlePresentModalPress = useCallback((item: Conversation) => {
    bottomSheetModalRef.current?.present();
    console.log(item._id, 'lấy được item');
    setSelectConverstation(item);
  }, []);

  const handleSheetChanges = useCallback((index: number) => {
    console.log('handleSheetChanges', index);
  }, []);

  const get_data = useCallback(async () => {
    const data_converstation = await getData(
      API_ROUTE.GET_CONVERTSTATION_CHAT,
      null,
      skip,
      {dispatch, user},
    );

    if (data_converstation.data.length > 0) {
      try {
        setSkiped(data_converstation.data.length);
        console.log(data_converstation.data.length, 'lấy được mấy cuộc thoại');
        data_converstation.data.forEach(async (element: Conversation) => {
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
      {dispatch, user},
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

  useEffect(() => {
    if (!socket) return;
    const handleConnect = () => {
      data_convertstation.forEach((item: any) => {
        socket.emit('join_room', {conversationId: item._id, user: user.name});
      });
    };

    const handleNewMessage = async (messages: any) => {
      const {message, conversation, send_id} = messages;
      console.log('có tin nhắn mới ', message.recall);
      await Converstation_Message(message, conversation, send_id);
    };

    const handlerUpdateMessage = async (messages: any) => {

      const {message, conversation, send_id} = messages;
      if (send_id !== user._id) {
        // console.log(user.name,'cập nhật cho ')
        updateMessage(message, conversation);
      }
    };
    if (socket.connected) {
      handleConnect();
    } else {
      socket.on('connect', handleConnect);
    }
    socket.on('update_message', handlerUpdateMessage);
    socket.on('new_message', handleNewMessage);
    const conversationObjects = realm.objects('Conversation');
    const updateConversations = async () => {
      if (!realm || realm.isClosed) {
        console.warn("Realm đã bị đóng hoặc không hợp lệ.");
        return;
      }
      let data_converstation = await getConversations();
      console.log('gọi hàm cập nhật')
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
      socket.off('update_message', handlerUpdateMessage);
      socket.off('connect', handleConnect);
      conversationObjects.removeListener(updateConversations);
    };
  }, [socket?.connected]);
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    const timer = setTimeout(() => {
      setRefreshing(false);
    }, 2000);

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
  
  };
};
