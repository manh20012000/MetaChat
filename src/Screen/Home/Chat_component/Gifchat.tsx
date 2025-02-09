import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  ScrollView,
  Vibration,
  Animated,
  Easing,
  Image,
} from 'react-native';
import {useSelector, useDispatch} from 'react-redux';
import { Bubble, Day, GiftedChat, InputToolbar, Avatar } from 'react-native-gifted-chat';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {API_ROUTE} from '../../../service/api_enpoint';
import { BSON, EJSON, ObjectId } from 'bson';
import {useSocket} from '../../../util/socket.io';
interface GifchatUserProps {
  // Add any props you need here
}
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetModalProvider,
} from '@gorhom/bottom-sheet';
import HandlerSendMessage from '../../../util/util_chat/SendMessages';
import GetAllMedia_Bottomsheet from '../homeComponent/GetAllMedia';
import CustomInputToolbar from './RenderInputToolbar';
import {renderSend} from './Gited_Chat.component';
import {postData, postFormData} from '../../../service/resfull_api';
import useCheckingService from '../../../service/Checking_service';
import Conversation from '../../../interface/Converstation.interface';
import {Message_interface} from '../../../interface/Chat_interface';
import Video from 'react-native-video';
import MediaGrid from '../homeComponent/MediaGrid';
import {update_Converstation} from '../../../cache_data/exportdata.ts/chat_convert_datacache';
import { AnyList } from 'realm';
import MessageItem from '../../Component/GifchatComponent/RenderMessage';
interface GifchatUserProps {
  conversation: Conversation;
}
const GifchatUser = (props: GifchatUserProps) => {

  const {width, height} = useWindowDimensions();
  const color = useSelector(
    (value: {colorApp: {value: any}}) => value.colorApp.value,
  );
  const conversation: Conversation = props.conversation;

  const {user, dispatch} = useCheckingService();
  const socket = useSocket();
  const isPortrait = height > width;
   
  const [messages, setMessages] = useState<any[]>(
    Array.from(conversation.messages)
  );

  // const [isVisible, setVisible] = useState(true);
  // const [isShowSendText, setIsShowSendText] = useState(true);
  // const [changeIcon, setChangIcon] = useState(true);
  // const [text, settext] = useState('');
  // const [inputHeight, setInputHeight] = useState(30);
  const [keyboardOffset, setKeyboardOffset] = useState(0);
  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  const [buttonScale] = useState(new Animated.Value(1));
  const [maginTextInput, setMaginTextInput] = useState<boolean>(false);
  const [selectedMessages, setSelectedMessages] = useState<string[]>([]); // Lưu trữ ID của tin nhắn đã chọn
  // const [participate, setParticipate] = useState<any[]>(
  //   conversation.participants.filter(
  //     participant => participant.user._id !== user._id,
  //   ),
  // ); // Lưu trữ ID của tin nhắn đã chọn
  // const [participateId, setParticipateId] = useState<string[]>(
  //   conversation.participants.map(participant => participant.user._id),
  // ); // Lưu trữ ID của tin nhắn đã chọn

  //danh mục dành cho bootomsheet
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ['40%', '90%'], []);
  const handlePresentModalPress = useCallback(() => {
   
    bottomSheetModalRef.current?.present();
  }, []);
  const handleSheetChanges = useCallback((index: number) => {
    if (index === -1) {
      // -1 indicates the BottomSheet is closed
      setMaginTextInput(false);
      setSelectedItems([]);
    }
  }, []);

  const triggerAnimation = () => {
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 1.2,
        duration: 150,
        easing: Easing.ease,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 150,
        easing: Easing.ease,
        useNativeDriver: true,
      }),
    ]).start();
  };

  useEffect(() => {
    if (selectedItems.length > 0) {
      triggerAnimation();
    }
  }, [selectedItems]);
  const handleSelect = useCallback((item: any) => {
    setSelectedItems(prevSelectedItems => {
      const isSelected = prevSelectedItems.some(
        (selected: any) => selected.id === item.node.id,
      );

      if (isSelected) {
        return prevSelectedItems.filter(
          (selected: any) => selected.id !== item.node.id,
        );
      } else {
        return [...prevSelectedItems, item.node];
      }
    });
  },[]);
  // 

  // phần này dành cho việc gửi tin nhắn
  const onSend = useCallback(
    async (message: Message_interface, filesOrder: any) => {
      const dataSaveSend = {
        user: {
          _id: user._id,
          name: user.name,
          avatar: user.avatar,
        },
        conversation: {
          _id: conversation._id,
          participants: conversation.participants,
          roomName: conversation.roomName,
          background: conversation.background,
          color: conversation.color,
          icon: conversation.icon,
          avatar: conversation.avatar,
        },
        // participateId,
        message,
        filesOrder,
      };
      
      //const dataMessage = await HandlerSendMessage(dataSaveSend);
      const newMessage = {
        ...message,
        user: {
          _id: user._id, // ID người gửi
          name: user.name,
          avatar: user.avatar,
        },
        status: 'sending',
      };

      try {
        setMessages(previousMessages =>
          GiftedChat.append(previousMessages, [newMessage]),
        ); 
       
        const response = await postFormData(
          API_ROUTE.SEND_MESSAGE,
          dataSaveSend,
          {
            dispatch,
            user,
          },
        );
       console.log('response222',response)
        if (response.status === 200) {
          setMessages(previousMessages =>
            previousMessages.map(msg =>
              msg._id === newMessage._id ? {...msg, status: 'sent'} : msg,
            ),
          );
        } else {
          throw new Error('Message sending failed');
        }
      } catch (error) {
        setMessages((previousMessages: Message_interface[]) =>
          previousMessages.map((msg: Message_interface) =>
            msg._id === newMessage._id ? {...msg, status: 'failed'} : msg,
          ),
        );
        console.error('send message failed:', error);
      }
    },
    [],
  );
  useEffect(() => {
    // if (
    //   conversation.messages.length === 0 &&
    //   conversation.participants.length <= 2
    // ) {
    //   socket?.emit('join_room', {
    //     conversationId: conversation._id,
    //   });
    // }
    // lắng nghe sự kiện nhận tin nhắn nha 
    socket?.on('new_message', messages => {
      console.log('messages->>>>>>>>>',messages)
       const {message} = messages;
        // update_Converstation(message, participateId);
       setMessages(prevMessages => [...prevMessages, message]);
     });
    // Cleanup khi component unmount
    return () => {
      socket?.off('new_message');
    };
  }, []);
  const renderMessage = useCallback((props: any) => {
    const { currentMessage } = props;

    return (
      <MessageItem
        currentMessage={currentMessage}
        props={props}
        user={user}
        handleLongPress={handleLongPress}
        handlerreplyTo={handlerreplyTo}
        MediaGrid={MediaGrid}
      />
    );
  }, []);

  const handlerreplyTo = useCallback((props: any) => { 
    Vibration.vibrate(50);
    console.log('rely tin nhăns nha ', props)
  },[])
  

  const handleLongPress = useCallback((message: any) => {
    console.log('touch ', message)
  Vibration.vibrate(50);
  setSelectedMessages(prevSelectedMessages =>
    prevSelectedMessages.includes(message._id)
      ? prevSelectedMessages.filter(id => id !== message._id)
      : [...prevSelectedMessages, message._id],
  );
}, []);
  

  // 
  return (
    <>
      <KeyboardAvoidingView
        style={{flex: 1}}
        // behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={keyboardOffset}>
        <GiftedChat
          
          messages={messages}
          user={{
            _id: user._id,
            name: user.name,
            avatar: user.avatar,
          }}
          renderInputToolbar={props => (
            <CustomInputToolbar
              {...props}
              onSend={onSend}
              conversation={conversation}
            />
          )}
          scrollToBottom
          renderSend={renderSend}
          renderMessage={renderMessage}
    
          renderTime={() => null}
          isLoadingEarlier={true}
          showUserAvatar={true}
          keyboardShouldPersistTaps="handled"
          messagesContainerStyle={{
            marginBottom: 50,
            paddingVertical: 10, // Thêm margin giữa các tin nhắn
          }}
        />
      </KeyboardAvoidingView>
      <BottomSheetModalProvider>
        <BottomSheetModal
          ref={bottomSheetModalRef}
          onChange={handleSheetChanges}
          enablePanDownToClose={true}
          snapPoints={snapPoints}>
          <BottomSheetView style={{flex: 1, backgroundColor: color.dark}}>
            <GetAllMedia_Bottomsheet handleSelect={handleSelect} />
          </BottomSheetView>
        </BottomSheetModal>
      </BottomSheetModalProvider>
      <View
        style={{
          position: 'absolute',
          backgroundColor: 'rgba(0,0,0,0.1)',
          bottom: 10,
          width: '100%',
          zIndex: 10,
        }}>
        {selectedItems.length === 1 ? (
          <Animated.View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-around',
              padding: 10,
              transform: [{scale: buttonScale}],
            }}>
            <TouchableOpacity
              style={{
                backgroundColor: color.pink,
                padding: 10,
                borderRadius: 10,
                width: '40%',
                height: 45,
                alignItems: 'center',
              }}>
              <Text style={{color: color.white, fontWeight: '700'}}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                backgroundColor: color.red,
                padding: 10,
                borderRadius: 10,
                width: '40%',
                height: 45,
                alignItems: 'center',
              }}>
              <Text style={{color: color.white, fontWeight: '700'}}>Send</Text>
            </TouchableOpacity>
          </Animated.View>
        ) : selectedItems.length > 1 ? (
          <Animated.View
            style={{
              alignItems: 'center',
              padding: 10,
              transform: [{scale: buttonScale}],
            }}>
            <TouchableOpacity
              style={{
                backgroundColor: color.red,
                padding: 10,
                borderRadius: 10,
                height: 45,
                width: '70%',
                alignItems: 'center',
              }}>
              <Text style={{color: color.white, fontWeight: '700'}}>
                Send {selectedItems.length}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        ) : null}
      </View>
    </>
  );
};

export default GifchatUser;

function alert(arg0: string) {
  throw new Error('Function not implemented.');
}
// const [keyboardHeight, setKeyboardHeight] = useState(0);
// useEffect(() => {
//   const keyboardDidShowListener = Keyboard.addListener(
//     'keyboardDidShow',
//     e => {
//       setKeyboardHeight(e.endCoordinates.height); // Lấy chiều cao bàn phím
//     },
//   );
//   const keyboardDidHideListener = Keyboard.addListener(
//     'keyboardDidHide',
//     () => {
//       setKeyboardHeight(0); // Ẩn bàn phím
//     },
//   );

//   return () => {
//     keyboardDidShowListener.remove();
//     keyboardDidHideListener.remove();
//   };
// }, []);

// Hàm xử lý tùy chọn trong Modal
//  const handleOptionPress = (option: string) => {
//          if (option === 'Edit') {
//            console.log('Edit:', selectedMessage);
//            // Xử lý chỉnh sửa tin nhắn
//          } else if (option === 'Delete') {
//            console.log('Delete:', selectedMessage);
//            // Xử lý xóa tin nhắn
//            setMessages(prevMessages =>
//              prevMessages.filter(msg => msg._id !== selectedMessage._id),
//            );
//          }
//          setModalVisible(false); // Đóng Modal
//  };  // const renderDay = (props: any) => {
//   return (
//     <Day
//       {...props}
//       containerStyle={{
//         marginVertical: 10,
//         alignItems: 'center',
//       }}
//       textStyle={{
//         color: '#888', // Màu cho thời gian
//         fontSize: 12,
//       }}
//     />
//   );
// };
// const onLongPressMessage = (context: any, message: any) => {
//            console.log('long press message')
//        };
// useEffect(() => {
  //   const onKeyboardShow = () => setKeyboardOffset(30);
  //   const onKeyboardHide = () => setKeyboardOffset(0);

  //   const keyboardDidShowListener = Keyboard.addListener(
  //     'keyboardDidShow',
  //     onKeyboardShow,
  //   );
  //   const keyboardDidHideListener = Keyboard.addListener(
  //     'keyboardDidHide',
  //     onKeyboardHide,
  //   );

  //   return () => {
  //     keyboardDidShowListener.remove();
  //     keyboardDidHideListener.remove();
  //   };
  // }, []);const renderBubble = useCallback(
  //   (props: any) => {
  //     console.log('hahahah')
  //     const isSelected = selectedMessages.includes(props.currentMessage._id);
  //     return (
  //       <Bubble style={{backgroundColor: 'pink', padding: 10}} {...props} />
  //     );
  //   },
  //   [selectedMessages],
  // );

  // const renderAvatar = useCallback((props:any) => {
  //   console.log('renderAvatar props:');

  //   const { currentMessage } = props;
  //   if (!currentMessage || !currentMessage.user?.avatar) {
  //     return null;
  //   }

  //   return (
  //     <Image
  //       source={{ uri: currentMessage.user.avatar }}
  //       style={{ width: 20, height: 20, borderRadius: 20, marginLeft: 5,backgroundColor:'red' }}
  //     />
  //   );
  // }
  //   , []);
