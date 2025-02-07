import React from 'react';
import { View, Text, Image } from 'react-native';
import { Bubble, Day } from 'react-native-gifted-chat';

interface MessageProps {
  currentMessage: any;
  user: any;
  handleLongPress: (message: any) => void;
  MediaGrid: (attachments: any) => React.ReactNode;
  props: any;
}

const MessageItem: React.FC<MessageProps> = ({ currentMessage, user, handleLongPress, MediaGrid, props }) => {
  
  return (
    <View style={{ marginBottom: 10, marginHorizontal: 10 }}>
      <Day {...props} />
      {currentMessage.messageType === 'text' && (
        <Bubble
          {...props}
          onLongPress={(context, message) => handleLongPress(message)}
        />
      )}
      {currentMessage.messageType === 'image' && (
        <Image
          source={{ uri: currentMessage.image }}
          style={{ width: 100, height: 100 }}
        />
      )}
      {currentMessage.messageType === 'attachment' && MediaGrid(currentMessage.attachments)}
      {currentMessage.user._id === user._id && (
        <Text
          style={{
            fontSize: 12,
            color: 'white',
            marginTop: 5,
            textAlign: 'right',
          }}>
          {currentMessage.status === 'sending'
            ? 'Sending...'
            : currentMessage.status === 'sent'
              ? 'Sent'
              : currentMessage.status === 'failed'
                ? 'Failed'
                : ''}
        </Text>
      )}
    </View>
  );
};

export default MessageItem;
