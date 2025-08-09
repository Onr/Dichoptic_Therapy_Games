#!/bin/bash

# Production Deployment Script for Dichoptic Therapy Games
# This script handles the complete deployment process with safety checks

set -euo pipefail

# Configuration
PROJECT_NAME="dichoptic-therapy-games"
VERSION=${1:-"latest"}
ENVIRONMENT=${2:-"production"}
BACKUP_DIR="./backups"
LOG_FILE="./deploy-$(date +%Y%m%d-%H%M%S).log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
    exit 1
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$LOG_FILE"
}

# Pre-deployment checks
pre_deployment_checks() {
    log "Starting pre-deployment checks..."
    
    # Check if Docker is running
    if ! docker info >/dev/null 2>&1; then
        error "Docker is not running or not accessible"
    fi
    
    # Check if required files exist
    local required_files=("package.json" "Dockerfile" "docker-compose.yml")
    for file in "${required_files[@]}"; do
        if [[ ! -f "$file" ]]; then
            error "Required file missing: $file"
        fi
    done
    
    # Check available disk space (require at least 1GB)
    local available_space=$(df -BG . | awk 'NR==2 {print $4}' | sed 's/G//')
    if [[ $available_space -lt 1 ]]; then
        error "Insufficient disk space. At least 1GB required."
    fi
    
    success "Pre-deployment checks passed"
}

# Backup current deployment
backup_current_deployment() {
    log "Creating backup of current deployment..."
    
    mkdir -p "$BACKUP_DIR"
    local backup_name="backup-$(date +%Y%m%d-%H%M%S)"
    
    # Backup configuration files
    tar -czf "$BACKUP_DIR/$backup_name.tar.gz" \
        --exclude=node_modules \
        --exclude=.git \
        --exclude=backups \
        . 2>/dev/null || warning "Some files could not be backed up"
    
    # Keep only last 5 backups
    ls -t "$BACKUP_DIR"/*.tar.gz 2>/dev/null | tail -n +6 | xargs -r rm
    
    success "Backup created: $backup_name.tar.gz"
}

# Build and test
build_and_test() {
    log "Building and testing application..."
    
    # Install dependencies
    npm ci --production=false
    
    # Run linting
    npm run lint || error "Linting failed"
    
    # Run tests
    npm run test || error "Tests failed"
    
    # Security audit
    npm audit --audit-level moderate || warning "Security audit found issues"
    
    # Build production assets
    npm run build || error "Build failed"
    
    success "Build and test completed successfully"
}

# Deploy with Docker
deploy_docker() {
    log "Deploying with Docker..."
    
    # Build Docker image
    docker build -t "$PROJECT_NAME:$VERSION" . || error "Docker build failed"
    
    # Tag as latest if this is a production deployment
    if [[ "$ENVIRONMENT" == "production" ]]; then
        docker tag "$PROJECT_NAME:$VERSION" "$PROJECT_NAME:latest"
    fi
    
    # Stop existing containers gracefully
    if docker ps -q --filter "name=$PROJECT_NAME" | grep -q .; then
        log "Stopping existing containers..."
        docker-compose down --timeout 30
    fi
    
    # Start new containers
    if [[ "$ENVIRONMENT" == "production" ]]; then
        docker-compose -f docker-compose.yml up -d
    else
        docker-compose -f docker-compose.yml --profile dev up -d
    fi
    
    success "Docker deployment completed"
}

# Health checks
post_deployment_health_checks() {
    log "Running post-deployment health checks..."
    
    local max_attempts=30
    local attempt=1
    
    while [[ $attempt -le $max_attempts ]]; do
        if curl -sf http://localhost:8080/health >/dev/null 2>&1; then
            success "Application is healthy and responding"
            return 0
        fi
        
        log "Health check attempt $attempt/$max_attempts failed, waiting..."
        sleep 10
        ((attempt++))
    done
    
    error "Application failed health checks after $max_attempts attempts"
}

# Smoke tests
run_smoke_tests() {
    log "Running smoke tests..."
    
    local base_url="http://localhost:8080"
    local endpoints=("/" "/memory_game.html" "/ball_game.html" "/static_ball_game.html")
    
    for endpoint in "${endpoints[@]}"; do
        local status_code=$(curl -s -o /dev/null -w "%{http_code}" "$base_url$endpoint")
        if [[ "$status_code" == "200" ]]; then
            log "✓ $endpoint - OK"
        else
            error "✗ $endpoint - Failed (HTTP $status_code)"
        fi
    done
    
    success "Smoke tests passed"
}

# Rollback function
rollback() {
    warning "Rolling back deployment..."
    
    # Find latest backup
    local latest_backup=$(ls -t "$BACKUP_DIR"/*.tar.gz 2>/dev/null | head -n1)
    
    if [[ -n "$latest_backup" ]]; then
        log "Restoring from backup: $latest_backup"
        
        # Stop current containers
        docker-compose down --timeout 30
        
        # Extract backup (you would typically restore to a separate directory first)
        warning "Manual intervention required for complete rollback"
        log "Backup available at: $latest_backup"
    else
        error "No backup found for rollback"
    fi
}

# Cleanup
cleanup() {
    log "Cleaning up..."
    
    # Remove old images
    docker image prune -f >/dev/null 2>&1 || true
    
    # Clean npm cache
    npm cache clean --force >/dev/null 2>&1 || true
    
    success "Cleanup completed"
}

# Main deployment function
main() {
    log "Starting deployment of $PROJECT_NAME version $VERSION to $ENVIRONMENT"
    
    # Set up error handling
    trap 'error "Deployment failed! Check logs: $LOG_FILE"' ERR
    
    pre_deployment_checks
    backup_current_deployment
    build_and_test
    deploy_docker
    post_deployment_health_checks
    run_smoke_tests
    cleanup
    
    success "🎉 Deployment completed successfully!"
    log "Application is available at: http://localhost:8080"
    log "Deployment log: $LOG_FILE"
}

# Handle script arguments
case "${1:-deploy}" in
    "deploy")
        main
        ;;
    "rollback")
        rollback
        ;;
    "health")
        post_deployment_health_checks
        ;;
    "test")
        run_smoke_tests
        ;;
    *)
        echo "Usage: $0 [deploy|rollback|health|test] [version] [environment]"
        echo "  deploy    - Run full deployment (default)"
        echo "  rollback  - Rollback to previous version"
        echo "  health    - Run health checks only"
        echo "  test      - Run smoke tests only"
        exit 1
        ;;
esac
