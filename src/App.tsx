import { useState, useEffect, useRef } from "react";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD4b34EZzVcbeWq3rnxsYPO9_KH6br1qOg",
  authDomain: "beauty-pass-ca0ad.firebaseapp.com",
  projectId: "beauty-pass-ca0ad",
  storageBucket: "beauty-pass-ca0ad.firebasestorage.app",
  messagingSenderId: "814369442563",
  appId: "1:814369442563:web:6a4c04b4199decf4d5f736",
  measurementId: "G-Y18TC7LWHC",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const uid = () => Math.random().toString(36).slice(2, 10);
const today = () => new Date().toISOString().split("T")[0];

const addMonths = (dateStr, months) => {
  const d = new Date(dateStr);
  d.setMonth(d.getMonth() + months);
  return d.toISOString().split("T")[0];
};

const daysUntil = (dateStr) => {
  const diff = new Date(dateStr) - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

const readFileAsDataURL = (file) =>
  new Promise((res) => {
    const r = new FileReader();
    r.onload = (e) => res(e.target.result);
    r.readAsDataURL(file);
  });

const EMPTY_DATA = { trattamenti: [], medici: [] };

const loadFromFirestore = async (userId) => {
  try {
    const ref = doc(db, "users", userId, "beautypass", "data");
    const snap = await getDoc(ref);
    if (snap.exists()) return snap.data();
  } catch (e) {
    console.error("Errore caricamento dati:", e);
  }
  return EMPTY_DATA;
};

const saveToFirestore = async (userId, data) => {
  try {
    const ref = doc(db, "users", userId, "beautypass", "data");
    await setDoc(ref, data);
  } catch (e) {
    console.error("Errore salvataggio:", e);
  }
};

const S = {
  bg: "#fdf8f5",
  card: "#fff",
  primary: "#c9a48a",
  primaryDark: "#a87f63",
  accent: "#e8d5c4",
  text: "#2d2320",
  muted: "#9e8070",
  danger: "#d97070",
  green: "#6db58f",
  border: "#e8ddd6",
};

const Badge = ({ color, children }) => (
  <span
    style={{
      background: color || S.accent,
      color: S.primaryDark,
      borderRadius: 20,
      padding: "2px 10px",
      fontSize: 12,
      fontWeight: 600,
    }}
  >
    {children}
  </span>
);

const Btn = ({
  onClick,
  children,
  variant = "primary",
  small,
  style = {},
  disabled,
}) => {
  const base = {
    border: "none",
    borderRadius: 8,
    cursor: disabled ? "not-allowed" : "pointer",
    fontWeight: 600,
    fontSize: small ? 13 : 14,
    padding: small ? "5px 12px" : "9px 18px",
    opacity: disabled ? 0.6 : 1,
    ...style,
  };
  const variants = {
    primary: { background: S.primary, color: "#fff" },
    secondary: { background: S.accent, color: S.primaryDark },
    danger: { background: S.danger, color: "#fff" },
    ghost: {
      background: "transparent",
      color: S.primaryDark,
      border: `1px solid ${S.border}`,
    },
  };
  return (
    <button
      style={{ ...base, ...variants[variant] }}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

const Input = ({ label, ...props }) => (
  <label
    style={{
      display: "flex",
      flexDirection: "column",
      gap: 4,
      fontSize: 13,
      color: S.muted,
    }}
  >
    {label}
    <input
      {...props}
      style={{
        border: `1px solid ${S.border}`,
        borderRadius: 8,
        padding: "8px 10px",
        fontSize: 14,
        background: "#fdfaf8",
        color: S.text,
        outline: "none",
      }}
    />
  </label>
);

const Textarea = ({ label, ...props }) => (
  <label
    style={{
      display: "flex",
      flexDirection: "column",
      gap: 4,
      fontSize: 13,
      color: S.muted,
    }}
  >
    {label}
    <textarea
      {...props}
      rows={3}
      style={{
        border: `1px solid ${S.border}`,
        borderRadius: 8,
        padding: "8px 10px",
        fontSize: 14,
        background: "#fdfaf8",
        color: S.text,
        outline: "none",
        resize: "vertical",
      }}
    />
  </label>
);

const Select = ({ label, children, ...props }) => (
  <label
    style={{
      display: "flex",
      flexDirection: "column",
      gap: 4,
      fontSize: 13,
      color: S.muted,
    }}
  >
    {label}
    <select
      {...props}
      style={{
        border: `1px solid ${S.border}`,
        borderRadius: 8,
        padding: "8px 10px",
        fontSize: 14,
        background: "#fdfaf8",
        color: S.text,
        outline: "none",
      }}
    >
      {children}
    </select>
  </label>
);

const Modal = ({ title, onClose, children }) => (
  <div
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,.35)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
      padding: 16,
    }}
    onClick={(e) => e.target === e.currentTarget && onClose()}
  >
    <div
      style={{
        background: S.card,
        borderRadius: 16,
        padding: 24,
        width: "100%",
        maxWidth: 560,
        maxHeight: "90vh",
        overflowY: "auto",
        boxShadow: "0 8px 40px rgba(0,0,0,.18)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <h2 style={{ margin: 0, fontSize: 18, color: S.text }}>{title}</h2>
        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            fontSize: 22,
            cursor: "pointer",
            color: S.muted,
          }}
        >
          ×
        </button>
      </div>
      {children}
    </div>
  </div>
);

const PhotoUpload = ({ label, value, onChange }) => {
  const ref = useRef();
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span style={{ fontSize: 13, color: S.muted }}>{label}</span>
      <div
        style={{
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        {value && (
          <div style={{ position: "relative" }}>
            <img
              src={value}
              alt=""
              style={{
                width: 80,
                height: 80,
                objectFit: "cover",
                borderRadius: 10,
                border: `2px solid ${S.border}`,
              }}
            />
            <button
              onClick={() => onChange(null)}
              style={{
                position: "absolute",
                top: -6,
                right: -6,
                background: S.danger,
                color: "#fff",
                border: "none",
                borderRadius: "50%",
                width: 20,
                height: 20,
                fontSize: 12,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              ×
            </button>
          </div>
        )}
        {!value && (
          <div
            onClick={() => ref.current.click()}
            style={{
              width: 80,
              height: 80,
              border: `2px dashed ${S.border}`,
              borderRadius: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              fontSize: 28,
              color: S.primary,
              background: "#fdf8f5",
            }}
          >
            +
          </div>
        )}
        <input
          ref={ref}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={async (e) => {
            if (e.target.files[0]) {
              const url = await readFileAsDataURL(e.target.files[0]);
              onChange(url);
            }
          }}
        />
      </div>
    </div>
  );
};

const MultiPhotoUpload = ({ label, value = [], onChange }) => {
  const ref = useRef();
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span style={{ fontSize: 13, color: S.muted }}>{label}</span>
      <div
        style={{
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        {value.map((src, i) => (
          <div key={i} style={{ position: "relative" }}>
            <img
              src={src}
              alt=""
              style={{
                width: 70,
                height: 70,
                objectFit: "cover",
                borderRadius: 8,
                border: `2px solid ${S.border}`,
              }}
            />
            <button
              onClick={() => onChange(value.filter((_, j) => j !== i))}
              style={{
                position: "absolute",
                top: -6,
                right: -6,
                background: S.danger,
                color: "#fff",
                border: "none",
                borderRadius: "50%",
                width: 20,
                height: 20,
                fontSize: 12,
                cursor: "pointer",
              }}
            >
              ×
            </button>
          </div>
        ))}
        <div
          onClick={() => ref.current.click()}
          style={{
            width: 70,
            height: 70,
            border: `2px dashed ${S.border}`,
            borderRadius: 8,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            fontSize: 24,
            color: S.primary,
            background: "#fdf8f5",
          }}
        >
          +
        </div>
        <input
          ref={ref}
          type="file"
          accept="image/*"
          multiple
          style={{ display: "none" }}
          onChange={async (e) => {
            const files = Array.from(e.target.files);
            const urls = await Promise.all(files.map(readFileAsDataURL));
            onChange([...value, ...urls]);
            e.target.value = "";
          }}
        />
      </div>
    </div>
  );
};

const AuthScreen = () => {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const errorMessages = {
    "auth/invalid-email": "Email non valida.",
    "auth/user-not-found": "Nessun account con questa email.",
    "auth/wrong-password": "Password errata.",
    "auth/email-already-in-use": "Email già registrata.",
    "auth/weak-password": "Password troppo corta (min. 6 caratteri).",
    "auth/invalid-credential": "Email o password errati.",
  };

  const handleSubmit = async () => {
    if (!email || !password) {
      setError("Compila tutti i campi.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      if (mode === "login")
        await signInWithEmailAndPassword(auth, email, password);
      else await createUserWithEmailAndPassword(auth, email, password);
    } catch (e) {
      setError(errorMessages[e.code] || "Errore. Riprova.");
    }
    setLoading(false);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: S.bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        fontFamily: "'Segoe UI', system-ui, sans-serif",
      }}
    >
      <div
        style={{
          background: S.card,
          borderRadius: 20,
          padding: 36,
          width: "100%",
          maxWidth: 400,
          boxShadow: "0 8px 40px rgba(0,0,0,.08)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>💎</div>
          <h1
            style={{
              margin: 0,
              fontSize: 26,
              fontWeight: 800,
              background: `linear-gradient(135deg, ${S.primary}, ${S.primaryDark})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Beauty Pass
          </h1>
          <p style={{ margin: "6px 0 0", color: S.muted, fontSize: 13 }}>
            Il tuo diario estetico personale
          </p>
        </div>
        <div
          style={{
            display: "flex",
            background: "#fdf8f5",
            borderRadius: 10,
            padding: 4,
            marginBottom: 24,
          }}
        >
          {["login", "register"].map((m) => (
            <button
              key={m}
              onClick={() => {
                setMode(m);
                setError("");
              }}
              style={{
                flex: 1,
                background: mode === m ? S.primary : "transparent",
                color: mode === m ? "#fff" : S.muted,
                border: "none",
                borderRadius: 7,
                padding: "8px",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {m === "login" ? "Accedi" : "Registrati"}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tua@email.com"
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          />
          {error && (
            <div
              style={{
                background: "#fce4ec",
                color: "#c62828",
                borderRadius: 8,
                padding: "10px 14px",
                fontSize: 13,
              }}
            >
              {error}
            </div>
          )}
          <Btn
            onClick={handleSubmit}
            disabled={loading}
            style={{ marginTop: 4, padding: "12px" }}
          >
            {loading
              ? "Caricamento..."
              : mode === "login"
              ? "Accedi"
              : "Crea account"}
          </Btn>
        </div>
      </div>
    </div>
  );
};

const FormMedico = ({ initial = {}, onSave, onCancel }) => {
  const [f, setF] = useState({
    nome: initial.nome || "",
    specializzazione: initial.specializzazione || "",
    clinica: initial.clinica || "",
    telefono: initial.telefono || "",
    email: initial.email || "",
    note: initial.note || "",
  });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <Input
        label="Nome completo *"
        value={f.nome}
        onChange={set("nome")}
        placeholder="Dr.ssa Rossi Maria"
      />
      <Input
        label="Specializzazione"
        value={f.specializzazione}
        onChange={set("specializzazione")}
        placeholder="Medicina estetica"
      />
      <Input
        label="Clinica / Studio"
        value={f.clinica}
        onChange={set("clinica")}
      />
      <Input label="Telefono" value={f.telefono} onChange={set("telefono")} />
      <Input
        label="Email"
        type="email"
        value={f.email}
        onChange={set("email")}
      />
      <Textarea label="Note" value={f.note} onChange={set("note")} />
      <div
        style={{
          display: "flex",
          gap: 10,
          justifyContent: "flex-end",
          marginTop: 8,
        }}
      >
        <Btn variant="ghost" onClick={onCancel}>
          Annulla
        </Btn>
        <Btn onClick={() => f.nome && onSave(f)}>Salva</Btn>
      </div>
    </div>
  );
};

const emptyProdotto = () => ({ id: uid(), nome: "", brand: "", etichette: [] });

const FormProdotto = ({ value, onChange, onRemove }) => (
  <div
    style={{
      background: "#fdf8f5",
      border: `1px solid ${S.border}`,
      borderRadius: 12,
      padding: 14,
      display: "flex",
      flexDirection: "column",
      gap: 10,
    }}
  >
    <div style={{ display: "flex", gap: 10 }}>
      <div style={{ flex: 1 }}>
        <Input
          label="Nome prodotto"
          value={value.nome}
          onChange={(e) => onChange({ ...value, nome: e.target.value })}
          placeholder="Filler acido ialuronico"
        />
      </div>
      <div style={{ flex: 1 }}>
        <Input
          label="Brand"
          value={value.brand}
          onChange={(e) => onChange({ ...value, brand: e.target.value })}
          placeholder="Juvederm"
        />
      </div>
      <button
        onClick={onRemove}
        style={{
          alignSelf: "flex-end",
          background: "none",
          border: "none",
          cursor: "pointer",
          color: S.danger,
          fontSize: 20,
        }}
      >
        🗑
      </button>
    </div>
    <MultiPhotoUpload
      label="Foto etichetta"
      value={value.etichette}
      onChange={(v) => onChange({ ...value, etichette: v })}
    />
  </div>
);

const CATEGORIE = [
  "Filler",
  "Botox / Tossina botulinica",
  "Biorivitalizzazione",
  "Laser",
  "Peeling",
  "Radiofrequenza",
  "Mesoterapia",
  "PRP",
  "Skinbooster",
  "Lifting non chirurgico",
  "Altro",
];

const FormTrattamento = ({ initial = {}, medici = [], onSave, onCancel }) => {
  const [f, setF] = useState({
    nome: initial.nome || "",
    categoria: initial.categoria || CATEGORIE[0],
    data: initial.data || today(),
    medicoId: initial.medicoId || "",
    zona: initial.zona || "",
    note: initial.note || "",
    fotoPrima: initial.fotoPrima || null,
    fotoDopo: initial.fotoDopo || null,
    prodotti: initial.prodotti || [emptyProdotto()],
    reminderMesi: initial.reminderMesi || "",
    reminderData: initial.reminderData || "",
  });
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));
  const setV = (k) => (v) => setF((p) => ({ ...p, [k]: v }));
  const updateProdotto = (i, v) =>
    setF((p) => ({
      ...p,
      prodotti: p.prodotti.map((x, j) => (j === i ? v : x)),
    }));
  const removeProdotto = (i) =>
    setF((p) => ({ ...p, prodotti: p.prodotti.filter((_, j) => j !== i) }));
  const addProdotto = () =>
    setF((p) => ({ ...p, prodotti: [...p.prodotti, emptyProdotto()] }));
  const handleMesiChange = (e) => {
    const m = parseInt(e.target.value) || "";
    setF((p) => ({
      ...p,
      reminderMesi: m,
      reminderData: m ? addMonths(p.data, m) : "",
    }));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", gap: 10 }}>
        <div style={{ flex: 1 }}>
          <Input
            label="Nome trattamento *"
            value={f.nome}
            onChange={set("nome")}
            placeholder="Es. Filler labbra"
          />
        </div>
        <div style={{ flex: 1 }}>
          <Select
            label="Categoria"
            value={f.categoria}
            onChange={set("categoria")}
          >
            {CATEGORIE.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </Select>
        </div>
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <div style={{ flex: 1 }}>
          <Input
            label="Data trattamento *"
            type="date"
            value={f.data}
            onChange={(e) =>
              setF((p) => ({
                ...p,
                data: e.target.value,
                reminderData: p.reminderMesi
                  ? addMonths(e.target.value, p.reminderMesi)
                  : "",
              }))
            }
          />
        </div>
        <div style={{ flex: 1 }}>
          <Select label="Medico" value={f.medicoId} onChange={set("medicoId")}>
            <option value="">— Nessun medico —</option>
            {medici.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nome}
              </option>
            ))}
          </Select>
        </div>
      </div>
      <Input
        label="Zona trattata"
        value={f.zona}
        onChange={set("zona")}
        placeholder="Es. labbra, zigomi, fronte..."
      />
      <div style={{ display: "flex", gap: 16 }}>
        <PhotoUpload
          label="📸 Foto PRIMA"
          value={f.fotoPrima}
          onChange={setV("fotoPrima")}
        />
        <PhotoUpload
          label="✨ Foto DOPO"
          value={f.fotoDopo}
          onChange={setV("fotoDopo")}
        />
      </div>
      <div>
        <div style={{ fontSize: 13, color: S.muted, marginBottom: 8 }}>
          Prodotti utilizzati
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {f.prodotti.map((p, i) => (
            <FormProdotto
              key={p.id}
              value={p}
              onChange={(v) => updateProdotto(i, v)}
              onRemove={() => removeProdotto(i)}
            />
          ))}
        </div>
        <Btn
          variant="secondary"
          small
          style={{ marginTop: 10 }}
          onClick={addProdotto}
        >
          + Aggiungi prodotto
        </Btn>
      </div>
      <div
        style={{
          background: "#fff8f4",
          border: `1px solid ${S.accent}`,
          borderRadius: 12,
          padding: 14,
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 600, color: S.primaryDark }}>
          ⏰ Reminder
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
          <div style={{ width: 140 }}>
            <Input
              label="Ripeti dopo (mesi)"
              type="number"
              min={1}
              max={24}
              value={f.reminderMesi}
              onChange={handleMesiChange}
              placeholder="es. 6"
            />
          </div>
          {f.reminderData && (
            <div style={{ fontSize: 13, color: S.muted, paddingBottom: 8 }}>
              → Promemoria il{" "}
              <strong style={{ color: S.primaryDark }}>
                {new Date(f.reminderData).toLocaleDateString("it-IT")}
              </strong>
            </div>
          )}
        </div>
      </div>
      <Textarea label="Note personali" value={f.note} onChange={set("note")} />
      <div
        style={{
          display: "flex",
          gap: 10,
          justifyContent: "flex-end",
          marginTop: 4,
        }}
      >
        <Btn variant="ghost" onClick={onCancel}>
          Annulla
        </Btn>
        <Btn onClick={() => f.nome && f.data && onSave(f)}>
          Salva trattamento
        </Btn>
      </div>
    </div>
  );
};

const CardTrattamento = ({ t, medici, onEdit, onDelete }) => {
  const medico = medici.find((m) => m.id === t.medicoId);
  const hasFoto = t.fotoPrima || t.fotoDopo;
  const reminderDays = t.reminderData ? daysUntil(t.reminderData) : null;
  const [expanded, setExpanded] = useState(false);
  return (
    <div
      style={{
        background: S.card,
        borderRadius: 14,
        border: `1px solid ${S.border}`,
        overflow: "hidden",
        boxShadow: "0 2px 8px rgba(0,0,0,.04)",
      }}
    >
      <div
        onClick={() => setExpanded(!expanded)}
        style={{
          padding: "14px 18px",
          cursor: "pointer",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: S.text }}>
              {t.nome}
            </span>
            <Badge>{t.categoria}</Badge>
          </div>
          <div
            style={{
              fontSize: 13,
              color: S.muted,
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <span>📅 {new Date(t.data).toLocaleDateString("it-IT")}</span>
            {t.zona && <span>📍 {t.zona}</span>}
            {medico && <span>👩‍⚕️ {medico.nome}</span>}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {reminderDays !== null && (
            <Badge
              color={
                reminderDays <= 7
                  ? "#fde68a"
                  : reminderDays < 0
                  ? "#fca5a5"
                  : S.accent
              }
            >
              {reminderDays < 0
                ? `⏰ scaduto ${Math.abs(reminderDays)}g fa`
                : reminderDays === 0
                ? "⏰ oggi!"
                : `⏰ ${reminderDays}g`}
            </Badge>
          )}
          <span style={{ color: S.muted, fontSize: 18 }}>
            {expanded ? "▲" : "▼"}
          </span>
        </div>
      </div>
      {expanded && (
        <div
          style={{ padding: "0 18px 18px", borderTop: `1px solid ${S.border}` }}
        >
          {hasFoto && (
            <div style={{ display: "flex", gap: 16, margin: "14px 0" }}>
              {t.fotoPrima && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                    alignItems: "center",
                  }}
                >
                  <img
                    src={t.fotoPrima}
                    alt="prima"
                    style={{
                      width: 110,
                      height: 110,
                      objectFit: "cover",
                      borderRadius: 10,
                    }}
                  />
                  <span
                    style={{ fontSize: 11, color: S.muted, fontWeight: 600 }}
                  >
                    PRIMA
                  </span>
                </div>
              )}
              {t.fotoDopo && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                    alignItems: "center",
                  }}
                >
                  <img
                    src={t.fotoDopo}
                    alt="dopo"
                    style={{
                      width: 110,
                      height: 110,
                      objectFit: "cover",
                      borderRadius: 10,
                    }}
                  />
                  <span
                    style={{ fontSize: 11, color: S.muted, fontWeight: 600 }}
                  >
                    DOPO
                  </span>
                </div>
              )}
            </div>
          )}
          {t.prodotti?.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: S.muted,
                  marginBottom: 8,
                }}
              >
                Prodotti utilizzati
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {t.prodotti.map((p) => (
                  <div
                    key={p.id}
                    style={{
                      background: "#fdf8f5",
                      border: `1px solid ${S.border}`,
                      borderRadius: 10,
                      padding: "8px 12px",
                      fontSize: 13,
                    }}
                  >
                    <div style={{ fontWeight: 600, color: S.text }}>
                      {p.nome || "—"}
                    </div>
                    {p.brand && (
                      <div style={{ color: S.muted, fontSize: 12 }}>
                        {p.brand}
                      </div>
                    )}
                    {p.etichette?.length > 0 && (
                      <div
                        style={{
                          display: "flex",
                          gap: 4,
                          marginTop: 6,
                          flexWrap: "wrap",
                        }}
                      >
                        {p.etichette.map((src, i) => (
                          <img
                            key={i}
                            src={src}
                            alt="etichetta"
                            style={{
                              width: 44,
                              height: 44,
                              objectFit: "cover",
                              borderRadius: 6,
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          {t.note && (
            <div style={{ fontSize: 13, color: S.muted, marginBottom: 12 }}>
              <strong>Note:</strong> {t.note}
            </div>
          )}
          {t.reminderData && (
            <div
              style={{ fontSize: 13, color: S.primaryDark, marginBottom: 12 }}
            >
              ⏰ Prossimo reminder:{" "}
              <strong>
                {new Date(t.reminderData).toLocaleDateString("it-IT")}
              </strong>
            </div>
          )}
          <div style={{ display: "flex", gap: 8 }}>
            <Btn small variant="secondary" onClick={() => onEdit(t)}>
              ✏️ Modifica
            </Btn>
            <Btn small variant="danger" onClick={() => onDelete(t.id)}>
              Elimina
            </Btn>
          </div>
        </div>
      )}
    </div>
  );
};

const CardMedico = ({ m, trattamenti, onEdit, onDelete }) => {
  const count = trattamenti.filter((t) => t.medicoId === m.id).length;
  return (
    <div
      style={{
        background: S.card,
        borderRadius: 14,
        border: `1px solid ${S.border}`,
        padding: "16px 18px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        boxShadow: "0 2px 8px rgba(0,0,0,.04)",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <div style={{ fontWeight: 700, color: S.text, fontSize: 15 }}>
          {m.nome}
        </div>
        <div
          style={{
            fontSize: 13,
            color: S.muted,
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          {m.specializzazione && <span>🏥 {m.specializzazione}</span>}
          {m.clinica && <span>📍 {m.clinica}</span>}
          {m.telefono && <span>📞 {m.telefono}</span>}
        </div>
        <Badge>
          {count} trattament{count === 1 ? "o" : "i"}
        </Badge>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <Btn small variant="secondary" onClick={() => onEdit(m)}>
          ✏️
        </Btn>
        <Btn small variant="danger" onClick={() => onDelete(m.id)}>
          🗑
        </Btn>
      </div>
    </div>
  );
};

export default function BeautyPass() {
  const [user, setUser] = useState(undefined);
  const [data, setData] = useState(EMPTY_DATA);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState("trattamenti");
  const [showFormT, setShowFormT] = useState(false);
  const [editingT, setEditingT] = useState(null);
  const [showFormM, setShowFormM] = useState(false);
  const [editingM, setEditingM] = useState(null);
  const [filterCat, setFilterCat] = useState("Tutte");
  const saveTimer = useRef(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const d = await loadFromFirestore(u.uid);
        setData(d);
      } else setData(EMPTY_DATA);
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (!user) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    setSaving(true);
    saveTimer.current = setTimeout(async () => {
      await saveToFirestore(user.uid, data);
      setSaving(false);
    }, 1500);
    return () => clearTimeout(saveTimer.current);
  }, [data, user]);

  if (user === undefined)
    return (
      <div
        style={{
          minHeight: "100vh",
          background: S.bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'Segoe UI', system-ui, sans-serif",
        }}
      >
        <div style={{ textAlign: "center", color: S.muted }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>💎</div>
          <div style={{ fontSize: 16 }}>Caricamento...</div>
        </div>
      </div>
    );

  if (!user) return <AuthScreen />;

  const saveTrattamento = (f) => {
    const item = { ...f, id: editingT?.id || uid() };
    setData((d) => ({
      ...d,
      trattamenti: editingT
        ? d.trattamenti.map((t) => (t.id === item.id ? item : t))
        : [item, ...d.trattamenti],
    }));
    setShowFormT(false);
    setEditingT(null);
  };
  const deleteTrattamento = (id) => {
    if (window.confirm("Eliminare questo trattamento?"))
      setData((d) => ({
        ...d,
        trattamenti: d.trattamenti.filter((t) => t.id !== id),
      }));
  };
  const openEditT = (t) => {
    setEditingT(t);
    setShowFormT(true);
  };
  const saveMedico = (f) => {
    const item = { ...f, id: editingM?.id || uid() };
    setData((d) => ({
      ...d,
      medici: editingM
        ? d.medici.map((m) => (m.id === item.id ? item : m))
        : [...d.medici, item],
    }));
    setShowFormM(false);
    setEditingM(null);
  };
  const deleteMedico = (id) => {
    if (window.confirm("Eliminare questo medico?"))
      setData((d) => ({ ...d, medici: d.medici.filter((m) => m.id !== id) }));
  };

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `beautypass_${today()}.json`;
    a.click();
  };
  const importJSON = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = (ev) => {
      try {
        const d = JSON.parse(ev.target.result);
        if (d.trattamenti && d.medici) {
          setData(d);
          alert("Dati importati!");
        }
      } catch {
        alert("File non valido.");
      }
    };
    r.readAsText(f);
    e.target.value = "";
  };

  const reminders = data.trattamenti
    .filter((t) => t.reminderData)
    .map((t) => ({ ...t, days: daysUntil(t.reminderData) }))
    .sort((a, b) => a.days - b.days);
  const urgenti = reminders.filter((t) => t.days <= 30);
  const cats = ["Tutte", ...new Set(data.trattamenti.map((t) => t.categoria))];
  const filtered = (
    filterCat === "Tutte"
      ? [...data.trattamenti]
      : data.trattamenti.filter((t) => t.categoria === filterCat)
  ).sort((a, b) => new Date(b.data) - new Date(a.data));

  return (
    <div
      style={{
        minHeight: "100vh",
        background: S.bg,
        fontFamily: "'Segoe UI', system-ui, sans-serif",
        color: S.text,
      }}
    >
      <div
        style={{
          background: `linear-gradient(135deg, ${S.primary} 0%, ${S.primaryDark} 100%)`,
          padding: "20px 24px 0",
          color: "#fff",
        }}
      >
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <div>
              <h1
                style={{
                  margin: 0,
                  fontSize: 24,
                  fontWeight: 800,
                  letterSpacing: "-0.5px",
                }}
              >
                💎 Beauty Pass
              </h1>
              <div style={{ fontSize: 12, opacity: 0.8, marginTop: 2 }}>
                {saving ? "💾 Salvataggio..." : "✓ Salvato"} · {user.email}
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <label
                style={{
                  background: "rgba(255,255,255,.2)",
                  color: "#fff",
                  borderRadius: 8,
                  padding: "7px 14px",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                📥 Importa
                <input
                  type="file"
                  accept=".json"
                  style={{ display: "none" }}
                  onChange={importJSON}
                />
              </label>
              <Btn
                small
                style={{ background: "rgba(255,255,255,.2)", color: "#fff" }}
                onClick={exportJSON}
              >
                📤 Esporta
              </Btn>
              <Btn
                small
                style={{ background: "rgba(255,255,255,.15)", color: "#fff" }}
                onClick={() => signOut(auth)}
              >
                Esci
              </Btn>
            </div>
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            {[
              { id: "trattamenti", label: "Trattamenti" },
              { id: "medici", label: "Medici" },
              {
                id: "reminder",
                label: `Reminder${
                  urgenti.length ? ` (${urgenti.length})` : ""
                }`,
              },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                style={{
                  background: tab === t.id ? "#fff" : "transparent",
                  color: tab === t.id ? S.primaryDark : "rgba(255,255,255,.8)",
                  border: "none",
                  borderRadius: "8px 8px 0 0",
                  padding: "9px 18px",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div
        style={{ maxWidth: 720, margin: "0 auto", padding: "20px 16px 60px" }}
      >
        {tab === "trattamenti" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 10,
              }}
            >
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {cats.map((c) => (
                  <button
                    key={c}
                    onClick={() => setFilterCat(c)}
                    style={{
                      background: filterCat === c ? S.primary : S.card,
                      color: filterCat === c ? "#fff" : S.muted,
                      border: `1px solid ${
                        filterCat === c ? S.primary : S.border
                      }`,
                      borderRadius: 20,
                      padding: "4px 12px",
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    {c}
                  </button>
                ))}
              </div>
              <Btn
                onClick={() => {
                  setEditingT(null);
                  setShowFormT(true);
                }}
              >
                + Nuovo trattamento
              </Btn>
            </div>
            {filtered.length === 0 && (
              <div
                style={{
                  textAlign: "center",
                  padding: "48px 24px",
                  color: S.muted,
                  background: S.card,
                  borderRadius: 14,
                  border: `1px dashed ${S.border}`,
                }}
              >
                <div style={{ fontSize: 40, marginBottom: 12 }}>💆‍♀️</div>
                <div style={{ fontSize: 16, fontWeight: 600 }}>
                  Nessun trattamento
                </div>
                <div style={{ fontSize: 13, marginTop: 4 }}>
                  Aggiungi il tuo primo trattamento estetico
                </div>
              </div>
            )}
            {filtered.map((t) => (
              <CardTrattamento
                key={t.id}
                t={t}
                medici={data.medici}
                onEdit={openEditT}
                onDelete={deleteTrattamento}
              />
            ))}
          </div>
        )}

        {tab === "medici" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <Btn
                onClick={() => {
                  setEditingM(null);
                  setShowFormM(true);
                }}
              >
                + Aggiungi medico
              </Btn>
            </div>
            {data.medici.length === 0 && (
              <div
                style={{
                  textAlign: "center",
                  padding: "48px 24px",
                  color: S.muted,
                  background: S.card,
                  borderRadius: 14,
                  border: `1px dashed ${S.border}`,
                }}
              >
                <div style={{ fontSize: 40, marginBottom: 12 }}>👩‍⚕️</div>
                <div style={{ fontSize: 16, fontWeight: 600 }}>
                  Nessun medico
                </div>
                <div style={{ fontSize: 13, marginTop: 4 }}>
                  Aggiungi medico
                </div>
              </div>
            )}
            {data.medici.map((m) => (
              <CardMedico
                key={m.id}
                m={m}
                trattamenti={data.trattamenti}
                onEdit={(m) => {
                  setEditingM(m);
                  setShowFormM(true);
                }}
                onDelete={deleteMedico}
              />
            ))}
          </div>
        )}

        {tab === "reminder" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {reminders.length === 0 && (
              <div
                style={{
                  textAlign: "center",
                  padding: "48px 24px",
                  color: S.muted,
                  background: S.card,
                  borderRadius: 14,
                  border: `1px dashed ${S.border}`,
                }}
              >
                <div style={{ fontSize: 40, marginBottom: 12 }}>⏰</div>
                <div style={{ fontSize: 16, fontWeight: 600 }}>
                  Nessun reminder impostato
                </div>
                <div style={{ fontSize: 13, marginTop: 4 }}>
                  Imposta un reminder nei trattamenti
                </div>
              </div>
            )}
            {reminders.map((t) => {
              const medico = data.medici.find((m) => m.id === t.medicoId);
              const overdue = t.days < 0;
              const imminent = t.days >= 0 && t.days <= 7;
              const color = overdue
                ? "#fca5a5"
                : imminent
                ? "#fde68a"
                : S.accent;
              return (
                <div
                  key={t.id}
                  style={{
                    background: S.card,
                    border: `1px solid ${color}`,
                    borderLeft: `4px solid ${
                      overdue ? S.danger : imminent ? "#f59e0b" : S.primary
                    }`,
                    borderRadius: 12,
                    padding: "14px 18px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <div>
                    <div
                      style={{ fontWeight: 700, fontSize: 15, color: S.text }}
                    >
                      {t.nome}
                    </div>
                    <div style={{ fontSize: 13, color: S.muted, marginTop: 3 }}>
                      <span>
                        📅 {new Date(t.data).toLocaleDateString("it-IT")}
                      </span>
                      {medico && (
                        <span style={{ marginLeft: 12 }}>👩‍⚕️ {medico.nome}</span>
                      )}
                    </div>
                    <div style={{ fontSize: 13, marginTop: 6 }}>
                      Reminder:{" "}
                      <strong
                        style={{ color: overdue ? S.danger : S.primaryDark }}
                      >
                        {new Date(t.reminderData).toLocaleDateString("it-IT")}
                      </strong>
                    </div>
                  </div>
                  <Badge color={color}>
                    {overdue
                      ? `scaduto ${Math.abs(t.days)}g fa`
                      : t.days === 0
                      ? "oggi!"
                      : `tra ${t.days}g`}
                  </Badge>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showFormT && (
        <Modal
          title={editingT ? "Modifica trattamento" : "Nuovo trattamento"}
          onClose={() => {
            setShowFormT(false);
            setEditingT(null);
          }}
        >
          <FormTrattamento
            initial={editingT || {}}
            medici={data.medici}
            onSave={saveTrattamento}
            onCancel={() => {
              setShowFormT(false);
              setEditingT(null);
            }}
          />
        </Modal>
      )}
      {showFormM && (
        <Modal
          title={editingM ? "Modifica medico" : "Aggiungi medico"}
          onClose={() => {
            setShowFormM(false);
            setEditingM(null);
          }}
        >
          <FormMedico
            initial={editingM || {}}
            onSave={saveMedico}
            onCancel={() => {
              setShowFormM(false);
              setEditingM(null);
            }}
          />
        </Modal>
      )}
    </div>
  );
}
