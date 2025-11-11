# ParallaxPay - AI Agents with Identity & Reputation

**Built for x402 Solana Hackathon - Parallax Eco Track**

> The first trustless AI agent marketplace with wallet-based identity, on-chain reputation, and autonomous micropayments.

---

## What Makes ParallaxPay Different?

While most AI agent platforms are just glorified ChatGPT wrappers, **ParallaxPay solves the fundamental trust problem in AI agent economies**:

### The Problem
- **No Identity** - Who owns/controls this agent?
- **No Reputation** - Can I trust this agent's results?
- **No Transparency** - How does it actually perform?
- **No Interoperability** - Can agents work together?

### Our Solution
1. **Wallet-Based Identity** - Every agent is linked to a Solana wallet, creating verifiable ownership
2. **On-Chain Reputation** - Performance tracked, badges attested on Solana blockchain
3. **Public Transparency** - All transactions visible in public feed (like Etherscan for AI agents)
4. **Agent-to-Agent Economy** - Composite agents orchestrate other agents with x402 micropayments

---

## Unique Features (Why We'll Win)

### 🔮 **Market Oracle Agent** (⭐ STAR FEATURE!)
Autonomous crypto predictions with multi-provider consensus:
- **Real-time price analysis** for BTC, ETH, SOL
- **Multi-provider consensus** - queries ALL available Parallax nodes
- **x402 micropayments** - pays $0.001-$0.005 per prediction
- **Accuracy tracking** - verifies predictions and builds reputation
- **Trust levels** - Novice → Master based on prediction accuracy
- **Autonomous mode** - runs predictions every 5 minutes
- **Visual metrics** - accuracy %, total cost, consensus strength
- **Live at `/oracle`** - check it out!

### 🚀 **Composite Agents** (NOBODY ELSE HAS THIS!)
Multi-step AI workflows where agents orchestrate other agents:
- Research Agent → Analysis Agent → Summary Agent
- Each step has its own x402 payment
- Agents can pass outputs to next steps
- Creates a true agent-to-agent economy

### 🏆 **On-Chain Reputation System**
- **Reputation Score**: 0-1000 (Novice → Legendary)
- **Badge System**: Pioneer, Active User, Top Performer, Cost Saver, Speed Demon, etc.
- **Solana Attestation**: Badges verified on-chain with transaction signatures
- **Leaderboard**: Public ranking of top-performing agents

### 📊 **Public Trade Feed**
- Every agent execution visible to all users
- Real-time transparency (like block explorers)
- Build trust through public performance history
- Filter by agent, provider, wallet address

### 🔌 **MCP Server** (BONUS TRACK!)
Claude Desktop integration via Model Context Protocol:
- `discover_services` - List all AI agents
- `get_ai_inference` - Execute agent with x402 payment
- `get_transaction_history` - View payment history
- Claude can interact with your agents!

### 💳 **Real x402 Integration**
- $0.001 per agent execution
- Autonomous agent wallets (agents pay for themselves)
- Solana devnet with USDC payments
- Transaction history with Solana Explorer links

### 🖥️ **Multi-Node Parallax Cluster** (⭐ CLUSTER ARCHITECTURE!)
- **Distributed AI inference** across multiple Parallax nodes
- **Automatic load balancing** (latency-based, round-robin, random)
- **Provider discovery** - automatically finds and monitors all nodes
- **Health monitoring** - real-time latency, uptime, reputation tracking
- **Fault tolerance** - automatic failover if a node goes down
- **Smart routing** - selects fastest node for each request
- **Easy setup** - one script launches 2-node cluster optimized for M1 Mac
- **Live dashboard** - real-time cluster status visualization
- Qwen/Qwen2.5-0.5B-Instruct model (optimized for M1 Air)

---

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS, Framer Motion
- **Payments**: x402 Protocol (@coinbase/x402, x402-next, x402-fetch)
- **Blockchain**: Solana (@solana/web3.js, @solana/wallet-adapter)
- **AI Inference**: Gradient Parallax (local LLM cluster)
- **Database**: Supabase (PostgreSQL with RLS)
- **State Management**: Zustand, React Query
- **Integration**: MCP Server for Claude Desktop

---

## 🚀 Quick Start for Judges

### Prerequisites
- Node.js 18+
- Python 3.11+ (for Parallax)
- Solana wallet (Phantom/Solflare)
- Devnet USDC (from https://faucet.circle.com/)

### 1️⃣ Install Parallax
```bash
pip install parallax-inference
# OR clone from source:
# git clone https://github.com/GradientHQ/parallax.git
# cd parallax && pip install -e .
```

### 2️⃣ Start Parallax Cluster (2 Nodes)
```bash
./scripts/start-parallax-cluster.sh
```
This launches 2 Parallax nodes optimized for M1 Mac:
- Node 1: `http://localhost:3001`
- Node 2: `http://localhost:3002`
- Auto-discovery and load balancing enabled

### 3️⃣ Setup Environment

1. **Clone and Install**
```bash
git clone <your-repo>
cd parallaxpay_x402
npm install
```

2. **Configure Environment**
Create `.env.local` (or copy from `.env.example`):
```bash
# Parallax Cluster (MULTI-NODE!)
PARALLAX_CLUSTER_URLS=http://localhost:3001,http://localhost:3002
PARALLAX_LOAD_BALANCING=latency-based

# Supabase (Optional - falls back to localStorage)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-key

# x402 Payment Protocol
NEXT_PUBLIC_NETWORK=solana-devnet
DEV_MODE=false
```

3. **Start Application**
```bash
npm run dev
```

4. **Open Browser**
```
http://localhost:3000
```

**That's it!** The cluster script already started Parallax nodes for you.

---

## Features Walkthrough

### 1. Deploy an Agent
- Connect Solana wallet (Phantom/Solflare)
- Click "Deploy Agent"
- Choose type: **Custom** (single prompt) or **Composite** (multi-step workflow)
- Agent gets wallet-based identity with reputation score

### 2. Select Provider (Optional)
- Go to "Providers" page
- Browse available Parallax providers
- Compare latency, uptime, models
- Select provider for your agents

### 3. Run Agent
- Click "Run" on any deployed agent
- x402 payment ($0.001) processed automatically
- Agent executes on Parallax with selected provider
- Results appear instantly with transaction hash

### 4. Build Reputation
- Each successful run increases reputation
- Earn badges (Active User, Top Performer, Cost Saver, etc.)
- Attest badges on-chain for verification
- Climb the leaderboard

### 5. View Public Feed
- Go to "Transactions" page
- See all agent executions across the platform
- Real-time transparency of agent economy
- Filter by agent, provider, wallet

---

## Composite Agents Example

Create a multi-step research workflow:

```javascript
Step 1: Research Agent
Prompt: "Research the latest trends in AI agents"

Step 2: Analysis Agent (uses Step 1 output)
Prompt: "Analyze the trends and identify opportunities"

Step 3: Summary Agent (uses Step 2 output)
Prompt: "Create a concise summary for investors"
```

Each step:
- Calls a different AI model/prompt
- Has its own x402 payment ($0.001)
- Can use output from previous steps
- Executed automatically in sequence

**Total cost: $0.003** (vs $0.10+ on ChatGPT API)

---

## MCP Server Setup

Integrate with Claude Desktop:

1. **Build MCP Server**
```bash
cd mcp-server
npm install
npm run build
```

2. **Configure Claude Desktop**
Add to `~/Library/Application Support/Claude/claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "parallaxpay": {
      "command": "node",
      "args": ["/path/to/mcp-server/dist/index.js"],
      "env": {
        "SOLANA_PRIVATE_KEY": "your-key",
        "NEXT_PUBLIC_BASE_URL": "http://localhost:3000"
      }
    }
  }
}
```

3. **Use in Claude**
```
Claude, discover available AI agents
Claude, run the Research Agent with prompt "analyze crypto trends"
Claude, show my transaction history
```

---

## Database Schema

### `agents` table
Stores deployed agents:
- `id`, `name`, `type`, `prompt`
- `deployed`, `total_runs`, `status`
- `identity_id` (links to agent identity)
- `provider` (Parallax provider)
- `wallet_address` (owner)
- `workflow` (JSONB for composite agents)

### `transactions` table (PUBLIC)
Public feed of all agent executions:
- `id`, `timestamp`, `type`
- `agent_name`, `provider`
- `tokens`, `cost`, `tx_hash`
- `status`, `network`
- `wallet_address`

**Row Level Security**: All users can READ, authenticated users can INSERT

---

## How It Fits Parallax Eco Track

### Required Criteria ✅
- ✅ **Built on Gradient Parallax**: Uses real Parallax scheduler (localhost:3001)
- ✅ **AI Agent Use Case**: Deploy, run, and orchestrate AI agents
- ✅ **x402 Integration**: Micropayments on every request ($0.001)
- ✅ **Decentralized Compute**: Provider marketplace with benchmarking
- ✅ **Solana Blockchain**: Wallet identity, payments, reputation attestation

### What Makes It Special 🏆
1. **Agent Identity & Reputation** - First trustless agent marketplace
2. **Composite Agents** - Multi-step workflows (agent-to-agent economy)
3. **Public Transparency** - Open transaction feed builds trust
4. **MCP Server** - Claude Desktop integration (bonus track)
5. **Production-Ready** - Supabase persistence, proper error handling, real payments

### Innovation 💡
ParallaxPay doesn't just wrap Parallax in a UI - it creates a **trustless reputation layer** that enables:
- Agent marketplace with verifiable performance
- Agent-to-agent payments (composite workflows)
- Public accountability (transaction feed)
- On-chain attestation (badges on Solana)

This is the infrastructure for a **self-governing AI agent economy**.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     ParallaxPay Frontend                     │
│                  (Next.js 15 + React 19)                     │
└─────────────────────────────────────────────────────────────┘
                            ↓
    ┌───────────────────────┼───────────────────────┐
    ↓                       ↓                       ↓
┌─────────┐         ┌──────────────┐        ┌──────────────┐
│ x402    │         │  Gradient    │        │  Supabase    │
│ Protocol│         │  Parallax    │        │  Database    │
│(Solana) │         │ (Local AI)   │        │ (PostgreSQL) │
└─────────┘         └──────────────┘        └──────────────┘
    ↓                       ↓                       ↓
┌─────────┐         ┌──────────────┐        ┌──────────────┐
│ Solana  │         │Qwen3-0.6B    │        │ agents       │
│ Devnet  │         │ Model        │        │ transactions │
└─────────┘         └──────────────┘        └──────────────┘
```

---

## Demo Video

[Link to 2-minute demo video showing all features]

---

## What's Next?

### Immediate Improvements (Post-Hackathon)
- [ ] Mainnet deployment (real USDC payments)
- [ ] More AI models (larger Qwen models, Llama, etc.)
- [ ] Agent marketplace (discover and use other users' agents)
- [ ] Autonomous scheduling UI (agents run on cron)
- [ ] Swarm intelligence (multi-agent collaboration)

### Future Vision
- [ ] Agent staking (stake SOL to boost reputation)
- [ ] Agent NFTs (trade agent ownership as NFTs)
- [ ] Cross-chain support (Ethereum, Base, etc.)
- [ ] Agent DAO (governance for platform rules)
- [ ] Revenue sharing (agents earn from public usage)

---

## Why ParallaxPay Will Win

### Technical Excellence ✅
- **Real Integration**: Actually uses Parallax (not simulated)
- **Production-Ready**: Supabase persistence, error handling, logging
- **Type Safety**: Full TypeScript with proper interfaces
- **Clean Architecture**: Well-organized, maintainable code

### Unique Innovation 🚀
- **Composite Agents**: No other project has agent-to-agent orchestration
- **On-Chain Reputation**: First to attest agent performance on Solana
- **Public Marketplace**: Transparency builds trust (like Etherscan)
- **MCP Server**: Claude Desktop integration (bonus track)

### Practical Usefulness 💼
- **Real Problem**: Solves trust in AI agent economies
- **Clear Value**: 100x cheaper than ChatGPT API ($0.001 vs $0.10)
- **Easy to Use**: 3 clicks to deploy and run an agent
- **Scalable**: Agent-to-agent economy enables complex workflows

### Demo Impact 🎯
- **Instant WOW**: Deploy agent → Run → See result in <10 seconds
- **Visual Appeal**: Beautiful UI with real-time updates
- **Multiple Use Cases**: Custom agents, composite workflows, public feed
- **Production-Ready**: Not a prototype - actually works!

---

## Team

Built by a solo developer in 48 hours for the x402 Solana Hackathon.

Special thanks to:
- Solana Foundation
- Coinbase Developer Platform
- Gradient Network
- x402 Protocol Team

---

## License

MIT License - See LICENSE file for details

---

## Links

- **GitHub**: [Your GitHub Repo]
- **Demo**: [Live Demo URL]
- **Video**: [Demo Video]
- **x402 Protocol**: https://x402.org
- **Gradient Parallax**: https://github.com/GradientHQ/parallax
- **Solana**: https://solana.com

---

**Built with ❤️ for the x402 Solana Hackathon 🚀**

*Winning isn't everything, but building the future of trustless AI agent economies is.*
