import React from "react";
import Nav from "./nav/Nav";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
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
        path: "mainshop/:categoryId",
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
  {
    path: "columncategories",
    element: <AllCategories2 />,
  },
  {
    path: "5columncategories",
    element: <MoreAllCategories />,
  },
  {
    path: "shopicon",
    element: <ShopIcon />,
  },
  {
    path: "cate2",
    element: <CategoryById />,
  },
]);

const App = () => {
  return (
    <>
      <RouterProvider router={router} />
    </>
  );
};

export default App;
