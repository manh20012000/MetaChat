import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  useWindowDimensions,
  Animated,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { InputToolbar } from 'react-native-gifted-chat';
import { useSelector } from 'react-redux';
import { Send } from '../../../assets/svg/svgfile';
import Conversation from '../../../type/Converstation_type';
import { BSON } from 'bson';

const CustomInputToolbar = (props: any) => {
  const { onSend, userChat, replyMessage, setReplyMessage } = props;
  const { width, height } = useWindowDimensions();
  const color = useSelector(
    (value: { colorApp: { value: any } }) => value.colorApp.value,
  );

  const conversation: Conversation = props.conversation;
  const [isShowSendText, setIsShowSendText] = useState(true);
  const [changeIcon, setChangeIcon] = useState(true);
  const [text, settext] = useState('');
  const [inputHeight, setInputHeight] = useState(30);
  const newdate = new Date().toISOString();

  const handMessage = () => {
    return {
      _id: new BSON.ObjectId().toString(),
      conversation_id: conversation._id,
      user: userChat,
      messageType: 'text',
      text: text,
      voice: '',
      attachments: [],
      callDetails:null,
      createdAt: newdate,
      reactions: [],
      reciver: conversation.participantIds,
      isRead: [],
      replyTo: replyMessage === null ? null : {
        _id:replyMessage._id,
        text: replyMessage.messageType === "text" ? replyMessage.text : "reply atatment",
        user: replyMessage.user,
        messageType:replyMessage.messageType,
      },
    };
  };

  const handleSend = () => {
    if (text.trim() !== '') {
      onSend(handMessage(), []); // Gửi text về hàm onSend
      settext(''); // Reset text input sau khi gửi
      setChangeIcon(true);
      setReplyMessage(null)
    }
  };

  return (
    <>
      {replyMessage && (
        <View
          style={{
            width: width,
            marginBottom: 70,
            alignContent: "center",
            paddingHorizontal: 10,
            borderTopWidth: 2,
            borderTopColor: 'gray',
            justifyContent: "center",
            alignSelf: 'center',
          }}
        >
          <Text style={{ color: "white", fontWeight: "bold" }}>Replying to {replyMessage.user !== userChat.user_id?'youself':replyMessage.user.name}</Text>
          <Text style={{ color: "white", width:width-50,fontSize:18 }}
            numberOfLines={1}
            ellipsizeMode="tail" >{replyMessage.messageType==="text"?replyMessage.text:"reply atatment"}</Text>
          <TouchableOpacity
            onPress={() => setReplyMessage(null)}
            style={{
              borderWidth: 2,
              borderRadius: 100,
              height: 30,
              width: 30,
              position: "absolute",
              right: 10,
              alignSelf: 'center',
              justifyContent: 'center',

            }}>
            <Text
              style={{
                color: 'white',
                fontWeight: 'bold',
                fontSize: 25,
                textAlign: 'center'
              }}>
              x
            </Text>
          </TouchableOpacity>
        </View>
      )}
      <View
        style={{
          width: width,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-around',
          position: 'absolute',
          bottom: 0,
          backgroundColor: color.black,
          paddingVertical:10

        }}>

        {changeIcon ? (
          <View
            style={{
              flexDirection: 'row',
              columnGap: 10,
              alignItems: 'center',
            }}>
            <TouchableOpacity>
              <MaterialCommunityIcons
                name="microphone"
                color={color.blue}
                size={30}
              />
            </TouchableOpacity>
            <TouchableOpacity>
              <MaterialCommunityIcons
                name="image"
                color={color.blue}
                size={30}
              />
            </TouchableOpacity>
            <TouchableOpacity>
              <MaterialCommunityIcons
                name="sticker-emoji"
                color={color.blue}
                size={30}
              />
            </TouchableOpacity>
            <TouchableOpacity>
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
            <Text style={{ fontSize: 25 }}>{conversation?.icon}</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={handleSend}>
            <Send />
          </TouchableOpacity>
        )}
      </View>
    </>
  );
};

export default CustomInputToolbar;
