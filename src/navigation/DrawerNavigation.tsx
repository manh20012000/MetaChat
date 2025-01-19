import React, { useState } from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {createDrawerNavigator, DrawerContentScrollView, DrawerItem} from '@react-navigation/drawer';
import Home from '../Screen/Home/Home';
import Setting_Chat from '../Screen/Home/Draw_navigation/Setting_Chat';
import Adttenment from '../Screen/Home/Draw_navigation/Adttenment';
import Friend from '../Screen/Home/Draw_navigation/Friend';
import Create_Group from '../Screen/Home/Draw_navigation/Create_Group';
import Private_Converstation from '../Screen/Home/Draw_navigation/Private_Converstation';
import { useSelector } from 'react-redux';
import { Image, StyleSheet, Text, View } from 'react-native';
const Drawer = createDrawerNavigator();

const CustomDrawerContent = (props: any) => {
  const user = useSelector((state: any) => state.auth.value);
  const color = useSelector((state: any) => state.colorApp.value);
  const selectedIndex = props.state?.index; // Lấy chỉ mục (index) của mục đang được chọn
    
  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={[
        styles.drawerContainer,
        {backgroundColor: color.gray},
      ]}>
      {/* Header của Drawer */}
      <View
        style={[
          styles.drawerHeader,
          {backgroundColor: color.gray},
          {flexDirection: 'row', gap: 10},
        ]}>
        <Image
          source={{uri: user.avatar}}
          style={{width: 50, height: 50, borderRadius: 50}}
        />
        <Text style={[styles.headerText, {color: color.light}]}>
          {user.name}
        </Text>
      </View>

      {/* Các mục trong Drawer */}
      <DrawerItem
        label="Chats"
        style={{
          backgroundColor: selectedIndex === 0 ? color.black : color.gray,
        }}
        onPress={() => props.navigation.navigate('Chats')}
        icon={() => (
          <Ionicons name="home-outline" size={24} color={color.white} />
        )}
        labelStyle={[styles.drawerItemLabel, {color: color.light}]}
      />
      <DrawerItem
        label="Create Group"
        style={{
          backgroundColor: selectedIndex === 1 ? color.black : color.gray,
        }}
        onPress={() => props.navigation.navigate('Create Group')}
        icon={() => (
          <MaterialIcons name="group-add" size={24} color={color.white} />
        )}
        labelStyle={[styles.drawerItemLabel, {color: color.light}]}
      />
      <DrawerItem
        label="Friend"
        style={{
          backgroundColor: selectedIndex === 2 ? color.black : color.gray,
        }}
        onPress={() => props.navigation.navigate('Friend')}
        icon={() => (
          <FontAwesome5 name="user-friends" size={24} color={color.light} />
        )}
        labelStyle={[styles.drawerItemLabel, {color: color.light}]}
      />
      <DrawerItem
        label="Setting Chat"
        style={{
          backgroundColor: selectedIndex === 3 ? color.black : color.gray,
        }}
        onPress={() => props.navigation.navigate('Setting_Chat')}
        icon={() => (
          <Ionicons name="settings-outline" size={24} color={color.light} />
        )}
        labelStyle={[styles.drawerItemLabel, {color: color.light}]}
      />
      <DrawerItem
        style={{
          backgroundColor: selectedIndex === 4 ? color.black : color.gray,
        }}
        label="Adttenment"
        onPress={() => props.navigation.navigate('Adttenment')}
        icon={() => (
          <Ionicons name="calendar-outline" size={24} color={color.light} />
        )}
        labelStyle={[styles.drawerItemLabel, {color: color.light}]}
      />
      <DrawerItem
        style={{
          backgroundColor: selectedIndex === 5 ? color.black : color.gray,
        }}
        label="Private Conversation"
        onPress={() => props.navigation.navigate('Private_Converstation')}
        icon={() => (
          <MaterialIcons
            name="chat-bubble-outline"
            size={24}
            color={color.light}
          />
        )}
        labelStyle={[styles.drawerItemLabel, {color: color.light}]}
      />
    </DrawerContentScrollView>
  );
};
const DrawerNavigation = () => {
 const [color] = useState(useSelector((state: any) => state.colorApp.value));
  return (
    <Drawer.Navigator
      initialRouteName="Chats"
      drawerContent={props => <CustomDrawerContent {...props} />} // Custom Drawer
      screenOptions={{
        headerStyle: {backgroundColor: color.dark},
        drawerActiveBackgroundColor: '#003CB3',
        headerTintColor: color.light,
        // headerTitleAlign: 'left',
        headerTitleStyle: {color: color.light},
        drawerStyle: {width: '80%', backgroundColor: color.light},
        drawerActiveTintColor: color.light,
        drawerInactiveTintColor: color.light,
      }}>
      <Drawer.Screen name="Chats" component={Home} />
      <Drawer.Screen name="Create Group" component={Create_Group} />
      <Drawer.Screen name="Friend" component={Friend} />
      <Drawer.Screen name="Setting_Chat" component={Setting_Chat} />
      <Drawer.Screen name="Adttenment" component={Adttenment} />
      <Drawer.Screen
        name="Private_Converstation"
        component={Private_Converstation}
      />
    </Drawer.Navigator>
  );
};
export default DrawerNavigation;
const styles = StyleSheet.create({
  drawerContainer: {
        flex: 1,
         backgroundColor:'pink'
  },
  drawerHeader: {
    alignItems: 'center',
    marginBottom:30
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  drawerItemLabel: {
      fontSize: 16,
      
  },
});
