# Gradient Cloud API Fallback System

## Overview

ParallaxPay now includes an intelligent fallback system that automatically switches to Gradient Cloud API when Parallax is unavailable. This ensures your deployment works everywhere - whether on Mac with Parallax, or on Linux VMs where Parallax isn't supported.

## Why This Matters

**The Problem:**
- Parallax requires macOS to run locally
- Your production deployment is on an aarch64 Linux Ubuntu VM
- Without Parallax running, your app would be non-functional
- Judges evaluating your hackathon project need a working demo

**The Solution:**
- Automatic fallback to Gradient Cloud API when Parallax isn't available
- Seamless switching - your app works everywhere
- Shows active development and production-ready thinking
- Demonstrates understanding of real-world deployment constraints

## How It Works

### Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  Inference Request                       │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
           ┌──────────────────────┐
           │  Unified Inference   │
           │      Client          │
           └──────────┬───────────┘
                      │
         ┌────────────┴────────────┐
         │                         │
         ▼                         ▼
  ┌─────────────┐          ┌─────────────┐
  │  Parallax   │          │  Gradient   │
  │   (Local)   │          │   (Cloud)   │
  │             │          │             │
  │  Primary    │          │  Fallback   │
  └─────────────┘          └─────────────┘
       Mac                     Linux/Any
```

### Selection Logic

1. **Health Check:** System checks both Parallax and Gradient availability
2. **Prefer Local:** If Parallax is running (Mac development), use it
3. **Auto Fallback:** If Parallax is unavailable (Linux deployment), use Gradient
4. **Error Recovery:** If primary provider fails mid-request, retry with fallback

### Configuration

The system is configured through environment variables:

```bash
# Primary: Parallax (Mac local development)
PARALLAX_SCHEDULER_URL=http://localhost:3001

# Fallback: Gradient Cloud API (Linux deployment)
GRADIENT_API_KEY=ak-your-api-key-here
GRADIENT_MODEL=openai/gpt-oss-120b
```

## Deployment Scenarios

### Scenario 1: Local Mac Development
```
✅ Parallax running locally
   → Uses Parallax (free, local)
   → Fast, private inference
```

### Scenario 2: Linux Production Deployment
```
❌ Parallax not available (requires Mac)
✅ Gradient API configured
   → Automatically uses Gradient Cloud
   → App remains fully functional
```

### Scenario 3: Hackathon Demo
```
🎯 Judges access your deployed app
   → Works perfectly on Linux VM
   → Shows real-world production thinking
   → Demonstrates active development
```

## Setup Instructions

### 1. Get Gradient API Key

Visit [Gradient Cloud](https://cloud.gradient.network/) and sign up for a free account. You'll receive free tokens to get started.

**Default API Key (for testing):**
```
ak-f5a93640ff449cd3d44457a5be3172d212355e56fdc0709f0bd5d1a042bc0d89
```

### 2. Configure Environment Variables

Copy the example environment file:
```bash
cp .env.example .env
```

Add your Gradient configuration:
```bash
# Gradient Cloud API (Fallback LLM Provider)
GRADIENT_API_KEY=ak-your-api-key-here
GRADIENT_MODEL=openai/gpt-oss-120b
GRADIENT_BASE_URL=https://apis.gradient.network/api/v1
```

### 3. Deploy

Your app will now work on any platform:

**On Mac with Parallax:**
```bash
# Start Parallax
parallax run -m Qwen/Qwen3-0.6B -n 1 --host 0.0.0.0 --port 3001

# Start app
npm run dev
# → Uses Parallax ✅
```

**On Linux without Parallax:**
```bash
# Just start app (Parallax not available on Linux)
npm run dev
# → Automatically uses Gradient Cloud ✅
```

## API Compatibility

Both providers use the same OpenAI-compatible API format:

```typescript
interface InferenceRequest {
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  maxTokens?: number;
  temperature?: number;
}
```

Your application code doesn't need to change - the fallback is completely transparent.

## Monitoring

The system logs which provider is being used:

```
🌐 Parallax not available, using Gradient Cloud API as fallback
✅ Successfully fell back to Gradient Cloud API
```

Check the response to see which provider was used:
```typescript
const response = await client.inference(request);
console.log('Provider:', response.provider); // 'parallax' or 'gradient'
```

## Cost Comparison

| Provider | Cost | Notes |
|----------|------|-------|
| **Parallax** | Free | Runs on your own hardware |
| **Gradient Cloud** | $0.09/M input tokens<br>$0.45/M output tokens | Pay-as-you-go cloud service |

For hackathon demos and testing, Gradient provides free tokens. For production, Parallax is free when running on your own hardware.

## Advanced Configuration

### Prefer Specific Provider

```typescript
import { createUnifiedInferenceClient } from '@/lib/unified-inference-client';

const client = createUnifiedInferenceClient({
  preferredProvider: 'gradient', // Force Gradient
  enableFallback: false, // Disable fallback
});
```

### Custom Health Check Interval

Health checks are cached for 30 seconds by default. To force refresh:

```typescript
await client.refreshHealthCheck();
```

### Provider Status

Check which providers are available:

```typescript
const status = await client.getProvidersStatus();
console.log('Parallax:', status.parallax.available);
console.log('Gradient:', status.gradient.available);
```

## Troubleshooting

### Parallax Not Detected

If Parallax is running but not detected:

```bash
# Check if Parallax is actually running
curl http://localhost:3001

# Check environment variable
echo $PARALLAX_SCHEDULER_URL

# Force re-discovery
# The system will auto-discover within 30 seconds
```

### Gradient API Errors

```bash
# Verify API key
curl https://apis.gradient.network/api/v1/ai/models

# Check environment variable
echo $GRADIENT_API_KEY

# Check API key validity at https://cloud.gradient.network
```

### Both Providers Unavailable

```
Error: No inference providers available. Please ensure either
Parallax is running or Gradient API key is configured.
```

**Solution:**
1. Start Parallax: `parallax run -m Qwen/Qwen3-0.6B -n 1`
2. Or add Gradient API key to `.env`

## Benefits for Hackathon Judges

✅ **App Works Everywhere:** No need to install Parallax to evaluate your project
✅ **Active Development:** Shows you're iterating and improving
✅ **Production Ready:** Demonstrates understanding of real deployment constraints
✅ **Fallback Strategy:** Shows engineering maturity and reliability thinking
✅ **Cross-Platform:** Mac development, Linux deployment - both supported

## Technical Implementation

See the following files for implementation details:

- `lib/gradient-client.ts` - Gradient Cloud API client
- `lib/unified-inference-client.ts` - Unified inference with fallback logic
- `lib/parallax-cluster.ts` - Cluster client updated with fallback support
- `app/api/inference/paid/route.ts` - Inference endpoint using unified client

## Available Models

Gradient Cloud provides access to multiple state-of-the-art models:

- `openai/gpt-oss-120b` (default) - 120B parameter model
- `qwen/qwen3-coder-480b-instruct-fp8` - 480B coding specialist
- `deepseek-ai/DeepSeek-V3` - DeepSeek's latest model
- And many more...

List available models:
```typescript
import { createGradientClient } from '@/lib/gradient-client';

const client = createGradientClient();
const models = await client.getModels();
console.log(models);
```

## Conclusion

The Gradient fallback system ensures your ParallaxPay x402 project works reliably in any environment. Whether judges are evaluating your deployed Linux instance, or you're developing locally on Mac with Parallax, the experience is seamless and production-ready.

**For hackathon success:** This demonstrates that you're not just building a demo, but thinking about real-world deployment and reliability. That's exactly what judges want to see! 🏆
