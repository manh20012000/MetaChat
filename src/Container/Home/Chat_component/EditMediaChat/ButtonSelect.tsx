import React, {useEffect} from 'react';
import {Text, View, TouchableOpacity, Alert} from 'react-native';
import Reanimated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import UseButtonMessage from './userButtonSelectMessage';
import userMessage from '../../../../type/Home/useMessage_type';
import Conversation from '../../../../type/Home/Converstation_type';

const AnimatedTouchable = Reanimated.createAnimatedComponent(TouchableOpacity);

type BtnSelectProps = {
  selected: any[];
  onSend: any;
  setSelectedItemsMedia: React.Dispatch<React.SetStateAction<any[]>>;
  userChat: userMessage;
  conversation: Conversation;
  handleSheetChanges:(index:number)=>void
};

const ButtonSelection: React.FC<BtnSelectProps> = ({
  selected,
  onSend,
  userChat,
  conversation,setSelectedItemsMedia,
  handleSheetChanges
}) => {
  const isExpanded = selected.length >= 2;

  // Giá trị width của button GỬI
  const sendWidth = useSharedValue(isExpanded ? 0.8 : 0.4);

  useEffect(() => {
    sendWidth.value = withSpring(isExpanded ? 1 : 0.4, {
      damping: 10,
      stiffness: 100,
    });
  }, [selected.length]);

  // Style động cho button GỬI
  const sendButtonStyle = useAnimatedStyle(() => ({
    flex: sendWidth.value,
  }));

  const { hanlderMessSend } = UseButtonMessage({
    selected,
    onSend,
    userChat,
    conversation,
    setSelectedItemsMedia,
    handleSheetChanges,
  }
  );
  return (
    <View
      style={{
        position: 'absolute',
        width: '100%',
        zIndex: 1,
        height: 60,
        bottom: 30,
        alignItems: 'center',
        alignSelf: 'center',
      }}>
      <View
        style={{
          width: '90%',
          flexDirection: 'row',
          justifyContent: 'space-around',
        }}>
        {selected.length < 2 && (
          <AnimatedTouchable
          onPress={()=>{
            Alert.alert("warning",'tính năng này đang được phát triển',[
              {
                text: 'Cancel',
                onPress: () => handleSheetChanges(-1),
                style: 'cancel',
              },
              {text: 'OK',  onPress: () => handleSheetChanges(-1),},
            ])
          }}
            style={{
              flex: 0.4,
              backgroundColor: 'pink',
              padding: 15,
              borderRadius: 10,
            }}>
            <Text
              style={{textAlign: 'center', color: 'white', fontWeight: 'bold'}}>
              Chỉnh sửa
            </Text>
          </AnimatedTouchable>
        )}

        {/* Button GỬI sẽ mở rộng khi có nhiều item */}
        <AnimatedTouchable
        onPress={hanlderMessSend}
          style={[
            sendButtonStyle,
            {backgroundColor: 'blue', padding: 15, borderRadius: 10},
          ]}>
          <Text
            style={{textAlign: 'center', color: 'white', fontWeight: 'bold'}}>
            Gửi
          </Text>
        </AnimatedTouchable>
      </View>
    </View>
  );
};

export default ButtonSelection;
