import React, {useState} from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  useWindowDimensions,
  Animated,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {InputToolbar} from 'react-native-gifted-chat';
import {useSelector} from 'react-redux';
import {Send} from '../../../assets/svg/svgfile';

const CustomInputToolbar = (props: any) => {
   const {onSend} = props;
  const {width} = useWindowDimensions();
  const color = useSelector(
    (value: {colorApp: {value: any}}) => value.colorApp.value,
  );

  const [isVisible, setVisible] = useState(true);
  const [isShowSendText, setIsShowSendText] = useState(true);
  const [changeIcon, setChangeIcon] = useState(true);
  const [textContent, setTextContent] = useState('');
  const [inputHeight, setInputHeight] = useState(30);

const handleSend = () => {
  if (textContent.trim() !== '') {
    onSend({text: textContent.trim()}); // Gửi text về hàm onSend
    setTextContent(''); // Reset text input sau khi gửi
    setChangeIcon(true);
  }
};
  return (
    
        <View
          style={{
            width: width,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-around',
            position: 'absolute',
            bottom: 0,
            padding: 10,
            backgroundColor: color.black,
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
              value={textContent}
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
                setTextContent(value);
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
              <Text style={{fontSize: 25}}>😁</Text>
            </TouchableOpacity>
          ) : (
           <TouchableOpacity onPress={handleSend}>
              <Send />
            </TouchableOpacity>
          )}
        </View>
  );
};

export default CustomInputToolbar;
