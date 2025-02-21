import { FlashList } from '@shopify/flash-list';
import { useEffect, useState } from 'react';
import {View, Text,TouchableOpacity, KeyboardAvoidingView,useWindowDimensions, Image} from 'react-native';
import { TextInput } from 'react-native-gesture-handler';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useDispatch, useSelector } from 'react-redux';
import { getListfriend } from '../../../cache_data/exportdata.ts/friend_cache';
import { getData } from '../../../service/resfull_api';
import {API_ROUTE} from '../../../service/api_enpoint';
const Create_Group = () => {
    const user = useSelector((state: any) => state.auth.value);
    const dispatch = useDispatch()
  const color = useSelector((state: any) => state.colorApp.value);
  const [skip,setskip]=useState(0)
  // const getlistuser=get_list_user_localdata()    
  const [listuser, setlistuser] = useState<any[]>()
    const [text,setText]=useState('')
    useEffect(() => {
        const getListUser = async () => {
          const listuser = await getListfriend()
          if (Array.from(listuser).length > 0) {
            setlistuser(Array.from(listuser));
          } else {
            const listuser = await getData(
              API_ROUTE.GET_LIST_FRIEND_CHAT,
              null,
              skip,
              {dispatch, user},
            );
         
            // setlistuser(listuser);
          }
        };
        getListUser()
    },[])
    const {width,height}=useWindowDimensions()

    return (
      <View
       
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
      </View>
    );
}
export default Create_Group;