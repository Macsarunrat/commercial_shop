// src/cart/Cart.jsx
import React from "react";
import Banner from "../nav/component/Bannner";
import CartMui from "./CartMui";
import AddressUser from "../address/AddressUser";
import { Box, Card, Typography } from "@mui/material";

const Cart = () => {
  const [selectedAddress, setSelectedAddress] = React.useState(null);

  return (
    <div>
      <Banner />
      <Box sx={{ maxWidth: 1200, mx: "auto", mt: 4, px: 2, pb: 6 }}>
        {/* กล่องที่อยู่ผู้ใช้ */}
        <Box sx={{ mb: 3 }}>
          <AddressUser onSelect={(addr) => setSelectedAddress(addr)} />
        </Box>

        {/* ตะกร้า */}
        <CartMui
          canCheckout={!!selectedAddress}
          selectedAddress={selectedAddress}
        />
      </Box>
    </div>
  );
};

export default Cart;
