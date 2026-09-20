import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';

import electionsReducer from '../store/slices/electionsSlice';
import blockchainReducer from '../store/slices/blockchainSlice';
import voterReducer from '../store/slices/voterSlice';
import auditReducer from '../store/slices/auditSlice';

export function renderWithProviders(
  ui,
  {
    preloadedState = {},
    store = configureStore({
      reducer: {
        elections: electionsReducer,
        blockchain: blockchainReducer,
        voter: voterReducer,
        audit: auditReducer,
      },
      preloadedState,
    }),
    ...renderOptions
  } = {}
) {
  function Wrapper({ children }) {
    return <Provider store={store}>{children}</Provider>;
  }
  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
}
