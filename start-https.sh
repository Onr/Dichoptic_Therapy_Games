#!/bin/bash

# Quick HTTPS Start Script
# Quickly start the game with HTTPS enabled

set -euo pipefail

# Colors
GREEN='\033[0;32m'
CYAN='\033[0;36m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Quick HTTPS Start${NC}"
echo -e "${BLUE}==================${NC}"

# Check if SSL certificates exist
if [[ ! -f "nginx/ssl/therapy-games.crt" ]] || [[ ! -f "nginx/ssl/therapy-games.key" ]]; then
    echo -e "${CYAN}No SSL certificates found. Running full HTTPS setup...${NC}"
    ./setup-https.sh
else
    echo -e "${GREEN}✅ SSL certificates found${NC}"
    echo -e "${CYAN}Starting HTTPS-enabled services...${NC}"
    
    # Start with production profile (includes nginx-proxy for HTTPS)
    docker-compose --profile production up -d
    
    echo
    echo -e "${GREEN}✅ HTTPS services started!${NC}"
    echo
    echo -e "${CYAN}🌐 Your game is available at:${NC}"
    echo -e "   HTTPS: https://localhost"
    echo -e "   HTTP:  http://localhost (redirects to HTTPS)"
    echo
    echo -e "${CYAN}📋 Running services:${NC}"
    docker-compose ps
fi
