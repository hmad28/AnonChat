import Peer, { DataConnection } from 'peerjs';
import { ChatMessage, KnockRequest, P2PPayload, Participant, Role } from '../types';
import { sound } from '../utils/audio';
import { deriveRoomKey, encryptText, decryptText, EncryptedData } from '../utils/crypto';

export interface PeerServiceCallbacks {
  onStatusChange?: (
    status: 'connecting' | 'waiting_approval' | 'active' | 'rejected' | 'dissolved' | 'error',
    errorMsg?: string
  ) => void;
  onKnockReceived?: (request: KnockRequest) => void;
  onKnockHandled?: (peerId: string) => void;
  onMessageReceived?: (message: ChatMessage) => void;
  onParticipantsUpdated?: (participants: Participant[]) => void;
  onRoomDissolved?: (reason?: string) => void;
  onTypingUpdated?: (senderId: string, nickname: string, isTyping: boolean) => void;
  onKeyReady?: (key: CryptoKey) => void;
}

export class PeerService {
  private peer: Peer | null = null;
  private role: Role = 'guest';
  private myId: string = '';
  private myNickname: string = '';
  private myColor: string = '';
  private hostPeerId: string = '';
  private callbacks: PeerServiceCallbacks = {};

  // E2EE Crypto Key
  private roomSecret: string = '';
  private cryptoKey: CryptoKey | null = null;

  // For Host: active connections map (peerId -> DataConnection)
  private connections: Map<string, DataConnection> = new Map();
  // For Host: pending knock connections map (peerId -> { conn, request })
  private pendingKnocks: Map<string, { conn: DataConnection; request: KnockRequest }> = new Map();
  // List of participants in room
  private participants: Participant[] = [];

  // For Guest: connection to host
  private hostConn: DataConnection | null = null;

  constructor(callbacks: PeerServiceCallbacks) {
    this.callbacks = callbacks;
  }

  getRole(): Role {
    return this.role;
  }

  getMyId(): string {
    return this.myId;
  }

  getParticipants(): Participant[] {
    return this.participants;
  }

  getCryptoKey(): CryptoKey | null {
    return this.cryptoKey;
  }

  getRoomSecret(): string {
    return this.roomSecret;
  }

  // -------------------------------------------------------------
  // HOST INITIALIZATION
  // -------------------------------------------------------------
  async initHost(roomId: string, nickname: string, color: string, roomSecret: string): Promise<string> {
    this.role = 'host';
    this.myNickname = nickname;
    this.myColor = color;
    this.hostPeerId = roomId;
    this.roomSecret = roomSecret;

    // Derive 256-bit AES-GCM CryptoKey
    this.cryptoKey = await deriveRoomKey(roomSecret, roomId);
    this.callbacks.onKeyReady?.(this.cryptoKey);

    return new Promise((resolve, reject) => {
      this.peer = new Peer(roomId, {
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:global.stun.twilio.com:3478' },
          ],
        },
        debug: 1,
      });

      this.peer.on('open', (id) => {
        this.myId = id;
        const hostParticipant: Participant = {
          id,
          nickname,
          role: 'host',
          joinedAt: Date.now(),
          color,
        };
        this.participants = [hostParticipant];
        this.callbacks.onParticipantsUpdated?.(this.participants);
        this.callbacks.onStatusChange?.('active');
        resolve(id);
      });

      this.peer.on('connection', (conn) => {
        this.handleIncomingConnectionAsHost(conn);
      });

      this.peer.on('error', (err) => {
        console.error('Peer host error:', err);
        if (err.type === 'unavailable-id') {
          this.callbacks.onStatusChange?.('error', 'ID Room ini sudah sedang digunakan oleh sesi lain. Buat ID baru.');
        } else {
          this.callbacks.onStatusChange?.('error', err.message || 'Terjadi kesalahan koneksi P2P');
        }
        reject(err);
      });
    });
  }

  private handleIncomingConnectionAsHost(conn: DataConnection) {
    conn.on('open', () => {
      // Waiting for KNOCK payload
    });

    conn.on('data', async (raw) => {
      const payload = raw as P2PPayload;
      if (payload.type === 'KNOCK') {
        const req: KnockRequest = {
          id: conn.peer,
          nickname: payload.nickname,
          requestedAt: Date.now(),
        };
        this.pendingKnocks.set(conn.peer, { conn, request: req });
        sound.playKnock();
        this.callbacks.onKnockReceived?.(req);
      } else if (payload.type === 'ENCRYPTED_MSG') {
        // Star Relay: Forward encrypted ciphertext directly to all other peers without decrypting
        this.broadcast(payload, conn.peer);

        // Decrypt locally for Host's own view
        if (this.cryptoKey) {
          try {
            const jsonText = await decryptText(payload.encrypted, this.cryptoKey);
            const chatMsg = JSON.parse(jsonText) as ChatMessage;
            this.callbacks.onMessageReceived?.(chatMsg);
            if (chatMsg.type === 'chat') {
              sound.playMessage();
            }
          } catch (e) {
            console.error('Failed to decrypt message as host:', e);
          }
        }
      } else if (payload.type === 'TYPING') {
        this.broadcast(payload, conn.peer);
        this.callbacks.onTypingUpdated?.(payload.senderId, payload.nickname, payload.isTyping);
      }
    });

    conn.on('close', () => {
      this.handleParticipantDisconnect(conn.peer);
    });

    conn.on('error', (err) => {
      console.warn('Guest connection error:', err);
      this.handleParticipantDisconnect(conn.peer);
    });
  }

  approveKnock(peerId: string, color: string) {
    const pending = this.pendingKnocks.get(peerId);
    if (!pending) return;

    const { conn, request } = pending;
    this.pendingKnocks.delete(peerId);
    this.callbacks.onKnockHandled?.(peerId);

    const newParticipant: Participant = {
      id: peerId,
      nickname: request.nickname,
      role: 'guest',
      joinedAt: Date.now(),
      color,
    };

    this.connections.set(peerId, conn);
    this.participants.push(newParticipant);

    // Send APPROVE along with roomSecret so the approved guest can derive the AES-GCM key
    const approvePayload: P2PPayload = {
      type: 'APPROVE',
      participants: this.participants,
      roomSecret: this.roomSecret,
    };
    conn.send(approvePayload);

    // Notify others
    const joinPayload: P2PPayload = {
      type: 'USER_JOINED',
      participant: newParticipant,
    };
    this.broadcast(joinPayload, peerId);

    // System announcement message
    const sysMsg: ChatMessage = {
      id: `sys-${Date.now()}-${Math.random()}`,
      senderId: 'system',
      senderName: 'Sistem',
      text: `${request.nickname} bergabung ke room`,
      timestamp: Date.now(),
      type: 'system',
    };

    // Send encrypted system message
    this.sendSystemMessage(sysMsg);
    this.callbacks.onParticipantsUpdated?.(this.participants);
    sound.playJoin();
  }

  rejectKnock(peerId: string) {
    const pending = this.pendingKnocks.get(peerId);
    if (!pending) return;

    const { conn } = pending;
    this.pendingKnocks.delete(peerId);
    this.callbacks.onKnockHandled?.(peerId);

    const rejectPayload: P2PPayload = {
      type: 'REJECT',
      reason: 'Permintaan bergabung ditolak oleh Host',
    };
    try {
      conn.send(rejectPayload);
    } catch {}

    setTimeout(() => {
      conn.close();
    }, 500);
  }

  // -------------------------------------------------------------
  // GUEST INITIALIZATION
  // -------------------------------------------------------------
  async initGuest(hostRoomId: string, nickname: string, color: string, initialSecret?: string): Promise<void> {
    this.role = 'guest';
    this.myNickname = nickname;
    this.myColor = color;
    this.hostPeerId = hostRoomId;
    if (initialSecret) {
      this.roomSecret = initialSecret;
    }

    return new Promise((resolve, reject) => {
      this.peer = new Peer({
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:global.stun.twilio.com:3478' },
          ],
        },
        debug: 1,
      });

      this.peer.on('open', (id) => {
        this.myId = id;
        this.callbacks.onStatusChange?.('waiting_approval');

        const conn = this.peer!.connect(hostRoomId, {
          reliable: true,
        });

        this.hostConn = conn;

        conn.on('open', () => {
          const knockPayload: P2PPayload = {
            type: 'KNOCK',
            nickname: this.myNickname,
          };
          conn.send(knockPayload);
          resolve();
        });

        conn.on('data', (raw) => {
          this.handleHostData(raw as P2PPayload);
        });

        conn.on('close', () => {
          this.callbacks.onStatusChange?.('dissolved', 'Host menutup room atau terputus.');
          this.callbacks.onRoomDissolved?.('Room telah dibubarkan oleh Host.');
        });

        conn.on('error', (err) => {
          console.error('Connection to host error:', err);
          this.callbacks.onStatusChange?.('error', 'Gagal terhubung ke Host. Pastikan link room benar dan Host masih aktif.');
        });
      });

      this.peer.on('error', (err) => {
        console.error('Guest Peer error:', err);
        this.callbacks.onStatusChange?.('error', 'Gagal menginisialisasi koneksi P2P');
        reject(err);
      });
    });
  }

  private async handleHostData(payload: P2PPayload) {
    if (payload.type === 'APPROVE') {
      this.roomSecret = payload.roomSecret;
      // Derive 256-bit AES-GCM key upon approval
      this.cryptoKey = await deriveRoomKey(payload.roomSecret, this.hostPeerId);
      this.callbacks.onKeyReady?.(this.cryptoKey);

      this.participants = payload.participants;
      this.callbacks.onParticipantsUpdated?.(this.participants);
      this.callbacks.onStatusChange?.('active');
      sound.playJoin();
    } else if (payload.type === 'REJECT') {
      this.callbacks.onStatusChange?.('rejected', payload.reason || 'Permintaan ditolak oleh Host');
    } else if (payload.type === 'ENCRYPTED_MSG') {
      if (this.cryptoKey) {
        try {
          const jsonText = await decryptText(payload.encrypted, this.cryptoKey);
          const chatMsg = JSON.parse(jsonText) as ChatMessage;
          this.callbacks.onMessageReceived?.(chatMsg);
          if (chatMsg.type === 'chat') {
            sound.playMessage();
          }
        } catch (e) {
          console.error('Decryption failed on guest side:', e);
        }
      }
    } else if (payload.type === 'USER_JOINED') {
      this.participants.push(payload.participant);
      this.callbacks.onParticipantsUpdated?.(this.participants);
    } else if (payload.type === 'USER_LEFT') {
      this.participants = this.participants.filter((p) => p.id !== payload.participantId);
      this.callbacks.onParticipantsUpdated?.(this.participants);
      sound.playLeave();
    } else if (payload.type === 'ROOM_DISSOLVED') {
      this.callbacks.onStatusChange?.('dissolved', payload.reason || 'Room telah dibubarkan.');
      this.callbacks.onRoomDissolved?.(payload.reason);
      sound.playLeave();
    } else if (payload.type === 'TYPING') {
      this.callbacks.onTypingUpdated?.(payload.senderId, payload.nickname, payload.isTyping);
    }
  }

  // -------------------------------------------------------------
  // E2EE SEND MESSAGE
  // -------------------------------------------------------------
  async sendMessage(text: string, vanishDuration: number = 0) {
    const trimmed = text.trim();
    if (!trimmed || !this.cryptoKey) return;

    const now = Date.now();
    const chatMsg: ChatMessage = {
      id: `msg-${now}-${Math.random().toString(36).substring(2, 9)}`,
      senderId: this.myId,
      senderName: this.myNickname,
      text: trimmed,
      timestamp: now,
      type: 'chat',
      color: this.myColor,
      vanishDuration: vanishDuration > 0 ? vanishDuration : undefined,
      expiresAt: vanishDuration > 0 ? now + vanishDuration * 1000 : undefined,
    };

    // Encrypt message content with AES-GCM 256-bit
    const jsonString = JSON.stringify(chatMsg);
    const encryptedData = await encryptText(jsonString, this.cryptoKey);

    const payload: P2PPayload = {
      type: 'ENCRYPTED_MSG',
      encrypted: encryptedData,
    };

    if (this.role === 'host') {
      this.broadcast(payload);
      this.callbacks.onMessageReceived?.(chatMsg);
    } else {
      if (this.hostConn && this.hostConn.open) {
        this.hostConn.send(payload);
        this.callbacks.onMessageReceived?.(chatMsg);
      }
    }
  }

  private async sendSystemMessage(sysMsg: ChatMessage) {
    if (!this.cryptoKey) return;
    try {
      const encrypted = await encryptText(JSON.stringify(sysMsg), this.cryptoKey);
      const payload: P2PPayload = {
        type: 'ENCRYPTED_MSG',
        encrypted,
      };
      this.broadcast(payload);
      this.callbacks.onMessageReceived?.(sysMsg);
    } catch {}
  }

  sendTyping(isTyping: boolean) {
    const payload: P2PPayload = {
      type: 'TYPING',
      senderId: this.myId,
      nickname: this.myNickname,
      isTyping,
    };

    if (this.role === 'host') {
      this.broadcast(payload);
    } else if (this.hostConn && this.hostConn.open) {
      this.hostConn.send(payload);
    }
  }

  private broadcast(payload: P2PPayload, excludePeerId?: string) {
    this.connections.forEach((conn, peerId) => {
      if (peerId !== excludePeerId && conn.open) {
        try {
          conn.send(payload);
        } catch (err) {
          console.warn('Failed to send to', peerId, err);
        }
      }
    });
  }

  private handleParticipantDisconnect(peerId: string) {
    if (this.role !== 'host') return;

    const participant = this.participants.find((p) => p.id === peerId);
    if (participant) {
      this.participants = this.participants.filter((p) => p.id !== peerId);
      this.connections.delete(peerId);

      const leavePayload: P2PPayload = {
        type: 'USER_LEFT',
        participantId: peerId,
        nickname: participant.nickname,
      };
      this.broadcast(leavePayload);

      const sysMsg: ChatMessage = {
        id: `sys-${Date.now()}-${Math.random()}`,
        senderId: 'system',
        senderName: 'Sistem',
        text: `${participant.nickname} telah keluar`,
        timestamp: Date.now(),
        type: 'system',
      };
      this.sendSystemMessage(sysMsg);
      this.callbacks.onParticipantsUpdated?.(this.participants);
      sound.playLeave();
    }
  }

  destroy() {
    if (this.role === 'host') {
      const dissolvePayload: P2PPayload = {
        type: 'ROOM_DISSOLVED',
        reason: 'Host telah menutup room chat.',
      };
      this.broadcast(dissolvePayload);

      this.connections.forEach((conn) => {
        try {
          conn.close();
        } catch {}
      });
      this.connections.clear();
      this.pendingKnocks.clear();
    } else {
      if (this.hostConn) {
        try {
          this.hostConn.close();
        } catch {}
      }
    }

    if (this.peer) {
      try {
        this.peer.destroy();
      } catch {}
      this.peer = null;
    }

    this.participants = [];
    this.cryptoKey = null;
  }
}
