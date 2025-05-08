import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { itemuser } from '../../types/home_type/search_type';
import { useDispatch, useSelector } from 'react-redux';
import Statusbar from '../../components/commons/StatusBar';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import GiftedChatView from '../../components/modules/home_component/chat_component/gifted_chat/GiftedChat';
import { useSocket } from '../../provinders/socket.io';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { filterParticipants, MapParticipants } from '../../utils/util_chat/get_paticipants';
import { mediaDevices } from 'react-native-webrtc';
const HomeChatPersion: React.FC<{ route: any; navigation: any }> = ({
  route,
  navigation,
}) => {
  const networkConnect = useSelector((value: any) => value.network.value);
  const color = useSelector((value: any) => value.colorApp.value);
  const insert = useSafeAreaInsets();
  const [user] = useState(useSelector((state: any) => state.auth.value));
  const { width, height } = useWindowDimensions();
  const isPortrait = height > width;
  const { conversation } = route.params;
  const socket = useSocket();

  const [userChat] = useState<any>(
    conversation.participants.find(
      (participant: any) => participant.user.user_id === user._id,
    ),
  );
  useEffect(() => {
    const handleer = async () => {
      const stream = await mediaDevices.getUserMedia({
        audio: true,
        video: {
          width: 720,
          height: 1080,
          frameRate: 30,
          facingMode: 'user',
        },
      });

      stream.getVideoTracks().forEach(track => {
        console.log('Video track:', track);
        track.enabled = false;
      });

      stream.getAudioTracks().forEach(track => {
        console.log('Audio track:', track);
        track.enabled = true;
      });
    }
    handleer()
  }, [])
  const sendConnectCall = async () => {
    try {
      if (!networkConnect) {
        Alert.alert('Kết nối mạng không ổn định');
        return;
      }

      // 👉 Xác định người nhận (participant) là những người khác user hiện tại

      const participants = MapParticipants(conversation.participants)

      //👉 Thông tin người gọi (caller)
      const callerData = {
        _id: userChat.user._id, // đây là ID MongoDB của user hiện tại
        user_id: userChat.user.user_id, // user_id chính là định danh trong hệ thống
        name: userChat.user.name,
        avatar: userChat.user.avatar,

      };
      const converstationVideocall = {
        roomId: conversation._id,
        roomName: conversation.roomName || null,
        avatar: conversation.avatar || null,
        type: conversation.type, // Loại cuộc trò chuyện (vd: "group" hoặc "direct")
        color: conversation.color, // Màu sắc của nhóm (nếu có)
        icon: conversation.iconicon, //
        background: conversation.background, // Background của nhóm (nếu có)
        participants: participants,


      }
      socket?.emit('startCall', {
        caller: callerData,
        converstationVideocall,
        participantIds: conversation.participantIds,
      }); // gửi mảng user_id người nhận

      //👉 Điều hướng sang màn hình cuộc gọi
      navigation.navigate('CallerScreen', {
        caller: callerData,
        converstationVideocall,
        participantIds: conversation.participantIds,
        isOnpenCamera: false,
        conversation,
        isCaller: true,
      });
    } catch (error) {
      console.error('📛 Lỗi khi nhấn nút gọi:', error);
    }
  };

  return (
    <View style={{ backgroundColor: color.dark, flex: 1 }}>
      <Statusbar
        bgrstatus="#000000"
        bgrcolor={color.light}
        translucent={true}
      />
      <View
        style={{
          backgroundColor: color.dark,
          width: width,
          alignContent: 'center',
          flexDirection: 'row',
        }}>
        <View
          style={{
            width: 50,
            height: 'auto',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <TouchableOpacity
            style={{ alignItems: 'center', justifyContent: 'center' }}
            onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={35} color={color.blue} />
            {/* <Icon
              color={color.white}
              name="back"
              size={34}
              wiewbox={'0 0 1024 1024'}
            /> */}
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            width: '50%',
            gap: 2,
          }}>
          {conversation.avatar ? (
            <Image
              style={{
                backgroundColor: color.gray,
                width: 50,
                height: 50,
                resizeMode: 'contain',
                borderRadius: 100,
                alignItems: 'center',
              }}
              source={{ uri: conversation.avatar }}
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
                const filteredParticipants = conversation.participants.filter(
                  (participant: any) =>
                    participant.user._id !== userChat.user._id,
                );

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
                      source={{ uri: filteredParticipants[0].user.avatar }}
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
                        source={{ uri: filteredParticipants[0]?.user.avatar }}
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
                        source={{ uri: filteredParticipants[1]?.user.avatar }}
                      />
                    </>
                  );
                } else {
                  // Hiển thị tối đa 4 ảnh
                  return filteredParticipants
                    .slice(0, 4)
                    .map((participant, index) => {
                      const positions = [
                        { top: 0, left: 0 },
                        { top: 0, right: 0 },
                        { bottom: 0, left: 0 },
                        { bottom: 0, right: 0 },
                      ];
                      return (
                        <Image
                          key={participant.user._id}
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
                          source={{ uri: participant.user.avatar }}
                        />
                      );
                    });
                }
              })()}
            </View>
          )}
          <Text
            style={{
              fontWeight: 'bold',
              fontSize: 18,
              color: color.white,
              width: 100,
            }}
            numberOfLines={1}
            ellipsizeMode="tail">
            {conversation.roomName
              ? conversation.roomName
              : conversation.participants
                .filter(participant => participant.user.name !== user.name) // Lọc bỏ tên của currentUser
                .map(participant => participant.user.name) // Lấy tên còn lại
                .join(', ')}{' '}
          </Text>
        </TouchableOpacity>
        <View
          style={{
            width: '30%',
            alignItems: 'center',
            flexGrow: 3,
            flexDirection: 'row',
            justifyContent: 'space-around',
          }}>
          <TouchableOpacity
            style={{
              // width: 40,
              // height: 40,
              borderRadius: 100,
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onPress={sendConnectCall}>
            <Ionicons name="call-sharp" size={25} color={color.blue} />
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              // width: 40,
              // height: 40,
              borderRadius: 100,
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onPress={() => {
              navigation.navigate('VideoCallHome', { type: 'videocall' });
            }}>
            <Ionicons name="videocam" size={25} color={color.blue} />
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              // width: 40,
              // height: 40,
              borderRadius: 100,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Ionicons name="information-circle" size={30} color={color.blue} />
          </TouchableOpacity>
        </View>
      </View>
      <View
        style={{
          borderBottomWidth: 1,
          borderColor: color.light,
          width: width,
          height: '1%',
        }}></View>

      <GiftedChatView conversation={conversation} navigation={navigation} />
    </View>
  );
};

export default HomeChatPersion;
