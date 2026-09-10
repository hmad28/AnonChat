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
  const [guestNick, setGuestNick] = useState('');
  const [joinInput, setJoinInput] = useState(initialRoomId || '');
  const [activeTab, setActiveTab] = useState<'create' | 'join'>(initialRoomId ? 'join' : 'create');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const finalNick = hostNick.trim() || `ANON_${Math.floor(100 + Math.random() * 900)}`;
    const newRoomId = generateRoomId();
    onStartRoom(newRoomId, finalNick, true);
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
    onStartRoom(parsedRoomId, finalNick, false);
  };

  return (
    <main className="min-h-screen relative flex flex-col justify-center items-center px-4 py-10 bg-[#0B0E14] text-[#E0E6ED] crt-overlay overflow-hidden">
      {/* Background Matrix Rain */}
      <MatrixRain opacity={0.12} />

      <div className="w-full max-w-lg space-y-6 relative z-10">
        {/* Terminal Header */}
        <div className="border border-[#1F2937] bg-[#05070A]/90 p-5 shadow-2xl relative">
          {/* Corner crosshairs */}
          <div className="absolute top-0 left-0 text-[#00FF66] text-[10px] leading-none -translate-x-1 -translate-y-1 select-none">+</div>
          <div className="absolute top-0 right-0 text-[#00FF66] text-[10px] leading-none translate-x-1 -translate-y-1 select-none">+</div>
          <div className="absolute bottom-0 left-0 text-[#00FF66] text-[10px] leading-none -translate-x-1 translate-y-1 select-none">+</div>
          <div className="absolute bottom-0 right-0 text-[#00FF66] text-[10px] leading-none translate-x-1 translate-y-1 select-none">+</div>

          <div className="flex items-center justify-between border-b border-[#1F2937] pb-3 mb-4">
            <div className="flex items-center space-x-2.5">
              <GuyFawkesIcon size={32} color="#00FF66" />
              <div>
                <div className="text-xs font-bold tracking-widest text-[#00FF66] uppercase terminal-glow">
                  ANONCHAT // NET_TERMINAL
                </div>
                <div className="text-[10px] text-[#8A99AD] font-mono">
                  SECURITY_LEVEL: AIRGAP_VOLATILE // E2EE
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-1 text-[10px] font-mono text-[#00F0FF] bg-[#00F0FF]/10 px-2 py-0.5 border border-[#00F0FF]/30">
              <span className="w-1.5 h-1.5 bg-[#00FF66] animate-pulse" />
              <span>NODE_READY</span>
            </div>
          </div>

          <p className="text-xs text-[#8A99AD] leading-relaxed">
            Sistem komunikasi terdesentralisasi murni Peer-to-Peer. Bebas jejak riwayat, zero database, dan seluruh koneksi tamu tunduk pada otorisasi langsung dari Root Host.
          </p>
        </div>

        {/* Action Panel */}
        <div className="border-2 border-[#1F2937] bg-[#05070A]/95 p-6 shadow-2xl relative">
          {/* Mode Switcher */}
          <div className="grid grid-cols-2 gap-2 mb-6 border-b border-[#1F2937] pb-4">
            <button
              type="button"
              onClick={() => setActiveTab('create')}
              className={`h-10 text-xs font-bold tracking-wider transition uppercase flex items-center justify-center space-x-1.5 ${
                activeTab === 'create'
                  ? 'bg-[#00FF66] text-[#0B0E14] shadow-[0_0_12px_rgba(0,255,102,0.3)]'
                  : 'bg-[#111827] text-[#8A99AD] hover:text-[#E0E6ED] border border-[#1F2937]'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>[ 01: INITIALIZE_ROOM ]</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('join')}
              className={`h-10 text-xs font-bold tracking-wider transition uppercase flex items-center justify-center space-x-1.5 ${
                activeTab === 'join'
                  ? 'bg-[#00F0FF] text-[#0B0E14] shadow-[0_0_12px_rgba(0,240,255,0.3)]'
                  : 'bg-[#111827] text-[#8A99AD] hover:text-[#E0E6ED] border border-[#1F2937]'
              }`}
            >
              <Key className="w-3.5 h-3.5" />
              <span>[ 02: INJECT_TOKEN ]</span>
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
                </div>
                <input
                  type="text"
                  required
                  placeholder="Tempel tautan atau ketik kode room target..."
                  value={joinInput}
                  onChange={(e) => setJoinInput(e.target.value)}
                  className="w-full h-11 bg-[#0B0E14] border border-[#1F2937] focus:border-[#00F0FF] text-[#00F0FF] placeholder-[#374151] text-xs px-3.5 transition outline-none font-mono"
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
        <div className="grid grid-cols-3 gap-2 text-[10px] font-mono">
          <div className="p-2.5 border border-[#1F2937] bg-[#05070A]/80 space-y-0.5">
            <div className="text-[#00FF66] font-bold flex items-center gap-1">
              <Shield className="w-3 h-3" />
              <span>CIPHER</span>
            </div>
            <div className="text-[#E0E6ED]">AES-GCM-256</div>
            <div className="text-[#8A99AD]">WebCrypto Native</div>
          </div>
          <div className="p-2.5 border border-[#1F2937] bg-[#05070A]/80 space-y-0.5">
            <div className="text-[#00F0FF] font-bold flex items-center gap-1">
              <Binary className="w-3 h-3" />
              <span>STORAGE</span>
            </div>
            <div className="text-[#E0E6ED]">0x00_NONE</div>
            <div className="text-[#8A99AD]">RAM Only / Volatile</div>
          </div>
          <div className="p-2.5 border border-[#1F2937] bg-[#05070A]/80 space-y-0.5">
            <div className="text-[#FF003C] font-bold flex items-center gap-1">
              <Cpu className="w-3 h-3" />
              <span>NETWORK</span>
            </div>
            <div className="text-[#E0E6ED]">P2P_MESH</div>
            <div className="text-[#8A99AD]">Zero Server Intermediary</div>
          </div>
        </div>
      </div>
    </main>
  );
};
