// import * as React from "react";
// import Box from "@mui/material/Box";
// import ToggleButton from "@mui/material/ToggleButton";
// import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
// import ViewListIcon from "@mui/icons-material/ViewList";
// import { Button, Icon, Typography } from "@mui/material";
// import PlayArrowIcon from "@mui/icons-material/PlayArrow";
// import IconButton from "@mui/material/IconButton";
// import { useState } from "react";
// import Stack from "@mui/material/Stack";
// import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
// import CategoryById from "./CategoryById";
// import AppTheme from "../theme/AppTheme";
// import ButtonSort from "../ObjectDetailCategory/ButtonSort";
// import { Link } from "react-router-dom";

// const List = [
//   { id: 1, name: "Adidas" },
//   { id: 2, name: "Nike" },
//   { id: 3, name: "Pepo" },
//   { id: 4, name: "Koko" },
// ];

// //

// const handleBrand = () => {
//   const [name, setName] = useState("");
// };

// export default function CategoryShop() {
//   const [view, setView] = React.useState("module");

//   const handleChange = (_e, nextView) => {
//     // exclusive: ถ้ากดซ้ำจะได้ null — กันไม่ให้เป็น null
//     if (nextView == null) setView(nextView);
//   };

//   //เช็คจำนวน brand ที่จะแสดงปุ่ม More / Less
//   const [expanded, setExpanded] = React.useState(false);

//   const hasMore = List.length > 2;
//   const visible = expanded ? List : List.slice(0, 2);
//   //

//   return (
//     <AppTheme>
//       <Box
//         sx={{
//           display: "flex",
//           gap: 2,
//           pt: 5,
//           border: "1px dashed",
//           pb: 5,
//           mx: 20,
//         }}
//       >
//         {/* Toggle Btn + Brand , Fetch ชื่อมาแสดง */}
//         <Box
//           sx={{
//             flexDirection: "column",
//             pt: 8,
//             minWidth: 150,
//           }}
//         >
//           <Box sx={{ display: "flex", gap: 1, pt: 1 }}>
//             <ToggleButtonGroup
//               orientation="vertical"
//               value={view}
//               exclusive
//               onChange={handleChange}
//               size="small"
//             >
//               <ToggleButton
//                 value="list"
//                 aria-label="list"
//                 component={Link}
//                 to={"/5columncategories"}
//               >
//                 <ViewListIcon />
//               </ToggleButton>
//             </ToggleButtonGroup>
//             <Typography
//               sx={{
//                 mt: { xs: 0, md: 0, lg: 1 },
//               }}
//             >
//               All Categories
//             </Typography>
//           </Box>

//           <Box sx={{ display: "flex", fontSize: 16 }}>
//             <IconButton sx={{ pt: 1.5 }}>
//               <PlayArrowIcon sx={{ fontSize: 16 }} />
//             </IconButton>
//             <Typography sx={{ pt: 1 }}>Brand</Typography>
//           </Box>
//           <Stack direction="column" spacing={0.2} paddingLeft={3.2}>
//             {visible.map((item) => (
//               <Button
//                 key={item.id}
//                 size="small"
//                 onClick={() => console.log("select:", item.name)}
//                 sx={{
//                   objectFit: "cover",
//                   color: "black",
//                   justifyContent: "flex-start",
//                 }}
//               >
//                 {item.name}
//               </Button>
//             ))}
//             {!expanded && hasMore && (
//               <Button
//                 size="small"
//                 onClick={() => setExpanded(true)}
//                 sx={{ justifyContent: "flex-start", color: "black" }}
//               >
//                 More <KeyboardArrowDownIcon />
//               </Button>
//             )}
//           </Stack>
//         </Box>
//         {/* Toggle Btn + Brand , Fetch ชื่อมาแสดง */}

//         {/* พื้นที่โชว์สินค้าตาม Grid Layout */}
//         <Box
//           sx={{
//             border: "1px dashed",
//             mt: 2,
//             display: "flex",
//             flexDirection: "column",
//             alignItems: "flex-start", // ← ชิดซ้ายทุกบล็อกลูก
//             gap: 2,
//             px: 0, // ไม่มี padding ซ้าย/ขวา
//           }}
//         >
//           {/* แถบเลือก Sort by */}
//           <Box sx={{ display: "flex", gap: 2, pl: 8 }}>
//             <Typography sx={{ pt: 1.4, fontSize: 16 }}>Sort by</Typography>

//             <Stack>
//               <ButtonSort />
//             </Stack>
//           </Box>
//           {/* แถบเลือก Sort by */}

//           {/* Grid Layout Show สินค้า */}
//           <CategoryById />
//         </Box>
//       </Box>
//     </AppTheme>
//   );
// }

import * as React from "react";
import Box from "@mui/material/Box";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import ViewListIcon from "@mui/icons-material/ViewList";
import { Button, Typography, Stack } from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { useState } from "react";
import { Link, useParams, useLocation } from "react-router-dom";
import CategoryById from "./CategoryById";
import AppTheme from "../theme/AppTheme";
import ButtonSort from "../ObjectDetailCategory/ButtonSort";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";

const brandList = [
  { id: 1, name: "Adidas" },
  { id: 2, name: "Nike" },
  { id: 3, name: "Pepo" },
  { id: 4, name: "Koko" },
];

export default function CategoryShopId() {
  const { id } = useParams();
  const { state } = useLocation();
  const categoryId = Number(id);
  const categoryName = state?.name ?? `Category ${id}`;

  const [view, setView] = useState("module");
  const [expanded, setExpanded] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [sortKey, setSortKey] = useState(null);

  const hasMore = brandList.length > 2;
  const visibleBrands = expanded ? brandList : brandList.slice(0, 2);

  const handleChange = (_e, nextView) => {
    if (nextView !== null) setView(nextView);
  };

  return (
    <AppTheme>
      <Box
        sx={{
          display: "flex",
          gap: 2,
          pt: 5,
          pb: 5,
          mx: { xs: 2, md: 6, lg: 10 },
        }}
      >
        {/* แถบซ้าย: Toggle + Brand filter */}
        <Box sx={{ flexDirection: "column", pt: 8, minWidth: 200 }}>
          <Box sx={{ display: "flex", gap: 1, alignItems: "center", mb: 1 }}>
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
            <Typography>All Categories</Typography>
          </Box>

          {/* หัวข้อ Brand */}
          <Typography sx={{ fontSize: 16, mb: 0.5 }}>Brand</Typography>

          {/* รายการแบรนด์ + ไอคอนย้ายตามแถวที่เลือก */}
          <Stack direction="column" spacing={0} paddingLeft={1.0}>
            {visibleBrands.map((b) => {
              const active = selectedBrand === b.name;
              return (
                <Button
                  key={b.id}
                  size="small"
                  onClick={() =>
                    setSelectedBrand((cur) => (cur === b.name ? null : b.name))
                  }
                  startIcon={
                    active ? (
                      <PlayArrowIcon sx={{ fontSize: 18 }} />
                    ) : (
                      // ช่องว่างไว้รักษา alignment ตอนยังไม่เลือก
                      <Box sx={{ width: 18 }} />
                    )
                  }
                  sx={{
                    justifyContent: "flex-start",
                    color: active ? "primary.main" : "black",
                    textTransform: "none",
                    fontSize: 16,
                    minWidth: 0,
                    px: 1,
                  }}
                >
                  {b.name}
                </Button>
              );
            })}

            {!expanded && hasMore && (
              <Button
                size="small"
                onClick={() => setExpanded(true)}
                sx={{
                  justifyContent: "flex-start",
                  color: "black",
                  textTransform: "none",
                  fontSize: 16,
                  pl: 1, // ให้แนวข้อความตรงกับรายการข้างบน
                }}
                endIcon={<KeyboardArrowDownIcon />}
              >
                More
              </Button>
            )}
          </Stack>
        </Box>

        {/* พื้นที่ขวา: หัวข้อ + Sort + สินค้า */}
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
          <Typography variant="h5" sx={{ pl: { xs: 0, md: 2 } }}>
            {selectedBrand}
          </Typography>

          <Box
            sx={{
              display: "flex",
              gap: 2,
              pl: { xs: 0, md: 2 },
              alignItems: "center",
            }}
          >
            <Typography sx={{ fontSize: 16 }}>Sort by</Typography>
            <Stack>
              <ButtonSort value={sortKey} onChange={setSortKey} />
            </Stack>
          </Box>

          <CategoryById
            categoryId={categoryId}
            brand={selectedBrand}
            sortKey={sortKey}
          />
        </Box>
      </Box>
    </AppTheme>
  );
}
