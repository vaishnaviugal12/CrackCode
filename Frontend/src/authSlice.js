// src/redux/userSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosClient from './Utils/axiosClient';

// REGISTER
export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post('/user/register', userData);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

// LOGIN
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post('/user/login', credentials);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

// LOGOUT
export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await axiosClient.post('/user/logout');
      return null;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

// CHECK
export const checkAuth = createAsyncThunk(
  'auth/check',
  async (_, { rejectWithValue }) => {
    try {
      const {data} = await axiosClient.get('/user/check');
      return data.user
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

// SLICE
const authSlice = createSlice({
  name: 'user',
  initialState: {
    user: null,
    loading: false,
    error: null,
    isAuthenticated: false,
  },
  reducers: {},

  extraReducers: (builder) => {
    builder
      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.isAuthenticated = !!action.payload;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?.message ||"Something went wrong";
        state.isAuthenticated=false;
        state.user=null
      })

      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
       state.loading = false;
        state.user = action.payload.user;
        state.isAuthenticated = !!action.payload;
      })
      .addCase(loginUser.rejected, (state, action) => {
       state.loading = false;
       state.error = action.payload?.message || "Something went wrong";
        state.isAuthenticated=false;
        state.user=null
      })

      // Logout
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
       state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
      })
      .addCase(logoutUser.rejected, (state, action) => {
       state.loading = false;
        state.error = action.payload ?.message ||"Something went wrong";
        state.isAuthenticated=false;
        state.user=null
      })

      // Check
      .addCase(checkAuth.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = !!action.payload;
      })
      .addCase(checkAuth.rejected, (state, action) => {
       state.loading = false;
        state.error = action.payload ?.message ||"Something went wrong";
        state.isAuthenticated=false;
        state.user=null
      });
  },
});

export default authSlice.reducer;
