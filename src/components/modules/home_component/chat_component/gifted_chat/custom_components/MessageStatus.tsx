import React from 'react';
import { Text } from 'react-native';
import { Message_type } from '../../../../../../types/home_type/Chat_type';

interface MessageStatusProps {
    currentMessage: Message_type;
    isMyMessage: boolean;
}
export const MessageStatus: React.FC<MessageStatusProps> = ({
    currentMessage,
    isMyMessage,
}) => {
    return (
        <Text
            style={{
                fontSize: 12,
                color: 'white',
                marginTop: 5,
                textAlign: isMyMessage ? 'right' : 'left',
            }}>
            {currentMessage.status === 'sending'
                ? 'Sending...'
                : currentMessage.status === 'sent'
                    ? 'Sent'
                    : currentMessage.status === 'failed'
                        ? 'Failed'
                        : ''}
        </Text>
    );
};