import { describe, it, expect } from 'vitest';
import { encodeInviteCode } from './invite';

describe('encodeInviteCode', () => {
  it('returns "000000" for teamId 0', () => {
    expect(encodeInviteCode(0)).toBe('000000');
  });

  it('returns "000001" for teamId 1', () => {
    // (1).toString(36) = "1", padded to 6 → "000001"
    expect(encodeInviteCode(1)).toBe('000001');
  });

  it('always returns exactly 6 characters', () => {
    [0, 1, 35, 36, 1295, 1296, 46655, 46656, 999999].forEach(id => {
      expect(encodeInviteCode(id)).toHaveLength(6);
    });
  });

  it('result is always uppercase', () => {
    [10, 35, 36, 100, 46655].forEach(id => {
      const result = encodeInviteCode(id);
      expect(result).toBe(result.toUpperCase());
    });
  });

  it('returns "00000Z" for teamId 35 (max single base-36 digit)', () => {
    // (35).toString(36) = "z", toUpperCase → "Z", padded → "00000Z"
    expect(encodeInviteCode(35)).toBe('00000Z');
  });

  it('returns "000010" for teamId 36 (base-36 two digits)', () => {
    // (36).toString(36) = "10"
    expect(encodeInviteCode(36)).toBe('000010');
  });

  it('returns "00ZZZ" region — "0ZZZZZ" for teamId 60466175 minus check 46655', () => {
    // (46655).toString(36) = "zzz" → "ZZZ", padded to 6 → "000ZZZ"
    expect(encodeInviteCode(46655)).toBe('000ZZZ');
  });

  it('returns "000ZZ0" for teamId 46620 to validate mixed padding', () => {
    // (46620).toString(36): 46620 / 36 = 1295 r 0, 1295 / 36 = 35 r 35, 35 → "z"
    // so "zz0" → "ZZ0", padded → "000ZZ0"
    expect(encodeInviteCode(46620)).toBe('000ZZ0');
  });

  it('returns 6-char result without leading zeros for large values', () => {
    // (60466175).toString(36) = "zzzzz" (5 chars) → padded → "0ZZZZZ"
    expect(encodeInviteCode(60466175)).toBe('0ZZZZZ');
  });

  it('returns exactly 6 chars without padding for 6-digit base-36 numbers', () => {
    // (2176782336 - 1) = 2176782335 → "zzzzzz" (6 chars) → "ZZZZZZ"
    expect(encodeInviteCode(2176782335)).toBe('ZZZZZZ');
  });
});
