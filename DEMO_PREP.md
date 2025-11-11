# 🎬 Demo Preparation Checklist

## Pre-Demo Setup (30 minutes before)

### 1. Start Parallax Cluster ✅
```bash
cd ~/parallaxpay_x402
./scripts/start-parallax-cluster.sh
```
**Wait 30 seconds** for nodes to initialize and verify:
- ✅ Node 1 running on port 3001
- ✅ Node 2 running on port 3002
- ✅ Health checks passing

### 2. Configure Environment ✅
Create `.env.local`:
```bash
# Multi-node cluster
PARALLAX_CLUSTER_URLS=http://localhost:3001,http://localhost:3002
PARALLAX_LOAD_BALANCING=latency-based

# Supabase (optional - app works without it)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# x402
NEXT_PUBLIC_NETWORK=solana-devnet
```

### 3. Start Application ✅
```bash
npm run dev
# Open http://localhost:3000
```

### 4. Prepare Wallet ✅
- Phantom or Solflare installed
- Connected to Solana Devnet
- ~5 USDC on devnet (from https://faucet.circle.com)
- Have wallet address ready

---

## Demo Script (7 minutes)

### Minute 1: Introduction & Cluster Status 🌐
**URL:** http://localhost:3000/marketplace

**Say:** "ParallaxPay is the first trustless AI agent marketplace with multi-node Parallax cluster architecture."

**Show:**
1. Cluster Status Dashboard (top of page)
   - Point to **2 online nodes**
   - Show **average latency** (~500ms)
   - Highlight **load balancing strategy** (latency-based)
2. Scroll to individual node cards
   - Show per-node metrics (latency, uptime, requests)
   - **"This demonstrates distributed AI inference across multiple Parallax nodes"**

**Key Point:** Most hackathon projects use single node - we showcase TRUE cluster architecture.

---

### Minute 2: Deploy Agent 🤖
**URL:** http://localhost:3000/agents

**Steps:**
1. Click "Deploy Agent" button
2. Connect Phantom wallet
3. Select agent type: **"Custom"**
4. Name: "Crypto Analyzer"
5. Prompt: "Analyze the current crypto market trends for BTC"
6. Click "Deploy Agent"

**Show:**
- Agent appears in "My Agents" tab (top tab)
- Has wallet-based identity (shows your wallet address)
- Initial reputation score (0)
- Ready to execute

**Say:** "Every agent is linked to my Solana wallet, creating verifiable ownership and building reputation over time."

---

### Minute 3: Run Agent & Show Cluster Distribution 💸
**URL:** http://localhost:3000/agents (stay on page)

**Steps:**
1. Click "Run Agent" on the deployed agent
2. **Watch browser console** (F12) for cluster logs
3. Wait for response (~3-5 seconds)
4. Show transaction complete

**Point Out:**
- Console shows: `"⚡ Latency-based selected: Parallax-XXX (450ms, rep: 95)"`
- **"The cluster automatically selected the fastest node"**
- Transaction cost: $0.001
- Reputation increased

**Optional:** Run agent 2-3 more times to show:
- Different nodes being selected (round-robin)
- Reputation score increasing
- Total request count on nodes updating

---

### Minute 4: Market Oracle (⭐ STAR FEATURE) 🔮
**URL:** http://localhost:3000/oracle

**Say:** "This is our most innovative feature - autonomous crypto predictions with multi-provider consensus."

**Steps:**
1. Select asset: **BTC**
2. Select timeframe: **1 hour**
3. Enable **"Use Multi-Provider Consensus"** (should be on by default)
4. Click "Get Prediction"
5. Watch the multi-step process:
   - Querying provider 1/2
   - Querying provider 2/2
   - Calculating consensus...
   - Result appears

**Show:**
- Prediction direction (Bullish/Bearish)
- Confidence score (0-100%)
- Consensus strength (2/2 providers agree)
- Cost breakdown (e.g., $0.003 total)
- **Accuracy tracking** (will verify in X hours)

**Say:** "Unlike single-model predictions, we query MULTIPLE Parallax nodes and calculate consensus. This builds trust through diversification."

---

### Minute 5: Agent Marketplace 🏪
**URL:** http://localhost:3000/agents

**Steps:**
1. Show **tab navigation** at top
   - "My Agents (1)" tab
   - "Public Marketplace (X)" tab
2. Click "Public Marketplace" tab
3. Show other users' agents (if any)
4. Point out wallet addresses on each agent
5. **"Anyone can discover and use agents deployed by others"**

**Say:** "This creates a real agent economy where agents are discoverable, trustable through on-chain identity, and reusable across the network."

**If no public agents:**
- "In production, this would show all publicly deployed agents"
- "Each agent builds its own reputation over time"

---

### Minute 6: Public Transaction Feed 📊
**URL:** http://localhost:3000/transactions

**Show:**
1. Real-time feed of ALL transactions
2. Click on a transaction to see details
3. Show Solana Explorer link
4. Click Explorer link → opens solscan.io with real transaction

**Say:** "Complete transparency - every agent execution is publicly visible, like Etherscan for AI agents. This builds trust in the ecosystem."

**Point Out:**
- Transaction type (agent execution)
- Agent name
- Provider used
- Cost
- Wallet address
- Status (success/pending/failed)

---

### Minute 7: Technical Deep Dive 💻
**Back to:** http://localhost:3000/marketplace

**Show Cluster Dashboard Again:**
1. Point to **request counts** on nodes
   - "See how requests are distributed"
   - "Node 1: 5 requests, Node 2: 3 requests"
2. Show **real-time latency** updating
3. Show **uptime percentages**

**Say:**
- "Our load balancing intelligently routes to the fastest node"
- "Automatic failover if a node goes down"
- "Health monitoring every 30 seconds"
- "Production-ready architecture, not just a demo"

**Final Point:** Open `HACKATHON.md` file and show:
- Code quality metrics (7,500+ lines TypeScript)
- 14 documentation files
- Comprehensive error handling
- **"This is production-ready code, not hackathon spaghetti"**

---

## Backup Talking Points

### If Judges Ask: "Why multi-node?"
**Answer:**
- "Showcases true distributed computing capability of Parallax"
- "Most submissions use single node - we demonstrate scalability"
- "Load balancing, failover, health monitoring - production features"
- "M1 Air optimized with layer splitting for resource efficiency"

### If Judges Ask: "What's unique about Market Oracle?"
**Answer:**
- "Multi-provider consensus - not single model prediction"
- "Accuracy tracking - verifies predictions after time passes"
- "Reputation building - agents improve trust over time"
- "Real market data integration - not fake/static data"

### If Judges Ask: "How does x402 work here?"
**Answer:**
- "Every agent execution costs $0.001 via x402"
- "Real Solana transactions on devnet"
- "Agent-to-agent payments in composite workflows"
- "Public transaction feed for transparency"
- "Users pay with their own wallets - autonomous agent wallets coming"

### If Parallax Cluster Crashes:
**Fallback:**
1. Quickly restart: `./scripts/start-parallax-cluster.sh`
2. While waiting, show code:
   - `lib/parallax-cluster.ts` - smart routing
   - `lib/provider-discovery.ts` - auto-discovery
   - `components/ClusterStatusDashboard.tsx` - live monitoring
3. **"This actually demonstrates our error handling - let me show the retry logic"**

---

## Post-Demo Q&A Prep

### Expected Questions:

**Q: "How scalable is this?"**
A: "Currently 2 nodes for demo, but architecture supports unlimited nodes. Environment variable configuration, automatic discovery, no hard-coded limits."

**Q: "What if a node goes down?"**
A: "Automatic failover - cluster client tries up to 3 nodes before failing. Show code in `lib/parallax-cluster.ts:75` for retry logic."

**Q: "Is this production-ready?"**
A: "Yes - comprehensive error handling, database persistence, transaction history, wallet-based auth, and 7,500+ lines of production TypeScript."

**Q: "How does reputation work?"**
A: "Every execution updates reputation score (0-1000). Successful = +10 points, failed = -50 points. Badges unlock at milestones (100, 500, 1000 points). Can be attested on-chain."

**Q: "Can agents collaborate?"**
A: "Yes - composite agents! Multi-step workflows where agents call other agents. Each step has its own x402 payment. Creates true agent-to-agent economy."

---

## Critical Files to Have Open

### For Code Review:
1. `lib/parallax-cluster.ts` - Cluster client with load balancing
2. `lib/provider-discovery.ts` - Auto-discovery and health monitoring
3. `lib/market-oracle-agent.ts` - Multi-provider consensus
4. `app/api/inference/paid/route.ts` - Cluster-aware inference endpoint
5. `HACKATHON.md` - Complete submission details

### For Architecture Questions:
- `instrumentation.ts` - Server initialization
- `scripts/start-parallax-cluster.sh` - Cluster startup
- `.env.example` - Configuration options

---

## Troubleshooting

### Parallax Won't Start:
```bash
# Kill any zombie processes
pkill -9 parallax

# Check Python version
python --version  # Should be 3.11+

# Reinstall Parallax
pip install --upgrade parallax-inference

# Try manual start
parallax run -m Qwen/Qwen2.5-0.5B-Instruct -n 1 --host 0.0.0.0 --port 3001
```

### Next.js Errors:
```bash
# Clear cache
rm -rf .next
npm run dev
```

### Wallet Connection Issues:
1. Check network is "Devnet"
2. Check wallet has USDC
3. Refresh page and reconnect
4. Try different wallet (Phantom vs Solflare)

### No Providers Showing:
1. Verify Parallax is running: `curl http://localhost:3001`
2. Check instrumentation.ts loaded: see console for "🚀 Initializing ParallaxPay server"
3. Manual discovery: Click "Discover" button on marketplace

---

## Final Checklist

Before submitting:
- [ ] Parallax cluster running (2 nodes)
- [ ] Application running (npm run dev)
- [ ] Wallet connected with USDC
- [ ] At least 1 agent deployed
- [ ] At least 1 transaction in feed
- [ ] Cluster dashboard shows 2 online nodes
- [ ] Browser console clear of errors
- [ ] All demo URLs bookmarked
- [ ] HACKATHON.md file ready to show
- [ ] GitHub repo link ready
- [ ] Demo video recorded (backup)

---

## Time-Saving Tips

### Pre-Record Backup Video:
If live demo fails, have 5-minute video showing:
1. Cluster startup
2. Agent deployment
3. Market Oracle execution
4. Transaction feed
5. Code walkthrough

### Have Screenshots Ready:
1. Cluster dashboard (2 nodes online)
2. Market Oracle prediction result
3. Transaction feed with Solana Explorer
4. Code snippets (load balancing logic)

### Browser Tabs Pre-Loaded:
1. http://localhost:3000 (home)
2. http://localhost:3000/marketplace (cluster dashboard)
3. http://localhost:3000/agents (agent deployment)
4. http://localhost:3000/oracle (market oracle)
5. http://localhost:3000/transactions (public feed)
6. GitHub repo
7. HACKATHON.md (local file)

---

## Victory Speech 🏆

**If you win:**
"Thank you! We're excited to continue building on Parallax. Our roadmap includes mainnet deployment, swarm intelligence for multi-agent collaboration, and expanding the public marketplace. This hackathon validated that trustless AI agent economies are not just possible - they're inevitable. Parallax makes it possible."

**Key message:**
- Production-ready, not prototype
- Genuinely innovative (Market Oracle consensus)
- Deep Parallax integration (multi-node cluster)
- Solves real problem (trust in AI agents)

---

Good luck! 🚀 You've built something genuinely special. Now go show the world!
