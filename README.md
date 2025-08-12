# Dichoptic Therapy Games - Production Ready

A production-ready browser-based therapeutic memory card game designed for dichoptic treatment of diplopia or amblyopia using red-green anaglyph glasses. This application features comprehensive logging, monitoring, error handling, and enterprise-grade reliability.

## 🚀 Production Features

### Core Production Systems

- **Comprehensive Logging System** - Structured logging with multiple levels and export capabilities
- **Advanced Error Handling** - Graceful error recovery with user-friendly messages
- **Performance Monitoring** - Real-time performance tracking and optimization alerts
- **Health Checking** - Continuous system health monitoring and status reporting
- **Alert System** - Professional notification system replacing browser alerts
- **Environment Configuration** - Multi-environment support with feature flags

### Infrastructure & Deployment

- **Docker Containerization** - Production-ready Docker setup with health checks
- **CI/CD Pipeline** - Automated testing, building, and deployment with GitHub Actions
- **Service Worker** - Offline capability and performance optimization
- **Load Balancing Ready** - Nginx configuration for production deployment
- **Monitoring Stack** - Prometheus and Grafana integration for metrics
- **Security Hardened** - Security headers, CSP, and vulnerability scanning

### Quality Assurance

- **Comprehensive Testing** - Unit tests, integration tests, and end-to-end testing
- **Code Quality** - ESLint configuration with production-grade rules
- **Performance Auditing** - Lighthouse CI integration for performance monitoring
- **Security Scanning** - Automated vulnerability detection and reporting
- **Accessibility Compliance** - WCAG guidelines implementation

## 📋 Requirements

This game implements dichoptic therapy principles based on the [Requirements Document](requiermet_documentatin.md):

- Separate images to each eye via red-green glasses
- Engaging game mechanics for binocular coordination
- Adjustable contrast and brightness for each eye
- Production-grade reliability and monitoring

## 🛠 Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Build System**: Node.js, npm, ESLint, Jest
- **Containerization**: Docker, Docker Compose
- **Web Server**: Nginx with production optimizations
- **Monitoring**: Prometheus, Grafana, Lighthouse CI
- **CI/CD**: GitHub Actions with automated testing and deployment
- **Security**: Snyk vulnerability scanning, security headers

## 🚀 Quick Start

### One-Command Setup (Recommended)

Clone the repository and run the automated setup script:

```bash
git clone https://github.com/Onr/Dichoptic_Therapy_Games.git
cd Dichoptic_Therapy_Games
chmod +x setup.sh
./setup.sh
```

The setup script will:

- ✅ Check all system requirements (Node.js, Docker, etc.)
- ✅ Install all dependencies and production modules
- ✅ Configure environment settings (.env file)
- ✅ Validate all production systems (logging, monitoring, etc.)
- ✅ Run comprehensive test suite
- ✅ Perform security audit
- ✅ Build Docker images (optional)
- ✅ Start production stack with monitoring
- ✅ Generate machine info and deployment status

### Manual Setup (Alternative)

If you prefer manual setup or need to troubleshoot:

#### Prerequisites

- Node.js (v16+ recommended)
- npm (latest version)
- Docker & Docker Compose (optional, for production stack)
- Git

#### Installation Steps

```bash
# Clone the repository
git clone https://github.com/Onr/Dichoptic_Therapy_Games.git
cd Dichoptic_Therapy_Games

# Run automated setup
./setup.sh

# Or manual setup:
npm install
npm test
npm run serve
```

### What You Get After Setup

The automated setup configures a complete production environment:

#### 🔧 **Production Systems**

- **Logger System**: Structured logging with session tracking
- **Performance Monitor**: Real-time FPS, memory, and performance tracking
- **Error Handler**: Global error capture with recovery strategies
- **Health Checker**: Browser compatibility and connectivity monitoring
- **Alert System**: Professional UI notifications (replaces browser alerts)
- **Environment Config**: Feature flags and environment-specific settings

#### 🏗️ **Infrastructure Ready**

- **Docker Images**: Production-optimized containers with health checks
- **Nginx Configuration**: Load balancer ready with security headers
- **Service Worker**: Offline capability and intelligent caching
- **CI/CD Pipeline**: GitHub Actions for automated testing and deployment
- **Monitoring Stack**: Prometheus/Grafana configuration included

#### 🧪 **Quality Assurance**

- **Test Suite**: 11+ tests covering all production modules
- **Code Quality**: ESLint with production-grade rules (0 errors)
- **Security Audit**: Automated vulnerability scanning
- **Performance Monitoring**: Lighthouse CI for performance tracking

#### 📊 **Monitoring & Observability**

- **Health Endpoint**: `http://localhost:8080/health`
- **Metrics Endpoint**: `http://localhost:8080/metrics`
- **Real-time Logs**: Browser console and exportable log files
- **Error Tracking**: Automatic error capture and reporting

### Production Deployment

```bash
# Using deployment script (recommended)
./scripts/deploy.sh

# Or using Docker Compose
docker-compose up -d

# Or manual Docker build
docker build -t dichoptic-therapy-games .
docker run -p 8080:80 dichoptic-therapy-games
```

## 📊 Production Monitoring

### Health Dashboard

Access the health dashboard in development mode:

- Press `Ctrl+Shift+H` to toggle health dashboard
- View system status, performance metrics, and alerts

### Logging and Debugging

- Press `Ctrl+Shift+L` to export logs
- Press `Ctrl+Shift+P` to export performance report
- Press `Ctrl+Shift+D` to toggle debug mode

### Production Endpoints

- **Application**: http://localhost:8080/
- **Health Check**: http://localhost:8080/health
- **Metrics**: http://localhost:8080/metrics (when monitoring enabled)
- **Prometheus**: http://localhost:9090/ (if monitoring stack deployed)
- **Grafana**: http://localhost:3001/ (if monitoring stack deployed)

## 🧪 Testing

### Run All Tests

```bash
npm test                # Basic test suite
npm run test:watch      # Watch mode for development
npm run test:coverage   # Coverage report
```

### Quality Checks

```bash
npm run lint           # Code quality check
npm run lint:fix       # Auto-fix issues
npm run build          # Full build with checks
npm run production-check  # Production readiness
```

### Performance Testing

```bash
# Lighthouse CI (requires server running)
npm run serve &
npx lhci autorun
```

## 🔧 Configuration

### Environment Variables

```bash
NODE_ENV=production          # Environment mode
LOG_LEVEL=INFO              # Logging level
ENABLE_ANALYTICS=true       # Analytics toggle
ENABLE_MONITORING=true      # Monitoring toggle
PORT=8080                   # Server port
```

### Feature Flags

Feature flags can be controlled via localStorage or environment configuration:

- `enableLeaderboard` - Leaderboard functionality
- `enablePerformanceTracking` - Performance monitoring
- `enableBetaFeatures` - Experimental features
- `enableHighContrast` - Accessibility features

## 📈 Production Metrics

### Key Performance Indicators

- **Load Time**: Target < 2 seconds
- **Frame Rate**: Target > 30 FPS
- **Memory Usage**: Target < 100MB
- **Error Rate**: Target < 1%
- **Availability**: Target > 99.9%

### Monitoring Alerts

- Performance degradation warnings
- Error rate threshold breaches
- Memory usage spikes
- Health check failures
- Security vulnerability detection

## 🔒 Security

### Security Features

- Content Security Policy (CSP) headers
- XSS protection
- CSRF protection
- Input validation and sanitization
- Secure cookie handling
- Vulnerability scanning

### Security Scanning

```bash
npm run security-audit    # NPM audit
npm run snyk-test        # Snyk vulnerability scan
```

## 🌐 Deployment Options

### Docker Deployment

```bash
# Production deployment
docker-compose up -d

# Development with hot reload
docker-compose --profile dev up -d

# With monitoring stack
docker-compose --profile monitoring up -d
```

### Cloud Deployment

The application is ready for deployment on:

- **AWS**: ECS, EKS, or Elastic Beanstalk
- **Google Cloud**: Cloud Run, GKE, or App Engine
- **Azure**: Container Instances, AKS, or App Service
- **Heroku**: Container deployment ready

### CDN Integration

Static assets are optimized for CDN delivery:

- Gzip compression enabled
- Cache headers configured
- Asset fingerprinting ready

## 🔧 Troubleshooting

### Common Issues

**Application won't start:**

```bash
# Check logs
docker logs dichoptic-therapy-games

# Run health check
./scripts/deploy.sh health

# Check system requirements
npm run production-check
```

**Performance issues:**

```bash
# Check performance metrics
npm run analyze

# Generate performance report
# Access debug panel: Ctrl+Shift+P

# Monitor resource usage
docker stats
```

**Deployment failures:**

```bash
# Check deployment logs
cat deploy-*.log

# Rollback to previous version
./scripts/deploy.sh rollback

# Validate configuration
npm run build
```

## 📚 Development Guide

### Adding New Features

1. Create feature branch: `git checkout -b feature/new-feature`
2. Implement with tests: `npm run test:watch`
3. Check code quality: `npm run lint`
4. Update documentation
5. Submit pull request

### Production Deployment Process

1. **Development**: Feature development and testing
2. **Staging**: Integration testing and validation
3. **Production**: Automated deployment with health checks
4. **Monitoring**: Continuous monitoring and alerting

### Logging Best Practices

```javascript
// Use structured logging
Logger.info("Game started", {
  difficulty: "medium",
  userId: "12345",
});

// Log errors with context
Logger.error("Failed to save progress", {
  error: error.message,
  stack: error.stack,
  userId: "12345",
});
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Follow coding standards (ESLint configuration)
4. Add tests for new features
5. Ensure all checks pass: `npm run production-check`
6. Submit pull request with description

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Support

- **Documentation**: Full documentation in `/docs`
- **Issues**: GitHub Issues for bug reports
- **Discussions**: GitHub Discussions for questions
- **Email**: restin3@gmail.com for direct support

## 🏥 Medical Disclaimer

This application is designed for therapeutic purposes. Please consult with a healthcare professional before use as part of a treatment program.

---

**Built by Tal Bar Nizan & Ori Nizan** • Production-ready since 2025
