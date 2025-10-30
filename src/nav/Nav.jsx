import React from "react";
import { Outlet } from "react-router-dom";
import Bar from "../nav/component/Bar";
import Banner from "../nav/component/Bannner";

const Nav = () => {
  return (
    <div>
      <Bar />
      <Banner />
      <Outlet />
    </div>
  );
};

export default Nav;
