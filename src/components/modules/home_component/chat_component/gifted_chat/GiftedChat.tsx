import React from 'react';
import { Pressable, View, Animated, Keyboard, Image } from 'react-native';
import { GiftedChat } from 'react-native-gifted-chat';
import {
  BottomSheetModalProvider,
  BottomSheetModal,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { useGiftedChat } from './useGiftedchat/useGiftedchat';
import CustomInputToolbar from './custom_components/RenderInputToolbar';
import { renderSend } from './GiftedchatComponent';
import MessageItem from './custom_components/RenderMessage';
import GetAllMedia_Bottomsheet from '../../../../commons/home_components/GetAllMedia';
import RenderOptionMessage from './custom_components/RenderOptionMessage';
import Conversation from '../../../../../types/home_type/Converstation_type';
import MediaGrid from '../../../../commons/home_components/MediaGrid';
import { ReactionIcons } from './custom_components/ReactionIcons';
import { Message_type } from '../../../../../types/home_type/Chat_type';
import ModalChatMore from '../../home_chat_component/ModalMoreChat';
import { NavigationProp, RouteProp } from '@react-navigation/native'; // Import các type cần thiết
import ButtonSelection from '../edit_media_chat/ButtonSelect';
import TypingIndicator from '../../home_chat_component/TypingInput';

const GiftedChatView = ({
  conversation,
  navigation,
}: {
  conversation: Conversation;
  navigation: any;
}) => {
  const {
    color,
    userChat,
    messages,
    maginViewGiftedchat,
    setReplyMessage,
    replyMessage,
    selectedMessages,
    bottomSheetModalRef,
    snapPoints,
    handlePresentModalPress,
    handleSheetChanges,
    scrollToMessage,
    handlerSelectMedia,
    onSend,
    selectedItemsMedia,
    setSelectedMessages,
    handlerReaction,
    handlerreplyTo,
    handleLongPress,
    setReactionPosition,
    reactionPosition,
    messageMoreAction,
    setMessageMoreAction,
    flatListRef,
    onPressPhoneNumber,
    highlightedMessageId,
    handlerDeleteMessage,
    setSelectedItemsMedia,
    typingUsers,
    markPaticipantReadMessage,
    checkReadMessage,
  } = useGiftedChat(conversation);

  return (
    <>
      <Pressable
        delayLongPress={200}
        onPress={() => {
          Keyboard.dismiss();

          setSelectedMessages(null);
        }}
        style={{ flex: 1 }}
        accessible={true}>
        <View
          style={{
            flex: 1,
            marginBottom: maginViewGiftedchat,
            backgroundColor: color.black,
          }}>
          <GiftedChat
            messages={messages}
            infiniteScroll={true}
            user={{
              _id: userChat._id,
              name: userChat.name,
              avatar: userChat.avatar,
            }}
            renderInputToolbar={props => (
              <CustomInputToolbar
                {...props}
                onSend={onSend}
                userChat={userChat}
                conversation={conversation}
                replyMessage={replyMessage}
                setReplyMessage={setReplyMessage}
                handlePresentModalPress={handlePresentModalPress}
              />
            )}
            scrollToBottom={true}
            renderSend={renderSend}
            renderMessage={(props: any) => (
              <MessageItem

                highlightedMessageId={highlightedMessageId}
                currentMessage={props.currentMessage}
                props={props}
                userChat={userChat}
                handleLongPress={handleLongPress}
                handlerreplyTo={handlerreplyTo}
                scrollToMessage={scrollToMessage}
                selectedMessages_id={selectedMessages?._id}
                setSelectedMessages={setSelectedMessages}
                setReactionPosition={setReactionPosition}
                markPaticipantReadMessage={markPaticipantReadMessage}
                checkReadMessage={checkReadMessage}
              />
            )}
            renderTime={() => null}
            isLoadingEarlier={true}
            showUserAvatar={true}
            keyboardShouldPersistTaps="handled"
            listViewProps={{
              initialNumToRender: 15, // Số tin nhắn được render ban đầu
              maxToRenderPerBatch: 10, // Số lượng tin nhắn tối đa được render trong một lần cập nhật
              windowSize: 5, // Kích thước cửa sổ render (tăng nếu muốn giữ nhiều item hơn)
              removeClippedSubviews: false, // Không xóa component khi ra khỏi màn hình
              showsVerticalScrollIndicator: false, // Ẩn thanh cuộn dọc
              showsHorizontalScrollIndicator: false, // Ẩn thanh cuộn ngang
              ref: flatListRef, // Gán ref
            }}
            messagesContainerStyle={{
              // marginBottom: replyMessage === null ? 60 : 0,
              paddingVertical: 10,
            }}
            parsePatterns={linkStyle => [
              { type: 'phone', style: linkStyle, onPress: onPressPhoneNumber },
              { pattern: /#(\w+)/ },
            ]}
            // isTyping={true}
            renderFooter={() =>
              typingUsers?.isTyping && typingUsers.roomId === conversation._id ? (
                <TypingIndicator
                  typingUsers={typingUsers}
                  size={20}
                  dotSize={10}
                />
              ) : null
            }
          />
        </View>
      </Pressable>
      <BottomSheetModalProvider>
        <BottomSheetModal
          ref={bottomSheetModalRef}
          onChange={handleSheetChanges}
          enablePanDownToClose={true}
          enableContentPanningGesture={false}
          snapPoints={snapPoints}>
          <BottomSheetView style={{ flex: 1, backgroundColor: color.dark }}>
            <GetAllMedia_Bottomsheet
              handleSheetChanges={handleSheetChanges}
              handlerSelectMedia={handlerSelectMedia}
            />
          </BottomSheetView>
        </BottomSheetModal>
      </BottomSheetModalProvider>
      {selectedMessages && !replyMessage && (
        <>
          <ReactionIcons
            isMyMessage={true}
            userChat={userChat}
            handlerReactIcon={handlerReaction}
            reactionPosition={reactionPosition}
            selectedMessages={selectedMessages}
          />
          <RenderOptionMessage
            userChat={userChat}
            conversation={conversation}
            selectedMessages={selectedMessages}
            setSelectedMessages={setSelectedMessages}
            setMessageMoreAction={setMessageMoreAction}
          />
        </>
      )}
      {messageMoreAction && (
        <ModalChatMore
          conversation={conversation}
          messageMoreAction={messageMoreAction}
          setMessageMoreAction={setMessageMoreAction}
          userChat={userChat}
          handlerDeleteMessage={handlerDeleteMessage} // ✅ Đảm bảo hàm nhận tham số
        />
      )}
      {selectedItemsMedia.length > 0 && (
        <ButtonSelection
          onSend={onSend}
          handleSheetChanges={handleSheetChanges}
          selected={selectedItemsMedia}
          setSelectedItemsMedia={setSelectedItemsMedia}
          userChat={userChat}
          conversation={conversation}
        />
      )}
    </>
  );
};
export default GiftedChatView
