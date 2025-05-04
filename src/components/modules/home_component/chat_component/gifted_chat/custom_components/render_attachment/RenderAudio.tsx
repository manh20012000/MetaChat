import React, { useEffect, useRef, useState } from 'react';
import { Text, View, TouchableOpacity, StyleSheet, useWindowDimensions, Pressable } from 'react-native';
import { Message_type } from '../../../../../../../types/home_type/Chat_type'
import {
  FinishMode,
  Waveform,
  type IWaveformRef,
} from '@simform_solutions/react-native-audio-waveform';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import { formatTime } from '../../../../../../../utils/time_app/formatTime';
const audioRecorderPlayer = new AudioRecorderPlayer();
type PreviewMediaProps = {
  isMyMessage: boolean;
  currentMessage: Message_type;
  getPosition: () => void;
};

const AudioMessage: React.FC<PreviewMediaProps> = ({
  isMyMessage,
  currentMessage,
  getPosition,
}) => {
  const waveformRef = useRef<IWaveformRef>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const fileAudio = currentMessage.attachments[0]?.url;
  const { width, height } = useWindowDimensions()
  const handlePlayPause = async () => {
    if (isPlaying) {
      setIsPlaying(false);
      await waveformRef.current?.pausePlayer();
    } else {
      setIsPlaying(true);
      await waveformRef.current?.startPlayer({

        finishMode: FinishMode.stop
      });
    }

  };
  // useEffect(() => {
  //   const getAudioDuration = async () => {
  //     if (fileAudio) {
  //       try {
  //         const duration = await audioRecorderPlayer.startPlayer(fileAudio  );
  //         // setDuration(duration / 1000);
  //         await audioRecorderPlayer.stopPlayer();
  //       } catch (error) {
  //         console.log('❌ Lỗi khi lấy thời gian audio:', error);
  //       }
  //     }
  //   };
  //   getAudioDuration();
  // }, [fileAudio]);

  return (
    <Pressable
      delayLongPress={200}
      onLongPress={getPosition}
      style={[
        styles.container,
        isMyMessage ? styles.myMessage : styles.otherMessage,
        { width: width * 0.7, height: 40 }
      ]}>
      <TouchableOpacity onPress={handlePlayPause} style={styles.playButton}>
        <Ionicons
          name={isPlaying ? 'pause' : 'play'}
          size={24}
          color={isMyMessage ? '#FFFFFF' : '#000000'}
        />
      </TouchableOpacity>
      <Waveform
        ref={waveformRef}
        mode="static"
        waveColor={isMyMessage ? '#FFFFFF' : '#000000'}
        scrubColor={isMyMessage ? '#FFA500' : '#FFA500'}
        candleSpace={1}
        candleWidth={4}
        path={fileAudio || ""}
        onPlayerStateChange={playerState => console.log(playerState, 'opop')}
        onPanStateChange={isMoving => console.log(isMoving, 'mm')}

      />
      <Text
        style={[styles.duration, { color: isMyMessage ? '#FFFFFF' : '#000000' }]}>
        {formatTime(duration)}
      </Text>
    </Pressable>
  );
};

export default AudioMessage;

// Styles
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 5,
    borderRadius: 10,
    backgroundColor: 'pink',
    justifyContent: 'space-between',

  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#007AFF', // Màu nền cho tin nhắn của bạn
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#E5E5EA', // Màu nền cho tin nhắn người khác
  },
  playButton: {
    marginHorizontal: 10,
  },
  duration: {
    fontSize: 14,
  },
});
