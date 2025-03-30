import { createSlice } from "@reduxjs/toolkit";
const initDeviceInfo={
    value:0
}
export const  DeviceSlice=createSlice({
    name:"device_info",
    initialState:initDeviceInfo,
    reducers:{
        getInfo:(state,action)=>{
            state.value=action.payload
        }
    }
})

export const {getInfo}=DeviceSlice.actions;
export default DeviceSlice.reducer;