# CubicClientKit - Copilot Instructions

You are working on **CubicClientKit**, a TypeScript client SDK that provides a simple bridge for frontend applications to interact with the Cubicler ecosystem.

## Project Overview

CubicClientKit is a lightweight npm library that allows frontend apps to call AI agents via the Cubicler orchestrator. The SDK focuses on simplicity and type safety, letting users handle their own conversation management and business logic.

## Architecture & Purpose

- **Simple Bridge**: Direct mapping to Cubicler REST API endpoints
- **Type Safety**: Full TypeScript coverage without complexity
- **No Opinions**: Let users handle conversation management, error handling, and business logic
- **Browser Compatible**: Works in both Node.js and browser environments

## Tech Stack

- **Language**: TypeScript with ECMAScript
- **Target**: Node.js and browser compatible
- **Build**: `tsup` or `esbuild`
- **Testing**: `vitest` or `jest`
- **HTTP Client**: `axios` for reliable HTTP requests with timeout and retry support

## Project Structure

```
root/
├── src/
│   ├── core/
│   │   └── cubicclient.ts       # Main CubicClient class
│   ├── utils/
│   │   ├── types.ts             # All types used
│   │   └── ...                  # Other helpers
│   └── index.ts                 # Main export file
├── tests/
│   ├── client/
│   │   └── cubicclient.test.ts
│   └── utils/
├── package.json
├── tsconfig.json
└── README.md
```

## Core API Integration

### Cubicler Endpoints to Implement

- `POST /dispatch` - Call the default AI agent
- `POST /dispatch/:agentId` - Call a specific AI agent  
- `GET /agents` - List available agents
- `GET /health` - Check system health

### Request Format

Agent calls use this message structure:
```typescript
{
  messages: [
    {
      sender: {
        id: string,      // Unique identifier (e.g., "user_123", "telegram_456")
        name?: string    // Optional display name
      },
      type: "text",      // Message type (currently only "text" supported)
      content: string,   // The actual message content
      timestamp?: string // Optional ISO 8601 timestamp
    }
  ]
}
```

### Response Formats

**Call endpoints** (`/dispatch`, `/dispatch/:agentId`):
```typescript
{
  sender: {
    id: string,        // Agent identifier (e.g., "gpt_4o")
    name: string       // Agent display name
  },
  timestamp: string,   // ISO 8601 timestamp
  type: "text",
  content: string,     // The agent's response content
  metadata: {
    usedToken: number,
    usedTools: number
  }
}
```

**Agents endpoint** (`/agents`):
```typescript
{ availableAgents: string[] }
```

**Health endpoint** (`/health`):
```typescript
{
  status: 'healthy' | 'unhealthy',
  timestamp: string,
  services: {
    prompt?: { status: 'healthy' | 'unhealthy'; error?: string; };
    agents?: { status: 'healthy' | 'unhealthy'; error?: string; count?: number; agents?: string[]; };
    providers?: { status: 'healthy' | 'unhealthy'; error?: string; count?: number; providers?: string[]; };
    spec?: { status: 'healthy' | 'unhealthy'; error?: string; };
  }
}
```

## CubicClient Class Requirements

### Constructor
```typescript
constructor(options: {
  baseUrl: string;           // e.g., 'http://localhost:1503'
  timeout?: number;          // Request timeout in ms (optional)
  retry?: number;            // Number of retries (optional)
})
```

### Methods (return data only, not wrapper objects)
- `call(messages)` → returns `string` (from response.content)
- `callAgent(agentName, messages)` → returns `string` (from response.content)  
- `getAgents()` → returns `string[]` (from response.availableAgents)
- `getHealth()` → returns `HealthStatus` (full response object)

### Convenience Overloads
- `call(message: Message)` - Single message shorthand
- `callAgent(agentName, message: Message)` - Single message shorthand

## Development Guidelines

### ✅ DO
- Build a simple, lightweight bridge to Cubicler API
- Use clean, modular TypeScript following current patterns
- Keep APIs minimal and focused on core functionality
- Maintain type safety throughout
- Let errors bubble up to the user (don't handle them in the SDK)
- Provide simple examples showing basic usage
- Focus on the 4 core endpoints only
- Use `axios` for HTTP requests with proper timeout and retry configuration
- Provide both full message array and single message convenience methods

### ❌ DON'T
- Don't add conversation management (user's responsibility)
- Don't add error handling beyond basic validation (let errors throw)
- Don't add business logic or opinionated patterns
- Don't overcomplicate APIs
- Don't sacrifice type safety
- Don't add unnecessary dependencies
- Don't implement authentication (Cubicler API doesn't require it yet)
- Don't assume streaming support (not implemented yet)

## Implementation Patterns

- **Axios-based HTTP calls**: Use axios for reliable HTTP requests with built-in timeout and retry
- **Direct API mapping**: No abstraction layers, just typed wrappers
- **Basic input validation**: Validate required parameters only
- **Error propagation**: Let HTTP errors bubble up to the user

## Examples Scope

Provide basic usage examples for:
- Creating a client instance
- Making agent calls (both single message and message array)
- Getting available agents
- Checking health status

Keep examples simple and focused on the core SDK functionality.
