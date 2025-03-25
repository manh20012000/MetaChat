import React, {useState, useEffect} from 'react';
import {
  TouchableOpacity,
  useWindowDimensions,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import {Text, View, TextInput} from 'react-native';
import {FlashList} from '@shopify/flash-list';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useNavigation} from '@react-navigation/native';
import UseAskAI from './useDraw.tsx/useAskAI';
import MessageItemAI from './components/MessageItem';

const AskToAI = () => {
  const navigation = useNavigation();
  const {
    messages,
    inputText,
    setInputText,
    handleSend,
    inputHeight,
    loading,
    handleContentSizeChange,
  } = UseAskAI();

  return (
    <View style={{flex: 1, backgroundColor: '#f5f5f5'}}>
      <View style={{flex: 1}}>
        <FlashList
          data={messages}
          keyExtractor={(item: any) => item.id.toString()}
          renderItem={({item}) => <MessageItemAI message={item} />}
          estimatedItemSize={100} // Thêm dòng này
          contentContainerStyle={{paddingVertical: 10}}
        />
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          multiline={true}
          style={[styles.input, {height: inputHeight}]}
          placeholder="Nhập câu hỏi..."
          value={inputText}
          onChangeText={setInputText}
          // onSubmitEditing={handleSend}
          onContentSizeChange={handleContentSizeChange}
        />
        {loading? <ActivityIndicator size="small" color="#0000ff" />: (
          <TouchableOpacity onPress={handleSend} style={styles.sendButton}>
            <Ionicons name="send" size={24} color="#007AFF" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  input: {
    flex: 1,
    backgroundColor: 'gray',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
  },
  sendButton: {
    padding: 10,
  },
});

export default AskToAI;
