import React, { useRef, useState } from 'react';
import { Animated, Text, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import handlerMessage from '../../../util/util_chat/messageReaction';
import userMessage from '../../../type/Home/useMessage_type';
import { deleteData, putData } from '../../../service/resfull_api';
import { API_ROUTE } from '../../../service/api_enpoint';
import useCheckingService from '../../../service/Checking_service';
import { useSelector } from 'react-redux';
import useUserRenderOption from './ViewRender/hook/use-renderOption';
import { Message_type } from '../../../type/Home/Chat_type';
interface MessageProps {
    userChat: userMessage;
    conversation: any;
    selectedMessages: any;
   
    setSelectedMessages: React.Dispatch<React.SetStateAction<any>>;
    setMessageMoreAction :React.Dispatch<React.SetStateAction<any>>
}
const RenderOptionMessage: React.FC<MessageProps> = ({
    selectedMessages,
    userChat,

    conversation, setSelectedMessages, setMessageMoreAction
}) => {
    const color = useSelector(
        (value: { colorApp: { value: any } }) => value.colorApp.value,
    );
    const { user, dispatch } = useCheckingService();
    const [showReactions, setShowReactions] = useState(false);
    const fadeAnim = useRef(new Animated.Value(0)).current;

    // console.log(selectedMessages.user)

    const { handlerMore, issendMessage } = useUserRenderOption(
      userChat,
      conversation,
      selectedMessages,
        setMessageMoreAction,
        setSelectedMessages
        
  );

    return (
        <View
            style={{
                position: 'absolute',
                bottom: 10,
                width: '100%',
                height: 60,
                justifyContent: 'space-around',
                alignItems: 'center',
                flexDirection: 'row',
                backgroundColor:"black"
            }}>

            <TouchableOpacity
                style={{alignItems: 'center',justifyContent:'center',}}
                onPress={handlerMore}
            >
                <MaterialIcons name='read-more' size={30} color="red" />
                <Text style={{ color: color.white, fontWeight: '700' }}>More</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={{ alignItems: 'center', justifyContent: 'center', }}
            >
                <Ionicons name='copy' size={25} color="red" />
                <Text style={{ color: color.white, fontWeight: '700' }}>Sao chép</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={{ alignItems: 'center', justifyContent: 'center', }}>
                <AntDesign name='pushpin' size={25} color="red" />
                <Text style={{ color: color.white, fontWeight: '700' }}>Gim</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ alignItems: 'center', justifyContent: 'center', }}>
                <MaterialIcons color="red" name="reply" size={30} />
                <Text style={{ color: color.white, fontWeight: '700' }}>Reply</Text>
            </TouchableOpacity>
        </View>
    );
};

export default RenderOptionMessage