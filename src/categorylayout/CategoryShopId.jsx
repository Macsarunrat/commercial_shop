import * as React from "react";
import Box from "@mui/material/Box";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import ViewListIcon from "@mui/icons-material/ViewList";
import { Button, Icon, Typography } from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import IconButton from "@mui/material/IconButton";
import { useState } from "react";
import Stack from "@mui/material/Stack";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import CategoryById from "./CategoryById";
import AppTheme from "../theme/AppTheme";
import ButtonSort from "../ObjectDetailCategory/ButtonSort";
import { Link } from "react-router-dom";

const List = [
  { id: 1, name: "Adidas" },
  { id: 2, name: "Nike" },
  { id: 3, name: "Pepo" },
  { id: 4, name: "Koko" },
];

//

const handleBrand = () => {
  const [name, setName] = useState("");
};

export default function CategoryShop() {
  const [view, setView] = React.useState("module");

  const handleChange = (_e, nextView) => {
    // exclusive: ถ้ากดซ้ำจะได้ null — กันไม่ให้เป็น null
    if (nextView == null) setView(nextView);
  };

  //เช็คจำนวน brand ที่จะแสดงปุ่ม More / Less
  const [expanded, setExpanded] = React.useState(false);

  const hasMore = List.length > 2;
  const visible = expanded ? List : List.slice(0, 2);
  //

  return (
    <AppTheme>
      <Box
        sx={{
          display: "flex",
          gap: 2,
          pt: 5,
          border: "1px dashed",
          pb: 5,
          mx: 20,
        }}
      >
        {/* Toggle Btn + Brand , Fetch ชื่อมาแสดง */}
        <Box
          sx={{
            flexDirection: "column",
            pt: 8,
            minWidth: 150,
          }}
        >
          <Box sx={{ display: "flex", gap: 1, pt: 1 }}>
            <ToggleButtonGroup
              orientation="vertical"
              value={view}
              exclusive
              onChange={handleChange}
              size="small"
            >
              <ToggleButton
                value="list"
                aria-label="list"
                component={Link}
                to={"/5columncategories"}
              >
                <ViewListIcon />
              </ToggleButton>
            </ToggleButtonGroup>
            <Typography
              sx={{
                mt: { xs: 0, md: 0, lg: 1 },
              }}
            >
              All Categories
            </Typography>
          </Box>

          <Box sx={{ display: "flex", fontSize: 16 }}>
            <IconButton sx={{ pt: 1.5 }}>
              <PlayArrowIcon sx={{ fontSize: 16 }} />
            </IconButton>
            <Typography sx={{ pt: 1 }}>Brand</Typography>
          </Box>
          <Stack direction="column" spacing={0.2} paddingLeft={3.2}>
            {visible.map((item) => (
              <Button
                key={item.id}
                size="small"
                onClick={() => console.log("select:", item.name)}
                sx={{
                  objectFit: "cover",
                  color: "black",
                  justifyContent: "flex-start",
                }}
              >
                {item.name}
              </Button>
            ))}
            {!expanded && hasMore && (
              <Button
                size="small"
                onClick={() => setExpanded(true)}
                sx={{ justifyContent: "flex-start", color: "black" }}
              >
                More <KeyboardArrowDownIcon />
              </Button>
            )}
          </Stack>
        </Box>
        {/* Toggle Btn + Brand , Fetch ชื่อมาแสดง */}

        {/* พื้นที่โชว์สินค้าตาม Grid Layout */}
        <Box
          sx={{
            border: "1px dashed",
            mt: 2,
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start", // ← ชิดซ้ายทุกบล็อกลูก
            gap: 2,
            px: 0, // ไม่มี padding ซ้าย/ขวา
          }}
        >
          {/* แถบเลือก Sort by */}
          <Box sx={{ display: "flex", gap: 2, pl: 8 }}>
            <Typography sx={{ pt: 1.4, fontSize: 16 }}>Sort by</Typography>

            <Stack>
              <ButtonSort />
            </Stack>
          </Box>
          {/* แถบเลือก Sort by */}

          {/* Grid Layout Show สินค้า */}
          <CategoryById />
        </Box>
      </Box>
    </AppTheme>
  );
}
