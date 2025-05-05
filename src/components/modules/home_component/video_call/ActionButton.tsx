import React from 'react';
import { View, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import userActionButton from './use_video_call/useActionButton';
interface ActionButtonProps {
  localStream: MediaStream | null;
  statusCamera: boolean;
  setStatusCamera: React.Dispatch<React.SetStateAction<boolean>>;
  isMicOn: boolean;
  setIsMicOn: React.Dispatch<React.SetStateAction<boolean>>;
  isSpeakerOn: boolean;
  setIsSpeakerOn: React.Dispatch<React.SetStateAction<boolean>>;
  endCall: () => void;
  SetLocalStream: React.Dispatch<React.SetStateAction<MediaStream | null>>;
}

const ActionButton: React.FC<ActionButtonProps> = ({
  localStream,
  statusCamera,
  setStatusCamera,
  isMicOn,
  setIsMicOn,
  isSpeakerOn,
  setIsSpeakerOn,
  endCall,
  SetLocalStream
}) => {
  const { width } = Dimensions.get('window');
  const { handleToggleMute, handleToggleSpeaker, toggleVideo, switchCamera } =
    userActionButton(localStream as any, statusCamera, isMicOn,
      isSpeakerOn, setIsMicOn, setIsSpeakerOn, setStatusCamera, SetLocalStream as any);


  return (
    <View style={[styles.controlsContainer, { width }]}>
      <TouchableOpacity style={styles.controlButton} onPress={handleToggleMute}>
        <MaterialIcons
          name={isMicOn ? 'mic' : 'mic-off'}
          size={30}
          color={isMicOn ? 'white' : 'red'}
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.controlButton}
        onPress={handleToggleSpeaker}>
        <MaterialIcons
          name={isSpeakerOn ? 'volume-up' : 'volume-off'}
          size={30}
          color={isSpeakerOn ? 'white' : 'red'}
        />
      </TouchableOpacity>

      <TouchableOpacity style={styles.controlButton} onPress={toggleVideo}>
        <MaterialIcons
          name={statusCamera ? 'videocam' : 'videocam-off'}
          size={30}
          color={statusCamera ? 'white' : 'red'}
        />
      </TouchableOpacity>

      <TouchableOpacity style={styles.controlButton} onPress={switchCamera}>
        <MaterialIcons name="flip-camera-android" size={30} color="white" />
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.controlButton, { backgroundColor: 'red' }]}
        onPress={endCall}>
        <MaterialIcons name="call-end" size={30} color="white" />
      </TouchableOpacity>
    </View>
  );
};

export default ActionButton;

const styles = StyleSheet.create({
  controlsContainer: {
    position: 'absolute',
    bottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  controlButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
