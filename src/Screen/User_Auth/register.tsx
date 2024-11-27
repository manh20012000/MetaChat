import {
  StyleSheet,
  Text,
  View,
  StatusBar,
  ScrollView,
  TextInput,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector, useDispatch } from 'react-redux';
import {
  Logos,
  Phone,
  Pass2,
  Email,
  Backsvg,
  Avatar_user,
  Passkey,
  Showeyes,
  Hideeys,
  Google,
  Facebook,
} from '../../assets/svg/svgfile';
import path from '../../util/path_confige';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import * as Yup from 'yup';
import { Formik } from 'formik';
import Spinner from 'react-native-loading-spinner-overlay';
import FlashMessage, { showMessage } from 'react-native-flash-message';
import { postData, postFormData, API_URL } from '../../service/resfull_api';
const Register: React.FC<{ navigation: any }> = ({ navigation }) => {
  const color = useSelector((state: any) => state.colorApp.value);
  const insets = useSafeAreaInsets();
  const [selectedGender, setSelectedGender] = useState('Nữ');
  const genders = ['Nữ', 'Nam'];
  const [selectedDay, setSelectedDay] = useState('1');
  const [selectedMonth, setSelectedMonth] = useState('1');
  const [selectedYear, setSelectedYear] = useState('2024');
  const [avatar, setAvatar] = useState(
    'https://ss-images.saostar.vn/wwebp1200/pc/1613810558698/Facebook-Avatar_2.png',
  );

  const [loading, setLoading] = useState(false);
  const days = Array.from({ length: 31 }, (_, i) => (i + 1).toString());
  const months = Array.from({ length: 12 }, (_, i) => (i + 1).toString());
  const years = Array.from({ length: 100 }, (_, i) => (2024 - i).toString());
  // Yup Validation Schema
  const validationSchema = Yup.object().shape({
    firstName: Yup.string().required('Vui lòng nhập Họ'),
    lastName: Yup.string().required('Vui lòng nhập Tên'),

    // Kiểm tra email phải kết thúc bằng @gmail.com
    email: Yup.string()
      // .matches(
      //   /^[a-zA-Z0-9._%+-]+@gmail\.com$/,
      //   'Email phải có đuôi @gmail.com',
      // )
      .required('Vui lòng nhập email'),

    // Kiểm tra số điện thoại phải là 10 chữ số và không chứa chữ cái
    phone: Yup.string()
      .matches(
        /^\d{10}$/,
        'Số  là 10 chữ số và không chứa chữ cái',
      )
      .required('Vui lòng nhập số điện thoại'),

    password: Yup.string()
      .min(2, 'Mật khẩu phải ít nhất 6 ký tự')
      .required('Vui lòng nhập mật khẩu'),

    // Nếu cần kiểm tra ngày sinh, ví dụ:
    // selectedDay: Yup.string().required('Vui lòng chọn ngày'),
    // selectedMonth: Yup.string().required('Vui lòng chọn tháng'),
    // selectedYear: Yup.string().required('Vui lòng chọn năm'),
  });

  const handleRegister = async (values: any) => {
    try {


      setLoading(true);
      const formData = new FormData();
      formData.append('firstname', values.firstName);
      formData.append('lastname', values.lastName);
      formData.append('email', values.email);
      formData.append('phone', values.phone);
      formData.append('password', values.password);
      formData.append('gender', selectedGender);
      formData.append(
        'birthday',
        `${selectedDay}/${selectedMonth}/${selectedYear}`,
      );
      formData.append('avatar', avatar);
      console.log(values);
      const response = await axios.post(`${API_URL}/api/user/register`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      if (response.data.status === 201) {
        console.log('Registration successful');
        showMessage({
          message: 'Đăng ký thành công!',
          description: 'Tài khoản của bạn đã được tạo thành công.',
          type: 'success',
          icon: 'success',
          duration: 3000, // Thời gian hiển thị thông báo (3 giây)
        });
        // Handle successful registration (e.g., navigate to another screen)
      } else {
        console.log('Registration failed');
        showMessage({
          message: 'Đăng ký thất bại!',
          description: 'Có lỗi xảy ra, vui lòng thử lại.',
          type: 'danger',
          icon: 'danger',
          duration: 3000, // Thời gian hiển thị thông báo
        });
      }
      navigation.navigate("Login");
    } catch (error) {

      showMessage({
        message: 'Lỗi hệ thống!',
        description: 'Vui lòng kiểm tra lại kết nối hoặc thử lại sau.',
        type: 'danger',
        icon: 'danger',
        duration: 3000,
      }); console.error('Error registering user:', error);
    } finally {
      setLoading(false);

    }
  };

  return (
    <ScrollView
      style={[
        styles.container,
        {
          backgroundColor: color.backgroudcolor,
          paddingTop: insets.top,
        },
      ]}>
      <FlashMessage position="top" style={{ borderRadius: 10 }} />
      <TouchableOpacity
        style={[styles.naviBack]}
        onPress={() => {
          try {

            navigation.navigate("Login");
          } catch (err: any) {
            console.log(err, 'register log err');
          }
          // if (navigation.canGoBack()) {
          //   navigation.goBack();
          // } else {
          //   console.log('No screen to go back to');
          // }
        }}
      >
        <Backsvg />
      </TouchableOpacity>
      <View style={[styles.logo]}>
        <Logos />
        <Text style={[styles.title, { color: color.black }]}>
          Đăng Ký Tài Khoản
        </Text>
        <Text style={[{ color: color.gray }]}>
          Đăng ký tài khoản để được tham gia cùng chúng tôi
        </Text>
      </View>
      <Formik
        initialValues={{
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          password: '',
          // selectedDay: '',
          // selectedMonth: '',
          // selectedYear: '',
        }}
        validationSchema={validationSchema}
        onSubmit={values => {
          handleRegister(values);
        }}>
        {({
          handleChange,
          handleBlur,
          handleSubmit,
          values,
          errors,
          touched,
        }) => (
          <>
            <View style={[styles.input]}>
              <View style={[styles.Viewinput]}>
                <Avatar_user />
                <TextInput
                  placeholder="Nhập Họ ...."
                  placeholderTextColor={color.gray}
                  onChangeText={handleChange('firstName')}
                  onBlur={handleBlur('firstName')}
                  value={values.firstName}
                  style={[styles.textinput, { flex: 1 }]} // Ensure TextInput can expand
                />
                {touched.firstName && errors.firstName && (
                  <Text style={{ color: 'red', paddingRight: '3%' }}>{errors.firstName}</Text>
                )}
              </View>

              <View style={[styles.Viewinput, {}]}>
                <Avatar_user />
                <TextInput
                  placeholder="Nhập Tên ...."
                  placeholderTextColor={color.gray}
                  onChangeText={handleChange('lastName')}
                  onBlur={handleBlur('lastName')}
                  value={values.lastName}
                  style={[styles.textinput, { flex: 1 }]}
                />
                {touched.lastName && errors.lastName && (
                  <Text style={{ color: 'red', paddingRight: '3%' }}>{errors.lastName}</Text>
                )}
              </View>

              <View style={[styles.Viewinput,]}>
                <Email />
                <TextInput
                  placeholder="Địa chỉ email ...."
                  placeholderTextColor={color.gray}
                  onChangeText={handleChange('email')}
                  onBlur={handleBlur('email')}
                  value={values.email}
                  keyboardType="email-address"
                  autoCapitalize="none" // Ngăn viết hoa

                  style={[styles.textinput, { flex: 1 }]}
                />
                {touched.email && errors.email && (
                  <Text style={{ color: 'red', paddingRight: '3%' }}>{errors.email}</Text>
                )}
              </View>

              <View style={[styles.Viewinput]}>
                <Phone />
                <TextInput
                  keyboardType="numeric"
                  placeholder="Số điện thoại ...."
                  placeholderTextColor={color.gray}
                  onChangeText={handleChange('phone')}
                  onBlur={handleBlur('phone')}

                  value={values.phone}
                  style={[styles.textinput, { flex: 1 }]}
                />
                {touched.phone && errors.phone && (
                  <Text style={{ color: 'red', paddingRight: '3%' }}>{errors.phone}</Text>
                )}
              </View>

              <View style={[styles.Viewinput, { paddingLeft: '1%' }]}>
                <Pass2 />
                <TextInput
                  placeholder="Mật khẩu ...."
                  placeholderTextColor={color.gray}
                  onChangeText={handleChange('password')}
                  onBlur={handleBlur('password')}
                  value={values.password}
                  autoCapitalize='none'
                  secureTextEntry
                  style={[styles.textinput, { flex: 1 }]}
                />
                {touched.password && errors.password && (
                  <Text style={{ color: 'red', paddingRight: '3%' }}>{errors.password}</Text>
                )}
              </View>

              <View
                style={[
                  {
                    paddingLeft: '1%',
                    height: '12%',
                    borderColor: 'gray',
                    width: '100%',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  },
                ]}>
                <Picker
                  numberOfLines={7}

                  mode={'dialog'}
                  // themeVariant={'black'}
                  // label={'năm'}
                  // processColor={'black'}
                  selectedValue={selectedDay}
                  style={[styles.picker, { color: color.black, backgroundColor: color.white, borderRadius: 120 }]}
                  onValueChange={itemValue => setSelectedDay(itemValue)}>
                  {days.map(day => (
                    <Picker.Item key={day} label={day} value={day} />
                  ))}
                </Picker>

                <Picker
                  numberOfLines={7}
                  // themeVariant={'light'}
                  // processColor={'black'}

                  selectedValue={selectedMonth}
                  style={[styles.picker, { color: color.black, backgroundColor: color.white, borderRadius: 120 }]}
                  onValueChange={itemValue => setSelectedMonth(itemValue)}>
                  {months.map(month => (
                    <Picker.Item key={month} label={month} value={month} />
                  ))}
                </Picker>


                <Picker
                  numberOfLines={7}
                  // processColor={'pink'}
                  // themeVariant={'light'}
                  selectedValue={selectedYear}
                  style={[styles.picker, { color: color.black, backgroundColor: color.white, borderRadius: 120 }]}
                  onValueChange={itemValue => setSelectedYear(itemValue)}>
                  {years.map(year => (
                    <Picker.Item key={year} label={year} value={year} />
                  ))}
                </Picker>
              </View>
            </View>
            <View style={styles.container2}>
              <Text
                style={[
                  styles.label,
                  { color: color.black, fontWeight: 'bold' },
                ]}>
                Giới tính
              </Text>
              <View style={styles.genderContainer}>
                {genders.map(gender => (
                  <TouchableOpacity
                    key={gender}
                    style={[
                      styles.genderOption,
                      selectedGender === gender && styles.selectedOption,
                    ]}
                    onPress={() => {
                      if (gender === 'Nam') {
                        setAvatar(
                          'https://ss-images.saostar.vn/wwebp1200/pc/1613810558698/Facebook-Avatar_2.png',
                        );
                      } else {
                        setAvatar(
                          'https://ss-images.saostar.vn/wwebp1200/pc/1613810558698/Facebook-Avatar_2.png',
                        );
                      }

                      setSelectedGender(gender);
                    }}>
                    <Text
                      style={[
                        styles.genderText,
                        selectedGender === gender && styles.selectedText,
                        { color: color.black },
                      ]}>
                      {gender}
                    </Text>
                    <View
                      style={[
                        styles.radioButton,
                        selectedGender === gender && styles.radioSelected,
                      ]}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <TouchableOpacity
              onPress={() => handleSubmit()}
              style={[styles.bntregister]}>
              <Text>ĐĂNG KÝ</Text>
            </TouchableOpacity>
          </>
        )}
      </Formik>
      <Spinner
        visible={loading}
        textContent={'Đang tải...'}
        textStyle={{ color: '#FFF' }}
      />
    </ScrollView >
  );
};

export default Register;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  naviBack: {
    width: '100%',
    height: '5%',
    paddingHorizontal: 10,
    alignContent: 'center',
  },
  logo: {
    width: '100%',
    height: '20%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  input: {
    width: '100%',
    height: '60%',
    marginTop: '5%',
    paddingHorizontal: '4%',
    justifyContent: 'space-around',
  },
  Viewinput: {
    height: '12%',
    borderWidth: 1,
    borderColor: 'gray',
    width: '100%',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  textinput: {
    fontWeight: 'bold',
    marginLeft: '3%',
  },
  container2: {
    marginHorizontal: '5%',
    marginTop: '2%',
    marginBottom: '10%',
  },
  label: {
    fontSize: 16,
    marginBottom: 10,
  },
  genderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  genderOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: '#ccc',
    width: '45%',
    justifyContent: 'center',
  },
  selectedOption: {
    borderColor: '#007AFF',
  },
  genderText: {
    fontSize: 16,
    marginRight: 10,
  },
  selectedText: {
    fontWeight: 'bold',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  radioSelected: {
    backgroundColor: '#007AFF',
  },
  bntregister: {
    alignSelf: 'center',
    width: '90%',
    height: '8%',
    backgroundColor: 'green',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  picker: {
    width: '30%',
    height: 20,
    borderWidth: 2,
    borderColor: 'black',
    borderRadius: 10,
  },
});
// const [firstName, setFirstName] = useState('');
// const [lastName, setLastName] = useState('');
// const [email, setEmail] = useState('');
// const [phone, setPhone] = useState('');
// const [password, setPassword] = useState('');
// const [errorMessage, setErrorMessage] = useState('');
