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
import { MatrixRain } from '../components/MatrixRain';

interface RoomProps {
  roomId: string;
  nickname: string;
  isHost: boolean;
  onBackToHome: () => void;
}

export const Room: React.FC<RoomProps> = ({ roomId, nickname, isHost, onBackToHome }) => {
  const [actualRoomId, setActualRoomId] = useState(roomId);
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

  // Escape key handler for Panic / Stealth Mode
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
      onApproved: (secret: string) => {
        const url = new URL(window.location.href);
        url.hash = `key=${secret}`;
        window.history.replaceState({}, '', url.toString());
      },
      onRoomIdUpdated: (newId: string) => {
        setActualRoomId(newId);
        const url = new URL(window.location.href);
        url.searchParams.set('room', newId);
        window.history.replaceState({}, '', url.toString());
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
      if (confirm('TERMINATE_ROOM: Yakin ingin membubarkan room ini? Seluruh koneksi peer akan diputus dan seluruh buffer obrolan musnah total.')) {
        peerServiceRef.current?.destroy();
        window.location.hash = '';
        onBackToHome();
      }
    } else {
      peerServiceRef.current?.destroy();
      window.location.hash = '';
      onBackToHome();
    }
  };

  // 1. CONNECTING STATE
  if (status === 'connecting') {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-4 text-center space-y-4 bg-[#0B0E14] text-[#E0E6ED] font-mono crt-overlay">
        <MatrixRain opacity={0.15} />
        <div className="border-2 border-[#00FF66] bg-[#05070A] p-6 shadow-[0_0_20px_rgba(0,255,102,0.2)] max-w-sm space-y-3 relative z-10">
          <div className="w-10 h-10 border border-[#00FF66] bg-[#00FF66]/10 flex items-center justify-center text-[#00FF66] mx-auto">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
          <div>
            <div className="text-xs font-bold text-[#00FF66] uppercase tracking-wider">
              [ ESTABLISHING_P2P_MESH ]
            </div>
            <p className="text-[11px] text-[#8A99AD] mt-1">
              {isHost
                ? 'Deriving AES-GCM 256-bit crypto key and binding node socket...'
                : 'Searching host peer coordinates...'}
            </p>
          </div>
        </div>
      </main>
    );
  }

  // 2. WAITING APPROVAL STATE (GUEST)
  if (status === 'waiting_approval') {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-4 text-center space-y-5 bg-[#0B0E14] text-[#E0E6ED] font-mono crt-overlay">
        <MatrixRain opacity={0.15} />
        <div className="border-2 border-[#00F0FF] bg-[#05070A] p-6 shadow-[0_0_20px_rgba(0,240,255,0.2)] max-w-md space-y-4 relative z-10">
          <div className="w-12 h-12 border border-[#00F0FF] bg-[#00F0FF]/10 flex items-center justify-center text-[#00F0FF] mx-auto">
            <DoorOpen className="w-6 h-6 animate-pulse" />
          </div>
          <div className="space-y-1.5">
            <div className="text-[10px] font-bold px-2 py-0.5 bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/40 inline-block uppercase">
              HANDSHAKE_REQUEST_TRANSMITTED
            </div>
            <h2 className="text-base font-bold text-white">&gt; MENUNGGU_OTORISASI_ROOT_HOST</h2>
            <p className="text-xs text-[#8A99AD] leading-relaxed">
              Permintaan masuk telah dikirimkan ke Root Host room <span className="text-[#00F0FF] font-bold">{roomId}</span>. Ruang chat akan terbuka otomatis segera setelah disetujui.
            </p>
          </div>

          <button
            type="button"
            onClick={onBackToHome}
            className="h-10 px-5 text-xs font-bold text-[#E0E6ED] hover:text-white bg-[#0B0E14] border border-[#1F2937] hover:border-[#FF003C] hover:text-[#FF003C] transition cursor-pointer"
          >
            [ ABORT_REQUEST ]
          </button>
        </div>
      </main>
    );
  }

  // 3. REJECTED STATE
  if (status === 'rejected') {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-4 text-center space-y-4 bg-[#0B0E14] text-[#E0E6ED] font-mono crt-overlay">
        <MatrixRain opacity={0.15} />
        <div className="border-2 border-[#FF003C] bg-[#05070A] p-6 shadow-[0_0_20px_rgba(255,0,60,0.3)] max-w-md space-y-3 relative z-10">
          <div className="w-12 h-12 border border-[#FF003C] bg-[#FF003C]/10 flex items-center justify-center text-[#FF003C] mx-auto">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h2 className="text-sm font-bold text-[#FF003C] uppercase tracking-wider">
              [ ACCESS_DENIED_BY_ROOT ]
            </h2>
            <p className="text-xs text-[#8A99AD]">
              {errorMessage || 'Root Host menolak otorisasi handshake koneksi Anda ke room ini.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onBackToHome}
            className="h-10 px-5 text-xs font-bold text-white bg-[#111827] hover:bg-[#1F2937] border border-[#1F2937] transition flex items-center space-x-2 mx-auto cursor-pointer"
          >
            <HomeIcon className="w-4 h-4" />
            <span>[ RETURN_TO_TERMINAL ]</span>
          </button>
        </div>
      </main>
    );
  }

  // 4. DISSOLVED STATE
  if (status === 'dissolved') {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-4 text-center space-y-4 bg-[#0B0E14] text-[#E0E6ED] font-mono crt-overlay">
        <MatrixRain opacity={0.15} />
        <div className="border-2 border-[#00FF66] bg-[#05070A] p-6 shadow-[0_0_20px_rgba(0,255,102,0.2)] max-w-md space-y-3 relative z-10">
          <div className="w-12 h-12 border border-[#00FF66] bg-[#00FF66]/10 flex items-center justify-center text-[#00FF66] mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              [ SESSION_TERMINATED: MEMORY_PURGED ]
            </h2>
            <p className="text-xs text-[#8A99AD]">
              {errorMessage || 'Room telah dibubarkan. Seluruh buffer pesan telah dihapus tuntas dari memori peramban.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onBackToHome}
            className="h-10 px-5 text-xs font-bold text-[#0B0E14] bg-[#00FF66] hover:bg-[#00dd55] transition flex items-center space-x-2 mx-auto cursor-pointer shadow-[0_0_12px_rgba(0,255,102,0.3)]"
          >
            <HomeIcon className="w-4 h-4" />
            <span>[ NEW_SESSION ]</span>
          </button>
        </div>
      </main>
    );
  }

  // 5. ERROR STATE
  if (status === 'error') {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-4 text-center space-y-4 bg-[#0B0E14] text-[#E0E6ED] font-mono crt-overlay">
        <MatrixRain opacity={0.15} />
        <div className="border-2 border-[#FF003C] bg-[#05070A] p-6 shadow-[0_0_20px_rgba(255,0,60,0.3)] max-w-md space-y-4 relative z-10">
          <div className="w-12 h-12 border border-[#FF003C] bg-[#FF003C]/10 flex items-center justify-center text-[#FF003C] mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h2 className="text-sm font-bold text-[#FF003C] uppercase tracking-wider">
              {isHost ? '[ ROOM_INITIALIZATION_FAULT ]' : '[ CONNECTION_FAULT: HOST_OFFLINE ]'}
            </h2>
            <p className="text-xs text-[#8A99AD] leading-relaxed">
              {errorMessage || (isHost ? 'Gagal menginisialisasi broker P2P untuk room ini.' : 'Gagal tersambung ke Host. Pastikan link room tepat dan Host masih aktif.')}
            </p>
          </div>
          <button
            type="button"
            onClick={onBackToHome}
            className="h-10 px-5 text-xs font-bold text-white bg-[#111827] hover:bg-[#1F2937] border border-[#1F2937] transition flex items-center space-x-2 mx-auto cursor-pointer"
          >
            <HomeIcon className="w-4 h-4" />
            <span>[ RETURN_TO_TERMINAL ]</span>
          </button>
        </div>
      </main>
    );
  }

  // 6. ACTIVE CHAT STATE
  const currentUserId = peerServiceRef.current?.getMyId() || '';

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0E14] text-[#E0E6ED] font-mono relative crt-overlay">
      <Header
        roomId={actualRoomId}
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
        roomId={actualRoomId}
      />
    </div>
  );
};
