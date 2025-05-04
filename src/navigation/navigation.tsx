import { StyleSheet, Text, View, Modal, Alert } from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import {
  createNavigationContainerRef,
  NavigationContainer,
  useNavigation,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Login from '../screens/User_Auth/login.tsx';
import Register from '../screens/User_Auth/register.tsx';
import Bottomtab_Navigation from './bottomtab_Navigation.tsx';
import ChatScreen from '../containers/Home/HomeChat.tsx';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../stores/reducer/auth.slice.ts';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode, JwtPayload } from 'jwt-decode';
import SearchScreen from '../components/modules/home_component/home_search/Search.tsx';
import HomeChatPersion from '../containers/Home/ScreenChat.tsx';
import Create_Group from '../screens/Draw_Navigation/Create_Group.tsx';
import friendSchema from '../cache_datas/schema/schema_user.ts';
import Setting_Chat from '../screens/Draw_Navigation/Setting_Chat.tsx';
import Adttenment from '../screens/Draw_Navigation/Adttenment.tsx';
import NetInfo from '@react-native-community/netinfo';
import { check } from '../stores/reducer/network_connect.ts';
import { DeviceSlice, getInfo } from '../stores/reducer/deviceInfor.ts';
import CameraChat from '../components/modules/home_component/chat_component/camera_chat/CamaraView.tsx';
import SettingComponent from '../screens/User/UseComponent/Setting.tsx';
import { useSocket } from '../provinders/socket.io.tsx';
import { Status } from '../stores/reducer/status.User.ts';
import DeviceInfo from 'react-native-device-info';
import VideoCallHome from '../components/modules/home_component/video_call/VideoCallHome.tsx';
import IncomingVideoCallScreen from '../components/modules/home_component/video_call/IncomingVideoCallScreen.tsx';
import { RootStackParamList } from '../types/navigation_type/rootStackScreen.tsx';
import { checkAndRefreshToken } from '../utils/checkingToken.ts';

const Stack = createNativeStackNavigator();

const screens = [
  { name: 'Login', component: Login },
  { name: 'Register', component: Register },
  { name: 'Bottomtab_Navigation', component: Bottomtab_Navigation },
  { name: 'ChatScreen', component: ChatScreen },
  { name: 'SearchScreen', component: SearchScreen },
  { name: 'HomeChatPersion', component: HomeChatPersion },
  { name: 'CameraChat', component: CameraChat },
  { name: 'Setting', component: SettingComponent },
  { name: 'VideoCallHome', component: VideoCallHome },
  { name: 'CommingVideoCall', component: IncomingVideoCallScreen },
];
export const navigationRef = createNavigationContainerRef<RootStackParamList>();
const Navigation: React.FC = () => {
  const dispath = useDispatch();
  const [loading, setLoading] = useState<boolean>(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);

  useEffect(() => {
    const checkLoginStatus = async () => {
      const deviceId = await DeviceInfo.getUniqueId();
      dispath(getInfo(deviceId));
      try {
        const user_String: any = await AsyncStorage.getItem('user');
        const userObject = JSON.parse(user_String);

        if (userObject !== null) {
          const decoded: JwtPayload = jwtDecode(userObject.refresh_token);
          const isTokenExpired = decoded.exp
            ? decoded.exp * 1000 < Date.now()
            : true;
          if (isTokenExpired) {
            setIsLoggedIn(false);
          } else {
            const accessTokenDecoded = jwtDecode(userObject.access_token);
            const isTokenExpiredaccep = accessTokenDecoded.exp
              ? accessTokenDecoded.exp * 1000 < Date.now()
              : true;
            if (isTokenExpiredaccep) {
              try {
                checkAndRefreshToken(dispath, userObject);
              } catch (error) {
                console.log('Error refreshing token:', error);
                setIsLoggedIn(false);
              }
            }
            setIsLoggedIn(true);
            dispath(login(userObject));
          }
        } else {
          setIsLoggedIn(false);
        }
      } catch (err: any) {
        console.log(err, 'navigation log err');
        setIsLoggedIn(false);
      }
      setLoading(true);
    };
    checkLoginStatus();
  }, []);
  const checkNetworkStatus = useCallback(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      try {
        if (state.isConnected !== isConnected) {
          setIsConnected(state.isConnected);
          dispath(check(state.isConnected));

          if (!state.isConnected) {

            Alert.alert(
              'No Internet Connection',
              'Your network connection is too weak or unavailable.',
            );
          }
          //  else {
          //   console.log("✅ Có mạng trở lại, đang kết nối lại socket...");
          //   if (!socket?.connected) {
          //     socket?.connect();
          //     // dispatch(Status(user._id));
          //   }
          // }
        }
      } catch (error) {
        console.error('Error checking network status:', error);
      }
    });

    return unsubscribe;
  }, [isConnected]);
  useEffect(() => {
    const unsubscribe = checkNetworkStatus();
    return () => unsubscribe();
  }, [checkNetworkStatus]);

  return (
    loading && (
      <NavigationContainer ref={navigationRef}>
        <Stack.Navigator
          initialRouteName={isLoggedIn ? 'Bottomtab_Navigation' : 'Login'}
          screenOptions={{ headerShown: false }}>
          {screens.map(({ name, component }) => (
            <Stack.Screen key={name} name={name} component={component} />
          ))}
        </Stack.Navigator>
      </NavigationContainer>
    )
  );
};
export default Navigation;
