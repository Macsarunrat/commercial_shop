import React from "react";
import BarHome from "../homelayout/BarHome";
import NewProductHome from "../homelayout/NewProductHome";
import CategoryHome from "../categorylayout/CategoryHome";

const Home = () => {
  return (
    <div className="">
      <BarHome />
      <NewProductHome />
      <CategoryHome />
    </div>
  );
};

export default Home;
