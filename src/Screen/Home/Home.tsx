import {
  View,
  Text,
  StatusBar,
  FlatList,
  Image,
  TouchableOpacity,
  Pressable,
  Dimensions,
  useWindowDimensions,
  ActivityIndicator,
  Modal,
} from 'react-native';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import HeaderHome from './homeComponent/HeaderHome';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {UseDispatch, useSelector, useDispatch} from 'react-redux';
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetModalProvider,
} from '@gorhom/bottom-sheet';
import Statusbar from '../Component/Home_search/HomeSearch/StatusBar.tsx';
import {Pen} from '../../assets/svg/svgfile';
import BottonsheetHome from './homeComponent/BottomsheetHome';
import Conversation from '../../type/Converstation_type.ts';
import {getData} from '../../service/resfull_api';
import {API_ROUTE} from '../../service/api_enpoint';
import dayjs from 'dayjs';
import {
  getConversations,
  createConversation,
  delete_converStation,
} from '../../cache_data/exportdata.ts/converstation_cache.ts';
import relativeTime from 'dayjs/plugin/relativeTime';
import {realm} from '../../cache_data/Schema/schema_realm_model.tsx';
import {useSocket} from '../../util/socket.io';
import {Message_type} from '../../type/Chat_type.ts';
import {
  createListfriend,
  getListfriend,
} from '../../cache_data/exportdata.ts/friend_cache.ts';
import userMessage from '../../type/useMessage_type.ts';
import Ionicons from 'react-native-vector-icons/Ionicons';
dayjs.extend(relativeTime); // Kích hoạt plugin
export default function Home({navigation}: {navigation: any}) {
  const {width, height} = useWindowDimensions();
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
    delete_converStation(selectConverstion, {dispatch, user});
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
      {dispatch, user},
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
  const now = new Date();
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
  // Thời gian lưu trữ

  useEffect(() => {
    if (!socket) return; // Nếu socket chưa khởi tạo, thoát
    const handleConnect = () => {
      data_convertstation.forEach((item: any) => {
        socket.emit('join_room', {conversationId: item._id, user: user.name});
      });
    };
    const handleNewMessage = (messages: any) => {
      const { message, conversation, send_id } = messages;
      console.log(user.name, send_id)
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
          (existingConversation.messages as Message_type[]).unshift(
            message,
          );
          existingConversation.updatedAt = message.createdAt;
        } else {
          realm.create('Conversation', {
            _id: conversation._id,
            roomName: conversation.roomName,
            avatar: conversation.avatar,
            participants: conversation.participants,
            color: conversation.color,
            icon: conversation.icon,
            background: conversation.background,
            participantIds: conversation.participantIds,
            lastMessage: message,
            messages: [message],
            updatedAt: message.createdAt,
          });
        }
      });
    };
    const handlerUpdateMessage = async ({
      converstation_id,
      updatedMessage,
    }: {
      converstation_id: string;
      updatedMessage: Message_type;
    }) => {
      if (!realm) return; // Kiểm tra realm có tồn tại không
      realm.write(async () => {
        // 🔹 Tìm cuộc hội thoại trong Realm
        const conversation: Conversation = (await realm
          .objects<Conversation>('Conversation')
          .filtered(
            '_id == $0',
            converstation_id,
          )[0]) as unknown as Conversation;
        if (conversation) {
          // 🔹 Đảm bảo messages là một mảng Realm hợp lệ
          if (!conversation.messages) {
            conversation.messages = [];
          }
          let messageIndex = await conversation.messages.findIndex(
            msg => msg._id === updatedMessage._id,
          );
          if (messageIndex !== -1) {
            // ✅ Cập nhật tin nhắn trong danh sách messages
            conversation.messages[messageIndex] = updatedMessage;
          } else {
            // ✅ Nếu chưa có tin nhắn thì thêm vào
            conversation.messages = [...conversation.messages, updatedMessage];
          }
        }
      });
    };
    // Nếu socket đã kết nối, thực hiện ngay
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
  return (
    <BottomSheetModalProvider>
      <View
        style={{
          flex: 1,
          backgroundColor: color.white,
          // paddingTop: insets.top,
        }}>
        <Statusbar
          bgrstatus={color.dark}
          bgrcolor={color.light}
          translucent={true}
        />
        {onloading === true ? (
          <ActivityIndicator size="large" color="#00ff00" />
        ) : (
          <View style={{flex: 1, backgroundColor: color.dark}}>
            <FlatList
              refreshing
              ListHeaderComponent={
                <HeaderHome navigation={navigation} data_friend={data_friend} />
              }
              keyExtractor={(item, index) => item._id}
              initialNumToRender={10}
              data={data_convertstation}
              // Sử dụng _id làm khóa duy nhất
                renderItem={({ item }: { item: Conversation }) => {
                const statusUser: boolean = item.participantIds.some(
                  (participantIds: string) => {
                    if (participantIds !== user._id) {
                      return user_Status.includes(participantIds);
                    }
                  },
                );
                return (
                  <Pressable
                    onPress={() => {
                      if (item.participantIds.length <= 2) {
                        const recipientIds = item.participantIds.filter(
                          (id: string) => id !== user._id,
                        );
                        socket?.emit('invite_to_room', {
                          conversationId: item._id,
                          recipientIds: recipientIds,
                        });
                      }
                      navigation.navigate('HomeChatPersion', {
                        conversation: item,
                      });
                    }}
                    onLongPress={() => handlePresentModalPress(item)}
                    style={({pressed}) => [
                      {
                        width: '100%',
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingLeft: 10,
                        padding: 5,
                        marginVertical: 8,
                        backgroundColor: pressed
                          ? 'rgb(210, 230, 255)'
                          : color.black,
                        shadowColor: '#000',
                        shadowOffset: {width: 0, height: 2},
                      },
                    ]}>
                    {statusUser && (
                      <View
                        style={{
                          backgroundColor: 'green',
                          width: 15,
                          height: 15,
                          borderRadius: 100,
                          position: 'absolute',
                          zIndex: 1,
                          bottom: 5,
                          left: '12%',
                        }}></View>
                    )}
                    {/* Hiển thị avatar */}
                    {item.avatar ? (
                      <Image
                        style={{
                          width: 50,
                          height: 50,
                          borderRadius: 25,
                          marginRight: 15,
                          backgroundColor: color.gray,
                        }}
                        source={{uri: item.avatar}}
                      />
                    ) : (
                      <View
                        style={{
                          width: 50,
                          height: 50,
                          marginRight: 15,
                          position: 'relative',
                          backgroundColor: color.gray,
                          borderRadius: 100,
                        }}>
                        {(() => {
                          // Lọc ra những người tham gia khác currentUser
                          const filteredParticipants: any =
                            item.participants.filter(
                              (participant: any) =>
                                participant.user_id !== user._id,
                            );

                          // Số lượng người tham gia khác currentUser
                            const count = filteredParticipants.length;
                           
                          if (count === 1) {
                            // Chỉ hiển thị ảnh của 1 người (chiếm 100%)
                            return (
                              <Image
                                style={{
                                  width: 50,
                                  height: 50,
                                  borderRadius: 25,
                                  backgroundColor: color.gray,
                                }}
                                source={{
                                  uri: filteredParticipants[0].avatar,
                                }}
                              />
                            );
                          } else if (count === 2) {
                            // Hiển thị 2 ảnh (chia 2 góc)
                            return (
                              <>
                                <Image
                                  style={{
                                    width: 30,
                                    height: 30,
                                    borderRadius: 15,
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    borderWidth: 2,
                                    borderColor: 'white',
                                    backgroundColor: color.gray,
                                  }}
                                  source={{
                                    uri: filteredParticipants[0]?.avatar,
                                  }}
                                />
                                <Image
                                  style={{
                                    width: 30,
                                    height: 30,
                                    borderRadius: 15,
                                    position: 'absolute',
                                    bottom: 0,
                                    right: 0,
                                    borderWidth: 2,
                                    borderColor: 'white',
                                    backgroundColor: color.gray,
                                  }}
                                  source={{
                                    uri: filteredParticipants[1]?.avatar,
                                  }}
                                />
                              </>
                            );
                          } else {
                            return filteredParticipants
                              .slice(0, 4)
                              .map((participant: any, index: number) => {
                                const positions = [
                                  {top: 0, left: 0},
                                  {top: 0, right: 0},
                                  {bottom: 0, left: 0},
                                  {bottom: 0, right: 0},
                                ];
                                return (
                                  <Image
                                    key={participant._id}
                                    style={{
                                      width: 20,
                                      height: 20,
                                      borderRadius: 10,
                                      position: 'absolute',
                                      ...positions[index],
                                      borderWidth: 1,
                                      borderColor: 'white',
                                      backgroundColor: color.gray,
                                    }}
                                    source={{uri: participant.avatar}}
                                  />
                                );
                              });
                          }
                        })()}
                      </View>
                    )}

                    {/* Nội dung tin nhắn */}
                    <View style={{flex: 1}}>
                      <Text
                        style={{
                          fontWeight: 'bold',
                          fontSize: 16,
                          color: color.white,
                        }}
                        numberOfLines={1}
                        ellipsizeMode="tail">
                        {item.roomName
                          ? item.roomName
                          : item.participants
                              .filter(
                                (participant: any) =>
                                  participant.name !== user.name,
                              ) // Lọc bỏ tên của currentUser
                              .map((participant: any) => participant.name) // Lấy tên
                              .filter(name => !!name) // Loại bỏ tên rỗng
                              .join(', ')}{' '}
                        {/* Nối các tên lại thành chuỗi */}
                      </Text>
                      <View
                        style={{
                          flexDirection: 'row',
                          width: '80%',
                          gap: 10,
                        }}>
                        <Text
                          ellipsizeMode="tail"
                          numberOfLines={1}
                          style={{
                            fontSize: 14,
                            fontWeight: 'bold',
                            color: color.white,
                            width: 100,
                          }}>
                          {item.messages[item.messages.length-1]?.text || 'Bắt đầu cuộc thoại'}
                        </Text>
                        <Text ellipsizeMode="tail" numberOfLines={1}>
                          {dayjs(item.messages[item.messages.length - 1]?.createdAt).from(now)}
                        </Text>
                      </View>
                    </View>
                  </Pressable>
                );
              }}
              // onEndReached={() => {
              //   get_data();
              // }}
            />
          </View>
        )}
      </View>
      <BottomSheetModal
        ref={bottomSheetModalRef}
        onChange={handleSheetChanges}
        enableContentPanningGesture={false}
        snapPoints={snapPoints}>
        <BottomSheetView style={{flex: 1, backgroundColor: color.gray}}>
          <View style={{alignContent: 'center', alignItems: 'center'}}>
            <BottonsheetHome
              handlerShowmodal={handlerShowmodal}
              bottomSheetModalRef={bottomSheetModalRef} // Truyền ref vào
            />
          </View>
        </BottomSheetView>
      </BottomSheetModal>
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          activeOpacity={1}
          onPress={() => setModalVisible(false)} // Nhấn bên ngoài modal để đóng
        >
          <View
            style={{
              width: '80%',
              backgroundColor: 'white',
              padding: 20,
              borderRadius: 10,
              alignItems: 'center',
            }}>
            <Ionicons name="alert-circle-outline" size={40} color="red" />
            <Text style={{fontSize: 18, fontWeight: 'bold', marginTop: 10}}>
              Xác nhận xóa?
            </Text>
            <Text style={{marginTop: 10, textAlign: 'center'}}>
              Bạn có chắc chắn muốn xóa cuộc trò chuyện này không?
            </Text>

            <View style={{flexDirection: 'row', marginTop: 20}}>
              <Pressable
                style={{
                  flex: 1,
                  padding: 10,
                  borderRadius: 5,
                  alignItems: 'center',
                  backgroundColor: 'gray',
                  marginRight: 10,
                }}
                onPress={() => setModalVisible(false)}>
                <Text style={{color: 'white'}}>Hủy</Text>
              </Pressable>
              <Pressable
                style={{
                  flex: 1,
                  padding: 10,
                  borderRadius: 5,
                  alignItems: 'center',
                  backgroundColor: 'red',
                }}
                onPress={handleDelete}>
                <Text style={{color: 'white'}}>Xóa</Text>
              </Pressable>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </BottomSheetModalProvider>
  );
}
// const conversation: Conversation = {
//     _id: "123456789",
//     name: null,
//     avatar: null,
//     type: "group",
//     admin: "admin_id",
//     color: "#FFFFFF",
//     background: "#000000",
//     participants: [
//         { _id: "user1", name: "Alice", avatar: "https://ss-images.saostar.vn/wwebp1200/pc/1613810558698/Facebook-Avatar_2.png" },
//         { _id: "user2", name: "Bob", avatar: "https://ss-images.saostar.vn/wwebp1200/pc/1613810558698/Facebook-Avatar_2.png" },
//     ],
//     lastMessage: {
//         _id: "msg1",
//         sender: "user1",
//         name_send: 'user1',
//         createdAt: new Date(),
//         content: {
//             type: "text",
//             content: "Hello, everyone!"
//         }
//     },
//     read_user: [
//         { _id: "user1", avatar: "https://example.com/avatar1.png", name: "Alice" },
//         { _id: "user2", avatar: "https://example.com/avatar2.png", name: "Bob" }
//     ]
// };
// const conversation2: Conversation = {
//     _id: "123456789",
//     name: 'example',
//     avatar: 'https://ss-images.saostar.vn/wwebp1200/pc/1613810558698/Facebook-Avatar_2.png',
//     type: "group",
//     admin: "admin_id",
//     color: "#FFFFFF",
//     background: "#000000",
//     participants: [
//         { _id: "user1", name: "Alice", avatar: "https://ss-images.saostar.vn/wwebp1200/pc/1613810558698/Facebook-Avatar_2.png" },
//         { _id: "user2", name: "Bob", avatar: "https://ss-images.saostar.vn/wwebp1200/pc/1613810558698/Facebook-Avatar_2.png" },
//     ],
//     lastMessage: {
//         _id: "msg1",
//         sender: "user1",
//         createdAt: new Date(),
//         name_send: 'user',
//         content: {
//             type: "text",
//             content: "Hello, everyone!"
//         }
//     },
//     read_user: [
//         { _id: "user1", avatar: "https://example.com/avatar1.png", name: "Alice" },
//         { _id: "user2", avatar: "https://example.com/avatar2.png", name: "Bob" }
//     ]
// };
{
  /* <View
            style={{
              flex: isPortrait ? 0.1 : 0.4,
              backgroundColor: color.dark,
              flexDirection: 'row',
            }}>
            <View
              style={{
                flex: isPortrait ? 0.4 : 0.2,
                paddingHorizontal: '2%',
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
              <Image
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 25,
                  backgroundColor: color.gray,
                }}
                source={{uri: user.avatar}}
              />
              <Text
                style={{
                  color: color.white,
                  fontWeight: 'bold',
                  fontSize: 25,
                }}>
                Chats
              </Text>
            </View>
            <View style={{flex: isPortrait ? 0.5 : 0.8}}></View>
            <View
              style={{
                flex: isPortrait ? 0.2 : 0.1,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <TouchableOpacity
                style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 100,
                  height: 50,
                  width: 50,
                  backgroundColor: color.light,
                }}>
                <Pen width={30} color={'pink'} stroke={'#ffffff'} />
              </TouchableOpacity>
            </View>
          </View> */
}

/* const handleConnect = useCallback(() => {
      data_convertstation.forEach((item: any) => {
        console.log(item._id, 'Joining room');
        socket.emit('join_room', {conversationId: item._id, user: user.name});
      });
    },[]);
    const handleNewMessage = useCallback((messages: any) => {
      const {message, conversation, participantIds} = messages;
      const conditions = conversation.participants
        .map((id: any, index: any) => `ANY participants.user._id == $${index}`)
        .join(' AND ');
   
      const existingConversation: any = realm
        .objects('Conversation')
        .filtered(conditions, ...participantIds)[0];
        
      realm.write(() => {

        if (existingConversation) {
          console.log('đã tônf tại ')
          existingConversation.lastMessage = message;
          (existingConversation.messages as Message_type[]).unshift(
            message,
          )
          existingConversation.updatedAt = message.createdAt;
        } else {
          
          realm.create('Conversation', {
            _id: conversation._id,
            roomName: conversation.roomName,
            avatar: conversation.avatar,
            participants: conversation.participants,
            color: conversation.color,
            icon: conversation.icon,
            background: conversation.background,
            lastMessage: message,
            messages: [message],
            updatedAt: message.createdAt,
          });
        }
      });
    },[]);
          */
