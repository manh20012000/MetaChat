import messaging from '@react-native-firebase/messaging';
import { useContext } from 'react';
import { Add_icon } from '../assets/svg/svgfile';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../Navigation/useContext';
import axios from 'axios';
import path from './path_confige';
import { API_URL } from '../service/resfull_api';
export class HandlerNotification {
  static userData = '';
  static checknotificationPemision = async datauser => {

    await AsyncStorage.setItem('user', JSON.stringify(datauser));
    const authStatus = await messaging().requestPermission();
    this.userData = datauser;

    if (
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL
    ) {
      this.getFcmToken();
    }
  };
  static getFcmToken = async () => {
    try {
      console.log('Bắt đầu cập nhật lại FCM token...');
      const fcmtoken = await AsyncStorage.getItem('fcmtoken');
      console.log('FCM token hiện tại:', fcmtoken);

      if (!fcmtoken) {
        const token = await messaging().getToken();


        if (token) {
          await AsyncStorage.setItem('fcmtoken', token); // Không cần JSON.stringify vì token là string


          await this.updatatokenforuser(token); // Cập nhật token cho user (nếu có hàm)
        } else {
          console.warn('Không lấy được token từ Firebase.');
        }
      }
    } catch (error) {
      console.error('Lỗi khi xử lý FCM token:', error);
    }
  };

  static updatatokenforuser = async token => {
    try {
      if (this.userData) {
        const { fcmtoken } = this.userData;

        if (fcmtoken && !fcmtoken.includes(token)) {
        
          // console.log(Object.isFrozen(fcmToken)); // Kiểm tra xem mảng có bị đóng băng không
          // fcmToken.push(token);
          const arraysToken = [...fcmtoken, token];
                 console.log('nhảy xuống cập nhật token ')
          await this.update(arraysToken, this.userData);
        }
      }
    } catch (e) {
      console.log(e);
    }
  };
  static update = async (fcmtoken, auth) => {
    try {
      console.log('upadet token ')
      const { data } = await axios.put(
        `${API_URL}/api/user/fcmtoken/${auth._id}`,
        { fcmtoken },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
      if (data.status === 200) {
        await AsyncStorage.removeItem('user')
   
        const dataUser = {
          _id: data.data._id,
          account: data.data.account,
          avatar: data.data.avatar,
          email: data.data.email,
          fcmtoken: data.data.fcmtoken,
          access_token: this.userData.access_token,
          refresh_token: this.userData.refresh_token,
        };
       
        await AsyncStorage.setItem('user', JSON.stringify(dataUser));
        console.log('thành côbg ')
      }
    } catch (err) {
      console.log('can not update token fail err', err);
      return null;
    }
  };
}
