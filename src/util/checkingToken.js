import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { login } from '../Redex/Reducer/auth.slice';
import path from './config';
export const checkAndRefreshToken = async (dispatch, user) => {
  // Lấy token từ AsyncStorage

  try {
    if (!user) {
      // Nếu không có token, trả về false
      return false;
    }

    const decoded = jwtDecode(user.accessToken);

    const isTokenExpired = decoded.exp * 1000 < Date.now(); // Kiểm tra token hết hạn

    if (isTokenExpired) {
      // Token hết hạn, cần làm mới token
      try {
        const response = await axios.post(
          `${path}/user/refreshToken`,
          { refreshToken: user.refreshToken },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          },
        );

        const data = response.data;

        if (response.status === 200 && data) {
          // Lưu token mới vào AsyncStorage
          const userDataString = JSON.stringify(data.data);
          const accessTokenNew = data.data.accessToken;
          const refreshTokenNew = data.data.refreshToken;

          await AsyncStorage.setItem('user', userDataString);
          await AsyncStorage.setItem('access_token', accessTokenNew);
          await AsyncStorage.setItem('refresh_token', refreshTokenNew);

          // Cập nhật Redux
          dispatch(login(data.data));

          return data.data; // Trả về user mới với token mới
        } else {
          // Làm mới token thất bại
          return false;
        }
      } catch (error) {
        console.error('Lỗi khi làm mới token:', error);
        return false;
      }
    } else {
      // Token còn hợp lệ, trả về user
      return user;
    }
  } catch (e) {
    console.log(e, 'hahah');
  }
  return user;
};
