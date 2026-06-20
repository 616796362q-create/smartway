const fs = require('fs');
const path = require('path');
const db = require('./db');
const initDB = require('./init-db');

const DATA_FILE = path.join(__dirname, 'data.json');

async function migrate() {
  // First, ensure all tables are created
  console.log('Ensuring database schema exists...');
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

  for (const q of queries) {
    await db.query(q);
  }
  console.log('Database schema validated.');

  if (!fs.existsSync(DATA_FILE)) {
    console.error('data.json not found! Nothing to migrate.');
    process.exit(1);
  }

  console.log('Reading data.json...');
  const rawData = fs.readFileSync(DATA_FILE, 'utf8');
  const data = JSON.parse(rawData);

  console.log('Starting data migration...');

  // 1. Users
  if (data.users && data.users.length > 0) {
    console.log(`Migrating ${data.users.length} users...`);
    for (const u of data.users) {
      await db.query(
        `INSERT INTO users (id, username, password, role, name) 
         VALUES ($1, $2, $3, $4, $5) 
         ON CONFLICT (id) DO NOTHING`,
        [u.id, u.username, u.password, u.role, u.name]
      );
    }
  }

  // 2. Staff
  if (data.staff && data.staff.length > 0) {
    console.log(`Migrating ${data.staff.length} staff members...`);
    for (const s of data.staff) {
      await db.query(
        `INSERT INTO staff (id, name, phone, position, salary, "joinDate", status) 
         VALUES ($1, $2, $3, $4, $5, $6, $7) 
         ON CONFLICT (id) DO NOTHING`,
        [s.id, s.name, s.phone, s.position, s.salary, s.joinDate, s.status]
      );
    }
  }

  // 3. Payroll
  if (data.payroll && data.payroll.length > 0) {
    console.log(`Migrating ${data.payroll.length} payroll records...`);
    for (const p of data.payroll) {
      await db.query(
        `INSERT INTO payroll (id, "staffId", "staffName", month, "basicSalary", overtime, bonus, deduction, "netSalary") 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
         ON CONFLICT (id) DO NOTHING`,
        [p.id, p.staffId, p.staffName, p.month, p.basicSalary, p.overtime, p.bonus, p.deduction, p.netSalary]
      );
    }
  }

  // 4. Expenses
  if (data.expenses && data.expenses.length > 0) {
    console.log(`Migrating ${data.expenses.length} expense records...`);
    for (const e of data.expenses) {
      await db.query(
        `INSERT INTO expenses (id, date, category, "subCategory", description, amount) 
         VALUES ($1, $2, $3, $4, $5, $6) 
         ON CONFLICT (id) DO NOTHING`,
        [e.id, e.date, e.category, e.subCategory, e.description, e.amount]
      );
    }
  }

  // 5. Dogs
  if (data.dogs && data.dogs.length > 0) {
    console.log(`Migrating ${data.dogs.length} dog records...`);
    for (const d of data.dogs) {
      await db.query(
        `INSERT INTO dogs (id, breed, age, "vaccinationDate", "foodExpense", "medicalExpense", status) 
         VALUES ($1, $2, $3, $4, $5, $6, $7) 
         ON CONFLICT (id) DO NOTHING`,
        [d.id, d.breed, d.age, d.vaccinationDate, d.foodExpense, d.medicalExpense, d.status]
      );
    }
  }

  // 6. Vehicles
  if (data.vehicles && data.vehicles.length > 0) {
    console.log(`Migrating ${data.vehicles.length} vehicle records...`);
    for (const v of data.vehicles) {
      await db.query(
        `INSERT INTO vehicles (id, driver, "fuelCost", "serviceCost", "repairCost") 
         VALUES ($1, $2, $3, $4, $5) 
         ON CONFLICT (id) DO NOTHING`,
        [v.id, v.driver, v.fuelCost, v.serviceCost, v.repairCost]
      );
    }
  }

  // 7. Income
  if (data.income && data.income.length > 0) {
    console.log(`Migrating ${data.income.length} income records...`);
    for (const i of data.income) {
      await db.query(
        `INSERT INTO income (id, date, source, description, amount) 
         VALUES ($1, $2, $3, $4, $5) 
         ON CONFLICT (id) DO NOTHING`,
        [i.id, i.date, i.source, i.description, i.amount]
      );
    }
  }

  // 8. Activities
  if (data.activities && data.activities.length > 0) {
    console.log(`Migrating ${data.activities.length} activity logs...`);
    for (const a of data.activities) {
      await db.query(
        `INSERT INTO activities (id, timestamp, "user", action) 
         VALUES ($1, $2, $3, $4) 
         ON CONFLICT (id) DO NOTHING`,
        [a.id, a.timestamp, a.user, a.action]
      );
    }
  }

  // 9. Kitchen Daily
  if (data.kitchenDaily && data.kitchenDaily.length > 0) {
    console.log(`Migrating ${data.kitchenDaily.length} kitchen daily entries...`);
    for (const k of data.kitchenDaily) {
      await db.query(
        `INSERT INTO kitchen_daily (id, date, amount, note) 
         VALUES ($1, $2, $3, $4) 
         ON CONFLICT (id) DO NOTHING`,
        [k.id, k.date, k.amount, k.note]
      );
    }
  }

  // 10. Dog Food
  if (data.dogFood && data.dogFood.length > 0) {
    console.log(`Migrating ${data.dogFood.length} dog food itemized records...`);
    for (const df of data.dogFood) {
      await db.query(
        `INSERT INTO dog_food (id, date, "cowMeat", milk, egg, total) 
         VALUES ($1, $2, $3, $4, $5, $6) 
         ON CONFLICT (id) DO NOTHING`,
        [df.id, df.date, df.cowMeat, df.milk, df.egg, df.total]
      );
    }
  }

  // 11. Checkpoint Logs
  if (data.checkpointLogs && data.checkpointLogs.length > 0) {
    console.log(`Migrating ${data.checkpointLogs.length} checkpoint logs...`);
    for (const cl of data.checkpointLogs) {
      await db.query(
        `INSERT INTO checkpoint_logs (id, date, location, "dispatchTime", "returnTime", "dogIds", "staffIds", status) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
         ON CONFLICT (id) DO NOTHING`,
        [
          cl.id, 
          cl.date, 
          cl.location, 
          cl.dispatchTime, 
          cl.returnTime, 
          JSON.stringify(cl.dogIds || []), 
          JSON.stringify(cl.staffIds || []), 
          cl.status
        ]
      );
    }
  }

  console.log('Migration completed successfully!');
  await db.pool.end();
}

migrate().catch(async (err) => {
  console.error('Migration failed:', err);
  try {
    await db.pool.end();
  } catch (_) {}
  process.exit(1);
});
