import React from 'react';
import { View, Text, Image, StyleSheet, Dimensions } from 'react-native';
import { RTCView, MediaStream } from 'react-native-webrtc';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { useSelector } from 'react-redux';
import { useSocket } from '../../../util/socket.io';

const { width, height } = Dimensions.get('window');

interface PreviewVideoCallProps {
  participants: any[];
  isCameraOn: boolean;
  localVideoRef: any; // Không cần thiết, có thể xóa
  remoteStreams: Map<string, MediaStream>;
  localStream: MediaStream | null;
}

const VideoCallPreview: React.FC<PreviewVideoCallProps> = ({
  participants,
  isCameraOn,
  localStream,
  remoteStreams,localVideoRef
}) => {
  const user = useSelector((state: any) => state.auth.value);
  const socket = useSocket();
  const [smallViewPosition, setSmallViewPosition] = React.useState({
    x: width - 120,
    y: 20,
  });

  // // Log khi component được render
  // React.useEffect(() => {
  //   console.log('🎥 [VideoCallPreview] Component mounted');
  //   console.log('🎥 [VideoCallPreview] Participants:', participants);
  //   console.log('🎥 [VideoCallPreview] Remote streams:', Array.from(remoteStreams.entries()));
  //   console.log('🎥 [VideoCallPreview] Local stream:', localStream?.id);
  //   console.log('🎥 [VideoCallPreview] Is camera on:', isCameraOn);
  //   console.log('🎥 [VideoCallPreview] Current user socket ID:', socket?.id);
  // }, []);

  const onGestureEvent = (event: any) => {
    const { translationX, translationY } = event.nativeEvent;
    setSmallViewPosition({
      x: Math.max(0, Math.min(width - 100, smallViewPosition.x + translationX)),
      y: Math.max(0, Math.min(height - 150, smallViewPosition.y + translationY)),
    });
  };

  const onHandlerStateChange = (event: any) => {
    if (event.nativeEvent.state === State.END) {
      console.log('👆 [VideoCallPreview] Small view position updated:', smallViewPosition);
    }
  };

  const renderMainView = () => {
    if (remoteStreams.size > 0) {
      // console.log('🎥 [VideoCallPreview] Rendering remote streams');
      return (
        <View style={styles.mainView}>
          {Array.from(remoteStreams.entries())
            .filter(([socketId]) => {
              const isLocal = socketId === socket?.id;
              // console.log(
              //   `🎥 [VideoCallPreview] Filtering remote stream - Socket ID: ${socketId}, Is local: ${isLocal}`
              // );
              return !isLocal;
            })
            .map(([socketId, stream]) => {
              const participant = participants.find(p => {
                const participantSocketId = Array.isArray(p.socketId)
                  ? p.socketId[0]
                  : p.socketId;
                return participantSocketId === socketId;
              });
              // console.log(
              //   `🎥 [VideoCallPreview] Rendering remote stream for ${socketId}, Participant:`,
              //   participant
              // );
              return (
                <View key={socketId} style={styles.remoteVideoContainer}>
                  <RTCView
                    key={socketId}
                    objectFit="cover"
                    mirror={false}
                    streamURL={stream.toURL()}
                    style={styles.fullScreen}
                  />
                  <Text style={styles.userName}>{participant?.name || socketId}</Text>
                </View>
              );
            })}
        </View>
      );
    } else {
      // console.log('🎥 [VideoCallPreview] No remote streams, rendering avatar');
      const remoteUser = participants.find(p => {
        const participantSocketId = Array.isArray(p.socketId) ? p.socketId[0] : p.socketId;
        const isLocal = participantSocketId === socket?.id;
        // console.log(
        //   `🎥 [VideoCallPreview] Finding remote user - Socket ID: ${participantSocketId}, Is local: ${isLocal}`
        // );
        return !isLocal;
      });

      if (!remoteUser) {
        // console.log('🎥 [VideoCallPreview] No remote user found');
        return (
          <View style={styles.mainView}>
            <View style={styles.avatarContainer}>
              <Text style={styles.userName}>Không có người tham gia</Text>
            </View>
          </View>
        );
      }

      // console.log('🎥 [VideoCallPreview] Rendering remote user avatar:', remoteUser);
      return (
        <View style={styles.mainView}>
          <View style={styles.avatarContainer}>
            <Image
              source={{ uri: remoteUser?.avatar || 'default_avatar_url' }}
              style={styles.avatarLarge}
              onError={() => console.log('🎥 [VideoCallPreview] Failed to load remote user avatar')}
            />
            <Text style={styles.userName}>{remoteUser?.name || 'Unknown'}</Text>
          </View>
        </View>
      );
    }
  };

  const renderSmallView = () => {
    return (
      <PanGestureHandler onGestureEvent={onGestureEvent} onHandlerStateChange={onHandlerStateChange}>
        <View style={[styles.smallView, { top: smallViewPosition.y, left: smallViewPosition.x }]}>
          {isCameraOn && localStream ? (
            <RTCView
              streamURL={localStream.toURL()}
              style={styles.smallScreen}
              mirror={true}
            />
          ) : (
            <View style={styles.avatarContainerSmall}>
              <Image
                source={{ uri: user?.avatar || 'default_avatar_url' }}
                style={styles.avatarSmall}
              />
              <Text style={styles.userNameSmall}>{user?.name || 'You'}</Text>
            </View>
          )}
        </View>
      </PanGestureHandler>
    );
  };

  return (
    <View style={styles.container}>
      {renderMainView()}
      {renderSmallView()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  mainView: {
    width: '100%',
    height: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  remoteVideoContainer: {
    flex: 1,
    position: 'relative',
    margin: 5,
    width: '45%',
    height: '45%',
  },
  fullScreen: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  smallView: {
    position: 'absolute',
    width: 100,
    height: 150,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 10,
    padding: 5,
  },
  smallScreen: {
    width: 90,
    height: 120,
    borderRadius: 5,
  },
  avatarContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#222',
    width: '100%',
    height: '100%',
    borderRadius: 10,
    padding: 10,
  },
  avatarContainerSmall: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 90,
    height: 120,
  },
  avatarLarge: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 10,
  },
  avatarSmall: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 5,
  },
  userName: {
    color: 'white',
    fontSize: 18,
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 5,
    borderRadius: 5,
  },
  userNameSmall: {
    color: 'white',
    fontSize: 12,
  },
});

export default VideoCallPreview;