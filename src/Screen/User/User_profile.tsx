import {
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
  Image,
} from 'react-native';
import React, { FC } from 'react';

import { useDispatch, useSelector } from 'react-redux';
import FlashMessage, { showMessage } from 'react-native-flash-message';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useSocket } from '../../util/socket.io';
import { logout } from '../../Redux_Toolkit/Reducer/auth.slice';
import { HandlerNotification } from '../../util/checking_fcmtoken';
import { CommonActions } from '@react-navigation/native';

import Statusbar from '../../Constants/StatusBar';

import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';

const User_profile: React.FC<{ navigation: any }> = ({ navigation }) => {
  const socket = useSocket();
  const user = useSelector((state: any) => state.auth.value);
  const color = useSelector((state: any) => state.colorApp.value);
  const insets = useSafeAreaInsets();
  const {width, height} =useWindowDimensions()
  const dispatch = useDispatch();
  const handlerArrayfcmToken = (fcmtoken: string) => {
    return user.fcmtoken.filter((token: string) => token !== fcmtoken);
  };
  const handlerLogout = async () => {
    try {
      dispatch(logout(null));
      const fcmtoken = await AsyncStorage.getItem('fcmtoken');
     
      await HandlerNotification.update(
        handlerArrayfcmToken(JSON.stringify(fcmtoken)),
        user,

      );
      
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('fcmtoken');
      await AsyncStorage.removeItem('access_token');
      await AsyncStorage.removeItem('refresh_token');
      socket?.disconnect();
      socket?.removeAllListeners();
      socket?.close();
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [
            { name: 'Login' }, // hoặc 'BootonGate' tùy thuộc vào màn hình mặc định bạn muốn
          ],
        }),
      );
    } catch (e) {
      console.error('Error logout:', e);
    }

  };
  return (
    <View
      style={[
        styles.container,
        {backgroundColor: color.white, paddingTop: insets.top},
      ]}>
      <Statusbar
        bgrstatus={color.black}
        bgrcolor={color.light}
        translucent={true}
      />
      {/* <StatusBar
        translucent={true}
        // hidden={false}
        barStyle={color.isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={'transparent'}
      /> */}

      {/* <TouchableOpacity
        onPress={handlerLogout}
        style={{
          backgroundColor: 'pink',
          width: insets.top * 4,
          height: insets.top,
          alignSelf: 'flex-end',
        }}>
        <Text>Logout</Text>
      
      </TouchableOpacity> */}
      <View style={{backgroundColor: color.gray, flex: 1}}>
        <View
          style={{
            width: '60%',

            justifyContent: 'space-between',
            alignSelf: 'flex-end',
            flexDirection: 'row',
            paddingRight: '2%',
            alignItems: 'center',
            alignContent: 'center',
          }}>
          <Text
            style={{
              color: color.light,
              fontWeight: 'bold',
              fontSize: 18,
              textAlign: 'center',
            }}>
            Profile
          </Text>
          <TouchableOpacity>
            <Ionicons name="settings-sharp" size={30} />
          </TouchableOpacity>
        </View>
        <View
          style={{
            justifyContent: 'center',
            height: 'auto',
            marginTop: 10,
            alignItems: 'center',
          }}>
          <Image
            style={{width: width / 4, height: width / 4, borderRadius: 100}}
            source={{uri: user.avatar}}
          />
          <Text style={{fontSize: 25, fontWeight: 'bold', color: color.red}}>
            {user.name}
          </Text>
          <Text>{user.bio || null}</Text>
          <View
            style={{
              alignSelf: 'center',
              width: '60%',
              height: 'auto',
              justifyContent: 'center',
              alignItems: 'center',
              flexDirection: 'row',
            }}>
            <TouchableOpacity
              style={{
                alignContent: 'center',
                alignItems: 'center',
                marginHorizontal: '2%',
                width: 80,
              }}>
              <Text style={{fontWeight: 'bold'}}>
                {user.friends?.length || 0}
              </Text>
              <Text style={{fontWeight: 'bold'}}>Theo dõi </Text>
            </TouchableOpacity>
            <View
              style={{
                width: 2,
                height: 40,
                backgroundColor: color.light,
              }}></View>
            <TouchableOpacity
              style={{
                alignContent: 'center',
                alignItems: 'center',
                marginHorizontal: '2%',
                width: 80,
              }}>
              <Text style={{fontWeight: 'bold'}}>
                {user.friends?.length || 0}
              </Text>
              <Text style={{fontWeight: 'bold'}}>flower</Text>
            </TouchableOpacity>
            <View
              style={{
                width: 2,
                height: 40,
                backgroundColor: color.light,
              }}></View>
            <TouchableOpacity
              style={{
                alignContent: 'center',
                alignItems: 'center',
                marginHorizontal: '2%',
                width: 80,
              }}>
              <Text style={{fontWeight: 'bold'}}>
                {user.friends?.length || 0}
              </Text>
              <Text style={{fontWeight: 'bold'}}>Like </Text>
            </TouchableOpacity>
          </View>
          <View
            style={{backgroundColor: 'green', width: '75%', height: 'auto',flexDirection:'row',alignSelf:"center",alignItems:'center',justifyContent:'space-around',}}>
            <TouchableOpacity style={{ width:'20%',height:50}}>
              <Text>Chỉnh hs</Text>
            </TouchableOpacity>
            <TouchableOpacity>
              <Text>Thêm</Text>
            </TouchableOpacity>
            <TouchableOpacity>
              <Text>Cập nhật hs</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};
export default User_profile;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'pink'
  },
});
