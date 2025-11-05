import * as React from "react";
import {
  Box,
  Card,
  Stack,
  Typography,
  IconButton,
  Button,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Alert,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { useAuthStore } from "../stores/authStore";
import AppTheme from "../theme/AppTheme";

const API = "https://great-lobster-rightly.ngrok-free.app";
const HDRS = { "ngrok-skip-browser-warning": "true" };

/* ---------------- helpers ---------------- */
function formatAddress(a) {
  if (!a) return "";
  return [
    a.Address_Number,
    a.Road,
    a.Soi,
    a.Tumbon,
    a.Amphur,
    a.Province,
    a.Optional_Detail,
  ]
    .filter(Boolean)
    .join(" ");
}

// ล้างค่าว่าง/ขีด และตัด properties ที่ว่างทิ้ง
function buildAddressPayload(form) {
  const clean = (v) => {
    const s = String(v ?? "").trim();
    return s === "-" ? "" : s;
  };
  const p = {
    Province: clean(form.Province),
    Amphur: clean(form.Amphur),
    Tumbon: clean(form.Tumbon),
    Soi: clean(form.Soi),
    Road: clean(form.Road),
    Optional_Detail: clean(form.Optional_Detail),
    Address_Number: clean(form.Address_Number),
  };
  Object.keys(p).forEach((k) => {
    if (!p[k]) delete p[k];
  });
  return p;
}

async function readNiceError(res) {
  try {
    const j = await res.json();
    if (j?.detail) {
      if (Array.isArray(j.detail)) {
        return j.detail
          .map((d) => `${(d.loc || []).join(".")} : ${d.msg}`)
          .join("\n");
      }
      return String(j.detail);
    }
  } catch {}
  try {
    return await res.text();
  } catch {}
  return `HTTP ${res.status}`;
}

// เผื่อ backend ไม่มี /users/me — พยายามดึงจาก JWT
function decodeUserIdFromJwt(token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return (
      payload?.User_ID ??
      payload?.user_id ??
      payload?.uid ??
      payload?.sub ??
      null
    );
  } catch {
    return null;
  }
}

/* --------------- Address Form Dialog --------------- */
function AddressFormDialog({ open, onClose, initial, onSubmit, busy }) {
  const [form, setForm] = React.useState({
    Province: "",
    Amphur: "",
    Tumbon: "",
    Soi: "",
    Road: "",
    Optional_Detail: "",
    Address_Number: "",
  });

  React.useEffect(() => {
    if (initial) {
      setForm({
        Province: initial.Province ?? "",
        Amphur: initial.Amphur ?? "",
        Tumbon: initial.Tumbon ?? "",
        Soi: initial.Soi ?? "",
        Road: initial.Road ?? "",
        Optional_Detail: initial.Optional_Detail ?? "",
        Address_Number: initial.Address_Number ?? "",
      });
    } else {
      setForm({
        Province: "",
        Amphur: "",
        Tumbon: "",
        Soi: "",
        Road: "",
        Optional_Detail: "",
        Address_Number: "",
      });
    }
  }, [initial]);

  const chg = (k) => (e) => setForm((s) => ({ ...s, [k]: e.target.value }));

  return (
    <Dialog
      open={open}
      onClose={busy ? undefined : onClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>{initial ? "แก้ไขที่อยู่" : "เพิ่มที่อยู่ใหม่"}</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <TextField
            label="เลขที่/หมู่บ้าน"
            value={form.Address_Number}
            onChange={chg("Address_Number")}
          />
          <TextField label="ถนน" value={form.Road} onChange={chg("Road")} />
          <TextField label="ซอย" value={form.Soi} onChange={chg("Soi")} />
          <TextField
            label="ตำบล/แขวง"
            value={form.Tumbon}
            onChange={chg("Tumbon")}
          />
          <TextField
            label="อำเภอ/เขต"
            value={form.Amphur}
            onChange={chg("Amphur")}
          />
          <TextField
            label="จังหวัด"
            value={form.Province}
            onChange={chg("Province")}
          />
          <TextField
            label="รายละเอียดเพิ่มเติม"
            value={form.Optional_Detail}
            onChange={chg("Optional_Detail")}
            multiline
            rows={2}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={busy}>
          ยกเลิก
        </Button>
        <Button
          onClick={() => onSubmit(form)}
          disabled={busy}
          variant="contained"
        >
          {busy ? <CircularProgress size={20} /> : "บันทึก"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

/* -------------------- Main Component -------------------- */
export default function AddressUser({ onSelect, compact = true }) {
  const token = useAuthStore((s) => s.getToken());
  const [userId, setUserId] = React.useState(null);

  const [list, setList] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState(null);
  const [selectedId, setSelectedId] = React.useState(null);

  const [dlgOpen, setDlgOpen] = React.useState(false);
  const [dlgBusy, setDlgBusy] = React.useState(false);
  const [editing, setEditing] = React.useState(null);

  const authHeaders = React.useMemo(
    () => ({
      ...HDRS,
      Authorization: token ? `Bearer ${token}` : undefined,
      "Content-Type": "application/json",
    }),
    [token]
  );

  // โหลด user id (จำเป็นสำหรับ POST /user-address/)
  React.useEffect(() => {
    let ignore = false;
    (async () => {
      if (!token) return;
      try {
        // ถ้ามี /users/me ให้ใช้ก่อน
        const res = await fetch(`${API}/users/me`, {
          headers: authHeaders,
          credentials: "include",
        });
        if (res.ok) {
          const me = await res.json();
          const id = me?.User_ID ?? me?.user_id ?? me?.id ?? me?.ID ?? null;
          if (!ignore) setUserId(id);
        } else {
          // fallback: decode จาก JWT
          const id = decodeUserIdFromJwt(token);
          if (!ignore) setUserId(id);
        }
      } catch {
        const id = decodeUserIdFromJwt(token);
        if (!ignore) setUserId(id);
      }
    })();
    return () => {
      ignore = true;
    };
  }, [token, authHeaders]);

  // ✅ FIX 1: ห่อฟังก์ชัน load ด้วย useCallback
  const load = React.useCallback(async () => {
    // ตรวจสอบว่ามี Token ใน Header จริงๆ
    if (!authHeaders.Authorization) {
      setErr("ยังไม่ได้เข้าสู่ระบบ (Missing Token)");
      setLoading(false);
      setList([]);
      return;
    }

    setLoading(true);
    setErr(null);
    try {
      const res = await fetch(`${API}/user-address/me`, {
        headers: authHeaders,
        credentials: "include",
      });
      // ตรวจสอบ 401 โดยเฉพาะ
      if (res.status === 401) throw new Error("HTTP 401: Unauthorized (Token อาจหมดอายุ)");
      if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
      
      const data = await res.json();
      const rows = Array.isArray(data) ? data : data?.items ?? [];
      setList(rows);
      if (!selectedId) onSelect?.(null);
    } catch (e) {
      setErr(e.message || String(e));
    } finally {
      setLoading(false);
    }
  }, [authHeaders, selectedId, onSelect]); // <-- เพิ่ม dependencies

  // ✅ FIX 2: แก้ไข useEffect ให้รอ Token ก่อน
  React.useEffect(() => {
    // ทำงานเฉพาะเมื่อ "token" พร้อมใช้งาน
    if (token) {
      load();
    } else {
      // ถ้าไม่มี token (เช่น logout) ก็ไม่ต้องโหลด
      setLoading(false);
      setErr("กรุณาเข้าสู่ระบบเพื่อจัดการที่อยู่");
      setList([]);
    }
  }, [token, load]); // <-- เปลี่ยน dependency เป็น token และ load

  /* ---------- CREATE / UPDATE / DELETE ---------- */
  async function createAddress(form) {
    setDlgBusy(true);
    const payload = buildAddressPayload(form);

    try {
      // ฝั่งเซิร์ฟเวอร์ต้องการ User_ID
      const uid = Number(userId);
      if (!uid) throw new Error("กรุณาเข้าสู่ระบบเพื่อจัดการที่อยู่");
      payload.User_ID = uid;

      const res = await fetch(`${API}/user-address/`, {
        method: "POST",
        headers: authHeaders,
        credentials: "include",
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const msg = await readNiceError(res);
        throw new Error(msg);
      }
      await load();
      setDlgOpen(false);
    } catch (e) {
      alert(`เพิ่มที่อยู่ไม่สำเร็จ:\n${e.message}`);
      console.error("POST /user-address/ failed", e);
    } finally {
      setDlgBusy(false);
    }
  }

  async function updateAddress(id, form) {
    setDlgBusy(true);
    const payload = buildAddressPayload(form);
    try {
      const res = await fetch(`${API}/user-address/${id}`, {
        method: "PUT",
        headers: authHeaders,
        credentials: "include",
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const msg = await readNiceError(res);
        throw new Error(msg);
      }
      await load();
      setDlgOpen(false);
      setEditing(null);
    } catch (e) {
      alert(`แก้ไขที่อยู่ไม่สำเร็จ:\n${e.message}`);
      console.error("PUT /user-address/{id} failed", e);
    } finally {
      setDlgBusy(false);
    }
  }

  async function deleteAddress(id) {
    if (!confirm("ลบที่อยู่นี้หรือไม่?")) return;
    try {
      const res = await fetch(`${API}/user-address/${id}`, {
        method: "DELETE",
        headers: authHeaders,
        credentials: "include",
      });
      if (!res.ok) {
        const msg = await readNiceError(res);
        throw new Error(msg);
      }
      await load();
      if (selectedId === id) {
        setSelectedId(null);
        onSelect?.(null);
      }
    } catch (e) {
      alert(`ลบไม่สำเร็จ:\n${e.message}`);
      console.error("DELETE /user-address/{id} failed", e);
    }
  }

  const pad = compact ? 2 : 3;

  return (
    <AppTheme>
      <Card sx={{ p: pad }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 1 }}
        >
          <Typography variant="h6" fontWeight={700}>
            Delivery Address
          </Typography>
          <Button
            startIcon={<AddIcon />}
            variant="outlined"
            onClick={() => {
              setEditing(null);
              setDlgOpen(true);
            }}
          >
            เพิ่มที่อยู่
          </Button>
        </Stack>

        {err && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {err}
          </Alert>
        )}

        {loading ? (
          <Typography color="text.secondary">กำลังโหลดที่อยู่…</Typography>
        ) : list.length === 0 ? (
          <Typography color="text.secondary">
            ยังไม่มีที่อยู่ — กด “เพิ่มที่อยู่” เพื่อสร้างรายการแรก
          </Typography>
        ) : (
          <Stack spacing={1.25}>
            {list.map((a) => {
              const isSel = selectedId === a.User_Address_ID;
              return (
                <Box
                  key={a.User_Address_ID}
                  sx={{
                    p: 1.25,
                    borderRadius: 1,
                    border: "1px solid",
                    borderColor: isSel ? "primary.main" : "divider",
                    bgcolor: isSel ? "primary.main+10" : "background.paper",
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <LocationOnIcon fontSize="small" />
                    <Box
                      sx={{ cursor: "pointer", flex: 1 }}
                      onClick={() => {
                        setSelectedId(a.User_Address_ID);
                        onSelect?.(a);
                      }}
                    >
                      <Typography fontWeight={700}>
                        {isSel
                          ? "ที่อยู่นี้ถูกเลือก"
                          : "แตะเพื่อเลือกที่อยู่นี้"}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {formatAddress(a)}
                      </Typography>
                    </Box>
                    <IconButton
                      onClick={() => {
                        setEditing(a);
                        setDlgOpen(true);
                      }}
                      aria-label="edit"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => deleteAddress(a.User_Address_ID)}
                      aria-label="delete"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Stack>
                </Box>
              );
            })}
          </Stack>
        )}

        <AddressFormDialog
          open={dlgOpen}
          onClose={() => {
            if (!dlgBusy) {
              setDlgOpen(false);
              setEditing(null);
            }
          }}
          initial={editing}
          busy={dlgBusy}
          onSubmit={(form) => {
            if (editing?.User_Address_ID)
              updateAddress(editing.User_Address_ID, form);
            else createAddress(form);
          }}
        />

        <Divider sx={{ mt: 2 }} />
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ mt: 1, display: "block" }}
        >
          เลือกหนึ่งที่อยู่เพื่อใช้ในการจัดส่ง (แก้ไข/ลบได้)
        </Typography>
      </Card>
    </AppTheme>
  );
}