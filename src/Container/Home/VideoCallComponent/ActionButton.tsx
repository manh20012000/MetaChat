// VideoCallHome.tsx
import {
    View,
    Text,
    StatusBar,
    useWindowDimensions,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
  } from 'react-native';
  import React, {useState} from 'react';
  import Statusbar from '../../../Constants/StatusBar';
  import {useSelector} from 'react-redux';
  import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
  import VideoCallPreview from './VideoCallPreview';
  import {RouteProp} from '@react-navigation/native';
  import userVideoCallHome from './useVideocall/useVideoCallHome';
  import DraggableVideoView from './DraggableVideoView';
  
  interface ActionButtonProps {
    isMuted: boolean;
    isSpeakerOn: boolean;
    isVideoOn: boolean;
    isFrontCamera: boolean;
    toggleMute: () => void;
    toggleSpeaker: () => void;
    toggleVideo: () => void;
    switchCamera: () => void;
    endCall: () => void;
    showAcceptButton?: boolean; // Thêm prop này cho màn hình gọi đến
    onAcceptCall?: () => void; // Callback khi nhấn nút nhận cuộc gọi
  }
  
  const ActionButton: React.FC<ActionButtonProps> = ({
    isMuted,
    isSpeakerOn,
    isVideoOn,
    isFrontCamera,
    toggleMute,
    toggleSpeaker,
    toggleVideo,
    switchCamera,
    endCall,
    showAcceptButton = false,
    onAcceptCall
  }) => {
    const { width } = Dimensions.get('window');
  
    return (
      <View style={styles.container}>
        <View style={[styles.controlsContainer, {width}]}>
          <TouchableOpacity style={styles.controlButton} onPress={toggleMute}>
            <MaterialIcons
              name={isMuted ? 'mic-off' : 'mic'}
              size={30}
              color={isMuted ? 'red' : 'white'}
            />
          </TouchableOpacity>
  
          <TouchableOpacity style={styles.controlButton} onPress={toggleSpeaker}>
            <MaterialIcons
              name={isSpeakerOn ? 'volume-up' : 'volume-off'}
              size={30}
              color={isSpeakerOn ? 'white' : 'red'}
            />
          </TouchableOpacity>
  
          <TouchableOpacity style={styles.controlButton} onPress={toggleVideo}>
            <MaterialIcons
              name={isVideoOn ? 'videocam' : 'videocam-off'}
              size={30}
              color={isVideoOn ? 'white' : 'red'}
            />
          </TouchableOpacity>
  
          <TouchableOpacity style={styles.controlButton} onPress={switchCamera}>
            <MaterialIcons name="flip-camera-android" size={30} color="white" />
          </TouchableOpacity>
  
          <TouchableOpacity
            style={[styles.controlButton, {backgroundColor: 'red'}]}
            onPress={endCall}>
            <MaterialIcons name="call-end" size={30} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    header: {
      position: 'absolute',
      zIndex: 10,
      paddingHorizontal: 10,
      alignItems: 'flex-end',
    },
    closeButton: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: 'rgba(255,255,255,0.2)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    previewContainer: {
      flex: 1,
      backgroundColor:'pink'
    },
    controlsContainer: {
      position: 'absolute',
      bottom: 30,
      flexDirection: 'row',
      justifyContent: 'space-around',
      paddingHorizontal: 20,
    },
    controlButton: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: 'rgba(255,255,255,0.2)',
      justifyContent: 'center',
      alignItems: 'center',
    }, videoPlaceholder: { flex: 1, backgroundColor: 'black' },
  });
  
  export default ActionButton;
  