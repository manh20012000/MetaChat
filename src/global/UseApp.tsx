import { useEffect } from 'react';
import { Permission, PermissionsAndroid, Platform } from 'react-native';
import { initializeNotifications } from './NotificationConfig';
import { setupCallKeep } from './CallKepp';

// Kiểm tra và yêu cầu quyền Android

const useApp = () => {
  useEffect(() => {
    const initialize = async () => {
      await setupCallKeep();
      // Khởi tạo thông báo từ NotifiConfig
      const cleanup = initializeNotifications();
      return cleanup;
    };

    initialize().catch(console.error);
  }, []);

  return null;
};

export default useApp;