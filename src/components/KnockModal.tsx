import React from 'react';
import { UserCheck, UserX, ShieldAlert } from 'lucide-react';
import { KnockRequest } from '../types';

interface KnockModalProps {
  knocks: KnockRequest[];
  onApprove: (peerId: string) => void;
  onReject: (peerId: string) => void;
}

export const KnockModal: React.FC<KnockModalProps> = ({ knocks, onApprove, onReject }) => {
  if (knocks.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 left-4 sm:left-auto sm:w-96 z-40 space-y-3 pointer-events-none font-mono">
      {knocks.map((req) => (
        <div
          key={req.id}
          className="pointer-events-auto bg-[#05070A] border-2 border-[#FF003C] p-4 shadow-[0_0_20px_rgba(255,0,60,0.3)] animate-in slide-in-from-top-4 duration-200"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 border border-[#FF003C] bg-[#FF003C]/10 flex items-center justify-center text-[#FF003C] shrink-0">
                <ShieldAlert className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="text-[10px] font-bold text-[#FF003C] uppercase tracking-wider">
                  [ INTRUSION_AUTH_REQUIRED ]
                </div>
                <div className="text-sm font-bold text-white mt-0.5">
                  &gt; {req.nickname}
                </div>
                <div className="text-[11px] text-[#8A99AD]">
                  Meminta izin handshake masuk ke room ini.
                </div>
              </div>
            </div>
          </div>

          <div className="mt-3.5 pt-3 border-t border-[#1F2937] flex items-center gap-2 justify-end">
            <button
              type="button"
              onClick={() => onReject(req.id)}
              className="h-9 px-3 text-xs font-bold text-[#FF003C] bg-[#FF003C]/10 hover:bg-[#FF003C] hover:text-[#0B0E14] border border-[#FF003C] transition flex items-center space-x-1 cursor-pointer"
            >
              <UserX className="w-3.5 h-3.5" />
              <span>[ DENY ]</span>
            </button>
            <button
              type="button"
              onClick={() => onApprove(req.id)}
              className="h-9 px-4 text-xs font-bold text-[#0B0E14] bg-[#00FF66] hover:bg-[#00dd55] transition flex items-center space-x-1 shadow-[0_0_10px_rgba(0,255,102,0.3)] cursor-pointer"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>[ GRANT_ACCESS ]</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
