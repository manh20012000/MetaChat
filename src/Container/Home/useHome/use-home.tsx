import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Dimensions, useWindowDimensions } from 'react-native';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { getData } from '../../../service/resfull_api.ts';
import { API_ROUTE } from '../../../service/api_enpoint.ts';
import { getConversations, createConversation, delete_converStation } from '../../../cache_data/exportdata.ts/converstation_cache.ts';
import { getListfriend, createListfriend } from '../../../cache_data/exportdata.ts/friend_cache.ts';
import { useSocket } from '../../../util/socket.io.tsx';
import { realm } from '../../../cache_data/Schema/schema_realm_model.tsx';
import { Message_type } from '../../../type/Home/Chat_type.ts';
import Conversation from '../../../type/Home/Converstation_type.ts';
import { converstation } from '../../../util/util_chat/converstation.ts';
dayjs.extend(relativeTime);

export const useHomeLogic = (navigation: any) => {
    const { width, height } = useWindowDimensions();
    const color = useSelector((state: any) => state.colorApp.value);
    const user = useSelector((state: any) => state.auth.value);
    const dispatch = useDispatch();
    const user_Status = useSelector((state: any) => state.statusUser.value);

    const bottomSheetModalRef = useRef<BottomSheetModal>(null);
    const isPortrait = height > width;
    const insets = useSafeAreaInsets();
    const socket = useSocket();

    const [data_convertstation, setData_convertStation] = useState<any>([]);
    const [skip, setSkiped] = useState(0);
    const [skipfriend, setSkipfriend] = useState(0);
    const [onloading, setLoading] = useState<boolean>(false);
    const [orientation, setOrientation] = useState(
        Dimensions.get('window').height > Dimensions.get('window').width
            ? 'portrait'
            : 'landscape',
    );
    const [data_friend, setData_friend] = useState([]);
    const [selectConverstion, setSelectConverstation] = useState<Conversation>();
    const snapPoints = useMemo(() => ['70%'], []);
    const [modalVisible, setModalVisible] = useState<boolean>(false);

    const handleDelete = useCallback(() => {
        if (!selectConverstion) return;
        setModalVisible(false);
        delete_converStation(selectConverstion, { dispatch, user });
    }, [selectConverstion]);

    const handlerShowmodal = useCallback((status: boolean) => {
        setModalVisible(status);
    }, []);

    const handlePresentModalPress = useCallback((item: Conversation) => {
        setSelectConverstation(item);
        bottomSheetModalRef.current?.present();
    }, []);

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
                // let data_friend_chat = await getListfriend();
                // if (data_friend_chat.length > 0) {
                //   setData_friend(data_friend_chat);
                //   setSkipfriend(data_friend_chat.length);
                // } else {
                //   await getFriend_user();
                // }
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
                socket.emit('join_room', { conversationId: item._id, user: user.name });
            });
        };

        const handleNewMessage = (messages: any) => {
            const { message, conversation, send_id } = messages;
            console.log(user.name, send_id);
            const conditions = conversation.participantIds
                .map((id: any, index: any) => `participantIds CONTAINS $${index}`)
                .join(' AND ');

            const conversations = realm
                .objects('Conversation')
                .filtered(
                    `participantIds.@size == ${conversation.participantIds.length} AND ${conditions}`,
                    ...conversation.participantIds,
                );

            let existingConversation = conversations[0] || null;
            realm.write(() => {
                if (existingConversation) {
                    existingConversation.lastMessage = message;
                    (existingConversation.messages as Message_type[]).unshift(message);
                    existingConversation.updatedAt = message.createdAt;
                } else {
                    realm.create('Conversation', converstation(conversation, message));
                }
            });
        };

        const handlerUpdateMessage = async ({ converstation_id, updatedMessage }: { converstation_id: string; updatedMessage: Message_type }) => {
            if (!realm) return;
            realm.write(async () => {
                const conversation: Conversation = (
                    await realm
                    .objects<Conversation>('Conversation')
                    .filtered('_id == $0', converstation_id)[0]) as unknown as Conversation;
                if (conversation) {
                    if (!conversation.messages) {
                        conversation.messages = [];
                    }
                    let messageIndex = await conversation.messages.findIndex(msg => msg._id === updatedMessage._id);
                    if (messageIndex !== -1) {
                        conversation.messages[messageIndex] = updatedMessage;
                    } else {
                        conversation.messages = [...conversation.messages, updatedMessage];
                    }
                }
            });
        };

        if (socket.connected) {
            handleConnect();
        } else {
            socket.on('connect', handleConnect);
        }
        socket.on('updateMessage', handlerUpdateMessage);
        socket.on('new_message', handleNewMessage);
        const conversationObjects = realm.objects('Conversation');
        const updateConversations = async () => {
            let data_converstation = await getConversations();
            setData_convertStation(data_converstation);
            let data_friend_chat = await getListfriend();
            if (data_friend_chat.length > 0) {
                setData_friend(data_friend_chat);
                setSkipfriend(data_friend_chat.length);
            }
        };
        conversationObjects.addListener(updateConversations);
        return () => {
            socket.off('new_message', handleNewMessage);
            socket.off('updateMessage', handlerUpdateMessage);
            socket.off('connect', handleConnect);
            conversationObjects.removeListener(updateConversations);
        };
    }, [socket?.connected]);
   
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
        selectConverstion,
        snapPoints,
        modalVisible,
        handleDelete,
        setModalVisible,
        handlerShowmodal,
        handlePresentModalPress,
        handleSheetChanges,
        navigation,
    };
};