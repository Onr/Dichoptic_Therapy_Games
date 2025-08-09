#!/usr/bin/env bash

echo "🧪 Testing Port Selection Functionality"
echo "========================================"
echo

# Test the find_available_port function
source setup.sh 2>/dev/null

echo "Testing find_available_port function:"
echo "- Starting from port 8080..."
available_port=$(find_available_port 8080)
echo "- Found available port: $available_port"
echo

echo "Testing port availability check:"
test_ports=(8080 3000 3001 5000 8000 9000)

for port in "${test_ports[@]}"; do
    if netstat -tln 2>/dev/null | grep -q ":${port} " || ss -tln 2>/dev/null | grep -q ":${port} "; then
        echo "❌ Port $port is in use"
    else
        echo "✅ Port $port is available"
    fi
done

echo
echo "🎯 Server Menu Features Added:"
echo "  • Port availability checking before starting server"
echo "  • Automatic suggestion of alternative ports when requested port is busy"
echo "  • Manual port selection option"
echo "  • 'Change Port Number' option in the server menu"
echo "  • Both gum CLI and fallback support for port selection"
echo
echo "📋 Updated Server Menu Options:"
echo "  🌐 Simple HTTP Server (Python/npx) - with port checking"
echo "  🐳 Docker Container (Production) - with port checking"  
echo "  ⚡ Development Server (npm start) - uses package.json config"
echo "  🔧 Change Port Number - NEW OPTION"
echo "  ❌ Cancel"
echo
echo "✨ How it works:"
echo "  1. If no port is set, asks for one first"
echo "  2. Before starting server, checks if port is available"
echo "  3. If port is busy, suggests next available port"
echo "  4. User can accept suggestion or choose different port"
echo "  5. Port selection is persistent during the session"
echo
echo "Ready to test: ./setup.sh and choose '🚀 Start Server Only'"
