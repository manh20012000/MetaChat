import React, { useState } from 'react';
import { Text, Image, Pressable, View } from 'react-native'
import { itemuser } from '../../../interface/search_user.interface';
import { useSelector } from 'react-redux';  
import { Add_Participate } from '../../../util/util_chat/Participate';
import {createConversation, findAndconvertConversation, getConversations, update_Converstation } from '../../../cache_data/exportdata.ts/chat_convert_datacache';
import Conversation from '../../../interface/Converstation.interface';
const SearchItemUser: React.FC<{ item: itemuser,navigation:any }> = ({ item,navigation }) => {
  const color = useSelector((state: any) => state.colorApp.value)
  const currentUser = useSelector((state: any) => state.auth.value);

const handler_chat = async () => {
  try {
    // Tìm hoặc chuyển cuộc hội thoại với user lên đầu danh sách
    const participantIds = [item._id, currentUser._id];
    const participants = [
      {
        user: {
          _id: currentUser._id.toString(),
          account: currentUser.account,
          avatar: currentUser.avatar,
        },
        role: 'admin',
      },
      {
        user: {
          _id: item._id.toString(),
          name: item.account,
          avatar: item.avatar,
        },
        role: 'member',
      },
    ];
    const conversation = await findAndconvertConversation(
      item,
      participantIds,
      participants,
    );
    // // Chuyển đến màn hình chat cá nhân với thông tin người dùng
    navigation.navigate('HomeChatPersion', {conversation});
  } catch (error) {
    console.error('Lỗi trong handler_chat:', error);
  }
};


    return (
      <Pressable
        onPress={() => {
         handler_chat()
        }}
        style={({pressed}) => [
          {
            width: '100%',
            flexDirection: 'row',
            alignItems: 'center',
            paddingLeft: 10,
            padding: 5,
            marginVertical: 8,
            backgroundColor: pressed ? 'rgb(255, 255, 255)' : color.black,
            shadowColor: '#000',
            shadowOffset: {width: 0, height: 2},
          },
        ]}>
        {item.statusUser && (
          <View
            style={{
              backgroundColor: 'green',
              width: 15,
              height: 15,
              borderRadius: 100,
              position: 'absolute',
              zIndex: 1,
              bottom: 5,
              left: '12%',
            }}></View>
        )}
        <Image
          source={{uri: item.avatar}}
          style={{
            backgroundColor: color.gray,
            width: 50,
            height: 50,
            borderRadius: 100,
          }}
        />
        <Text
          style={{
            marginLeft: '5%',
            color: color.light,
            fontSize: 18,
            fontWeight: 'bold',
          }}>
          {item.roomName ? item.roomName : item.account}
        </Text>
      </Pressable>
    );

}
export default SearchItemUser

//  const handler_chat = async () => {
//    try {
//      // Lấy danh sách cuộc hội thoại từ local (Realm)
//      const conversation: any = await findAndconvertConversation(
//        item._id,
//      );
//       if (conversation) {
//      console.log('Đã chuyển cuộc hội thoại lên đầu danh sách.');
      
//         console.log('Chuyển cuộc hội thoại lên đầu danh sách.');
//       } else {
//         // Nếu chưa tồn tại, tạo cuộc hội thoại mới và thêm vào danh sách
//         console.log('Thêm mới cuộc hội thoại thành công.');
//       }

//      // Cập nhật danh sách hội thoại trong giao diện (đưa mục vừa tương tác lên đầu)
//     //  const updatedConversations = [
//     //    {...item},
//     //    ...conversations.filter(conversation => conversation._id !== item._id),
//     //  ];

//      // Cập nhật lại danh sách hội thoại trong state của component
//     //  setConversations(updatedConversations);

//      // Điều hướng sang màn hình GiftedChat
//      navigation.navigate('HomeChatPersion', {item});
//    } catch (error) {
//      console.error('Lỗi trong handler_chat:', error);
//    }
//  };
