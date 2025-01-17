import { StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { FC } from 'react';

import { useDispatch, useSelector } from 'react-redux';
import FlashMessage, { showMessage } from 'react-native-flash-message';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useSocket } from '../../util/socket.io';
import { logout } from '../../Redux_Toolkit/Reducer/auth.slice';
import { HandlerNotification } from '../../util/checking_fcmtoken';
import { CommonActions } from '@react-navigation/native';
const User_profile: React.FC<{ navigation: any }> = ({ navigation }) => {
  const socket = useSocket();
  const user = useSelector((state: any) => state.auth.value);
  const color = useSelector((state: any) => state.colorApp.value);
  const insets = useSafeAreaInsets();
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
        { backgroundColor: color.white, padding: insets.top },
      ]}>
      <StatusBar
        translucent={true}
        // hidden={false}
        barStyle={color.isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={'transparent'}
      />
      <Text >User_profile</Text>
      <TouchableOpacity
        onPress={handlerLogout}
        style={{
          backgroundColor: 'red',
          width: insets.top * 4,
          height: insets.top,
          alignSelf: 'flex-end',
        }}>
        <Text>Logout</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={handlerLogout}
        style={{
          backgroundColor: 'pink',
          width: insets.top * 4,
          height: insets.top,
          alignSelf: 'flex-end',
        }}>
        <Text>Logout</Text>
      </TouchableOpacity>
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
