import messaging from '@react-native-firebase/messaging';
import { useContext } from 'react';
import { Add_icon } from '../assets/svg/svgfile';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../Navigation/useContext';
import axios from 'axios';
import path from './path_confige';
import { API_URL } from '../confige/resfull_api';
export class HandlerNotification {
  static userData = '';
  static checknotificationPemision = async datauser => {
    await AsyncStorage.removeItem('user');
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
          console.log(typeof fcmtoken);
          // console.log(Object.isFrozen(fcmToken)); // Kiểm tra xem mảng có bị đóng băng không
          // fcmToken.push(token);
          const arraysToken = [...fcmtoken, token];

          await this.update(arraysToken, this.userData);
        }
      }
    } catch (e) {
      console.log(e);
    }
  };
  static update = async (fcmtoken, auth) => {
    try {
      console.log(auth._id, 'caap nhat laij fcmtoken1', this.userData._id, fcmtoken);
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
        const dataUser = {
          _id: data.data._id,
          name: data.data.name,
          avatar: data.data.avatar,
          email: data.data.email,
          fcmToken: data.data.fcmToken,
          accessToken: this.userData.accessToken,
          refreshToken: this.userData.refreshToken,
        };
        await AsyncStorage.setItem('user', JSON.stringify(dataUser));
      }
    } catch (err) {
      console.log('can not update token fail err', err);
      return null;
    }
  };
}
