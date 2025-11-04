// src/stores/cartStore.jsx
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import api from "../api.js"; // axios instance ที่ใส่ baseURL/headers/token ไว้แล้ว

const withDevtools = (fn) =>
  typeof window !== "undefined" ? devtools(fn, { name: "cart-store" }) : fn;

/** map payload จาก API -> โครงสร้าง state ภายใน */
function mapApiItemToLocal(row) {
  // รองรับทั้งรูปแบบ { Quantity, ItemDetails: {...} } และ fallback ง่าย ๆ
  const it = row?.ItemDetails ?? row?.item ?? null;
  if (!it) return null;

  const toNum = (v) => Number(String(v ?? "0").replace(/,/g, "")) || 0;

  return {
    id: it.Sell_ID ?? it.sell_id ?? it.id, // เก็บเป็น Sell_ID
    name: it.Product_Name ?? it.name ?? "Unnamed",
    price: toNum(it.Price ?? it.price),
    stock: toNum(it.Stock ?? it.stock),
    image: it.Cover_Image ?? it.image ?? "/IMG1/bagG.png",
    qty: toNum(row?.Quantity ?? row?.qty),
  };
}

const useCartStore = create(
  withDevtools((set, get) => ({
    // ----- STATE -----
    items: [], // [{id, name, price, stock, image, qty}]
    isLoading: false,
    error: null,

    // ----- SELECTORS -----
    cartCount: () => get().items.reduce((n, it) => n + (it.qty || 0), 0),
    totalQuantity: () => get().items.reduce((n, it) => n + (it.qty || 0), 0),
    cartTotal: () =>
      get().items.reduce((sum, it) => sum + (it.price || 0) * (it.qty || 0), 0),

    // ----- ACTIONS (CRUD กับ backend) -----

    /** GET /cart/ : ดึงตะกร้าจากเซิร์ฟเวอร์มาใส่ state */
    fetchCart: async () => {
      set({ isLoading: true, error: null });
      try {
        const res = await api.get("/cart/");
        const raw = Array.isArray(res.data) ? res.data : res.data?.items ?? [];
        const mapped = raw.map(mapApiItemToLocal).filter(Boolean);
        set({ items: mapped, isLoading: false });
      } catch (e) {
        console.error("fetchCart failed:", e);
        set({ items: [], isLoading: false, error: "Failed to load cart" });
      }
    },

    /**
     * POST /cart/ : เพิ่มสินค้าลงตะกร้า
     * product: อาจมาจากหลายแหล่ง ให้พยายามอ่าน Sell_ID ให้ได้
     */
    addItem: async (product, qty = 1) => {
      const sellId =
        product?.Sell_ID ?? product?.sellId ?? product?.id ?? product?.sell_id;
      if (!sellId) {
        console.warn("addItem: missing Sell_ID", product);
        return;
      }

      try {
        await api.post("/cart/", {
          // ตาม Swagger: ต้องใช้ PascalCase
          Sell_ID: Number(sellId),
          Quantity: Number(qty),
        });

        // optimistic update
        set((state) => {
          const idx = state.items.findIndex(
            (p) => String(p.id) === String(sellId)
          );
          if (idx === -1) {
            const toNum = (v) =>
              Number(String(v ?? "0").replace(/,/g, "")) || 0;
            const next = [
              ...state.items,
              {
                id: sellId,
                name: product?.Product_Name ?? product?.name ?? "Unnamed",
                price: toNum(product?.Price ?? product?.price),
                stock: toNum(product?.Stock ?? product?.stock),
                image:
                  product?.Cover_Image ?? product?.image ?? "/IMG1/bagG.png",
                qty: Number(qty),
              },
            ];
            return { items: next };
          } else {
            const next = state.items.slice();
            next[idx] = {
              ...next[idx],
              qty: (next[idx].qty || 0) + Number(qty),
            };
            return { items: next };
          }
        });
      } catch (e) {
        console.error("addItem failed:", e);
        // ถ้าต้อง rollback ให้ fetchCart() อีกครั้งได้
      }
    },

    /** PUT /cart/{sell_id} : เปลี่ยนจำนวน */
    setItemQty: async (sellId, newQty) => {
      if (!sellId) return;
      if (newQty <= 0) return get().removeItem(sellId);

      try {
        await api.put(`/cart/${sellId}`, { Quantity: Number(newQty) });
        set((state) => {
          const next = state.items.slice();
          const i = next.findIndex((p) => String(p.id) === String(sellId));
          if (i !== -1) next[i] = { ...next[i], qty: Number(newQty) };
          return { items: next };
        });
      } catch (e) {
        console.error("setItemQty failed:", e);
      }
    },

    /** DELETE /cart/{sell_id} : ลบรายการ */
    removeItem: async (sellId) => {
      if (!sellId) return;
      try {
        await api.delete(`/cart/${sellId}`);
        set((state) => ({
          items: state.items.filter((p) => String(p.id) !== String(sellId)),
        }));
      } catch (e) {
        console.error("removeItem failed:", e);
      }
    },

    /** เคลียร์ตะกร้าใน state (เช่นบน logout หรือหลัง checkout สำเร็จ) */
    clearCart: () => set({ items: [] }),
  }))
);

export default useCartStore;
