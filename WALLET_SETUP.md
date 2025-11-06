# Wallet Setup Guide - ParallaxPay x402

This guide explains how to set up and use Solana wallets with ParallaxPay to make x402 payments.

## Overview

ParallaxPay now includes full wallet integration for Solana devnet and mainnet. Users can connect their Solana wallets (Phantom, Solflare, etc.) to make payments through the x402 protocol.

## Supported Wallets

- **Phantom** (Recommended) - [phantom.app](https://phantom.app)
- **Solflare** - [solflare.com](https://solflare.com)
- **Any wallet-adapter compatible wallet**

## For Development (Devnet)

### 1. Install a Solana Wallet

Download and install Phantom or Solflare browser extension.

### 2. Switch to Devnet

In your wallet:
- Open settings
- Change network to **Devnet** (not Mainnet!)
- This ensures you're using test tokens, not real money

### 3. Get Devnet SOL

You need a small amount of SOL for transaction fees:

```bash
# Using Solana CLI
solana airdrop 1 YOUR_WALLET_ADDRESS --url devnet

# Or use the web faucet
# Visit: https://faucet.solana.com
```

### 4. Get Devnet USDC

For x402 payments, you need devnet USDC. Options:

**Option A: Use CDP Faucet (Recommended)**
- Visit [faucet.circle.com](https://faucet.circle.com)
- Select Solana Devnet
- Enter your wallet address
- Request USDC

**Option B: Manual Token Creation**
```bash
# This is advanced - use the faucet instead if possible
spl-token create-account USDC_MINT_ADDRESS
spl-token mint USDC_MINT_ADDRESS AMOUNT YOUR_TOKEN_ACCOUNT
```

### 5. Connect Wallet to ParallaxPay

1. Visit [http://localhost:3000](http://localhost:3000)
2. Click "Select Wallet" button in top right
3. Choose your wallet (Phantom/Solflare)
4. Approve the connection
5. Your wallet address will appear (truncated)

### 6. Test a Payment

1. Go to `/test-payment`
2. Select a tier (Basic $0.01, Standard $0.05, or Premium $0.25)
3. Click "Access Content"
4. Your wallet will prompt you to sign a message
5. Approve the signature (this doesn't cost anything)
6. The payment is verified through the x402 facilitator
7. Content is delivered!

## How the Payment Flow Works

### Client-Side Process

1. **User clicks "Access Content"**
   - App sends GET request to protected endpoint

2. **Server responds with 402 Payment Required**
   - Response includes payment details
   - Payment token and facilitator URL in headers

3. **Client generates payment proof**
   - Creates message: `x402-payment:{token}:{walletAddress}`
   - Wallet signs the message (off-chain, no fees)
   - Creates payment header with signature

4. **Client retries request with payment**
   - Includes `X-Payment` header with signature
   - Facilitator verifies the payment on Solana blockchain
   - Server grants access if payment is valid

5. **Content delivered**
   - User receives the paid content
   - Payment is settled on-chain

### Technical Details

The wallet integration uses:

- `@solana/wallet-adapter-react` - React hooks for wallet state
- `@solana/wallet-adapter-react-ui` - Pre-built UI components
- `@solana/wallet-adapter-wallets` - Wallet adapters
- `@solana/spl-token` - USDC token operations

Payment signing is done via `wallet.signMessage()` which:
- Doesn't require a transaction
- Doesn't cost gas fees
- Proves wallet ownership
- Is verified by the facilitator

## For Production (Mainnet)

### Important Safety Notes

⚠️ **Mainnet uses real USDC - real money!**
- Always test on devnet first
- Start with small amounts
- Double-check wallet address
- Verify network is mainnet

### Setup for Mainnet

1. **Switch wallet to Mainnet-Beta**
   - In wallet settings
   - Select Mainnet-Beta network

2. **Get real SOL for fees**
   - Buy SOL on an exchange
   - Transfer to your wallet
   - Small amount needed (~0.01 SOL)

3. **Get real USDC**
   - Buy USDC on exchange
   - Transfer to your Solana wallet
   - Or use Circle's on-ramp

4. **Update app configuration**
   - Follow mainnet deployment guide in DEPLOYMENT.md
   - Set CDP API keys
   - Change network to 'solana'
   - Update facilitator to use `@coinbase/x402`

5. **Test with small amount first**
   - Try Basic tier ($0.01) first
   - Verify payment goes through
   - Check wallet balance
   - Monitor transactions

## Troubleshooting

### "Wallet Not Connected"

**Problem**: Can't make payments, wallet button shows "Select Wallet"

**Solution**:
- Click "Select Wallet" button
- Choose your wallet from list
- Approve connection in wallet popup
- Refresh page if needed

### "Please use Phantom or Solflare"

**Problem**: Wallet doesn't support message signing

**Solution**:
- Use Phantom or Solflare instead
- These wallets support `signMessage()`
- Other wallets may not support this feature

### "Insufficient funds"

**Problem**: Don't have enough USDC

**Solution**:
- Check your wallet balance
- For devnet: Use USDC faucet
- For mainnet: Buy USDC and transfer
- Make sure you have SOL for transaction fees too

### "Transaction failed"

**Problem**: Payment not processing

**Solution**:
- Check network (devnet vs mainnet)
- Verify you have SOL for fees
- Check facilitator is accessible
- Look at browser console for errors
- Try refreshing the page

### "RPC Error" or "Network Error"

**Problem**: Can't connect to Solana network

**Solution**:
- Check internet connection
- Verify Solana network status
- Try switching RPC endpoint in wallet
- For devnet: Network might be slow, retry

### Payment approved but no content

**Problem**: Signed message but didn't receive content

**Solution**:
- Check browser console for errors
- Verify facilitator processed payment
- Check X-Payment header was sent
- Contact support with transaction ID

## Security Best Practices

### For Users

✅ **DO:**
- Verify you're on the correct network (devnet for testing)
- Check the amount before signing
- Only connect to trusted sites
- Keep your seed phrase secure
- Use hardware wallet for large amounts

❌ **DON'T:**
- Share your seed phrase with anyone
- Sign transactions you don't understand
- Use mainnet for testing
- Leave large amounts in hot wallets

### For Developers

✅ **DO:**
- Validate all user inputs
- Use environment variables for secrets
- Test thoroughly on devnet
- Monitor for suspicious activity
- Implement rate limiting

❌ **DON'T:**
- Store private keys in code
- Hardcode wallet addresses
- Skip validation
- Trust client-side data
- Deploy without testing

## Advanced: Custom RPC Endpoints

For better performance, you can use custom RPC endpoints:

```typescript
// In WalletProvider.tsx
const endpoint = useMemo(() => {
  // Use your own RPC or a service like QuickNode, Helius, etc.
  return process.env.NEXT_PUBLIC_SOLANA_RPC_URL || clusterApiUrl(network)
}, [network])
```

## Getting Help

Having issues with wallets?

1. **Check the console**: Open browser dev tools (F12) and check for errors
2. **Review this guide**: Make sure you followed all steps
3. **Test on devnet**: Always test with fake tokens first
4. **Join Discord**: [discord.gg/cdp](https://discord.gg/cdp) for x402 support
5. **Phantom Support**: [help.phantom.app](https://help.phantom.app)
6. **Solflare Support**: [docs.solflare.com](https://docs.solflare.com)

## Useful Links

- **Phantom Wallet**: [phantom.app](https://phantom.app)
- **Solflare Wallet**: [solflare.com](https://solflare.com)
- **Solana Faucet**: [faucet.solana.com](https://faucet.solana.com)
- **USDC Faucet**: [faucet.circle.com](https://faucet.circle.com)
- **Solana Explorer**: [explorer.solana.com](https://explorer.solana.com)
- **Wallet Adapter Docs**: [github.com/solana-labs/wallet-adapter](https://github.com/solana-labs/wallet-adapter)

---

**Ready to start?** Install Phantom, switch to devnet, get some tokens, and start making micropayments! 🚀
