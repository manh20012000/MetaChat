import React from 'react';
import { View, Text, Image, StyleSheet, Dimensions, StatusBar, ImageBackground } from 'react-native';
import { RTCView, MediaStream } from 'react-native-webrtc';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { useSelector } from 'react-redux';
import { useSocket } from '../../../../provinders/socket.io';
import { TUser } from '../../../../types/home_type/Converstation_type';

const { width, height } = Dimensions.get('window');

interface PreviewVideoCallProps {
  participanteds: any[];
  isCameraOn: boolean;
  remoteStreams: { [userId: string]: MediaStream };
  localStream: MediaStream | null;
  localVideoRef: any;
  converstationVideocall: any;
  caller: TUser;
}

const VideoCallPreview: React.FC<PreviewVideoCallProps> = ({
  participanteds,
  isCameraOn,
  localStream,
  remoteStreams,
  converstationVideocall,
  caller,
}) => {
  const user = useSelector((state: any) => state.auth.value);
  const color = useSelector((value: any) => value.colorApp.value);
  const socket = useSocket();
  const [smallViewPosition, setSmallViewPosition] = React.useState({
    x: width - 120,
    y: 20,
  });
  const { roomName, avatar, participants, background } = converstationVideocall;

  // Lọc participant, loại bỏ user hiện tại
  const participant = participants.filter((item: TUser) => item.user_id !== user._id);
  const overlayColor = background ? `${background}80` : 'rgba(0, 0, 0, 0.5)';

  const onGestureEvent = (event: any) => {
    const { translationX, translationY } = event.nativeEvent;
    setSmallViewPosition(prev => ({
      x: Math.max(0, Math.min(width - 100, prev.x + translationX)),
      y: Math.max(0, Math.min(height - 150, prev.y + translationY)),
    }));
  };

  const onHandlerStateChange = (event: any) => {
    if (event.nativeEvent.state === State.END) {
      // Có thể lưu vị trí nếu cần
    }
  };

  const renderMainView = () => {
    // Lấy danh sách remoteStreams, loại bỏ stream của user hiện tại
    const remoteEntries = Object.entries(remoteStreams).filter(([userId]) => userId !== user._id);

    // Nếu có remoteStreams, hiển thị video
    if (remoteEntries.length > 0) {
      return (
        <View style={styles.mainView}>
          {remoteEntries.map(([userId, stream]) => {
            const participant = participanteds.find(p => p.user_id === userId);
            return (
              <View key={userId} style={styles.remoteVideoContainer}>
                <RTCView
                  objectFit="cover"
                  mirror={false}
                  streamURL={stream.toURL()}
                  style={styles.fullScreen}
                />
                <Text style={styles.userName}>{participant?.name ?? userId}</Text>
              </View>
            );
          })}
        </View>
      );
    }

    // Nếu camera tắt và không có remoteStreams, hiển thị giống IncommingVideoCall
    if (!isCameraOn) {
      return (
        <View style={styles.contentContainer}>
          {roomName ? (
            <View style={styles.roomContainer}>
              {avatar && (
                <Image
                  source={{ uri: avatar }}
                  style={styles.roomAvatar}
                />
              )}
              <Text style={styles.roomName}>{roomName}</Text>
            </View>
          ) : participant.length === 1 ? (
            <View style={styles.singleParticipantContainer}>
              <Image
                source={{ uri: participant[0].avatar || 'https://via.placeholder.com/150' }}
                style={styles.singleAvatar}
              />
              <Text style={styles.singleName}>{participant[0].name || participant[0].user_id}</Text>
            </View>
          ) : (
            <View style={styles.multiParticipantContainer}>
              {/* Hàng avatar */}
              <View style={styles.avatarRow}>
                {participant.slice(0, 4).map((p: TUser) => (
                  <Image
                    key={p.user_id}
                    source={{ uri: p.avatar || 'https://via.placeholder.com/100' }}
                    style={styles.multiAvatar}
                  />
                ))}
              </View>
              {/* Hàng tên */}
              <View style={styles.nameRow}>
                {participant.slice(0, 4).map((p: TUser) => (
                  <Text
                    key={p.user_id}
                    style={styles.multiName}
                    numberOfLines={1}
                  >
                    {p.name || p.user_id}
                  </Text>
                ))}
              </View>
            </View>
          )}
        </View>
      );
    }

    // Nếu camera bật nhưng không có remoteStreams, hiển thị avatar participant
    const remoteUser = participanteds.find(p => p.user_id !== user._id);

    return (
      <View style={styles.mainView}>
        <View style={styles.avatarContainer}>
          {remoteUser?.avatar ? (
            <Image
              source={{ uri: remoteUser.avatar }}
              style={styles.avatarLarge}
              onError={() => console.log('❌ Failed to load avatar')}
            />
          ) : (
            <Image
              source={{ uri: 'https://via.placeholder.com/150' }}
              style={styles.avatarLarge}
            />
          )}
          <Text style={styles.userName}>{remoteUser?.name ?? 'Không có người tham gia'}</Text>
        </View>
      </View>
    );
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
                source={{ uri: user?.avatar || 'https://via.placeholder.com/60' }}
                style={styles.avatarSmall}
              />
              <Text style={styles.userNameSmall}>{user?.name ?? 'You'}</Text>
            </View>
          )}
        </View>
      </PanGestureHandler>
    );
  };

  return (
    <ImageBackground
      source={{ uri: roomName ? avatar : participant[0]?.avatar || 'https://via.placeholder.com/300' }}
      style={styles.container}
      resizeMode="cover"
    >
      <View style={[styles.overlay, { backgroundColor: overlayColor }]}>
        <StatusBar
          translucent={true}
          barStyle={color.dark ? 'light-content' : 'dark-content'}
          backgroundColor="transparent"
        />
        {renderMainView()}
        {renderSmallView()}
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  contentContainer: {
    flex: 0.7,
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginTop: 50,
  },
  roomContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  roomAvatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
  },
  roomName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  singleParticipantContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  singleAvatar: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 20,
  },
  singleName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
  },
  multiParticipantContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  multiAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    margin: 10,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  multiName: {
    fontSize: 16,
    color: '#fff',
    width: 100,
    textAlign: 'center',
    margin: 10,
    fontWeight: '500',
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