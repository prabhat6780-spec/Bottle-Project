import { configureStore } from "@reduxjs/toolkit";

import authReducer from "./slices/loginSlice";
import userReducer from "./slices/userSlice";
import brandReducer from "./slices/brandSlice";
import bottleSpecReducer from "./slices/bottleSpecSlice";
import variantReducer from "./slices/variantSlice";
import productionReducer from "./slices/productionSlice";
import visionReducer from "./slices/visionSlice";
import roleReducer from "./slices/roleSlice";
import permissionReducer from "./slices/permissionSlice";

export const store = configureStore({

  reducer: {

    auth: authReducer,
    users: userReducer,
    brands: brandReducer,
    bottleSpecs: bottleSpecReducer,
    variants: variantReducer,
    productions: productionReducer,
    vision: visionReducer,
    roles: roleReducer,
    permissions: permissionReducer,

  },

});