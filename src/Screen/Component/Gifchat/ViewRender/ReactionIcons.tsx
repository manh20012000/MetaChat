import React, { useCallback, useMemo } from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Message_type, reactions } from '../../../../type/Home/Chat_type';
import userMessage from '../../../../type/Home/useMessage_type';

interface ReactionIconsProps {
    isMyMessage: boolean;
   handlerReactIcon: (item: any) => void;
    userChat: userMessage
    reactionPosition: { x: number, y: number }
    selectedMessages:Message_type
}
const messageIcon = [
        { _id: 1, icon: '😍', name: 'wao' },
        { _id: 2, icon: '😢', name: 'sab' },
        { _id: 3, icon: '👍', name: 'like' },
        { _id: 4, icon: '❤️', name: 'love' },
        { _id: 5, icon: '😣', name: 'danger' },
    ];
  
export const ReactionIcons: React.FC<ReactionIconsProps> = ({

    reactionPosition,
   handlerReactIcon,
    userChat,
    selectedMessages
}) => {
    const isMyMessage = useMemo(() => { return selectedMessages.user._id === userChat._id; }, [selectedMessages])
   
    const handlerReactMessage = (item: any)=>{
        return {
            ...selectedMessages,
            reactions: [...selectedMessages.reactions, {
                user: userChat,
                reaction: item
            }],
            other: "đã bày tỏ cảm xúc " + item.icon
            
         }
      }

    return (
        <View
            style={{
                position: 'absolute',
                backgroundColor: 'rgb(189, 8, 53)',
                flexDirection: 'row',
                borderRadius: 20,
                right: isMyMessage ? 30 : undefined,
                left: isMyMessage ? undefined : 30,
                alignSelf: isMyMessage ? 'flex-end' : 'flex-start',
                zIndex: 1, 
                width: '70%',
                height: 44,
                bottom: '10%',
                top: reactionPosition.y - 20, // Điều chỉnh lên trên tin nhắn một chút
                alignItems: 'center',
                justifyContent: 'center',
            }}>
            {messageIcon.map((item: any) => (
                <TouchableOpacity key={item._id}
                    onPress={() => {
                        handlerReactIcon(handlerReactMessage(item));
                    }}
                >
                    <Text style={{ fontSize: 30, marginHorizontal: 5 }}>{item.icon}</Text>
                </TouchableOpacity>
            ))}
            <TouchableOpacity>
                <Ionicons name="add" size={24} color="white" />
            </TouchableOpacity>
        </View>
    );
};