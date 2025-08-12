#!/bin/bash

# Simple HTTPS Server Startup Script
# Starts the Dichoptic Therapy Game with HTTPS support

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔒 Starting Dichoptic Therapy Game with HTTPS${NC}"
echo -e "${BLUE}=============================================${NC}"
echo

# Check if we're in the right directory
if [[ ! -f "index.html" ]]; then
    echo -e "${RED}❌ index.html not found${NC}"
    echo -e "${CYAN}Please run this script from the project root directory${NC}"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node >/dev/null 2>&1; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    echo -e "${CYAN}Please install Node.js from https://nodejs.org/${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js found: $(node --version)${NC}"

# Check if SSL certificates exist
if [[ ! -f "ssl/server.crt" ]] || [[ ! -f "ssl/server.key" ]]; then
    echo -e "${YELLOW}⚠️  SSL certificates not found. Generating self-signed certificates...${NC}"
    
    # Create ssl directory if it doesn't exist
    mkdir -p ssl
    
    # Generate self-signed certificate
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout ssl/server.key \
        -out ssl/server.crt \
        -subj "/C=US/ST=Development/L=Local/O=Dichoptic Therapy Games/CN=localhost" \
        -addext "subjectAltName=DNS:localhost,DNS:127.0.0.1,IP:127.0.0.1" 2>/dev/null
    
    echo -e "${GREEN}✅ SSL certificates generated${NC}"
else
    echo -e "${GREEN}✅ SSL certificates found${NC}"
fi

# Check if HTTPS server file exists
if [[ ! -f "https-server.js" ]]; then
    echo -e "${RED}❌ https-server.js not found${NC}"
    echo -e "${CYAN}Please ensure the HTTPS server file is in the project directory${NC}"
    exit 1
fi

echo -e "${GREEN}✅ HTTPS server script found${NC}"
echo

# Start the HTTPS server
echo -e "${CYAN}🚀 Starting HTTPS server...${NC}"
echo -e "${YELLOW}Press Ctrl+C to stop the server${NC}"
echo

# Run the server
node https-server.js
