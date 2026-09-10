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
    // Clear room query parameter
    const url = new URL(window.location.href);
    url.searchParams.delete('room');
    window.history.pushState({}, '', url.pathname);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
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
