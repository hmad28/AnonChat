export interface StealthInvite {
  roomId: string;
  key?: string;
}

/**
 * Encode room ID and optional encryption secret into a single opaque, URL-safe stealth ticket.
 * e.g. ["7K9MP2", "a1b2c3d4..."] -> "WyI3SzlNUDIiLCJhMWIyYzNkNCI...]"
 */
export function encodeStealthTicket(roomId: string, key?: string): string {
  const payload = JSON.stringify([roomId.trim().toUpperCase(), key?.trim() || '']);
  return btoa(payload)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Decode stealth ticket back into roomId and optional key.
 */
export function decodeStealthTicket(ticket: string): StealthInvite | null {
  try {
    let base64 = ticket.trim().replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    const json = atob(base64);
    const parsed = JSON.parse(json);
    if (Array.isArray(parsed) && parsed[0]) {
      return {
        roomId: String(parsed[0]).trim().toUpperCase(),
        key: parsed[1] ? String(parsed[1]).trim() : undefined,
      };
    }
  } catch {}
  return null;
}

/**
 * Generate a 100% private, server-blind invite URL.
 * Everything is placed inside the hash (#node=...) so nothing ever touches Vercel/server logs.
 */
export function generateStealthInviteUrl(roomId: string, key?: string): string {
  const ticket = encodeStealthTicket(roomId, key);
  if (typeof window === 'undefined') {
    return `#node=${ticket}`;
  }
  const base = `${window.location.origin}${window.location.pathname}`;
  return `${base}#node=${ticket}`;
}

/**
 * Parse any incoming URL (both new stealth hash `#node=...`, `#s=...`, or legacy `?room=...#key=...`).
 */
export function parseIncomingInvite(): StealthInvite | null {
  if (typeof window === 'undefined') return null;

  // 1. Check hash for stealth tickets: #node=..., #s=..., #join=...
  const rawHash = window.location.hash.replace(/^#/, '').trim();
  if (rawHash) {
    const hashParams = new URLSearchParams(rawHash);
    const stealthToken =
      hashParams.get('node') ||
      hashParams.get('s') ||
      hashParams.get('join') ||
      hashParams.get('ticket');

    if (stealthToken) {
      const decoded = decodeStealthTicket(stealthToken);
      if (decoded) return decoded;
    }

    // Direct hash ticket without param prefix (e.g. #WyI3SzlNUD...)
    if (rawHash.length >= 10 && !rawHash.includes('=')) {
      const decoded = decodeStealthTicket(rawHash);
      if (decoded) return decoded;
    }
  }

  // 2. Fallback to query params (?room=...#key=...) for backwards compatibility
  const searchParams = new URLSearchParams(window.location.search);
  const roomFromQuery = searchParams.get('room');
  if (roomFromQuery) {
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    const keyFromHash = hashParams.get('key') || undefined;
    return {
      roomId: roomFromQuery.trim().toUpperCase(),
      key: keyFromHash,
    };
  }

  return null;
}
