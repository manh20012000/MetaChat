import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import React, { useState, useEffect, useContext } from 'react';
// import {AuthContext} from '../Navigation/useContext';
import styles from './StyleLogin.tsx';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../service/resfull_api.ts';
// import path from '../../util/path_confige.js';
import { HandlerNotification } from '../../util/checking_fcmtoken.js';
import { useSelector, useDispatch } from 'react-redux';
import {
  GoogleSignin,
  ConfigureParams,
  GoogleSigninButton,
  isErrorWithCode,
  NativeModuleError,
  statusCodes,
  User,
} from '@react-native-google-signin/google-signin';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Spinner from 'react-native-loading-spinner-overlay';
import messaging from '@react-native-firebase/messaging';
import {
  Avatar_user,
  Passkey,
  Logos,
  Showeyes,
  Hideeys,
  Google,
  Facebook,
} from '../../assets/svg/svgfile.js';
import { login } from '../../Redux_Toolkit/Reducer/auth.slice.ts';
GoogleSignin.configure({
  // Ép kiểu để bỏ qua kiểm tra TypeScript
  client_id: process.env.OAUTH_KEY,
} as any);
// GoogleSignin.configure({
//   // Ép kiểu để bỏ qua kiểm tra TypeScript
//   webClientId: '',
// } as any);
import FlashMessage, { showMessage } from 'react-native-flash-message';
import Statusbar from '../Component/Home_search/HomeSearch/StatusBar.tsx';
const Login: React.FC<{ navigation: any }> = ({ navigation }) => {
  const color = useSelector((state: any) => state.colorApp.value);
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();
  const [emailphone, setName] = useState('');
  const [matkhau, setPass] = useState('');
  const [hienthi, setHienthi] = useState(true);
  const [loading, setLoading] = useState<boolean>(false);
  const hanlderlogin = async () => {
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 10000)
    try {

      if (emailphone === '' || matkhau === '') {
        showMessage({
          message: 'Tài khoản hoặc password không đúng!',
          description: 'Tài khoản hoặc password không đúng!',
          type: 'danger',
          icon: 'danger',
          duration: 3000, // Thời gian hiển thị thông báo (3 giây)
        });
        return;
      }
      setLoading(true);
 
      const { data } = await axios.post(
        `${API_URL}/api/user/login`,
        {
          email: emailphone,
          password: matkhau,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      if (data.success) {

        const user = data.data;
        dispatch(login(user));
        await HandlerNotification.checknotificationPemision(user);
        await AsyncStorage.setItem(
          'access_token',
          JSON.stringify(user.access_token),
        );
        await AsyncStorage.setItem(
          'refresh_token',
          JSON.stringify(user.refresh_token),
        );
        setPass('');
        setName('');
        showMessage({
          message: 'Đăng nhập thành công!',
          description: 'Đăng nhập thành công!',
          type: 'success',
          icon: 'success',
          duration: 3000, // Thời gian hiển thị thông báo (3 giây)
        });
        navigation.navigate('Bottomtab_Navigation');
        setLoading(false);
      } else {
        showMessage({
          message: 'Đăng nhập không thành công!',
          description: 'Đăng nhập không thành công!',
          type: 'danger',
          icon: 'danger',
          duration: 3000, // Thời gian hiển thị thông báo (3 giây)
        });
      }
      setLoading(false);
    } catch (eror) {
      if (eror === 403) {
        console.log('tai khoan mât khẩu không chình xác');
      } else {
        console.log(eror, 'lỗi đăng nhập');
      }
      showMessage({
        message: 'Đăng nhập thất bại!',
        description: 'Đăng nhập thất bại!',
        type: 'danger',
        icon: 'danger',
        duration: 3000, // Thời gian hiển thị thông báo (3 giây)
      });
      setLoading(false);
    } finally {
      clearTimeout(timeout);
    }
  };
  const [eye, setEys] = useState(false);
  const anhien = () => {

    setHienthi(!hienthi);
  };
  const SiginWithGg = async () => {
    try {

      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });
      await GoogleSignin.hasPlayServices();
      const userInfor: any = await GoogleSignin.signIn();
    
      const gguser = userInfor.data.user;
      c
      // thực hiện lấy ra fcm token cho chức năng thông báo 
      const authStatus = await messaging().requestPermission();
 
      if (
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL
      ) {
        const fcmtoken = await AsyncStorage.getItem('fcmtoken');
       
        if (!fcmtoken) {
          const token = await messaging().getToken();
          let avatar = gguser.photo;
          if (gguser.photo == null) {
            avatar =
              'https://ss-images.saostar.vn/wwebp1200/pc/1613810558698/Facebook-Avatar_2.png';
          }
          const user = {
            email: gguser.email,
            password: gguser.id,
            name: gguser.name,
            firstname: gguser.familyName,
            lastname: gguser.givenName,
            avatar: avatar,
            fcmtoken: [token],
            birthday: gguser.birthday ?? '',
            gender: gguser.gender ?? '',
            phone: gguser.phoneNumber ?? '',
          };
          console.log(gguser, token, 'hahahh');
          const { data } = await axios.post(
            `${API_URL}/api/user/siginGoogle`,
            user,
            {
              headers: {
                'Content-Type': 'application/json',
              },
            },
          );
          const users = data.data;
          dispatch(login(users));
          await AsyncStorage.setItem('user', JSON.stringify(users));
          await AsyncStorage.setItem(
            'accessToken',
            JSON.stringify(users.accessToken),
          );
          await AsyncStorage.setItem(
            'refreshToken',
            JSON.stringify(data.refreshToken),
          );
          // await setData(JSON.stringify(data));
          navigation.navigate('Bottomtab_Navigation');
        }
      }
    } catch (error: any) {
      console.log('Error with Google Sign-In:', error);
    }
  };

  const handlerLogoutGg = async () => {
    await GoogleSignin.signOut();
    console.log('logout');
  };
  return (
    <ScrollView style={[styles.container,]}>
      <StatusBar
        translucent={true}
        // hidden={false}
        barStyle={color.isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={'transparent'}
      />
      <View style={[styles.header]}>
        <FlashMessage

          position="top"
          style={{ borderRadius: 10, width: '90%', alignSelf: 'center' }}
        />
        <Logos />
        <Text style={[{ color: 'black', fontSize: 24, fontWeight: 'bold' }]}>
          Đăng Nhập Tài Khoản
        </Text>
      </View>
      <View style={styles.body}>
        <View style={styles.bodycon}>
          <Text style={{ color: color.black, fontWeight: 'bold' }}>UserName</Text>
          <View
            style={[
              styles.IuserName,
              {
                borderRadius: 24,
                borderWidth: 1,
                borderColor: 'black',
                paddingLeft: '2%',
              },
            ]}>
            <Avatar_user />
            <TextInput
              placeholderTextColor={color.gray}
              placeholder="Enter email or phone"
              style={[
                styles.textinput,
                { fontFamily: 'Fredoka-Bold.ttf', flex: 1 },
              ]}
              autoCapitalize="none" // Ngăn viết hoa

              value={emailphone}
              onChangeText={emailphone => setName(emailphone)}
              keyboardType="email-address"

            />
          </View>
          <Text style={{ color: color.black, fontWeight: 'bold' }}>PassWord</Text>
          <View
            style={[
              styles.IuserName,
              {
                borderRadius: 24,
                borderWidth: 1,
                borderColor: 'black',
                paddingHorizontal: '2%',
              },
            ]}>
            <Passkey />
            <TextInput
              placeholderTextColor={color.gray}
              placeholder="Enter password"
              style={[styles.textinput, { fontFamily: 'Fredoka-Bold.ttf', flex: 1 }]}
              secureTextEntry={hienthi}
              value={matkhau}
              autoCapitalize="none" // Ngăn viết hoa

              onChangeText={text => {
                setPass(text);
                if (text !== '') {
                  setEys(true);
                } else {
                  setEys(false);
                }
              }}
            />
            {eye === true && (
              <TouchableOpacity onPress={anhien}>
                {hienthi ? <Showeyes /> : <Hideeys />}
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            style={{ justifyContent: 'flex-end', alignSelf: 'flex-end' }}>
            <Text style={{ color: color.black, fontWeight: 'bold' }}>
              Quyên mật khẩu
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.button,
              {
                backgroundColor: 'red',
                justifyContent: 'center',
                borderRadius: 20,
                alignItems: 'center',
              },
            ]}
            onPress={hanlderlogin}>
            <Text
              style={[
                styles.btnTxt,
                { textAlign: 'center', color: color.black },
              ]}>
              Login
            </Text>
          </TouchableOpacity>
          <View
            style={{
              justifyContent: 'center',
              alignSelf: 'center',
              marginTop: '5%',
            }}>
            <Text style={{ color: color.black, fontWeight: '400' }}>
              Bạn chưa có tài khoản
              <Text
                onMagicTap={() => {
                  console.log('sjndscnjsdn');
                }}
                onPress={() => {

                  navigation.navigate('Register');
                }}
                style={{ color: 'green' }}>
                {' '}
                ? Đăng ký ngay
              </Text>
            </Text>
          </View>
        </View>
      </View>
      <View
        style={{
          width: '80%',
          alignSelf: 'center',
          flexDirection: 'row',
          marginBottom: '5%',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
        <View
          style={{
            width: '40%',
            height: 2,
            flexDirection: 'row',

            backgroundColor: color.black,
            alignItems: 'center',
            justifyContent: 'center',
          }}></View>
        <Text style={{ alignSelf: 'center', color: color.black }}>Hoặc</Text>
        <View
          style={{
            width: '40%',
            backgroundColor: color.black,
            height: 2,
            alignSelf: 'center',
            flexDirection: 'row',
          }}></View>
      </View>
      <View
        style={{
          width: '90%',
          height: '10%',
          flexDirection: 'row',
          justifyContent: 'space-around',
          alignItems: 'center',
          alignSelf: 'center',
          flex: 1
        }}>
        <TouchableOpacity
          onPress={() => {

            SiginWithGg()
          }}
          style={{
            flexDirection: 'row',
            alignContent: 'center',
            alignItems: 'center',
            alignSelf: 'center',
            borderWidth: 1,
            borderRadius: 30, padding: '1%'
          }}>
          <Text style={{ color: color.black, fontFamily: "", fontSize: 16, fontWeight: "600" }}>Login with </Text>

          <Google />
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            flexDirection: 'row',
            alignContent: 'center',
            alignItems: 'center',
            alignSelf: 'center',
            borderWidth: 1,
            borderRadius: 30, padding: '1%'
          }}>
          <Text style={{ color: color.black, fontFamily: "", fontSize: 16, fontWeight: "600" }}>Login with </Text>
          <Facebook />
        </TouchableOpacity>
      </View>
      <Spinner
        visible={loading}
        textContent={'Đang tải...'}
        textStyle={{ color: '#FFF' }}
      />
      <View style={styles.flooter}></View>
    </ScrollView>
  );
};
export default Login;
