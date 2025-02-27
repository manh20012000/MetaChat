import React, { useRef } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Bubble, Avatar } from 'react-native-gifted-chat';
import userMessage from '../../../../type/Home/useMessage_type';
import { messageIcon } from '../../../../type/react-type';
import { Message_type } from '../../../../type/Home/Chat_type';
import { TouchableOpacity } from 'react-native';
interface TextMessageProps {
    isFirstMessage: boolean;
    isMyMessage: boolean;
    currentMessage: Message_type;
    props: any;
    handleLongPressMessage: (position: { x: number, y: number }, message: any) => void;
    color: any;
    userChat: userMessage,
    handlderHidenIcon: any
    setSelectedMessages: React.Dispatch<React.SetStateAction<any>>;
}


export const TextMessage: React.FC<TextMessageProps> = ({
    isFirstMessage,
    isMyMessage,
    currentMessage,
    props,
    handleLongPressMessage,
    color,
    userChat,
    handlderHidenIcon,setSelectedMessages
}) => {
    const messageRef = useRef<View>(null);

    const getPosition = () => {
        if (messageRef.current) {
            messageRef.current.measureInWindow((x, y, width, height) => {
                handleLongPressMessage({ x, y }, currentMessage);
            });
        } 
    };

    return (
        <Pressable
            onPress={() => {
                setSelectedMessages(null)
                handlderHidenIcon(false)
            }}
            ref={messageRef}  // Gán ref vào Pressable để đo được tọa độ
            style={{ flexDirection: 'row', alignItems: 'flex-end', marginVertical: 1}}
        >
            {isFirstMessage && currentMessage.user._id !== userChat._id && (
                <Avatar {...props} />
            )}

            <Bubble
                {...props}
                onLongPress={getPosition}
                wrapperStyle={{
                    left: {
                        backgroundColor: color.gray2,
                        maxWidth: '65%',
                        padding: 5
                    },
                    right: {
                        backgroundColor: isMyMessage ? color.blue : color.gray2,
                        maxWidth: '65%',
                        padding: 5
                    },
                }}
                textStyle={{
                    left: { color: 'white' },
                    right: { color: 'white' },
                }}
            />
            {currentMessage.reactions.length > 0 && (
                <View style={{
                    flexDirection: 'row', backgroundColor: 'pink', position: 'absolute', top: 0, left: 0,
                    alignSelf: isMyMessage?"flex-end":'flex-start'
                }}>
                    {currentMessage.reactions.slice(-2).map((iconId: any) => {
                    const reaction = messageIcon.find(item => item._id === iconId._id);
                    return reaction ? (
                        <TouchableOpacity key={reaction._id}>
                            <Text>{reaction.icon}</Text>
                        </TouchableOpacity>
                    ) : null;
                })}
                </View>
            )}

        </Pressable>
    );
};
