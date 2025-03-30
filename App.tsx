/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useEffect, useState} from 'react';
import type {PropsWithChildren} from 'react';
import {ActivityIndicator, StyleSheet, useColorScheme} from 'react-native';
import {Provider} from 'react-redux';
import {store} from './src/Redux_Toolkit/Store';
import Navigation from './src/navigation/navigation';
import FlashMessage from 'react-native-flash-message';
import {SocketProvider} from './src/util/socket.io.tsx';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import changeNavigationBarColor from 'react-native-navigation-bar-color';
import {color} from './src/assets/color/color.js';
function App(): React.JSX.Element {


 
  changeNavigationBarColor('#000000', true);
    // const {isDarkMode}=UseApp()
  
  return (
    <Provider store={store}>
      <GestureHandlerRootView style={{backgroundColor: color.black, flex: 1}}>
        <SocketProvider>
          <Navigation 
       
           />
        </SocketProvider>
      </GestureHandlerRootView>
    </Provider>
  );
}
export default App;
function UseApp() {
  throw new Error('Function not implemented.');
}

