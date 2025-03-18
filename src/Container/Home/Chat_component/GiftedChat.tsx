import React from 'react';
import {Pressable, View, Animated, Keyboard, Image} from 'react-native';
import {GiftedChat} from 'react-native-gifted-chat';
import {
  BottomSheetModalProvider,
  BottomSheetModal,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import {useGiftedChatLogic} from './Hooks/use-Giftedchat';
import CustomInputToolbar from '../../../Screen/Component/Gifchat/RenderInputToolbar';
import {renderSend} from './GiftedchatComponent';
import MessageItem from '../../../Screen/Component/Gifchat/RenderMessage';
import GetAllMedia_Bottomsheet from '../../../Screen/Home/homeComponent/GetAllMedia';
import RenderOptionMessage from '../../../Screen/Component/Gifchat/RenderOptionMessage';
import Conversation from '../../../type/Home/Converstation_type';
import MediaGrid from '../../../Constants/GirdMedia';
import {ReactionIcons} from '../../../Screen/Component/Gifchat/ViewRender/ReactionIcons';
import {Message_type} from '../../../type/Home/Chat_type';
import ModalChatMore from '../../../Constants/ModalMoreChat';
import {NavigationProp, RouteProp} from '@react-navigation/native'; // Import các type cần thiết
import ButtonSelection from './EditMediaChat/ButtonSelect';
import TypingIndicator from '../../../Constants/TypingInput';

export const GiftedChatView = ({
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
  } = useGiftedChatLogic(conversation);

  return (
    <>
      <Pressable
        onPress={() => {
          Keyboard.dismiss();

          setSelectedMessages(null);
        }}
        style={{flex: 1}}
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
              />
            )}
            renderTime={() => null}
            isLoadingEarlier={true}
            showUserAvatar={true}
            keyboardShouldPersistTaps="always"
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
              marginBottom: replyMessage === null ? 60 : 0,
              paddingVertical: 10,
            }}
            parsePatterns={linkStyle => [
              {type: 'phone', style: linkStyle, onPress: onPressPhoneNumber},
              {pattern: /#(\w+)/},
            ]}
            // isTyping={typingUsers?.isTyping}
            renderFooter={() =>
              typingUsers?.isTyping ? (
             <TypingIndicator typingUsers={typingUsers} size={25} dotSize={26} />
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
          <BottomSheetView style={{flex: 1, backgroundColor: color.dark}}>
            <GetAllMedia_Bottomsheet
              handleSheetChanges={handleSheetChanges}
              handlerSelectMedia={handlerSelectMedia}
            />
          </BottomSheetView>
        </BottomSheetModal>
      </BottomSheetModalProvider>
      {selectedMessages && (
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
