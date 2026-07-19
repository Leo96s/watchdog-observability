import { describe, test, expect, beforeEach, vi } from 'vitest';

const useMock = vi.hoisted(() => vi.fn());

vi.mock('axios', () => ({
  default: {
    create: () => ({ interceptors: { request: { use: useMock } } }),
  },
}));

import '../services/api.service';

describe('api.service request interceptor', () => {
  const interceptor = () => useMock.mock.calls[0][0];

  beforeEach(() => {
    localStorage.clear();
  });

  test('attaches X-API-Key on mutating requests when a key is stored', () => {
    localStorage.setItem('watchdog_api_key', 'abc123');
    const config = interceptor()({ method: 'post', headers: {} });
    expect(config.headers['X-API-Key']).toBe('abc123');
  });

  test('does not attach a header on GET requests', () => {
    localStorage.setItem('watchdog_api_key', 'abc123');
    const config = interceptor()({ method: 'get', headers: {} });
    expect(config.headers['X-API-Key']).toBeUndefined();
  });

  test('does not attach a header when no key is stored', () => {
    const config = interceptor()({ method: 'delete', headers: {} });
    expect(config.headers['X-API-Key']).toBeUndefined();
  });
});
