import React, { useState } from 'react';
import { ShieldCheck, Copy, Check, Volume2, VolumeX, LogOut, Users, Eye, EyeOff } from 'lucide-react';
import { sound } from '../utils/audio';

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
  const [soundMuted, setSoundMuted] = useState(!sound.enabled);

  const copyRoomLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleSound = () => {
    sound.enabled = !sound.enabled;
    setSoundMuted(!sound.enabled);
  };

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900 px-4 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-200">
          <ShieldCheck className="w-5 h-5 text-indigo-400" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-bold text-sm text-white tracking-tight">AnonChat</span>
            <button
              type="button"
              onClick={onOpenSecurityModal}
              className="text-[11px] px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-750 text-emerald-400 font-mono font-medium border border-slate-700 transition"
              title="Periksa Safety Number dan Status Kriptografi"
            >
              E2EE Aktif
            </button>
          </div>
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <span>
              Room: <span className="font-mono text-slate-200 font-semibold">{roomId}</span>
            </span>
            {isHost && (
              <span className="px-1.5 py-0.2 rounded bg-indigo-950 text-indigo-300 text-[10px] font-semibold border border-indigo-800">
                PEMBUAT ROOM
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        {/* Stealth Mode */}
        <button
          type="button"
          onClick={onToggleStealthMode}
          className={`h-9 px-3 text-xs font-medium rounded-lg border transition flex items-center space-x-1.5 ${
            isStealthMode
              ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
              : 'bg-slate-800 hover:bg-slate-750 border-slate-700 text-slate-300'
          }`}
          title={isStealthMode ? 'Matikan Mode Samaran (Esc)' : 'Nyalakan Mode Samaran (Esc)'}
        >
          {isStealthMode ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5 text-slate-400" />}
          <span className="hidden md:inline">
            {isStealthMode ? 'Samaran Aktif' : 'Samaran'}
          </span>
        </button>

        {/* Copy Invite Link */}
        <button
          type="button"
          onClick={copyRoomLink}
          className={`h-9 px-3 text-xs font-medium rounded-lg border transition flex items-center space-x-1.5 ${
            copied
              ? 'bg-emerald-900/40 text-emerald-300 border-emerald-600'
              : 'bg-slate-800 hover:bg-slate-750 text-slate-200 border-slate-700'
          }`}
          title="Salin Tautan Undangan Terenkripsi"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>Tersalin</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">Salin Link</span>
            </>
          )}
        </button>

        {/* Audio Toggle */}
        <button
          type="button"
          onClick={toggleSound}
          className="w-9 h-9 flex items-center justify-center rounded-lg bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-300 transition"
          title={soundMuted ? 'Nyalakan Efek Suara' : 'Bisukan Efek Suara'}
        >
          {soundMuted ? <VolumeX className="w-4 h-4 text-slate-500" /> : <Volume2 className="w-4 h-4 text-indigo-400" />}
        </button>

        {/* Participant Toggle */}
        <button
          type="button"
          onClick={onToggleSidebar}
          className={`h-9 px-2.5 text-xs font-semibold rounded-lg border transition flex items-center space-x-1.5 ${
            isSidebarOpen
              ? 'bg-indigo-950 border-indigo-700 text-indigo-300'
              : 'bg-slate-800 hover:bg-slate-750 border-slate-700 text-slate-300'
          }`}
          title="Daftar Anggota Room"
        >
          <Users className="w-3.5 h-3.5 text-indigo-400" />
          <span>{participantCount}</span>
        </button>

        {/* Leave or Dissolve */}
        <button
          type="button"
          onClick={onLeaveOrDissolve}
          className={`h-9 px-3 text-xs font-semibold rounded-lg border transition flex items-center space-x-1.5 ${
            isHost
              ? 'bg-rose-950/40 hover:bg-rose-950 text-rose-300 border-rose-800'
              : 'bg-slate-800 hover:bg-slate-750 text-slate-300 border-slate-700'
          }`}
          title={isHost ? 'Bubarkan Room Ini' : 'Keluar dari Room'}
        >
          <LogOut className="w-3.5 h-3.5 text-rose-400" />
          <span className="hidden sm:inline">{isHost ? 'Bubarkan' : 'Keluar'}</span>
        </button>
      </div>
    </header>
  );
};
