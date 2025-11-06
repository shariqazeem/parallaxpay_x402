# Deployment Guide - ParallaxPay x402

This guide provides step-by-step instructions for deploying your x402-enabled Next.js app on Solana.

## Current Status

✅ **Your app is fully configured for Solana Devnet (Testnet)**

- x402 protocol integrated
- Three payment tiers configured
- Middleware properly set up
- Build successful

## Quick Start (Devnet)

```bash
# Install dependencies (already done)
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start
```

Open [http://localhost:3000](http://localhost:3000)

## Architecture Overview

Your app has two layers of x402 payment protection:

### 1. Next.js Middleware (`middleware.ts`)
Protects frontend page routes:
- `/content/basic` - $0.01
- `/content/standard` - $0.05
- `/content/premium` - $0.25
- `/test` - $0.01
- `/test-payment` - $0.01

### 2. Express Server (`server.js`)
Protects backend API endpoints:
- `/api/content/basic` - $0.01
- `/api/content/standard` - $0.05
- `/api/content/premium` - $0.25

Both use the same Solana wallet and facilitator configuration.

## Switching to Mainnet (Production)

### Step 1: Get CDP API Keys

1. Go to [cdp.coinbase.com](https://cdp.coinbase.com)
2. Create account and new project
3. Generate API credentials
4. Save your keys securely

### Step 2: Configure Environment

```bash
cp .env.example .env
```

Edit `.env`:
```env
CDP_API_KEY_ID=your-api-key-id
CDP_API_KEY_SECRET=your-api-key-secret
NETWORK=solana
```

### Step 3: Update Middleware

Edit `middleware.ts`:

```typescript
import { facilitator } from '@coinbase/x402'

// Change network
const network = 'solana' as Network // was: 'solana-devnet'

// Change facilitator
const x402PaymentMiddleware = paymentMiddleware(
  address,
  {
    // ... your routes
  },
  facilitator // was: { url: 'https://x402.org/facilitator' }
)
```

### Step 4: Update Server

Edit `server.js`:

```javascript
const { facilitator } = require('@coinbase/x402');

// Update all routes to use 'solana' instead of 'solana-devnet'
server.use(paymentMiddleware(
  SOLANA_WALLET,
  {
    'GET /api/content/basic': {
      price: '$0.01',
      network: 'solana', // changed from 'solana-devnet'
      // ...
    },
  },
  facilitator // changed from { url: 'https://x402.org/facilitator' }
));
```

### Step 5: Test and Deploy

```bash
# Test build
npm run build

# Run locally
npm run start

# Test with small amounts first!
```

## Deployment Platforms

### Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Configure x402 for production"
   git push
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your repository
   - Configure build settings:
     - Build Command: `npm run build`
     - Start Command: `npm run start`

3. **Add Environment Variables**
   In Vercel dashboard, add:
   - `CDP_API_KEY_ID`
   - `CDP_API_KEY_SECRET`
   - `NETWORK=solana`

4. **Deploy**

### Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize
railway init

# Add environment variables
railway variables set CDP_API_KEY_ID=your-key
railway variables set CDP_API_KEY_SECRET=your-secret
railway variables set NETWORK=solana

# Deploy
railway up
```

### Fly.io

```bash
# Install Fly CLI
curl -L https://fly.io/install.sh | sh

# Login
fly auth login

# Launch app
fly launch

# Set secrets
fly secrets set CDP_API_KEY_ID=your-key
fly secrets set CDP_API_KEY_SECRET=your-secret
fly secrets set NETWORK=solana

# Deploy
fly deploy
```

### Docker

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start"]
```

Build and run:
```bash
docker build -t parallaxpay .
docker run -p 3000:3000 \
  -e CDP_API_KEY_ID=your-key \
  -e CDP_API_KEY_SECRET=your-secret \
  -e NETWORK=solana \
  parallaxpay
```

## Monitoring and Debugging

### Check Payment Flow

1. **Client makes request** → Server returns 402
2. **Client signs payment** → Sends X-PAYMENT header
3. **Facilitator verifies** → On Solana blockchain
4. **Server grants access** → Returns content

### Debug Checklist

- [ ] Wallet address is correct Solana format (base58)
- [ ] Network matches in middleware and server
- [ ] CDP API keys are set (mainnet only)
- [ ] Facilitator configuration is correct
- [ ] Client has USDC balance

### Logs

```bash
# Development
npm run dev

# Production
NODE_ENV=production npm run start
```

Check middleware logs for:
- 402 responses
- Payment verification
- Facilitator communication

## Security Best Practices

### Environment Variables

- ✅ Never commit `.env` file
- ✅ Use different keys for dev/prod
- ✅ Rotate keys regularly
- ✅ Use platform secrets management

### Wallet Security

- ✅ Use dedicated wallet for receiving payments
- ✅ Monitor wallet balance regularly
- ✅ Set up alerts for transactions
- ✅ Have backup access to wallet

### Testing

- ✅ Test on devnet first
- ✅ Start with small mainnet amounts
- ✅ Monitor first 100 transactions closely
- ✅ Have rollback plan ready

## Pricing Strategy

Current tiers (adjust as needed):

| Tier | Devnet | Mainnet |
|------|--------|---------|
| Basic | $0.01 | $0.01 - $0.05 |
| Standard | $0.05 | $0.05 - $0.25 |
| Premium | $0.25 | $0.25 - $5.00 |

### Pricing Considerations

- **Transaction costs**: Solana fees are minimal (~$0.00025)
- **Market rates**: Check competitor pricing
- **Value proposition**: Price according to model capabilities
- **Volume discounts**: Consider bulk payment options

## Performance Optimization

### Caching

Consider caching strategies:
- Facilitator responses (with TTL)
- Successful payment verifications
- Route configurations

### Rate Limiting

Protect against abuse:
- Limit failed payment attempts
- Monitor repeated 402 responses
- Block suspicious patterns

### Scaling

As traffic grows:
- Use CDN for static assets
- Scale server horizontally
- Consider dedicated facilitator instance
- Monitor blockchain network status

## Maintenance

### Regular Tasks

**Daily:**
- Check wallet balance
- Monitor error logs
- Review payment success rate

**Weekly:**
- Analyze pricing effectiveness
- Review customer feedback
- Update documentation

**Monthly:**
- Security audit
- Dependency updates
- Performance review
- Facilitator updates

### Upgrading x402 Packages

```bash
# Check for updates
npm outdated | grep x402

# Update
npm update x402-next x402-express @coinbase/x402

# Test
npm run build
npm run start
```

## Troubleshooting

### Build Fails

```bash
rm -rf node_modules package-lock.json .next
npm install
npm run build
```

### Payments Not Processing

1. Check facilitator endpoint
2. Verify wallet address format
3. Confirm network configuration
4. Test with browser console open

### High Latency

1. Check facilitator response times
2. Monitor Solana network status
3. Optimize middleware placement
4. Consider edge deployment

## Support Resources

- **x402 Discord**: [discord.gg/cdp](https://discord.gg/cdp)
- **Documentation**: [docs.cdp.coinbase.com/x402](https://docs.cdp.coinbase.com/x402)
- **GitHub**: [github.com/coinbase/x402](https://github.com/coinbase/x402)
- **Status Page**: Monitor Solana network status

## Rollback Plan

If issues occur:

1. **Switch back to devnet**:
   - Change network to 'solana-devnet'
   - Use testnet facilitator URL
   - Redeploy

2. **Disable x402 temporarily**:
   - Comment out middleware
   - Serve content freely
   - Fix issues offline
   - Re-enable gradually

## Next Steps

1. ✅ Deploy to testnet (devnet)
2. ⬜ Test payment flow thoroughly
3. ⬜ Get CDP API keys
4. ⬜ Configure mainnet
5. ⬜ Soft launch with low prices
6. ⬜ Monitor and optimize
7. ⬜ Scale up

---

**You're ready to deploy!** 🚀

For questions, join the [x402 Discord](https://discord.gg/cdp).
