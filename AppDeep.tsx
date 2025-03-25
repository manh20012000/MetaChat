import { Linking, } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import PermissionNotification from './src/util/Permision/NotifictionPermission';
import { useEffect } from 'react';
import navigation from './src/navigation/navigation';
import {color} from './src/assets/color/color.js';
const NAVIGATION_IDS = [
  'ChatScreen',
];
const UseApp=()=>{

  useEffect(() => {
    PermissionNotification();
    // Khi nhấn vào thông báo từ trạng thái đóng hoàn toàn
     messaging().getInitialNotification().then((remoteMessage)=>{
      if(remoteMessage){
        console.log(remoteMessage.data)
        // const screen=remoteMessage?.data?.screen
      }
     })
      // Khi app đang chạy nền và nhấn vào thông báo
       const unsubscribe=messaging().onNotificationOpenedApp(remoteMessage=>{
        console.log(remoteMessage.data)
       })
   return unsubscribe;
  }, []);
  const handleNotification = (data:any) => {
    console.log(data)
    if (data) {
      const { screen, message } = data;

      // Kiểm tra nếu cần điều hướng
      if (NAVIGATION_IDS.includes(screen)) {
        // navigation?.navigate(screen, { message });
      }

    }
  };
  return {

  }
}

export default UseApp
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
