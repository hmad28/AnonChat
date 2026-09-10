# DESIGN.md — AnonChat Hacker Terminal Design System

## 1. Identitas & Karakter Visual
- **Tema**: "Cyberpunk Hacker Terminal / Anonymous Crypt"
- **Karakter**: Taktis, presisi, industrial, berbobot, dan misterius. Terinspirasi oleh antarmuka sistem operasi keamanan siber, terminal CRT, dan estetika Anonymous Guy Fawkes mask.

## 2. Palet Warna (Color Palette)
- **Background Utama**: `#0B0E14` (Dark Charcoal / Near Black)
- **Background Panel/Elevated**: `#05070A` (Deep Matte Black)
- **Aksen Utama (Terminal)**: `#00FF66` (Neon Terminal Green)
- **Aksen Sekunder (Data/Link)**: `#00F0FF` (Cyber Cyan)
- **Aksen Bahaya/Peringatan**: `#FF003C` (Bright Crimson Red)
- **Teks Utama**: `#E0E6ED` (High-Contrast Crisp Light Gray)
- **Teks Muted/Sekunder**: `#8A99AD` (Tactical Muted Gray)
- **Border**: `#1F2937` (Dark Slate Border)

## 3. Tipografi
- **Header & Judul**: `'Share Tech Mono', 'Fira Code', monospace`
- **Body UI & Chat Logs**: `'JetBrains Mono', Consolas, monospace`
- **Copywriting**: Bebas em dash (`—`), bahasa ringkas, berbasis kode komando terminal (`[ EXECUTE ]`, `[ TRANSMIT ]`, `[ REJECT ]`).

## 4. Elemen Visual & Geometri
- **Sudut Serba Tajam**: `border-radius: 0px` ditegakkan pada seluruh elemen UI (kartu, tombol, input, modal).
- **CRT Scanlines**: Efek visual scanline horizontal halus (`.crt-overlay`).
- **Matrix Code Rain**: Efek hujan karakter digital biner/katakana samar di latar belakang canvas (opacity 6% - 15%).
- **Ikonografi**: Vektor geometris Guy Fawkes Mask minimalis custom dengan kontur tajam dan aksen crosshair terminal.
