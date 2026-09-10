import React, { useState } from 'react';
import { Copy, Check, Volume2, VolumeX, Users, Eye, EyeOff, XOctagon } from 'lucide-react';
import { sound } from '../utils/audio';
import { GuyFawkesIcon } from './GuyFawkesIcon';
import { copyToClipboard } from '../utils/clipboard';

interface HeaderProps {
  roomId: string;
  isHost: boolean;
  participantCount: number;
  onLeaveOrDissolve: () => void;
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
  onOpenSecurityModal: () => void;
  isStealthMode: boolean;
  onToggleStealthMode: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  roomId,
  isHost,
  participantCount,
  onLeaveOrDissolve,
  onToggleSidebar,
  isSidebarOpen,
  onOpenSecurityModal,
  isStealthMode,
  onToggleStealthMode,
}) => {
  const [copied, setCopied] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [soundMuted, setSoundMuted] = useState(!sound.enabled);

  const copyRoomLink = async () => {
    const url = window.location.href;
    const ok = await copyToClipboard(url);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const copyRoomCode = async () => {
    const ok = await copyToClipboard(roomId);
    if (ok) {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const toggleSound = () => {
    sound.enabled = !sound.enabled;
    setSoundMuted(!sound.enabled);
  };

  return (
    <header className="h-16 border-b-2 border-[#1F2937] bg-[#05070A] px-4 flex items-center justify-between sticky top-0 z-30 font-mono">
      <div className="flex items-center space-x-3">
        <button
          type="button"
          onClick={onOpenSecurityModal}
          className="border border-[#1F2937] bg-[#0B0E14] p-1.5 hover:border-[#00FF66] transition cursor-pointer"
          title="Verifikasi Kriptografi E2EE"
        >
          <GuyFawkesIcon size={28} color="#00FF66" />
        </button>
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-bold text-xs tracking-wider text-white uppercase">ANONCHAT_OS</span>
            <button
              type="button"
              onClick={onOpenSecurityModal}
              className="text-[10px] px-1.5 py-0.5 bg-[#00FF66]/10 text-[#00FF66] font-bold border border-[#00FF66]/40 hover:bg-[#00FF66]/20 transition cursor-pointer"
            >
              [ E2EE: AES-256 ]
            </button>
          </div>
          <div className="flex items-center space-x-2 text-[11px] text-[#8A99AD] mt-0.5">
            <button
              type="button"
              onClick={copyRoomCode}
              className="hover:text-white transition flex items-center gap-1 cursor-pointer bg-[#0B0E14] px-1 py-0.5 border border-[#1F2937] hover:border-[#00F0FF]"
              title="Klik untuk salin kode token room"
            >
              <span>NODE:</span>
              <span className="text-[#00F0FF] font-bold">{roomId}</span>
              {copiedCode ? (
                <span className="text-[9px] text-[#00FF66] font-bold ml-1">[COPIED]</span>
              ) : (
                <Copy className="w-2.5 h-2.5 text-[#8A99AD] ml-0.5" />
              )}
            </button>
            {isHost && (
              <span className="px-1 text-[9px] bg-[#FF003C]/10 text-[#FF003C] border border-[#FF003C]/40 font-bold">
                ROOT_HOST
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2 text-xs">
        {/* Camouflage / Stealth Mode */}
        <button
          type="button"
          onClick={onToggleStealthMode}
          className={`h-9 px-2.5 font-bold border transition flex items-center space-x-1.5 ${
            isStealthMode
              ? 'bg-[#FF003C]/20 border-[#FF003C] text-[#FF003C]'
              : 'bg-[#0B0E14] hover:bg-[#111827] border-[#1F2937] text-[#8A99AD]'
          }`}
          title="Toggle Camo Mode (Esc)"
        >
          {isStealthMode ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5 text-[#8A99AD]" />}
          <span className="hidden md:inline">
            {isStealthMode ? '[ CAMO_ACTIVE ]' : '[ CAMO ]'}
          </span>
        </button>

        {/* Copy Link */}
        <button
          type="button"
          onClick={copyRoomLink}
          className={`h-9 px-2.5 font-bold border transition flex items-center space-x-1.5 ${
            copied
              ? 'bg-[#00FF66]/20 text-[#00FF66] border-[#00FF66]'
              : 'bg-[#0B0E14] hover:bg-[#111827] text-[#E0E6ED] border-[#1F2937]'
          }`}
          title="Salin tautan room terenkripsi"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-[#00FF66]" />
              <span>[ COPIED ]</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-[#8A99AD]" />
              <span className="hidden sm:inline">[ SHARE_LINK ]</span>
            </>
          )}
        </button>

        {/* Audio Toggle */}
        <button
          type="button"
          onClick={toggleSound}
          className="w-9 h-9 flex items-center justify-center border border-[#1F2937] bg-[#0B0E14] hover:bg-[#111827] text-[#8A99AD] hover:text-[#00FF66] transition"
          title={soundMuted ? 'Nyalakan Audio' : 'Matikan Audio'}
        >
          {soundMuted ? <VolumeX className="w-4 h-4 text-[#8A99AD]" /> : <Volume2 className="w-4 h-4 text-[#00FF66]" />}
        </button>

        {/* Client Count */}
        <button
          type="button"
          onClick={onToggleSidebar}
          className={`h-9 px-2.5 font-bold border transition flex items-center space-x-1.5 ${
            isSidebarOpen
              ? 'bg-[#00F0FF]/20 border-[#00F0FF] text-[#00F0FF]'
              : 'bg-[#0B0E14] hover:bg-[#111827] border-[#1F2937] text-[#8A99AD]'
          }`}
          title="Daftar Node Terhubung"
        >
          <Users className="w-3.5 h-3.5 text-[#00F0FF]" />
          <span>[{participantCount}]</span>
        </button>

        {/* Terminate Session */}
        <button
          type="button"
          onClick={onLeaveOrDissolve}
          className="h-9 px-2.5 font-bold bg-[#FF003C]/10 hover:bg-[#FF003C] text-[#FF003C] hover:text-[#0B0E14] border border-[#FF003C]/50 transition flex items-center space-x-1"
          title={isHost ? 'Musnahkan Room Ini' : 'Putuskan Koneksi'}
        >
          <XOctagon className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{isHost ? '[ TERMINATE ]' : '[ DISCONNECT ]'}</span>
        </button>
      </div>
    </header>
  );
};
