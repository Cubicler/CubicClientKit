import { describe, it, expect, beforeEach, vi } from 'vitest';
import axios from 'axios';
import { CubicClient } from '../../src/core/cubicclient.js';
import type { HealthStatus } from '../../src/utils/types.js';

// Mock axios
vi.mock('axios');
const mockedAxios = vi.mocked(axios);

describe('CubicClient', () => {
  let client: CubicClient;
  const mockAxiosInstance = {
    post: vi.fn(),
    get: vi.fn(),
    interceptors: {
      response: {
        use: vi.fn(),
      },
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (mockedAxios.create as any).mockReturnValue(mockAxiosInstance);
    client = new CubicClient({ baseUrl: 'http://localhost:1503' });
  });

  describe('constructor', () => {
    it('should create client with required baseUrl', () => {
      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: 'http://localhost:1503',
        timeout: 90000,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    });

    it('should throw error if baseUrl is not provided', () => {
      expect(() => new CubicClient({} as any)).toThrow('baseUrl is required');
    });

    it('should use custom timeout when provided', () => {
      new CubicClient({ baseUrl: 'http://localhost:1503', timeout: 5000 });
      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: 'http://localhost:1503',
        timeout: 5000,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    });

    it('should configure retry interceptor when retry option is provided', () => {
      new CubicClient({ baseUrl: 'http://localhost:1503', retry: 3 });
      expect(mockAxiosInstance.interceptors.response.use).toHaveBeenCalled();
    });
  });

  describe('call', () => {
    it('should call default agent with message array', async () => {
      const mockResponse = { 
        data: { 
          sender: { id: 'gpt_4o', name: 'GPT-4O Agent' },
          timestamp: '2025-07-30T10:00:00Z',
          type: 'text' as const,
          content: 'Response from agent',
          metadata: { usedToken: 150, usedTools: 2 }
        } 
      };
      mockAxiosInstance.post.mockResolvedValue(mockResponse);

      const messages = [
        { 
          sender: { id: 'user_123', name: 'John Doe' }, 
          type: 'text' as const,
          content: 'Hello' 
        },
        { 
          sender: { id: 'gpt_4o', name: 'GPT-4O Agent' }, 
          type: 'text' as const,
          content: 'Hi there!' 
        },
      ];

      const result = await client.call(messages);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/dispatch', {
        messages,
      });
      expect(result).toBe('Response from agent');
    });

    it('should call default agent with single message object', async () => {
      const mockResponse = { 
        data: { 
          sender: { id: 'gpt_4o', name: 'GPT-4O Agent' },
          timestamp: '2025-07-30T10:00:00Z',
          type: 'text' as const,
          content: 'Response from agent',
          metadata: { usedToken: 150, usedTools: 2 }
        } 
      };
      mockAxiosInstance.post.mockResolvedValue(mockResponse);

      const result = await client.call({ 
        sender: { id: 'user_123', name: 'John Doe' }, 
        type: 'text' as const,
        content: 'Hello, agent!' 
      });

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/dispatch', {
        messages: [{ 
          sender: { id: 'user_123', name: 'John Doe' }, 
          type: 'text' as const,
          content: 'Hello, agent!' 
        }],
      });
      expect(result).toBe('Response from agent');
    });

    it('should throw error for empty message array', async () => {
      await expect(client.call([])).rejects.toThrow(
        'messages array cannot be empty'
      );
    });

    it('should throw error for invalid message structure - missing sender', async () => {
      const invalidMessages = [{ content: 'Hello' }] as any;
      await expect(client.call(invalidMessages)).rejects.toThrow(
        'Each message must have both sender and content properties'
      );
    });

    it('should throw error for invalid message structure - missing sender.id', async () => {
      const invalidMessages = [{ 
        sender: { name: 'John' }, 
        type: 'text' as const,
        content: 'Hello' 
      }] as any;
      await expect(client.call(invalidMessages)).rejects.toThrow(
        'Each message sender must have an id property'
      );
    });

    it('should throw error for invalid message structure - missing type', async () => {
      const invalidMessages = [{ 
        sender: { id: 'user_123' }, 
        content: 'Hello' 
      }] as any;
      await expect(client.call(invalidMessages)).rejects.toThrow(
        'Each message must have a type property'
      );
    });
  });

  describe('callAgent', () => {
    it('should call specific agent with message array', async () => {
      const mockResponse = { 
        data: { 
          sender: { id: 'my-agent', name: 'My Custom Agent' },
          timestamp: '2025-07-30T10:00:00Z',
          type: 'text' as const,
          content: 'Response from specific agent',
          metadata: { usedToken: 100, usedTools: 1 }
        } 
      };
      mockAxiosInstance.post.mockResolvedValue(mockResponse);

      const messages = [{ 
        sender: { id: 'user_123', name: 'John Doe' }, 
        type: 'text' as const,
        content: 'Hello specific agent' 
      }];
      const result = await client.callAgent('my-agent', messages);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/dispatch/my-agent', {
        messages,
      });
      expect(result).toBe('Response from specific agent');
    });

    it('should call specific agent with single message object', async () => {
      const mockResponse = { 
        data: { 
          sender: { id: 'my-agent', name: 'My Custom Agent' },
          timestamp: '2025-07-30T10:00:00Z',
          type: 'text' as const,
          content: 'Response from specific agent',
          metadata: { usedToken: 100, usedTools: 1 }
        } 
      };
      mockAxiosInstance.post.mockResolvedValue(mockResponse);

      const result = await client.callAgent('my-agent', { 
        sender: { id: 'user_123' }, 
        type: 'text' as const,
        content: 'Hello!' 
      });

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/dispatch/my-agent', {
        messages: [{ 
          sender: { id: 'user_123' }, 
          type: 'text' as const,
          content: 'Hello!' 
        }],
      });
      expect(result).toBe('Response from specific agent');
    });

    it('should URL encode agent names with special characters', async () => {
      const mockResponse = { 
        data: { 
          sender: { id: 'agent with spaces', name: 'Agent With Spaces' },
          timestamp: '2025-07-30T10:00:00Z',
          type: 'text' as const,
          content: 'Response',
          metadata: { usedToken: 50, usedTools: 0 }
        } 
      };
      mockAxiosInstance.post.mockResolvedValue(mockResponse);

      await client.callAgent('agent with spaces', { 
        sender: { id: 'user_123' }, 
        type: 'text' as const,
        content: 'Hello!' 
      });

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/dispatch/agent%20with%20spaces', expect.any(Object));
    });

    it('should throw error for empty agent name', async () => {
      await expect(client.callAgent('', { 
        sender: { id: 'user_123' }, 
        type: 'text' as const,
        content: 'Hello!' 
      })).rejects.toThrow(
        'agentName is required'
      );
    });
  });

  describe('getAgents', () => {
    it('should get list of available agents', async () => {
      const mockResponse = { data: { availableAgents: ['gpt_4o', 'claude_3_5', 'weather_agent'] } };
      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const result = await client.getAgents();

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/agents');
      expect(result).toEqual(['gpt_4o', 'claude_3_5', 'weather_agent']);
    });
  });

  describe('getHealth', () => {
    it('should get health status', async () => {
      const mockHealthStatus: HealthStatus = {
        status: 'healthy',
        timestamp: '2025-07-30T10:00:00Z',
        services: {
          agents: { status: 'healthy', count: 3, agents: ['gpt_4o', 'claude_3_5'] },
          providers: { status: 'healthy', count: 2, providers: ['weather_service'] },
        },
      };
      const mockResponse = { data: mockHealthStatus };
      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const result = await client.getHealth();

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/health');
      expect(result).toEqual(mockHealthStatus);
    });
  });

  describe('error handling', () => {
    it('should handle network errors', async () => {
      const networkError = new Error('Network error');
      mockAxiosInstance.post.mockRejectedValue(networkError);

      await expect(client.call({ 
        sender: { id: 'user_123' }, 
        type: 'text' as const,
        content: 'Hello!' 
      })).rejects.toThrow('Network error');
    });
  });
});
