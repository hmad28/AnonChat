import React, { useState } from 'react';
import { ShieldCheck, Check, Copy, X, Lock, Key } from 'lucide-react';
import { copyToClipboard } from '../utils/clipboard';

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

  const handleCopy = async () => {
    if (!safetyData) return;
    const text = `ANONCHAT_SAFETY_CODE (${roomId}): ${safetyData.digits} [${safetyData.emojis.join(' ')}]`;
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#0B0E14]/85 backdrop-blur-sm font-mono overflow-y-auto">
      <div className="w-full max-w-md bg-[#05070A] border-2 border-[#00FF66] p-4 sm:p-6 shadow-[0_0_25px_rgba(0,255,102,0.2)] space-y-4 sm:space-y-5 relative my-auto max-h-[92vh] overflow-y-auto">
        {/* Corner markers */}
        <div className="absolute top-0 left-0 text-[#00FF66] text-xs leading-none -translate-x-1 -translate-y-1 select-none">[+]</div>
        <div className="absolute top-0 right-0 text-[#00FF66] text-xs leading-none translate-x-1 -translate-y-1 select-none">[+]</div>
        <div className="absolute bottom-0 left-0 text-[#00FF66] text-xs leading-none -translate-x-1 translate-y-1 select-none">[+]</div>
        <div className="absolute bottom-0 right-0 text-[#00FF66] text-xs leading-none translate-x-1 translate-y-1 select-none">[+]</div>

        <div className="flex items-center justify-between border-b border-[#1F2937] pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 border border-[#00FF66] bg-[#00FF66]/10 flex items-center justify-center text-[#00FF66]">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white uppercase tracking-wider">
                [ CIPHER_FINGERPRINT_VERIFICATION ]
              </div>
              <div className="text-[10px] text-[#8A99AD]">
                STATUS: MULTI_LAYER_AIRGAP_P2P
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center border border-[#1F2937] hover:border-[#FF003C] text-[#8A99AD] hover:text-[#FF003C] transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Cryptographic breakdown */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-3 border border-[#1F2937] bg-[#0B0E14] space-y-1">
            <div className="flex items-center space-x-1 text-[#00FF66] font-bold text-[10px]">
              <Lock className="w-3 h-3" />
              <span>APPLICATION_LAYER</span>
            </div>
            <div className="text-xs text-white font-bold">AES-GCM 256-BIT</div>
            <div className="text-[10px] text-[#8A99AD]">WebCrypto Native API</div>
          </div>

          <div className="p-3 border border-[#1F2937] bg-[#0B0E14] space-y-1">
            <div className="flex items-center space-x-1 text-[#00F0FF] font-bold text-[10px]">
              <Key className="w-3 h-3" />
              <span>TRANSPORT_LAYER</span>
            </div>
            <div className="text-xs text-white font-bold">WEBRTC DTLS/SCTP</div>
            <div className="text-[10px] text-[#8A99AD]">Direct Browser Wire</div>
          </div>
        </div>

        {/* Safety Number display */}
        <div className="p-4 border border-[#1F2937] bg-[#0B0E14] text-center space-y-3">
          <div className="text-[10px] font-bold text-[#00F0FF] uppercase tracking-wider">
            &gt;&gt; SAFETY_NUMBER_&amp;_EMOJI_HASH
          </div>

          {safetyData ? (
            <div className="space-y-2">
              <div className="text-2xl font-bold tracking-widest text-[#00FF66] terminal-glow">
                {safetyData.digits}
              </div>
              <div className="text-2xl tracking-widest select-none py-1">
                {safetyData.emojis.join(' ')}
              </div>
            </div>
          ) : (
            <div className="text-xs text-[#8A99AD] py-3">Menghitung hash kriptografi...</div>
          )}

          <p className="text-[11px] text-[#8A99AD] leading-relaxed max-w-xs mx-auto">
            Bandingkan kode 6 angka dan deretan emoji di atas dengan rekan bicara Anda. Jika identik, koneksi dijamin 100% bebas dari intipan pihak ketiga (Anti-MITM).
          </p>

          <button
            type="button"
            onClick={handleCopy}
            disabled={!safetyData}
            className="h-9 px-3 text-xs font-bold border border-[#00FF66] bg-[#00FF66]/10 hover:bg-[#00FF66] text-[#00FF66] hover:text-[#0B0E14] transition inline-flex items-center space-x-1.5 cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>[ COPIED_TO_CLIPBOARD ]</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>[ COPY_SAFETY_CODE ]</span>
              </>
            )}
          </button>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full h-10 border border-[#1F2937] bg-[#111827] hover:bg-[#1F2937] text-white font-bold text-xs uppercase tracking-wider transition cursor-pointer"
        >
          [ CLOSE_INSPECTOR ]
        </button>
      </div>
    </div>
  );
};
