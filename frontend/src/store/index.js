import { configureStore } from '@reduxjs/toolkit';
import electionsReducer from './slices/electionsSlice';
import blockchainReducer from './slices/blockchainSlice';
import voterReducer from './slices/voterSlice';
import auditReducer from './slices/auditSlice';

export const store = configureStore({
  reducer: {
    elections: electionsReducer,
    blockchain: blockchainReducer,
    voter: voterReducer,
    audit: auditReducer,
  },
});

export default store;
