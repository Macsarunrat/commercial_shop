import * as React from "react";
import Box from "@mui/material/Box";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import ViewListIcon from "@mui/icons-material/ViewList";
import { Button, Typography, Stack } from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { useState, useEffect } from "react";
import { Link, useParams, useLocation } from "react-router-dom";
import CategoryById from "./CategoryById";
import AppTheme from "../theme/AppTheme";
import ButtonSort from "../ObjectDetailCategory/ButtonSort";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import { useMemo } from "react";

const API = "https://great-lobster-rightly.ngrok-free.app";
const HDRS = { "ngrok-skip-browser-warning": "true" };

export default function CategoryShopId() {
  const { id } = useParams(); // /categoryitems/:id
  const { state } = useLocation();
  const categoryIdNum = Number(id);
  const hasValidCategory = Number.isFinite(categoryIdNum);
  const categoryName = state?.name ?? `Category ${id}`;

  const [view, setView] = React.useState("module");
  const [expanded, setExpanded] = React.useState(false);
  const [brandList, setBrandList] = React.useState([]);
  const [selectedBrandId, setSelectedBrandId] = React.useState(null);
  const [selectedBrandName, setSelectedBrandName] = React.useState(null);
  const [sortKey, setSortKey] = React.useState(null);
  const [error, setError] = React.useState(null);
  const [loading, setLoading] = React.useState(false);

  // โหลดแบรนด์ตาม categoryId จากพาธ
  React.useEffect(() => {
    if (!hasValidCategory) {
      setError("Category ID ไม่ถูกต้อง");
      setBrandList([]);
      return;
    }
    const ctl = new AbortController();
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const url = `${API}/store/brands-by-category/${categoryIdNum}`;
        const res = await fetch(url, { signal: ctl.signal, headers: HDRS });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json(); // [{ Brand_ID, Brand_Name }]
        setBrandList(Array.isArray(json) ? json : json?.items ?? []);
        setSelectedBrandId(null);
        setSelectedBrandName(null);
        setExpanded(false);
      } catch (e) {
        if (e.name !== "AbortError") {
          setError(e.message || String(e));
          setBrandList([]);
        }
      } finally {
        setLoading(false);
      }
    })();
    return () => ctl.abort();
  }, [hasValidCategory, categoryIdNum]);

  const hasMore = brandList.length > 10;
  const visibleBrands = React.useMemo(
    () => (expanded ? brandList : brandList.slice(0, 10)),
    [expanded, brandList]
  );

  const onPickBrand = (b) => {
    if (selectedBrandId === b.Brand_ID) {
      setSelectedBrandId(null);
      setSelectedBrandName(null);
    } else {
      setSelectedBrandId(b.Brand_ID);
      setSelectedBrandName(b.Brand_Name);
    }
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
        {/* ซ้าย: รายชื่อแบรนด์ของหมวดนี้ */}
        <Box sx={{ flexDirection: "column", pt: 8, minWidth: 200 }}>
          <Box sx={{ display: "flex", gap: 1, alignItems: "center", mb: 1 }}>
            <ToggleButtonGroup
              orientation="vertical"
              value={view}
              exclusive
              onChange={(_, v) => v && setView(v)}
              size="small"
            >
              <ToggleButton
                value="list"
                aria-label="list"
                component={Link}
                to="/5columncategories"
              >
                <ViewListIcon />
              </ToggleButton>
            </ToggleButtonGroup>
            <Typography>All Categories</Typography>
          </Box>

          <Typography sx={{ fontSize: 16, mb: 0.5 }}>
            Brand in {categoryName}
          </Typography>

          {loading && (
            <Typography sx={{ px: 1, py: 0.5 }}>กำลังโหลดแบรนด์…</Typography>
          )}
          {error && (
            <Typography color="error" sx={{ px: 1, py: 0.5 }}>
              {error}
            </Typography>
          )}

          <Stack direction="column" spacing={0} paddingLeft={1}>
            {visibleBrands.map((b) => {
              const active = selectedBrandId === b.Brand_ID;
              return (
                <Button
                  key={b.Brand_ID}
                  size="small"
                  onClick={() => onPickBrand(b)}
                  startIcon={
                    active ? (
                      <PlayArrowIcon sx={{ fontSize: 18 }} />
                    ) : (
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
                  {b.Brand_Name}
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
                  pl: 1,
                }}
                endIcon={<KeyboardArrowDownIcon />}
              >
                More
              </Button>
            )}
          </Stack>
        </Box>

        {/* ขวา: สินค้าในหมวด/แบรนด์นี้ */}
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
          <Typography variant="h5" sx={{ pl: { xs: 0, md: 2 } }}>
            {selectedBrandName}
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
            <ButtonSort value={sortKey} onChange={setSortKey} />
          </Box>

          {hasValidCategory && (
            <CategoryById
              categoryId={categoryIdNum} // ใช้ id ที่ตรวจแล้ว
              brandId={selectedBrandId} // ถ้าเลือกแบรนด์จะส่ง id ให้ backend กรอง
              brand={selectedBrandName} // ไว้โชว์/กรองสำรอง
              sortKey={sortKey}
            />
          )}
        </Box>
      </Box>
    </AppTheme>
  );
}
