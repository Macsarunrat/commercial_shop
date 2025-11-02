import * as React from "react";
import {
  ToggleButton,
  ToggleButtonGroup,
  Button,
  Menu,
  MenuItem,
  Box,
  Typography,
} from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import AppTheme from "../theme/AppTheme";

export default function ButtonSort({ onSortChange }) {
  // --- Toggle: Popular / Latest / Top Sales ---
  const [view, setView] = React.useState("");
  const handleChange1 = (_e, nextView) => {
    if (nextView !== null) {
      setView(nextView);
      onSortChange?.({ type: "preset", value: nextView });
    }
  };

  const btnSx = {
    maxWidth: 200,
    borderRadius: 0,
    bgcolor: "common.white",
    color: "text.primary",
    borderColor: "divider",
    "&:hover": { bgcolor: "grey.100" },
    "&.Mui-selected": {
      bgcolor: "primary.main",
      color: "primary.contrastText",
      "&:hover": { bgcolor: "primary.dark" },
    },
  };

  // --- Price dropdown ---
  const [priceOrder, setPriceOrder] = React.useState(undefined); // 'asc' | 'desc' | undefined
  const [anchorEl, setAnchorEl] = React.useState(null);
  const priceOpen = Boolean(anchorEl);

  const handleOpenPrice = (e) => setAnchorEl(e.currentTarget);
  const handleClosePrice = () => setAnchorEl(null);

  const choosePrice = (order) => {
    setPriceOrder(order);
    onSortChange?.({ type: "price", value: order });
    handleClosePrice();
  };

  const priceLabel =
    priceOrder === "asc"
      ? "Price: Low to High"
      : priceOrder === "desc"
      ? "Price: High to Low"
      : "Price";

  return (
    <AppTheme>
      <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
        <ToggleButtonGroup
          orientation="horizontal"
          value={view}
          exclusive
          onChange={handleChange1}
          sx={{ gap: 3 }}
        >
          <ToggleButton value="one" sx={btnSx}>
            <Typography sx={{ color: "inherit" }}>Popular</Typography>
          </ToggleButton>
          <ToggleButton value="two" sx={btnSx}>
            <Typography sx={{ color: "inherit" }}>Latest</Typography>
          </ToggleButton>
          <ToggleButton value="three" sx={btnSx}>
            <Typography sx={{ color: "inherit" }}>Top Sales</Typography>
          </ToggleButton>
        </ToggleButtonGroup>

        {/* Price dropdown */}
        <Box>
          <Button
            variant="outlined"
            color="inherit"
            onClick={handleOpenPrice}
            endIcon={<KeyboardArrowDownIcon />}
            aria-controls={priceOpen ? "price-menu" : undefined}
            aria-haspopup="menu"
            aria-expanded={priceOpen ? "true" : undefined}
            sx={{
              textTransform: "none",
              px: 2,
              minWidth: 200,
              minHeight: 45,
              justifyContent: "space-between",
              borderRadius: 0,
              bgcolor: "white",
              fontSize: 16,

              // >>> เปลี่ยนสีตามสถานะเลือก
              color: priceOrder ? "primary.main" : "text.primary",
              borderColor: priceOrder ? "primary.main" : "divider",
              "&:hover": {
                borderColor: priceOrder ? "primary.main" : "text.secondary",
                bgcolor: "grey.50",
              },
            }}
          >
            {priceLabel}
          </Button>

          <Menu
            id="price-menu"
            anchorEl={anchorEl}
            open={priceOpen}
            onClose={handleClosePrice}
            anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
            transformOrigin={{ vertical: "top", horizontal: "left" }}
          >
            <MenuItem
              dense
              selected={priceOrder === "asc"}
              onClick={() => choosePrice("asc")}
              sx={{
                minWidth: 200,
                minHeight: 50,
                "&.Mui-selected": {
                  color: "primary.main",
                  bgcolor: "action.selected",
                },
                "&.Mui-selected:hover": { bgcolor: "action.selected" },
              }}
            >
              Price: Low to High
            </MenuItem>
            <MenuItem
              dense
              selected={priceOrder === "desc"}
              onClick={() => choosePrice("desc")}
              sx={{
                minWidth: 200,
                minHeight: 50,
                "&.Mui-selected": {
                  color: "primary.main",
                  bgcolor: "action.selected",
                },
                "&.Mui-selected:hover": { bgcolor: "action.selected" },
              }}
            >
              Price: High to Low
            </MenuItem>
          </Menu>
        </Box>
      </Box>
    </AppTheme>
  );
}
