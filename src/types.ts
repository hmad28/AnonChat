import { EncryptedData } from './utils/crypto';

export type Role = 'host' | 'guest';

export interface Participant {
  id: string; // Peer ID
  nickname: string;
  role: Role;
  joinedAt: number;
  color: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: number;
  type: 'chat' | 'system';
  color?: string;
  vanishDuration?: number; // In seconds (e.g. 30, 60, 300). 0 or undefined = permanent during session
  expiresAt?: number; // Timestamp ms when this message will vanish
}

export interface KnockRequest {
  id: string; // Peer ID of knocking user
  nickname: string;
  requestedAt: number;
}

export type P2PPayload =
  | { type: 'KNOCK'; nickname: string }
  | { type: 'APPROVE'; participants: Participant[]; roomSecret: string; roomName?: string }
  | { type: 'REJECT'; reason?: string }
  | { type: 'ENCRYPTED_MSG'; encrypted: EncryptedData }
  | { type: 'USER_JOINED'; participant: Participant }
  | { type: 'USER_LEFT'; participantId: string; nickname: string }
  | { type: 'ROOM_DISSOLVED'; reason?: string }
  | { type: 'TYPING'; senderId: string; nickname: string; isTyping: boolean };
