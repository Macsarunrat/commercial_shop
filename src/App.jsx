// import React from "react";
// import { RouterProvider, createBrowserRouter } from "react-router-dom";
// import Nav from "./nav/Nav";
// import OpenStore from "./component/OpenStore.jsx";
// import Home from "./component/Home.jsx";
// import Shop from "./component/Shop.jsx";
// import Login from "./userlogin/Login.jsx";
// import Cart from "./cart/Cart.jsx";
// import AllCategories2 from "./categorylayout/AllCategories2.jsx";
// import MoreAllCategories from "./categorylayout/MoreAllCategories.jsx";
// import CategoryShopId from "./categorylayout/CategoryShopId.jsx";
// import MainShopUI from "./shopui/MainShopUI.jsx";
// import AllShopUI from "./shopui/AllShopUI.jsx";
// import ShopIcon from "./shopui/ShopIcon.jsx";
// import RegisterMain from "./userlogin/RegisterMain.jsx";
// import Ordered from "./component/Ordered.jsx";
// import StoreShowUI from "./shopui/StoreShowUI.jsx";
// import SearchItem from "./Search/SearchItem.jsx";
// import CategoryById from "./categorylayout/CategoryById.jsx";
// import Help from "./component/Help.jsx";
// import NewProductHome from "./homelayout/NewProductHome.jsx";
// import OpenShop from "./manageshop/OpenShop.jsx";
// import AddShopItem from "./manageshop/AddShopItem.jsx";
// import Myorder from "./manageshop/Myorder.jsx";
// import ShopAddressCom from "./manageshop/AddressCom.jsx";

// import { useEffect } from "react";
// import { useAuthStore } from "./stores/authStore.jsx";
// import useCartStore from "./stores/cartStore";

// const router = createBrowserRouter([
//   {
//     path: "/",
//     element: <Nav />,
//     children: [
//       {
//         path: "/",
//         element: <Home />,
//       },
//       {
//         path: "openstore",
//         element: <OpenShop />,
//       },
//       {
//         path: "categoryitems/:id",
//         element: <CategoryShopId />,
//       },

//       {
//         path: "allsh",
//         element: <AllShopUI />, // แสดงทุกร้าน
//       },
//       {
//         path: "mainshop/:sellId",
//         element: <MainShopUI />,
//       },
//       {
//         path: "/shop/:shopId",
//         element: <StoreShowUI />,
//       },
//       {
//         path: "ordered",
//         element: <Ordered />,
//       },
//       {
//         path: "search",
//         element: <SearchItem />,
//       },
//       {
//         path: "help",
//         element: <Help />,
//       },
//       {
//         path: "allproducts",
//         element: <NewProductHome />,
//       },
//       {
//         path: "myshop",
//         element: <OpenShop />,
//       },
//       {
//         path: "manage",
//         element: <AddShopItem />,
//       },
//       {
//         path: "shop-orders",
//         element: <Myorder />,
//       },
//     ],
//   },
//   {
//     path: "register",
//     element: <RegisterMain />,
//   },
//   {
//     path: "login",
//     element: <Login />,
//   },
//   {
//     path: "cart",
//     element: <Cart />,
//   },
//   {
//     path: "/shopicon/:id",
//     element: <ShopIcon />,
//   },
//   {
//     path: "address",
//     element: <ShopAddressCom />,
//   },
// ]);

// const App = () => {
//   const isAuthenticated = useAuthStore((state) => state.isAuthenticated());
//   const fetchCart = useCartStore((state) => state.fetchCart);
//   const clearCart = useCartStore((state) => state.clearCart);

//   useEffect(() => {
//     if (isAuthenticated) {
//       console.log("App.jsx: User is authenticated. Fetching cart...");
//       fetchCart();
//     } else {
//       console.log("App.jsx: User is not authenticated. Clearing local cart.");
//       clearCart();
//     }
//   }, [isAuthenticated, fetchCart, clearCart]);

//   return (
//     <>
//       <RouterProvider router={router} />
//     </>
//   );
// };

// export default App;

// App.jsx
import React, { useEffect } from "react";
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
import Help from "./component/Help.jsx";
import NewProductHome from "./homelayout/NewProductHome.jsx";
import OpenShop from "./manageshop/OpenShop.jsx";
import AddShopItem from "./manageshop/AddShopItem.jsx";
import Myorder from "./manageshop/Myorder.jsx";
import ShopAddressCom from "./manageshop/AddressCom.jsx";

import ProtectedRoute from "./nav/ProtectedRoute.jsx"; // ⬅️ เพิ่มอันนี้
import { useAuthStore } from "./stores/authStore.jsx";
import useCartStore from "./stores/cartStore";
import Useimg from "./shopui/Useimg.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Nav />,
    children: [
      // ---------- public routes ----------
      { path: "/", element: <Home /> },
      { path: "categoryitems/:id", element: <CategoryShopId /> },
      { path: "allsh", element: <AllShopUI /> },
      { path: "mainshop/:sellId", element: <MainShopUI /> },
      { path: "/shop/:shopId", element: <StoreShowUI /> },
      { path: "search", element: <SearchItem /> },
      { path: "help", element: <Help /> },
      { path: "allproducts", element: <NewProductHome /> },

      // ---------- protected routes ----------
      {
        element: <ProtectedRoute />, //ครอบกลุ่มที่ต้องล็อกอิน
        children: [
          { path: "myshop", element: <OpenShop /> },
          { path: "manage", element: <AddShopItem /> },
          { path: "shop-orders", element: <Myorder /> },
          { path: "address", element: <ShopAddressCom /> },
          { path: "ordered", element: <Ordered /> },
          // ถ้าต้องการให้ /cart ต้องล็อกอินด้วย ให้ย้ายมาที่นี่:
          // { path: "cart", element: <Cart /> },
        ],
      },
    ],
  },

  // ---------- auth / misc (public) ----------
  { path: "register", element: <RegisterMain /> },
  { path: "login", element: <Login /> },

  // ถ้า /cart เป็น public ก็ปล่อยไว้ข้างนอกได้
  { path: "cart", element: <Cart /> },

  { path: "/shopicon/:id", element: <ShopIcon /> },
  { path: "5columncategories", element: <MoreAllCategories /> },

  { path: "Addimg", element: <Useimg /> },
]);

const App = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated());
  const fetchCart = useCartStore((s) => s.fetchCart);
  const clearCart = useCartStore((s) => s.clearCart);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    } else {
      clearCart();
    }
  }, [isAuthenticated, fetchCart, clearCart]);

  return <RouterProvider router={router} />;
};

export default App;
