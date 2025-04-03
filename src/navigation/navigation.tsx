import { StyleSheet, Text, View, Modal, Alert } from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { createNavigationContainerRef, NavigationContainer, useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Login from '../Screen/User_Auth/login.tsx';
import Register from '../Screen/User_Auth/register.tsx';
import Bottomtab_Navigation from './bottomtab_Navigation.tsx';
import ChatScreen from '../Container/Home/UserHomeChat.tsx';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../Redux_Toolkit/Reducer/auth.slice.ts';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode, JwtPayload } from 'jwt-decode';
import SearchScreen from '../Screen/Component/Home_search/HomeSearch/Search.tsx';
import HomeChatPersion from '../Container/Home/Chat_component/ScreenChat.tsx';
import Create_Group from '../Screen/Home/Draw_navigation/Create_Group.tsx';
import Friend from '../Screen/Home/Draw_navigation/Friend.tsx';
import Setting_Chat from '../Screen/Home/Draw_navigation/Setting_Chat.tsx';
import Adttenment from '../Screen/Home/Draw_navigation/Adttenment.tsx';
import Private_Converstation from '../Screen/Home/Draw_navigation/Private_Converstation.tsx';
import NetInfo from '@react-native-community/netinfo';
import { check } from '../Redux_Toolkit/Reducer/network_connect.ts';
import { DeviceSlice, getInfo } from '../Redux_Toolkit/Reducer/deviceInfor.ts';
import CameraChat from '../Container/Home/Chat_component/CameraChat/CamaraView.tsx';
import SettingComponent from '../Screen/User/UseComponent/Setting.tsx';
import { useSocket } from '../util/socket.io.tsx';
import { Status } from '../Redux_Toolkit/Reducer/status.User.ts';
import DeviceInfo from 'react-native-device-info';
import VideoCallHome from '../Container/Home/VideoCallComponent/VideoCallHome.tsx';
import IncomingVideoCallScreen from '../Container/Home/VideoCallComponent/IncomingVideoCallScreen.tsx';
import { RootStackParamList } from '../type/rootStackScreen.tsx';
const Stack = createNativeStackNavigator();

const screens = [
  { name: 'Login', component: Login },
  { name: 'Register', component: Register },
  { name: 'Bottomtab_Navigation', component: Bottomtab_Navigation },
  { name: 'ChatScreen', component: ChatScreen },
  { name: 'SearchScreen', component: SearchScreen },
  { name: 'HomeChatPersion', component: HomeChatPersion },
   {name:'CameraChat',  component:CameraChat},
   {name:"Setting",component:SettingComponent},
   {name:"VideoCallHome",component:VideoCallHome},
   {name:"CommingVideoCall",component:IncomingVideoCallScreen}
];
export const navigationRef = createNavigationContainerRef<RootStackParamList>();
const Navigation: React.FC = () => {

  const dispath = useDispatch();
  const user = useSelector((state: any) => state.auth.value);
  const [loading, setLoading] = useState<boolean>(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);

  const socket = useSocket();
  useEffect(() => {
    const checkLoginStatus = async () => {
      const deviceId =await DeviceInfo.getUniqueId();
      dispath(getInfo(deviceId))
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
            setIsLoggedIn(true);
            dispath(login(userObject));
          }
        } else {
          setIsLoggedIn(false);
        }
      } catch (err: any) {
        console.log(err, 'navigation log err');
      }
      setLoading(true);
    };
    checkLoginStatus();
  }, []);
  const checkNetworkStatus = useCallback(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      if (state.isConnected !== isConnected) {
        setIsConnected(state.isConnected);
        dispath(check(state.isConnected));

        if (!state.isConnected) {
          // socket?.disconnect();
          // socket?.removeAllListeners();
          // socket?.close();
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

