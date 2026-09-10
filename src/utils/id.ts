export function generateRoomId(): string {
  const adjectives = [
    'swift', 'silent', 'shadow', 'cosmic', 'secret',
    'neon', 'ghost', 'quiet', 'amber', 'cyber',
    'phantom', 'hyper', 'crypto', 'dark', 'matrix', 'stealth'
  ];
  const nouns = [
    'fox', 'raven', 'falcon', 'cipher', 'echo',
    'nexus', 'pulse', 'spark', 'drift', 'vault',
    'node', 'vector', 'daemon', 'proxy', 'terminal', 'relay'
  ];
  
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const num = Math.floor(1000 + Math.random() * 9000);
  const entropy = Math.random().toString(36).substring(2, 6);

  return `${adj}-${noun}-${num}-${entropy}`;
}

// Convert room ID to an isolated namespace on the public PeerJS signaling broker
export function toPeerSignalingId(roomId: string): string {
  const clean = roomId.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
  return `anonchat-v1-${clean}`;
}
