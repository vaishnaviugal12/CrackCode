// src/api.js
import axios from 'axios';

const axiosClient = axios.create({
  baseURL: 'http://localhost:3000/api', // adjust if needed
  withCredentials: true, // if using cookies
  headers:{
    'Content-Type':'application/json'
  }
});

export default axiosClient;
