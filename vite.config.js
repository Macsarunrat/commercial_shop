import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // อนุญาตให้เข้าผ่านโดเมน ngrok นี้
    allowedHosts: [
      "fc37c6c70e1d.ngrok-free.app",
      // ถ้าโดเมน ngrok เปลี่ยนบ่อย ใช้ regex ครอบทั้งโซนได้
      /\.ngrok-free\.app$/,
    ],
    host: true, // ให้ bind 0.0.0.0 (มีประโยชน์เวลา expose ออกไปข้างนอก)

    // ถ้า HMR ไม่ติดเวลาผ่าน ngrok ให้ตั้งเพิ่ม (ไม่จำเป็นเสมอไป)
    // hmr: {
    //   protocol: "wss",
    //   host: "1c3871d26738.ngrok-free.app",
    //   clientPort: 443,
    // },
  },
});
