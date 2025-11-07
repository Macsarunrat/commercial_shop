// src/ObjectDetailCategory/SortButtonList.jsx
import * as React from "react";
import { Button, Menu, MenuItem } from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

export default function SortButtonList({
  value = null,
  onChange,
  label = "Choose",
  disabled = false,
  size = "small",
  fullWidth = false,
}) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const currentLabel =
    value === "priceAsc"
      ? "Low to High"
      : value === "priceDesc"
      ? "High to Low"
      : "Price";

  const handleOpen = (e) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleSelect = (val) => {
    onChange?.(val);
    handleClose();
  };

  return (
    <>
      <Button
        size={size}
        variant="outlined"
        onClick={handleOpen}
        endIcon={<KeyboardArrowDownIcon />}
        aria-controls={open ? "sort-price-menu" : undefined}
        aria-haspopup="menu"
        aria-expanded={open ? "true" : undefined}
        disabled={disabled}
        fullWidth={fullWidth}
        sx={{
          textTransform: "none",
          px: 2,
          minHeight: 40,
          minWidth: 200,
          justifyContent: "space-between",
          borderRadius: 0,
          bgcolor: "white",
          fontSize: 16,
          color: value ? "primary.main" : "text.primary",
          borderColor: value ? "primary.main" : "divider",
          "&:hover": {
            borderColor: value ? "primary.main" : "text.secondary",
            bgcolor: "grey.50",
          },
        }}
      >
        {label}: {currentLabel}
      </Button>

      <Menu
        id="sort-price-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
      >
        <MenuItem
          selected={value === "priceAsc"}
          onClick={() => handleSelect("priceAsc")}
          sx={{
            minWidth: 200,
            minHeight: 44,
            "&.Mui-selected": {
              color: "primary.main",
              bgcolor: "action.selected",
            },
            "&.Mui-selected:hover": { bgcolor: "action.selected" },
          }}
        >
          Low to High
        </MenuItem>
        <MenuItem
          selected={value === "priceDesc"}
          onClick={() => handleSelect("priceDesc")}
          sx={{
            minWidth: 200,
            minHeight: 44,
            "&.Mui-selected": {
              color: "primary.main",
              bgcolor: "action.selected",
            },
            "&.Mui-selected:hover": { bgcolor: "action.selected" },
          }}
        >
          High to Low
        </MenuItem>
      </Menu>
    </>
  );
}
