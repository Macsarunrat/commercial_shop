import React from "react"; // 👈 1. เพิ่ม import 'React'
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import Nav from "./nav/Nav";
import OpenStore from "./component/OpenStore.jsx";
import Home from "./component/Home.jsx";
import Shop from "./component/Shop.jsx";
import Login from "./userlogin/Login.jsx";
import Cart from "./cart/Cart.jsx";
import AllCategories2 from "./categorylayout/AllCategories2.jsx";
import MoreAllCategories from "./categorylayout/MoreAllCategories.jsx";
import CategoryShopId from "./categorylayout/CategoryShopId.jsx";
import MainShopUI from "./shopui/MainShopUI.jsx";
import AllShopUI from "./shopui/AllShopUI.jsx";
import ShopIcon from "./shopui/ShopIcon.jsx";
import RegisterMain from "./userlogin/RegisterMain.jsx";
import Ordered from "./component/Ordered.jsx";
import StoreShowUI from "./shopui/StoreShowUI.jsx";
import SearchItem from "./Search/SearchItem.jsx";
import CategoryById from "./categorylayout/CategoryById.jsx";

// 2. 🔽 --- เพิ่ม 3 บรรทัดนี้ --- 🔽
import { useEffect } from "react";
import { useAuthStore } from "./stores/authStore.jsx";
import { useCartStore } from "./stores/cartStore.jsx";

const router = createBrowserRouter([
  // ... (โค้ด router เดิมของคุณ) ...
  {
    path: "/",
    element: <Nav />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "openstore",
        element: <OpenStore />,
      },
      {
        path: "categoryitems/:id",
        element: <CategoryShopId />,
      },
      {
        path: "allshop",
        element: <Shop />,
      },
      {
        path: "mainshop/:sellId",
        element: <MainShopUI />,
      },
      {
        path: "/shop/:shopId",
        element: <StoreShowUI />,
      },
      {
        path: "ordered",
        element: <Ordered />,
      },
      {
        path: "search",
        element: <SearchItem />,
      },
      { path: "/", element: <Home /> },
      { path: "openstore", element: <OpenStore /> },
      { path: "categoryitems/:id", element: <CategoryShopId /> },
      { path: "allshop", element: <Shop /> },
      { path: "mainshop/:categoryId", element: <MainShopUI /> },
      { path: "/shop/:shopId", element: <StoreShowUI /> },
      { path: "ordered", element: <Ordered /> },
      { path: "search", element: <SearchItem /> },
    ],
  },
  {
    path: "register",
    element: <RegisterMain />,
  },
  {
    path: "login",
    element: <Login />,
  },
  {
    path: "cart",
    element: <Cart />,
  },
  // ... (โค้ด router ที่เหลือ)
]);

const App = () => {
  // 3. 🔽 --- เพิ่มโค้ดส่วนนี้ --- 🔽
  // ดึง "สถานะ Login" จาก authStore
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());
  // ดึง "action" จาก cartStore
  const fetchCart = useCartStore((state) => state.fetchCart);
  const clearCart = useCartStore((state) => state.clearCart);

  useEffect(() => {
    // ⭐️ นี่คือ "ผู้สั่งการ" ⭐️
    if (isAuthenticated) {
      // ถ้า Login (หรือมี Token ค้างอยู่)
      console.log("App.jsx: User is authenticated. Fetching cart...");
      fetchCart(); // 👈 ให้ไปดึงตะกร้าจาก DB
    } else {
      // ถ้า Logout
      console.log("App.jsx: User is not authenticated. Clearing local cart.");
      clearCart(); // 👈 ให้ล้างตะกร้าใน State
    }
  }, [isAuthenticated, fetchCart, clearCart]); // 👈 (ให้ useEffect ทำงานทุกครั้งที่สถานะ Login เปลี่ยน)
  // -----------------------------

  return (
    <>
      <RouterProvider router={router} />
    </>
  );
};

export default App;
