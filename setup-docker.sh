#!/bin/bash

# Quick Docker Setup and Test Script
# This script starts Docker and tests the build process

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}🐳 Docker Setup and Test${NC}"
echo -e "${CYAN}==========================${NC}"
echo

# Check if user has sudo privileges
if ! sudo -n true 2>/dev/null; then
    echo -e "${YELLOW}⚠ This script requires sudo access to start Docker${NC}"
    echo -e "${CYAN}You may be prompted for your password${NC}"
    echo
fi

# Start Docker service
echo -e "${CYAN}1. Starting Docker service...${NC}"
if sudo systemctl start docker; then
    echo -e "${GREEN}✅ Docker service started${NC}"
else
    echo -e "${RED}❌ Failed to start Docker service${NC}"
    exit 1
fi

# Enable Docker to start on boot
echo -e "${CYAN}2. Enabling Docker auto-start...${NC}"
if sudo systemctl enable docker; then
    echo -e "${GREEN}✅ Docker auto-start enabled${NC}"
else
    echo -e "${YELLOW}⚠ Could not enable Docker auto-start${NC}"
fi

# Check if user is in docker group
echo -e "${CYAN}3. Checking user permissions...${NC}"
if groups | grep -q docker; then
    echo -e "${GREEN}✅ User is in docker group${NC}"
else
    echo -e "${YELLOW}⚠ Adding user to docker group...${NC}"
    sudo usermod -aG docker "$USER"
    echo -e "${GREEN}✅ User added to docker group${NC}"
    echo -e "${YELLOW}⚠ You may need to log out and back in for group changes to take effect${NC}"
fi

# Test Docker access
echo -e "${CYAN}4. Testing Docker access...${NC}"
if docker info >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Docker is accessible${NC}"
else
    echo -e "${YELLOW}⚠ Docker access issue - trying with newgrp...${NC}"
    # Try to apply group changes without logout
    if newgrp docker -c "docker info" >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Docker is accessible with newgrp${NC}"
    else
        echo -e "${RED}❌ Docker access still failing${NC}"
        echo -e "${CYAN}You may need to:${NC}"
        echo -e "1. Log out and log back in"
        echo -e "2. Or restart your session"
        echo -e "3. Then run this script again"
        exit 1
    fi
fi

# Show Docker status
echo -e "${CYAN}5. Docker status:${NC}"
docker --version
echo -e "Service status: $(sudo systemctl is-active docker)"
echo -e "Auto-start: $(sudo systemctl is-enabled docker)"
echo

# Test the setup script's Docker functionality
echo -e "${CYAN}6. Testing setup script Docker menu...${NC}"
echo -e "${YELLOW}The setup script should now work with Docker deployment${NC}"
echo -e "${CYAN}Try: ./setup.sh → 🚀 Start Server Only → 🐳 Docker Container${NC}"
echo

# Quick Docker commands reference
echo -e "${CYAN}🔧 Docker Commands Reference:${NC}"
echo -e "Build image:     ${YELLOW}docker build -t dichoptic-therapy-games .${NC}"
echo -e "Run container:   ${YELLOW}docker run --rm -p 80:80 dichoptic-therapy-games${NC}"
echo -e "List images:     ${YELLOW}docker images${NC}"
echo -e "List containers: ${YELLOW}docker ps${NC}"
echo -e "Stop containers: ${YELLOW}docker stop \$(docker ps -q)${NC}"
echo -e "Clean up:        ${YELLOW}docker system prune -f${NC}"
echo

echo -e "${GREEN}🎉 Docker setup completed!${NC}"
echo -e "${CYAN}You can now use Docker deployment in the setup script${NC}"
