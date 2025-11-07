# 🚀 Quick Start - 3 Steps to Real x402 Payments

## ✅ What Just Got Fixed

I fixed the wallet initialization bug that was causing "Payment client not initialized" errors. The payment client now:
- ✅ Waits for wallet initialization before making requests
- ✅ Works in the browser (client-side)
- ✅ Shows clear error messages with troubleshooting steps
- ✅ Logs wallet address for debugging

---

## 🔥 What You Need to Do Right Now

### Step 1: Update `.env.local`

Add this line to your `.env.local`:

```env
NEXT_PUBLIC_SOLANA_PRIVATE_KEY=your-base58-private-key-here
```

**⚠️ CRITICAL:** Must use `NEXT_PUBLIC_` prefix (Next.js requirement for browser access)!

---

### Step 2: Generate a Testnet Wallet

Run this script:

```bash
# Create wallet generator
cat > generate-wallet.js << 'INNER_EOF'
const { Keypair } = require('@solana/web3.js');
const bs58 = require('bs58');

console.log('🔐 Generating new Solana wallet for ParallaxPay...\n');

const keypair = Keypair.generate();
const publicKey = keypair.publicKey.toBase58();
const privateKey = bs58.encode(keypair.secretKey);

console.log('✅ New Wallet Generated!\n');
console.log('📍 Public Address:');
console.log(publicKey);
console.log('\n🔑 Private Key (base58):');
console.log(privateKey);
console.log('\n📝 Add to .env.local:\n');
console.log(\`NEXT_PUBLIC_WALLET_ADDRESS=\${publicKey}\`);
console.log(\`NEXT_PUBLIC_SOLANA_PRIVATE_KEY=\${privateKey}\`);
console.log('\n⚠️  TESTNET ONLY! Never use with real money!\n');
INNER_EOF

# Install dependencies
npm install bs58

# Generate wallet
node generate-wallet.js
```

**Copy the output to your `.env.local`!**

---

### Step 3: Get Testnet USDC

1. Visit: https://faucet.solana.com
2. Paste your \`NEXT_PUBLIC_WALLET_ADDRESS\`
3. Request SOL + USDC

---

### Step 4: Restart Dev Server

```bash
npm run dev
```

---

## 🧪 Test It Works!

1. Open: http://localhost:3000/agents
2. Click "Deploy Agent"
3. Click "▶ Run Agent"
4. **Watch console for:**

```
🔑 Wallet initialized: 9qzmG8vP...
🤖 Making REAL x402 payment...
✅ Payment successful!
   TX Hash: 4k9F2mN8pQ...
```

5. Go to: http://localhost:3000/transactions
6. Click "View on Explorer"
7. ✅ See your transaction on Solana blockchain!

---

## 📝 Your `.env.local` Should Have:

```env
NEXT_PUBLIC_WALLET_ADDRESS=9qzmG8vPymc2CAMchZgq26qiUFq4pEfTx6HZfpMhh51y
NEXT_PUBLIC_SOLANA_PRIVATE_KEY=your-base58-key-here
NEXT_PUBLIC_DEV_MODE=false
NEXT_PUBLIC_NETWORK=solana-devnet
```

---

**Ready to see real blockchain transactions! 🔥**
