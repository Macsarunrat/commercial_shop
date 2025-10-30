import React from "react";
import Nav from "./nav/Nav";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import Category from "./component/Category.jsx";
import Home from "./component/Home.jsx";
import Shop from "./component/Shop.jsx";

import Register from "./userlogin/Register.jsx";
import Login from "./userlogin/Login.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Nav />,
    children: [
      {
        path: "home",
        element: <Home />,
      },
      {
        path: "category",
        element: <Category />,
      },
      {
        path: "shop",
        element: <Shop />,
      },
    ],
  },
  {
    path: "register",
    element: <Register />,
  },
  {
    path: "login",
    element: <Login />,
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
