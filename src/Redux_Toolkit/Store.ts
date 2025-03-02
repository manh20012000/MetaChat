import { configureStore } from '@reduxjs/toolkit';
import authSlice from './Reducer/auth.slice.ts';
import Color_app from './Reducer/color_App.ts';
import statusUser from './Reducer/status.User.ts';
import networkSplice  from './Reducer/network_connect.ts';
export const store = configureStore({
  reducer: {
    auth: authSlice,
    colorApp: Color_app,
    statusUser: statusUser,
    network: networkSplice
  },
});
