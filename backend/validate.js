const fs = require('fs');
const path = require('path');
const http = require('http');

console.log('====================================================');
console.log('SMARTWAY AUTOMATED VALIDATION TEST');
console.log('====================================================');

const DATA_FILE = path.join(__dirname, 'data.json');
const SERVER_FILE = path.join(__dirname, 'server.js');

// 1. Check Files
if (!fs.existsSync(DATA_FILE)) {
  console.error('❌ FAILED: data.json database seed file is missing.');
  process.exit(1);
}
console.log('✅ PASS: data.json database seed file found.');

if (!fs.existsSync(SERVER_FILE)) {
  console.error('❌ FAILED: server.js server file is missing.');
  process.exit(1);
}
console.log('✅ PASS: server.js server file found.');

// 2. Validate data.json Schema
const db = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
const requiredKeys = ['users', 'staff', 'payroll', 'expenses', 'dogs', 'vehicles', 'income', 'activities'];
let schemaOk = true;

requiredKeys.forEach(key => {
  if (!db[key] || !Array.isArray(db[key])) {
    console.error(`❌ FAILED: Table "${key}" is missing or not an array.`);
    schemaOk = false;
  }
});

if (!schemaOk) {
  console.error('❌ FAILED: data.json schema validation failed.');
  process.exit(1);
}
console.log('✅ PASS: data.json schema structure is valid.');

// 3. Boot Server on Test Port and Validate HTTP API
const TEST_PORT = 3050;
process.env.PORT = TEST_PORT; // Override port

const app = require('./server.js'); // Imports the Express app
const server = app.listen(TEST_PORT, () => {
  console.log(`Test server started on http://localhost:${TEST_PORT}`);
});

// Give it 1 second to start
setTimeout(async () => {
  try {
    console.log('\nStarting API endpoints checks...');

    // A. Validate Auth Endpoint
    const authPayload = JSON.stringify({ username: 'Emre', password: '1234' });
    const authRes = await makeRequest(`http://localhost:${TEST_PORT}/api/auth/login`, 'POST', authPayload);
    
    if (!authRes || !authRes.success || authRes.user.role !== 'Admin') {
      throw new Error(`Auth endpoint failed: Unable to login as admin. Response: ${JSON.stringify(authRes)}`);
    }
    console.log('✅ PASS: /api/auth/login endpoint successful.');

    // B. Validate Staff API
    const staffRes = await makeRequest(`http://localhost:${TEST_PORT}/api/staff`, 'GET');
    if (!staffRes || !Array.isArray(staffRes)) {
      throw new Error('Staff list fetch failed: Invalid response format.');
    }
    console.log(`✅ PASS: /api/staff fetch returned ${staffRes.length} records.`);

    // C. Validate Calculations on Dashboard API
    const stats = await makeRequest(`http://localhost:${TEST_PORT}/api/dashboard/stats`, 'GET');
    if (!stats) {
      throw new Error('Dashboard statistics fetch failed.');
    }
    
    console.log('\nChecking Automated Calculations...');
    
    // Formula Checks:
    // Total Payroll = All net salaries in payroll table
    // Dog Expenses = food + medical
    // Vehicle Expenses = fuel + service + repair
    // Profit/Loss = Income - Expenses

    console.log(`- Active Staff Count: ${stats.totalStaff}`);
    console.log(`- Active Dogs Count: ${stats.totalDogs}`);
    console.log(`- Total Income calculated: $${stats.totalIncome}`);
    console.log(`- Total Expenses calculated: $${stats.totalExpenses}`);
    console.log(`- Profit/Loss calculated: $${stats.profitLoss}`);
    
    // Validate calculations match values
    const expectedProfit = stats.totalIncome - stats.totalExpenses;
    if (Math.abs(stats.profitLoss - expectedProfit) > 0.01) {
      throw new Error(`Formula mismatch: Profit ($${stats.profitLoss}) does not equal Income - Expenses ($${expectedProfit})`);
    }
    console.log('✅ PASS: Profit/Loss formula holds.');
    console.log('✅ PASS: Dashboard stats and calculations verification complete.');

    console.log('\n====================================================');
    console.log('🎉 ALL TESTS PASSED SUCCESSFULLY! SmartWay is ready.');
    console.log('====================================================');
    server.close();
    process.exit(0);

  } catch (err) {
    console.error('\n❌ VALIDATION TEST FAILED:', err);
    if (server) server.close();
    process.exit(1);
  }
}, 1500);

// Helper to make HTTP requests
function makeRequest(url, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port,
      path: parsedUrl.pathname + parsedUrl.search,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (body) {
      options.headers['Content-Length'] = Buffer.byteLength(body);
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(data);
        }
      });
    });

    req.on('error', (err) => reject(err));
    
    if (body) {
      req.write(body);
    }
    req.end();
  });
}
