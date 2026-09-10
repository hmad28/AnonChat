import React, { useState } from 'react';
import { ShieldCheck, Check, Copy, X, Lock, Key } from 'lucide-react';

interface SecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
  safetyData: { digits: string; emojis: string[] } | null;
  roomId: string;
}

export const SecurityModal: React.FC<SecurityModalProps> = ({
  isOpen,
  onClose,
  safetyData,
  roomId,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    if (!safetyData) return;
    const text = `AnonChat Safety Code (${roomId}): ${safetyData.digits} ${safetyData.emojis.join(' ')}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Verifikasi Keamanan Kriptografi</h3>
              <p className="text-xs text-slate-400">Enkripsi Berlapis: WebRTC DTLS dan AES-GCM-256</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Security protocol overview */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <div className="flex items-center space-x-1.5 text-emerald-400 font-semibold text-[11px]">
              <Lock className="w-3.5 h-3.5" />
              <span>Lapisan Aplikasi</span>
            </div>
            <p className="text-xs text-slate-200 font-mono font-medium">AES-GCM 256-bit</p>
            <p className="text-[11px] text-slate-400">Web Crypto API native</p>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <div className="flex items-center space-x-1.5 text-indigo-400 font-semibold text-[11px]">
              <Key className="w-3.5 h-3.5" />
              <span>Lapisan Jaringan</span>
            </div>
            <p className="text-xs text-slate-200 font-mono font-medium">WebRTC DTLS / SCTP</p>
            <p className="text-[11px] text-slate-400">Saluran langsung P2P</p>
          </div>
        </div>

        {/* Safety Number display */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-3">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Safety Number dan Sidik Jari Emoji
          </div>

          {safetyData ? (
            <div className="space-y-2">
              <div className="text-2xl font-mono font-bold tracking-widest text-white">
                {safetyData.digits}
              </div>
              <div className="text-2xl tracking-widest select-none py-1">
                {safetyData.emojis.join(' ')}
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-500 py-3">Menghitung kode keamanan...</div>
          )}

          <p className="text-xs text-slate-400 leading-normal max-w-xs mx-auto">
            Bandingkan kode 6 angka dan deretan emoji di atas dengan rekan bicara Anda. Jika identik, koneksi terjamin bebas dari penyusup pihak ketiga.
          </p>

          <button
            type="button"
            onClick={handleCopy}
            disabled={!safetyData}
            className="h-9 px-3 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 transition inline-flex items-center space-x-1.5"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Tersalin ke Papan Klip</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>Salin Kode Keamanan</span>
              </>
            )}
          </button>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full h-10 bg-slate-800 hover:bg-slate-750 text-white font-medium text-xs rounded-xl transition"
        >
          Tutup
        </button>
      </div>
    </div>
  );
};
