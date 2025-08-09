#!/bin/bash

# Simple Admin Password Changer for Dichoptic Therapy Games
# Usage: ./change-admin-password.sh

set -euo pipefail

# Disable bash history to prevent password leakage
set +o history

# Trap to ensure history is re-enabled on exit
trap 'set -o history' EXIT

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}🔐 Admin Password Changer${NC}"
echo -e "${CYAN}================================${NC}"
echo

# Check if admin.html exists
if [[ ! -f "admin.html" ]]; then
    echo -e "${RED}❌ admin.html not found in current directory${NC}"
    echo -e "${CYAN}Please run this script from the project root directory${NC}"
    exit 1
fi

# Generate SHA-256 hash with salt
generate_hash() {
    local password="$1"
    
    # Add a constant salt to the password for extra security
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

# Get current password info
echo -e "${CYAN}Current password status:${NC}"
if grep -q "ADMIN_PASSWORD_HASH" admin.html; then
    current_hash=$(grep "ADMIN_PASSWORD_HASH" admin.html | head -1 | sed "s/.*ADMIN_PASSWORD_HASH = '\([^']*\)'.*/\1/")
    echo -e "${GREEN}✅ Password hash found: ${current_hash:0:16}...${NC}"
    
    # Check if it's the default password or needs reset
    default_hash="ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f"
    if [[ "$current_hash" == "$default_hash" ]]; then
        echo -e "${YELLOW}⚠ Currently using default password 'admin123'${NC}"
        echo -e "${YELLOW}⚠ It's recommended to change this for security${NC}"
    elif [[ "$current_hash" == "needs_reset_due_to_salt" ]]; then
        echo -e "${YELLOW}⚠ Password needs to be reset due to salt implementation${NC}"
        echo -e "${YELLOW}⚠ Please set a new password${NC}"
    else
        echo -e "${GREEN}✅ Using custom password with salt${NC}"
    fi
else
    echo -e "${RED}❌ No password hash found in admin.html${NC}"
    exit 1
fi

echo

# Ask if user wants to change password
read -p "Do you want to change the admin password? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${CYAN}Password unchanged.${NC}"
    exit 0
fi

# Get new password
while true; do
    echo -e "${CYAN}Enter new admin password:${NC}"
    read -s new_password
    echo
    
    if [[ ${#new_password} -lt 6 ]]; then
        echo -e "${RED}❌ Password must be at least 6 characters long${NC}"
        continue
    fi
    
    echo -e "${CYAN}Confirm password:${NC}"
    read -s confirm_password
    echo
    
    if [[ "$new_password" != "$confirm_password" ]]; then
        echo -e "${RED}❌ Passwords do not match${NC}"
        continue
    fi
    
    break
done

# Generate hash
echo -e "${CYAN}🔒 Generating SHA-256 hash...${NC}"
password_hash=$(generate_hash "$new_password")

# Clear password from memory for security
new_password="CLEARED_FOR_SECURITY"
confirm_password="CLEARED_FOR_SECURITY"

if [[ -z "$password_hash" ]]; then
    echo -e "${RED}❌ Failed to generate password hash${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Password hash generated successfully${NC}"

# Create backup
cp admin.html admin.html.backup
echo -e "${CYAN}📋 Backup created: admin.html.backup${NC}"

# Update admin.html
new_line="const ADMIN_PASSWORD_HASH = '$password_hash'; // SHA-256 of password + salt"

if sed -i "s|const ADMIN_PASSWORD_HASH = '[^']*';.*|$new_line|g" admin.html; then
    echo -e "${GREEN}✅ admin.html updated successfully${NC}"
    
    # Verify the change
    if grep -q "$password_hash" admin.html; then
        echo -e "${GREEN}✅ Password hash verified in admin.html${NC}"
        echo -e "${CYAN}🔐 New admin password set successfully!${NC}"
        echo -e "${CYAN}🔗 Access admin at: http://localhost:8080/admin.html${NC}"
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

echo -e "${GREEN}🎉 Password change completed successfully!${NC}"

# Re-enable bash history
set -o history
