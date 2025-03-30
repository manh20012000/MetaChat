import React from "react";
import { createSlice } from "@reduxjs/toolkit";
const connectNetwork = {
    value: false,
};
export const networkSplice = createSlice({
    name: "network",
    initialState: connectNetwork,
    reducers: {
        check: (state, action) => {
            state.value = action.payload;
        },
    },
});

export const {  check } = networkSplice.actions;

export default networkSplice.reducer;