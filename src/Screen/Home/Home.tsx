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
import Statusbar from '../Component/StatusBar';
import {Pen} from '../../assets/svg/svgfile';
import BottonsheetHome from './homeComponent/BottomsheetHome';
import Conversation from '../../interface/Converstation.interface';
import {getData} from '../../service/resfull_api';
import {API_ROUTE} from '../../service/api_enpoint';
import dayjs from 'dayjs';
import {
  getConversations,
  createConversation,
} from '../../cache_data/exportdata.ts/chat_convert_datacache';
import relativeTime from 'dayjs/plugin/relativeTime'; 
dayjs.extend(relativeTime); // Kích hoạt plugin
export default function Home({navigation}: {navigation: any}) {
  const {width, height} = useWindowDimensions();
  const [color] = useState(useSelector((state: any) => state.colorApp.value));
  const [user] = useState(useSelector((state: any) => state.auth.value));
  const dispatch = useDispatch();
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const isPortrait = height > width;
  const insets = useSafeAreaInsets();

  // const conversation: Conversation = {
  //     _id: "123456789",
  //     account: null,
  //     avatar: null,
  //     type: "group",
  //     admin: "admin_id",
  //     color: "#FFFFFF",
  //     background: "#000000",
  //     participants: [
  //         { _id: "user1", account: "Alice", avatar: "https://ss-images.saostar.vn/wwebp1200/pc/1613810558698/Facebook-Avatar_2.png" },
  //         { _id: "user2", account: "Bob", avatar: "https://ss-images.saostar.vn/wwebp1200/pc/1613810558698/Facebook-Avatar_2.png" },
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
  //         { _id: "user1", avatar: "https://example.com/avatar1.png", account: "Alice" },
  //         { _id: "user2", avatar: "https://example.com/avatar2.png", account: "Bob" }
  //     ]
  // };
  // const conversation2: Conversation = {
  //     _id: "123456789",
  //     account: 'example',
  //     avatar: 'https://ss-images.saostar.vn/wwebp1200/pc/1613810558698/Facebook-Avatar_2.png',
  //     type: "group",
  //     admin: "admin_id",
  //     color: "#FFFFFF",
  //     background: "#000000",
  //     participants: [
  //         { _id: "user1", account: "Alice", avatar: "https://ss-images.saostar.vn/wwebp1200/pc/1613810558698/Facebook-Avatar_2.png" },
  //         { _id: "user2", account: "Bob", avatar: "https://ss-images.saostar.vn/wwebp1200/pc/1613810558698/Facebook-Avatar_2.png" },
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
  //         { _id: "user1", avatar: "https://example.com/avatar1.png", account: "Alice" },
  //         { _id: "user2", avatar: "https://example.com/avatar2.png", account: "Bob" }
  //     ]
  // };
  const [data_convertstation, setData_convertStation] = useState<any>([]);
  const [skip, setSkiped] = useState(0);
  const [orientation, setOrientation] = useState(
    Dimensions.get('window').height > Dimensions.get('window').width
      ? 'portrait'
      : 'landscape',
  );
  const snapPoints = useMemo(() => ['60%'], []);
  const handlePresentModalPress = useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);
  const handleSheetChanges = useCallback((index: number) => {
    console.log('handleSheetChanges', index);
  }, []);
  const get_data = async (skip: number) => {
    const data_converstation = await getData(
      API_ROUTE.GET_CONVERTSTATION_CHAT,
      null,
      skip,
      {dispatch, user},
    );

    setData_convertStation(data_converstation.data);
    setSkiped(data_converstation.data.length);
    if (data_converstation.data.length > 0) {
      data_converstation.data.array.forEach(async (element: Conversation) => {
        await createConversation(element);
      });
    }
  };
  useEffect(() => {
    const getChatuser = async () => {
      try {
        let data_converstation = await getConversations();
        // console.log(data_converstation)
        const skip_convert = data_converstation.length;
        if (data_converstation) {
            setData_convertStation(data_converstation);
            console.log(data_converstation,'data_converstation');
        } else {
          await get_data(skip_convert);
        }
      } catch (error: any) {
        console.log(error, 'error convert api GET_CONVERTSTATION_CHAT ');
        throw new Error();
      }
    };
    getChatuser();
  }, []);
const createdAt = new Date('2025-01-10T10:00:00Z'); // Thời gian lưu trữ
const now = new Date();
    
  return (
    <BottomSheetModalProvider>
      <View
        style={{
          flex: 1,
          backgroundColor: color.white,
          paddingTop: insets.top,
        }}>
        <Statusbar bgrstatus={color.dark} bgrcolor={color.light} />
        <View style={{flex: 1, backgroundColor: color.dark}}>
          <View
            style={{
              flex: isPortrait ? 0.1 : 0.4,
              backgroundColor: color.dark,
              flexDirection: 'row',
            }}>
            <View
              style={{
                flex: isPortrait ? 0.4 : 0.2,
                padding: '2%',
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
          </View>

          <FlatList
            refreshing
            ListHeaderComponent={<HeaderHome navigation={navigation} />}
            initialNumToRender={10}
            data={data_convertstation}
            // Sử dụng _id làm khóa duy nhất
            renderItem={({item}: {item: Conversation}) => (
              <Pressable
                onPress={() => navigation.navigate('HomeChatPersion', {conversation:item})}
                onLongPress={handlePresentModalPress}
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
                      const filteredParticipants = item.participants.filter(
                        participant => participant._id !== user._id,
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
                            source={{uri: filteredParticipants[0].avatar}}
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
                              source={{uri: filteredParticipants[0]?.avatar}}
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
                              source={{uri: filteredParticipants[1]?.avatar}}
                            />
                          </>
                        );
                      } else {
                        // Hiển thị tối đa 4 ảnh
                        return filteredParticipants
                          .slice(0, 4)
                          .map((participant, index) => {
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
                            participant =>
                              participant.account !== user.account,
                          ) // Lọc bỏ tên của currentUser
                          .map(participant => participant.account) // Lấy tên còn lại
                          .join(', ')}{' '}
                    {/* Nối các tên lại thành chuỗi */}
                  </Text>
                  <View
                    style={{
                      flexDirection: 'row',
                      width: '90%',
                      gap: 10,
                    }}>
                    <Text style={{fontSize: 14, color: 'gray'}}>
                      {item.lastMessage?.textContent || 'Bắt đầu cuộc thoại'}
                    </Text>
                    <Text>{dayjs(item.lastMessage?.createdAt).from(now)}</Text>
                  </View>
                </View>
              </Pressable>
            )}
          />
        </View>
      </View>
      <BottomSheetModal
        ref={bottomSheetModalRef}
        onChange={handleSheetChanges}
        snapPoints={snapPoints}>
        <BottomSheetView style={{flex: 1, backgroundColor: color.gray}}>
          <View style={{alignContent: 'center', alignItems: 'center'}}>
            <BottonsheetHome />
          </View>
        </BottomSheetView>
      </BottomSheetModal>
    </BottomSheetModalProvider>
  );
}
