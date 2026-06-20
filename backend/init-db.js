const db = require('./db');

const queries = [
  `CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50),
    name VARCHAR(100)
  )`,
  `CREATE TABLE IF NOT EXISTS staff (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    position VARCHAR(100),
    salary NUMERIC DEFAULT 0,
    "joinDate" VARCHAR(50),
    status VARCHAR(50) DEFAULT 'Active'
  )`,
  `CREATE TABLE IF NOT EXISTS payroll (
    id VARCHAR(50) PRIMARY KEY,
    "staffId" VARCHAR(50),
    "staffName" VARCHAR(255),
    month VARCHAR(20),
    "basicSalary" NUMERIC DEFAULT 0,
    overtime NUMERIC DEFAULT 0,
    bonus NUMERIC DEFAULT 0,
    deduction NUMERIC DEFAULT 0,
    "netSalary" NUMERIC DEFAULT 0
  )`,
  `CREATE TABLE IF NOT EXISTS expenses (
    id VARCHAR(50) PRIMARY KEY,
    date VARCHAR(50),
    category VARCHAR(100),
    "subCategory" VARCHAR(100),
    description TEXT,
    amount NUMERIC DEFAULT 0
  )`,
  `CREATE TABLE IF NOT EXISTS dogs (
    id VARCHAR(50) PRIMARY KEY,
    breed VARCHAR(100),
    age INTEGER,
    "vaccinationDate" VARCHAR(50),
    "foodExpense" NUMERIC DEFAULT 0,
    "medicalExpense" NUMERIC DEFAULT 0,
    status VARCHAR(50) DEFAULT 'Active'
  )`,
  `CREATE TABLE IF NOT EXISTS vehicles (
    id VARCHAR(50) PRIMARY KEY,
    driver VARCHAR(255),
    "fuelCost" NUMERIC DEFAULT 0,
    "serviceCost" NUMERIC DEFAULT 0,
    "repairCost" NUMERIC DEFAULT 0
  )`,
  `CREATE TABLE IF NOT EXISTS income (
    id VARCHAR(50) PRIMARY KEY,
    date VARCHAR(50),
    source VARCHAR(100),
    description TEXT,
    amount NUMERIC DEFAULT 0
  )`,
  `CREATE TABLE IF NOT EXISTS activities (
    id VARCHAR(50) PRIMARY KEY,
    timestamp VARCHAR(50),
    "user" VARCHAR(100),
    action TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS kitchen_daily (
    id VARCHAR(50) PRIMARY KEY,
    date VARCHAR(50),
    amount NUMERIC DEFAULT 0,
    note TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS dog_food (
    id VARCHAR(50) PRIMARY KEY,
    date VARCHAR(50),
    "cowMeat" NUMERIC DEFAULT 0,
    milk NUMERIC DEFAULT 0,
    egg NUMERIC DEFAULT 0,
    total NUMERIC DEFAULT 0
  )`,
  `CREATE TABLE IF NOT EXISTS checkpoint_logs (
    id VARCHAR(50) PRIMARY KEY,
    date VARCHAR(50),
    location VARCHAR(255),
    "dispatchTime" VARCHAR(50),
    "returnTime" VARCHAR(50),
    "dogIds" JSONB DEFAULT '[]'::jsonb,
    "staffIds" JSONB DEFAULT '[]'::jsonb,
    status VARCHAR(50) DEFAULT 'Dispatched'
  )`
];

async function initDB() {
  console.log('Initializing database schema...');
  try {
    for (const q of queries) {
      await db.query(q);
    }
    console.log('Database tables initialized successfully!');
  } catch (err) {
    console.error('Error initializing database tables:', err);
    process.exit(1);
  } finally {
    await db.pool.end();
  }
}

if (require.main === module) {
  initDB();
}

module.exports = initDB;
