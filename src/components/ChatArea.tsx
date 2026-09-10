import React, { useEffect, useRef, useState } from 'react';
import { ShieldCheck, Flame, Terminal, Cpu, Copy, Check, Share2 } from 'lucide-react';
import { ChatMessage } from '../types';
import { MatrixRain } from './MatrixRain';
import { copyToClipboard } from '../utils/clipboard';
import { generateStealthInviteUrl } from '../utils/stealth';

interface ChatAreaProps {
  messages: ChatMessage[];
  currentUserId: string;
  typingUsers: { id: string; nickname: string }[];
  isStealthMode: boolean;
  onOpenSecurityModal: () => void;
  onExpireMessage: (id: string) => void;
  roomId: string;
  roomSecret?: string;
  isHost?: boolean;
}

export const ChatArea: React.FC<ChatAreaProps> = ({
  messages,
  currentUserId,
  typingUsers,
  isStealthMode,
  onOpenSecurityModal,
  onExpireMessage,
  roomId,
  roomSecret,
  isHost = false,
}) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [now, setNow] = useState(Date.now());
  const messagesRef = useRef(messages);
  messagesRef.current = messages;
  const onExpireRef = useRef(onExpireMessage);
  onExpireRef.current = onExpireMessage;

  useEffect(() => {
    const timer = setInterval(() => {
      const currentTime = Date.now();
      setNow(currentTime);

      messagesRef.current.forEach((msg) => {
        if (msg.expiresAt && currentTime >= msg.expiresAt) {
          onExpireRef.current(msg.id);
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingUsers]);

  const formatTime = (ts: number) => {
    return new Date(ts).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const handleCopyCode = async () => {
    const ok = await copyToClipboard(roomId);
    if (ok) {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleCopyLink = async () => {
    const url = generateStealthInviteUrl(roomId, roomSecret);
    const ok = await copyToClipboard(url);
    if (ok) {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-[#0B0E14] relative font-mono">
      {/* Background Matrix Rain */}
      <MatrixRain opacity={0.06} />

      {/* Purposeful Security Banner */}
      <div className="mx-auto max-w-lg border border-[#1F2937] bg-[#05070A]/90 p-3 text-center space-y-1 relative z-10">
        <div className="flex items-center justify-center space-x-1.5 text-xs font-bold text-[#00FF66]">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>[ P2P_DATALINK_ESTABLISHED: AES-GCM-256_ACTIVE ]</span>
        </div>
        <p className="text-[11px] text-[#8A99AD]">
          Memori bersifat volatil. Pesan dihapus instan saat room dibubarkan.{' '}
          <button
            type="button"
            onClick={onOpenSecurityModal}
            className="text-[#00F0FF] hover:underline font-bold"
          >
            [ VERIFY_SAFETY_FINGERPRINT ]
          </button>
        </p>
      </div>

      {messages.length === 0 && (
        <div className="mx-auto max-w-md border-2 border-[#1F2937] bg-[#05070A]/95 p-5 shadow-2xl space-y-4 my-6 relative z-10">
          <div className="flex items-center justify-between border-b border-[#1F2937] pb-3">
            <div className="flex items-center space-x-2">
              <Terminal className="w-4 h-4 text-[#00FF66]" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                [ ROOM_ACCESS_CREDENTIALS ]
              </span>
            </div>
            <span className="text-[10px] text-[#00FF66] bg-[#00FF66]/10 px-2 py-0.5 border border-[#00FF66]/30 font-bold">
              NODE_ONLINE
            </span>
          </div>

          <div className="space-y-3">
            {/* Room Code Box */}
            <div className="p-3 bg-[#0B0E14] border border-[#1F2937] space-y-1.5">
              <div className="text-[10px] text-[#8A99AD] font-bold uppercase tracking-wider">
                &gt; KODE ROOM (TOKEN):
              </div>
              <div className="flex items-center justify-between gap-2">
                <code className="text-sm font-bold text-[#00F0FF] tracking-widest select-all break-all">
                  {roomId}
                </code>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="h-8 px-3 text-xs font-bold border border-[#00F0FF] bg-[#00F0FF]/10 hover:bg-[#00F0FF] text-[#00F0FF] hover:text-[#0B0E14] transition shrink-0 flex items-center space-x-1 cursor-pointer"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? '[ COPIED ]' : '[ COPY CODE ]'}</span>
                </button>
              </div>
            </div>

            {/* Full Stealth Link Box */}
            <div className="p-3 bg-[#0B0E14] border border-[#1F2937] space-y-1.5">
              <div className="flex items-center justify-between text-[10px] text-[#8A99AD] font-bold uppercase tracking-wider">
                <span>&gt; TAUTAN UNDANGAN STEALTH (ZERO-LOGS):</span>
                <span className="text-[#00FF66] text-[9px]">[TERSELEBUNG]</span>
              </div>
              <button
                type="button"
                onClick={handleCopyLink}
                className="w-full h-10 px-3 text-xs font-bold border border-[#00FF66] bg-[#00FF66] hover:bg-[#00dd55] text-[#0B0E14] transition flex items-center justify-center space-x-2 cursor-pointer shadow-[0_0_12px_rgba(0,255,102,0.25)]"
              >
                {copiedLink ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                <span>{copiedLink ? '[ TAUTAN STEALTH DISALIN! ]' : '[ SALIN TAUTAN STEALTH ]'}</span>
              </button>
            </div>
          </div>

          <div className="text-[11px] text-[#8A99AD] leading-relaxed border-t border-[#1F2937] pt-3 space-y-1">
            <p>
              💡 <strong className="text-white">Cara Mengundang Teman:</strong> Kirimkan tautan lengkap atau kode room di atas.
            </p>
            {isHost && (
              <p className="text-[#00FF66]">
                🔒 Saat teman Anda mengetuk pintu (Knock), notifikasi persetujuan (ACC) akan muncul otomatis di layar ini.
              </p>
            )}
          </div>
        </div>
      )}

      <div className="space-y-3 relative z-10">
        {messages.map((msg) => {
          if (msg.type === 'system') {
            return (
              <div key={msg.id} className="flex justify-center my-2 text-[11px]">
                <span className="border border-[#1F2937] bg-[#05070A] px-3 py-1 text-[#8A99AD] flex items-center space-x-1.5">
                  <Cpu className="w-3 h-3 text-[#00F0FF]" />
                  <span>&gt;&gt; {msg.text}</span>
                  <span className="text-[#374151]">[{formatTime(msg.timestamp)}]</span>
                </span>
              </div>
            );
          }

          const isMe = msg.senderId === currentUserId;
          const remainingSeconds = msg.expiresAt ? Math.max(0, Math.ceil((msg.expiresAt - now) / 1000)) : null;

          return (
            <div
              key={msg.id}
              className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[90%] sm:max-w-md border bg-[#05070A] p-3 transition-all ${
                  isMe
                    ? 'border-l-4 border-l-[#00FF66] border-[#1F2937]'
                    : 'border-l-4 border-l-[#00F0FF] border-[#1F2937]'
                } ${
                  isStealthMode ? 'blur-md hover:blur-none select-none hover:select-text cursor-pointer' : ''
                }`}
              >
                <div className="flex items-center justify-between gap-3 text-[11px] mb-1.5 border-b border-[#1F2937]/60 pb-1">
                  <span className={`font-bold ${isMe ? 'text-[#00FF66]' : 'text-[#00F0FF]'}`}>
                    &gt; {isMe ? 'YOU' : msg.senderName}
                  </span>

                  <div className="flex items-center space-x-2">
                    {remainingSeconds !== null && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1 py-0.2 bg-[#FF003C]/10 text-[#FF003C] border border-[#FF003C]/40">
                        <Flame className="w-2.5 h-2.5" />
                        <span>[BURN: {remainingSeconds}s]</span>
                      </span>
                    )}
                    <span className="text-[10px] text-[#8A99AD]">
                      [{formatTime(msg.timestamp)}]
                    </span>
                  </div>
                </div>

                <p className="text-xs break-words whitespace-pre-wrap leading-relaxed text-[#E0E6ED]">
                  {msg.text}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Typing indicator */}
      {typingUsers.length > 0 && (
        <div className="flex items-center space-x-1.5 text-xs text-[#00FF66] px-1 relative z-10">
          <span>&gt; {typingUsers.map((u) => u.nickname).join(', ')} TRANSMITTING_PAYLOAD</span>
          <span className="animate-pulse">_</span>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
};
