import React from 'react';
import { Text } from 'react-native';

interface MessageStatusProps {
    currentMessage: any;
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