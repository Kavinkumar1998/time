import { configureStore } from "@reduxjs/toolkit";
import Time from "./Slice"

export const store = configureStore({
    reducer: {
     time:Time
    }
})



