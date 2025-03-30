import React, {useCallback, useEffect, useMemo, useState} from 'react';
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
import {InputToolbar} from 'react-native-gifted-chat';
import {useSelector} from 'react-redux';
import {Send} from '../../../assets/svg/svgfile';
import Conversation from '../../../type/Home/Converstation_type';
import {BSON} from 'bson';
import PermissionCamera from '../../../util/Permision/CameraChatPermission';
import userMessage from '../../../type/Home/useMessage_type';
import {Message_type} from '../../../type/Home/Chat_type';
import {NavigationProp, useNavigation} from '@react-navigation/native';
import {RootStackParamList} from '../../../type/rootStackScreen';
import {eventEmitter} from '../../../eventEmitter/EventEmitter';
import useRenderInput from './ViewRender/hook/usr-renderInput';
import MicroChat from '../../../Container/Home/Chat_component/Microphone/MicroChat';
import MicrophonePermission from '../../../util/Permision/MicrophonePermision';
import ModalMap from '../../../Container/Home/Chat_component/Mapshare/ShareMap';
import MapLocaltedPermission from '../../../util/Permision/MapPermission';
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
  const {width, height} = useWindowDimensions();
  const deviceInfo = useSelector(
    (value: {deviceInfor: {value: any}}) => value.deviceInfor.value,
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
    (value: {colorApp: {value: any}}) => value.colorApp.value,
  );
  const [turnOnMic, setTurnOnMic] = useState<boolean>(false);

  const {
    handlePress,
    text,
    settext,
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
    <>
      {replyMessage && (
        <View
          style={{
            width: width,
            marginBottom: 70,
            alignContent: 'center',
            paddingHorizontal: 10,
            borderTopWidth: 2,
            borderTopColor: 'gray',
            justifyContent: 'center',
            alignSelf: 'center',
          }}>
          <Text style={{color: 'white', fontWeight: 'bold'}}>
            Replying to{' '}
            {replyMessage.user !== userChat.user_id
              ? 'youself'
              : replyMessage.user.name}
          </Text>
          <Text
            style={{color: 'white', width: width - 50, fontSize: 18}}
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
            <Text
              style={{
                color: 'white',
                fontWeight: 'bold',
                fontSize: 25,
                textAlign: 'center',
              }}>
              x
            </Text>
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
            position: 'absolute',
            bottom: 0,
            paddingVertical: 10,
            zIndex: 1,
          }}>
          {changeIcon ? (
            <View
              style={{
                flexDirection: 'row',
                columnGap: 10,
                alignItems: 'center',
              }}>
              <TouchableOpacity
                onPress={async() => {
                  console.log(await MapLocaltedPermission())
                  if(await MapLocaltedPermission()){
                    onClose()
                  }else{
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
                onchangeTyping()
                if (value !== '') {
                  setChangeIcon(false);
                  setIsShowSendText(false);
                } else {
                  setChangeIcon(true);
                  setIsShowSendText(true);
                }
                settext(value);
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
              <Text style={{fontSize: 25}}>{conversation?.icon}</Text>
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
    </>
  );
};

export default CustomInputToolbar;
