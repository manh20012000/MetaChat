import { jwtDecode, JwtPayload } from 'jwt-decode';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { login } from '../Redux_Toolkit/Reducer/auth.slice';
import { API_URL } from '../service/resfull_api';
import { useDispatch } from 'react-redux';
import User_type from '../type/Home/user_type';
import { API_ROUTE } from '../service/api_enpoint';
export const checkAndRefreshToken = async (dispatch: any, user:User_type) => {
  // Lấy token từ AsyncStorage

  try {
    if (!user) {
      
      // Nếu không có token, trả về false
      return false;
    }

    const decoded: JwtPayload = jwtDecode(user.access_token);

    const isTokenExpired = decoded.exp ? decoded.exp * 1000 < Date.now() : true;

    if (isTokenExpired) {
      // Token hết hạn, cần làm mới token
      try {
        const response = await axios.post(
          `${API_URL}${API_ROUTE.REFRESH_TOKEN}`,
          {refreshtoken: user.refresh_token},
          {
            headers: {
              'Content-Type': 'application/json',
            },
          },
        );

        const data = response.data;

        if (response.status === 200 && data) {
          
          const userDataString = data.data;
          await AsyncStorage.setItem('user', JSON.stringify(userDataString));
          await AsyncStorage.setItem('access_token', JSON.stringify(data.data.access_token));
          await AsyncStorage.setItem('refresh_token', JSON.stringify(data.data.refresh_token));

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
