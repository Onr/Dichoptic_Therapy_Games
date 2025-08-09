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

# Main setup header
gum_style "🎮 Dichoptic Therapy Games - Production Setup 🚀"

echo -e "${CYAN}This setup script will configure your machine for full production deployment${NC}"
echo -e "${CYAN}including all logging, monitoring, and infrastructure components.${NC}"
echo

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

# Setup environment configuration
setup_environment() {
  gum_style "🔧 Environment Configuration"
  
  # Port configuration
  PORT=$(gum_input "Port for server (default 8080)")
  PORT=${PORT:-8080}
  
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

# Development server
start_server() {
  gum_style "🚀 Server Options"
  
  local server_choice
  if gum_confirm "Start development server now?"; then
    echo -e "${CYAN}Choose server option:${NC}"
    echo "1. Simple HTTP server (Python/npx)"
    echo "2. Production build with nginx (Docker)"
    echo "3. Development server with hot reload"
    
    read -p "Enter choice (1-3): " server_choice
    
    case $server_choice in
      1)
        echo -e "${GREEN}🌐 Starting simple HTTP server at http://localhost:$PORT${NC}"
        if command -v python3 >/dev/null 2>&1; then
          python3 -m http.server "$PORT"
        elif command -v npx >/dev/null 2>&1; then
          npx http-server -p "$PORT"
        else
          echo -e "${RED}Neither python3 nor npx found to run a server.${NC}"
        fi
        ;;
      2)
        if command -v docker >/dev/null 2>&1; then
          echo -e "${GREEN}🐳 Starting production Docker container${NC}"
          docker run -p "$PORT:80" dichoptic-therapy-games
        else
          echo -e "${RED}Docker not available${NC}"
        fi
        ;;
      3)
        if [[ -f "package.json" ]] && grep -q "\"start\"" package.json; then
          echo -e "${GREEN}⚡ Starting development server${NC}"
          npm start
        else
          echo -e "${YELLOW}No development server script found${NC}"
        fi
        ;;
      *)
        echo -e "${YELLOW}Invalid choice${NC}"
        ;;
    esac
  fi
}

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
  echo -e "${GREEN}Happy coding! 🚀${NC}"
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
  start_server
  setup_complete
}

# Run main function
main "$@"
