import React, { useEffect, useRef, useState } from 'react';
import {
  Modal,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import MapView, { Marker } from 'react-native-maps';
import Conversation from '../../../../../types/home_type/Converstation_type';
import { Message_type } from '../../../../../types/home_type/Chat_type';
import userMessage from '../../../../../types/home_type/useMessage_type';
import UseModalMap from './useMapShare';
import Ionicons from 'react-native-vector-icons/Ionicons'; // Import icon
//const googleMapsLink = `https://www.google.com/maps?q=${location.latitude},${location.longitude}`;
type TMap = {
  onClose: () => void;
  onSend: any;
  conversation: Conversation;
  replyMessage: Message_type;
  userChat: userMessage;
};

Geolocation.setRNConfiguration({
  skipPermissionRequests: true,
  authorizationLevel: 'auto',
  enableBackgroundLocationUpdates: true,
  locationProvider: 'auto',
});

const ModalMap: React.FC<TMap> = ({
  onClose,
  onSend,
  conversation,
  replyMessage,
  userChat,
}) => {
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const mapRef = useRef<MapView>(null);
  const { onSendMessage } = UseModalMap({
    onSend,
    conversation,
    replyMessage,
    userChat,
  });

  useEffect(() => {
    Geolocation.getCurrentPosition(info => console.log('dshdjsds', info));
    try {
      // Geolocation.getCurrentPosition(info => console.log(info));
      Geolocation.getCurrentPosition(
        position => {
          const { latitude, longitude } = position.coords;

          setLocation({ latitude, longitude });
          setIsLoading(false);
        },
        error => {
          Alert.alert('Lỗi', `Không thể lấy vị trí: ${error.message}`);
          console.log(error);
          setIsLoading(false);
        },
        { enableHighAccuracy: false, timeout: 20000, maximumAge: 10000 },
      );
    } catch (err) {
      Alert.alert('Lỗi', 'Không thể lấy vị trí. Hãy kiểm tra cài đặt GPS.');
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (location && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        1000,
      );
    }
  }, [location]);
  const onRegionChange = (region: any) => {
    setLocation(region);
  }

  return (
    <Modal transparent animationType="slide">
      <View style={styles.container}>
        <View style={styles.modalContent}>
          {/* Nút đóng (dấu X) */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color="#000" />
          </TouchableOpacity>

          {/* Hiển thị ActivityIndicator nếu đang loading hoặc chưa có vị trí */}
          {isLoading || !location ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#007AFF" />
            </View>
          ) : (
            <>
              {/* Hiển thị bản đồ nếu có vị trí */}
              <MapView
                onRegionChange={onRegionChange}
                ref={mapRef}
                provider="google" // ⚠️ Thêm dòng này
                style={styles.map}
                region={{
                  latitude: location.latitude,
                  longitude: location.longitude,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }}
                showsUserLocation={true}
                followsUserLocation={true}
                onMapReady={() => console.log('Map is ready')} // Debug
              >
                <Marker coordinate={location} title="Vị trí của bạn" />
              </MapView>

              {/* Nút "Send" nằm ở dưới cùng */}
              {/* <TouchableOpacity
                style={styles.sendButton}
                onPress={() => onSendMessage(location)}>
                <Text style={styles.sendButtonText}>Send</Text>
              </TouchableOpacity> */}
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default ModalMap;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '90%',
    height: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative', // Để nút đóng có thể định vị tuyệt đối
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    left: 10,
    zIndex: 1, // Đảm bảo nút đóng nằm trên cùng
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  sendButton: {
    width: '90%',
    alignSelf: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  sendButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
