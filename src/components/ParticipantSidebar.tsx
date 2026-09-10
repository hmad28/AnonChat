import React from 'react';
import { Users, Crown, X, Lock } from 'lucide-react';
import { Participant } from '../types';
import { getInitials } from '../utils/colors';

interface ParticipantSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  participants: Participant[];
  currentUserId: string;
}

export const ParticipantSidebar: React.FC<ParticipantSidebarProps> = ({
  isOpen,
  onClose,
  participants,
  currentUserId,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-40 w-72 bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col">
      <div className="h-16 px-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Users className="w-4 h-4 text-indigo-400" />
          <h2 className="font-semibold text-sm text-slate-200">
            Anggota Room ({participants.length})
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
        <div className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Dalam Percakapan
        </div>
        {participants.map((p) => {
          const isMe = p.id === currentUserId;
          const isHost = p.role === 'host';

          return (
            <div
              key={p.id}
              className={`flex items-center justify-between p-2.5 rounded-xl transition ${
                isMe ? 'bg-slate-950 border border-slate-800' : 'hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center space-x-2.5 min-w-0">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                    p.color || 'bg-slate-800 text-white'
                  }`}
                >
                  {getInitials(p.nickname)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-semibold text-slate-200 truncate">
                      {p.nickname}
                    </span>
                    {isMe && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-medium">
                        Anda
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    <span>Tersambung</span>
                  </div>
                </div>
              </div>

              {isHost && (
                <div className="flex items-center space-x-1 text-amber-300 bg-amber-950 px-2 py-0.5 rounded text-[10px] font-semibold border border-amber-800 shrink-0">
                  <Crown className="w-3 h-3" />
                  <span>Host</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="p-3 border-t border-slate-800 bg-slate-950 text-xs text-slate-400 flex items-center gap-2">
        <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
        <span>Pesan tidak tersimpan di server dan musnah saat sesi selesai.</span>
      </div>
    </div>
  );
};
