import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:3000", // 또는 실제 서버 URL
});

export default axiosInstance;