# Quick Start Guide - ParallaxPay x402

The fastest way to test x402 payments on Solana!

## 🎯 5-Minute Setup

### 1. Install Phantom Wallet

Download from: **[phantom.app](https://phantom.app)**

### 2. Switch to Devnet

In Phantom:
- Click the hamburger menu (☰)
- Settings → Developer Settings
- Change network to **Devnet**

###3. Get Test Tokens

**Get SOL (for transaction fees):**
- Visit: [faucet.solana.com](https://faucet.solana.com)
- Paste your wallet address
- Request airdrop

**Get USDC (for x402 payments):**
- Visit: [faucet.circle.com](https://faucet.circle.com)
- Select "Solana Devnet"
- Paste your wallet address
- Request USDC tokens

### 4. Run the App

```bash
npm run dev
```

### 5. Test a Payment!

1. Open [http://localhost:3000/test-payment](http://localhost:3000/test-payment)
2. Connect your Phantom wallet (click "Select Wallet")
3. Click on any tier card (Basic, Standard, or Premium)
4. The x402 payment flow will trigger automatically!

## 🔄 How It Works

### Simple Flow (What You See)

```
Click "Basic" card
  ↓
Navigate to /content/basic
  ↓
x402 middleware detects you need to pay
  ↓
Payment UI appears (or 402 response)
  ↓
Approve with your wallet
  ↓
Content delivered! ✅
```

### Technical Flow (Behind the Scenes)

```
Browser: GET /content/basic
  ↓
Middleware: Check if paid
  ↓
Server: Return 402 Payment Required
  ↓
x402-next: Shows payment UI (if CDP key set)
  OR Returns 402 response to browser
  ↓
User: Signs payment with wallet
  ↓
Browser: Retry GET /content/basic + X-Payment header
  ↓
Facilitator: Verifies payment on Solana
  ↓
Server: Return content
```

## 📱 Payment Methods

### Method 1: Direct Navigation (Recommended)

Just click a link or navigate to a protected page:

```tsx
<Link href="/content/basic">Access Basic Content</Link>
```

The x402-next middleware handles everything automatically!

### Method 2: With CDP Payment UI

If you have a CDP Client Key (get from [portal.cdp.coinbase.com](https://portal.cdp.coinbase.com)):

1. Create `.env.local`:
   ```bash
   NEXT_PUBLIC_CDP_CLIENT_KEY=your-client-key
   ```

2. Restart the app:
   ```bash
   npm run dev
   ```

3. Now when you navigate to protected pages, you'll see the CDP payment UI instead of a raw 402 response!

## 🎨 The Three Tiers

| Tier | Price | Features |
|------|-------|----------|
| **Basic** | $0.01 | Qwen 0.6B, 100 tokens |
| **Standard** | $0.05 | Qwen 1.7B, 256 tokens |
| **Premium** | $0.25 | Advanced models, 512 tokens |

## 🧪 Testing Checklist

- [ ] Phantom wallet installed
- [ ] Switched to Devnet
- [ ] Have devnet SOL (check wallet balance)
- [ ] Have devnet USDC (check wallet balance)
- [ ] App running on localhost:3000
- [ ] Wallet connected to the app
- [ ] Clicked a tier card
- [ ] Saw payment requirement
- [ ] Approved payment
- [ ] Received content!

## ❓ Troubleshooting

### "Payment Required" but nothing happens

**Solution:** Navigate directly to the page (e.g., [http://localhost:3000/content/basic](http://localhost:3000/content/basic))

The x402 middleware works when you navigate to pages, not when making API calls from the same page.

### "Insufficient funds"

**Solutions:**
- Check your wallet has devnet USDC
- Get more from [faucet.circle.com](https://faucet.circle.com)
- Make sure you have some SOL for transaction fees too

### "Wrong network"

**Solution:**
- Open Phantom
- Settings → Developer Settings
- Change network to Devnet (NOT Mainnet-Beta!)

### Still not working?

1. Open browser console (F12)
2. Check for error messages
3. Verify you're on devnet in your wallet
4. Try refreshing the page
5. Disconnect and reconnect wallet

## 🚀 Going to Production

Ready for real payments? See [DEPLOYMENT.md](./DEPLOYMENT.md) for:

- Getting CDP API keys
- Switching to Solana mainnet
- Configuring for production
- Setting real prices
- Monitoring payments

## 📚 More Resources

- **Main README**: [README.md](./README.md)
- **Wallet Setup Guide**: [WALLET_SETUP.md](./WALLET_SETUP.md)
- **Deployment Guide**: [DEPLOYMENT.md](./DEPLOYMENT.md)
- **x402 Docs**: [docs.cdp.coinbase.com/x402](https://docs.cdp.coinbase.com/x402)
- **Discord Support**: [discord.gg/cdp](https://discord.gg/cdp)

## 💡 Pro Tips

✨ **Best practices:**
- Always test on devnet first
- Start with the Basic tier ($0.01)
- Keep your wallet on devnet until ready for production
- Check your wallet balance before testing
- Clear browser cache if you see stale data

🎯 **For development:**
- Use the `/test-payment` page as a dashboard
- Each protected page is independent
- You can test all three tiers
- Payments are verified on Solana devnet blockchain

---

**That's it!** You're ready to test x402 payments on Solana. Happy testing! 🎉

Questions? Join us on [Discord](https://discord.gg/cdp) or check the other guides in this repo.
