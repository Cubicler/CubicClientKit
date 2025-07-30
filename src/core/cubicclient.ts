import axios, { AxiosInstance, AxiosResponse } from 'axios';
import {
  CubicClientOptions,
  Message,
  CallRequest,
  CallResponse,
  AgentsResponse,
  HealthStatus,
} from '../utils/types.js';

/**
 * CubicClient - A TypeScript client SDK for the Cubicler ecosystem
 * 
 * Provides a simple bridge for frontend applications to interact with
 * Cubicler AI agents via the orchestrator REST API.
 */
export class CubicClient {
  private readonly httpClient: AxiosInstance;

  constructor(options: CubicClientOptions) {
    if (!options.baseUrl) {
      throw new Error('baseUrl is required');
    }

    this.httpClient = axios.create({
      baseURL: options.baseUrl,
      timeout: options.timeout || 90000, // 90 second default timeout
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Configure retry logic if specified
    if (options.retry && options.retry > 0) {
      const maxRetries = options.retry;
      this.httpClient.interceptors.response.use(
        (response) => response,
        async (error) => {
          const config = error.config;
          if (!config || config.__retryCount >= maxRetries) {
            return Promise.reject(error);
          }

          config.__retryCount = config.__retryCount || 0;
          config.__retryCount += 1;

          // Only retry on network errors or 5xx status codes
          if (
            error.code === 'ECONNABORTED' ||
            error.code === 'ENOTFOUND' ||
            error.code === 'ECONNREFUSED' ||
            (error.response && error.response.status >= 500)
          ) {
            await new Promise((resolve) => setTimeout(resolve, 1000 * config.__retryCount));
            return this.httpClient(config);
          }

          return Promise.reject(error);
        }
      );
    }
  }

  /**
   * Call the default AI agent
   * @param messages Array of messages or single message
   * @returns Promise that resolves to the agent's response content
   */
  async call(messages: Message[] | Message): Promise<string> {
    const requestPayload = this.prepareCallRequest(messages);
    const response: AxiosResponse<CallResponse> = await this.httpClient.post('/dispatch', requestPayload);
    return response.data.content;
  }

  /**
   * Call a specific AI agent
   * @param agentName Name of the agent to call
   * @param messages Array of messages or single message
   * @returns Promise that resolves to the agent's response content
   */
  async callAgent(agentName: string, messages: Message[] | Message): Promise<string> {
    if (!agentName) {
      throw new Error('agentName is required');
    }

    const requestPayload = this.prepareCallRequest(messages);
    const response: AxiosResponse<CallResponse> = await this.httpClient.post(
      `/dispatch/${encodeURIComponent(agentName)}`,
      requestPayload
    );
    return response.data.content;
  }

  /**
   * Get list of available agents
   * @returns Promise that resolves to an array of agent names
   */
  async getAgents(): Promise<string[]> {
    const response: AxiosResponse<AgentsResponse> = await this.httpClient.get('/agents');
    return response.data.availableAgents;
  }

  /**
   * Check system health status
   * @returns Promise that resolves to the health status object
   */
  async getHealth(): Promise<HealthStatus> {
    const response: AxiosResponse<HealthStatus> = await this.httpClient.get('/health');
    return response.data;
  }

  /**
   * Prepare the request payload for agent calls
   * @private
   */
  private prepareCallRequest(messages: Message[] | Message): CallRequest {
    if (!Array.isArray(messages)) {
      // Single message object
      if (!messages.sender || !messages.content) {
        throw new Error('Message must have both sender and content properties');
      }
      if (!messages.sender.id) {
        throw new Error('Message sender must have an id property');
      }
      if (!messages.type) {
        throw new Error('Message must have a type property');
      }
      return {
        messages: [messages],
      };
    }

    if (messages.length === 0) {
      throw new Error('messages array cannot be empty');
    }

    // Validate message structure
    for (const message of messages) {
      if (!message.sender || !message.content) {
        throw new Error('Each message must have both sender and content properties');
      }
      if (!message.sender.id) {
        throw new Error('Each message sender must have an id property');
      }
      if (!message.type) {
        throw new Error('Each message must have a type property');
      }
    }

    return { messages };
  }
}
