/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useEffect, useState } from 'react';
import type { PropsWithChildren } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import Login from './src/Screen/User_Auth/login.tsx';
import {
  Colors,
} from 'react-native/Libraries/NewAppScreen';
import { Provider } from 'react-redux'
import { store } from './src/Redux_Toolkit/Store'
import Navigation from './src/navigation/navigation'
import FlashMessage from 'react-native-flash-message';
import { SocketProvider } from './src/util/socket.io.tsx';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import NetInfo from '@react-native-community/netinfo';
import changeNavigationBarColor, {
  hideNavigationBar,
  showNavigationBar,
} from 'react-native-navigation-bar-color';
import { color } from './src/assets/color/color.js';
function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };
  // changeNavigationBarColor('translucent', false);
  changeNavigationBarColor('#000000', true);
  useEffect(() => {
    // Đăng ký lắng nghe trạng thái kết nối
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected);
    });

    // Dọn dẹp khi component unmount
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (isConnected === false) {
      Alert.alert('No Internet Connection', 'Your network connection is too weak or unavailable.');
    }
  }, [isConnected]);

  return (
    <Provider store={store}>
      <GestureHandlerRootView style={{ backgroundColor: color.black, flex: 1 }}>

        <SocketProvider>
          <Navigation />
        </SocketProvider>
      </GestureHandlerRootView>
    </Provider >
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

export default App;
