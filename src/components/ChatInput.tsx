import React, { useState, useRef, useEffect } from 'react';
import { Send, Smile, Flame, Timer } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (text: string, vanishDuration: number) => void;
  onTyping: (isTyping: boolean) => void;
}

const QUICK_EMOJIS = ['💀', '🔥', '⚡', '👁️', '🤫', '🕶️', '💣', '💻', '🔒', '☕'];

const VANISH_OPTIONS = [
  { label: 'OFF', seconds: 0 },
  { label: '30S', seconds: 30 },
  { label: '60S', seconds: 60 },
  { label: '300S', seconds: 300 },
];

export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, onTyping }) => {
  const [text, setText] = useState('');
  const [showEmojis, setShowEmojis] = useState(false);
  const [showVanishMenu, setShowVanishMenu] = useState(false);
  const [vanishDuration, setVanishDuration] = useState<number>(0);

  const typingTimeoutRef = useRef<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);

    onTyping(true);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      onTyping(false);
    }, 1200);
  };

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!text.trim()) return;

    onSendMessage(text, vanishDuration);
    setText('');
    onTyping(false);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const insertEmoji = (emoji: string) => {
    setText((prev) => prev + emoji);
    setShowEmojis(false);
    inputRef.current?.focus();
  };

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="border-t-2 border-[#1F2937] bg-[#05070A] p-3 sm:p-4 sticky bottom-0 z-20 font-mono">
      {/* Quick emoji drawer */}
      {showEmojis && (
        <div className="mb-2.5 p-2 bg-[#0B0E14] border border-[#1F2937] flex flex-wrap gap-1.5 shadow-xl">
          {QUICK_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => insertEmoji(emoji)}
              className="text-base p-1 hover:bg-[#1F2937] transition"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Vanish duration drawer */}
      {showVanishMenu && (
        <div className="mb-2.5 p-2.5 bg-[#0B0E14] border border-[#FF003C]/50 flex flex-wrap items-center gap-2 shadow-xl">
          <div className="flex items-center gap-1 text-xs font-bold text-[#FF003C] mr-2">
            <Flame className="w-3.5 h-3.5" />
            <span>[ PROTOCOL_AUTO_PURGE: ]</span>
          </div>
          {VANISH_OPTIONS.map((opt) => (
            <button
              key={opt.seconds}
              type="button"
              onClick={() => {
                setVanishDuration(opt.seconds);
                setShowVanishMenu(false);
              }}
              className={`px-3 py-1 text-xs font-bold border transition ${
                vanishDuration === opt.seconds
                  ? 'bg-[#FF003C] text-[#0B0E14] border-[#FF003C]'
                  : 'bg-[#05070A] text-[#8A99AD] border-[#1F2937] hover:border-[#E0E6ED]'
              }`}
            >
              [{opt.label}]
            </button>
          ))}
        </div>
      )}

      <form onSubmit={handleSend} className="flex items-center space-x-2">
        {/* Burn Timer Button */}
        <button
          type="button"
          onClick={() => {
            setShowVanishMenu(!showVanishMenu);
            setShowEmojis(false);
          }}
          className={`h-11 px-2.5 border font-bold text-xs flex items-center space-x-1 transition shrink-0 ${
            vanishDuration > 0
              ? 'bg-[#FF003C]/20 border-[#FF003C] text-[#FF003C]'
              : 'bg-[#0B0E14] hover:bg-[#111827] border-[#1F2937] text-[#8A99AD]'
          }`}
          title="Atur Burn Timer (Pesan Otomatis Lenyap)"
        >
          <Timer className="w-4 h-4" />
          {vanishDuration > 0 && (
            <span>[{VANISH_OPTIONS.find((v) => v.seconds === vanishDuration)?.label}]</span>
          )}
        </button>

        <div className="relative flex-1 flex items-center bg-[#0B0E14] border border-[#1F2937] focus-within:border-[#00FF66] transition">
          <span className="text-xs text-[#00FF66] font-bold pl-3 select-none">
            anon@node:~#
          </span>
          <input
            ref={inputRef}
            type="text"
            value={text}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            placeholder={
              vanishDuration > 0
                ? `[BURN_AFTER_${VANISH_OPTIONS.find((v) => v.seconds === vanishDuration)?.label}] Masukkan payload rahasia...`
                : 'Ketik payload pesan terenkripsi AES-256...'
            }
            className="w-full h-11 bg-transparent text-[#E0E6ED] placeholder-[#4B5563] text-xs px-2.5 transition outline-none font-mono"
            autoFocus
          />
          <button
            type="button"
            onClick={() => {
              setShowEmojis(!showEmojis);
              setShowVanishMenu(false);
            }}
            className="px-3 text-[#8A99AD] hover:text-[#00FF66] transition"
            title="Emoji Payload"
          >
            <Smile className="w-4 h-4" />
          </button>
        </div>

        <button
          type="submit"
          disabled={!text.trim()}
          className="h-11 px-4 bg-[#00FF66] hover:bg-[#00dd55] disabled:opacity-40 text-[#0B0E14] font-bold text-xs tracking-wider uppercase transition flex items-center justify-center space-x-1.5 shrink-0 cursor-pointer"
        >
          <Send className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">[ TRANSMIT ]</span>
        </button>
      </form>
    </div>
  );
};
