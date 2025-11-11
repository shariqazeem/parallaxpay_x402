#!/bin/bash

###############################################################################
# Parallax 2-Node Cluster Startup Script
#
# Launches 2 Parallax nodes optimized for M1 Mac:
# - Node 1: Port 3001 (Primary)
# - Node 2: Port 3002 (Secondary)
#
# Uses Qwen3-0.6B model (lightest, perfect for M1 Air)
###############################################################################

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Parallax 2-Node Cluster Startup              ║${NC}"
echo -e "${BLUE}║  Optimized for M1 Mac                          ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════╝${NC}"
echo ""

# Check if Parallax is installed
if ! command -v parallax &> /dev/null; then
    echo -e "${RED}❌ Parallax not found!${NC}"
    echo ""
    echo "Please install Parallax first:"
    echo "  pip install parallax-inference"
    echo ""
    echo "Or clone and install from source:"
    echo "  git clone https://github.com/GradientHQ/parallax.git"
    echo "  cd parallax"
    echo "  pip install -e ."
    exit 1
fi

# Kill any existing Parallax processes
echo -e "${YELLOW}🧹 Cleaning up existing Parallax processes...${NC}"
pkill -f "parallax" || true
sleep 2

# Create logs directory
mkdir -p logs

# Model to use (lightest for M1 Air)
MODEL="Qwen/Qwen2.5-0.5B-Instruct"
MAX_BATCH_SIZE=4

echo ""
echo -e "${GREEN}🚀 Starting Parallax Cluster...${NC}"
echo ""

# Start Node 1 (Primary)
echo -e "${BLUE}📡 Starting Node 1 on port 3001...${NC}"
nohup parallax run \
  -m "$MODEL" \
  -n 1 \
  --host 0.0.0.0 \
  --port 3001 \
  --max-batch-size $MAX_BATCH_SIZE \
  > logs/parallax-node-3001.log 2>&1 &
NODE1_PID=$!
echo -e "${GREEN}✓ Node 1 started (PID: $NODE1_PID)${NC}"

# Wait a bit before starting second node
sleep 3

# Start Node 2 (Secondary)
echo -e "${BLUE}📡 Starting Node 2 on port 3002...${NC}"
nohup parallax run \
  -m "$MODEL" \
  -n 1 \
  --host 0.0.0.0 \
  --port 3002 \
  --max-batch-size $MAX_BATCH_SIZE \
  > logs/parallax-node-3002.log 2>&1 &
NODE2_PID=$!
echo -e "${GREEN}✓ Node 2 started (PID: $NODE2_PID)${NC}"

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  ✅ Parallax Cluster Started Successfully!    ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}Cluster Configuration:${NC}"
echo "  • Node 1: http://localhost:3001 (PID: $NODE1_PID)"
echo "  • Node 2: http://localhost:3002 (PID: $NODE2_PID)"
echo "  • Model: $MODEL"
echo "  • Batch Size: $MAX_BATCH_SIZE"
echo ""
echo -e "${YELLOW}📊 Logs:${NC}"
echo "  • Node 1: logs/parallax-node-3001.log"
echo "  • Node 2: logs/parallax-node-3002.log"
echo ""
echo -e "${YELLOW}💡 Tips:${NC}"
echo "  • View Node 1 logs: tail -f logs/parallax-node-3001.log"
echo "  • View Node 2 logs: tail -f logs/parallax-node-3002.log"
echo "  • Check cluster status: curl http://localhost:3001"
echo "  • Stop cluster: pkill -f parallax"
echo ""
echo -e "${YELLOW}⏳ Waiting for nodes to initialize (30 seconds)...${NC}"

# Wait for nodes to be ready
sleep 30

# Health check
echo ""
echo -e "${BLUE}🏥 Performing health checks...${NC}"

check_node() {
  local port=$1
  local response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:$port 2>/dev/null || echo "000")
  if [ "$response" != "000" ]; then
    echo -e "${GREEN}✓ Node on port $port is responding${NC}"
    return 0
  else
    echo -e "${RED}✗ Node on port $port is not responding${NC}"
    return 1
  fi
}

HEALTH_OK=true
check_node 3001 || HEALTH_OK=false
check_node 3002 || HEALTH_OK=false

echo ""
if [ "$HEALTH_OK" = true ]; then
  echo -e "${GREEN}🎉 All nodes are healthy and ready!${NC}"
  echo ""
  echo "You can now start your ParallaxPay app:"
  echo "  PARALLAX_CLUSTER_URLS=http://localhost:3001,http://localhost:3002 npm run dev"
else
  echo -e "${YELLOW}⚠️  Some nodes may still be initializing. Check the logs for details.${NC}"
  echo "First inference will take longer as models are loaded."
fi

echo ""
