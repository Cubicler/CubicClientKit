/**
 * Message structure for agent calls
 */
export interface Message {
  sender: {
    id: string;      // Unique identifier (e.g., "user_123", "telegram_456")
    name?: string;   // Optional display name
  };
  type: "text";      // Message type (currently only "text" supported)
  content: string;   // The actual message content
  timestamp?: string; // Optional ISO 8601 timestamp
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
  sender: {
    id: string;        // Agent identifier (e.g., "gpt_4o")
    name: string;      // Agent display name
  };
  timestamp: string;   // ISO 8601 timestamp
  type: "text";
  content: string;     // The agent's response content
  metadata: {
    usedToken: number;
    usedTools: number;
  };
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
