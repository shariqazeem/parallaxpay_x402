# ParallaxPay - AI Micropayments on Solana with x402

A Next.js application that implements the **x402 payment protocol** for instant, automatic stablecoin payments on Solana. This app demonstrates how to monetize AI inference APIs using onchain micropayments without accounts, sessions, or complex authentication.

## 🚀 Features

- **x402 Payment Protocol**: HTTP 402-based automatic payments
- **Solana Integration**: Fast, low-cost transactions on Solana network
- **Three Payment Tiers**:
  - **Basic** ($0.01): 100 tokens with Qwen 0.6B
  - **Standard** ($0.05): 256 tokens with Qwen 1.7B
  - **Premium** ($0.25): 512 tokens with Advanced models
- **Next.js 15**: Modern React framework with App Router
- **TypeScript**: Full type safety
- **Custom Express Server**: x402 middleware for API routes
- **Wallet Integration**: Full Solana wallet support (Phantom, Solflare, etc.)
- **Client-Side Payments**: Automatic x402 payment handling with wallet signing

## 🎮 Quick Start for Users

Want to test x402 payments? Here's the fastest way:

1. **Install Phantom Wallet**: [phantom.app](https://phantom.app)
2. **Switch to Devnet**: Settings → Change Network → Devnet
3. **Get Devnet USDC**: Use [Circle's faucet](https://faucet.circle.com)
4. **Visit the app**: [http://localhost:3000](http://localhost:3000) (after running `npm run dev`)
5. **Connect Wallet**: Click "Select Wallet" → Choose Phantom
6. **Test Payment**: Go to `/test-payment` and try the Basic tier ($0.01)

For detailed wallet setup instructions, see [WALLET_SETUP.md](./WALLET_SETUP.md).

## 📋 Prerequisites

**For Developers (Running the Server):**
- Node.js 18+ and npm
- A Solana wallet address (for receiving payments)
- For mainnet: [Coinbase Developer Platform](https://cdp.coinbase.com) account and API keys

**For Users (Making Payments):**
- Solana wallet (Phantom or Solflare recommended)
- Devnet SOL (for transaction fees - get from [faucet.solana.com](https://faucet.solana.com))
- Devnet USDC (for payments - get from [faucet.circle.com](https://faucet.circle.com))

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd parallaxpay_x402
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure your wallet**

   Update your Solana wallet address in two files:
   - `middleware.ts` (line 5)
   - `server.js` (line 12)

   Replace `9qzmG8vPymc2CAMchZgq26qiUFq4pEfTx6HZfpMhh51y` with your address.

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open the app**

   Navigate to [http://localhost:3000](http://localhost:3000)

## 🌐 Network Configuration

### Testnet (Development) - Default Setup ✅

The app is currently configured for **Solana Devnet** (testnet):

- **No API keys required**
- **No real money involved**
- **Facilitator**: `https://x402.org/facilitator`
- **Network**: `solana-devnet`

This is perfect for testing and development!

### Mainnet (Production) - Real Payments 💰

To accept real USDC payments on Solana mainnet:

#### 1. Get CDP API Keys

1. Sign up at [cdp.coinbase.com](https://cdp.coinbase.com)
2. Create a new project
3. Generate API credentials
4. Copy your API Key ID and Secret

#### 2. Create Environment File

```bash
cp .env.example .env
```

Edit `.env` and add your credentials:

```env
CDP_API_KEY_ID=your-api-key-id-here
CDP_API_KEY_SECRET=your-api-key-secret-here
NETWORK=solana
```

#### 3. Update Middleware Configuration

Edit `middleware.ts`:

```typescript
import { facilitator } from '@coinbase/x402'

// Change network from 'solana-devnet' to 'solana'
const network = 'solana' as Network

// Replace facilitatorUrl object with facilitator
const x402PaymentMiddleware = paymentMiddleware(
  address,
  {
    '/content/basic': {
      price: '$0.01',
      network, // Now using 'solana' mainnet
      config: { /* ... */ }
    },
    // ... other routes
  },
  facilitator // Use CDP facilitator instead of URL
)
```

#### 4. Update Server Configuration

Edit `server.js`:

```javascript
const { facilitator } = require('@coinbase/x402');

// Change network to 'solana' for all routes
server.use(paymentMiddleware(
  SOLANA_WALLET,
  {
    'GET /api/content/basic': {
      price: '$0.01',
      network: 'solana', // Changed from 'solana-devnet'
      // ...
    },
  },
  facilitator // Use CDP facilitator
));
```

#### 5. Deploy to Production

```bash
npm run build
npm run start
```

## 📁 Project Structure

```
parallaxpay_x402/
├── app/
│   ├── content/
│   │   ├── basic/page.tsx      # Basic tier ($0.01)
│   │   ├── standard/page.tsx   # Standard tier ($0.05)
│   │   └── premium/page.tsx    # Premium tier ($0.25)
│   ├── test/page.tsx           # Test page
│   ├── test-payment/page.tsx   # Payment testing
│   ├── layout.tsx
│   └── page.tsx                # Landing page
├── middleware.ts               # x402 Next.js middleware
├── server.js                   # Express server with x402
├── package.json
└── .env.example                # Environment template
```

## 🔧 How It Works

### Payment Flow

1. **User visits a protected route** (e.g., `/content/basic`)
2. **Server responds with 402 Payment Required**
3. **x402 middleware provides payment instructions**
4. **Client (wallet) signs and submits payment**
5. **Facilitator verifies payment on Solana blockchain**
6. **Server grants access to protected content**

### Middleware Configuration

The app uses two layers of x402 protection:

1. **Next.js Middleware** (`middleware.ts`): Protects page routes
2. **Express Middleware** (`server.js`): Protects API endpoints

Both use the same payment configuration and wallet address.

## 💡 Payment Tiers

| Tier | Price | Tokens | Model | Use Case |
|------|-------|--------|-------|----------|
| **Basic** | $0.01 | 100 | Qwen 0.6B | Quick queries, testing |
| **Standard** | $0.05 | 256 | Qwen 1.7B | Creative writing, enhanced reasoning |
| **Premium** | $0.25 | 512 | Advanced | Complex reasoning, professional outputs |

## 🧪 Testing

### Test the Payment Flow

1. Start the development server
2. Visit [http://localhost:3000/test-payment](http://localhost:3000/test-payment)
3. Use a Solana wallet with devnet USDC
4. Complete a test payment

### Get Devnet USDC

1. Use Solana faucet for SOL: [https://faucet.solana.com](https://faucet.solana.com)
2. Use CDP or x402 tools to get devnet USDC

## 📚 x402 Resources

- [x402 Documentation](https://docs.cdp.coinbase.com/x402)
- [Quickstart for Sellers](https://docs.cdp.coinbase.com/x402/quickstart-for-sellers)
- [Quickstart for Buyers](https://docs.cdp.coinbase.com/x402/quickstart-for-buyers)
- [x402 GitHub](https://github.com/coinbase/x402)
- [x402 Discord](https://discord.gg/cdp)

## 🔐 Security Notes

- Never commit your `.env` file
- Keep your CDP API keys secure
- Use testnet for development
- Test thoroughly before mainnet deployment
- Start with small amounts on mainnet

## 🐛 Troubleshooting

### Payment Not Processing

- Check your wallet has sufficient USDC balance
- Verify network configuration (devnet vs mainnet)
- Check facilitator URL is correct
- Ensure wallet address matches in both files

### Build Errors

```bash
# Clean install
rm -rf node_modules package-lock.json .next
npm install
npm run dev
```

### Middleware Not Working

- Verify `matcher` config in `middleware.ts` includes your route
- Check that wallet address is valid Solana address
- Ensure x402 packages are up to date

## 📦 Dependencies

- **next**: ^15.0.0 - React framework
- **react**: ^19.0.0 - UI library
- **x402-next**: ^0.7.0 - x402 Next.js middleware
- **x402-express**: ^0.7.0 - x402 Express middleware
- **@coinbase/x402**: ^0.7.0 - CDP facilitator (mainnet)
- **@solana/web3.js**: ^1.95.0 - Solana blockchain interaction
- **express**: ^4.18.2 - Custom server
- **viem**: ^2.21.45 - EVM utilities

## 🚀 Deployment

### Vercel

1. Push to GitHub
2. Import to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Custom Server

```bash
# Build
npm run build

# Start production server
npm run start
```

## 📄 License

MIT

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a PR.

## 💬 Support

- [x402 Discord](https://discord.gg/cdp)
- [CDP Documentation](https://docs.cdp.coinbase.com)
- [GitHub Issues](https://github.com/coinbase/x402/issues)

---

Built with ❤️ using x402, Next.js, and Solana
