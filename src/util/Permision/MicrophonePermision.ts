import { PermissionsAndroid, Platform } from "react-native";

const MicrophonePermission=async()=>{

        try {
          const grants = await PermissionsAndroid.request(
              PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
            {
              title: 'Cool Photo App Microphone Permission',
              message: 'Cool Photo App needs access to your microphone to record audio.',
              buttonNeutral: 'Ask Me Later',
              buttonNegative: 'Cancel',
              buttonPositive: 'OK',
            }
          );
      
        
          if (grants === PermissionsAndroid.RESULTS.GRANTED) {
           return true
          } else {
           
            return false
          }
        } catch (err) {
         console.log(err,'loi voi phone')
          return false
        }
      }
    

export default MicrophonePermission