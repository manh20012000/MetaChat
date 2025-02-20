import React, { useRef, useState } from 'react';
import { Animated, Text, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import handlerMessage from '../../../util/util_chat/messageReaction';
import userMessage from '../../../interface/userMessage.interface';
import { deleteData, putData } from '../../../service/resfull_api';
import { API_ROUTE } from '../../../service/api_enpoint';
import useCheckingService from '../../../service/Checking_service';
import { useSelector } from 'react-redux';
interface MessageProps {
    userChat: userMessage;
    conversation: any;
    selectedMessages: any;
    handlerdeleteMessage: (message: any) => void;
}

const RenderOptionMessage: React.FC<MessageProps> = ({
    selectedMessages,
    userChat,
    handlerdeleteMessage
}) => {
    const color = useSelector(
        (value: { colorApp: { value: any } }) => value.colorApp.value,
    );
    const { user, dispatch } = useCheckingService();
    const [showReactions, setShowReactions] = useState(false);
    const fadeAnim = useRef(new Animated.Value(0)).current;

    

    const handlerdelete = async () => {
           
        handlerdeleteMessage(selectedMessages)
        // const data = await deleteData(
        //     API_ROUTE.DELATE_MESSAGE,
        //    { user, dispatch },
        //     selectedMessages._id
        // );
        // if (data.status === 200) {
        //     console.log('Cập nhật thành công');
        // } else {
        //     console.log('Cập nhật thất bại');
        // }
    };

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
                onPress={handlerdelete}
            >
                <MaterialIcons name='delete' size={28} color="red" />
                <Text style={{ color: color.white, fontWeight: '700' }}>Delete</Text>
            </TouchableOpacity>
            <TouchableOpacity>
                <Ionicons name='copy' size={25} color="red" />
                <Text style={{ color: color.white, fontWeight: '700' }}>Sao chép</Text>
            </TouchableOpacity>
            <TouchableOpacity>
                <AntDesign name='pushpin' size={25} color="red" />
                <Text style={{ color: color.white, fontWeight: '700' }}>Gim</Text>
            </TouchableOpacity>
            <TouchableOpacity>
                <MaterialIcons color="red" name="reply" size={30} />
                <Text style={{ color: color.white, fontWeight: '700' }}>Reply</Text>
            </TouchableOpacity>
        </View>
    );
};

export default RenderOptionMessage