import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Message_type } from '../../../../../../types/home_type/Chat_type';
import userMessage from '../../../../../../types/home_type/useMessage_type';

interface ReplyMessageProps {
    currentMessage: Message_type;
    isMyMessage: boolean;
    scrollToMessage: (messageId: string) => void;
    userChat: userMessage
}

export const ReplyMessage: React.FC<ReplyMessageProps> = ({
    currentMessage,
    isMyMessage,
    scrollToMessage,
    userChat
}) => {
    //    console.log(currentMessage)
    return (
        <View
            style={{
                alignSelf: isMyMessage ? 'flex-end' : 'flex-start',
                marginLeft: isMyMessage ? 0 : 30,
                marginTop: 5,
            }}>
            <Text style={{ fontSize: 10, fontWeight: 'bold' }}>
                {currentMessage.user._id === userChat._id
                    ? 'You'
                    : currentMessage.user.name}{' '}
                replied to{' '}
                {currentMessage.replyTo.user._id === userChat._id
                    ? 'You'
                    : currentMessage.replyTo.user._id === currentMessage.user._id
                        ? 'yoursel'
                        : currentMessage.replyTo.user.name}
            </Text>

            <TouchableOpacity
                onPress={() => scrollToMessage(currentMessage.replyTo._id)}
                style={{
                    backgroundColor: 'rgba(223, 11, 57, 0.84)',
                    padding: 8,
                    borderRadius: 10,
                    maxWidth: '65%',
                    alignSelf: isMyMessage ? 'flex-end' : 'flex-start',
                }}>

                <Text style={{ color: '#ccc', fontSize: 13, fontWeight: 'bold' }}>
                    {currentMessage.replyTo.messageType === 'text'
                        ? currentMessage.replyTo.text
                        : 'Attachment'}
                </Text>
            </TouchableOpacity>
        </View>
    );
};