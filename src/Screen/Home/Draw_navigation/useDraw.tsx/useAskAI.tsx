import { useState } from 'react';
import { useWindowDimensions } from 'react-native';
import { useSelector } from 'react-redux';
import { GEMINI_KEY } from '@env';
import axios from 'axios';
const UseAskAI = () => {
  const [messages, setMessages] = useState<{id:string, text: string; sender: string }[]>([]);
  const[loading,setLoading]=useState(false)
  const user = useSelector((state: any) => state.auth.value);
  const { width, height } = useWindowDimensions();
  const [inputText, setInputText] = useState('');
  const [inputHeight, setInputHeight] = useState(40); // Chiều cao ban đầu của TextInput
  const handleSend = async () => {
     setLoading(true)
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`;

    if (inputText.trim() === '') return;
    const textsend=inputText
    const userMessage = { id: new Date().toISOString(), text: inputText, sender: "user" };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInputText('');
    setInputHeight(40)
    try {
      const response = await axios.post(
        API_URL,
        {
          contents: [{ parts: [{ text: textsend }] }],
        },
        {
          headers: { 'Content-Type': 'application/json' },
        },
      );

      const aiResponse = response.data.candidates[0]?.content?.parts[0]?.text || "Không có phản hồi từ AI.";
      const botMessage = { id: new Date().toISOString(), text: aiResponse, sender: "bot" };

      setMessages(prevMessages => [...prevMessages, botMessage]);
    } catch (error) {
      console.log(error,'lỗi gữi yêu cầu AI')
    }finally{
      setLoading(false)
    }
  };
  const handleContentSizeChange = (event: {
    nativeEvent: { contentSize: { height: any } };
  }) => {
    if (event && event.nativeEvent && event.nativeEvent.contentSize) {
      const newHeight = event.nativeEvent.contentSize.height;
      setInputHeight(Math.min(100, newHeight)); // Giới hạn chiều cao tối đa là 100
    } else {
      console.warn('Invalid event structure:', event);
    }
  };

  return {
    messages,
    inputText,
    setInputText,
    handleSend,
    inputHeight,
    user,
    handleContentSizeChange,loading
  };
};
export default UseAskAI;
