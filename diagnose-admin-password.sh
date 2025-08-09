#!/bin/bash

# Admin Password Diagnostic Tool
# This script helps diagnose password authentication issues

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔍 Admin Password Diagnostic Tool${NC}"
echo -e "${BLUE}===================================${NC}"
echo

# Check if admin.html exists
if [[ ! -f "admin.html" ]]; then
    echo -e "${RED}❌ admin.html not found in current directory${NC}"
    echo -e "${CYAN}Please run this script from the project root directory${NC}"
    exit 1
fi

echo -e "${CYAN}📋 Current Password Status:${NC}"
echo

# Extract current hash from admin.html
if grep -q "ADMIN_PASSWORD_HASH" admin.html; then
    current_hash=$(grep "ADMIN_PASSWORD_HASH" admin.html | head -1 | sed "s/.*ADMIN_PASSWORD_HASH = '\([^']*\)'.*/\1/")
    echo -e "${GREEN}✅ Password hash found in admin.html${NC}"
    echo -e "   Hash: ${current_hash:0:16}...${current_hash: -16}"
    echo
    
    # Generate test hashes for common issues
    generate_hash() {
        local password="$1"
        local salt="DichopticTherapyGames2025SecureSalt"
        local salted_password="${password}${salt}"
        
        if command -v sha256sum >/dev/null 2>&1; then
            printf "%s" "$salted_password" | sha256sum | cut -d' ' -f1
        elif command -v shasum >/dev/null 2>&1; then
            printf "%s" "$salted_password" | shasum -a 256 | cut -d' ' -f1
        elif command -v openssl >/dev/null 2>&1; then
            printf "%s" "$salted_password" | openssl dgst -sha256 | cut -d' ' -f2
        else
            echo "HASH_TOOL_NOT_FOUND"
        fi
    }
    
    # Test against known problematic hashes
    admin123_hash=$(generate_hash "admin123")
    cleared_hash=$(generate_hash "CLEARED_FOR_SECURITY")
    
    echo -e "${CYAN}🔍 Hash Analysis:${NC}"
    
    if [[ "$current_hash" == "$admin123_hash" ]]; then
        echo -e "${GREEN}✅ Current password is 'admin123' (working)${NC}"
        echo -e "${YELLOW}⚠  For security, consider changing to a stronger password${NC}"
        password_status="WORKING"
    elif [[ "$current_hash" == "$cleared_hash" ]]; then
        echo -e "${RED}❌ Password is set to 'CLEARED_FOR_SECURITY' (broken)${NC}"
        echo -e "${YELLOW}   This happens when setup script variables are cleared improperly${NC}"
        password_status="BROKEN"
    elif [[ "$current_hash" == "ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f" ]]; then
        echo -e "${YELLOW}⚠  Using old default hash (may not work with current salt)${NC}"
        password_status="OUTDATED"
    elif [[ "$current_hash" == "needs_reset_due_to_salt" ]]; then
        echo -e "${YELLOW}⚠  Password marked for reset due to salt implementation${NC}"
        password_status="NEEDS_RESET"
    else
        echo -e "${BLUE}ℹ  Using custom password hash${NC}"
        password_status="CUSTOM"
    fi
    
    echo
    
    # Environment differences check
    echo -e "${CYAN}🌐 Environment Differences Check:${NC}"
    echo
    
    echo -e "Hash generation tools available:"
    if command -v sha256sum >/dev/null 2>&1; then
        echo -e "${GREEN}✅ sha256sum (Linux standard)${NC}"
        test_hash_sha256sum=$(printf "admin123DichopticTherapyGames2025SecureSalt" | sha256sum | cut -d' ' -f1)
        echo -e "   Test hash: ${test_hash_sha256sum:0:16}..."
    else
        echo -e "${YELLOW}❌ sha256sum (not available)${NC}"
    fi
    
    if command -v shasum >/dev/null 2>&1; then
        echo -e "${GREEN}✅ shasum (macOS standard)${NC}"
        test_hash_shasum=$(printf "admin123DichopticTherapyGames2025SecureSalt" | shasum -a 256 | cut -d' ' -f1)
        echo -e "   Test hash: ${test_hash_shasum:0:16}..."
    else
        echo -e "${YELLOW}❌ shasum (not available)${NC}"
    fi
    
    if command -v openssl >/dev/null 2>&1; then
        echo -e "${GREEN}✅ openssl (universal)${NC}"
        test_hash_openssl=$(printf "admin123DichopticTherapyGames2025SecureSalt" | openssl dgst -sha256 | cut -d' ' -f2)
        echo -e "   Test hash: ${test_hash_openssl:0:16}..."
    else
        echo -e "${YELLOW}❌ openssl (not available)${NC}"
    fi
    
    echo
    
    # Common issues and solutions
    echo -e "${CYAN}🛠  Troubleshooting:${NC}"
    echo
    
    case $password_status in
        "WORKING")
            echo -e "${GREEN}✅ Password system is working correctly${NC}"
            echo -e "   You can login with: admin123"
            ;;
        "BROKEN")
            echo -e "${RED}❌ Password system is broken${NC}"
            echo -e "${CYAN}   Solutions:${NC}"
            echo -e "   1. Run: ./reset-admin-password.sh"
            echo -e "   2. Or run: ./change-admin-password.sh"
            ;;
        "OUTDATED"|"NEEDS_RESET")
            echo -e "${YELLOW}⚠  Password system needs update${NC}"
            echo -e "${CYAN}   Solutions:${NC}"
            echo -e "   1. Run: ./change-admin-password.sh"
            echo -e "   2. Or run: ./reset-admin-password.sh (sets to admin123)"
            ;;
        "CUSTOM")
            echo -e "${BLUE}ℹ  Using custom password${NC}"
            echo -e "${CYAN}   If login fails:${NC}"
            echo -e "   1. Ensure local and remote use same hash tools"
            echo -e "   2. Check if admin.html files are in sync"
            echo -e "   3. Run: ./change-admin-password.sh to reset"
            ;;
    esac
    
    echo
    
    # File sync check
    echo -e "${CYAN}📁 File Synchronization Tips:${NC}"
    echo
    echo -e "Common remote server issues:"
    echo -e "• Different hash tools (sha256sum vs shasum vs openssl)"
    echo -e "• admin.html not synchronized properly"
    echo -e "• Different line endings (Windows/Unix)"
    echo -e "• File permissions issues"
    echo
    echo -e "To fix remote server:"
    echo -e "1. Copy this script to remote server"
    echo -e "2. Run: ./diagnose-admin-password.sh"
    echo -e "3. If broken, run: ./reset-admin-password.sh"
    echo -e "4. Or set custom password: ./change-admin-password.sh"
    
else
    echo -e "${RED}❌ No ADMIN_PASSWORD_HASH found in admin.html${NC}"
    echo -e "${CYAN}   The admin.html file may be corrupted or missing the password section${NC}"
    echo -e "${CYAN}   Solution: Restore from backup or re-run setup${NC}"
fi

echo
echo -e "${BLUE}🔧 Available Password Management Tools:${NC}"
echo -e "• ./reset-admin-password.sh    - Reset to 'admin123'"
echo -e "• ./change-admin-password.sh   - Set custom password"
echo -e "• ./setup.sh                   - Full setup with password option"
echo -e "• ./diagnose-admin-password.sh - This diagnostic tool"
echo
