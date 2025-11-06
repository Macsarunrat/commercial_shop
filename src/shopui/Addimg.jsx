// src/image/UploadImage.jsx
import * as React from "react";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  Alert,
  FormControlLabel,
  Checkbox,
  CircularProgress,
} from "@mui/material";
import { useAuthStore } from "../stores/authStore";

/** ====== CONFIG ====== */
const API_BASE = "https://unsparingly-proextension-jacque.ngrok-free.dev";
const NGROK_HDR = { "ngrok-skip-browser-warning": "true" };

// ถ้าแบ็กเอนด์ “บังคับให้เป็น .png เท่านั้น” ให้ตั้งเป็น true
const PNG_ONLY = false;

/** ====== HELPERS ====== */
function isHttpUrl(s) {
  try {
    const u = new URL(String(s));
    return /^https?:$/i.test(u.protocol);
  } catch {
    return false;
  }
}

/** ดาวน์โหลดรูปจาก URL -> แปลงเป็น File (ทำในเบราว์เซอร์)
 * หมายเหตุ: จะล้มเหลวถ้าโดเมนปลายทางไม่เปิด CORS หรือกัน hotlink
 */
async function fetchToFile(url, namePrefix = "image") {
  const res = await fetch(url, { mode: "cors" });
  if (!res.ok) throw new Error(`ดาวน์โหลดไม่ได้ (${res.status}) : ${url}`);

  const ctype = (res.headers.get("content-type") || "").split(";")[0].trim();
  if (!/^image\//i.test(ctype)) {
    throw new Error(`ไม่ใช่ไฟล์รูป (${ctype}) : ${url}`);
  }
  if (PNG_ONLY && ctype !== "image/png") {
    throw new Error(`ต้องเป็น .png เท่านั้น : ${url}`);
  }

  const blob = await res.blob();
  const ext = blob.type?.includes("/") ? `.${blob.type.split("/")[1]}` : ".png";
  return new File([blob], `${namePrefix}${ext}`, {
    type: blob.type || "image/png",
  });
}

/** POST รูปหลายไฟล์ในครั้งเดียวไปที่ /image/products/{product_id}
 * ชื่อ field = "files" (ตามสเปค)
 */
async function postImages(productId, files, token) {
  const fd = new FormData();
  for (const f of files) fd.append("files", f);

  const res = await fetch(`${API_BASE}/image/products/${productId}`, {
    method: "POST",
    headers: {
      ...NGROK_HDR,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      // อย่าตั้ง Content-Type เอง ปล่อยให้ browser ใส่ boundary
    },
    body: fd,
    credentials: "include",
  });

  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try {
      msg += " " + (await res.text());
    } catch {}
    throw new Error(msg);
  }
  return res.json().catch(() => ({}));
}

/** ====== COMPONENT ====== */
export default function UploadImage({ onUploaded }) {
  const token = useAuthStore((s) => s.getToken());

  const [open, setOpen] = React.useState(false);
  const [productId, setProductId] = React.useState("");
  const [urls, setUrls] = React.useState("");
  const [makeCover, setMakeCover] = React.useState(true); // ใช้กำหนดชื่อไฟล์/ลำดับฝั่ง client
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [success, setSuccess] = React.useState(null);

  const resetForm = () => {
    setProductId("");
    setUrls("");
    setMakeCover(true);
    setError(null);
    setSuccess(null);
  };

  const handleOpen = () => {
    resetForm();
    setOpen(true);
  };
  const handleClose = () => {
    if (!busy) setOpen(false);
  };

  const doUpload = async () => {
    setError(null);
    setSuccess(null);

    const pid = Number(productId);
    if (!Number.isInteger(pid) || pid <= 0) {
      setError("กรุณากรอก Product_ID เป็นจำนวนเต็มบวก");
      return;
    }

    const list = urls
      .split(/\r?\n|,/) // รองรับขึ้นบรรทัด/คอมมา
      .map((s) => s.trim())
      .filter(Boolean);

    if (list.length === 0) {
      setError("กรุณาใส่ URL รูปอย่างน้อย 1 รูป (บรรทัดละ 1 URL)");
      return;
    }

    const invalid = list.filter((u) => !isHttpUrl(u));
    if (invalid.length) {
      setError(
        `พบ URL ไม่ถูกต้อง:\n- ${invalid.slice(0, 3).join("\n- ")}${
          invalid.length > 3 ? "\n..." : ""
        }`
      );
      return;
    }

    try {
      setBusy(true);

      // 1) แปลงทุก URL เป็น File (บางตัวอาจดาวน์โหลดไม่ได้ → เก็บเป็น failed)
      const files = [];
      const failed = [];
      for (let i = 0; i < list.length; i++) {
        const u = list[i];
        try {
          const file = await fetchToFile(
            u,
            i === 0 && makeCover ? "cover" : `image_${i + 1}`
          );
          files.push(file);
        } catch (e) {
          failed.push(`- ${u} (${e.message})`);
        }
      }

      if (files.length === 0) {
        setError(
          failed.length
            ? `ดาวน์โหลดรูปไม่สำเร็จทั้งหมด:\n${failed.slice(0, 6).join("\n")}${
                failed.length > 6 ? "\n..." : ""
              }`
            : "ไม่พบไฟล์รูปที่อัปโหลดได้"
        );
        return;
      }

      // 2) POST ครั้งเดียวด้วย multipart/form-data
      const resp = await postImages(pid, files, token);

      let msg = `อัปโหลดสำเร็จ ${files.length} ไฟล์ 🎉`;
      if (failed.length) {
        msg += `\n(มีบางรูปพลาด)\n${failed.slice(0, 3).join("\n")}${
          failed.length > 3 ? "\n..." : ""
        }`;
      }
      setSuccess(msg);
      onUploaded?.({ productId: pid, uploaded: files.length, failed, resp });
    } catch (e) {
      const m = String(e?.message || e);
      if (/CORS|Failed to fetch/i.test(m)) {
        setError(
          "โหลดรูปจาก URL ไม่ได้เพราะ CORS/กัน hotlink ของเว็บปลายทาง (ลองใช้ URL ที่อนุญาตให้ดึงข้ามโดเมน หรือดาวน์โหลดมาเครื่องก่อน)"
        );
      } else {
        setError(m);
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Button variant="outlined" onClick={handleOpen}>
        เพิ่มรูปจาก URL
      </Button>

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>อัปโหลดรูปจาก URL</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            {error && (
              <Alert severity="error" sx={{ whiteSpace: "pre-line" }}>
                {error}
              </Alert>
            )}
            {success && (
              <Alert severity="success" sx={{ whiteSpace: "pre-line" }}>
                {success}
              </Alert>
            )}

            <TextField
              label="Product_ID"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
              fullWidth
              disabled={busy}
              required
            />

            <TextField
              label="URL ของรูป (บรรทัดละ 1 URL หรือคั่นด้วย , )"
              value={urls}
              onChange={(e) => setUrls(e.target.value)}
              multiline
              minRows={6}
              fullWidth
              disabled={busy}
              placeholder={`https://.../image1.png\nhttps://.../image2.jpg`}
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={makeCover}
                  onChange={(e) => setMakeCover(e.target.checked)}
                  disabled={busy}
                />
              }
              label="ใช้รูปแรกเป็นหน้าปก (จัดลำดับเองฝั่งเว็บ)"
            />

            {PNG_ONLY && (
              <Alert severity="info">
                โหมดบังคับไฟล์ PNG เท่านั้น (PNG_ONLY = true)
              </Alert>
            )}
            <Alert severity="warning">
              ถ้าโดเมนปลายทางไม่เปิด CORS หรือกัน hotlink
              เบราว์เซอร์จะดาวน์โหลดรูปนั้นไม่ได้และจะถูกข้าม
            </Alert>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={busy}>
            ปิด
          </Button>
          <Button
            onClick={doUpload}
            variant="contained"
            disabled={busy}
            startIcon={
              busy ? <CircularProgress color="inherit" size={18} /> : null
            }
          >
            {busy ? "กำลังอัปโหลด..." : "อัปโหลด"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
