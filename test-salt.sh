#!/bin/bash

# Test the salted hash generation
echo "🔐 Testing Salted Password Hash Generation"
echo "=========================================="

# Test password
test_password="admin123"
salt="DichopticTherapyGames2025SecureSalt"
salted_password="${test_password}${salt}"

echo "Password: $test_password"
echo "Salt: $salt"
echo "Salted: $salted_password"

# Generate hash
if command -v sha256sum >/dev/null 2>&1; then
    hash=$(printf "%s" "$salted_password" | sha256sum | cut -d' ' -f1)
    echo "Hash: $hash"
    echo
    echo "✅ Update admin.html with this hash:"
    echo "const ADMIN_PASSWORD_HASH = '$hash'; // SHA-256 of '$test_password' + salt"
else
    echo "❌ sha256sum not available"
fi
:want