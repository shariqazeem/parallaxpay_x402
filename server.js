const express = require('express');
const next = require('next');
const { paymentMiddleware } = require('x402-express');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const PORT = process.env.PORT || 3000;

// Your Solana wallet address (where you receive payments)
const SOLANA_WALLET = '9qzmG8vPymc2CAMchZgq26qiUFq4pEfTx6HZfpMhh51y';

app.prepare().then(() => {
  const server = express();

  // Configure x402 payment middleware for Solana devnet
  server.use(paymentMiddleware(
    SOLANA_WALLET,
    {
      'GET /api/content/basic': {
        price: '$0.01',
        network: 'solana-devnet',
        config: {
          description: 'Basic AI Inference - $0.01',
          mimeType: 'application/json',
        }
      },
      'GET /api/content/standard': {
        price: '$0.05',
        network: 'solana-devnet',
        config: {
          description: 'Standard AI Inference - $0.05',
          mimeType: 'application/json',
        }
      },
      'GET /api/content/premium': {
        price: '$0.25',
        network: 'solana-devnet',
        config: {
          description: 'Premium AI Inference - $0.25',
          mimeType: 'application/json',
        }
      }
    },
    {
      url: 'https://x402.org/facilitator' // Testnet facilitator
    }
  ));

  // API endpoints (these are protected by x402)
  server.get('/api/content/basic', (req, res) => {
    res.json({
      success: true,
      tier: 'basic',
      message: 'Payment verified! Here is your Basic tier content.',
      data: {
        model: 'Qwen 0.6B',
        tokens: 100,
        features: ['Fast inference', 'Basic reasoning']
      }
    });
  });

  server.get('/api/content/standard', (req, res) => {
    res.json({
      success: true,
      tier: 'standard',
      message: 'Payment verified! Here is your Standard tier content.',
      data: {
        model: 'Qwen 1.7B',
        tokens: 256,
        features: ['Better quality', 'Creative writing', 'Enhanced reasoning']
      }
    });
  });

  server.get('/api/content/premium', (req, res) => {
    res.json({
      success: true,
      tier: 'premium',
      message: 'Payment verified! Here is your Premium tier content.',
      data: {
        model: 'Advanced Models',
        tokens: 512,
        features: ['Maximum quality', 'Complex reasoning', 'Professional outputs']
      }
    });
  });

  // Let Next.js handle all other routes
  server.all('*', (req, res) => {
    return handle(req, res);
  });

  server.listen(PORT, (err) => {
    if (err) throw err;
    console.log(`🚀 Server ready on http://localhost:${PORT}`);
    console.log(`💰 x402 payment protection active on Solana devnet`);
    console.log(`📍 Receiving wallet: ${SOLANA_WALLET}`);
  });
});