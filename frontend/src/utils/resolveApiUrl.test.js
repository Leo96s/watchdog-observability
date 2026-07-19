import { describe, test, expect } from 'vitest';
import { resolveApiOrigin } from './resolveApiUrl';

describe('resolveApiOrigin', () => {
  test('leaves a full origin untouched', () => {
    expect(resolveApiOrigin('http://localhost:3000')).toBe('http://localhost:3000');
  });

  test('adds https:// to a bare hostname (Render fromService/host)', () => {
    expect(resolveApiOrigin('watchdog-backend.onrender.com')).toBe('https://watchdog-backend.onrender.com');
  });

  test('strips a trailing slash', () => {
    expect(resolveApiOrigin('http://localhost:3000/')).toBe('http://localhost:3000');
  });

  test('strips a trailing /api so callers can append it exactly once', () => {
    expect(resolveApiOrigin('http://localhost:3000/api')).toBe('http://localhost:3000');
    expect(resolveApiOrigin('https://watchdog-backend.onrender.com/api')).toBe('https://watchdog-backend.onrender.com');
  });

  test('passes through falsy values', () => {
    expect(resolveApiOrigin(undefined)).toBeUndefined();
    expect(resolveApiOrigin('')).toBe('');
  });
});
