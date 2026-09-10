import { describe, it, expect } from 'vitest';
import { generateRoomId, toPeerSignalingId } from './id';
import { getRandomColor, getInitials } from './colors';

describe('Utility Functions', () => {
  it('should generate valid room ID in high-entropy adjective-noun-number-entropy format', () => {
    const id1 = generateRoomId();
    const id2 = generateRoomId();

    expect(id1).toMatch(/^[a-z]+-[a-z]+-\d{4}-[a-z0-9]+$/);
    expect(id2).toMatch(/^[a-z]+-[a-z]+-\d{4}-[a-z0-9]+$/);
    expect(id1).not.toBe(id2);
  });

  it('should scope room ID to isolated PeerJS signaling namespace', () => {
    expect(toPeerSignalingId('swift-fox-1234-a9b2')).toBe('anonchat-v1-swift-fox-1234-a9b2');
    expect(toPeerSignalingId('  CYBER_VAULT-999  ')).toBe('anonchat-v1-cybervault-999');
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
});
