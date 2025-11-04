import { create } from "zustand";
import { devtools } from "zustand/middleware";
import api from "../api.js";

const withDevtools = (fn) =>
  typeof window !== "undefined" ? devtools(fn, { name: "cart-store" }) : fn;

const mapApiItemToLocal = (apiItem) => {
  if (!apiItem || !apiItem.ItemDetails) {
    console.error("Invalid API item structure:", apiItem);
    return null;
  }
  return {
    id: apiItem.ItemDetails.Sell_ID,
    name: apiItem.ItemDetails.Product_Name,
    price: apiItem.ItemDetails.Price,
    stock: apiItem.ItemDetails.Stock,
    image: apiItem.ItemDetails.Cover_Image || "/IMG1/bagG.png",
    qty: apiItem.Quantity,
    shopId: apiItem.ItemDetails.Shop_ID, // (เพิ่ม ShopID ไว้ด้วย)
  };
};

export const useCartStore = create(
  withDevtools((set, get) => ({
    // --- STATE ---
    items: [],
    isLoading: true,
    error: null,

    // --- (ลบ Selectors ออกจาก State) ---
    // cartCount: () => ...
    // cartTotal: () => ...

    // --- ACTIONS ---
    fetchCart: async () => {
      set({ isLoading: true, error: null });
      try {
        const res = await api.get("/cart/");
        const localItems = res.data.map(mapApiItemToLocal).filter(Boolean);
        set({ items: localItems, isLoading: false });
        console.log("CartStore: Fetched cart from DB", localItems);
      } catch (err) {
        console.error("Failed to fetch cart:", err);
        set({ error: "Failed to load cart", isLoading: false, items: [] });
      }
    },

    addItem: async (product, qty = 1) => {
      set({ error: null });
      // (รองรับ Product Object ได้หลายรูปแบบ)
      const sellId = product.sellId || product.Sell_ID || product.id; 

      if (!sellId) {
        console.error("addItem: product has no Sell_ID or id", product);
        return;
      }
      
      try {
        const res = await api.post("/cart/", {
          Sell_ID: sellId,
          Quantity: qty,
        });
        
        set((state) => {
          const idx = state.items.findIndex((p) => String(p.id) === String(sellId));
          
          if (idx === -1) {
            // (สร้าง Item ใหม่จากข้อมูล Product)
            const newItem = {
              id: sellId,
              name: product.name || product.Product_Name,
              price: product.price || product.Price,
              stock: product.stock || product.Stock,
              image: product.image || product.Cover_Image || "/IMG1/bagG.png",
              qty: res.data.Quantity,
              shopId: product.shopId || product.Shop_ID,
            };
            return { items: [...state.items, newItem] };
          } else {
            // (อัปเดต Qty)
            const next = state.items.slice();
            next[idx] = { ...next[idx], qty: res.data.Quantity };
            return { items: next };
          }
        });
      } catch (err) {
        console.error("Failed to add item:", err);
        set({ error: "Failed to add item" });
      }
    },

    setItemQty: async (sellId, newQty) => {
      set({ error: null });
      
      if (newQty <= 0) {
        return get().removeItem(sellId);
      }

      try {
        const res = await api.put(`/cart/${sellId}`, {
          Quantity: newQty,
        });
        
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

    removeItem: async (sellId) => {
      set({ error: null });
      try {
        await api.delete(`/cart/${sellId}`);
        
        set((state) => ({
          items: state.items.filter((p) => String(p.id) !== String(sellId)),
        }));
      } catch (err) {
        console.error("Failed to remove item:", err);
        set({ error: "Failed to remove item" });
      }
    },

    clearCart: () => set({ items: [] }),
  }))
);
