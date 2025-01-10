import React from "react";
import { Image, Text, TouchableOpacity, View, useWindowDimensions } from "react-native";
import { itemuser } from "../../../interface/search_User";
import { useDispatch, useSelector } from "react-redux";
import Statusbar from "../../Component/StatusBar";
import { BackChat, Backsvg, Call, Infor, VideoCall } from "../../../assets/svg/svgfile";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import GifchatUser from "./Gifchat";
import BackIcon from "../../../assets/svg/SvgIcon";
import Icon from "../../../assets/svg/Customsvg";
import { TextInput } from "react-native-gesture-handler";
import { GiftedChat, InputToolbar } from "react-native-gifted-chat";
const HomeChatPersion: React.FC<{ route: any, navigation: any }> = ({ route, navigation }) => {
    const color = useSelector((value: any) => value.colorApp.value)
    const insert = useSafeAreaInsets()

    const { width, height } = useWindowDimensions()
    const isPortrait = height > width
    const user_persion: itemuser = route.params.item;
    return (
      <View
        style={{backgroundColor: color.dark, flex: 1, paddingTop: insert.top}}>
        <Statusbar bgrstatus="transparent" bgrcolor={color.light} />
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
            <Image
              source={{uri: user_persion.avatar}}
              style={{
                backgroundColor: color.gray,
                width: 50,
                height: 50,
                resizeMode: 'contain',
                borderRadius: 100,
                alignItems: 'center',
              }}
            />
            <Text
              numberOfLines={1} // Số dòng tối đa hiển thị
              ellipsizeMode="tail"
              style={{color: color.white, fontSize: 18, fontWeight: 'bold'}}>
              {user_persion.account}
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
        
        <GifchatUser />

      </View>
    );
}

export default HomeChatPersion;