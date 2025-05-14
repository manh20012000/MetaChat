import React, { useState, useEffect } from 'react';
import {
  TouchableOpacity,
  useWindowDimensions,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { Text, View, TextInput } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import UseAskAI from './useDraw.tsx/useAskAI';
import MessageItemAI from './components/MessageItem';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const AskToAI = () => {
  const navigation = useNavigation();
  const {
    color,
    messages,
    inputText,
    setInputText,
    handleSend,
    inputHeight,
    loading,
    handleContentSizeChange,
  } = UseAskAI();
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: color.gray, paddingTop: insets.top }}>
      <StatusBar
        translucent={true}
        barStyle={color.dark ? 'dark-content' : 'light-content'}
        backgroundColor={'transparent'}
      />
      <View style={{ flexDirection: 'row', width: '100%', padding: 10, alignItems: 'center', }}>
        <TouchableOpacity>
          <Ionicons
            name="arrow-back"
            size={24}
            color={color.dark ? '#000' : '#fff'}
            onPress={() => navigation.goBack()}
            style={{ padding: 10 }}
          />
        </TouchableOpacity>
        <View>
          <Text style={{ color: color.dark ? '#000' : '#fff', fontSize: 20, fontWeight: 'bold' }}>
            Chat với AI
          </Text>
        </View>

      </View>
      <View style={{ flex: 1 }}>
        <FlashList
          data={messages}
          keyExtractor={(item: any) => item.id.toString()}
          renderItem={({ item }) => <MessageItemAI message={item} />}
          estimatedItemSize={100} // Thêm dòng này
          contentContainerStyle={{ paddingVertical: 10 }}
        />
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          multiline={true}
          style={[styles.input, { height: inputHeight }]}
          placeholder="Nhập câu hỏi..."
          value={inputText}
          onChangeText={setInputText}
          // onSubmitEditing={handleSend}
          onContentSizeChange={handleContentSizeChange}
        />
        {loading ? <ActivityIndicator size="large" color="#0000ff" /> : (
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
