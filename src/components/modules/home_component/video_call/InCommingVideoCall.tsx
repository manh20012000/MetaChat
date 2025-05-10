import React from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  Image,
  StatusBar,
  ImageBackground,
} from 'react-native';
import {
  participants,
  TUser,
} from '../../../../types/home_type/Converstation_type';
import {useSelector} from 'react-redux';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
interface Props {
  handleAccept: () => void;
  handleDecline: () => void;
  converstationVideocall: any;
  caller: TUser;
}

const IncommingVideoCall = ({
  handleAccept,
  handleDecline,
  converstationVideocall,
  caller,
}: Props) => {
  const user = useSelector((state: any) => state.auth.value);
  const color = useSelector((value: any) => value.colorApp.value);
  const {roomName, avatar, participants, background} = converstationVideocall;

  // Lọc participant, loại bỏ user hiện tại
  const participant = participants.filter(
    (item: TUser) => item.user_id !== user._id,
  );

  // Màu phủ mờ dựa trên background hoặc mặc định
  const overlayColor = background ? `${background}80` : 'rgba(0, 0, 0, 0.5)';

  return (
    <ImageBackground
      source={{
        uri: avatar
          ? avatar
          : caller.avatar || 'https://via.placeholder.com/300',
      }}
      style={styles.container}
      resizeMode="cover">
      <View style={[styles.overlay, {backgroundColor: overlayColor}]}>
        <StatusBar
          translucent={true}
          barStyle={color.dark ? 'light-content' : 'dark-content'}
          backgroundColor="transparent"
        />
        {/* Hiển thị roomName hoặc participant */}
        <View style={styles.contentContainer}>
          {roomName ? (
            <View style={styles.roomContainer}>
              {avatar && (
                <Image source={{uri: avatar}} style={styles.roomAvatar} />
              )}
              <Text style={styles.roomName}>{roomName}</Text>
            </View>
          ) : participant.length === 1 ? (
            <View style={styles.singleParticipantContainer}>
              <Image
                source={{
                  uri:
                    participant[0].avatar || 'https://via.placeholder.com/150',
                }}
                style={styles.singleAvatar}
              />
              <Text style={styles.singleName}>
                {participant[0].name || participant[0].user_id}
              </Text>
            </View>
          ) : (
            <View style={styles.multiParticipantContainer}>
              {/* Hàng avatar */}
              <View style={styles.avatarRow}>
                {participant.slice(0, 4).map((p: TUser) => (
                  <Image
                    key={p.user_id}
                    source={{
                      uri: p.avatar || 'https://via.placeholder.com/100',
                    }}
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
                    numberOfLines={1}>
                    {p.name || p.user_id}
                  </Text>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Nút Accept/Decline */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.declineButton]}
            onPress={handleDecline}>
            <MaterialIcons name="call-end" color={'white'} size={30} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.acceptButton]}
            onPress={handleAccept}>
            <FontAwesome name="video-camera" color={'white'} size={30} />
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
};

export default IncommingVideoCall;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Mặc định nếu không có background
  },
  contentContainer: {
    flex: 0.7, // Giảm flex để đẩy nội dung lên trên
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginTop: 50, // Dịch nội dung lên trên
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
    color: '#fff', // Trắng để nổi trên nền mờ
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
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 40,
    position: 'absolute',
    bottom: 30,
  },
  button: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptButton: {
    backgroundColor: 'green',
  },
  declineButton: {
    backgroundColor: 'red',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 5,
  },
});
