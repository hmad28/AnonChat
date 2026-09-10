import React, { useEffect, useRef, useState } from 'react';
import { ShieldCheck, Flame, Terminal, Cpu } from 'lucide-react';
import { ChatMessage } from '../types';
import { MatrixRain } from './MatrixRain';

interface ChatAreaProps {
  messages: ChatMessage[];
  currentUserId: string;
  typingUsers: { id: string; nickname: string }[];
  isStealthMode: boolean;
  onOpenSecurityModal: () => void;
  onExpireMessage: (id: string) => void;
}

export const ChatArea: React.FC<ChatAreaProps> = ({
  messages,
  currentUserId,
  typingUsers,
  isStealthMode,
  onOpenSecurityModal,
  onExpireMessage,
}) => {
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
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-3 relative z-10">
          <div className="border border-[#1F2937] bg-[#05070A] p-3 text-[#00FF66]">
            <Terminal className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <div className="text-xs font-bold text-[#E0E6ED] uppercase tracking-wider">
              &gt; TERMINAL_BUFFER_EMPTY
            </div>
            <p className="text-[11px] text-[#8A99AD] max-w-xs">
              Mulai transmisi payload atau bagikan link node ini kepada peer Anda.
            </p>
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
