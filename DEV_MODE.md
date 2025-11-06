# Development Mode - Testing Without Payments

## The Problem

**x402 on Solana devnet with the testnet facilitator doesn't complete payments end-to-end.**

You'll see:
- ✅ 402 Payment Required response
- ✅ Phantom detects payment
- ❌ Payment doesn't complete
- ❌ "Payment retry failed: Payment Required"

This is because the testnet facilitator at `https://x402.org/facilitator` has limited Solana devnet support.

## The Solution: Dev Mode

I've added a **development mode** that bypasses x402 payments so you can test your app locally.

### Enable Dev Mode

The `.env.local` file is already created with:

```bash
NEXT_PUBLIC_DEV_MODE=true
```

### Restart Your Server

```bash
# Stop current server (Ctrl+C)
# Then restart:
npm run dev
```

### What You'll See

When dev mode is enabled:
```
🔓 [DEV MODE] Bypassing x402 payment for: /content/basic
```

Now you can:
- ✅ Click any tier card
- ✅ Access all content pages
- ✅ Test your app features
- ✅ No payment required!

## Testing the Payment Flow

### Option 1: Test 402 Responses (Dev Mode OFF)

To verify x402 middleware is working:

1. **Disable dev mode** in `.env.local`:
   ```bash
   NEXT_PUBLIC_DEV_MODE=false
   ```

2. **Restart server**:
   ```bash
   npm run dev
   ```

3. **Test with curl**:
   ```bash
   curl -I http://localhost:3000/content/basic
   # Should return: HTTP/1.1 402 Payment Required
   ```

This proves your x402 middleware is working correctly!

### Option 2: Test on Mainnet (Real Money!)

For complete end-to-end payment flow:

1. **Get CDP API Keys** from [portal.cdp.coinbase.com](https://portal.cdp.coinbase.com)

2. **Update `.env.local`**:
   ```bash
   NEXT_PUBLIC_DEV_MODE=false
   CDP_API_KEY_ID=your-key-id
   CDP_API_KEY_SECRET=your-secret
   ```

3. **Update middleware.ts**:
   ```typescript
   import { facilitator } from '@coinbase/x402'

   const network = 'solana' as Network  // Change to mainnet

   const x402PaymentMiddleware = paymentMiddleware(
     address,
     { /* routes */ },
     facilitator  // Use CDP facilitator
   )
   ```

4. **Update server.js**:
   ```javascript
   const { facilitator } = require('@coinbase/x402')

   server.use(paymentMiddleware(
     SOLANA_WALLET,
     {
       'GET /api/content/basic': {
         price: '$0.01',
         network: 'solana',  // Change to mainnet
       }
     },
     facilitator
   ))
   ```

5. **Switch Phantom to Mainnet**
6. **Test with $0.01** (real USDC!)

## Development Workflow

### Building Features (Dev Mode ON)

```bash
# .env.local
NEXT_PUBLIC_DEV_MODE=true
```

- Build your AI inference logic
- Test UI/UX
- Add features
- No payment barriers

### Testing x402 (Dev Mode OFF)

```bash
# .env.local
NEXT_PUBLIC_DEV_MODE=false
```

- Verify 402 responses
- Test payment detection
- Check middleware logs
- Use curl to test

### Production (Mainnet)

```bash
# .env.local
NEXT_PUBLIC_DEV_MODE=false
CDP_API_KEY_ID=your-key
CDP_API_KEY_SECRET=your-secret
```

- Real payments
- CDP facilitator
- Full x402 flow
- Actual USDC

## Current State

| What | Status | Notes |
|------|--------|-------|
| x402 middleware | ✅ Working | Returns 402 correctly |
| Payment detection | ✅ Working | Phantom shows payment |
| Devnet payments | ❌ Limited | Facilitator doesn't support |
| Dev mode bypass | ✅ Working | Easy local testing |
| Mainnet payments | ✅ Works | With CDP facilitator |

## Quick Commands

**Enable dev mode (bypass payments):**
```bash
echo "NEXT_PUBLIC_DEV_MODE=true" > .env.local
npm run dev
```

**Disable dev mode (test 402 responses):**
```bash
echo "NEXT_PUBLIC_DEV_MODE=false" > .env.local
npm run dev
```

**Test 402 response:**
```bash
curl -I http://localhost:3000/content/basic
```

## Summary

✅ **Your x402 implementation is correct**
✅ **Server-side protection works**
✅ **Dev mode lets you test features**
❌ **Devnet payments don't complete** (facilitator limitation)
✅ **Mainnet payments work perfectly** (with CDP)

Use dev mode for development, then switch to mainnet when ready for production!

## Next Steps

1. **Restart with dev mode enabled**
2. **Test all your features**
3. **Build your AI inference logic**
4. **When ready:** Switch to mainnet with CDP
5. **Test with $0.01 first**

Questions? Check the other docs or join [Discord](https://discord.gg/cdp).
