import React, { useEffect, useState } from 'react';
import { Modal, Text, TouchableOpacity, View, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import MapView, { Marker } from 'react-native-maps';
import Conversation from '../../../../type/Home/Converstation_type';
import { Message_type } from '../../../../type/Home/Chat_type';
import userMessage from '../../../../type/Home/useMessage_type';
import UseModalMap from './useMapShare';
import Ionicons from 'react-native-vector-icons/Ionicons'; // Import icon

type TMap = {
  onClose: () => void;
  onSend: any;
  conversation: Conversation;
  replyMessage: Message_type;
  userChat: userMessage;
};

  Geolocation.setRNConfiguration({
    skipPermissionRequests: false, 
    authorizationLevel: 'whenInUse',
  });

const ModalMap: React.FC<TMap> = ({ onClose, onSend, conversation, replyMessage, userChat }) => {
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true); 
  const { onSendMessage } = UseModalMap({
    onSend,
    conversation,
    replyMessage,
    userChat,
  });

  useEffect(() => {
    
    try{
      // Geolocation.getCurrentPosition(info => console.log(info));
      Geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          console.log(latitude,"dsjf", longitude);
          setLocation({ latitude, longitude });
          setIsLoading(false);
        },
        (error) => {
          Alert.alert("Lỗi", `Không thể lấy vị trí: ${error.message}`);
          console.log(error);
          setIsLoading(false);
        },
        { enableHighAccuracy: false ,timeout: 20000, maximumAge: 10000 }
    
    );

    }catch(err){
      Alert.alert("Lỗi", "Không thể lấy vị trí. Hãy kiểm tra cài đặt GPS.");
      console.log(err)
    }finally{
      setIsLoading(false);
    }
    
  }, []);

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
                style={styles.map}
                initialRegion={{
                  latitude: location.latitude,
                  longitude: location.longitude,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }}
              >
                <Marker coordinate={location} title="Vị trí của bạn" />
              </MapView>

              {/* Nút "Send" nằm ở dưới cùng */}
              <TouchableOpacity
                style={styles.sendButton}
                onPress={() => onSendMessage(location)}
              >
                <Text style={styles.sendButtonText}>Send</Text>
              </TouchableOpacity>
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
    right: 10,
    zIndex: 1, // Đảm bảo nút đóng nằm trên cùng
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  map: {
    flex: 1,
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