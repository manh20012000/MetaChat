import RNFS from 'react-native-fs';
import Conversation from '../../../../../types/home_type/Converstation_type';
import { Message_type } from '../../../../../types/home_type/Chat_type';
import userMessage from '../../../../../types/home_type/useMessage_type';
import {useEffect, useRef, useState} from 'react';
import {
  FinishMode,
  IWaveformRef,
  UpdateFrequency,
  Waveform,
} from '@simform_solutions/react-native-audio-waveform';
import {BSON} from 'realm';

type MicroProps = {
  onSend: any;
  conversation: Conversation;
  replyMessage: Message_type;
  userChat: userMessage;
  setTurnOnMic: React.Dispatch<React.SetStateAction<boolean>>;
};
export const useAudioRecorder = ({
  onSend,
  conversation,
  replyMessage,
  userChat,
  setTurnOnMic,
}: MicroProps) => {
  const ref = useRef<IWaveformRef>(null);
  const [recordingPath, setRecordingPath] = useState<string|null>(null);
  const [duration, setDuration] = useState<number>(0);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
// console.log(onSend)
  const startTimer = () => {
    intervalRef.current = setInterval(() => {
      setDuration(prev => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const startRecording = async () => {
    setIsRecording(true);
    startTimer();
      await ref.current?.startRecord({
      encoder:121,
    sampleRate: 112,
    bitRate: 1,
    useLegacy: true,
    updateFrequency: UpdateFrequency.low || undefined,   
    });
  };
 
  const stopRecording = async () => {
    if (isRecording) {
      setIsRecording(false);
      stopTimer();
      const result = await ref.current?.stopRecord();
      if (result ) {
      
        setRecordingPath(result); // Lưu dữ liệu âm thanh thô hoặc base64
      }
    } else if(!isRecording){
      setIsRecording(true);
      startTimer();
   await ref.current?.startRecord();
    }
  };

  const cancelRecording = async () => {
    stopTimer();
    await ref.current?.stopRecord();
    setRecordingPath('');
    setTurnOnMic(false);
  };

  const playRecording = async () => {
    if (isPlaying) {
      await ref.current?.pausePlayer();
      setIsPlaying(false);
    } else {
      await ref.current?.startPlayer({finishMode: FinishMode.stop});
      setIsPlaying(true);
    }
  };

  const sendAudioMessage = async () => {
    const result = await ref.current?.stopRecord();
    try{
      
      if (result) {
        let filesOrder = [
             {
              index:0,
              type: 'audio/mp3',
          }];
          const attachment = {
            url: `file://${result}`,
            name: `audio_${Date.now()}.mp3`, 
            type: "audio/mp3", 
          };
        const message = {
          _id: new BSON.ObjectId().toString(),
          conversation_id: conversation._id,
          user: userChat,
          messageType: 'audio',
          text: null,
          attachments: [attachment],
          callDetails: null,
          createdAt:new Date().toISOString(),
          reactions: [],
          receiver: conversation.participantIds,
   
          replyTo:
            replyMessage === null
              ? null
              : {
                  _id: replyMessage._id,
                  text:
                    replyMessage.messageType === 'text'
                      ? replyMessage.text
                      : 'reply atatment',
                  user: replyMessage.user,
                  messageType: replyMessage.messageType,
                },
          recall: false,
        };
   
       onSend(message, filesOrder, true)
      }
     }catch(err){
        console.log(err,'lỗi gữi file ghi âm')
     }finally{
        setRecordingPath(''); 
        setDuration(0); 
        setIsRecording(false); 
        setTurnOnMic(false); 
     }
     
    }
  

  useEffect(() => {
    startRecording();
    return () => {
      cancelRecording();
      stopRecording();
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return {
    startRecording,
    stopRecording,
    cancelRecording,
    playRecording,
    duration,
    isRecording,
    isPlaying,
    ref,
    sendAudioMessage,
  };
};
