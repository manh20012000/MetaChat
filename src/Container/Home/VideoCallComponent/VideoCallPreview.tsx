import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { RTCView } from 'react-native-webrtc';
import { PanGestureHandler, State } from 'react-native-gesture-handler';

const { width, height } = Dimensions.get('window');

interface Participant {
  id: string;
  name: string;
  avatar: string;
  stream?: MediaStream;
  isCameraOn: boolean;
}

interface PreviewVideoCallProps {
  participants: Participant[];
  myStream: MediaStream | null;
}

const PreviewVideoCall: React.FC<PreviewVideoCallProps> = ({ participants, myStream }) => {
  const [focusedParticipant, setFocusedParticipant] = useState<string | null>(null);
  const [smallViewPosition, setSmallViewPosition] = useState({ x: width - 120, y: 20 });

  const me: Participant = {
    id: 'me',
    name: 'Me',
    avatar: 'https://example.com/my-avatar.jpg',
    stream: myStream || undefined,
    isCameraOn: !!myStream,
  };

  const allParticipants = [me, ...participants];

  const onGestureEvent = (event: any) => {
    const { translationX, translationY } = event.nativeEvent;
    setSmallViewPosition({
      x: Math.max(0, Math.min(width - 100, smallViewPosition.x + translationX)),
      y: Math.max(0, Math.min(height - 150, smallViewPosition.y + translationY)),
    });
  };

  const onHandlerStateChange = (event: any) => {
    if (event.nativeEvent.state === State.END) {
      // Có thể thêm logic khi kết thúc kéo thả nếu cần
    }
  };

  const handleFocusParticipant = (id: string) => {
    setFocusedParticipant(id === focusedParticipant ? null : id);
  };

  const renderMainView = () => {
    const focused = allParticipants.find((p) => p.id === focusedParticipant) || me;
    return (
      <TouchableOpacity
        style={styles.mainView}
        onPress={() => handleFocusParticipant(focused.id)}
      >
        {focused.isCameraOn && focused.stream ? (
          <RTCView stream={focused.stream} style={styles.fullScreen} /> // Sửa ở đây
        ) : (
          <View style={styles.avatarContainer}>
            <Image source={{ uri: focused.avatar }} style={styles.avatarLarge} />
            <Text style={styles.userName}>{focused.name}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderSmallView = () => {
    const others = allParticipants.filter((p) => p.id !== focusedParticipant);
    return (
      <PanGestureHandler onGestureEvent={onGestureEvent} onHandlerStateChange={onHandlerStateChange}>
        <View style={[styles.smallView, { top: smallViewPosition.y, left: smallViewPosition.x }]}>
          {others.map((user) => (
            <TouchableOpacity
              key={user.id}
              style={styles.smallParticipant}
              onPress={() => handleFocusParticipant(user.id)}
            >
              {user.isCameraOn && user.stream ? (
                <RTCView stream={user.stream} style={styles.smallScreen} /> // Sửa ở đây
              ) : (
                <View style={styles.avatarContainerSmall}>
                  <Image source={{ uri: user.avatar }} style={styles.avatarSmall} />
                  <Text style={styles.userNameSmall}>{user.name}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
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

export default PreviewVideoCall;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  mainView: {
    width: '100%',
    height: '100%',
  },
  fullScreen: {
    width: '100%',
    height: '100%',
  },
  smallView: {
    position: 'absolute',
    width: 100,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 10,
    padding: 5,
  },
  smallParticipant: {
    marginBottom: 5,
  },
  smallScreen: {
    width: 90,
    height: 60,
    borderRadius: 5,
  },
  avatarContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#222',
    width: '100%',
    height: '100%',
  },
  avatarContainerSmall: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 90,
    height: 60,
  },
  avatarLarge: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 10,
  },
  avatarSmall: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  userName: {
    color: 'white',
    fontSize: 18,
  },
  userNameSmall: {
    color: 'white',
    fontSize: 12,
  },
});