# HTTPS Setup Guide for Dichoptic Therapy Games

This guide provides comprehensive instructions for setting up HTTPS/SSL encryption for your Dichoptic Therapy Games application.

## 🔒 Quick Start

Run the setup script and choose the HTTPS options:

```bash
./setup.sh
```

Then select:
- **🚀 Start Server Only** → **🔒 HTTPS Server (SSL/TLS encrypted)**

Or for SSL certificate management:
- **🚀 Start Server Only** → **🔧 SSL Certificate Management**

## 📋 HTTPS Options Available

### 1. Development Setup (Self-Signed Certificate)
**Best for**: Local development, testing
**Security Level**: ⭐⭐ (Browser warnings expected)

```bash
./setup.sh
# Choose: SSL Certificate Management → Development (Self-signed certificate)
```

**Features**:
- ✅ Quick setup (< 1 minute)
- ✅ Works offline
- ✅ No external dependencies
- ⚠️ Browser security warnings
- ⚠️ Not suitable for production

### 2. Production Setup (Let's Encrypt)
**Best for**: Production servers with domain names
**Security Level**: ⭐⭐⭐⭐⭐ (Trusted by all browsers)

```bash
./setup.sh
# Choose: SSL Certificate Management → Production (Let's Encrypt certificate)
```

**Requirements**:
- Domain name pointing to your server
- Port 80 accessible from internet
- Valid email address

**Features**:
- ✅ Free trusted SSL certificates
- ✅ Automatic renewal available
- ✅ Recognized by all browsers
- ✅ 90-day validity (renewable)

### 3. Production Setup (Custom Certificate)
**Best for**: Enterprise environments with existing SSL infrastructure
**Security Level**: ⭐⭐⭐⭐⭐ (Depends on certificate authority)

```bash
./setup.sh
# Choose: SSL Certificate Management → Production (Use existing certificate files)
```

**Requirements**:
- SSL certificate file (.crt or .pem)
- Private key file (.key)
- Certificate chain (if applicable)

## 🚀 Server Options

### Node.js HTTPS Server (Recommended)
**File**: `https-server.js`
**Ports**: 3443 (HTTPS), 3080 (HTTP redirect)

```bash
node https-server.js
```

**Features**:
- ✅ HTTP to HTTPS automatic redirect
- ✅ Security headers (HSTS, XSS protection, etc.)
- ✅ Optimized caching
- ✅ Health check endpoint
- ✅ Graceful shutdown

### Python HTTPS Server (Alternative)
**File**: `https-server.py`
**Port**: 3443 (HTTPS only)

```bash
python3 https-server.py
```

**Features**:
- ✅ Simple setup
- ✅ Security headers
- ✅ No external dependencies
- ⚠️ No HTTP redirect (manual setup required)

## 📁 File Structure

```
project/
├── ssl/
│   ├── server.crt          # SSL certificate
│   └── server.key          # Private key
├── https-server.js         # Node.js HTTPS server
├── https-server.py         # Python HTTPS server
├── http-redirect.py        # HTTP to HTTPS redirect server
└── setup.sh               # Main setup script
```

## 🔧 Manual SSL Certificate Setup

### Self-Signed Certificate
```bash
# Create SSL directory
mkdir -p ssl

# Generate certificate
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout ssl/server.key \
  -out ssl/server.crt \
  -subj "/C=US/ST=Development/L=Local/O=Dichoptic Therapy Games/CN=localhost" \
  -addext "subjectAltName=DNS:localhost,DNS:127.0.0.1,IP:127.0.0.1"

# Set permissions
chmod 600 ssl/server.key
chmod 644 ssl/server.crt
```

### Let's Encrypt Certificate
```bash
# Install certbot (Ubuntu/Debian)
sudo apt-get install certbot

# Get certificate (replace example.com with your domain)
sudo certbot certonly --standalone \
  --preferred-challenges http \
  --email your-email@example.com \
  --agree-tos \
  --no-eff-email \
  -d example.com

# Copy to project directory
sudo cp /etc/letsencrypt/live/example.com/fullchain.pem ssl/server.crt
sudo cp /etc/letsencrypt/live/example.com/privkey.pem ssl/server.key

# Fix permissions
sudo chown $(whoami):$(whoami) ssl/server.*
chmod 600 ssl/server.key
chmod 644 ssl/server.crt
```

## 🌐 Browser Access

### Development (Self-Signed)
1. Navigate to `https://localhost:3443`
2. Browser shows security warning
3. Click **"Advanced"**
4. Click **"Proceed to localhost (unsafe)"**
5. Application loads with HTTPS

### Production (Trusted Certificate)
1. Navigate to `https://yourdomain.com`
2. Application loads immediately with green lock icon
3. No security warnings

## 🔄 Certificate Renewal

### Let's Encrypt Auto-Renewal
```bash
# Add to crontab
sudo crontab -e

# Add this line for automatic renewal
0 12 * * * /usr/bin/certbot renew --quiet

# Test renewal
sudo certbot renew --dry-run
```

### Manual Renewal
```bash
# Renew certificates
sudo certbot renew

# Copy new certificates
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem ssl/server.crt
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem ssl/server.key

# Restart server
# (Press Ctrl+C in server terminal, then restart)
```

## 🔍 Testing HTTPS Setup

### Certificate Validation
```bash
# Check certificate details
openssl x509 -in ssl/server.crt -text -noout

# Check private key
openssl rsa -in ssl/server.key -check

# Test HTTPS connection
curl -k https://localhost:3443/health
```

### Security Headers Test
```bash
# Check security headers
curl -I https://localhost:3443

# Expected headers:
# Strict-Transport-Security: max-age=31536000; includeSubDomains
# X-Frame-Options: SAMEORIGIN
# X-Content-Type-Options: nosniff
# X-XSS-Protection: 1; mode=block
```

## 🚨 Troubleshooting

### Common Issues

#### "Certificate not found" Error
```bash
# Check if certificates exist
ls -la ssl/

# Regenerate if missing
./setup.sh
# Choose: SSL Certificate Management
```

#### "Port already in use" Error
```bash
# Find process using port
sudo netstat -tlnp | grep :3443
# or
sudo ss -tlnp | grep :3443

# Kill process
sudo kill -9 <PID>

# Or use different port
# Edit https-server.js and change HTTPS_PORT value
```

#### Browser "Not Secure" Warning
```bash
# For self-signed certificates - this is normal
# Click "Advanced" → "Proceed to localhost (unsafe)"

# For production - check certificate validity
openssl x509 -in ssl/server.crt -noout -dates
```

#### Let's Encrypt Rate Limits
```bash
# Check rate limits
# https://letsencrypt.org/docs/rate-limits/

# Use staging environment for testing
sudo certbot certonly --staging --standalone -d yourdomain.com
```

## 🔐 Security Best Practices

### Production Checklist
- [ ] Use trusted SSL certificate (Let's Encrypt or commercial)
- [ ] Enable HSTS (handled automatically by our server)
- [ ] Regular certificate renewal setup
- [ ] Secure private key permissions (600)
- [ ] Firewall allows ports 80 and 443
- [ ] Regular security updates

### Development Checklist
- [ ] Use self-signed certificate for local testing
- [ ] Never use development certificates in production
- [ ] Test HTTPS functionality before deployment
- [ ] Verify HTTP to HTTPS redirects work

## 📞 Support

### Get Help
- Run diagnostic: `./diagnose-admin-password.sh`
- Check setup: `./setup.sh`
- View logs: Server terminal output
- Documentation: This file and README.md

### Common Commands
```bash
# Quick HTTPS start
node https-server.js

# Setup SSL certificates
./setup.sh
# Choose: SSL Certificate Management

# Check certificate expiry
openssl x509 -in ssl/server.crt -noout -dates

# Test HTTPS connection
curl -k https://localhost:3443/health
```

---

## 🎯 Quick Reference

| Task | Command |
|------|---------|
| Setup HTTPS | `./setup.sh` → HTTPS Server |
| Manage SSL | `./setup.sh` → SSL Certificate Management |
| Start HTTPS Server | `node https-server.js` |
| Check Certificate | `openssl x509 -in ssl/server.crt -text -noout` |
| Test Connection | `curl -k https://localhost:3443/health` |
| Renew Let's Encrypt | `sudo certbot renew` |

**Happy secure coding! 🔒🚀**
