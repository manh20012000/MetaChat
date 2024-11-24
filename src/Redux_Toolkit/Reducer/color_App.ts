import {createSlice} from '@reduxjs/toolkit';
import {color} from '../../assets/color/color';
const initialColor = {
  value: color,
};
export const Color_app = createSlice({
  name: 'ColorGlobal',
  initialState: initialColor,
  reducers: {
    UpdateColor: (state, action) => {
      state.value = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const {UpdateColor} = Color_app.actions;

export default Color_app.reducer;
