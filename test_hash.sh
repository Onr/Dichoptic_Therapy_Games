#!/bin/bash

# Test password hash generation
test_password="admin123"

echo "Testing hash generation for: $test_password"

if command -v sha256sum >/dev/null 2>&1; then
    hash1=$(echo -n "$test_password" | sha256sum | cut -d' ' -f1)
    echo "sha256sum: $hash1"
elif command -v shasum >/dev/null 2>&1; then
    hash2=$(echo -n "$test_password" | shasum -a 256 | cut -d' ' -f1)
    echo "shasum: $hash2"
elif command -v openssl >/dev/null 2>&1; then
    hash3=$(echo -n "$test_password" | openssl dgst -sha256 | cut -d' ' -f2)
    echo "openssl: $hash3"
else
    echo "No hash tool found"
fi

# Expected hash for 'admin123'
expected="ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f"
echo "Expected: $expected"
