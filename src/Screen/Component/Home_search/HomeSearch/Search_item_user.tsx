import React, { useState } from 'react';
import { Text, Image, Pressable, View } from 'react-native'
import { itemuser } from '../../../../type/Home/search_type';
import { useDispatch, useSelector } from 'react-redux';  
import { Add_Participate } from '../../../../util/util_chat/Participate';
import { createConversation, findAndconvertConversation, getConversations, update_Converstation } from '../../../../cache_data/exportdata.ts/converstation_cache';
import Conversation from '../../../../type/Home/Converstation_type';
import { useSocket } from '../../../../util/socket.io';
import { ObjectId } from "bson";
import { createListfriend } from '../../../../cache_data/exportdata.ts/friend_cache';
const SearchItemUser: React.FC<{ item:itemuser,navigation:any }> = ({ item,navigation }) => {
  const color = useSelector((state: any) => state.colorApp.value)
  const user = useSelector((state: any) => state.auth.value);
  const socket = useSocket();
  const dispatch = useDispatch();
const handler_chat = async () => {
  try {
   
    // Tìm hoặc chuyển cuộc hội thoại với user lên đầu danh sách
    const participantIds = [item._id, user._id];
    // thực hiênnj kiểm tra cuộc thoại trong cáche xong kiểm tra trên db -> nếu ko có thì mới bắt đầu tạo mới 
    const participants = [
      {
        _id: new ObjectId().toString(),
          user_id: user._id.toString(),
          name: user.name,
          avatar: user.avatar, 
          role: 'admin',
          action_notifi: true,
          status_read: true,
      },
      {
        _id: new ObjectId().toString(),
          user_id: item._id.toString(),
          name: item.name,
          avatar: item.avatar,
          role: 'member',
          action_notifi: true,
          status_read: true,
   
      },
    ];

    const conversation:any = await findAndconvertConversation(
   
      participants,
      participantIds,
      { dispatch, user },
    );
    
   
    if (participantIds.length <= 2) {
    //   await createListfriend({
    //     _id: item._id.toString(),
    //     name: item.name,
    //     avatar: item.avatar,
    //     role: 'member',
    //   });
      
      socket?.emit('invite_to_room', {
        conversationId: conversation._id,
        recipientIds: participantIds
      });
    }
    // console.log(conversation)
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
          {item.roomName ? item.roomName : item.name}
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
    