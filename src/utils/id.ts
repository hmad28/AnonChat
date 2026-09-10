// Unambiguous alphanumeric charset (32 chars): excluding 0, O, 1, I to eliminate human reading confusion
const ROOM_ID_CHARS = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

export function generateRoomId(length: number = 6): string {
  let result = '';
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const values = new Uint8Array(length);
    crypto.getRandomValues(values);
    for (let i = 0; i < length; i++) {
      result += ROOM_ID_CHARS[values[i] % ROOM_ID_CHARS.length];
    }
  } else {
    for (let i = 0; i < length; i++) {
      result += ROOM_ID_CHARS[Math.floor(Math.random() * ROOM_ID_CHARS.length)];
    }
  }
  return result;
}

// Convert room ID to an isolated namespace on the public PeerJS signaling broker
export function toPeerSignalingId(roomId: string): string {
  const clean = roomId.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
  return `anonchat-v1-${clean}`;
}
