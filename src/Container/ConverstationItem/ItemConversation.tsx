import React from 'react';
import { Pressable, View, Text, Image } from 'react-native';
import userMessage from '../../type/Home/useMessage_type';

import dayjs from 'dayjs';
import { Message_type } from '../../type/Home/Chat_type';
import relativeTime from 'dayjs/plugin/relativeTime';
import Conversation from '../../type/Home/Converstation_type';
import TypingIndicator from '../../Constants/TypingInput';
dayjs.extend(relativeTime);

// Hàm xác định nội dung hiển thị dựa trên messageType
const getMessageContent = (message: Message_type) => {
  if (!message) return;
  switch (message.messageType) {
    case 'text':
      return message.text || 'Bắt đầu cuộc thoại';
    case 'attachment':
      const fileType = message.attachments?.[0]?.type || 'tệp tin';
      return `Đã gửi ${fileType}`;
    case 'call':
      return `Cuộc thoại (${message.callDetails?.status || 'unknown'})`;
    case 'link':
      return 'Đã gửi liên kết';
    case 'react':
      return 'Đã gửi biểu tượng cảm xúc';
    case 'add':
      return 'Đã thêm thành viên';
    case 'edit':
      return 'Đã chỉnh sửa tin nhắn';
    case 'recall':
      return 'Đã thu hồi tin nhắn';
    case 'delete':
      return 'Đã xóa tin nhắn';
    default:
      return 'Bắt đầu cuộc thoại';
  }
};

// Component MessageItem
const MessageItem = ({
  item,
  user,
  color,
  navigation,
  socket,
  user_Status,
  handlePresentModalPress,
  typingUsers,
}: {
  item: Conversation;
  user: userMessage;
  color: any;
  navigation: any;
  socket: any;
  user_Status: any;
  typingUsers: any;
  handlePresentModalPress: (item: Conversation) => void;
}) => {
  const statusUser: boolean = item.participantIds.some(
    (participantId: string) => {
      if (participantId !== user._id) {
        return user_Status.includes(participantId);
      }
    },
  );

  const ConversationShow = item.isDeleted.includes(user._id);
  if (ConversationShow) return null; // Ẩn cuộc trò chuyện nếu bị xóa

  return (
    <>
      <Pressable
        delayLongPress={200}
        onPress={() => {
          if (item.participantIds.length <= 2) {
            const recipientIds = item.participantIds.filter(
              (id: string) => id !== user._id,
            );
            socket?.emit('invite_to_room', {
              conversationId: item._id,
              recipientIds: recipientIds,
            });
          }
          navigation.navigate('HomeChatPersion', {
            conversation: item,
          });
        }}
        onLongPress={() => handlePresentModalPress(item)}
        style={({ pressed }) => [
          {
            width: '100%',
            flexDirection: 'row',
            alignItems: 'center',
            paddingLeft: 10,
            padding: 5,
            marginVertical: 8,
            backgroundColor: pressed ? 'rgb(210, 230, 255)' : color.black,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
          },
        ]}>
        {statusUser && (
          <View
            style={{
              backgroundColor: 'green',
              width: 15,
              height: 15,
              borderRadius: 100,
              position: 'absolute',
              zIndex: 1,
              bottom: 5,
              left: '12%',
            }}></View>
        )}
        {item.avatar ? (
          <Image
            style={{
              width: 50,
              height: 50,
              borderRadius: 25,
              marginRight: 15,
              backgroundColor: color.gray,
            }}
            source={{ uri: item.avatar }}
          />
        ) : (
          <View
            style={{
              width: 50,
              height: 50,
              marginRight: 15,
              position: 'relative',
              backgroundColor: color.gray,
              borderRadius: 100,
            }}>
            {(() => {
              const filteredParticipants: any = item.participants.filter(
                (participant: any) => participant.user.user_id !== user._id,
              );

              const count = filteredParticipants.length;

              if (count === 1) {
                return (
                  <>
                    <Image
                      style={{
                        width: 50,
                        height: 50,
                        borderRadius: 25,
                        backgroundColor: color.gray,
                      }}
                      source={{
                        uri: filteredParticipants[0].user.avatar,
                      }}
                    />
                  </>
                );
              } else if (count === 2) {
                return (
                  <>
                    <Image
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: 15,
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        borderWidth: 2,
                        borderColor: 'white',
                        backgroundColor: color.gray,
                      }}
                      source={{
                        uri: filteredParticipants[0].user?.avatar,
                      }}
                    />
                    <Image
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: 15,
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        borderWidth: 2,
                        borderColor: 'white',
                        backgroundColor: color.gray,
                      }}
                      source={{
                        uri: filteredParticipants[1].user?.avatar,
                      }}
                    />
                  </>
                );
              } else {
                return filteredParticipants
                  .slice(0, 4)
                  .map((participant: any, index: number) => {
                    const positions = [
                      { top: 0, left: 0 },
                      { top: 0, right: 0 },
                      { bottom: 0, left: 0 },
                      { bottom: 0, right: 0 },
                    ];
                    return (
                      <Image
                        key={participant.user._id}
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: 10,
                          position: 'absolute',
                          ...positions[index],
                          borderWidth: 1,
                          borderColor: 'white',
                          backgroundColor: color.gray,
                        }}
                        source={{ uri: participant.user.avatar }}
                      />
                    );
                  });
              }
            })()}
          </View>
        )}
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontWeight: 'bold',
              fontSize: 16,
              color: color.white,
            }}
            numberOfLines={1}
            ellipsizeMode="tail">
            {item.roomName
              ? item.roomName
              : item.participants
                .filter(
                  (participant: any) => participant.user.name !== user.name,
                )
                .map((participant: any) => participant.user.name)
                .filter((name: string) => !!name)
                .join(', ')}
          </Text>
          {typingUsers?.isTyping ? (
            <TypingIndicator typingUsers={typingUsers} size={20} dotSize={12} />
          ) : (
            <View
              style={{
                flexDirection: 'row',
                width: '70%',
                gap: 20,
              }}>
              <Text
                ellipsizeMode="tail"
                numberOfLines={1}
                style={{
                  fontSize: 14,
                  fontWeight: 'bold',
                  color: color.white,
                  width: 'auto',
                }}>
                {item.messages[0]?.user?.user_id === user._id
                  ? `You: ${getMessageContent(item.messages[0])}`
                  : `${item.messages[0]?.user?.name}: ${getMessageContent(
                    item.messages[0],
                  )}`}
              </Text>
              <Text ellipsizeMode="tail" numberOfLines={1} style={{ width: 60 }}>
                {dayjs(item.messages[0]?.createdAt).fromNow()}
              </Text>
            </View>
          )}
        </View>
      </Pressable>
    </>
  );
};

export default MessageItem;
