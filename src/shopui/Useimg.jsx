import React from "react";
import Addimg from "../shopui/Addimg.jsx";
import { Stack } from "@mui/material";

const Useimg = () => {
  return (
    <>
      <Stack direction="row" spacing={2}>
        {/* ปุ่มอื่น ๆ ของคุณ */}
        <Addimg
          onUploaded={({ productId, uploaded, failed }) => {
            console.log(
              "uploaded for product:",
              productId,
              "ok:",
              uploaded,
              "failed:",
              failed
            );
            // TODO: รีโหลดรายการรูป/สินค้า
          }}
        />
      </Stack>
    </>
  );
};

export default Useimg;
