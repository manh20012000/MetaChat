import { FlashList } from '@shopify/flash-list';
import { useEffect, useState } from 'react';
import {View, Text,TouchableOpacity, KeyboardAvoidingView,useWindowDimensions, Image} from 'react-native';
import { TextInput } from 'react-native-gesture-handler';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useSelector } from 'react-redux';

const Create_Group = () => {
    const user = useSelector((state: any) => state.auth.value);
    const color = useSelector((state: any) => state.colorApp.value);
    // const getlistuser=get_list_user_localdata()
    useEffect(() => {
        const getListUser = async () => {
            // const listuser = await get_list_user_localdata()
            // setlistuser(listuser)
        };
        getListUser()
    },[])
    const {width,height}=useWindowDimensions()
    const [listuser, setlistuser] = useState([])
    const [text,setText]=useState('')
    return (
      <KeyboardAvoidingView
        behavior="height"
        style={{flex: 1, backgroundColor: color.dark}}>
        <View style={{width: '100%', height: 100, paddingHorizontal: 10}}>
          <TextInput
            style={{
              width: width - 20,
              height: 50,
              backgroundColor: color.gray,
              borderRadius: 10,
              paddingHorizontal: 10,
            }}
            placeholder="Tên nhóm"
            value={text}
            onChangeText={e => setText(e)}
          />
          <TouchableOpacity
            style={{
              backgroundColor: color.dark,
              padding: 10,
              borderRadius: 10,
              flexDirection: 'row',
              gap: 5,
              alignItems: 'center',
            }}>
            <MaterialIcons name="add" size={24} color={color.light} />
            <Text
              style={{color: color.light, fontSize: 18, fontWeight: 'bold'}}>
              Tạo nhóm
            </Text>
          </TouchableOpacity>
        </View>
        <View
          style={{
            width: '100%',
            height: 1,
            backgroundColor: color.light,
          }}></View>
        <FlashList
          data={listuser}
          renderItem={(item: any) => {
            return (
              <TouchableOpacity
                style={{
                  backgroundColor: color.gray,
                  padding: 10,
                  borderRadius: 10,
                  marginHorizontal: 10,
                  marginVertical: 5,
                }}>
                <Image
                  source={{uri: item.avatar}}
                  style={{width: 30, height: 30, borderRadius: 10}}
                />
                <Text>{item.name}</Text>
                <MaterialIcons name="close" size={24} color={color.light} />
              </TouchableOpacity>
            );
          }}
          estimatedItemSize={50}></FlashList>
      </KeyboardAvoidingView>
    );
}
export default Create_Group;