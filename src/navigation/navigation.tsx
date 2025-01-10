import { StyleSheet, Text, View, Modal } from 'react-native';
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Login from '../Screen/User_Auth/login.tsx';
import Register from '../Screen/User_Auth/register.tsx';
import Bottomtab_Navigation from './bottomtab_Navigation.tsx';
import ChatScreen from '../Screen/Home/ChatList_user.tsx';
import { useDispatch } from 'react-redux';
import { login } from '../Redux_Toolkit/Reducer/auth.slice.ts';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode, JwtPayload } from 'jwt-decode';
import SearchScreen from '../Screen/Component/Home_search/Search.tsx';
import HomeChatPersion from '../Screen/Home/Chat_component/HomeChatPersion.tsx';
const Stack = createNativeStackNavigator();
const Navigation: React.FC = () => {
  const dispath = useDispatch();
  const [loading, setLoading] = useState<boolean>(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  useEffect(() => {

    const checkLoginStatus = async () => {

      try {
        const user_String: any = await AsyncStorage.getItem('user');
        const userObject = JSON.parse(user_String);

        if (userObject !== null) {

          const decoded: JwtPayload = jwtDecode(userObject.refresh_token);
          const isTokenExpired = decoded.exp ? decoded.exp * 1000 < Date.now() : true;
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
  return (
    loading && (
      <NavigationContainer

      >
        <Stack.Navigator

          initialRouteName={isLoggedIn ? 'Bottomtab_Navigation' : 'Login'}
          screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="Bottomtab_Navigation" component={Bottomtab_Navigation} />
          <Stack.Screen name="Register" component={Register} />
          <Stack.Screen name="ChatScreen" component={ChatScreen} />
          <Stack.Screen name="SearchScreen" component={SearchScreen} />
          <Stack.Screen name="HomeChatPersion" component={HomeChatPersion} />
        </Stack.Navigator>
      </NavigationContainer>
    )
  );
};
export default Navigation;
const styles = StyleSheet.create({});
