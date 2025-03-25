import { Linking } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import PermissionNotification from './src/util/Permision/NotifictionPermission';
import { useEffect } from 'react';
import navigation from './src/navigation/navigation';

const NAVIGATION_IDS = ['ChatScreen'];

const UseApp = () => {
  useEffect(() => {
    PermissionNotification();

    // Khi nhấn vào thông báo từ trạng thái đóng hoàn toàn
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          console.log('🔵 App closed - Opened by notification:', remoteMessage.data);
          handleNotification(remoteMessage.data);
        }
      });

    // Khi app đang chạy nền và nhấn vào thông báo
    const unsubscribeBackground = messaging().onNotificationOpenedApp(remoteMessage => {
      if (remoteMessage) {
        console.log('🟡 App in background - Opened by notification:', remoteMessage.data);
        handleNotification(remoteMessage.data);
      }
    });

    // Khi app đang chạy foreground (đang mở)
    const unsubscribeForeground = messaging().onMessage(async remoteMessage => {
      if (remoteMessage) {
        console.log('🟢 App in foreground - Received notification:', remoteMessage.data);
        // Bạn có thể hiển thị thông báo trong app nếu cần
      }
    });

    return () => {
      unsubscribeBackground();
      unsubscribeForeground();
    };
  }, []);

  const handleNotification = (data: any) => {
    console.log('🔔 Handling notification:', data);
    if (data) {
      const { screen, message } = data;

      if (NAVIGATION_IDS.includes(screen)) {
        // navigation.navigate(screen, { message });
      }
    }
  };

  return {};
};

export default UseApp;

// function buildDeepLinkFromNotificationData(data: any): string | null {
//   const navigationId = data?.navigation;
//   if (!NAVIGATION_IDS.includes(navigationId)) {
//     console.warn('Unverified navigationId', navigationId);
//     return null;
//   }
//   const postId = data?.postId;
//   if (navigationId === 'ChatScreen') {
//     return `myapp://ChatScreen/${postId}`;
//   }
//   console.warn('Missing postId');
//   return null;
// }

// const linking = {
//   prefixes: ['myapp://', 'http://com.metachat'],
//   config: {
//     initialRouteName: 'Home',
//     screens: {
//       ChatScreen: 'ChatScreen',
//     },
//   },
//   async getInitialURL() {
//     const url = await Linking.getInitialURL();
//     if (typeof url === 'string') {
//       return url;
//     }

//     // Khi app mở từ trạng thái bị tắt hoàn toàn
//     const message = await messaging().getInitialNotification();
//     const deeplinkURL = buildDeepLinkFromNotificationData(message?.data);
//     if (typeof deeplinkURL === 'string') {
//       return deeplinkURL;
//     }
//   },
//   subscribe(listener: (url: string) => void) {
//     const onReceiveURL = ({ url }: { url: string }) => listener(url);

//     // Lắng nghe Deep Linking
//     const linkingSubscription = Linking.addEventListener('url', onReceiveURL);

//     // Khi người dùng nhấn vào thông báo khi app chạy nền
//     const unsubscribe = messaging().onNotificationOpenedApp(remoteMessage => {
//       const url = buildDeepLinkFromNotificationData(remoteMessage.data);
//       if (typeof url === 'string') {
//         listener(url);
//       }
//     });

//     return () => {
//       linkingSubscription.remove();
//       unsubscribe();
//     };
//   },
// };

// export default linking;
