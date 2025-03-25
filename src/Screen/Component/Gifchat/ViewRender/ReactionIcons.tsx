import React, {useCallback, useMemo} from 'react';
import {TouchableOpacity, Text, View} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {Message_type, reactions} from '../../../../type/Home/Chat_type';
import userMessage from '../../../../type/Home/useMessage_type';
import {messageIcon} from '../../../../type/react-type';

interface ReactionIconsProps {
  isMyMessage: boolean;
  handlerReactIcon: (item: any) => void;
  userChat: userMessage;
  reactionPosition: {x: number; y: number};
  selectedMessages: Message_type;
}

export const ReactionIcons: React.FC<ReactionIconsProps> = ({
  reactionPosition,
  handlerReactIcon,
  userChat,
  selectedMessages,
}) => {
  const isMyMessage = useMemo(() => {
    return selectedMessages.user._id === userChat._id;
  }, [selectedMessages]);

  const handlerReactMessage = (item: any) => {
    // Tìm index của reaction của user hiện tại
    const reactionIndex = selectedMessages.reactions.findIndex(
      (reaction) => reaction.user._id === userChat._id
    );

    // Nếu user đã có reaction, cập nhật lại reaction đó
    if (reactionIndex !== -1) {
      return {
        ...selectedMessages,
        reactions: selectedMessages.reactions.map((reaction, index) =>
          index === reactionIndex
            ? { ...reaction, reaction: item._id } // Cập nhật reaction của user
            : reaction
        ),
        other: `đã bày tỏ cảm xúc ${item.icon}`,
      };
    }

    return {
      ...selectedMessages,
      reactions: [
        ...selectedMessages.reactions,
        {
          user: userChat,
          reaction: item._id,
        },
      ],
      other: `đã bày tỏ cảm xúc ${item.icon}`,
    };
  };

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
        <TouchableOpacity
          key={item._id}
          onPress={() => {
            handlerReactIcon(handlerReactMessage(item));
          }}>
          <Text style={{fontSize: 30, marginHorizontal: 5}}>{item.icon}</Text>
        </TouchableOpacity>
      ))}
      <TouchableOpacity>
        <Ionicons name="add" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
};
