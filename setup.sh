#!/usr/bin/env bash
set -euo pipefail

# Colors and styling
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Ensure gum is installed
install_gum() {
  if ! command -v gum >/dev/null 2>&1; then
    echo -e "${YELLOW}Installing gum CLI for better user experience...${NC}"
    
    # Try different installation methods
    if command -v brew >/dev/null 2>&1; then
      brew install gum
    elif command -v apt-get >/dev/null 2>&1; then
      # Use binary installation for Ubuntu/Debian if package not available
      echo -e "${CYAN}Installing gum via binary download...${NC}"
      sudo mkdir -p /opt/gum
      sudo wget -O /opt/gum/gum "https://github.com/charmbracelet/gum/releases/latest/download/gum_$(uname -s)_$(uname -m)"
      sudo chmod +x /opt/gum/gum
      sudo ln -sf /opt/gum/gum /usr/local/bin/gum
    elif command -v yum >/dev/null 2>&1; then
      echo -e "${CYAN}Installing gum via binary download...${NC}"
      sudo mkdir -p /opt/gum
      sudo wget -O /opt/gum/gum "https://github.com/charmbracelet/gum/releases/latest/download/gum_$(uname -s)_$(uname -m)"
      sudo chmod +x /opt/gum/gum
      sudo ln -sf /opt/gum/gum /usr/local/bin/gum
    elif command -v pacman >/dev/null 2>&1; then
      sudo pacman -S gum
    else
      echo -e "${YELLOW}Could not install gum automatically.${NC}"
      echo -e "${CYAN}Falling back to standard prompts...${NC}"
      export FALLBACK=1
      return
    fi
    
    # Verify installation
    if ! command -v gum >/dev/null 2>&1; then
      echo -e "${YELLOW}gum installation failed, using fallback mode${NC}"
      export FALLBACK=1
    else
      echo -e "${GREEN}✅ gum installed successfully${NC}"
    fi
  fi
}

# Fallback functions for when gum is not available
fallback_style() {
  echo -e "${CYAN}$1${NC}"
}

fallback_confirm() {
  read -p "$1 (y/n): " -n 1 -r
  echo
  [[ $REPLY =~ ^[Yy]$ ]]
}

fallback_input() {
  read -p "$1: " input
  echo "$input"
}

fallback_spin() {
  echo -e "${YELLOW}$1${NC}"
  if eval "$2"; then
    return 0
  else
    return 1
  fi
}

# Setup functions based on gum availability
if [[ "${FALLBACK:-}" == "1" ]] || ! command -v gum >/dev/null 2>&1; then
  if [[ "${FALLBACK:-}" != "1" ]]; then
    install_gum
  fi
  
  if [[ "${FALLBACK:-}" == "1" ]] || ! command -v gum >/dev/null 2>&1; then
    echo -e "${YELLOW}Using fallback mode (no gum)${NC}"
    gum_style() { fallback_style "$1"; }
    gum_confirm() { fallback_confirm "$1"; }
    gum_input() { fallback_input "$1"; }
    gum_spin() { fallback_spin "$@"; }
  fi
else
  gum_style() { gum style --border normal --margin "1 2" --padding "1 4" --border-foreground 212 --foreground 212 "$1"; }
  gum_confirm() { gum confirm "$1"; }
  gum_input() { gum input --placeholder "$1"; }
  gum_spin() { gum spin --spinner dot --title "$1" -- bash -c "$2"; }
fi

# Main setup flow
run_setup() {
  # Main setup header
  gum_style "🎮 Dichoptic Therapy Games - Setup Menu 🚀"

  echo -e "${CYAN}Welcome to the Dichoptic Therapy Games setup system!${NC}"
  echo -e "${CYAN}Choose from the options below to customize your setup experience.${NC}"
  echo

  # Main menu selection
  if command -v gum >/dev/null 2>&1; then
    # Use gum for interactive selection
    setup_option=$(gum choose --header "What would you like to do?" \
      "🔧 Full Setup (Complete installation & configuration)" \
      "📦 Install Dependencies Only" \
      "🔐 Manage Admin Password Only" \
      "🚀 Start Server Only" \
      "❌ Exit")
    
    case "$setup_option" in
      "🔧 Full Setup (Complete installation & configuration)")
        echo -e "${GREEN}Starting full setup process...${NC}"
        echo
        # Check if user wants to setup admin password during full setup
        if [[ -f "admin.html" ]] && gum_confirm "Setup/change admin dashboard password during setup?"; then
          setup_admin_password
          echo
        fi
        main "${@:-}"
        ;;
      "📦 Install Dependencies Only")
        echo -e "${GREEN}Starting dependencies installation...${NC}"
        echo
        check_requirements
        setup_environment
        install_dependencies
        echo -e "${GREEN}✅ Dependencies installation completed!${NC}"
        echo
        # Offer to start server after dependencies
        if gum_confirm "Would you like to start a server now?"; then
          start_server_menu
        fi
        ;;
      "🔐 Manage Admin Password Only")
        if [[ -f "admin.html" ]]; then
          setup_admin_password
        else
          echo -e "${RED}❌ admin.html not found in current directory${NC}"
          echo -e "${CYAN}Please run this script from the project root directory${NC}"
        fi
        exit 0
        ;;
      "🚀 Start Server Only")
        echo -e "${GREEN}Starting server menu...${NC}"
        echo
        # Always ask for port selection
        if [[ -z "${PORT:-}" ]]; then
          PORT=$(gum_input "Enter port number for server")
          if [[ -z "$PORT" ]]; then
            echo -e "${YELLOW}No port specified, using default 80${NC}"
            PORT=80
          fi
        fi
        start_server_menu
        exit 0
        ;;
      "❌ Exit")
        echo -e "${YELLOW}Setup cancelled. Goodbye! 👋${NC}"
        exit 0
        ;;
    esac
  else
    # Fallback for systems without gum
    echo "Setup Options:"
    echo "1) Full Setup (Complete installation & configuration)"
    echo "2) Install Dependencies Only"
    echo "3) Manage Admin Password Only"
    echo "4) Start Server Only"
    echo "5) Exit"
    echo
    read -p "Enter choice (1-5): " choice
    
    case $choice in
      1)
        echo -e "${GREEN}Starting full setup process...${NC}"
        echo
        # Check if user wants to setup admin password during full setup
        if [[ -f "admin.html" ]] && gum_confirm "Setup/change admin dashboard password during setup?"; then
          setup_admin_password
          echo
        fi
        main "${@:-}"
        ;;
      2)
        echo -e "${GREEN}Starting dependencies installation...${NC}"
        echo
        check_requirements
        setup_environment
        install_dependencies
        echo -e "${GREEN}✅ Dependencies installation completed!${NC}"
        echo
        # Offer to start server after dependencies
        if gum_confirm "Would you like to start a server now?"; then
          start_server_menu
        fi
        ;;
      3)
        if [[ -f "admin.html" ]]; then
          setup_admin_password
        else
          echo -e "${RED}❌ admin.html not found in current directory${NC}"
          echo -e "${CYAN}Please run this script from the project root directory${NC}"
        fi
        exit 0
        ;;
      4)
        echo -e "${GREEN}Starting server menu...${NC}"
        echo
        # Always ask for port selection
        if [[ -z "${PORT:-}" ]]; then
          read -p "Enter port number for server: " PORT
          if [[ -z "$PORT" ]]; then
            echo -e "${YELLOW}No port specified, using default 80${NC}"
            PORT=80
          fi
        fi
        start_server_menu
        exit 0
        ;;
      5|"")
        echo -e "${YELLOW}Setup cancelled. Goodbye! 👋${NC}"
        exit 0
        ;;
      *)
        echo -e "${RED}Invalid choice. Please run the script again.${NC}"
        exit 1
        ;;
    esac
  fi
}

# Check system requirements
check_requirements() {
  gum_style "📋 Checking System Requirements"
  
  local missing_deps=()
  
  # Check Node.js
  if ! command -v node >/dev/null 2>&1; then
    missing_deps+=("Node.js")
  else
    echo -e "${GREEN}✓ Node.js: $(node -v)${NC}"
  fi
  
  # Check npm
  if ! command -v npm >/dev/null 2>&1; then
    missing_deps+=("npm")
  else
    echo -e "${GREEN}✓ npm: $(npm -v)${NC}"
  fi
  
  # Check Docker (optional but recommended)
  if ! command -v docker >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠ Docker: Not installed (recommended for production)${NC}"
  else
    echo -e "${GREEN}✓ Docker: $(docker --version)${NC}"
  fi
  
  # Check Docker Compose
  if ! command -v docker-compose >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠ Docker Compose: Not installed (recommended for production)${NC}"
  else
    echo -e "${GREEN}✓ Docker Compose: $(docker-compose --version)${NC}"
  fi
  
  # Check Git
  if ! command -v git >/dev/null 2>&1; then
    missing_deps+=("Git")
  else
    echo -e "${GREEN}✓ Git: $(git --version)${NC}"
  fi
  
  if [ ${#missing_deps[@]} -ne 0 ]; then
    echo -e "${RED}❌ Missing required dependencies: ${missing_deps[*]}${NC}"
    echo -e "${YELLOW}Please install the missing dependencies and run setup again.${NC}"
    exit 1
  fi
  
  echo -e "${GREEN}✅ All required dependencies are installed!${NC}"
  echo
}

# Generate SHA-256 hash for admin password with salt
generate_password_hash() {
  local password="$1"
  
  # Add a constant salt to the password for extra security
  local salt="DichopticTherapyGames2025SecureSalt"
  local salted_password="${password}${salt}"
  
  # Try different methods to generate SHA-256 hash
  if command -v sha256sum >/dev/null 2>&1; then
    echo -n "$salted_password" | sha256sum | cut -d' ' -f1
  elif command -v shasum >/dev/null 2>&1; then
    echo -n "$salted_password" | shasum -a 256 | cut -d' ' -f1
  elif command -v openssl >/dev/null 2>&1; then
    echo -n "$salted_password" | openssl dgst -sha256 | cut -d' ' -f2
  else
    echo -e "${RED}❌ No SHA-256 tool found (sha256sum, shasum, or openssl required)${NC}"
    return 1
  fi
}

# Admin password configuration
setup_admin_password() {
  gum_style "🔐 Admin Password Configuration"
  
  # Temporarily disable bash history for this function to prevent password leakage
  set +o history
  
  # Trap to ensure history is re-enabled when function exits
  trap 'set -o history' RETURN
  
  if [[ ! -f "admin.html" ]]; then
    echo -e "${RED}❌ admin.html not found in current directory${NC}"
    echo -e "${CYAN}Please run this script from the project root directory${NC}"
    return
  fi
  
  # Show current status
  echo -e "${CYAN}Current admin.html password status:${NC}"
  if grep -q "ADMIN_PASSWORD_HASH" admin.html; then
    local current_hash
    current_hash=$(grep "ADMIN_PASSWORD_HASH" admin.html | head -1 | sed "s/.*ADMIN_PASSWORD_HASH = '\([^']*\)'.*/\1/")
    echo -e "${GREEN}✅ Password hash found: ${current_hash:0:16}...${NC}"
    
    # Check if it's the default password or needs reset
    local default_hash="ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f"
    if [[ "$current_hash" == "$default_hash" ]]; then
      echo -e "${YELLOW}⚠ Using default password 'admin123' - should be changed${NC}"
    elif [[ "$current_hash" == "needs_reset_due_to_salt" ]]; then
      echo -e "${YELLOW}⚠ Password needs to be reset due to salt implementation${NC}"
    else
      echo -e "${GREEN}✅ Using custom password with salt${NC}"
    fi
  else
    echo -e "${RED}❌ No password hash found in admin.html${NC}"
    return
  fi
  echo
  
  if ! gum_confirm "Change admin dashboard password?"; then
    return
  fi
  
  # Get new password using secure input (no gum for password to avoid display)
  local new_password
  while true; do
    echo -e "${CYAN}Enter new admin password (minimum 6 characters):${NC}"
    read -s new_password
    echo # Add newline after hidden input
    
    if [[ ${#new_password} -lt 6 ]]; then
      echo -e "${RED}❌ Password must be at least 6 characters long${NC}"
      continue
    fi
    
    # Confirm password
    local confirm_password
    echo -e "${CYAN}Confirm password:${NC}"
    read -s confirm_password
    echo # Add newline after hidden input
    
    if [[ "$new_password" != "$confirm_password" ]]; then
      echo -e "${RED}❌ Passwords do not match${NC}"
      continue
    fi
    
    break
  done
  
  # Generate hash (ensure password is not exposed in process list)
  echo -e "${CYAN}🔒 Generating SHA-256 hash...${NC}"
  local password_hash
  password_hash=$(generate_password_hash "$new_password")
  
  # Clear password from memory for security
  new_password="CLEARED_FOR_SECURITY"
  confirm_password="CLEARED_FOR_SECURITY"
  
  if [[ -z "$password_hash" ]]; then
    echo -e "${RED}❌ Failed to generate password hash${NC}"
    return
  fi
  
  echo -e "${GREEN}✅ Password hash generated: ${password_hash:0:16}...${NC}"
  
  # Create backup
  cp admin.html admin.html.backup
  echo -e "${CYAN}📋 Backup created: admin.html.backup${NC}"
  
  # Update admin.html with new hash
  local new_line="const ADMIN_PASSWORD_HASH = '$password_hash'; // SHA-256 of '$new_password'"
  
  if sed -i "s|const ADMIN_PASSWORD_HASH = '[^']*';.*|$new_line|g" admin.html; then
    echo -e "${GREEN}✅ admin.html updated successfully${NC}"
    
    # Verify the change
    if grep -q "$password_hash" admin.html; then
      echo -e "${GREEN}✅ Password hash verified in admin.html${NC}"
      echo -e "${CYAN}🔐 New admin password has been set successfully!${NC}"
      echo -e "${CYAN}🔗 Access admin at: http://localhost:${PORT:-80}/admin.html${NC}"
      
      # Optionally remove backup
      if gum_confirm "Remove backup file (admin.html.backup)?"; then
        rm admin.html.backup
        echo -e "${GREEN}✅ Backup file removed${NC}"
      fi
    else
      echo -e "${RED}❌ Failed to verify password update${NC}"
      echo -e "${CYAN}Restoring from backup...${NC}"
      mv admin.html.backup admin.html
    fi
  else
    echo -e "${RED}❌ Failed to update admin.html${NC}"
    echo -e "${CYAN}Restoring from backup...${NC}"
    mv admin.html.backup admin.html
  fi
  
  # Re-enable bash history
  set -o history
  
  echo
}

# Setup environment configuration
setup_environment() {
  gum_style "🔧 Environment Configuration"
  
  # Port configuration
  PORT=$(gum_input "Port for server")
  if [[ -z "$PORT" ]]; then
    echo -e "${YELLOW}No port specified, using default 80${NC}"
    PORT=80
  fi
  
  # Environment selection
  if gum_confirm "Setup for production environment?"; then
    ENV_TYPE="production"
  else
    ENV_TYPE="development"
  fi
  
  # Analytics configuration
  if gum_confirm "Enable Google Analytics tracking?"; then
    GA_ID=$(gum_input "Google Analytics ID (GA-XXXXX)")
    ENABLE_ANALYTICS="true"
  else
    GA_ID=""
    ENABLE_ANALYTICS="false"
  fi
  
  # Create environment file
  cat > .env << EOF
# Server Configuration
PORT=$PORT

# Environment
NODE_ENV=$ENV_TYPE

# Analytics
ENABLE_ANALYTICS=$ENABLE_ANALYTICS
GA_TRACKING_ID=$GA_ID

# Production Features
ENABLE_LOGGING=true
ENABLE_MONITORING=true
ENABLE_ERROR_REPORTING=true
ENABLE_HEALTH_CHECKS=true
ENABLE_SERVICE_WORKER=true

# Performance
ENABLE_COMPRESSION=true
ENABLE_CACHING=true

# Security
ENABLE_SECURITY_HEADERS=true
EOF
  
  gum_style "✅ Environment configured and saved to .env"
  echo
}

# Install dependencies
install_dependencies() {
  gum_style "📦 Installing Dependencies"
  
  if gum_confirm "Install/update Node dependencies?"; then
    gum_spin "Installing dependencies" "npm install"
    echo -e "${GREEN}✅ Dependencies installed successfully${NC}"
  fi
  
  # Install development dependencies if in dev mode
  if [[ "$ENV_TYPE" == "development" ]] && gum_confirm "Install development dependencies (ESLint, Jest, etc.)?"; then
    gum_spin "Installing dev dependencies" "npm install --save-dev"
    echo -e "${GREEN}✅ Development dependencies installed${NC}"
  fi
  
  echo
}

# Validate production systems
validate_production_systems() {
  gum_style "🔍 Validating Production Systems"
  
  echo -e "${CYAN}Checking production components...${NC}"
  
  # Check if all production files exist
  local prod_files=(
    "src/utils/logger.js"
    "src/utils/alerts.js"
    "src/utils/errorHandler.js"
    "src/utils/performance.js"
    "src/utils/health.js"
    "src/utils/environment.js"
    "src/production.js"
    "sw.js"
  )
  
  local missing_files=()
  for file in "${prod_files[@]}"; do
    if [[ -f "$file" ]]; then
      echo -e "${GREEN}✓ $file${NC}"
    else
      echo -e "${RED}✗ $file${NC}"
      missing_files+=("$file")
    fi
  done
  
  if [ ${#missing_files[@]} -ne 0 ]; then
    echo -e "${RED}❌ Missing production files: ${missing_files[*]}${NC}"
    return 1
  fi
  
  echo -e "${GREEN}✅ All production systems are present${NC}"
  echo
}

# Run tests
run_tests() {
  gum_style "🧪 Running Tests"
  
  if gum_confirm "Run the test suite?"; then
    gum_spin "Running tests" "npm test"
    echo -e "${GREEN}✅ Tests completed${NC}"
  fi
  
  if gum_confirm "Run code quality checks (ESLint)?"; then
    gum_spin "Running linter" "npm run lint"
    echo -e "${GREEN}✅ Code quality checks completed${NC}"
  fi
  
  echo
}

# Security audit
security_audit() {
  gum_style "🔒 Security Audit"
  
  if gum_confirm "Run npm security audit?"; then
    gum_spin "Running security audit" "npm audit || true"
    echo -e "${GREEN}✅ Security audit completed${NC}"
  fi
  
  echo
}

# Docker setup
docker_setup() {
  if command -v docker >/dev/null 2>&1; then
    gum_style "🐳 Docker Setup"
    
    # Test Docker daemon connection
    if ! docker info >/dev/null 2>&1; then
      echo -e "${YELLOW}⚠ Docker is installed but daemon is not accessible${NC}"
      echo -e "${CYAN}Possible solutions:${NC}"
      echo -e "${CYAN}1. Start Docker daemon: sudo systemctl start docker${NC}"
      echo -e "${CYAN}2. Add user to docker group: sudo usermod -aG docker \$USER${NC}"
      echo -e "${CYAN}3. Restart your session after adding to docker group${NC}"
      echo -e "${CYAN}4. Try running with sudo: sudo docker build -t dichoptic-therapy-games .${NC}"
      echo
      echo -e "${YELLOW}Skipping Docker setup for now...${NC}"
      return
    fi
    
    if gum_confirm "Build Docker image for production?"; then
      if gum_spin "Building Docker image" "docker build -t dichoptic-therapy-games ."; then
        echo -e "${GREEN}✅ Docker image built successfully${NC}"
      else
        echo -e "${RED}❌ Docker build failed${NC}"
        echo -e "${CYAN}You can try building manually with: docker build -t dichoptic-therapy-games .${NC}"
        return
      fi
    fi
    
    if gum_confirm "Setup Docker Compose for full production stack?"; then
      if [[ -f "docker-compose.yml" ]]; then
        if gum_spin "Starting Docker Compose stack" "docker-compose up -d"; then
          echo -e "${GREEN}✅ Production stack is running${NC}"
          echo -e "${CYAN}Access the application at: http://localhost:$PORT${NC}"
          echo -e "${CYAN}Health check: http://localhost:$PORT/health${NC}"
          echo -e "${CYAN}Metrics: http://localhost:$PORT/metrics${NC}"
        else
          echo -e "${RED}❌ Docker Compose failed to start${NC}"
          echo -e "${CYAN}You can try manually with: docker-compose up -d${NC}"
        fi
      else
        echo -e "${YELLOW}⚠ docker-compose.yml not found${NC}"
      fi
    fi
    
    echo
  else
    echo -e "${YELLOW}⚠ Docker not found. Install Docker for containerized deployment.${NC}"
  fi
}

# Machine info
save_machine_info() {
  gum_style "💻 Machine Information"
  
  if gum_confirm "Save machine info to machine_info.txt?"; then
    {
      echo "=== Machine Setup Information ==="
      echo "Date: $(date)"
      echo "OS: $(uname -a)"
      echo "Node: $(node -v 2>/dev/null || echo 'Not installed')"
      echo "npm: $(npm -v 2>/dev/null || echo 'Not installed')"
      echo "Docker: $(docker --version 2>/dev/null || echo 'Not installed')"
      echo "Docker Compose: $(docker-compose --version 2>/dev/null || echo 'Not installed')"
      echo "Git commit: $(git rev-parse --short HEAD 2>/dev/null || echo 'N/A')"
      echo "Environment: $ENV_TYPE"
      echo "Port: $PORT"
      echo ""
      echo "=== Production Features Enabled ==="
      echo "Logging: ✅"
      echo "Monitoring: ✅"
      echo "Error Handling: ✅"
      echo "Health Checks: ✅"
      echo "Performance Tracking: ✅"
      echo "Alert System: ✅"
      echo "Service Worker: ✅"
      echo "Analytics: $ENABLE_ANALYTICS"
    } > machine_info.txt
    echo -e "${GREEN}✅ Machine info saved to machine_info.txt${NC}"
  fi
  
  echo
}

# Helper function to find available port
find_available_port() {
  local start_port=${1:-80}
  local port=$start_port
  
  while [[ $port -lt 65535 ]]; do
    if ! (netstat -tln 2>/dev/null | grep -q ":${port} " || ss -tln 2>/dev/null | grep -q ":${port} "); then
      echo "$port"
      return 0
    fi
    ((port++))
  done
  
  echo "9999"  # fallback port
}

# Dedicated server menu function
start_server_menu() {
  gum_style "🚀 Server Options"
  
  echo -e "${CYAN}Choose how you want to start the server:${NC}"
  echo
  
  # Check if PORT is set, if not ask for it
  if [[ -z "${PORT:-}" ]]; then
    echo -e "${YELLOW}Port not configured. Let's set one first.${NC}"
    PORT=$(gum_input "Enter port number for server")
    if [[ -z "$PORT" ]]; then
      echo -e "${YELLOW}No port specified, using default 80${NC}"
      PORT=80
    fi
    echo -e "${GREEN}Using port: $PORT${NC}"
    echo
  fi
  
  if command -v gum >/dev/null 2>&1; then
    # Use gum for interactive selection
    server_option=$(gum choose --header "Choose server option:" \
      "🌐 Simple HTTP Server (Python/npx)" \
      "🐳 Docker Container (Production)" \
      "⚡ Development Server (npm start)" \
      "🔧 Change Port Number" \
      "❌ Cancel")
    
    case "$server_option" in
      "🌐 Simple HTTP Server (Python/npx)")
        # Check if port is available before starting
        if netstat -tln 2>/dev/null | grep -q ":${PORT} " || ss -tln 2>/dev/null | grep -q ":${PORT} "; then
          echo -e "${RED}❌ Port ${PORT} is already in use!${NC}"
          
          # Suggest alternative ports
          alt_port=$(find_available_port $((PORT + 1)))
          echo -e "${CYAN}Suggested alternative port: ${alt_port}${NC}"
          echo -e "${CYAN}Or choose a different port, or stop the service using port ${PORT}.${NC}"
          echo
          
          if gum_confirm "Would you like to use port ${alt_port}?"; then
            PORT="$alt_port"
            echo -e "${GREEN}Using port: $PORT${NC}"
          elif gum_confirm "Would you like to choose a different port?"; then
            PORT=$(gum_input "Enter new port number")
            if [[ -n "$PORT" ]]; then
              echo -e "${GREEN}Trying port: $PORT${NC}"
            else
              echo -e "${RED}No port specified, cancelling...${NC}"
              return
            fi
          else
            return
          fi
        fi
        
        echo -e "${GREEN}🌐 Starting simple HTTP server at http://localhost:${PORT}${NC}"
        echo -e "${YELLOW}Press Ctrl+C to stop the server${NC}"
        echo
        if command -v python3 >/dev/null 2>&1; then
          python3 -m http.server "${PORT}"
        elif command -v npx >/dev/null 2>&1; then
          npx http-server -p "${PORT}"
        else
          echo -e "${RED}Neither python3 nor npx found to run a server.${NC}"
        fi
        ;;
      "🐳 Docker Container (Production)")
        # Check if port is available before starting
        if netstat -tln 2>/dev/null | grep -q ":${PORT} " || ss -tln 2>/dev/null | grep -q ":${PORT} "; then
          echo -e "${RED}❌ Port ${PORT} is already in use!${NC}"
          
          # Suggest alternative ports
          alt_port=$(find_available_port $((PORT + 1)))
          echo -e "${CYAN}Suggested alternative port: ${alt_port}${NC}"
          echo -e "${CYAN}Or choose a different port, or stop the service using port ${PORT}.${NC}"
          echo
          
          if gum_confirm "Would you like to use port ${alt_port}?"; then
            PORT="$alt_port"
            echo -e "${GREEN}Using port: $PORT${NC}"
          elif gum_confirm "Would you like to choose a different port?"; then
            PORT=$(gum_input "Enter new port number")
            if [[ -n "$PORT" ]]; then
              echo -e "${GREEN}Trying port: $PORT${NC}"
            else
              echo -e "${RED}No port specified, cancelling...${NC}"
              return
            fi
          else
            return
          fi
        fi
        
        if command -v docker >/dev/null 2>&1; then
          echo -e "${GREEN}🐳 Starting production Docker container at http://localhost:${PORT}${NC}"
          echo -e "${YELLOW}Press Ctrl+C to stop the container${NC}"
          echo
          docker run -p "${PORT}:80" dichoptic-therapy-games
        else
          echo -e "${RED}Docker not available${NC}"
          echo -e "${CYAN}Install Docker to use containerized deployment${NC}"
        fi
        ;;
      "⚡ Development Server (npm start)")
        if [[ -f "package.json" ]] && grep -q "\"start\"" package.json; then
          echo -e "${GREEN}⚡ Starting development server${NC}"
          echo -e "${YELLOW}Press Ctrl+C to stop the server${NC}"
          echo -e "${CYAN}Note: Development server port may be configured in package.json${NC}"
          echo
          npm start
        else
          echo -e "${YELLOW}No development server script found in package.json${NC}"
          echo -e "${CYAN}Add a 'start' script to package.json to use this option${NC}"
        fi
        ;;
      "🔧 Change Port Number")
        PORT=$(gum_input "Enter new port number")
        if [[ -n "$PORT" ]]; then
          echo -e "${GREEN}Port changed to: $PORT${NC}"
          echo
          # Recursively call the menu with the new port
          start_server_menu
        else
          echo -e "${RED}No port specified${NC}"
        fi
        ;;
      "❌ Cancel")
        echo -e "${YELLOW}Server startup cancelled.${NC}"
        ;;
    esac
  else
    # Fallback for systems without gum
    echo "Current port: ${PORT}"
    echo "Server Options:"
    echo "1) Simple HTTP Server (port ${PORT})"
    echo "2) Docker Container (port ${PORT})"
    echo "3) Development Server (npm start)"
    echo "4) Change Port Number"
    echo "5) Cancel"
    echo
    read -p "Enter choice (1-5): " choice
    
    case $choice in
      1)
        # Check if port is available before starting
        if netstat -tln 2>/dev/null | grep -q ":${PORT} " || ss -tln 2>/dev/null | grep -q ":${PORT} "; then
          echo -e "${RED}❌ Port ${PORT} is already in use!${NC}"
          
          # Suggest alternative ports
          alt_port=$(find_available_port $((PORT + 1)))
          echo -e "${CYAN}Suggested alternative port: ${alt_port}${NC}"
          echo -e "${CYAN}Or choose a different port, or stop the service using port ${PORT}.${NC}"
          echo
          
          read -p "Use port ${alt_port}? (y/n) or enter new port number: " response
          if [[ "$response" =~ ^[Yy]$ ]]; then
            PORT="$alt_port"
            echo -e "${GREEN}Using port: $PORT${NC}"
          elif [[ "$response" =~ ^[0-9]+$ ]]; then
            PORT="$response"
            echo -e "${GREEN}Trying port: $PORT${NC}"
          elif [[ -n "$response" ]]; then
            PORT="$response"
            echo -e "${GREEN}Trying port: $PORT${NC}"
          else
            echo -e "${RED}Cancelled${NC}"
            return
          fi
        fi
        
        echo -e "${GREEN}🌐 Starting simple HTTP server at http://localhost:${PORT}${NC}"
        echo -e "${YELLOW}Press Ctrl+C to stop the server${NC}"
        echo
        if command -v python3 >/dev/null 2>&1; then
          python3 -m http.server "${PORT}"
        elif command -v npx >/dev/null 2>&1; then
          npx http-server -p "${PORT}"
        else
          echo -e "${RED}Neither python3 nor npx found to run a server.${NC}"
        fi
        ;;
      2)
        # Check if port is available before starting
        if netstat -tln 2>/dev/null | grep -q ":${PORT} " || ss -tln 2>/dev/null | grep -q ":${PORT} "; then
          echo -e "${RED}❌ Port ${PORT} is already in use!${NC}"
          
          # Suggest alternative ports
          alt_port=$(find_available_port $((PORT + 1)))
          echo -e "${CYAN}Suggested alternative port: ${alt_port}${NC}"
          echo -e "${CYAN}Or choose a different port, or stop the service using port ${PORT}.${NC}"
          echo
          
          read -p "Use port ${alt_port}? (y/n) or enter new port number: " response
          if [[ "$response" =~ ^[Yy]$ ]]; then
            PORT="$alt_port"
            echo -e "${GREEN}Using port: $PORT${NC}"
          elif [[ "$response" =~ ^[0-9]+$ ]]; then
            PORT="$response"
            echo -e "${GREEN}Trying port: $PORT${NC}"
          elif [[ -n "$response" ]]; then
            PORT="$response"
            echo -e "${GREEN}Trying port: $PORT${NC}"
          else
            echo -e "${RED}Cancelled${NC}"
            return
          fi
        fi
        
        if command -v docker >/dev/null 2>&1; then
          echo -e "${GREEN}🐳 Starting production Docker container at http://localhost:${PORT}${NC}"
          echo -e "${YELLOW}Press Ctrl+C to stop the container${NC}"
          echo
          docker run -p "${PORT}:80" dichoptic-therapy-games
        else
          echo -e "${RED}Docker not available${NC}"
          echo -e "${CYAN}Install Docker to use containerized deployment${NC}"
        fi
        ;;
      3)
        if [[ -f "package.json" ]] && grep -q "\"start\"" package.json; then
          echo -e "${GREEN}⚡ Starting development server${NC}"
          echo -e "${YELLOW}Press Ctrl+C to stop the server${NC}"
          echo -e "${CYAN}Note: Development server port may be configured in package.json${NC}"
          echo
          npm start
        else
          echo -e "${YELLOW}No development server script found in package.json${NC}"
          echo -e "${CYAN}Add a 'start' script to package.json to use this option${NC}"
        fi
        ;;
      4)
        read -p "Enter new port number: " new_port
        if [[ -n "$new_port" ]]; then
          PORT="$new_port"
          echo -e "${GREEN}Port changed to: $PORT${NC}"
          echo
          # Recursively call the menu with the new port
          start_server_menu
        else
          echo -e "${RED}No port specified${NC}"
        fi
        ;;
      5|"")
        echo -e "${YELLOW}Server startup cancelled.${NC}"
        ;;
      *)
        echo -e "${RED}Invalid choice.${NC}"
        ;;
    esac
  fi
}

# Development server
# Setup completion
setup_complete() {
  gum_style "🎉 Setup Complete!"
  
  echo -e "${GREEN}✅ Dichoptic Therapy Games is ready for production!${NC}"
  echo
  echo -e "${CYAN}📁 Production Features Available:${NC}"
  echo -e "  • Comprehensive logging system"
  echo -e "  • Real-time performance monitoring"
  echo -e "  • Global error handling and recovery"
  echo -e "  • Browser compatibility checks"
  echo -e "  • Professional alert system"
  echo -e "  • Offline capability via service worker"
  echo -e "  • Docker containerization"
  echo -e "  • CI/CD pipeline ready"
  echo
  echo -e "${CYAN}🔗 Quick Commands:${NC}"
  echo -e "  • ${YELLOW}npm start${NC}        - Start development server"
  echo -e "  • ${YELLOW}npm test${NC}         - Run test suite"
  echo -e "  • ${YELLOW}npm run lint${NC}     - Check code quality"
  echo -e "  • ${YELLOW}npm run build${NC}    - Build for production"
  echo -e "  • ${YELLOW}docker-compose up${NC} - Start full production stack"
  echo -e "  • ${YELLOW}./scripts/validate-setup.sh${NC} - Validate setup"
  echo
  echo -e "${CYAN}📊 Monitoring:${NC}"
  echo -e "  • Health check: ${YELLOW}http://localhost:$PORT/health${NC}"
  echo -e "  • Metrics: ${YELLOW}http://localhost:$PORT/metrics${NC}"
  echo -e "  • Application: ${YELLOW}http://localhost:$PORT${NC}"
  echo
  
  # Ask if user wants to start the server immediately
  echo -e "${CYAN}🚀 Start Server Now?${NC}"
  echo "Would you like to start the server immediately?"
  echo
  
  if gum_confirm "Start a server now?"; then
    start_server_menu
  else
    echo -e "${GREEN}Setup completed successfully! Happy coding! 🚀${NC}"
  fi
}

# Main execution
main() {
  check_requirements
  setup_environment
  install_dependencies
  validate_production_systems
  run_tests
  security_audit
  docker_setup
  save_machine_info
  setup_complete
}

# Check if running with admin password flag
if [[ "${1:-}" == "--admin-password" ]] || [[ "${1:-}" == "-p" ]]; then
  echo "🔐 Admin Password Manager"
  echo "========================"
  echo
  
  if [[ ! -f "admin.html" ]]; then
    echo "❌ admin.html not found in current directory"
    echo "Please run this script from the project root directory"
    exit 1
  fi
  
  # Check current password status
  echo "Current password status:"
  if grep -q "ADMIN_PASSWORD_HASH" admin.html; then
    current_hash=$(grep "ADMIN_PASSWORD_HASH" admin.html | head -1 | sed "s/.*ADMIN_PASSWORD_HASH = '\([^']*\)'.*/\1/")
    echo "✅ Password hash found: ${current_hash:0:16}..."
    
    # Check if it's the default password
    default_hash="ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f"
    if [[ "$current_hash" == "$default_hash" ]]; then
      echo "⚠ Currently using default password 'admin123'"
      echo "⚠ It's recommended to change this for security"
    else
      echo "✅ Using custom password"
    fi
  else
    echo "❌ No password hash found in admin.html"
    exit 1
  fi
  
  echo
  echo "To change the password, use: ./change-admin-password.sh"
  echo "This provides a secure way to update your admin credentials."
  echo
  exit 0
fi

# Run the setup flow
run_setup "${@:-}"
