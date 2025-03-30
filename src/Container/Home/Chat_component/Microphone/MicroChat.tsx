import React from "react";
import { Text, TouchableOpacity, View, StyleSheet } from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import Ionicons from "react-native-vector-icons/Ionicons";
import { formatTime } from "../../../../util/TimerLaft/formatTime";
import { useAudioRecorder } from "./useMicroChat";
import { Waveform, type IWaveformRef } from '@simform_solutions/react-native-audio-waveform';
import Conversation from "../../../../type/Home/Converstation_type";
import { Message_type } from "../../../../type/Home/Chat_type";
import userMessage from "../../../../type/Home/useMessage_type";

type MicroProps = {
  onSend: any;
  conversation: Conversation;
  replyMessage: Message_type;
  userChat: userMessage;
  setTurnOnMic: React.Dispatch<React.SetStateAction<boolean>>;
};

const MicroChat: React.FC<MicroProps> = ({
  onSend,
  conversation,
  replyMessage,
  userChat,
  setTurnOnMic,
}) => {
  const {
    sendAudioMessage,
    cancelRecording,
    stopRecording,
    duration,
    isRecording,
    ref,
  } = useAudioRecorder({
    onSend,
    conversation,
    replyMessage,
    userChat,
    setTurnOnMic,
  });

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          cancelRecording();
          setTurnOnMic(false);
        }}
      >
        <MaterialIcons name="delete" size={30} color={"#FF3B30"} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={stopRecording}>
        {isRecording ? (
          <Ionicons name="pause-circle-sharp" size={40} color={"#FF3B30"} />
        ) : (
          <Ionicons name="play-circle-sharp" size={40} color={"#34C759"} />
        )}
      </TouchableOpacity>
      <View style={styles.waveformContainer}>
        <Waveform
          containerStyle={styles.waveform}
          mode="live"
          ref={ref}
          waveColor={"#007AFF"}
        
          candleSpace={2}
          candleWidth={4}
           onRecorderStateChange={(recorderState) => console.log(recorderState,'recorderState')}
        />
        <Text style={styles.durationText}>{formatTime(duration)}</Text>
      </View>

      <TouchableOpacity style={styles.button} 
      onPress={()=>{
        console.log('gữi message')
        sendAudioMessage()
     
      }}>
        <MaterialIcons name="send" size={30} color={"#007AFF"} />
      </TouchableOpacity>
    </View>
  );
};

export default MicroChat;

// Styles
const styles = StyleSheet.create({
  container: {
    width: "90%",
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 25,
    padding: 5,
    gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position:'absolute',
    bottom:0,
  },
  button: {
    padding: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  waveformContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingHorizontal: 10,
    height: 40,
  },
  waveform: {
    flex: 1,
    height: 40,
    borderRadius: 8,
  },
  durationText: {
    marginLeft: 10,
    fontSize: 16,
    color: "#000",
    fontWeight: "500",
  },
});