import { createSlice } from "@reduxjs/toolkit";
const initialAuthstate = {
  value: 0,
};
export const Authslice = createSlice({
  name: "auth",
  initialState: initialAuthstate,
  reducers: {
    login: (state, action) => {
      state.value = action.payload;
      
    },
    logout: (state: any, action) => {
      state.value = action.payload;
    },
    UpdateAuth: (state, action) => {
      state.value = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const { login, logout, UpdateAuth } = Authslice.actions;

export default Authslice.reducer;
