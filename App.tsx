/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import type { PropsWithChildren } from 'react';
import {
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
import changeNavigationBarColor, {
  hideNavigationBar,
  showNavigationBar,
} from 'react-native-navigation-bar-color';
import { color } from './src/assets/color/color.js';
function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };
  // changeNavigationBarColor('translucent', false);
  changeNavigationBarColor('#000000', true);
  return (
    <Provider store={store}>
      <GestureHandlerRootView style={{ backgroundColor: color.black, flex: 1}}>
        <FlashMessage
          position="top"
          style={{ borderRadius: 10, width: '90%', alignSelf: 'center', marginTop: '5%' }}
        />
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
