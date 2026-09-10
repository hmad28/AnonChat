# DESIGN.md — AnonChat Design System & Direction

## 1. Identity & Mood
- **Product**: AnonChat (Ephemeral Realtime P2P Chat)
- **Character**: "Tactile Tactical Privacy" — Sebuah instrumen komunikasi rahasia yang presisi, berbobot, tenang, dan dapat diandalkan. Bukan aplikasi AI generik yang dipenuhi efek neon dan gradient ungu mengambang.
- **Tone**: Jujur, lugas, tanpa jargon pemasaran ("AI Powered", "Revolutionary" dihapus total).

## 2. Liveliness Dials
- **ENERGY**: **2 (Balanced)** — Berbobot dan terstruktur rapi, menyapa pengguna dengan kejelasan fungsi tanpa orbs atau glow murahan.
- **RHYTHM**: **2 (Structured & Intentional)** — Hirarki visual bertingkat yang konsisten; ruang percakapan menjadi fokus utama (one focal point).
- **MOTION**: **1 (Calm & Purpose-driven)** — Transisi instan dan halus (150ms-200ms) hanya saat interaksi nyata terjadi (klik, dialog muncul, pengiriman pesan). Tidak ada elemen yang terus mengambang atau berdenyut tanpa henti.

## 3. Color Palette (R-29: Max 2-3 core + 1 accent)
- **Surface Deep**: `slate-950` (#020617) — Latar belakang matte pekat yang stabil.
- **Surface Elevated**: `slate-900` (#0f172a) dengan border `slate-800` (#1e293b) — Kartu dan panel instrumen.
- **Text Primary**: `slate-100` (#f1f5f9) — Kontras rasio > 12:1 di atas background (Jauh melampaui standar WCAG AA 4.5:1).
- **Text Secondary**: `slate-400` (#94a3b8) — Kontras rasio > 5.2:1 di atas background.
- **Functional Accent (Action)**: `indigo-600` (#4f46e5) / `indigo-500` (#6366f1) — Digunakan eksklusif untuk tindakan primer.
- **Status Accents**:
  - `emerald-500` (#10b981) — Status terhubung & E2EE aktif.
  - `amber-500` (#f59e0b) — Notifikasi izin masuk (Knock) & pesan menghilang.
  - `rose-500` (#f43f5e) — Pembubaran room / penolakan.

## 4. Typography (R-06)
- **Primary Body/UI**: Sans-serif sistem berkecepatan tinggi dengan bobot medium/semibold.
- **Data & Security**: Monospace bersih (`font-mono`) eksklusif untuk Room Code, Safety Numbers, dan Timestamp.
- **Copy Rule (R-02)**: Karakter em dash (`—`) dilarang keras di seluruh antarmuka.

## 5. Shape & Spatial Hierarchy (R-11)
- **Containers & Panels**: `rounded-2xl` (16px).
- **Buttons & Inputs**: `rounded-xl` (12px) dengan tinggi minimum 44px untuk kenyamanan sentuhan jari (R-03).
- **No Pill Everywhere**: Menghilangkan kapsul berlebihan pada semua elemen.
