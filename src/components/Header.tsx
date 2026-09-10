import React, { useState } from 'react';
import { Copy, Check, Volume2, VolumeX, Users, Eye, EyeOff, LogOut, Share2 } from 'lucide-react';
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
    <header className="h-14 sm:h-16 border-b-2 border-[#1F2937] bg-[#05070A] px-2.5 sm:px-4 flex items-center justify-between sticky top-0 z-30 font-mono">
      {/* Brand & Node Identity */}
      <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
        <button
          type="button"
          onClick={onOpenSecurityModal}
          className="border border-[#1F2937] bg-[#0B0E14] p-1 sm:p-1.5 hover:border-[#00FF66] transition cursor-pointer shrink-0"
          title="Verifikasi Kriptografi E2EE"
        >
          <GuyFawkesIcon size={24} color="#00FF66" />
        </button>

        <div className="min-w-0">
          <div className="flex items-center space-x-1.5">
            <span className="font-bold text-xs sm:text-sm tracking-wider text-white uppercase truncate">
              ANONCHAT
            </span>
            <button
              type="button"
              onClick={onOpenSecurityModal}
              className="text-[9px] px-1 py-0.2 bg-[#00FF66]/10 text-[#00FF66] font-bold border border-[#00FF66]/30 hover:bg-[#00FF66]/20 transition shrink-0"
              title="AES-GCM-256 E2EE Aktif"
            >
              E2EE
            </button>
            {isHost && (
              <span className="hidden sm:inline-block px-1 text-[9px] bg-[#FF003C]/10 text-[#FF003C] border border-[#FF003C]/40 font-bold shrink-0">
                ROOT
              </span>
            )}
          </div>

          <div className="flex items-center text-[10px] text-[#8A99AD] mt-0.5">
            <button
              type="button"
              onClick={copyRoomCode}
              className="hover:text-white transition flex items-center gap-1 cursor-pointer bg-[#0B0E14] px-1 py-0.2 border border-[#1F2937] hover:border-[#00F0FF] max-w-[120px] sm:max-w-[200px]"
              title="Klik untuk salin kode room ini"
            >
              <span className="text-[#00F0FF] font-bold truncate">{roomId}</span>
              {copiedCode ? (
                <span className="text-[8px] text-[#00FF66] font-bold shrink-0">[OK]</span>
              ) : (
                <Copy className="w-2.5 h-2.5 text-[#8A99AD] shrink-0" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center space-x-1 sm:space-x-1.5 text-xs shrink-0">
        {/* Share Link */}
        <button
          type="button"
          onClick={copyRoomLink}
          className={`h-8 sm:h-9 px-2 sm:px-2.5 font-bold border transition flex items-center space-x-1 cursor-pointer ${
            copied
              ? 'bg-[#00FF66]/20 text-[#00FF66] border-[#00FF66]'
              : 'bg-[#0B0E14] hover:bg-[#111827] text-[#00FF66] border-[#00FF66]/40 hover:border-[#00FF66]'
          }`}
          title="Salin Tautan Room Terenkripsi"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-[#00FF66]" /> : <Share2 className="w-3.5 h-3.5" />}
          <span className="hidden md:inline">{copied ? '[ COPIED ]' : '[ SHARE ]'}</span>
        </button>

        {/* Client Count */}
        <button
          type="button"
          onClick={onToggleSidebar}
          className={`h-8 sm:h-9 px-2 font-bold border transition flex items-center space-x-1 cursor-pointer ${
            isSidebarOpen
              ? 'bg-[#00F0FF]/20 border-[#00F0FF] text-[#00F0FF]'
              : 'bg-[#0B0E14] hover:bg-[#111827] border-[#1F2937] text-[#8A99AD]'
          }`}
          title="Daftar Anggota Aktif"
        >
          <Users className="w-3.5 h-3.5 text-[#00F0FF]" />
          <span className="text-[11px] text-[#00F0FF] font-bold">{participantCount}</span>
        </button>

        {/* Audio Toggle */}
        <button
          type="button"
          onClick={toggleSound}
          className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center border border-[#1F2937] bg-[#0B0E14] hover:bg-[#111827] text-[#8A99AD] hover:text-[#00FF66] transition cursor-pointer"
          title={soundMuted ? 'Nyalakan Audio' : 'Matikan Audio'}
        >
          {soundMuted ? <VolumeX className="w-3.5 h-3.5 text-[#8A99AD]" /> : <Volume2 className="w-3.5 h-3.5 text-[#00FF66]" />}
        </button>

        {/* Camouflage / Stealth Mode */}
        <button
          type="button"
          onClick={onToggleStealthMode}
          className={`w-8 h-8 sm:w-9 sm:h-9 sm:w-auto sm:px-2 flex items-center justify-center space-x-1 border transition cursor-pointer ${
            isStealthMode
              ? 'bg-[#FF003C]/20 border-[#FF003C] text-[#FF003C]'
              : 'bg-[#0B0E14] hover:bg-[#111827] border-[#1F2937] text-[#8A99AD]'
          }`}
          title="Mode Samaran Blur (Esc)"
        >
          {isStealthMode ? <EyeOff className="w-3.5 h-3.5 text-[#FF003C]" /> : <Eye className="w-3.5 h-3.5" />}
          <span className="hidden lg:inline">{isStealthMode ? '[ CAMO_ON ]' : '[ CAMO ]'}</span>
        </button>

        {/* Exit / Terminate */}
        <button
          type="button"
          onClick={onLeaveOrDissolve}
          className="h-8 sm:h-9 px-2 sm:px-2.5 font-bold bg-[#FF003C]/10 hover:bg-[#FF003C] text-[#FF003C] hover:text-[#0B0E14] border border-[#FF003C]/50 transition flex items-center space-x-1 cursor-pointer"
          title={isHost ? 'Musnahkan Room Ini' : 'Keluar dari Room'}
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden md:inline">{isHost ? '[ TERMINATE ]' : '[ LEAVE ]'}</span>
        </button>
      </div>
    </header>
  );
};
