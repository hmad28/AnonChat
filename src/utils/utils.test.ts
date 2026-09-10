import { describe, it, expect } from 'vitest';
import { generateRoomId, toPeerSignalingId } from './id';
import { getRandomColor, getInitials } from './colors';

describe('Utility Functions', () => {
  it('should generate valid 6-character or custom length room IDs with high entropy', () => {
    const id1 = generateRoomId();
    const id2 = generateRoomId();
    const id8 = generateRoomId(8);

    expect(id1).toHaveLength(6);
    expect(id2).toHaveLength(6);
    expect(id8).toHaveLength(8);

    expect(id1).toMatch(/^[2-9A-HJ-NP-Z]{6}$/);
    expect(id2).toMatch(/^[2-9A-HJ-NP-Z]{6}$/);
    expect(id8).toMatch(/^[2-9A-HJ-NP-Z]{8}$/);
    expect(id1).not.toBe(id2);
  });

  it('should scope room ID to isolated PeerJS signaling namespace regardless of case', () => {
    expect(toPeerSignalingId('7K9MP2')).toBe('anonchat-v1-7k9mp2');
    expect(toPeerSignalingId('  7k9mp2  ')).toBe('anonchat-v1-7k9mp2');
    expect(toPeerSignalingId('X8M4K2P9')).toBe('anonchat-v1-x8m4k2p9');
  });

  it('should get correct initials from single or multiple word names', () => {
    expect(getInitials('PHANTOM')).toBe('PH');
    expect(getInitials('Cyber Fox')).toBe('CF');
    expect(getInitials('Root System Operator')).toBe('RO');
    expect(getInitials('')).toBe('?');
  });

  it('should return a non-empty color class string', () => {
    const color = getRandomColor();
    expect(color).toBeTruthy();
    expect(color).toContain('text-');
  });

  it('should encode and decode stealth invite tickets securely', async () => {
    const { encodeStealthTicket, decodeStealthTicket } = await import('./stealth');
    const roomId = '7K9MP2';
    const key = 'a1b2c3d4e5f60718293a4b5c6d7e8f90';

    const ticket = encodeStealthTicket(roomId, key);
    expect(ticket).toBeTruthy();
    // Must NOT contain obvious words or raw room code
    expect(ticket).not.toContain('7K9MP2');
    expect(ticket).not.toContain('room=');
    expect(ticket).not.toContain('key=');

    const decoded = decodeStealthTicket(ticket);
    expect(decoded).not.toBeNull();
    expect(decoded?.roomId).toBe('7K9MP2');
    expect(decoded?.key).toBe(key);
  });
});
