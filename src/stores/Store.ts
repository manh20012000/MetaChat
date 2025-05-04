import {configureStore} from '@reduxjs/toolkit';
import authSlice from './reducer/auth.slice.ts';
import Color_app from './reducer/color_App.ts';
import statusUser from './reducer/status.User.ts';
import networkSplice from './reducer/network_connect.ts';
import DeviceSlice from './reducer/deviceInfor.ts';
export const store = configureStore({
  reducer: {
    auth: authSlice,
    colorApp: Color_app,
    statusUser: statusUser,
    network: networkSplice,
    deviceInfor: DeviceSlice,
  },
});
