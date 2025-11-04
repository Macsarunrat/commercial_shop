import React from "react";
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

import { useEffect } from "react";
import { useAuthStore } from "./stores/authStore.jsx";
import { useCartStore } from "./stores/cartStore.jsx";

// Import หน้าใหม่
import UserAddressPage from "./userprofile/UserAddressPage.jsx"; 

const router = createBrowserRouter([
  {
    path: "/",
    element: <Nav />,
    children: [
      { path: "/", element: <Home /> },
      { path: "openstore", element: <OpenStore /> },
      { path: "categoryitems/:id", element: <CategoryShopId /> },
      { path: "allshop", element: <Shop /> },
      { path: "mainshop/:sellId", element: <MainShopUI /> }, 
      { path: "/shop/:shopId", element: <StoreShowUI /> },
      { path: "ordered", element: <Ordered /> },
      { path: "search", element: <SearchItem /> },
      { path: "my-address", element: <UserAddressPage /> },
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
]);

// ดึง Action ที่เป็นฟังก์ชันแบบคงที่ (Stable)
const { fetchCart, clearCart } = useCartStore.getState();

const App = () => {
  // 
  // --- ⭐️ นี่คือจุดที่แก้ไข Loop ⭐️ ---
  //
  // 1. เลือก "token" (String) ซึ่งเป็นค่าคงที่ (Primitive)
  const token = useAuthStore((state) => state.token);
  // 2. แปลงเป็น boolean (isAuthenticated) ภายใน Component
  const isAuthenticated = !!token;
  // 
  // --- ⭐️ สิ้นสุดจุดที่แก้ไข ⭐️ ---
  //

  useEffect(() => {
    if (isAuthenticated) {
      console.log("App.jsx: User is authenticated. Fetching cart...");
      fetchCart();
    } else {
      console.log("App.jsx: User is not authenticated. Clearing local cart.");
      clearCart();
    }
    // ตอนนี้ useEffect จะขึ้นอยู่กับ boolean (isAuthenticated) ที่คงที่แล้ว
  }, [isAuthenticated]);

  return (
    <>
      <RouterProvider router={router} />
    </>
  );
};

export default App;

