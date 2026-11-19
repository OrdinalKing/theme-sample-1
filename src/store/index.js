import { configureStore } from '@reduxjs/toolkit';
import accountsReducer from './accountsSlice.js';
import rewardsReducer, { persistRewards } from './rewardsSlice.js';

export const store = configureStore({
  reducer: {
    accounts: accountsReducer,
    rewards: rewardsReducer,
  },
});

persistRewards(store);
