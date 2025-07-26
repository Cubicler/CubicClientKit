# CubicClientKit

A TypeScript client SDK that provides a simple bridge for frontend applications to interact with the Cubicler ecosystem.

## Overview

CubicClientKit is a lightweight npm library that allows frontend apps to call AI agents via the Cubicler orchestrator. The SDK focuses on simplicity and type safety, letting users handle their own conversation management and business logic.

## Features

- 🚀 **Simple Bridge**: Direct mapping to Cubicler REST API endpoints
- 🔒 **Type Safety**: Full TypeScript coverage without complexity  
- 🎯 **No Opinions**: Let users handle conversation management, error handling, and business logic
- 🌐 **Browser Compatible**: Works in both Node.js and browser environments
- ⚡ **Lightweight**: Minimal dependencies with focus on core functionality

## Installation

```bash
npm install @cubicler/cubicclientkit
```

## Quick Start

```typescript
import { CubicClient } from '@cubicler/cubicclientkit';

// Create client instance
const client = new CubicClient({
  baseUrl: 'http://localhost:1503'
});

// Call the default agent
const response = await client.call({ sender: 'user', content: 'Hello, can you help me?' });
console.log(response); // Agent's response message

// Call a specific agent
const weatherResponse = await client.callAgent('weather-agent', { 
  sender: 'user', 
  content: 'What is the weather today?' 
});
console.log(weatherResponse);

// Get available agents
const agents = await client.getAgents();
console.log('Available agents:', agents);

// Check system health
const health = await client.getHealth();
console.log('System status:', health.status);
```

## API Reference

### Constructor

```typescript
new CubicClient(options: CubicClientOptions)
```

**Options:**

- `baseUrl` (string, required): Base URL of the Cubicler API (e.g., '<http://localhost:1503>')
- `timeout` (number, optional): Request timeout in milliseconds (default: 30000)
- `retry` (number, optional): Number of retries for failed requests

### Methods

#### `call(messages: Message[] | string): Promise<string>`

Call the default AI agent.

**Parameters:**

- `messages`: Array of message objects or a single message string

**Returns:** Promise that resolves to the agent's response message

#### `callAgent(agentName: string, messages: Message[] | string): Promise<string>`

Call a specific AI agent.

**Parameters:**

- `agentName`: Name of the agent to call
- `messages`: Array of message objects or a single message string

**Returns:** Promise that resolves to the agent's response message

#### `getAgents(): Promise<string[]>`

Get list of available agents.

**Returns:** Promise that resolves to an array of agent names

#### `getHealth(): Promise<HealthStatus>`

Check system health status.

**Returns:** Promise that resolves to the health status object

## Types

### Message

```typescript
interface Message {
  sender: string;    // free-form string (user, assistant, agent name, etc.)
  content: string;
}
```

### HealthStatus

```typescript
interface HealthStatus {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  services: {
    prompt?: ServiceStatus;
    agents?: ServiceStatus;
    providers?: ServiceStatus;
    spec?: ServiceStatus;
  };
}
```

## Examples

### Creating a Client

```typescript
import { CubicClient } from '@cubicler/cubicclientkit';

// Basic client setup
const client = new CubicClient({
  baseUrl: 'http://localhost:1503'
});

// Client with custom timeout and retry
const clientWithOptions = new CubicClient({
  baseUrl: 'http://localhost:1503',
  timeout: 10000,  // 10 seconds
  retry: 3         // Retry up to 3 times
});
```

### Calling the Default Agent

```typescript
// Single message (Message object)
const response = await client.call({ sender: 'user', content: 'Hello, can you help me?' });
console.log(response); // Agent's response message

// Multiple messages (conversation history)
const messages = [
  { sender: 'user', content: 'Hello' },
  { sender: 'assistant', content: 'Hi! How can I help?' },
  { sender: 'user', content: 'What is the weather like?' }
];

const response = await client.call(messages);
console.log(response); // Agent's response message
```

### Calling a Specific Agent

```typescript
// Single message to specific agent
const response = await client.callAgent('weather-agent', { 
  sender: 'user', 
  content: 'What is the weather in New York?' 
});
console.log(response);

// Multiple messages to specific agent
const messages = [
  { sender: 'user', content: 'I need help with coding' },
  { sender: 'coding-assistant', content: 'I can help! What language?' },
  { sender: 'user', content: 'TypeScript please' }
];

const response = await client.callAgent('coding-assistant', messages);
console.log(response);
```

### Getting Available Agents

```typescript
const agents = await client.getAgents();
console.log('Available agents:', agents);
// Output: ['default', 'weather-agent', 'coding-assistant', ...]
```

### Checking System Health

```typescript
const health = await client.getHealth();
console.log('System status:', health.status);
console.log('Timestamp:', health.timestamp);
console.log('Services:', health.services);

// Example health response:
// {
//   status: 'healthy',
//   timestamp: '2024-01-01T12:00:00Z',
//   services: {
//     prompt: { status: 'healthy' },
//     agents: { status: 'healthy', count: 5, agents: ['agent1', 'agent2'] },
//     providers: { status: 'healthy', count: 2 },
//     spec: { status: 'healthy' }
//   }
// }
```

### Complete Example

```typescript
import { CubicClient } from '@cubicler/cubicclientkit';

async function main() {
  const client = new CubicClient({
    baseUrl: 'http://localhost:1503',
    timeout: 15000,
    retry: 2
  });

  try {
    // Check system health
    const health = await client.getHealth();
    if (health.status !== 'healthy') {
      console.warn('System is not fully healthy:', health);
    }

    // Get available agents
    const agents = await client.getAgents();
    console.log('Available agents:', agents);

    // Call default agent
    const defaultResponse = await client.call({ 
      sender: 'user', 
      content: 'Hello! How are you?' 
    });
    console.log('Default agent response:', defaultResponse);

    // Call specific agent if available
    if (agents.includes('weather-agent')) {
      const weatherResponse = await client.callAgent(
        'weather-agent',
        { sender: 'user', content: 'What is the weather forecast for tomorrow?' }
      );
      console.log('Weather agent response:', weatherResponse);
    }

  } catch (error) {
    console.error('Error occurred:', error);
  }
}

main();
```

## Error Handling

The SDK lets errors bubble up to your application for maximum flexibility:

```typescript
try {
  const response = await client.call({ sender: 'user', content: 'Hello!' });
  console.log(response);
} catch (error) {
  if (error.response) {
    // HTTP error response
    console.error('API Error:', error.response.status, error.response.data);
  } else if (error.request) {
    // Network error
    console.error('Network Error:', error.message);
  } else {
    // Other error
    console.error('Error:', error.message);
  }
}
```

## Development

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Type check
npm run type-check

# Lint code
npm run lint
```

## Browser Compatibility

CubicClientKit works in modern browsers and Node.js environments. It uses ES2020 features and includes proper type definitions for TypeScript projects.

## License

MIT

## Contributing

Contributions are welcome! Please read our contributing guidelines and submit pull requests to our repository.

## Support

For questions and support, please open an issue in the GitHub repository.
