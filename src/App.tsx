import { useState, useEffect } from 'react';
import { Home } from './pages/Home';
import { Room } from './pages/Room';

export function App() {
  const [currentRoom, setCurrentRoom] = useState<{
    roomId: string;
    nickname: string;
    isHost: boolean;
  } | null>(null);

  const [initialJoinRoomId, setInitialJoinRoomId] = useState<string>('');

  useEffect(() => {
    // Check URL query parameters for invited room: ?room=xxxx
    const params = new URLSearchParams(window.location.search);
    const roomFromUrl = params.get('room');
    if (roomFromUrl) {
      setInitialJoinRoomId(roomFromUrl);
    }
  }, []);

  const handleStartRoom = (roomId: string, nickname: string, isHost: boolean) => {
    setCurrentRoom({ roomId, nickname, isHost });
    // Update URL query without full page reload
    const url = new URL(window.location.href);
    url.searchParams.set('room', roomId);
    window.history.pushState({}, '', url.toString());
  };

  const handleBackToHome = () => {
    setCurrentRoom(null);
    setInitialJoinRoomId('');
    // Clear room query parameter and key hash
    const url = new URL(window.location.href);
    url.searchParams.delete('room');
    url.hash = '';
    window.history.pushState({}, '', url.pathname);
  };

  return (
    <div className="min-h-screen bg-[#0B0E14] text-[#E0E6ED] selection:bg-[#00FF66] selection:text-[#0B0E14]">
      {currentRoom ? (
        <Room
          roomId={currentRoom.roomId}
          nickname={currentRoom.nickname}
          isHost={currentRoom.isHost}
          onBackToHome={handleBackToHome}
        />
      ) : (
        <Home
          onStartRoom={handleStartRoom}
          initialRoomId={initialJoinRoomId}
        />
      )}
    </div>
  );
}

export default App;
