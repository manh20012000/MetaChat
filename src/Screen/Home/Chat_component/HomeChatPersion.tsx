import React, { useState } from "react";
import { Image, Text, TouchableOpacity, View, useWindowDimensions } from "react-native";
import { itemuser } from "../../../interface/search_user.interface";
import { useDispatch, useSelector } from "react-redux";
import Statusbar from "../../Component/StatusBar";
import { BackChat, Backsvg, Call, Infor, VideoCall } from "../../../assets/svg/svgfile";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import GifchatUser from "./Gifchat";
import BackIcon from "../../../assets/svg/SvgIcon";
import Icon from "../../../assets/svg/Customsvg";
import { TextInput } from "react-native-gesture-handler";
import { GiftedChat, InputToolbar } from "react-native-gifted-chat";
import Conversation from "../../../interface/Converstation.interface";
const HomeChatPersion: React.FC<{ route: any, navigation: any }> = ({ route, navigation }) => {
    const color = useSelector((value: any) => value.colorApp.value)
    const insert = useSafeAreaInsets()
    const [user] = useState(useSelector((state: any) => state.auth.value));
    const { width, height } = useWindowDimensions()
    const isPortrait = height > width
    const conversation: Conversation = route.params.conversation;

    return (
      <View
        style={{backgroundColor: color.dark, flex: 1, paddingTop: insert.top}}>
        <Statusbar bgrstatus="transparent" bgrcolor={color.light} translucent/>
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
              style={{alignItems: 'center', justifyContent: 'center'}}
              onPress={() => navigation.goBack()}>
              <Icon
                color={color.white}
                name="back"
                size={34}
                wiewbox={'0 0 1024 1024'}
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              width: '50%',
              gap: 10,
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
                source={{uri: conversation.avatar}}
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
                    participant =>
                      participant.user._id !== conversation.participants[0].user._id,
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
                        source={{uri: filteredParticipants[0].user.avatar}}
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
                          source={{uri: filteredParticipants[0]?.user.avatar}}
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
                          source={{uri: filteredParticipants[1]?.user.avatar}}
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
                            source={{uri: participant.user.avatar}}
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
                fontSize: 25,
                color: color.white,
              }}
              numberOfLines={1}
              ellipsizeMode="tail">
 
              {conversation.roomName
                ? conversation.roomName
                : conversation.participants
                    .filter(
                      participant =>
                        participant.user.name !==
                        user.name,
                    ) // Lọc bỏ tên của currentUser
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
                width: 40,
                height: 40,
                borderRadius: 100,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Call />
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                width: 40,
                height: 40,
                borderRadius: 100,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <VideoCall fill={'#000'} />
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                width: 40,
                height: 40,
                borderRadius: 100,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Infor />
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

        <GifchatUser conversation={conversation}/>
      </View>
    );
}

export default HomeChatPersion;