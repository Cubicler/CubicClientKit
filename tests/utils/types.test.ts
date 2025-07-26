import { describe, it, expect } from 'vitest';
import type { Message, HealthStatus, CubicClientOptions } from '../../src/utils/types.js';

describe('Types', () => {
  it('should define Message interface correctly', () => {
    const message: Message = {
      sender: 'user',
      content: 'Hello, world!',
    };

    expect(message.sender).toBe('user');
    expect(message.content).toBe('Hello, world!');
  });

  it('should define CubicClientOptions interface correctly', () => {
    const options: CubicClientOptions = {
      baseUrl: 'http://localhost:1503',
      timeout: 5000,
      retry: 3,
    };

    expect(options.baseUrl).toBe('http://localhost:1503');
    expect(options.timeout).toBe(5000);
    expect(options.retry).toBe(3);
  });

  it('should allow optional properties in CubicClientOptions', () => {
    const minimalOptions: CubicClientOptions = {
      baseUrl: 'http://localhost:1503',
    };

    expect(minimalOptions.baseUrl).toBe('http://localhost:1503');
    expect(minimalOptions.timeout).toBeUndefined();
    expect(minimalOptions.retry).toBeUndefined();
  });

  it('should define HealthStatus interface correctly', () => {
    const healthStatus: HealthStatus = {
      status: 'healthy',
      timestamp: '2024-01-01T00:00:00Z',
      services: {
        prompt: { status: 'healthy' },
        agents: {
          status: 'healthy',
          count: 3,
          agents: ['agent1', 'agent2', 'agent3'],
        },
        providers: {
          status: 'healthy',
          count: 2,
          providers: ['provider1', 'provider2'],
        },
        spec: { status: 'healthy' },
      },
    };

    expect(healthStatus.status).toBe('healthy');
    expect(healthStatus.services.agents?.count).toBe(3);
    expect(healthStatus.services.agents?.agents).toHaveLength(3);
  });

  it('should allow unhealthy status with error messages', () => {
    const unhealthyStatus: HealthStatus = {
      status: 'unhealthy',
      timestamp: '2024-01-01T00:00:00Z',
      services: {
        prompt: {
          status: 'unhealthy',
          error: 'Connection failed',
        },
      },
    };

    expect(unhealthyStatus.status).toBe('unhealthy');
    expect(unhealthyStatus.services.prompt?.status).toBe('unhealthy');
    expect(unhealthyStatus.services.prompt?.error).toBe('Connection failed');
  });
});
