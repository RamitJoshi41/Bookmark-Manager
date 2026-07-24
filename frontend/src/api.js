import axios from 'axios';

// 1. Create a custom Axios instance
const api = axios.create({
  // This points to your FastAPI server. Now you never have to type it again!
  baseURL: 'http://127.0.0.1:8000', 
});

// 2. Set up the Request Interceptor (The Toll Booth)
api.interceptors.request.use(
  (config) => {
    // Before the request leaves, look in the browser's local storage for the token
    const token = localStorage.getItem('token');
    
    // If a token exists, attach it to the headers exactly how FastAPI expects it
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config; // Send the modified request on its way!
  },
  (error) => {
    // If something goes wrong before sending, just reject it
    return Promise.reject(error);
  }
);

// 3. Export this custom instance so other files can use it
export default api;