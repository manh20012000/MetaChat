import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import Notification_screen from '../Screen/Notification/Notification_screen.tsx';

import User_profile from '../Screen/User/User_profile.tsx';
import Media_screen from '../Container/Add_Media/Media_screen.tsx';
import Watch from '../Screen/Video_Watch/Watch.tsx';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  Notifi_icon,
  Video_icon,
  Add_icon,
  Home_icon,
  User_icon,
} from '../assets/svg/svgfile.js';
import changeNavigationBarColor, {
  hideNavigationBar,
  showNavigationBar,
} from 'react-native-navigation-bar-color';
import DrawerNavigation from './DrawerNavigation.tsx';

const Tab = createBottomTabNavigator();

const Bottomtab_Navigation: React.FC<{ navigation: any }> = ({ navigation }) => {
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        animation: 'fade',
        tabBarHideOnKeyboard: true, // Ẩn Bottom Tab khi bàn phím hiển thị
        tabBarActiveTintColor: 'red', // Màu icon/text khi được chọn
        tabBarInactiveTintColor: 'white', // Màu icon/text khi không được chọn
        headerShown: false,
        tabBarStyle: {backgroundColor: 'black'},
        tabBarIcon: ({focused, color, size}) => {
          let iconComponent;
          if (route.name === 'Home') {
            iconComponent = (
              <Home_icon
                width={30}
                height={30}
                size={focused ? 32 : 28}
                stroke={focused ? 'white' : '#888888'}
                fill={focused ? 'white' : '#888888'}
              />
            );
          } else if (route.name === 'Watch') {
            iconComponent = (
              <Video_icon
                width={30}
                height={30}
                size={focused ? 33 : 30}
                stroke={focused ? 'white' : '#888888'}
                fill={focused ? 'white' : '#888888'}
              />
            );
          } else if (route.name === '  ') {
            iconComponent = (
              <Add_icon
                name=" "
                width={36}
                height={36}
                stroke={focused ? 'white' : '#888888'}
                fill={focused ? 'white' : '#888888'}
                style={{marginTop: '25%'}}
              />
            );
          } else if (route.name === 'Notifi') {
            iconComponent = (
              <Notifi_icon
                width={33}
                height={33}
                size={focused ? 33 : 30}
                stroke={focused ? 'white' : '#888888'}
                fill={focused ? 'white' : '#888888'} // Thay đổi thuộc tính fill
              />
            );
          } else if (route.name === 'User') {
            iconComponent = (
              <User_icon
                name="user"
                style={{
                  marginTop: 10,
                }}
                stroke={focused ? 'white' : '#888888'}
                size={focused ? 33 : 30}
                fill={focused ? 'white' : '#888888'} // Thay đổi thuộc tính fill
              />
            );
          }

          return iconComponent;
        },
      })}>
      <Tab.Screen name="Home" component={DrawerNavigation} />
      {/* <Tab.Screen name="Home" component={Home_screen} /> */}
      <Tab.Screen name="Watch" component={Watch} />
      <Tab.Screen
        name="  "
        component={Media_screen}
        listeners={({navigation}) => ({
          blur: () => navigation.setParams({}), // Reset params hoặc thực hiện unmount.
        })}
      />
      <Tab.Screen name="Notifi" component={Notification_screen} />
      <Tab.Screen name="User" component={User_profile} />
    </Tab.Navigator>
  );
};
export default Bottomtab_Navigation;
const styles = StyleSheet.create({});
