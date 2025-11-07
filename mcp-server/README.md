# ParallaxPay MCP Server

Model Context Protocol server for ParallaxPay. Enables AI agents to discover and pay for AI inference services using x402 micropayments.

## Features

- 🔍 **Service Discovery**: Agents can discover available AI services
- 💳 **Automatic Payments**: x402 payments handled automatically
- 📊 **Transaction Tracking**: Full history of all payments
- 🤖 **Agent-Friendly**: Designed for autonomous AI agents

## Setup

1. Install dependencies:
```bash
cd mcp-server
npm install
```

2. Configure environment (in parent directory's `.env.local`):
```env
SOLANA_PRIVATE_KEY=your-private-key
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

3. Build:
```bash
npm run build
```

4. Run:
```bash
npm start
```

## Usage with Claude Desktop

Add to your Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "parallaxpay": {
      "command": "node",
      "args": ["/path/to/parallaxpay_x402/mcp-server/dist/index.js"],
      "env": {
        "SOLANA_PRIVATE_KEY": "your-private-key",
        "NEXT_PUBLIC_BASE_URL": "http://localhost:3000"
      }
    }
  }
}
```

## Available Tools

### discover_services
Discover available AI inference services with pricing

### get_ai_inference
Make a paid AI inference request
- **prompt**: Your question/prompt
- **tier**: basic ($0.01), standard ($0.05), or premium ($0.25)
- **max_tokens**: Token limit (optional)

### get_transaction_history
View transaction history
- **limit**: Number of transactions (default: 10)

### get_market_status
Get current market status and metrics

## Example Usage in Claude

```
User: "Use the discover_services tool to see what AI services are available"

Claude: [Calls discover_services tool]
Found 4 AI services:
- Basic AI: $0.01 per request
- Standard AI: $0.05 per request
- Premium AI: $0.25 per request
- Agent API: $0.001 per 1K tokens

User: "Use the standard tier to answer: What is quantum computing?"

Claude: [Calls get_ai_inference with tier=standard]
Payment successful! TX Hash: ABC123...
Result: [AI generated response about quantum computing]
Cost: $0.05
```

## Hackathon Track

This MCP server qualifies for the **MCP Server track** in addition to the main tracks!
