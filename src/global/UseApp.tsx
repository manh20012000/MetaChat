import { useEffect } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';
import { initializeNotifications } from './NotificationHandler';
// import { setupCallKeep } from './CallKeep';
import HandlerPermission from '../util/Permision/SettupPermission';
const useApp = () => {
  useEffect(() => {
    const initialize = async () => {
      const permission = await HandlerPermission();

      if (permission) {
        console.log('Permission granted');
        // Nếu quyền được cấp, có thể khởi tạo CallKeep hoặc thông báo
        // await setupCallKeep();  // Nếu bạn cần cấu hình cuộc gọi video
        const cleanup = initializeNotifications(); // Khởi tạo thông báo
        return cleanup;
      } else {
        const cleanup = initializeNotifications(); // Khởi tạo thông báo

        console.log('Permission not granted');
        return cleanup;
        // Xử lý khi quyền không được cấp, có thể thông báo cho người dùng
      }
    };

    initialize().catch(console.error);
  }, []);

  return null;
};

export default useApp;
