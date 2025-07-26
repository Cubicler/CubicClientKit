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
      const mockResponse = { data: { message: 'Response from agent' } };
      mockAxiosInstance.post.mockResolvedValue(mockResponse);

      const messages = [
        { sender: 'user', content: 'Hello' },
        { sender: 'assistant', content: 'Hi there!' },
      ];

      const result = await client.call(messages);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/call', {
        messages,
      });
      expect(result).toBe('Response from agent');
    });

    it('should call default agent with single message object', async () => {
      const mockResponse = { data: { message: 'Response from agent' } };
      mockAxiosInstance.post.mockResolvedValue(mockResponse);

      const result = await client.call({ sender: 'user', content: 'Hello, agent!' });

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/call', {
        messages: [{ sender: 'user', content: 'Hello, agent!' }],
      });
      expect(result).toBe('Response from agent');
    });

    it('should throw error for empty message array', async () => {
      await expect(client.call([])).rejects.toThrow(
        'messages array cannot be empty'
      );
    });

    it('should throw error for invalid message structure', async () => {
      const invalidMessages = [{ sender: 'user' }] as any;
      await expect(client.call(invalidMessages)).rejects.toThrow(
        'Each message must have both sender and content properties'
      );
    });
  });

  describe('callAgent', () => {
    it('should call specific agent with message array', async () => {
      const mockResponse = { data: { message: 'Response from specific agent' } };
      mockAxiosInstance.post.mockResolvedValue(mockResponse);

      const messages = [{ sender: 'user', content: 'Hello specific agent' }];
      const result = await client.callAgent('my-agent', messages);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/call/my-agent', {
        messages,
      });
      expect(result).toBe('Response from specific agent');
    });

    it('should call specific agent with single message object', async () => {
      const mockResponse = { data: { message: 'Response from specific agent' } };
      mockAxiosInstance.post.mockResolvedValue(mockResponse);

      const result = await client.callAgent('my-agent', { sender: 'user', content: 'Hello!' });

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/call/my-agent', {
        messages: [{ sender: 'user', content: 'Hello!' }],
      });
      expect(result).toBe('Response from specific agent');
    });

    it('should encode agent name in URL', async () => {
      const mockResponse = { data: { message: 'Response' } };
      mockAxiosInstance.post.mockResolvedValue(mockResponse);

      await client.callAgent('agent with spaces', { sender: 'user', content: 'Hello!' });

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/call/agent%20with%20spaces', {
        messages: [{ sender: 'user', content: 'Hello!' }],
      });
    });

    it('should throw error if agentName is not provided', async () => {
      await expect(client.callAgent('', { sender: 'user', content: 'Hello!' })).rejects.toThrow(
        'agentName is required'
      );
    });
  });

  describe('getAgents', () => {
    it('should return list of available agents', async () => {
      const mockResponse = {
        data: { availableAgents: ['agent1', 'agent2', 'agent3'] },
      };
      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const result = await client.getAgents();

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/agents');
      expect(result).toEqual(['agent1', 'agent2', 'agent3']);
    });
  });

  describe('getHealth', () => {
    it('should return health status', async () => {
      const mockHealthStatus: HealthStatus = {
        status: 'healthy',
        timestamp: '2024-01-01T00:00:00Z',
        services: {
          prompt: { status: 'healthy' },
          agents: { status: 'healthy', count: 3, agents: ['agent1', 'agent2'] },
          providers: { status: 'healthy', count: 2 },
          spec: { status: 'healthy' },
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
    it('should propagate HTTP errors to the user', async () => {
      const mockError = new Error('Network error');
      mockAxiosInstance.post.mockRejectedValue(mockError);

      await expect(client.call({ sender: 'user', content: 'Hello!' })).rejects.toThrow('Network error');
    });

    it('should propagate API errors to the user', async () => {
      const mockError = {
        response: { status: 400, data: { error: 'Bad request' } },
      };
      mockAxiosInstance.get.mockRejectedValue(mockError);

      await expect(client.getAgents()).rejects.toEqual(mockError);
    });
  });
});
