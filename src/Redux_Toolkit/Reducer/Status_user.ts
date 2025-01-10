import { createSlice } from "@reduxjs/toolkit"
const initStatus = {
    value:[],
}
export const StatusUser = createSlice({
    name: 'StatusUser',
    initialState:initStatus,
    reducers: {
        Status: (state, action) => {
            state.value = action.payload;
            // console.log(state.value)
        }
    }
})
export const { Status } = StatusUser.actions
export default StatusUser.reducer;