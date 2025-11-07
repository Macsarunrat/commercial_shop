// src/admin/Addimg.jsx
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
  CircularProgress,
} from "@mui/material";
import { useAuthStore } from "../stores/authStore";

const API_BASE = "https://ritzily-nebule-clark.ngrok-free.dev";
const NGROK_HDR = { "ngrok-skip-browser-warning": "true" };
const FILE_FIELD_NAME = "file";

function isHttpUrl(s) {
  try {
    const u = new URL(String(s));
    return /^https?:$/i.test(u.protocol);
  } catch {
    return false;
  }
}

async function fetchToFile(url, name = "image") {
  const res = await fetch(url, { mode: "cors" });
  if (!res.ok) throw new Error(`ดาวน์โหลดไม่ได้ (${res.status}) : ${url}`);
  const ctype = (res.headers.get("content-type") || "").split(";")[0].trim();
  if (!/^image\//i.test(ctype))
    throw new Error(`ไม่ใช่ไฟล์รูป (${ctype}) : ${url}`);
  const blob = await res.blob();
  const ext = blob.type?.includes("/") ? `.${blob.type.split("/")[1]}` : ".png";
  return new File([blob], `${name}${ext}`, { type: blob.type || "image/png" });
}

async function postSingleImage(productId, file, token) {
  const fd = new FormData();
  fd.append(FILE_FIELD_NAME, file);
  const res = await fetch(`${API_BASE}/image/product/${productId}`, {
    method: "POST",
    headers: {
      ...NGROK_HDR,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
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
  try {
    return await res.json();
  } catch {
    return {};
  }
}

/**
 * Addimg
 * - ถ้าไม่ส่ง prop open → ใช้ปุ่มภายในเปิด dialog เอง (uncontrolled)
 * - ถ้าส่ง prop open/onClose → ใช้เป็น dialog ควบคุมจากภายนอก (controlled)
 * - hideTrigger: ซ่อนปุ่มหลัก (ไว้ใช้ตอน controlled)
 */
export default function Addimg({
  open,
  onClose,
  defaultProductId,
  hideTrigger = false,
  buttonText = "เพิ่มรูปจาก URL",
  onUploaded,
}) {
  const token = useAuthStore((s) => s.getToken?.());

  const [innerOpen, setInnerOpen] = React.useState(false);
  const controlled = open !== undefined;

  const [productId, setProductId] = React.useState(defaultProductId ?? "");
  const [url, setUrl] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [success, setSuccess] = React.useState(null);

  React.useEffect(() => {
    if (defaultProductId !== undefined) setProductId(defaultProductId ?? "");
  }, [defaultProductId]);

  const actuallyOpen = controlled ? open : innerOpen;
  const doOpen = () => {
    if (!controlled) setInnerOpen(true);
  };
  const doClose = () => {
    if (controlled) onClose?.();
    else setInnerOpen(false);
  };

  const resetMsgs = () => {
    setError(null);
    setSuccess(null);
  };

  const handleUpload = async () => {
    resetMsgs();
    const pid = Number(productId);
    if (!Number.isInteger(pid) || pid <= 0) {
      setError("กรุณากรอก Product_ID เป็นจำนวนเต็มบวก");
      return;
    }
    if (!isHttpUrl(url)) {
      setError("กรุณาใส่ URL ที่ขึ้นต้นด้วย http/https");
      return;
    }
    try {
      setBusy(true);
      const file = await fetchToFile(url, "cover");
      await postSingleImage(pid, file, token);
      setSuccess(`อัปโหลดสำเร็จให้ Product_ID = ${pid}`);
      onUploaded?.({ productId: pid, url });
    } catch (e) {
      const m = String(e?.message || e);
      if (/CORS|Failed to fetch/i.test(m)) {
        setError("ดาวน์โหลดรูปจาก URL ไม่ได้ (อาจติด CORS/hotlink ที่ปลายทาง)");
      } else {
        setError(m);
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      {!hideTrigger && (
        <Button variant="outlined" onClick={doOpen}>
          {buttonText}
        </Button>
      )}

      <Dialog open={!!actuallyOpen} onClose={doClose} fullWidth maxWidth="sm">
        <DialogTitle>อัปโหลดรูปทีละ URL</DialogTitle>
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
              label="URL ของรูป"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://.../image.png"
              fullWidth
              disabled={busy}
              required
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={doClose} disabled={busy}>
            ปิด
          </Button>
          <Button
            onClick={handleUpload}
            variant="contained"
            disabled={busy}
            startIcon={
              busy ? <CircularProgress size={18} color="inherit" /> : null
            }
          >
            {busy ? "กำลังอัปโหลด..." : "อัปโหลด"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
