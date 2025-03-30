import react, {useState} from 'react';
import {
  Text,
  View,
  Pressable,
  useWindowDimensions,
  Modal,
  TouchableOpacity,
} from 'react-native';
import {color} from '../../../assets/color/color';
import Conversation from '../../../type/Home/Converstation_type';
import {delete_converStation} from '../../../cache_data/exportdata.ts/converstation_cache';
import {useDispatch, useSelector} from 'react-redux';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Ionicons from 'react-native-vector-icons/Ionicons';

import React from 'react';
const BottonsheetHome = ({bottomSheetModalRef, handlerShowmodal}: any) => {
  const {width, height} = useWindowDimensions();
  const isPortrait = height > width;

  return (
    <>
      <Pressable
        style={({pressed}) => [
          {
            width: '100%',
            height: 60,

            backgroundColor: pressed ? 'rgb(210, 230, 255)' : color.gray,
            paddingLeft: '2%',
            flexDirection: 'row',
            alignItems: 'center',
          },
        ]}
        delayLongPress={200}>
        <MaterialCommunityIcons name="archive" size={30} />
        <Text style={{color: color.white, fontWeight: 'bold', fontSize: 18}}>
          Archive
        </Text>
      </Pressable>
      <Pressable
        delayLongPress={200}
        style={({pressed}) => [
          {
            width: '100%',
            height: 60,

            backgroundColor: pressed ? 'rgb(210, 230, 255)' : color.gray,
            paddingLeft: '2%',
            flexDirection: 'row',
            alignItems: 'center',
          },
        ]}>
        <Text style={{color: color.white, fontWeight: 'bold', fontSize: 18}}>
          Mute
        </Text>
      </Pressable>
      <Pressable
       delayLongPress={200}
        style={({pressed}) => [
          {
            width: '100%',
            height: 60,

            backgroundColor: pressed ? 'rgb(210, 230, 255)' : color.gray,
            paddingLeft: '2%',
            flexDirection: 'row',
            alignItems: 'center',
          },
        ]}>
        <Ionicons name="create" size={30} />
        <Text style={{color: color.white, fontWeight: 'bold', fontSize: 18}}>
          Create Group chat with
        </Text>
      </Pressable>
      <Pressable
        style={({pressed}) => [
          {
            width: '100%',
            height: 60,

            backgroundColor: pressed ? 'rgb(210, 230, 255)' : color.gray,
            paddingLeft: '2%',
            flexDirection: 'row',
            alignItems: 'center',
          },
        ]}>
        <Text style={{color: color.white, fontWeight: 'bold', fontSize: 18}}>
          Open chat head
        </Text>
      </Pressable>
      <Pressable
       delayLongPress={200}
        style={({pressed}) => [
          {
            width: '100%',
            height: 60,

            backgroundColor: pressed ? 'rgb(210, 230, 255)' : color.gray,
            paddingLeft: '2%',
            flexDirection: 'row',
            alignItems: 'center',
          },
        ]}>
        <Text style={{color: color.white, fontWeight: 'bold', fontSize: 18}}>
          Mark un read
        </Text>
      </Pressable>
      <Pressable
       delayLongPress={200}
        style={({pressed}) => [
          {
            width: '100%',
            height: 60,

            backgroundColor: pressed ? 'rgb(210, 230, 255)' : color.gray,
            paddingLeft: '2%',
            flexDirection: 'row',
            alignItems: 'center',
          },
        ]}>
        <Text style={{color: color.white, fontWeight: 'bold', fontSize: 18}}>
          Retrict
        </Text>
      </Pressable>
      <Pressable
       delayLongPress={200}
        style={({pressed}) => [
          {
            width: '100%',
            height: 60,

            backgroundColor: pressed ? 'rgb(210, 230, 255)' : color.gray,
            paddingLeft: '2%',
            flexDirection: 'row',
            alignItems: 'center',
          },
        ]}>
        <MaterialIcons name="block" size={30} />
        <Text style={{color: color.white, fontWeight: 'bold', fontSize: 18}}>
          Block
        </Text>
      </Pressable>
      <Pressable
       delayLongPress={200}
        onPress={() => {
          bottomSheetModalRef?.current?.dismiss();
          handlerShowmodal(true);
          // delete_converStation(props, { dispatch, user },)
        }}
        style={({pressed}) => [
          {
            width: '100%',
            height: 60,
            backgroundColor: pressed ? 'rgb(210, 230, 255)' : color.gray,
            paddingLeft: '2%',
            flexDirection: 'row',
            alignItems: 'center',
          },
        ]}>
        <MaterialIcons name="delete" size={30} color={'red'} />
        <Text style={{color: color.red, fontWeight: 'bold', fontSize: 18}}>
          Delete
        </Text>
      </Pressable>
    </>
  );
};
export default BottonsheetHome;
