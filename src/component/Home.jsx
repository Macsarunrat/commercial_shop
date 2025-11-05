import React from "react";
import BarHome from "../homelayout/BarHome";
import NewProductHome from "../homelayout/NewProductHome";
import CategoryHome from "../categorylayout/CategoryHome";

const Home = () => {
  return (
    <div className="">
      <BarHome />
      <NewProductHome limit={6} showSeeAllText={true} />
      <CategoryHome />
    </div>
  );
};

export default Home;
