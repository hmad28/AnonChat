import React from 'react';
import { UserCheck, UserX, DoorOpen } from 'lucide-react';
import { KnockRequest } from '../types';

interface KnockModalProps {
  knocks: KnockRequest[];
  onApprove: (peerId: string) => void;
  onReject: (peerId: string) => void;
}

export const KnockModal: React.FC<KnockModalProps> = ({ knocks, onApprove, onReject }) => {
  if (knocks.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 left-4 sm:left-auto sm:w-96 z-40 space-y-2 pointer-events-none">
      {knocks.map((req) => (
        <div
          key={req.id}
          className="pointer-events-auto bg-slate-900 border border-slate-700 rounded-2xl p-4 shadow-2xl"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-indigo-400">
                <DoorOpen className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Permintaan Bergabung
                </div>
                <div className="text-sm font-bold text-white">
                  {req.nickname}
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  Menunggu izin Anda untuk masuk.
                </div>
              </div>
            </div>
          </div>

          <div className="mt-3.5 pt-3 border-t border-slate-800 flex items-center gap-2 justify-end">
            <button
              type="button"
              onClick={() => onReject(req.id)}
              className="h-9 px-3.5 text-xs font-semibold rounded-lg text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-750 border border-slate-700 transition flex items-center space-x-1.5"
            >
              <UserX className="w-3.5 h-3.5 text-rose-400" />
              <span>Tolak</span>
            </button>
            <button
              type="button"
              onClick={() => onApprove(req.id)}
              className="h-9 px-4 text-xs font-semibold rounded-lg text-white bg-emerald-600 hover:bg-emerald-500 transition flex items-center space-x-1.5"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Izinkan Masuk</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
