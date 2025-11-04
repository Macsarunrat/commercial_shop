import axios from "axios";
import { useAuthStore } from "./stores/authStore.jsx"; // 👈 (เช็ค path ให้ถูก)

// 1. 🔽 (สำคัญ) URL ของ API (ต้องเป็นตัวเดียวกับใน Login/Register)
const API_URL = "https://great-lobster-rightly.ngrok-free.app";

// 2. 🔽 สร้าง "instance" ของ axios
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true", // (Header สำหรับ ngrok)
  },
});

// 3. ⭐️ นี่คือหัวใจสำคัญ (Interceptor) ⭐️
// "ก่อน" ที่ React จะยิง API (Request) ทุกครั้ง...
api.interceptors.request.use(
  (config) => {
    
    // 4. 🔽 ดึง Token มาจาก authStore
    // (เราใช้ getState() เพราะนี่ไม่ใช่ React Component)
    const token = useAuthStore.getState().token;

    // 5. 🔽 ถ้ามี Token, ให้แปะไปใน Header
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    // (จัดการ error ตอนส่ง)
    return Promise.reject(error);
  }
);

export default api;