import React, { useState } from 'react';
import { Terminal, Shield, Key, ArrowRight, CornerDownRight, Binary, Cpu } from 'lucide-react';
import { generateRoomId } from '../utils/id';
import { GuyFawkesIcon } from '../components/GuyFawkesIcon';
import { MatrixRain } from '../components/MatrixRain';

interface HomeProps {
  onStartRoom: (roomId: string, nickname: string, isHost: boolean) => void;
  initialRoomId?: string;
}

export const Home: React.FC<HomeProps> = ({ onStartRoom, initialRoomId }) => {
  const [hostNick, setHostNick] = useState('');
  const [customRoomId, setCustomRoomId] = useState('');
  const [guestNick, setGuestNick] = useState('');
  const [joinInput, setJoinInput] = useState(initialRoomId || '');
  const [activeTab, setActiveTab] = useState<'create' | 'join'>(initialRoomId ? 'join' : 'create');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const finalNick = hostNick.trim() || `ANON_${Math.floor(100 + Math.random() * 900)}`;
    const finalRoomId = customRoomId.trim().toUpperCase().replace(/[^A-Z0-9-]/g, '') || generateRoomId(6);
    onStartRoom(finalRoomId, finalNick, true);
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinInput.trim()) return;

    let parsedRoomId = joinInput.trim();
    try {
      if (parsedRoomId.includes('http://') || parsedRoomId.includes('https://') || parsedRoomId.includes('?room=')) {
        const url = new URL(parsedRoomId.startsWith('http') ? parsedRoomId : `http://dummy.com/${parsedRoomId}`);
        const qRoom = url.searchParams.get('room');
        if (qRoom) parsedRoomId = qRoom;
        if (url.hash) {
          window.location.hash = url.hash;
        }
      }
    } catch {}

    const finalNick = guestNick.trim() || `GUEST_${Math.floor(100 + Math.random() * 900)}`;
    const finalRoomId = parsedRoomId.includes('/') ? parsedRoomId : parsedRoomId.toUpperCase();
    onStartRoom(finalRoomId, finalNick, false);
  };

  return (
    <main className="min-h-screen relative flex flex-col justify-center items-center px-3 sm:px-4 py-6 sm:py-10 bg-[#0B0E14] text-[#E0E6ED] crt-overlay overflow-y-auto">
      {/* Background Matrix Rain */}
      <MatrixRain opacity={0.12} />

      <div className="w-full max-w-lg space-y-4 sm:space-y-6 relative z-10 my-auto">
        {/* Terminal Header */}
        <div className="border border-[#1F2937] bg-[#05070A]/90 p-4 sm:p-5 shadow-2xl relative">
          {/* Corner crosshairs */}
          <div className="absolute top-0 left-0 text-[#00FF66] text-[10px] leading-none -translate-x-1 -translate-y-1 select-none">+</div>
          <div className="absolute top-0 right-0 text-[#00FF66] text-[10px] leading-none translate-x-1 -translate-y-1 select-none">+</div>
          <div className="absolute bottom-0 left-0 text-[#00FF66] text-[10px] leading-none -translate-x-1 translate-y-1 select-none">+</div>
          <div className="absolute bottom-0 right-0 text-[#00FF66] text-[10px] leading-none translate-x-1 translate-y-1 select-none">+</div>

          <div className="flex items-center justify-between border-b border-[#1F2937] pb-3 mb-3 sm:mb-4">
            <div className="flex items-center space-x-2 sm:space-x-2.5 min-w-0">
              <GuyFawkesIcon size={28} color="#00FF66" />
              <div className="min-w-0">
                <div className="text-xs sm:text-sm font-bold tracking-wider text-[#00FF66] uppercase terminal-glow truncate">
                  ANONCHAT // NET_TERMINAL
                </div>
                <div className="text-[9px] sm:text-[10px] text-[#8A99AD] font-mono">
                  SECURITY: AIRGAP_VOLATILE // E2EE
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-1 text-[9px] sm:text-[10px] font-mono text-[#00F0FF] bg-[#00F0FF]/10 px-1.5 sm:px-2 py-0.5 border border-[#00F0FF]/30 shrink-0">
              <span className="w-1.5 h-1.5 bg-[#00FF66] animate-pulse" />
              <span>READY</span>
            </div>
          </div>

          <p className="text-[11px] sm:text-xs text-[#8A99AD] leading-relaxed">
            Sistem komunikasi terdesentralisasi murni Peer-to-Peer. Bebas jejak riwayat, zero database, dan seluruh koneksi tamu tunduk pada otorisasi langsung dari Root Host.
          </p>
        </div>

        {/* Action Panel */}
        <div className="border-2 border-[#1F2937] bg-[#05070A]/95 p-4 sm:p-6 shadow-2xl relative">
          {/* Mode Switcher */}
          <div className="grid grid-cols-2 gap-1.5 sm:gap-2 mb-4 sm:mb-6 border-b border-[#1F2937] pb-3 sm:pb-4">
            <button
              type="button"
              onClick={() => setActiveTab('create')}
              className={`h-10 text-[11px] sm:text-xs font-bold tracking-wider transition uppercase flex items-center justify-center space-x-1 sm:space-x-1.5 cursor-pointer ${
                activeTab === 'create'
                  ? 'bg-[#00FF66] text-[#0B0E14] shadow-[0_0_12px_rgba(0,255,102,0.3)]'
                  : 'bg-[#111827] text-[#8A99AD] hover:text-[#E0E6ED] border border-[#1F2937]'
              }`}
            >
              <Terminal className="w-3.5 h-3.5 shrink-0" />
              <span>[ 01: INITIALIZE ]</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('join')}
              className={`h-10 text-[11px] sm:text-xs font-bold tracking-wider transition uppercase flex items-center justify-center space-x-1 sm:space-x-1.5 cursor-pointer ${
                activeTab === 'join'
                  ? 'bg-[#00F0FF] text-[#0B0E14] shadow-[0_0_12px_rgba(0,240,255,0.3)]'
                  : 'bg-[#111827] text-[#8A99AD] hover:text-[#E0E6ED] border border-[#1F2937]'
              }`}
            >
              <Key className="w-3.5 h-3.5 shrink-0" />
              <span>[ 02: INJECT ]</span>
            </button>
          </div>

          {activeTab === 'create' ? (
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-xs font-mono text-[#8A99AD] mb-1.5">
                  <span className="text-[#00FF66]">&gt; ROOT_CODENAME:</span>
                  <span className="text-[10px] text-[#8A99AD]">[MAX_25_CHARS]</span>
                </div>
                <input
                  type="text"
                  placeholder="Contoh: PHANTOM_OPERATOR"
                  value={hostNick}
                  onChange={(e) => setHostNick(e.target.value)}
                  maxLength={25}
                  className="w-full h-11 bg-[#0B0E14] border border-[#1F2937] focus:border-[#00FF66] text-[#00FF66] placeholder-[#374151] text-xs px-3.5 transition outline-none font-mono font-semibold"
                />
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-mono text-[#8A99AD] mb-1.5">
                  <span className="text-[#00FF66]">&gt; KODE_ROOM (OPSIONAL):</span>
                  <span className="text-[10px] text-[#8A99AD]">[AUTO 6 KARAKTER]</span>
                </div>
                <input
                  type="text"
                  placeholder="Kosongkan untuk otomatis (misal: 7K9MP2)"
                  value={customRoomId}
                  onChange={(e) => setCustomRoomId(e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, ''))}
                  maxLength={16}
                  className="w-full h-11 bg-[#0B0E14] border border-[#1F2937] focus:border-[#00FF66] text-[#00FF66] placeholder-[#374151] text-xs px-3.5 transition outline-none font-mono tracking-wider font-semibold uppercase"
                />
                <div className="text-[10px] text-[#8A99AD] mt-1.5 flex items-center gap-1">
                  <CornerDownRight className="w-3 h-3 text-[#00FF66]" />
                  <span>Anda bertindak sebagai Gatekeeper: hanya tamu yang Anda ACC yang bisa masuk.</span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full h-12 bg-[#00FF66] hover:bg-[#00dd55] text-[#0B0E14] font-bold text-xs tracking-wider uppercase transition shadow-[0_0_15px_rgba(0,255,102,0.3)] flex items-center justify-center space-x-2 cursor-pointer"
              >
                <span>[ EXECUTE: GENERATE_SECURE_ROOM ]</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleJoin} className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-xs font-mono text-[#8A99AD] mb-1.5">
                  <span className="text-[#00F0FF]">&gt; TARGET_ROOM_TOKEN_OR_URL:</span>
                  <span className="text-[10px] text-[#8A99AD]">[6-8 CHARS / URL]</span>
                </div>
                <input
                  type="text"
                  required
                  placeholder="Ketik 6 digit kode room (misal: 7K9MP2) atau tempel link..."
                  value={joinInput}
                  onChange={(e) => setJoinInput(e.target.value)}
                  className="w-full h-11 bg-[#0B0E14] border border-[#1F2937] focus:border-[#00F0FF] text-[#00F0FF] placeholder-[#374151] text-xs px-3.5 transition outline-none font-mono tracking-wide"
                />
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-mono text-[#8A99AD] mb-1.5">
                  <span className="text-[#00F0FF]">&gt; CALLSIGN_GUEST:</span>
                </div>
                <input
                  type="text"
                  placeholder="Contoh: CIPHER_GUEST"
                  value={guestNick}
                  onChange={(e) => setGuestNick(e.target.value)}
                  maxLength={25}
                  className="w-full h-11 bg-[#0B0E14] border border-[#1F2937] focus:border-[#00F0FF] text-[#E0E6ED] placeholder-[#374151] text-xs px-3.5 transition outline-none font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={!joinInput.trim()}
                className="w-full h-12 bg-[#00F0FF] hover:bg-[#00cce6] disabled:opacity-40 text-[#0B0E14] font-bold text-xs tracking-wider uppercase transition shadow-[0_0_15px_rgba(0,240,255,0.3)] flex items-center justify-center space-x-2 cursor-pointer"
              >
                <span>[ INITIATE_KNOCK: REQUEST_ENTRY ]</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>

        {/* Technical Architecture Specs Box */}
        <div className="grid grid-cols-3 gap-1.5 sm:gap-2 text-[9px] sm:text-[10px] font-mono">
          <div className="p-2 sm:p-2.5 border border-[#1F2937] bg-[#05070A]/80 space-y-0.5">
            <div className="text-[#00FF66] font-bold flex items-center gap-1">
              <Shield className="w-3 h-3 shrink-0" />
              <span>CIPHER</span>
            </div>
            <div className="text-[#E0E6ED] truncate">AES-GCM-256</div>
            <div className="text-[#8A99AD] truncate">WebCrypto</div>
          </div>
          <div className="p-2 sm:p-2.5 border border-[#1F2937] bg-[#05070A]/80 space-y-0.5">
            <div className="text-[#00F0FF] font-bold flex items-center gap-1">
              <Binary className="w-3 h-3 shrink-0" />
              <span>STORAGE</span>
            </div>
            <div className="text-[#E0E6ED] truncate">0x00_NONE</div>
            <div className="text-[#8A99AD] truncate">Volatile RAM</div>
          </div>
          <div className="p-2 sm:p-2.5 border border-[#1F2937] bg-[#05070A]/80 space-y-0.5">
            <div className="text-[#FF003C] font-bold flex items-center gap-1">
              <Cpu className="w-3 h-3 shrink-0" />
              <span>NETWORK</span>
            </div>
            <div className="text-[#E0E6ED] truncate">P2P_MESH</div>
            <div className="text-[#8A99AD] truncate">Zero Server</div>
          </div>
        </div>
      </div>
    </main>
  );
};
