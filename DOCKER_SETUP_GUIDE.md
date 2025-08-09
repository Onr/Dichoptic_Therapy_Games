# Docker Setup and Troubleshooting Guide

## 🐳 Docker Issue Resolution

### Problem: Docker Image Not Found
When you see this error:
```
Unable to find image 'dichoptic-therapy-games:latest' locally
docker: Error response from daemon: pull access denied for dichoptic-therapy-games, repository does not exist or may require 'docker login': denied: requested access to the resource is denied
```

**Root Cause**: The Docker image hasn't been built locally yet.

## ✅ Solutions Implemented

### 1. Updated Setup Script
The `setup.sh` script now:
- ✅ Checks if Docker image exists before trying to run it
- ✅ Offers to build the image automatically if missing
- ✅ Provides clear error messages and instructions
- ✅ Uses `--rm` flag to auto-cleanup containers

### 2. Docker Build Process
The setup script will now:
1. Check if `dichoptic-therapy-games` image exists
2. If not found, ask if you want to build it
3. Build the image using: `docker build -t dichoptic-therapy-games .`
4. Start the container after successful build

## 🛠 Manual Docker Setup

### Prerequisites Check
```bash
# Check if Docker is installed
docker --version

# Check if Docker daemon is running
docker ps

# If Docker daemon is not running:
sudo systemctl start docker

# Enable Docker to start on boot
sudo systemctl enable docker
```

### Build the Image Manually
```bash
cd /path/to/project
docker build -t dichoptic-therapy-games .
```

### Run the Container
```bash
# Run on port 80
docker run --rm -p 80:80 dichoptic-therapy-games

# Run on custom port (e.g., 8080)
docker run --rm -p 8080:80 dichoptic-therapy-games
```

## 🚨 Common Docker Issues

### Issue 1: Docker Daemon Not Running
**Symptoms**: 
- "Cannot connect to the Docker daemon"
- "Connection refused"

**Solutions**:
```bash
# Start Docker service
sudo systemctl start docker

# Check status
sudo systemctl status docker

# If still not working, restart Docker
sudo systemctl restart docker
```

### Issue 2: Permission Denied
**Symptoms**: 
- "permission denied while trying to connect to the Docker daemon socket"

**Solutions**:
```bash
# Add user to docker group
sudo usermod -aG docker $USER

# Log out and log back in, or restart session
newgrp docker

# Test Docker without sudo
docker ps
```

### Issue 3: Build Failures
**Symptoms**: 
- Docker build fails with various errors

**Solutions**:
```bash
# Check if all required files exist
ls -la Dockerfile docker/nginx.conf docker/healthcheck.js

# Try building with verbose output
docker build -t dichoptic-therapy-games . --progress=plain

# Clean Docker cache if needed
docker system prune -f
```

### Issue 4: Port Already in Use
**Symptoms**: 
- "Port is already allocated"
- "bind: address already in use"

**Solutions**:
```bash
# Find what's using the port
sudo netstat -tlnp | grep :80
# or
sudo ss -tlnp | grep :80

# Kill the process using the port
sudo kill -9 <PID>

# Or use a different port
docker run --rm -p 8080:80 dichoptic-therapy-games
```

## 🔧 Docker Commands Reference

### Image Management
```bash
# List all images
docker images

# Remove an image
docker rmi dichoptic-therapy-games

# Rebuild image (force)
docker build -t dichoptic-therapy-games . --no-cache
```

### Container Management
```bash
# List running containers
docker ps

# List all containers (including stopped)
docker ps -a

# Stop a running container
docker stop <container_id>

# Remove stopped containers
docker container prune
```

### Debugging
```bash
# View container logs
docker logs <container_id>

# Execute commands inside running container
docker exec -it <container_id> /bin/sh

# Check container health
docker inspect <container_id>
```

## 📋 Updated Setup Script Features

The `setup.sh` script now includes:

1. **Smart Image Detection**: Checks if Docker image exists before attempting to run
2. **Automatic Building**: Offers to build image if missing
3. **Better Error Handling**: Clear messages for Docker-related issues
4. **Clean Containers**: Uses `--rm` flag to auto-remove containers when stopped
5. **Port Conflict Detection**: Checks if ports are available before starting

## 🚀 Quick Start Commands

```bash
# Use the updated setup script (recommended)
./setup.sh

# Choose "🚀 Start Server Only" → "🐳 Docker Container (Production)"
# The script will handle building if needed

# Or build manually and run
docker build -t dichoptic-therapy-games .
docker run --rm -p 80:80 dichoptic-therapy-games
```

## 🔐 Production Notes

- The Docker container runs nginx with the application
- Health checks are built-in
- Logs are available via `docker logs`
- Container auto-removes when stopped (`--rm` flag)
- Nginx serves static files efficiently
- Port 80 inside container maps to your chosen external port

## 🆘 Emergency Recovery

If Docker setup is completely broken:
```bash
# Stop all containers
docker stop $(docker ps -aq)

# Remove all containers
docker rm $(docker ps -aq)

# Remove all images
docker rmi $(docker images -q)

# Clean everything
docker system prune -a

# Restart Docker service
sudo systemctl restart docker

# Rebuild from scratch
docker build -t dichoptic-therapy-games .
```
