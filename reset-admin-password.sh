#!/bin/bash

# Quick Admin Password Reset Script
# This sets the admin password to "admin123" for immediate access

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}🔧 Admin Password Reset Tool${NC}"
echo -e "${CYAN}================================${NC}"
echo

# Check if admin.html exists
if [[ ! -f "admin.html" ]]; then
    echo -e "${RED}❌ admin.html not found in current directory${NC}"
    echo -e "${CYAN}Please run this script from the project root directory${NC}"
    exit 1
fi

# Generate SHA-256 hash for "admin123" with salt
generate_hash() {
    local password="admin123"
    local salt="DichopticTherapyGames2025SecureSalt"
    local salted_password="${password}${salt}"
    
    if command -v sha256sum >/dev/null 2>&1; then
        printf "%s" "$salted_password" | sha256sum | cut -d' ' -f1
    elif command -v shasum >/dev/null 2>&1; then
        printf "%s" "$salted_password" | shasum -a 256 | cut -d' ' -f1
    elif command -v openssl >/dev/null 2>&1; then
        printf "%s" "$salted_password" | openssl dgst -sha256 | cut -d' ' -f2
    else
        echo -e "${RED}❌ No SHA-256 tool found (sha256sum, shasum, or openssl required)${NC}"
        exit 1
    fi
}

echo -e "${YELLOW}This will reset the admin password to 'admin123'${NC}"
echo -e "${YELLOW}You can change it later using ./change-admin-password.sh${NC}"
echo

read -p "Continue with password reset? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${CYAN}Reset cancelled.${NC}"
    exit 0
fi

# Generate hash for admin123
echo -e "${CYAN}🔒 Generating password hash for 'admin123'...${NC}"
password_hash=$(generate_hash)

if [[ -z "$password_hash" ]]; then
    echo -e "${RED}❌ Failed to generate password hash${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Password hash generated: ${password_hash:0:16}...${NC}"

# Create backup
cp admin.html admin.html.backup
echo -e "${CYAN}📋 Backup created: admin.html.backup${NC}"

# Update admin.html
new_line="const ADMIN_PASSWORD_HASH = '$password_hash'; // SHA-256 of 'admin123' + salt"

if sed -i "s|const ADMIN_PASSWORD_HASH = '[^']*';.*|$new_line|g" admin.html; then
    echo -e "${GREEN}✅ admin.html updated successfully${NC}"
    
    # Verify the change
    if grep -q "$password_hash" admin.html; then
        echo -e "${GREEN}✅ Password hash verified in admin.html${NC}"
        echo -e "${CYAN}🔐 Admin password reset to 'admin123'${NC}"
        echo -e "${CYAN}🔗 You can now login at: http://localhost:PORT/admin.html${NC}"
        echo -e "${YELLOW}⚠ Remember to change this password for security!${NC}"
        echo -e "${CYAN}Use: ./change-admin-password.sh${NC}"
        echo
        
        # Ask about backup
        read -p "Remove backup file (admin.html.backup)? (y/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            rm admin.html.backup
            echo -e "${GREEN}✅ Backup file removed${NC}"
        fi
    else
        echo -e "${RED}❌ Failed to verify password update${NC}"
        echo -e "${CYAN}Restoring from backup...${NC}"
        mv admin.html.backup admin.html
        exit 1
    fi
else
    echo -e "${RED}❌ Failed to update admin.html${NC}"
    echo -e "${CYAN}Restoring from backup...${NC}"
    mv admin.html.backup admin.html
    exit 1
fi

echo -e "${GREEN}🎉 Password reset completed successfully!${NC}"
echo -e "${CYAN}Login credentials: admin123${NC}"
