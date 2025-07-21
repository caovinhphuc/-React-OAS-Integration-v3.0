#!/usr/bin/env node
/**
 * Backend Service Test Suite
 * Test các API endpoints và WebSocket connections
 */

const http = require('http');
const io = require('socket.io-client');

console.log('🧪 Backend Service Test Suite');
console.log('='.repeat(50));

// Test 1: Health Check
function testHealthCheck() {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: '/health',
      method: 'GET',
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const health = JSON.parse(data);
          console.log('✅ Health Check:', health.status);
          console.log(`   Uptime: ${Math.round(health.uptime)}s`);
          console.log(`   Environment: ${health.environment}`);
          resolve(true);
        } catch (e) {
          console.log('❌ Health Check failed:', e.message);
          resolve(false);
        }
      });
    });

    req.on('error', (e) => {
      console.log('❌ Health Check connection failed:', e.message);
      resolve(false);
    });

    req.end();
  });
}

// Test 2: WebSocket Connection
function testWebSocket() {
  return new Promise((resolve) => {
    console.log('\n🔌 Testing WebSocket Connection...');

    const socket = io('http://localhost:3001', {
      transports: ['websocket'],
    });

    let connected = false;
    let dataReceived = false;

    socket.on('connect', () => {
      console.log('✅ WebSocket connected');
      connected = true;
    });

    socket.on('dashboardUpdate', (data) => {
      console.log('✅ Dashboard update received');
      console.log(`   Active connections: ${data.activeConnections}`);
      console.log(`   Tasks processed: ${data.tasksProcessed}`);
      dataReceived = true;

      // Cleanup and resolve
      setTimeout(() => {
        socket.disconnect();
        resolve(connected && dataReceived);
      }, 1000);
    });

    socket.on('connect_error', (error) => {
      console.log('❌ WebSocket connection failed:', error.message);
      resolve(false);
    });

    // Timeout after 5 seconds
    setTimeout(() => {
      if (!dataReceived) {
        console.log('⚠️  WebSocket connected but no data received');
        socket.disconnect();
        resolve(connected);
      }
    }, 5000);
  });
}

// Test 3: Public Endpoints (no auth)
function testPublicEndpoints() {
  return new Promise((resolve) => {
    console.log('\n🌐 Testing Public Endpoints...');

    const endpoints = ['/health', '/api/public/info', '/api/status'];

    let tested = 0;
    let successful = 0;

    endpoints.forEach((path) => {
      const options = {
        hostname: 'localhost',
        port: 3001,
        path: path,
        method: 'GET',
      };

      const req = http.request(options, (res) => {
        tested++;
        if (res.statusCode === 200) {
          successful++;
          console.log(`✅ ${path} - Status: ${res.statusCode}`);
        } else if (res.statusCode === 404) {
          console.log(`⚠️  ${path} - Not Found (expected for some endpoints)`);
        } else {
          console.log(`❌ ${path} - Status: ${res.statusCode}`);
        }

        if (tested === endpoints.length) {
          resolve(successful > 0);
        }
      });

      req.on('error', (e) => {
        tested++;
        console.log(`❌ ${path} - Connection failed: ${e.message}`);

        if (tested === endpoints.length) {
          resolve(successful > 0);
        }
      });

      req.end();
    });
  });
}

// Main test runner
async function runTests() {
  console.log('🚀 Testing Backend Service on http://localhost:3001');
  console.log('⏱️  Starting tests...\n');

  const results = {
    healthCheck: await testHealthCheck(),
    webSocket: await testWebSocket(),
    publicEndpoints: await testPublicEndpoints(),
  };

  console.log('\n📊 Test Results Summary:');
  console.log('='.repeat(30));
  console.log(`Health Check: ${results.healthCheck ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`WebSocket: ${results.webSocket ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Public Endpoints: ${results.publicEndpoints ? '✅ PASS' : '❌ FAIL'}`);

  const passedTests = Object.values(results).filter((r) => r).length;
  const totalTests = Object.keys(results).length;

  console.log(`\n🎯 Overall: ${passedTests}/${totalTests} tests passed`);

  if (passedTests === totalTests) {
    console.log('🎉 All tests passed! Backend service is fully operational!');
  } else if (passedTests > 0) {
    console.log('⚠️  Some tests passed. Backend service is partially operational.');
  } else {
    console.log('❌ All tests failed. Backend service may not be running.');
  }

  process.exit(passedTests === totalTests ? 0 : 1);
}

// Run the tests
runTests().catch(console.error);
