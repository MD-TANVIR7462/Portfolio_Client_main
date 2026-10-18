import { createSlice } from '@reduxjs/toolkit';

const initialUser = localStorage.getItem('portfolio_user')
  ? JSON.parse(localStorage.getItem('portfolio_user'))
  : null;

const initialAccessToken = localStorage.getItem('portfolio_access_token') || null;

const initialState = {
  user: initialUser,
  accessToken: initialAccessToken,
  isAuthenticated: !!initialAccessToken,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, accessToken } = action.payload;
      if (user) {
        state.user = user;
        localStorage.setItem('portfolio_user', JSON.stringify(user));
      }
      if (accessToken) {
        state.accessToken = accessToken;
        state.isAuthenticated = true;
        localStorage.setItem('portfolio_access_token', accessToken);
      }
    },
    updateUser: (state, action) => {
      state.user = action.payload;
      localStorage.setItem('portfolio_user', JSON.stringify(action.payload));
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      localStorage.removeItem('portfolio_user');
      localStorage.removeItem('portfolio_access_token');
    },
  },
});

export const { setCredentials, updateUser, logout } = authSlice.actions;

export const selectCurrentUser = (state) => state.auth.user;
export const selectCurrentToken = (state) => state.auth.accessToken;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;

export default authSlice.reducer;
