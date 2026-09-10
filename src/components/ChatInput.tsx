import React, { useState, useRef, useEffect } from 'react';
import { Send, Smile, Timer, Flame } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (text: string, vanishDuration: number) => void;
  onTyping: (isTyping: boolean) => void;
}

const QUICK_EMOJIS = ['👍', '😂', '🔥', '❤️', '👏', '🤫', '🚀', '👀', '🎉', '☕'];

const VANISH_OPTIONS = [
  { label: 'Permanen', seconds: 0 },
  { label: '30 Detik', seconds: 30 },
  { label: '1 Menit', seconds: 60 },
  { label: '5 Menit', seconds: 300 },
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
    <div className="border-t border-slate-800 bg-slate-900 p-3 sm:p-4 sticky bottom-0 z-20">
      {/* Quick emoji drawer */}
      {showEmojis && (
        <div className="mb-2.5 p-2 bg-slate-950 border border-slate-800 rounded-xl flex flex-wrap gap-1.5 shadow-lg">
          {QUICK_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => insertEmoji(emoji)}
              className="text-lg p-1.5 rounded-lg hover:bg-slate-800 transition"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Vanish duration drawer */}
      {showVanishMenu && (
        <div className="mb-2.5 p-2.5 bg-slate-950 border border-slate-800 rounded-xl flex flex-wrap items-center gap-2 shadow-lg">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 mr-1">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>Masa Aktif Pesan:</span>
          </div>
          {VANISH_OPTIONS.map((opt) => (
            <button
              key={opt.seconds}
              type="button"
              onClick={() => {
                setVanishDuration(opt.seconds);
                setShowVanishMenu(false);
              }}
              className={`px-3 py-1 text-xs font-semibold rounded-lg border transition ${
                vanishDuration === opt.seconds
                  ? 'bg-amber-500 text-slate-950 border-amber-400'
                  : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}

      <form onSubmit={handleSend} className="flex items-center space-x-2">
        {/* Vanish timer toggle */}
        <button
          type="button"
          onClick={() => {
            setShowVanishMenu(!showVanishMenu);
            setShowEmojis(false);
          }}
          className={`h-11 px-3 rounded-xl border flex items-center space-x-1.5 transition shrink-0 ${
            vanishDuration > 0
              ? 'bg-amber-950/60 border-amber-700 text-amber-300'
              : 'bg-slate-950 hover:bg-slate-850 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
          title="Atur waktu pesan otomatis terhapus"
        >
          <Timer className="w-4 h-4" />
          {vanishDuration > 0 && (
            <span className="text-xs font-bold font-mono">
              {VANISH_OPTIONS.find((v) => v.seconds === vanishDuration)?.label}
            </span>
          )}
        </button>

        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="text"
            value={text}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            placeholder={
              vanishDuration > 0
                ? `Pesan akan otomatis terhapus dalam ${VANISH_OPTIONS.find((v) => v.seconds === vanishDuration)?.label}`
                : 'Ketik pesan Anda di sini...'
            }
            className="w-full h-11 bg-slate-950 border border-slate-800 focus:border-indigo-500 text-slate-100 placeholder-slate-500 text-sm rounded-xl pl-4 pr-10 transition outline-none"
            autoFocus
          />
          <button
            type="button"
            onClick={() => {
              setShowEmojis(!showEmojis);
              setShowVanishMenu(false);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition"
            title="Pilih reaksi cepat"
          >
            <Smile className="w-5 h-5" />
          </button>
        </div>

        <button
          type="submit"
          disabled={!text.trim()}
          className="h-11 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white font-semibold text-xs flex items-center justify-center space-x-1.5 transition shrink-0"
        >
          <Send className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Kirim</span>
        </button>
      </form>
    </div>
  );
};
