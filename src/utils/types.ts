/**
 * Message structure for agent calls
 */
export interface Message {
  sender: string;
  content: string;
}

/**
 * Configuration options for CubicClient
 */
export interface CubicClientOptions {
  baseUrl: string;
  timeout?: number;
  retry?: number;
}

/**
 * Response from call endpoints
 */
export interface CallResponse {
  message: string;
}

/**
 * Response from agents endpoint
 */
export interface AgentsResponse {
  availableAgents: string[];
}

/**
 * Service status for health check
 */
export interface ServiceStatus {
  status: 'healthy' | 'unhealthy';
  error?: string;
  count?: number;
  agents?: string[];
  providers?: string[];
}

/**
 * Response from health endpoint
 */
export interface HealthStatus {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  services: {
    prompt?: ServiceStatus;
    agents?: ServiceStatus;
    providers?: ServiceStatus;
    spec?: ServiceStatus;
  };
}

/**
 * Request payload for agent calls
 */
export interface CallRequest {
  messages: Message[];
}
