#!/bin/bash

# HTTPS Setup Script for Dichoptic Therapy Games
# This script sets up HTTPS with SSL certificates

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔒 HTTPS Setup for Dichoptic Therapy Games${NC}"
echo -e "${BLUE}===========================================${NC}"
echo

# Check if running from project root
if [[ ! -f "docker-compose.yml" ]]; then
    echo -e "${RED}❌ docker-compose.yml not found${NC}"
    echo -e "${CYAN}Please run this script from the project root directory${NC}"
    exit 1
fi

# Create nginx directory structure if it doesn't exist
mkdir -p nginx/ssl

echo -e "${CYAN}📋 HTTPS Setup Options:${NC}"
echo "1. Development (Self-signed certificate)"
echo "2. Production (Let's Encrypt certificate)"
echo "3. Production (Bring your own certificate)"
echo

read -p "Choose option (1-3): " choice

case $choice in
    1)
        echo -e "${CYAN}Setting up development HTTPS with self-signed certificate...${NC}"
        
        # Generate self-signed certificate if it doesn't exist
        if [[ ! -f "nginx/ssl/therapy-games.crt" ]] || [[ ! -f "nginx/ssl/therapy-games.key" ]]; then
            echo -e "${YELLOW}Generating self-signed SSL certificate...${NC}"
            openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
                -keyout nginx/ssl/therapy-games.key \
                -out nginx/ssl/therapy-games.crt \
                -subj "/C=US/ST=Development/L=Local/O=Dichoptic Therapy Games/CN=localhost" \
                -addext "subjectAltName=DNS:localhost,DNS:127.0.0.1,IP:127.0.0.1"
            
            echo -e "${GREEN}✅ Self-signed certificate generated${NC}"
        else
            echo -e "${GREEN}✅ SSL certificate already exists${NC}"
        fi
        
        # Set appropriate permissions
        chmod 600 nginx/ssl/therapy-games.key
        chmod 644 nginx/ssl/therapy-games.crt
        
        echo -e "${GREEN}✅ Development HTTPS setup complete${NC}"
        echo -e "${YELLOW}⚠  Note: Your browser will show a security warning for self-signed certificates${NC}"
        echo -e "${CYAN}   Click 'Advanced' → 'Proceed to localhost (unsafe)' to continue${NC}"
        ;;
        
    2)
        echo -e "${CYAN}Setting up production HTTPS with Let's Encrypt...${NC}"
        
        # Check if certbot is installed
        if ! command -v certbot >/dev/null 2>&1; then
            echo -e "${YELLOW}Installing certbot...${NC}"
            if command -v apt-get >/dev/null 2>&1; then
                sudo apt-get update
                sudo apt-get install -y certbot
            elif command -v yum >/dev/null 2>&1; then
                sudo yum install -y certbot
            else
                echo -e "${RED}❌ Please install certbot manually${NC}"
                exit 1
            fi
        fi
        
        read -p "Enter your domain name (e.g., example.com): " domain
        read -p "Enter your email address: " email
        
        echo -e "${YELLOW}Generating Let's Encrypt certificate...${NC}"
        echo -e "${CYAN}Note: Your domain must point to this server for verification${NC}"
        
        # Stop any running containers first
        docker-compose down 2>/dev/null || true
        
        # Get certificate using standalone mode
        sudo certbot certonly --standalone \
            --preferred-challenges http \
            --email "$email" \
            --agree-tos \
            --no-eff-email \
            -d "$domain"
        
        # Copy certificates to nginx directory
        sudo cp "/etc/letsencrypt/live/$domain/fullchain.pem" nginx/ssl/therapy-games.crt
        sudo cp "/etc/letsencrypt/live/$domain/privkey.pem" nginx/ssl/therapy-games.key
        
        # Set appropriate permissions
        sudo chown $(whoami):$(whoami) nginx/ssl/therapy-games.*
        chmod 600 nginx/ssl/therapy-games.key
        chmod 644 nginx/ssl/therapy-games.crt
        
        echo -e "${GREEN}✅ Let's Encrypt certificate installed${NC}"
        echo -e "${CYAN}📝 Don't forget to set up certificate renewal:${NC}"
        echo -e "   sudo crontab -e"
        echo -e "   Add: 0 12 * * * /usr/bin/certbot renew --quiet"
        ;;
        
    3)
        echo -e "${CYAN}Setting up production HTTPS with custom certificate...${NC}"
        
        echo "Please place your certificate files in the nginx/ssl/ directory:"
        echo "- Certificate file: nginx/ssl/therapy-games.crt"
        echo "- Private key file: nginx/ssl/therapy-games.key"
        echo
        
        read -p "Press Enter when you have placed the files..."
        
        if [[ -f "nginx/ssl/therapy-games.crt" ]] && [[ -f "nginx/ssl/therapy-games.key" ]]; then
            # Set appropriate permissions
            chmod 600 nginx/ssl/therapy-games.key
            chmod 644 nginx/ssl/therapy-games.crt
            echo -e "${GREEN}✅ Custom certificate configured${NC}"
        else
            echo -e "${RED}❌ Certificate files not found${NC}"
            exit 1
        fi
        ;;
        
    *)
        echo -e "${RED}❌ Invalid option${NC}"
        exit 1
        ;;
esac

echo
echo -e "${BLUE}🚀 Starting HTTPS-enabled services...${NC}"

# Start the services with the production profile (includes nginx-proxy)
docker-compose --profile production up -d

echo
echo -e "${GREEN}✅ HTTPS setup complete!${NC}"
echo
echo -e "${CYAN}🌐 Your game is now available at:${NC}"
echo -e "   HTTP:  http://localhost (redirects to HTTPS)"
echo -e "   HTTPS: https://localhost"
echo
echo -e "${CYAN}📋 Service Status:${NC}"
docker-compose ps

echo
echo -e "${CYAN}🔧 Useful commands:${NC}"
echo -e "• Check logs: docker-compose logs -f nginx-proxy"
echo -e "• Stop services: docker-compose --profile production down"
echo -e "• Restart: docker-compose --profile production restart"
echo
