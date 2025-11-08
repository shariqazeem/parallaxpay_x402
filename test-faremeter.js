// Test script to see what Faremeter returns
const { Keypair, Connection, PublicKey, VersionedTransaction } = require('@solana/web3.js');
const { createPaymentHandler } = require('@faremeter/payment-solana/exact');
const { wrap: wrapFetch } = require('@faremeter/fetch');
const { lookupKnownSPLToken } = require('@faremeter/info/solana');
const bs58 = require('bs58');
const fs = require('fs');

async function test() {
  // Load keypair
  const privateKey = process.env.SOLANA_PRIVATE_KEY || process.env.NEXT_PUBLIC_SOLANA_PRIVATE_KEY;
  const secretKey = bs58.decode(privateKey);
  const keypair = Keypair.fromSecretKey(secretKey);

  const network = 'devnet';
  const connection = new Connection('https://api.devnet.solana.com');
  
  const usdcInfo = lookupKnownSPLToken(network, 'USDC');
  const usdcMint = new PublicKey(usdcInfo.address);

  const wallet = {
    network,
    publicKey: keypair.publicKey,
    updateTransaction: async (tx) => {
      tx.sign([keypair]);
      return tx;
    },
  };

  const handler = createPaymentHandler(wallet, usdcMint, connection);
  const fetchWithPayment = wrapFetch(fetch, { handlers: [handler] });

  console.log('Making test payment...');
  
  const response = await fetchWithPayment('http://localhost:3000/api/inference/paid', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [{ role: 'user', content: 'Test' }],
      max_tokens: 50,
    }),
  });

  console.log('\n=== Response Details ===');
  console.log('Status:', response.status);
  console.log('\n=== Headers ===');
  for (const [key, value] of response.headers.entries()) {
    console.log(`${key}: ${value}`);
  }

  const data = await response.json();
  console.log('\n=== Response Body ===');
  console.log(JSON.stringify(data, null, 2));
}

test().catch(console.error);
