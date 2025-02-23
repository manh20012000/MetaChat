import React from 'react';
import { Pressable, View, Animated, Keyboard } from 'react-native';
import { GiftedChat } from 'react-native-gifted-chat';
import { BottomSheetModalProvider, BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { useGiftedChatLogic } from './Hooks/use-chat';
import CustomInputToolbar from '../../../Screen/Component/Gifchat/RenderInputToolbar';
import { renderSend } from './GiftedchatComponent';
import MessageItem from '../../../Screen/Component/Gifchat/RenderMessage';
import GetAllMedia_Bottomsheet from '../../../Screen/Home/homeComponent/GetAllMedia';
import RenderOptionMessage from '../../../Screen/Component/Gifchat/RenderOptionMessage';
import Conversation from '../../../type/Home/Converstation_type';
import MediaGrid from '../../../Constants/GirdMedia';
import { ReactionIcons } from '../../../Screen/Component/Gifchat/ViewRender/ReactionIcons';

export const GiftedChatView = ({ conversation }: { conversation: Conversation }) => {
  const {
    color,
    userChat,
    messages,
    selectedItems,
    buttonScale,
    maginTextInput, setReplyMessage,
    replyMessage,
    selectedMessages,
    bottomSheetModalRef,
    snapPoints,
    handlePresentModalPress,
    handleSheetChanges,
    scrollToMessage,
    handleSelect,
    onSend,
    setSelectedMessages,
    handlerReaction,
    handlerreplyTo,
    handleLongPress,
    handlerdeleteMessage,
  } = useGiftedChatLogic(conversation);

  return (
    <>
      <Pressable
        onPress={() => {
          Keyboard.dismiss();
          setSelectedMessages(null);
        }}
        style={{ flex: 1 }}
        accessible={true}>
        <View style={{ flex: 1, marginBottom: 0, backgroundColor: color.black }}>
          <GiftedChat
            messages={messages}
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
              />
            )}
            scrollToBottom={true}
            renderSend={renderSend}
            renderMessage={props => (
              <MessageItem
             
                currentMessage={props.currentMessage}
                props={props}
                userChat={userChat}
                handleLongPress={handleLongPress}
                handlerreplyTo={handlerreplyTo}
                MediaGrid={MediaGrid}
                scrollToMessage={scrollToMessage}
                selectedMessages_id={selectedMessages?._id}
                setSelectedMessages={setSelectedMessages}
         
                
              />
            )}
            renderTime={() => null}
            isLoadingEarlier={true}
            showUserAvatar={true}
            keyboardShouldPersistTaps="always"
            messagesContainerStyle={{
              marginBottom: replyMessage === null ? 60 : 0,
              paddingVertical: 10,
            }}
          />
        </View>
      </Pressable>
      <BottomSheetModalProvider>
        <BottomSheetModal
          ref={bottomSheetModalRef}
          onChange={handleSheetChanges}
          enablePanDownToClose={true}
          snapPoints={snapPoints}>
          <BottomSheetView style={{ flex: 1, backgroundColor: color.dark }}>
            <GetAllMedia_Bottomsheet handleSelect={handleSelect} />
          </BottomSheetView>
        </BottomSheetModal>
      </BottomSheetModalProvider>
      {selectedMessages && (
        <>
        
            <ReactionIcons
              isMyMessage={true}
              userChat={userChat}
            />
          <RenderOptionMessage
            userChat={userChat}
            conversation={conversation}
            selectedMessages={selectedMessages}
            handlerdeleteMessage={handlerdeleteMessage}
          />
        </>
      )}
    </>
  );
};