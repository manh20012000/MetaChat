import { Permission, PermissionsAndroid, Platform } from 'react-native';
import RNCallKeep from 'react-native-callkeep';

// Kiểm tra và yêu cầu quyền Android
const requestPermissions = async (): Promise<boolean> => {
  if (Platform.OS === 'android') {
    try {
      const permissions: Permission[] = [
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        PermissionsAndroid.PERMISSIONS.CAMERA,
        PermissionsAndroid.PERMISSIONS.CALL_PHONE,
      ];

      const permissionsToRequest: Permission[] = [];
      for (const permission of permissions) {
        const status = await PermissionsAndroid.check(permission);
        if (!status) {
          permissionsToRequest.push(permission);
        }
      }

      if (permissionsToRequest.length > 0) {
        const results = await PermissionsAndroid.requestMultiple(permissionsToRequest);
        return permissions.every(
          (permission) => results[permission] === PermissionsAndroid.RESULTS.GRANTED
        );
      }
      return true;
    } catch (err) {
      console.error('Error requesting permissions:', err);
      return false;
    }
  }
  return true;
};

// Cấu hình CallKeep
export const setupCallKeep = async (): Promise<void> => {
  const hasPermissions = await requestPermissions();
  if (!hasPermissions) {
    console.log('Permissions not granted');
    return;
  }

  const options = {
    ios: {
      appName: 'MetaChat',
    },
    android: {
      alertTitle: 'Quyền truy cập cuộc gọi',
      alertDescription: 'Cho phép MetaChat thực hiện và quản lý cuộc gọi',
      cancelButton: 'Hủy',
      okButton: 'Đồng ý',
      imageName: 'phone_account_icon',
      additionalPermissions: [
        'android.permission.READ_PHONE_STATE',
        'android.permission.CALL_PHONE',
      ],
      selfManaged: true,
    },
  };

  const phoneAccountOptions = {
    ios: {
      appName: 'MetaChat',
    },
    android: {
      alertTitle: 'Quyền truy cập cuộc gọi',
      alertDescription: 'Cho phép MetaChat thực hiện và quản lý cuộc gọi',
      cancelButton: 'Hủy',
      okButton: 'Đồng ý',
      imageName: 'phone_account_icon',
      additionalPermissions: ['android.permission.READ_PHONE_STATE'],
      selfManaged: true,
      foregroundService: {
        channelId: 'com.metachat.call',
        channelName: 'Cuộc gọi MetaChat',
        notificationTitle: 'MetaChat đang hoạt động',
        notificationIcon: 'ic_launcher',
      },
    },
  };

  try {
    // Thiết lập CallKeep
    await RNCallKeep.setup(options);
    RNCallKeep.registerPhoneAccount(phoneAccountOptions);
    RNCallKeep.registerAndroidEvents();
    RNCallKeep.setAvailable(true);
    console.log('CallKeep setup successfully');
  } catch (error) {
    console.error('Error setting up CallKeep:', error);
  }
};