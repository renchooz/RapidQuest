import axios from "axios";

const api = axios.create({
  baseURL: "https://rapidquest-1sx1.onrender.com",//backend
  withCredentials: true 
});

export default api;
