import { configureStore } from '@reduxjs/toolkit';

import bottleSpecReducer from './slices/bottleSpecSlice';
import brandReducer from './slices/brandSlice';
import coatingProductionReducer from './slices/coatingProductionSlice';
import coatingSpecReducer from './slices/coatingSpecSlice';
import coatingColorReducer from './slices/coatingColorSlice';
import coatingTypeReducer from './slices/coatingTypeSlice';
import companyReducer from './slices/companySlice';
import authReducer from './slices/loginSlice';
import permissionReducer from './slices/permissionSlice';
import printingColorReducer from './slices/printingColorSlice';
import printingTypeReducer from './slices/printingTypeSlice';
import productionReducer from './slices/productionSlice';
import roleReducer from './slices/roleSlice';
import userReducer from './slices/userSlice';
import variantReducer from './slices/variantSlice';
import visionReducer from './slices/visionSlice';
import formulaReducer from './slices/formulaSlice';
import rawMaterialReducer from './slices/rawMaterialSlice';
import sgLabelReducer from './slices/sgLabelSlice';
import sgLabelTwoReducer from './slices/sgLabelTwoSlice';

import operatorReducer from './slices/operatorSlice';
import shiftReducer from './slices/shiftSlice';
import stockEntryReducer from './slices/stockEntrySlice';
import unitReducer from './slices/unitSlice';

export const store = configureStore({
  reducer: {
    operators: operatorReducer,
    shifts: shiftReducer,
    auth: authReducer,
    bottleSpecs: bottleSpecReducer,
    brands: brandReducer,
    coatingProductions: coatingProductionReducer,
    coatingSpecs: coatingSpecReducer,
    coatingColor: coatingColorReducer,
    coatingType: coatingTypeReducer,
    companies: companyReducer,
    permissions: permissionReducer,
    printingColor: printingColorReducer,
    printingType: printingTypeReducer,
    productions: productionReducer,
    roles: roleReducer,
    users: userReducer,
    variants: variantReducer,
    vision: visionReducer,
    formulas: formulaReducer,
    rawMaterials: rawMaterialReducer,
    sgLabels: sgLabelReducer,
    sgLabelTwo: sgLabelTwoReducer,
    stockEntries: stockEntryReducer,
    units: unitReducer,
  },
});
