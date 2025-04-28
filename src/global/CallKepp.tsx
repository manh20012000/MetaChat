
import RNCallKeep from 'react-native-callkeep';


// Cấu hình CallKeep
export const setupCallKeep = async (): Promise<void> => {
  
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