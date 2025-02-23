import React, { useRef } from 'react';
import { Pressable, View } from 'react-native';
import { Bubble, Avatar } from 'react-native-gifted-chat';
import userMessage from '../../../../type/Home/useMessage_type';

interface TextMessageProps {
    isFirstMessage: boolean;
    isMyMessage: boolean;
    currentMessage: any;
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
                console.log(`🟢 Vị trí View: X=${x}, Y=${y}, Width=${width}, Height=${height}`);
                handleLongPressMessage({ x, y }, currentMessage);
            });
        } else {
            console.log("🔴 messageRef.current is null");
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
        </Pressable>
    );
};
