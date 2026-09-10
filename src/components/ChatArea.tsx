import React, { useEffect, useRef, useState } from 'react';
import { ShieldCheck, UserCheck, MessageSquare, Flame } from 'lucide-react';
import { ChatMessage } from '../types';
import { getInitials } from '../utils/colors';

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

  useEffect(() => {
    const timer = setInterval(() => {
      const currentTime = Date.now();
      setNow(currentTime);

      messages.forEach((msg) => {
        if (msg.expiresAt && currentTime >= msg.expiresAt) {
          onExpireMessage(msg.id);
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [messages, onExpireMessage]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingUsers]);

  const formatTime = (ts: number) => {
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-950">
      {/* Purposeful Security Banner */}
      <div className="mx-auto max-w-md bg-slate-900 border border-slate-800 rounded-xl p-3 text-center space-y-1">
        <div className="flex items-center justify-center space-x-1.5 text-xs font-semibold text-emerald-400">
          <ShieldCheck className="w-4 h-4" />
          <span>Koneksi Langsung P2P (Terenkripsi AES-GCM 256-bit)</span>
        </div>
        <p className="text-xs text-slate-400 leading-normal">
          Pesan hanya disimpan di memori kerja dan akan terhapus saat room ditutup.{' '}
          <button
            type="button"
            onClick={onOpenSecurityModal}
            className="text-indigo-400 hover:text-indigo-300 underline font-medium"
          >
            Verifikasi Kode Keamanan
          </button>
        </p>
      </div>

      {messages.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-2.5">
          <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-slate-200">Ruang Obrolan Siap</h3>
            <p className="text-xs text-slate-400 max-w-xs">
              Mulai mengetik pesan atau bagikan tautan room kepada rekan bicara Anda.
            </p>
          </div>
        </div>
      )}

      {messages.map((msg) => {
        if (msg.type === 'system') {
          return (
            <div key={msg.id} className="flex justify-center my-2">
              <span className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300">
                <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                <span>{msg.text}</span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {formatTime(msg.timestamp)}
                </span>
              </span>
            </div>
          );
        }

        const isMe = msg.senderId === currentUserId;
        const remainingSeconds = msg.expiresAt ? Math.max(0, Math.ceil((msg.expiresAt - now) / 1000)) : null;

        return (
          <div
            key={msg.id}
            className={`flex items-end space-x-2.5 ${isMe ? 'justify-end' : 'justify-start'}`}
          >
            {!isMe && (
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                  msg.color || 'bg-slate-800 text-white'
                }`}
                title={msg.senderName}
              >
                {getInitials(msg.senderName)}
              </div>
            )}

            <div
              className={`max-w-[85%] sm:max-w-md md:max-w-lg rounded-xl px-4 py-2.5 transition-all ${
                isStealthMode ? 'blur-md hover:blur-none select-none hover:select-text cursor-pointer' : ''
              } ${
                isMe
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-900 border border-slate-800 text-slate-100'
              }`}
            >
              <div className="flex items-center justify-between gap-3 mb-1">
                {!isMe ? (
                  <span className="text-xs font-semibold text-indigo-300">
                    {msg.senderName}
                  </span>
                ) : (
                  <span />
                )}

                {remainingSeconds !== null && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                    <Flame className="w-3 h-3 text-amber-400" />
                    <span>{remainingSeconds}s</span>
                  </span>
                )}
              </div>

              <p className="text-sm break-words whitespace-pre-wrap leading-relaxed font-normal">
                {msg.text}
              </p>

              <div
                className={`text-[10px] mt-1.5 flex justify-end font-mono ${
                  isMe ? 'text-indigo-200' : 'text-slate-400'
                }`}
              >
                {formatTime(msg.timestamp)}
              </div>
            </div>
          </div>
        );
      })}

      {/* Typing indicator */}
      {typingUsers.length > 0 && (
        <div className="flex items-center space-x-2 text-xs text-slate-400 px-2">
          <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
          <span>
            {typingUsers.map((u) => u.nickname).join(', ')}{' '}
            {typingUsers.length === 1 ? 'sedang mengetik' : 'sedang mengetik'}...
          </span>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
};
