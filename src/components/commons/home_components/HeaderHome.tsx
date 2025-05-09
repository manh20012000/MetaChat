import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Image,
  Pressable,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { useDispatch, UseDispatch, UseSelector, useSelector } from 'react-redux';
import { Search } from '../../../assets/svg/svgfile';
import { useSocket } from '../../../provinders/socket.io';
import { findAndconvertConversation } from '../../../cache_datas/exportdata.ts/converstation_cache';
import userMessage from '../../../types/home_type/useMessage_type';
const HeaderHome: React.FC<{ navigation: any; data_friend: userMessage[] }> = ({
  navigation,
  data_friend,
}) => {
  const user = useSelector((state: any) => state.auth.value);
  // console.log(typeof user)
  const { width, height } = useWindowDimensions();
  const socket = useSocket();
  const isPortrait = height > width;
  const dispatch = useDispatch();
  const color = useSelector((state: any) => state.colorApp.value);
  // const [user_data, setUser_Data] = useState(data_friend);
  const user_Status = useSelector((state: any) => state.statusUser.value);
  // useEffect(() => {
  //   // Fetch user data
  // }, [user]);

  const HeaderTop_Chat = () => {
    return (
      <View
        style={{
          alignSelf: 'center',
          justifyContent: 'center',
          alignItems: 'center',
          flex: 1,
          marginHorizontal: 10,
        }}>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate('User');
          }}
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            alignSelf: 'center',
            flex: 0.5,
          }}>
          <Image
            style={{
              width: 60,
              height: 60,
              borderRadius: 100,
              backgroundColor: color.gray,
            }}
            source={{ uri: user.avatar }}
          />
          <Text style={{ color: color.light, fontWeight: 'bold' }}>
            {user.name}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'space-around',
        alignItems: 'center',
        borderStartColor: 'pink',
      }}>
      <Pressable
        onPress={() => {
          navigation.navigate('SearchScreen');
        }}
        style={{
          paddingLeft: '5%',
          alignItems: 'center',
          backgroundColor: color.gray,
          flexDirection: 'row',
          borderRadius: 30,
          width: '90%',
          height: '30%',
        }}>
        <View style={{ alignItems: 'center', flexDirection: 'row' }}>
          <Search width={30} color={'pink'} stroke={'white'} />
          <Text style={{ color: color.light, fontSize: 15, fontWeight: '500' }}>
            Tìm kiếm
          </Text>
        </View>
      </Pressable>
      <View style={{ flex: 1, width: width, marginTop: 5 }}>
        <FlatList
          ListHeaderComponent={<HeaderTop_Chat />}
          horizontal={true}
          keyExtractor={item => item._id.toString()}
          data={data_friend}
          showsHorizontalScrollIndicator={false} // Ẩn thanh cuộn ngang
          renderItem={({ item }) => {
            const statusUser = user_Status.find(
              (user: any) => user._id === item._id,
            );
            return (
              <View
                style={{
                  paddingHorizontal: '1%',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                {statusUser && (
                  <View
                    style={{
                      backgroundColor: 'green',
                      width: 15,
                      height: 15,
                      borderRadius: 100,
                      position: 'absolute',
                      zIndex: 1,
                      bottom: 28,
                      right: 1,
                    }}></View>
                )}
                <TouchableOpacity
                  style={{
                    justifyContent: 'center',
                    alignItems: 'center',

                    // backgroundColor: color.white,
                  }}
                  onPress={async () => {
                    try {
                      // Tìm hoặc chuyển cuộc hội thoại với user lên đầu danh sách
                      const participantIds = [item._id, user._id];
                      const participants = [
                        {
                          _id: user._id.toString(),
                          name: user.name,
                          avatar: user.avatar,
                          role: 'admin',
                          action_notifi: true,
                          status_read: true,
                        },
                        {
                          _id: item._id.toString(),
                          name: item.name,
                          avatar: item.avatar,
                          role: 'member',
                          action_notifi: true,
                          status_read: true,
                        },
                      ];
                      const conversation = await findAndconvertConversation(
                        participants,
                        participantIds,

                        { dispatch, user },
                      );
                      if (conversation) {
                        const recipientIds = participantIds.filter(
                          (user: userMessage) => user._id !== user._id,
                        );
                        socket?.emit('invite_to_room', {
                          conversationId: conversation._id,
                          recipientId: recipientIds,
                        });
                      }
                      // Chuyển đến màn hình chat cá nhân với thông tin người dùng
                      navigation.navigate('HomeChatPersion', { conversation });
                    } catch (error) {
                      console.error('Lỗi trong handler_chat:', error);
                    }
                  }}>
                  {/* {statusUser && (
                    <View
                      style={{
                        backgroundColor: 'green',
                        width: 15,
                        height: 15,
                        borderRadius: 100,
                        position: 'absolute',
                        zIndex: 1,
                        bottom: '5%',
                        right: '12%',
                      }}></View>
                  )} */}
                  <Image
                    style={{
                      width: 60,
                      height: 60,
                      borderRadius: 100,
                      backgroundColor: 'gray',
                    }}
                    source={{ uri: item.avatar }}
                  />
                  <Text
                    ellipsizeMode="tail"
                    numberOfLines={1}
                    style={{
                      color: color.white,
                      alignSelf: 'center',
                      width: 70,
                      fontSize: 15,
                      alignItems: 'center',
                      justifyContent: 'center',
                      textAlign: 'center',
                      fontWeight: '500'
                    }}>
                    {item.name}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          }}
        />
      </View>
    </View>
  );
};
export default HeaderHome;
