import { useState, useEffect } from 'react';
import { Home } from './pages/Home';
import { Room } from './pages/Room';
import { parseIncomingInvite } from './utils/stealth';

export function App() {
  const [currentRoom, setCurrentRoom] = useState<{
    roomId: string;
    nickname: string;
    isHost: boolean;
    roomSecret?: string;
  } | null>(null);

  useEffect(() => {
    // Check for incoming invite (stealth hash #node=... or legacy ?room=...)
    const invite = parseIncomingInvite();
    if (invite && invite.roomId) {
      // Immediately clean visible URL bar so room ID and tokens don't leak in browser history
      try {
        window.history.replaceState({}, '', window.location.pathname);
      } catch {}

      // Auto-assign random callsign or remembered callsign
      const savedNick = sessionStorage.getItem('anon_callsign');
      const autoNick = savedNick || `GUEST_${Math.floor(100 + Math.random() * 900)}`;

      // IMMEDIATELY ENTER THE ROOM! No landing page, no "bikin room chat dan gabung"
      setCurrentRoom({
        roomId: invite.roomId,
        nickname: autoNick,
        isHost: false,
        roomSecret: invite.key,
      });
    }
  }, []);

  const handleStartRoom = (roomId: string, nickname: string, isHost: boolean, roomSecret?: string) => {
    // Save callsign preference
    sessionStorage.setItem('anon_callsign', nickname);
    // Keep URL clean without appending query parameters
    try {
      window.history.replaceState({}, '', window.location.pathname);
    } catch {}
    setCurrentRoom({ roomId, nickname, isHost, roomSecret });
  };

  const handleBackToHome = () => {
    setCurrentRoom(null);
    try {
      window.history.replaceState({}, '', window.location.pathname);
    } catch {}
  };

  return (
    <div className="min-h-screen bg-[#0B0E14] text-[#E0E6ED] selection:bg-[#00FF66] selection:text-[#0B0E14]">
      {currentRoom ? (
        <Room
          roomId={currentRoom.roomId}
          nickname={currentRoom.nickname}
          isHost={currentRoom.isHost}
          initialRoomSecret={currentRoom.roomSecret}
          onBackToHome={handleBackToHome}
        />
      ) : (
        <Home onStartRoom={handleStartRoom} />
      )}
    </div>
  );
}

export default App;
