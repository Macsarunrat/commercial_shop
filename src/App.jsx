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
        path: "shop",
        element: <Shop />,
      },
      {
        path: "mainshop/:categoryId",
        element: <MainShopUI />,
      },
      {
        path: "allshop",
        element: <AllShopUI />,
      },
      {
        path: "ordered",
        element: <Ordered />,
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
]);

const App = () => {
  return (
    <>
      <RouterProvider router={router} />
    </>
  );
};

export default App;
