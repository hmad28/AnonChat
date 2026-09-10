import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Loader2, DoorOpen, ShieldAlert, CheckCircle2, Home as HomeIcon, AlertCircle } from 'lucide-react';
import { ChatMessage, KnockRequest, Participant } from '../types';
import { PeerService } from '../services/peerService';
import { Header } from '../components/Header';
import { ChatArea } from '../components/ChatArea';
import { ChatInput } from '../components/ChatInput';
import { KnockModal } from '../components/KnockModal';
import { ParticipantSidebar } from '../components/ParticipantSidebar';
import { SecurityModal } from '../components/SecurityModal';
import { getRandomColor } from '../utils/colors';
import { generateSafetyFingerprint, generateRoomSecret } from '../utils/crypto';

interface RoomProps {
  roomId: string;
  nickname: string;
  isHost: boolean;
  onBackToHome: () => void;
}

export const Room: React.FC<RoomProps> = ({ roomId, nickname, isHost, onBackToHome }) => {
  const [status, setStatus] = useState<
    'connecting' | 'waiting_approval' | 'active' | 'rejected' | 'dissolved' | 'error'
  >('connecting');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [knocks, setKnocks] = useState<KnockRequest[]>([]);
  const [typingUsers, setTypingUsers] = useState<{ id: string; nickname: string }[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [safetyData, setSafetyData] = useState<{ digits: string; emojis: string[] } | null>(null);
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const [isStealthMode, setIsStealthMode] = useState(false);

  const peerServiceRef = useRef<PeerService | null>(null);
  const myColorRef = useRef<string>(getRandomColor());

  // Escape key handler for Panic / Stealth Mode (R-32)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsStealthMode((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleExpireMessage = useCallback((id: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== id));
  }, []);

  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    let roomSecret = hashParams.get('key') || '';

    if (isHost && !roomSecret) {
      roomSecret = generateRoomSecret();
      const url = new URL(window.location.href);
      url.hash = `key=${roomSecret}`;
      window.history.replaceState({}, '', url.toString());
    }

    const service = new PeerService({
      onStatusChange: (newStatus, msg) => {
        setStatus(newStatus);
        if (msg) setErrorMessage(msg);
      },
      onKnockReceived: (req) => {
        setKnocks((prev) => [...prev.filter((k) => k.id !== req.id), req]);
      },
      onKnockHandled: (peerId) => {
        setKnocks((prev) => prev.filter((k) => k.id !== peerId));
      },
      onMessageReceived: (msg) => {
        setMessages((prev) => [...prev, msg]);
      },
      onParticipantsUpdated: (updatedList) => {
        setParticipants([...updatedList]);
      },
      onRoomDissolved: (reason) => {
        setStatus('dissolved');
        if (reason) setErrorMessage(reason);
      },
      onTypingUpdated: (senderId, nick, isTyping) => {
        setTypingUsers((prev) => {
          if (isTyping) {
            if (prev.some((u) => u.id === senderId)) return prev;
            return [...prev, { id: senderId, nickname: nick }];
          } else {
            return prev.filter((u) => u.id !== senderId);
          }
        });
      },
      onKeyReady: async (key: CryptoKey) => {
        try {
          const fingerprint = await generateSafetyFingerprint(key, roomId);
          setSafetyData(fingerprint);
        } catch (e) {
          console.error('Failed to generate safety fingerprint:', e);
        }
      },
    });

    peerServiceRef.current = service;

    if (isHost) {
      service.initHost(roomId, nickname, myColorRef.current, roomSecret).catch((err) => {
        console.error('Failed to init host', err);
      });
    } else {
      service.initGuest(roomId, nickname, myColorRef.current, roomSecret).catch((err) => {
        console.error('Failed to init guest', err);
      });
    }

    const handleBeforeUnload = () => {
      service.destroy();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      service.destroy();
    };
  }, [roomId, nickname, isHost]);

  const handleSendMessage = (text: string, vanishDuration: number) => {
    peerServiceRef.current?.sendMessage(text, vanishDuration);
  };

  const handleTyping = (isTyping: boolean) => {
    peerServiceRef.current?.sendTyping(isTyping);
  };

  const handleApproveKnock = (peerId: string) => {
    peerServiceRef.current?.approveKnock(peerId, getRandomColor());
  };

  const handleRejectKnock = (peerId: string) => {
    peerServiceRef.current?.rejectKnock(peerId);
  };

  const handleLeaveOrDissolve = () => {
    if (isHost) {
      if (confirm('Yakin ingin membubarkan room ini? Seluruh peserta akan terputus dan semua pesan akan terhapus permanen dari memori.')) {
        peerServiceRef.current?.destroy();
        onBackToHome();
      }
    } else {
      peerServiceRef.current?.destroy();
      onBackToHome();
    }
  };

  // 1. CONNECTING STATE
  if (status === 'connecting') {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-4 text-center space-y-4 bg-slate-950 text-slate-100">
        <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-indigo-400">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-100">Menghubungkan ke Jaringan P2P</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xs">
            {isHost
              ? 'Menyiapkan kunci enkripsi AES-GCM 256-bit dan membuka room...'
              : 'Menemukan alamat room pembuat sesi...'}
          </p>
        </div>
      </main>
    );
  }

  // 2. WAITING APPROVAL STATE (GUEST)
  if (status === 'waiting_approval') {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-4 text-center space-y-5 bg-slate-950 text-slate-100">
        <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-amber-400">
          <DoorOpen className="w-8 h-8" />
        </div>
        <div className="max-w-sm space-y-2">
          <div className="inline-flex items-center px-2.5 py-0.5 rounded bg-amber-950 text-amber-300 text-xs font-semibold border border-amber-800">
            Menunggu Persetujuan Pembuat Room
          </div>
          <h2 className="text-xl font-bold text-white">Permintaan Masuk Terkirim</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Permintaan Anda sudah diteruskan kepada pembuat room <span className="font-mono text-slate-200 font-semibold">{roomId}</span>. Ruang obrolan akan terbuka seketika setelah diberikan izin.
          </p>
        </div>

        <button
          type="button"
          onClick={onBackToHome}
          className="h-10 px-4 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-850 transition"
        >
          Batalkan dan Kembali
        </button>
      </main>
    );
  }

  // 3. REJECTED STATE
  if (status === 'rejected') {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-4 text-center space-y-4 bg-slate-950 text-slate-100">
        <div className="w-14 h-14 rounded-2xl bg-rose-950/60 border border-rose-800 flex items-center justify-center text-rose-400">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <div className="max-w-sm space-y-1.5">
          <h2 className="text-lg font-bold text-white">Permintaan Masuk Ditolak</h2>
          <p className="text-xs text-slate-400">
            {errorMessage || 'Pembuat room menolak permintaan bergabung Anda ke dalam sesi obrolan ini.'}
          </p>
        </div>
        <button
          type="button"
          onClick={onBackToHome}
          className="h-10 px-5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-xl transition flex items-center space-x-2"
        >
          <HomeIcon className="w-4 h-4" />
          <span>Kembali ke Beranda</span>
        </button>
      </main>
    );
  }

  // 4. DISSOLVED STATE
  if (status === 'dissolved') {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-4 text-center space-y-4 bg-slate-950 text-slate-100">
        <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-emerald-400">
          <CheckCircle2 className="w-7 h-7" />
        </div>
        <div className="max-w-sm space-y-1.5">
          <h2 className="text-lg font-bold text-white">Room Telah Ditutup</h2>
          <p className="text-xs text-slate-400">
            {errorMessage || 'Sesi percakapan telah selesai. Seluruh riwayat obrolan telah terhapus total dari memori peramban.'}
          </p>
        </div>
        <button
          type="button"
          onClick={onBackToHome}
          className="h-10 px-5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition flex items-center space-x-2"
        >
          <HomeIcon className="w-4 h-4" />
          <span>Buka Room Baru</span>
        </button>
      </main>
    );
  }

  // 5. ERROR STATE
  if (status === 'error') {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-4 text-center space-y-4 bg-slate-950 text-slate-100">
        <div className="w-14 h-14 rounded-2xl bg-rose-950/60 border border-rose-800 flex items-center justify-center text-rose-400">
          <AlertCircle className="w-7 h-7" />
        </div>
        <div className="max-w-sm space-y-1.5">
          <h2 className="text-lg font-bold text-white">Koneksi Terputus</h2>
          <p className="text-xs text-rose-300">
            {errorMessage || 'Tidak dapat terhubung ke room. Pastikan pembuat room masih aktif dan tautan yang dimasukkan tepat.'}
          </p>
        </div>
        <button
          type="button"
          onClick={onBackToHome}
          className="h-10 px-5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-xl transition flex items-center space-x-2"
        >
          <HomeIcon className="w-4 h-4" />
          <span>Kembali ke Beranda</span>
        </button>
      </main>
    );
  }

  // 6. ACTIVE CHAT STATE
  const currentUserId = peerServiceRef.current?.getMyId() || '';

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 relative">
      <Header
        roomId={roomId}
        isHost={isHost}
        participantCount={participants.length}
        onLeaveOrDissolve={handleLeaveOrDissolve}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        isSidebarOpen={isSidebarOpen}
        onOpenSecurityModal={() => setIsSecurityModalOpen(true)}
        isStealthMode={isStealthMode}
        onToggleStealthMode={() => setIsStealthMode(!isStealthMode)}
      />

      {isHost && (
        <KnockModal
          knocks={knocks}
          onApprove={handleApproveKnock}
          onReject={handleRejectKnock}
        />
      )}

      <ChatArea
        messages={messages}
        currentUserId={currentUserId}
        typingUsers={typingUsers}
        isStealthMode={isStealthMode}
        onOpenSecurityModal={() => setIsSecurityModalOpen(true)}
        onExpireMessage={handleExpireMessage}
      />

      <ChatInput
        onSendMessage={handleSendMessage}
        onTyping={handleTyping}
      />

      <ParticipantSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        participants={participants}
        currentUserId={currentUserId}
      />

      <SecurityModal
        isOpen={isSecurityModalOpen}
        onClose={() => setIsSecurityModalOpen(false)}
        safetyData={safetyData}
        roomId={roomId}
      />
    </div>
  );
};
