#!/usr/bin/env node

/**
 * Docker Health Check Script
 * Performs comprehensive health checks for the containerized application
 */

const http = require('http');
const fs = require('fs');

const HEALTH_CHECK_PORT = 80;
const HEALTH_CHECK_PATH = '/health';
const TIMEOUT = 3000;

async function performHealthCheck() {
  try {
    console.log('Starting health check...');
    
    // Check 1: HTTP endpoint availability
    await checkHttpEndpoint();
    
    // Check 2: Essential files existence
    await checkEssentialFiles();
    
    // Check 3: Nginx process
    await checkNginxProcess();
    
    console.log('✅ Health check passed');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
    process.exit(1);
  }
}

function checkHttpEndpoint() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: HEALTH_CHECK_PORT,
      path: HEALTH_CHECK_PATH,
      method: 'GET',
      timeout: TIMEOUT
    };

    const req = http.request(options, (res) => {
      if (res.statusCode === 200) {
        console.log('✓ HTTP endpoint responsive');
        resolve();
      } else {
        reject(new Error(`HTTP endpoint returned status ${res.statusCode}`));
      }
    });

    req.on('error', (error) => {
      reject(new Error(`HTTP request failed: ${error.message}`));
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('HTTP request timed out'));
    });

    req.end();
  });
}

async function checkEssentialFiles() {
  const essentialFiles = [
    '/usr/share/nginx/html/index.html',
    '/usr/share/nginx/html/memory_game.html',
    '/usr/share/nginx/html/game.js',
    '/usr/share/nginx/html/styles.css',
    '/usr/share/nginx/html/src/production.js'
  ];

  for (const file of essentialFiles) {
    try {
      await fs.promises.access(file, fs.constants.F_OK);
    } catch (error) {
      throw new Error(`Essential file missing: ${file}`);
    }
  }
  
  console.log('✓ Essential files present');
}

async function checkNginxProcess() {
  try {
    const { exec } = require('child_process');
    
    return new Promise((resolve, reject) => {
      exec('pgrep nginx', (error, stdout, stderr) => {
        if (error) {
          reject(new Error('Nginx process not running'));
        } else if (stdout.trim()) {
          console.log('✓ Nginx process running');
          resolve();
        } else {
          reject(new Error('Nginx process not found'));
        }
      });
    });
  } catch (error) {
    throw new Error(`Process check failed: ${error.message}`);
  }
}

// Run health check
performHealthCheck();
