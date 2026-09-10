export function generateRoomId(): string {
  const adjectives = ['swift', 'silent', 'shadow', 'cosmic', 'secret', 'neon', 'ghost', 'quiet', 'amber', 'cyber'];
  const nouns = ['fox', 'raven', 'falcon', 'cipher', 'echo', 'nexus', 'pulse', 'spark', 'drift', 'vault'];
  
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const num = Math.floor(100 + Math.random() * 900);

  return `${adj}-${noun}-${num}`;
}
