// src/stores/cartStore.jsx
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import api from "../api.js"; // 👈 1. Import "ท่อยิง API" (axios) ที่เราสร้าง

const withDevtools = (fn) =>
  typeof window !== "undefined" ? devtools(fn, { name: "cart-store" }) : fn;

// Helper: แปลงข้อมูลจาก API (ItemDetails) ให้เป็นข้อมูลที่ State ใช้อยู่ (product)
// API: { Quantity: 2, ItemDetails: { Sell_ID: 1, Product_Name: "TV", ... } }
// Local: { id: 1, name: "TV", qty: 2, ... }
const mapApiItemToLocal = (apiItem) => {
  if (!apiItem || !apiItem.ItemDetails) {
    console.error("Invalid API item structure:", apiItem);
    return null; // กัน Error
  }
  return {
    id: apiItem.ItemDetails.Sell_ID, // 👈 (id คือ Sell_ID)
    name: apiItem.ItemDetails.Product_Name,
    price: apiItem.ItemDetails.Price,
    stock: apiItem.ItemDetails.Stock,
    image: apiItem.ItemDetails.Cover_Image || "/IMG1/bagG.png", // 👈 (ใส่รูป fallback)
    qty: apiItem.Quantity,
  };
};

export const useCartStore = create(
  // 2. ❌ ลบ `persist` ออก - เราไม่ใช้ localStorage แล้ว
  withDevtools((set, get) => ({
    // --- STATE ---
    items: [], // [{id, name, price, stock, image, qty}]
    isLoading: true, // 👈 3. เพิ่ม State สำหรับ "กำลังโหลด"
    error: null,     // 👈 3. เพิ่ม State สำหรับ "Error"

    // --- SELECTORS (Helpers, เหมือนเดิม) ---
    cartCount: () => get().items.reduce((n, it) => n + (it.qty || 0), 0),
    cartTotal: () =>
      get().items.reduce(
        (sum, it) => sum + (it.price || 0) * (it.qty || 0),
        0
      ),

    // --- ACTIONS (เขียนใหม่ทั้งหมด) ---

    /**
     * (ฟังก์ชันใหม่) 1. ดึงตะกร้าจาก DB มาใส่ใน State
     * (เราจะเรียกอันนี้ ตอนที่ User Login สำเร็จ)
     */
    fetchCart: async () => {
      set({ isLoading: true, error: null });
      try {
        const res = await api.get("/cart/"); // 👈 API: GET /cart/
        
        // res.data คือ List[CartItemPublic] (จาก Backend)
        const localItems = res.data.map(mapApiItemToLocal).filter(Boolean); // .filter(Boolean) เพื่อกรองตัวที่ map ไม่สำเร็จ (null)
        
        set({ items: localItems, isLoading: false });
        console.log("CartStore: Fetched cart from DB", localItems);
        
      } catch (err) {
        console.error("Failed to fetch cart:", err);
        // ถ้า Error (เช่น 401 ยังไม่ Login) ให้เคลียร์ตะกร้า
        set({ error: "Failed to load cart", isLoading: false, items: [] });
      }
    },

    /**
     * (อัปเดต) 2. เพิ่มของลงตะกร้า (ผ่าน API)
     * (product = คือ ItemPublic ที่เราได้มาจากหน้า Storefront)
     */
    addItem: async (product, qty = 1) => {
      set({ error: null });
      const sellId = product.Sell_ID || product.id; // 👈 (รองรับทั้ง 2 ชื่อ)

      if (!sellId) {
        console.error("addItem: product has no Sell_ID or id", product);
        return;
      }
      
      try {
        // 👈 API: POST /cart/
        const res = await api.post("/cart/", { 
          Sell_ID: sellId, 
          Quantity: qty 
        }); 
        
        // res.data คือ CartRead { User_ID, Sell_ID, Quantity }
        // API ของเราจะ "บวกเพิ่ม" ให้ถ้ามีของอยู่แล้ว
        // เราต้องอัปเดต State ตาม Quantity ที่ API ตอบกลับมา
        
        set((state) => {
          const idx = state.items.findIndex((p) => String(p.id) === String(sellId));
          
          if (idx === -1) {
             // (ถ้าไม่มีของเดิม) แปลง product (ItemPublic) เป็น state ท้องถิ่น
            const newItem = {
              id: sellId,
              name: product.Product_Name || product.name,
              price: product.Price || product.price,
              stock: product.Stock || product.stock,
              image: product.Cover_Image || product.image || "/IMG1/bagG.png",
              qty: res.data.Quantity, // 👈 ใช้ Qty จาก API
            };
            return { items: [...state.items, newItem] };
          } else {
             // (ถ้ามีของเดิม) อัปเดต Qty
            const next = state.items.slice();
            next[idx] = { ...next[idx], qty: res.data.Quantity }; // 👈 ใช้ Qty จาก API
            return { items: next };
          }
        });

      } catch (err) {
        console.error("Failed to add item:", err);
        set({ error: "Failed to add item" });
      }
    },

    /**
     * (อัปเดต) 3. เปลี่ยนจำนวน (ผ่าน API)
     */
    setItemQty: async (sellId, newQty) => {
      set({ error: null });
      
      if (newQty <= 0) {
        // ถ้าจำนวน <= 0 ให้ถือว่าเป็นการลบ
        return get().removeItem(sellId);
      }

      try {
        // 👈 API: PUT /cart/{sell_id}
        const res = await api.put(`/cart/${sellId}`, { 
          Quantity: newQty 
        });
        
        // res.data คือ CartRead { User_ID, Sell_ID, Quantity }
        set((state) => {
          const next = state.items.slice();
          const i = next.findIndex((p) => String(p.id) === String(sellId));
          if (i === -1) return {}; 
          
          next[i] = { ...next[i], qty: res.data.Quantity };
          return { items: next };
        });

      } catch (err) {
        console.error("Failed to set item qty:", err);
        set({ error: "Failed to update quantity" });
      }
    },

    /**
     * (อัปเดต) 4. ลบของ (ผ่าน API)
     */
    removeItem: async (sellId) => {
      set({ error: null });
      try {
        // 👈 API: DELETE /cart/{sell_id}
        await api.delete(`/cart/${sellId}`);
        
        // ลบออกจาก State
        set((state) => ({
          items: state.items.filter((p) => String(p.id) !== String(sellId)),
        }));

      } catch (err) {
        console.error("Failed to remove item:", err);
        set({ error: "Failed to remove item" });
      }
    },

    /**
     * (เหมือนเดิม) 5. ล้างตะกร้า (ใน State)
     * (เราจะเรียกอันนี้ ตอนที่ 'POST /orders/checkout' สำเร็จ)
     */
    clearCart: () => set({ items: [] }),
    
  }))
);