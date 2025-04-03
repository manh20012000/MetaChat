// VideoCallHome.tsx
import {
  View,
  Text,
  StatusBar,
  useWindowDimensions,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import React, {useState} from 'react';
import Statusbar from '../../../Constants/StatusBar';
import {useSelector} from 'react-redux';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import VideoCallPreview from './VideoCallPreview';
import {RouteProp} from '@react-navigation/native';
import userVideoCallHome from './useVideocall/useVideoCallHome';
import DraggableVideoView from './DraggableVideoView';
import ActionButton from './ActionButton';

interface VideoCallHomeProps {
  navigation: any;
  route: any;
}

const VideoCallHome: React.FC<VideoCallHomeProps> = ({navigation, route}) => {
  const {width, height} = useWindowDimensions();
  const color = useSelector((value: any) => value.colorApp.value);

  const { roomId, user, isIncoming}=route.params
  const [myStream, setMyStream] = useState(null); // Thay bằng stream của bạn
  const {
    isMuted,
    isSpeakerOn,
    isVideoOn,
    isFrontCamera,
    toggleMute,
    toggleSpeaker,
    toggleVideo,
    switchCamera,
    endCall
  } = userVideoCallHome(navigation,route);
  return (
    <View style={styles.container}>
      {/* Header with close button */}
      <View style={[styles.header, {width}]}>
        <TouchableOpacity style={styles.closeButton} onPress={endCall}>
          <MaterialIcons name="cancel" size={30} color={color.red} />
        </TouchableOpacity>
      </View>
     
        <View style={styles.previewContainer}>
          <VideoCallPreview
           participants={[]}
           myStream={myStream}
            // // navigation={navigation}
            // route={route}
            // isVideoOn={isVideoOn}
            // isFrontCamera={isFrontCamera}
          />
        </View>
        <ActionButton
        isMuted={isMuted}
        isSpeakerOn={isSpeakerOn}
        isVideoOn={isVideoOn}
        isFrontCamera={isFrontCamera}
        toggleMute={toggleMute}
        toggleSpeaker={toggleSpeaker}
        toggleVideo={toggleVideo}
        switchCamera={switchCamera}
        endCall={endCall}
      />
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

export default VideoCallHome;
