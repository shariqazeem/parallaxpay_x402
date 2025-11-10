const { Keypair } = require('@solana/web3.js');
const bs58 = require('bs58');

console.log('🔐 Generating new Solana wallet for ParallaxPay...\n');

const keypair = Keypair.generate();
const publicKey = keypair.publicKey.toBase58();
const privateKey = bs58.encode(keypair.secretKey);

console.log('✅ New Wallet Generated!\n');
console.log('📍 Public Address:');
console.log(publicKey);
console.log('\n🔑 Private Key:');
console.log(privateKey);
console.log('\n📝 Add these to your .env.local:\n');
console.log(`NEXT_PUBLIC_WALLET_ADDRESS=${publicKey}`);
console.log(`NEXT_PUBLIC_SOLANA_PRIVATE_KEY=${privateKey}`);
console.log('\n⚠️  TESTNET ONLY! Never use mainnet keys!\n');
