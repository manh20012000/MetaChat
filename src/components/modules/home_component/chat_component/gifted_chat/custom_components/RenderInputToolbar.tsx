import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  useWindowDimensions,
  Animated,
  Alert,
  Linking,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { InputToolbar } from 'react-native-gifted-chat';
import { useSelector } from 'react-redux';
import { Send } from '../../../../../../assets/svg/svgfile';
import Conversation from '../../../../../../types/home_type/Converstation_type';
import { BSON } from 'bson';
import PermissionCamera from '../../../../../../utils/permision_app/CameraChatPermission';
import userMessage from '../../../../../../types/home_type/useMessage_type';
import { Message_type } from '../../../../../../types/home_type/Chat_type';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../../../../../../types/navigation_type/rootStackScreen';
import UseModalMap from '../../share_map_chat/useMapShare';
import useRenderInput from './hook/use-renderInput';
import MicroChat from '../../microphone_chat/MicroChat';
import MicrophonePermission from '../../../../../../utils/permision_app/MicrophonePermision';

import MapLocaltedPermission from '../../../../../../utils/permision_app/MapPermission';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import ModalMap from '../../share_map_chat/ShareMap';
type NavigationProps = NavigationProp<RootStackParamList>;
type TCusttomTypeInput = {
  onSend: any;
  userChat: userMessage;
  replyMessage: Message_type | null;
  conversation: Conversation;
  setReplyMessage: React.Dispatch<React.SetStateAction<Message_type | null>>;
  handlePresentModalPress: () => void;
};

const CustomInputToolbar: React.FC<TCusttomTypeInput> = (props: any) => {
  const { width, height } = useWindowDimensions();
  const deviceInfo = useSelector(
    (value: { deviceInfor: { value: any } }) => value.deviceInfor.value,
  );
  const {
    handlePresentModalPress,
    userChat,
    replyMessage,
    setReplyMessage,
    conversation,
    onSend,
  } = props;

  const color = useSelector(
    (value: { colorApp: { value: any } }) => value.colorApp.value,
  );
  const [turnOnMic, setTurnOnMic] = useState<boolean>(false);

  const {
    handlePress,
    text, setOpenMap,
    handleSend,
    changeIcon,
    isShowSendText,
    setIsShowSendText,
    inputHeight,
    setInputHeight,
    setChangeIcon,
    openMap,
    onchangeTyping,
    onClose,
  } = useRenderInput(props);
  return (
    <View style={{}}>
      {replyMessage && (
        <View
          style={{
            width: width,
            marginBottom: 10,
            alignContent: 'center',
            paddingHorizontal: 10,
            borderTopWidth: 2,
            borderTopColor: 'gray',
            justifyContent: 'center',
            alignSelf: 'center',

          }}>
          <Text style={{ color: 'white', fontWeight: 'bold' }}>
            Replying to{' '}
            {replyMessage.user !== userChat.user_id
              ? 'youself'
              : replyMessage.user.name}
          </Text>
          <Text
            style={{ color: 'white', width: width - 50, fontSize: 18 }}
            numberOfLines={1}
            ellipsizeMode="tail">
            {replyMessage.messageType === 'text'
              ? replyMessage.text
              : 'reply atatment'}
          </Text>
          <TouchableOpacity
            onPress={() => setReplyMessage(null)}
            style={{
              borderWidth: 2,
              borderRadius: 100,
              height: 30,
              width: 30,
              position: 'absolute',
              right: 10,
              alignSelf: 'center',
              justifyContent: 'center',
            }}>
            <MaterialIcons
              name="cancel"
              size={20}
              color="white"
              style={{ alignSelf: 'center' }}
            />
          </TouchableOpacity>
        </View>
      )}
      {turnOnMic === false ? (
        <View
          style={{
            width: width,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-around',
            // position: 'absolute',
            bottom: 5,
            paddingVertical: 10,
            zIndex: 1,
            height: inputHeight + 10,

          }}>
          {changeIcon ? (
            <View
              style={{
                flexDirection: 'row',
                columnGap: 10,
                alignItems: 'center',
              }}>
              <TouchableOpacity
                onPress={async () => {
                  console.log(await MapLocaltedPermission(), 'kedjjdsjds')
                  if (await MapLocaltedPermission()) {
                    setOpenMap(true)
                    // onClose()
                  } else {
                    Linking.openSettings();
                    console.log('cấp quyền thất bại ');
                  }

                }}>
                <FontAwesome
                  name="location-arrow"
                  color={color.blue}
                  size={30}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={async () => {
                  const check = await MicrophonePermission();
                  if (check) {
                    setTurnOnMic(true);
                  } else {
                    Linking.openSettings();
                    console.log('cấp quyền thất bại ');
                  }
                }}>
                <MaterialCommunityIcons
                  name="microphone"
                  color={color.blue}
                  size={30}
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={handlePresentModalPress}>
                <MaterialCommunityIcons
                  name="image"
                  color={color.blue}
                  size={30}
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={handlePress}>
                <MaterialCommunityIcons
                  name="camera"
                  color={color.blue}
                  size={30}
                />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity onPress={() => setChangeIcon(true)}>
              <MaterialCommunityIcons
                name="chevron-right"
                color={color.blue}
                size={30}
              />
            </TouchableOpacity>
          )}
          <View
            style={{
              backgroundColor: color.gray,
              width: changeIcon ? '45%' : '80%',
              height: inputHeight,
              minHeight: 30,
              maxHeight: 100,
              borderRadius: 10,
              paddingHorizontal: 10,
              justifyContent: 'space-between',
              alignItems: 'center',
              flexDirection: 'row',
            }}>
            <TextInput
              multiline
              placeholder="Message"
              value={text}
              style={{
                minHeight: 30,
                maxHeight: 100,
                width: '85%',
                height: inputHeight,
              }}
              onContentSizeChange={e =>
                setInputHeight(Math.min(100, e.nativeEvent.contentSize.height))
              }
              onFocus={() => setChangeIcon(true)}
              onChangeText={value => {

                onchangeTyping(value)
                if (value !== '') {
                  setChangeIcon(false);
                  setIsShowSendText(false);
                } else {
                  setChangeIcon(true);
                  setIsShowSendText(true);
                }

              }}
            />
            <TouchableOpacity>
              <MaterialCommunityIcons
                name="emoticon"
                color={color.blue}
                size={30}
              />
            </TouchableOpacity>
          </View>
          {isShowSendText ? (
            <TouchableOpacity>
              <Text style={{ fontSize: 25 }}>{conversation?.icon}</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => {
                handleSend();
              }}>
              <Send />
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <MicroChat
          onSend={onSend}
          userChat={userChat}
          replyMessage={replyMessage}
          conversation={conversation}
          setTurnOnMic={setTurnOnMic}
        />
      )}
      {openMap && (
        <ModalMap
          onClose={onClose}
          onSend={onSend}
          userChat={userChat}
          replyMessage={replyMessage}
          conversation={conversation}
        />
      )}
    </View>
  );
};

export default CustomInputToolbar;
