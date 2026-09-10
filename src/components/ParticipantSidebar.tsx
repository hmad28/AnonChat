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
    <>
      {/* Mobile backdrop */}
      <div
        className="fixed inset-0 bg-black/70 z-40 sm:hidden backdrop-blur-xs"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-80 max-w-[85vw] bg-[#05070A] border-l-2 border-[#1F2937] shadow-2xl flex flex-col font-mono">
        <div className="h-14 sm:h-16 px-4 border-b border-[#1F2937] flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Users className="w-4 h-4 text-[#00F0FF]" />
          <h2 className="font-bold text-xs text-white uppercase tracking-wider">
            CONNECTED_NODES [{participants.length}]
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center border border-[#1F2937] text-[#8A99AD] hover:text-white hover:border-[#E0E6ED] transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        <div className="px-1 text-[10px] font-bold uppercase tracking-wider text-[#8A99AD]">
          &gt; ACTIVE_MESH_CLIENTS:
        </div>
        {participants.map((p) => {
          const isMe = p.id === currentUserId;
          const isHost = p.role === 'host';

          return (
            <div
              key={p.id}
              className={`p-2.5 border transition ${
                isMe
                  ? 'bg-[#0B0E14] border-[#00FF66]/60 shadow-[0_0_8px_rgba(0,255,102,0.15)]'
                  : 'bg-[#0B0E14] border-[#1F2937] hover:border-[#374151]'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5 min-w-0">
                  <div
                    className="w-7 h-7 border border-[#374151] bg-[#111827] flex items-center justify-center font-bold text-[10px] text-white shrink-0"
                  >
                    {getInitials(p.nickname)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-white truncate">
                        {p.nickname}
                      </span>
                      {isMe && (
                        <span className="text-[9px] px-1 bg-[#00FF66]/10 text-[#00FF66] border border-[#00FF66]/30 font-bold">
                          YOU
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-[#00FF66] mt-0.5">
                      <span className="w-1.5 h-1.5 bg-[#00FF66] animate-pulse"></span>
                      <span>SYNCED [P2P_LIVE]</span>
                    </div>
                  </div>
                </div>

                {isHost && (
                  <div className="flex items-center space-x-1 text-[#FF003C] bg-[#FF003C]/10 px-1.5 py-0.5 border border-[#FF003C]/40 text-[9px] font-bold shrink-0">
                    <Crown className="w-3 h-3" />
                    <span>ROOT</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-3 border-t border-[#1F2937] bg-[#0B0E14] text-[10px] text-[#8A99AD] flex items-center gap-2">
        <Lock className="w-3.5 h-3.5 text-[#00FF66] shrink-0" />
        <span>MEMORI VOLATIL: SELURUH DATA HAPUS TOTAL SAAT BUBAR.</span>
      </div>
    </div>
    </>
  );
};
