import { describe, it, expect } from 'vitest';
import { generateRoomId } from './id';
import { getRandomColor, getInitials } from './colors';

describe('Utility Functions', () => {
  it('should generate valid room ID in adjective-noun-number format', () => {
    const id1 = generateRoomId();
    const id2 = generateRoomId();

    expect(id1).toMatch(/^[a-z]+-[a-z]+-\d{3}$/);
    expect(id2).toMatch(/^[a-z]+-[a-z]+-\d{3}$/);
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
