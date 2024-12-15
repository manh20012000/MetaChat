import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { login } from '../Redux_Toolkit/Reducer/auth.slice';
import { API_URL } from '../service/resfull_api';
import { useDispatch } from 'react-redux';
import User_interface from '../interface/user.Interface';

export const checkAndRefreshToken = async (): Promise<User_interface | null> => {
  // Lấy token từ AsyncStorage
  const user_json = await AsyncStorage.getItem('user');
  if (!user_json) {
    return null; // Trả về null nếu không có token
  }
  const user = JSON.parse(user_json);
  const dispatch = useDispatch();
  try {
    if (!user) {
      // Nếu không có token, trả về false
      return null;
    }

    const decoded: any = jwtDecode(user.access_token);

    const isTokenExpired = decoded.exp * 1000 < Date.now(); // Kiểm tra token hết hạn

    if (isTokenExpired) {
      // Token hết hạn, cần làm mới token
      try {
        const response = await axios.post(
          `${API_URL}/user/refreshToken`,
          { refreshToken: user.refresh_token },
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
          const accessTokenNew = data.data.access_token;
          const refreshTokenNew = data.data.refresh_token;

          await AsyncStorage.setItem('user', userDataString);
          await AsyncStorage.setItem('access_token', accessTokenNew);
          await AsyncStorage.setItem('refresh_token', refreshTokenNew);

          // Cập nhật Redux
          dispatch(login(data.data));

          return data.data; // Trả về user mới với token mới
        } else {
          // Làm mới token thất bại
          return null;
        }
      } catch (error) {
        console.error('Lỗi khi làm mới token:', error);
        return null;
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
