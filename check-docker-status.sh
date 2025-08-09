#!/bin/bash

# Docker Status Checker for Dichoptic Therapy Games
# Quick diagnostic tool for Docker setup issues

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🐳 Docker Status Checker${NC}"
echo -e "${BLUE}========================${NC}"
echo

# Check if Docker is installed
echo -e "${CYAN}1. Docker Installation:${NC}"
if command -v docker >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Docker is installed: $(docker --version)${NC}"
else
    echo -e "${RED}❌ Docker is not installed${NC}"
    echo -e "${CYAN}Install Docker: https://docs.docker.com/get-docker/${NC}"
    exit 1
fi
echo

# Check if Docker daemon is running
echo -e "${CYAN}2. Docker Daemon Status:${NC}"
if docker info >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Docker daemon is running${NC}"
else
    echo -e "${RED}❌ Docker daemon is not accessible${NC}"
    echo -e "${CYAN}Solutions:${NC}"
    echo -e "   • Start Docker: ${YELLOW}sudo systemctl start docker${NC}"
    echo -e "   • Enable auto-start: ${YELLOW}sudo systemctl enable docker${NC}"
    echo -e "   • Check user permissions: ${YELLOW}sudo usermod -aG docker \$USER${NC}"
    echo -e "   • Restart session after adding to docker group"
    exit 1
fi
echo

# Check Docker images
echo -e "${CYAN}3. Project Docker Images:${NC}"
if docker images | grep -q dichoptic-therapy-games; then
    echo -e "${GREEN}✅ dichoptic-therapy-games image found${NC}"
    docker images | grep dichoptic-therapy-games
else
    echo -e "${YELLOW}⚠ dichoptic-therapy-games image not found${NC}"
    echo -e "${CYAN}Build with: ${YELLOW}docker build -t dichoptic-therapy-games .${NC}"
fi
echo

# Check running containers
echo -e "${CYAN}4. Running Containers:${NC}"
running_containers=$(docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Ports}}" 2>/dev/null || echo "")
if [[ -n "$running_containers" ]] && echo "$running_containers" | grep -q dichoptic-therapy-games; then
    echo -e "${GREEN}✅ Project containers running:${NC}"
    echo "$running_containers" | grep dichoptic-therapy-games
else
    echo -e "${YELLOW}⚠ No project containers currently running${NC}"
fi
echo

# Check port availability
echo -e "${CYAN}5. Port Availability Check:${NC}"
check_port() {
    local port=$1
    if netstat -tln 2>/dev/null | grep -q ":${port} " || ss -tln 2>/dev/null | grep -q ":${port} "; then
        echo -e "${RED}❌ Port ${port} is in use${NC}"
        if command -v netstat >/dev/null 2>&1; then
            echo -e "${CYAN}   Used by: $(netstat -tlnp 2>/dev/null | grep ":${port} " | awk '{print $NF}' | head -1)${NC}"
        fi
    else
        echo -e "${GREEN}✅ Port ${port} is available${NC}"
    fi
}

for port in 80 8080 3000; do
    check_port $port
done
echo

# Check required files
echo -e "${CYAN}6. Required Files Check:${NC}"
files=("Dockerfile" "docker/nginx.conf" "docker/healthcheck.js" "package.json")
for file in "${files[@]}"; do
    if [[ -f "$file" ]]; then
        echo -e "${GREEN}✅ ${file}${NC}"
    else
        echo -e "${RED}❌ ${file} (missing)${NC}"
    fi
done
echo

# Docker system info
echo -e "${CYAN}7. Docker System Info:${NC}"
echo -e "   Storage Driver: $(docker info 2>/dev/null | grep 'Storage Driver' | cut -d' ' -f3-)"
echo -e "   Total Images: $(docker images -q | wc -l)"
echo -e "   Running Containers: $(docker ps -q | wc -l)"
echo -e "   Stopped Containers: $(docker ps -aq | wc -l)"
echo

# Quick actions
echo -e "${BLUE}🛠 Quick Actions:${NC}"
echo -e "Build image: ${YELLOW}docker build -t dichoptic-therapy-games .${NC}"
echo -e "Run container: ${YELLOW}docker run --rm -p 80:80 dichoptic-therapy-games${NC}"
echo -e "Stop all containers: ${YELLOW}docker stop \$(docker ps -aq)${NC}"
echo -e "Clean system: ${YELLOW}docker system prune -f${NC}"
echo -e "View logs: ${YELLOW}docker logs <container_id>${NC}"
echo

# Status summary
echo -e "${BLUE}📋 Status Summary:${NC}"
if docker info >/dev/null 2>&1; then
    if docker images | grep -q dichoptic-therapy-games; then
        echo -e "${GREEN}✅ Ready to run Docker containers${NC}"
        echo -e "${CYAN}Use: ./setup.sh → 🚀 Start Server Only → 🐳 Docker Container${NC}"
    else
        echo -e "${YELLOW}⚠ Docker ready, but image needs building${NC}"
        echo -e "${CYAN}Use: ./setup.sh to build and run automatically${NC}"
    fi
else
    echo -e "${RED}❌ Docker daemon not accessible${NC}"
    echo -e "${CYAN}Fix Docker daemon issues first${NC}"
fi
