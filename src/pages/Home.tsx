import React, { useState } from 'react';
import { ShieldCheck, Plus, ArrowRight, Lock, Trash2, Users } from 'lucide-react';
import { generateRoomId } from '../utils/id';

interface HomeProps {
  onStartRoom: (roomId: string, nickname: string, isHost: boolean) => void;
  initialRoomId?: string;
}

export const Home: React.FC<HomeProps> = ({ onStartRoom, initialRoomId }) => {
  const [hostNick, setHostNick] = useState('');
  const [guestNick, setGuestNick] = useState('');
  const [joinInput, setJoinInput] = useState(initialRoomId || '');
  const [activeTab, setActiveTab] = useState<'create' | 'join'>(initialRoomId ? 'join' : 'create');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const finalNick = hostNick.trim() || `Host (${Math.floor(100 + Math.random() * 900)})`;
    const newRoomId = generateRoomId();
    onStartRoom(newRoomId, finalNick, true);
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinInput.trim()) return;

    let parsedRoomId = joinInput.trim();
    try {
      if (parsedRoomId.includes('http://') || parsedRoomId.includes('https://') || parsedRoomId.includes('?room=')) {
        const url = new URL(parsedRoomId.startsWith('http') ? parsedRoomId : `http://dummy.com/${parsedRoomId}`);
        const qRoom = url.searchParams.get('room');
        if (qRoom) parsedRoomId = qRoom;
        if (url.hash) {
          window.location.hash = url.hash;
        }
      }
    } catch {}

    const finalNick = guestNick.trim() || `Tamu (${Math.floor(100 + Math.random() * 900)})`;
    onStartRoom(parsedRoomId, finalNick, false);
  };

  return (
    <main className="min-h-screen flex flex-col justify-center items-center px-4 py-10 bg-slate-950 text-slate-100">
      <div className="w-full max-w-md space-y-7">
        {/* Brand Header */}
        <div className="text-center space-y-2.5">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 text-indigo-400 mb-1">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            AnonChat
          </h1>
          <p className="text-sm text-slate-400 max-w-sm mx-auto leading-relaxed">
            Ruang obrolan sementara berbasis koneksi langsung peramban. Tanpa penyimpanan data dan memerlukan izin pembuat room untuk bergabung.
          </p>
        </div>

        {/* Action Panel */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl">
          {/* Tab Switcher */}
          <div className="grid grid-cols-2 p-1 bg-slate-950 rounded-xl border border-slate-800/80 mb-5">
            <button
              type="button"
              onClick={() => setActiveTab('create')}
              className={`h-10 text-xs font-semibold rounded-lg transition ${
                activeTab === 'create'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Buka Room Baru
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('join')}
              className={`h-10 text-xs font-semibold rounded-lg transition ${
                activeTab === 'join'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Masuk Lewat Undangan
            </button>
          </div>

          {activeTab === 'create' ? (
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Nama Panggilan (Pembuat Room)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Kucing Hitam"
                  value={hostNick}
                  onChange={(e) => setHostNick(e.target.value)}
                  maxLength={25}
                  className="w-full h-11 bg-slate-950 border border-slate-800 focus:border-indigo-500 text-slate-100 placeholder-slate-500 text-sm rounded-xl px-3.5 transition outline-none"
                />
                <p className="text-[11px] text-slate-400 mt-1.5 leading-normal">
                  Sebagai pembuat room, Anda memegang kendali penuh untuk menyetujui atau menolak setiap tamu yang ingin masuk.
                </p>
              </div>

              <button
                type="submit"
                className="w-full h-11 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-xl flex items-center justify-center space-x-2 transition"
              >
                <Plus className="w-4 h-4" />
                <span>Buat Room dan Dapatkan Link</span>
              </button>
            </form>
          ) : (
            <form onSubmit={handleJoin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Kode Room atau Tautan Undangan
                </label>
                <input
                  type="text"
                  required
                  placeholder="Tempel tautan atau ketik kode room"
                  value={joinInput}
                  onChange={(e) => setJoinInput(e.target.value)}
                  className="w-full h-11 bg-slate-950 border border-slate-800 focus:border-indigo-500 text-slate-100 placeholder-slate-500 text-sm rounded-xl px-3.5 transition outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Nama Panggilan Anda
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Budi"
                  value={guestNick}
                  onChange={(e) => setGuestNick(e.target.value)}
                  maxLength={25}
                  className="w-full h-11 bg-slate-950 border border-slate-800 focus:border-indigo-500 text-slate-100 placeholder-slate-500 text-sm rounded-xl px-3.5 transition outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={!joinInput.trim()}
                className="w-full h-11 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-sm rounded-xl flex items-center justify-center space-x-2 transition"
              >
                <span>Ketuk Pintu (Minta Izin)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>

        {/* Technical Architecture Guarantees */}
        <div className="grid grid-cols-3 gap-2.5">
          <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-center space-y-1">
            <Lock className="w-4 h-4 text-slate-300 mx-auto" />
            <div className="text-xs font-semibold text-slate-200">Izin Masuk</div>
            <div className="text-[10px] text-slate-400">Persetujuan host</div>
          </div>
          <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-center space-y-1">
            <Trash2 className="w-4 h-4 text-slate-300 mx-auto" />
            <div className="text-xs font-semibold text-slate-200">Nol Database</div>
            <div className="text-[10px] text-slate-400">Musnah saat ditutup</div>
          </div>
          <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-center space-y-1">
            <Users className="w-4 h-4 text-slate-300 mx-auto" />
            <div className="text-xs font-semibold text-slate-200">Koneksi P2P</div>
            <div className="text-[10px] text-slate-400">Langsung antar peramban</div>
          </div>
        </div>
      </div>
    </main>
  );
};
