// src/stores/cartStore.jsx
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import api from "../api.js";

const withDevtools = (fn) =>
  typeof window !== "undefined" ? devtools(fn, { name: "cart-store" }) : fn;

function mapApiItemToLocal(row) {
  const it = row?.ItemDetails ?? row?.item ?? null;
  if (!it) return null;
  const toNum = (v) => Number(String(v ?? "0").replace(/,/g, "")) || 0;
  return {
    id: it.Sell_ID ?? it.sell_id ?? it.id,
    name: it.Product_Name ?? it.name ?? "Unnamed",
    price: toNum(it.Price ?? it.price),
    stock: toNum(it.Stock ?? it.stock),
    image: it.Cover_Image ?? it.image ?? "/IMG1/bagG.png",
    qty: toNum(row?.Quantity ?? row?.qty),
    ShopId: it.Shop_ID ?? it.shop_id ?? null, // เก็บไว้ถ้ามี
  };
}

const useCartStore = create(
  withDevtools((set, get) => ({
    // ----- STATE -----
    items: [],
    isLoading: false,
    error: null,

    // แผนที่จาก Sell_ID -> { shopId, shopName }
    // เก็บเป็น object ธรรมดาเพื่อ serialize ง่าย
    sellToShopMap: {},

    // ----- SELECTORS -----
    cartCount: () => get().items.reduce((n, it) => n + (it.qty || 0), 0),
    totalQuantity: () => get().items.reduce((n, it) => n + (it.qty || 0), 0),
    cartTotal: () =>
      get().items.reduce((sum, it) => sum + (it.price || 0) * (it.qty || 0), 0),

    // หาชื่อร้านจาก sellId (ให้หน้า Ordered ใช้)
    getShopNameBySellId: (sellId) => {
      const m = get().sellToShopMap || {};
      const rec = m[String(sellId)];
      return rec?.shopName || null;
    },
    getShopIdBySellId: (sellId) => {
      const m = get().sellToShopMap || {};
      const rec = m[String(sellId)];
      return rec?.shopId || null;
    },

    // ----- ACTIONS -----

    /** โหลดตะกร้า */
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

    /** เพิ่มสินค้า */
    addItem: async (product, qty = 1) => {
      const sellId =
        product?.Sell_ID ?? product?.sellId ?? product?.id ?? product?.sell_id;
      if (!sellId) {
        console.warn("addItem: missing Sell_ID", product);
        return;
      }
      try {
        await api.post("/cart/", {
          Sell_ID: Number(sellId),
          Quantity: Number(qty),
        });
        set((state) => {
          const idx = state.items.findIndex(
            (p) => String(p.id) === String(sellId)
          );
          if (idx === -1) {
            const toNum = (v) =>
              Number(String(v ?? "0").replace(/,/g, "")) || 0;
            return {
              items: [
                ...state.items,
                {
                  id: sellId,
                  name: product?.Product_Name ?? product?.name ?? "Unnamed",
                  price: toNum(product?.Price ?? product?.price),
                  stock: toNum(product?.Stock ?? product?.stock),
                  image:
                    product?.Cover_Image ?? product?.image ?? "/IMG1/bagG.png",
                  qty: Number(qty),
                  ShopId: product?.Shop_ID ?? product?.shop_id ?? null,
                },
              ],
            };
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
      }
    },

    /** เปลี่ยนจำนวน */
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

    /** ลบรายการ */
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

    /** เคลียร์ตะกร้าใน state */
    clearCart: () => set({ items: [] }),

    /**
     * โหลดแผนที่ Sell_ID -> { shopId, shopName } จาก /store/products
     * ถ้าอยากโหลดเฉพาะครั้งแรก ให้เรียกก่อนเข้า Ordered.jsx
     */
    loadSellToShopMap: async () => {
      try {
        const res = await api.get("/store/products");
        const list = Array.isArray(res.data) ? res.data : res.data?.items ?? [];
        const map = {};
        for (const p of list) {
          const sellId = p.Sell_ID ?? p.sell_id ?? p.id;
          if (sellId == null) continue;
          const shopId = p.Shop_ID ?? p.shop_id ?? null;
          const shopName =
            p.Shop_Name ?? p.shop_name ?? (shopId ? `Shop #${shopId}` : null);
          map[String(sellId)] = {
            shopId: shopId != null ? String(shopId) : null,
            shopName: shopName || null,
          };
        }
        set({ sellToShopMap: map });
      } catch (e) {
        console.error("loadSellToShopMap failed:", e);
      }
    },
  }))
);

export default useCartStore;
