import { createSlice } from '@reduxjs/toolkit';
import { ACCOUNTS } from '../data/accounts.js';

// Seeded from the static data for now; dispatch accountsLoaded() with API data later.
// structuredClone keeps Immer's dev-mode freeze off the shared ACCOUNTS module.
const accountsSlice = createSlice({
  name: 'accounts',
  initialState: { list: structuredClone(ACCOUNTS) },
  reducers: {
    accountsLoaded(state, action) {
      state.list = action.payload;
    },
  },
  selectors: {
    selectAccounts: (state) => state.list,
    selectAccountById: (state, id) => state.list.find((a) => a.id === id),
  },
});

export const { accountsLoaded } = accountsSlice.actions;
export const { selectAccounts, selectAccountById } = accountsSlice.selectors;
export default accountsSlice.reducer;
