import React from "react";
import History from "../orderlayout/history";
import CheckOut from "../orderlayout/CheckOut";
import Box from "@mui/material/Grid";
import Grid from "@mui/material/Box";

const Ordered = () => {
  return (
    <>
      <Box>
        <Grid>
          <CheckOut />
        </Grid>
      </Box>
    </>
  );
};

export default Ordered;
