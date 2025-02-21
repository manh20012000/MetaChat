import React, { useRef, useState } from 'react';
import { Animated, Text, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import handlerMessage from '../../../util/util_chat/messageReaction';
import userMessage from '../../../type/useMessage_type';
import { putData } from '../../../service/resfull_api';
import { API_ROUTE } from '../../../service/api_enpoint';
import useCheckingService from '../../../service/Checking_service';

interface MessageProps {
    userChat: userMessage;
    conversation: any;
    selectedMessages: any;
}

const RenderIconReact: React.FC<MessageProps> = ({
    selectedMessages,
    userChat,
}) => {
    const messageIcon = [
        { _id: 1, icon: '😍', name: 'wao' },
        { _id: 2, icon: '😢', name: 'sab' },
        { _id: 3, icon: '👍', name: 'like' },
        { _id: 4, icon: '❤️', name: 'love' },
        { _id: 5, icon: '😣', name: 'danger' },
    ];

    const feature = [
        { _id: 1, icon: 'delete', name: 'xóa' },
        { _id: 2, icon: 'more', name: 'thêm' },
        { _id: 3, icon: 'edit', name: 'sửa' },
        { _id: 4, icon: 'remove-circle', name: 'thu hồi' },
    ];

    const [currentReaction, setCurrentReaction] = useState(
        selectedMessages?.reactions || [],
    );
    const { user, dispatch } = useCheckingService();
    const [showReactions, setShowReactions] = useState(false);
    const fadeAnim = useRef(new Animated.Value(0)).current;

    const fadeIn = () => {
        setShowReactions(true);
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
        }).start();
    };

    const fadeOut = () => {
        Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
        }).start(() => setShowReactions(false));
    };

    const handlerReactIcon = async (item: any) => {
        console.log('Reaction selected:', item);

        const updatedReactions = [
            ...currentReaction,
            { user: userChat, reaction: item },
        ];
        setCurrentReaction(updatedReactions);

        const message = handlerMessage(selectedMessages, updatedReactions);

        const data = await putData(
            API_ROUTE.UPDATE_MESSAGE,
            {
                converstation_id: selectedMessages.conversation_id,
                user: userChat,
                message: message,
            },
            { user, dispatch },
        );

        if (data.status === 200) {
            console.log('Cập nhật thành công');
        } else {
            console.log('Cập nhật thất bại');
        }
    };

    return (
        <Animated.View
            style={{
             
                backgroundColor: 'white',
                width: '100%',
                height: '40%',
                position: 'absolute',
                zIndex: 1,
                bottom: '10%',
                left: 0,
                right: 0,
               
            }}>
           
            <TouchableOpacity
                style={{
                    alignSelf: 'center',
                    backgroundColor: 'rgba(223, 11, 57, 0.5)',
                    flexDirection: 'row',
                    borderRadius: 20,
                    padding: 15,
                    width:'90%'
                }}
                onPress={fadeOut}>
                <View style={{ flexDirection: 'row' }}>
                    {messageIcon.map(item => (
                        <TouchableOpacity
                            key={item._id}
                            onPress={() => handlerReactIcon(item)}>
                            <Text style={{ fontSize: 22, marginHorizontal: 5 }}>
                                {item.icon}
                            </Text>
                        </TouchableOpacity>
                    ))}
                    <TouchableOpacity>
                        <Ionicons name="add" size={30} color="white" />
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>

            {/* Hiển thị các tùy chọn khác */}
            <View style={{ flexDirection: 'row', marginTop: 10 }}>
                {feature.map(element => (
                    <TouchableOpacity
                        key={element._id}
                        style={{ alignItems: 'center', marginHorizontal: 10 }}>
                        <MaterialIcons name={element.icon} size={24} color="red" />
                        <Text style={{ color:'red', marginTop: 5,fontWeight:'bold' }}>{element.name}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </Animated.View>
    );
};

export default RenderIconReact;
