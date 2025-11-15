#!/bin/bash
# Setup Production Environment Variables for Docker Deployment
# This script helps create .env.production from your local .env.local

set -e

echo "🔧 Setting up production environment for ParallaxPay..."

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "❌ Error: .env.local not found!"
    echo "   Please create .env.local with your configuration first."
    exit 1
fi

# Create .env.production from example if it doesn't exist
if [ ! -f ".env.production" ]; then
    echo "📝 Creating .env.production from example..."
    cp .env.production.example .env.production
fi

echo ""
echo "✅ Copying values from .env.local to .env.production..."
echo ""

# Function to copy env var
copy_env_var() {
    local var_name=$1
    local value=$(grep "^${var_name}=" .env.local | cut -d '=' -f2-)

    if [ -n "$value" ]; then
        # Check if variable exists in .env.production
        if grep -q "^${var_name}=" .env.production; then
            # Replace existing value (macOS and Linux compatible)
            if [[ "$OSTYPE" == "darwin"* ]]; then
                sed -i '' "s|^${var_name}=.*|${var_name}=${value}|" .env.production
            else
                sed -i "s|^${var_name}=.*|${var_name}=${value}|" .env.production
            fi
            echo "  ✓ $var_name"
        else
            # Add new variable
            echo "${var_name}=${value}" >> .env.production
            echo "  + $var_name (added)"
        fi
    else
        echo "  ⚠ $var_name (not found in .env.local)"
    fi
}

# Copy critical variables
echo "📋 Copying critical x402 variables:"
copy_env_var "SOLANA_WALLET_ADDRESS"
copy_env_var "SOLANA_PRIVATE_KEY"
copy_env_var "X402_NETWORK"
copy_env_var "X402_FACILITATOR_URL"

echo ""
echo "📋 Copying CDP credentials:"
copy_env_var "CDP_API_KEY_ID"
copy_env_var "CDP_API_KEY_SECRET"
copy_env_var "NEXT_PUBLIC_CDP_CLIENT_KEY"

echo ""
echo "📋 Copying Supabase configuration:"
copy_env_var "NEXT_PUBLIC_SUPABASE_URL"
copy_env_var "NEXT_PUBLIC_SUPABASE_ANON_KEY"

echo ""
echo "📋 Copying Gradient Cloud API:"
copy_env_var "GRADIENT_API_KEY"
copy_env_var "NEXT_PUBLIC_GRADIENT_API_KEY"

echo ""
echo "✅ Production environment configured!"
echo ""
echo "📝 Next steps:"
echo "   1. Review .env.production and verify all values"
echo "   2. Deploy using: docker-compose -f docker-compose.linux.yml up -d --build"
echo "   3. Check logs: docker logs parallaxpay-app -f"
echo ""
echo "🔐 SECURITY WARNING:"
echo "   .env.production is in .gitignore - DO NOT commit it to git!"
echo "   It contains sensitive credentials!"
echo ""
