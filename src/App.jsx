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
import Help from "./component/Help.jsx";

import { useEffect } from "react";
import { useAuthStore } from "./stores/authStore.jsx";
import useCartStore from "./stores/cartStore";

const router = createBrowserRouter([
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
      {
        path: "help",
        element: <Help />,
      },
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

const App = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());
  const fetchCart = useCartStore((state) => state.fetchCart);
  const clearCart = useCartStore((state) => state.clearCart);

  useEffect(() => {
    if (isAuthenticated) {
      console.log("App.jsx: User is authenticated. Fetching cart...");
      fetchCart();
    } else {
      console.log("App.jsx: User is not authenticated. Clearing local cart.");
      clearCart();
    }
  }, [isAuthenticated, fetchCart, clearCart]);

  return (
    <>
      <RouterProvider router={router} />
    </>
  );
};

export default App;
