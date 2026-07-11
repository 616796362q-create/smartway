const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// Allow requests from Vercel frontend and local development
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (server-to-server, mobile apps, curl)
    if (!origin) return callback(null, true);
    // Allow all vercel.app subdomains and localhost
    if (
      origin.includes('vercel.app') ||
      origin.includes('localhost') ||
      origin.includes('127.0.0.1')
    ) {
      return callback(null, true);
    }
    // Allow any custom domain set in env
    if (process.env.FRONTEND_URL && origin === process.env.FRONTEND_URL) {
      return callback(null, true);
    }
    return callback(null, true); // Allow all for now - can restrict later
  },
  credentials: true
}));
app.use(express.json());


// Helper function to log system activities
async function logActivity(user, action) {
  try {
    const id = `ACT-${Date.now()}`;
    const timestamp = new Date().toISOString();
    await db.query(
      'INSERT INTO activities (id, timestamp, "user", action) VALUES ($1, $2, $3, $4)',
      [id, timestamp, user || 'System', action]
    );
  } catch (err) {
    console.error('Failed to log activity:', err);
  }
}

// --- API ROUTES ---

// 1. Authentication
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await db.query(
      'SELECT * FROM users WHERE LOWER(username) = LOWER($1) AND password = $2',
      [username, password]
    );
    const user = result.rows[0];

    if (user) {
      await logActivity(user.username, `Logged into the system.`);
      res.json({
        success: true,
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          name: user.name
        }
      });
    } else {
      res.status(401).json({ success: false, message: 'Username ama Password khaldan!' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get audit log
app.get('/api/activities', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM activities ORDER BY timestamp DESC LIMIT 100');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get users (no passwords)
app.get('/api/auth/users', async (req, res) => {
  try {
    const result = await db.query('SELECT id, username, role, name FROM users');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Staff Management
app.get('/api/staff', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM staff ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/staff', async (req, res) => {
  const { name, phone, position, salary, joinDate, status, username } = req.body;
  try {
    const lastStaffRes = await db.query('SELECT id FROM staff ORDER BY id DESC LIMIT 1');
    const lastStaff = lastStaffRes.rows[0];
    let nextIdNum = 1;
    if (lastStaff && lastStaff.id) {
      const match = lastStaff.id.match(/STF-(\d+)/);
      if (match) {
        nextIdNum = parseInt(match[1]) + 1;
      }
    }
    const id = `STF-${String(nextIdNum).padStart(3, '0')}`;

    await db.query(
      'INSERT INTO staff (id, name, phone, position, salary, "joinDate", status) VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [id, name, phone, position, parseFloat(salary) || 0, joinDate, status || 'Active']
    );

    await logActivity(username, `Diiwaangeliyay staff cusub: ${name} (${position}) ID: ${id}`);
    const allStaff = await db.query('SELECT * FROM staff ORDER BY id ASC');
    res.json({ success: true, staff: allStaff.rows, newStaff: { id, name, phone, position, salary, joinDate, status } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.put('/api/staff/:id', async (req, res) => {
  const { id } = req.params;
  const { name, phone, position, salary, joinDate, status, username } = req.body;
  try {
    const result = await db.query(
      'UPDATE staff SET name = $1, phone = $2, position = $3, salary = $4, "joinDate" = $5, status = $6 WHERE id = $7 RETURNING *',
      [name, phone, position, parseFloat(salary) || 0, joinDate, status, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Staff lama helin!' });
    }

    await logActivity(username, `Cusboonaysiiyay staff ID: ${id} (${name})`);
    const allStaff = await db.query('SELECT * FROM staff ORDER BY id ASC');
    res.json({ success: true, staff: allStaff.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.delete('/api/staff/:id', async (req, res) => {
  const { id } = req.params;
  const { username } = req.query;
  try {
    const staffRes = await db.query('SELECT name FROM staff WHERE id = $1', [id]);
    if (staffRes.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Staff lama helin!' });
    }
    const staffName = staffRes.rows[0].name;

    await db.query('DELETE FROM staff WHERE id = $1', [id]);
    await logActivity(username, `Masaxay Staff ID: ${id} (${staffName})`);
    const allStaff = await db.query('SELECT * FROM staff ORDER BY id ASC');
    res.json({ success: true, staff: allStaff.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 3. Payroll Management
app.get('/api/payroll', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM payroll ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/payroll', async (req, res) => {
  const { staffId, month, overtime, bonus, deduction, username } = req.body;
  try {
    const staffRes = await db.query('SELECT name, salary FROM staff WHERE id = $1', [staffId]);
    const staffMember = staffRes.rows[0];
    if (!staffMember) {
      return res.status(404).json({ success: false, message: 'Staff-ka la doortay lama helin!' });
    }

    const basicSalary = parseFloat(staffMember.salary) || 0;
    const otVal = parseFloat(overtime) || 0;
    const bonusVal = parseFloat(bonus) || 0;
    const dedVal = parseFloat(deduction) || 0;
    const netSalary = basicSalary + otVal + bonusVal - dedVal;

    const duplicateRes = await db.query('SELECT id FROM payroll WHERE "staffId" = $1 AND month = $2', [staffId, month]);
    const existing = duplicateRes.rows[0];

    const payId = existing
      ? existing.id
      : `PAY-${Date.now()}-${Math.floor(Math.random() * 100)}`;

    if (existing) {
      await db.query(
        `UPDATE payroll 
         SET "staffName" = $1, "basicSalary" = $2, overtime = $3, bonus = $4, deduction = $5, "netSalary" = $6 
         WHERE id = $7`,
        [staffMember.name, basicSalary, otVal, bonusVal, dedVal, netSalary, payId]
      );
      await logActivity(username, `Cusboonaysiiyay mushaarka ${staffMember.name} ee bisha ${month}`);
    } else {
      await db.query(
        `INSERT INTO payroll (id, "staffId", "staffName", month, "basicSalary", overtime, bonus, deduction, "netSalary") 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [payId, staffId, staffMember.name, month, basicSalary, otVal, bonusVal, dedVal, netSalary]
      );
      await logActivity(username, `Galiyay mushaarka ${staffMember.name} ee bisha ${month} (Net: $${netSalary})`);
    }

    const allPayroll = await db.query('SELECT * FROM payroll ORDER BY id DESC');
    res.json({ success: true, payroll: allPayroll.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.put('/api/payroll/:id', async (req, res) => {
  const { id } = req.params;
  const { staffId, month, overtime, bonus, deduction, username } = req.body;
  try {
    const existingRes = await db.query('SELECT id FROM payroll WHERE id = $1', [id]);
    if (!existingRes.rows[0]) {
      return res.status(404).json({ success: false, message: 'Diiwaanka mushaarka lama helin!' });
    }

    const staffRes = await db.query('SELECT name, salary FROM staff WHERE id = $1', [staffId]);
    const staffMember = staffRes.rows[0];
    if (!staffMember) {
      return res.status(404).json({ success: false, message: 'Staff-ka la doortay lama helin!' });
    }

    const duplicateRes = await db.query(
      'SELECT id FROM payroll WHERE "staffId" = $1 AND month = $2 AND id <> $3',
      [staffId, month, id]
    );
    if (duplicateRes.rows[0]) {
      return res.status(409).json({ success: false, message: 'Shaqaalahan mushaarkiisa bishan horay ayaa loo geliyay!' });
    }

    const basicSalary = parseFloat(staffMember.salary) || 0;
    const otVal = parseFloat(overtime) || 0;
    const bonusVal = parseFloat(bonus) || 0;
    const dedVal = parseFloat(deduction) || 0;
    const netSalary = basicSalary + otVal + bonusVal - dedVal;

    await db.query(
      `UPDATE payroll
       SET "staffId" = $1, "staffName" = $2, month = $3, "basicSalary" = $4, overtime = $5, bonus = $6, deduction = $7, "netSalary" = $8
       WHERE id = $9`,
      [staffId, staffMember.name, month, basicSalary, otVal, bonusVal, dedVal, netSalary, id]
    );
    await logActivity(username, `Wax ka bedelay mushaarka ${staffMember.name} ee bisha ${month}`);

    const allPayroll = await db.query('SELECT * FROM payroll ORDER BY id DESC');
    res.json({ success: true, payroll: allPayroll.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.delete('/api/payroll/:id', async (req, res) => {
  const { id } = req.params;
  const { username } = req.query;
  try {
    const payRes = await db.query('SELECT "staffName", month, "netSalary" FROM payroll WHERE id = $1', [id]);
    const pay = payRes.rows[0];
    if (!pay) {
      return res.status(404).json({ success: false, message: 'Diiwaanka mushaarka lama helin!' });
    }

    await db.query('DELETE FROM payroll WHERE id = $1', [id]);
    await logActivity(username, `Masaxay mushaarka ${pay.staffName} ee bisha ${pay.month} ($${pay.netSalary})`);

    const allPayroll = await db.query('SELECT * FROM payroll ORDER BY id DESC');
    res.json({ success: true, payroll: allPayroll.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 4. Expenses Management
app.get('/api/expenses', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM expenses ORDER BY date DESC, id DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/expenses', async (req, res) => {
  const { date, category, subCategory, description, amount, username } = req.body;
  try {
    const id = `EXP-${Date.now()}-${Math.floor(Math.random() * 100)}`;
    const amt = parseFloat(amount) || 0;
    
    await db.query(
      'INSERT INTO expenses (id, date, category, "subCategory", description, amount) VALUES ($1, $2, $3, $4, $5, $6)',
      [id, date, category, subCategory, description, amt]
    );

    await logActivity(username, `Diiwaangeliyay kharash cusub: ${category} - ${subCategory} ($${amt})`);
    const allExpenses = await db.query('SELECT * FROM expenses ORDER BY date DESC, id DESC');
    res.json({ success: true, expenses: allExpenses.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.delete('/api/expenses/:id', async (req, res) => {
  const { id } = req.params;
  const { username } = req.query;
  try {
    const expRes = await db.query('SELECT category, "subCategory", amount FROM expenses WHERE id = $1', [id]);
    const exp = expRes.rows[0];
    if (!exp) {
      return res.status(404).json({ success: false, message: 'Kharashka lama helin!' });
    }

    await db.query('DELETE FROM expenses WHERE id = $1', [id]);
    await logActivity(username, `Masaxay kharashka: ${exp.category} - ${exp.subCategory} ($${exp.amount})`);
    const allExpenses = await db.query('SELECT * FROM expenses ORDER BY date DESC, id DESC');
    res.json({ success: true, expenses: allExpenses.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 5. Dogs Management
app.get('/api/dogs', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM dogs ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/dogs', async (req, res) => {
  const { breed, age, vaccinationDate, foodExpense, medicalExpense, status, username } = req.body;
  try {
    const lastDogRes = await db.query('SELECT id FROM dogs ORDER BY id DESC LIMIT 1');
    const lastDog = lastDogRes.rows[0];
    let nextIdNum = 1;
    if (lastDog && lastDog.id) {
      const match = lastDog.id.match(/DOG-(\d+)/);
      if (match) {
        nextIdNum = parseInt(match[1]) + 1;
      }
    }
    const id = `DOG-${String(nextIdNum).padStart(3, '0')}`;

    const newDog = {
      id,
      breed,
      age: parseInt(age) || 0,
      vaccinationDate,
      foodExpense: parseFloat(foodExpense) || 0,
      medicalExpense: parseFloat(medicalExpense) || 0,
      status: status || 'Active'
    };

    await db.query(
      `INSERT INTO dogs (id, breed, age, "vaccinationDate", "foodExpense", "medicalExpense", status) 
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [id, breed, newDog.age, vaccinationDate, newDog.foodExpense, newDog.medicalExpense, newDog.status]
    );

    await logActivity(username, `Diiwaangeliyay eey cusub: ${breed} ID: ${id}`);
    const allDogs = await db.query('SELECT * FROM dogs ORDER BY id ASC');
    res.json({ success: true, dogs: allDogs.rows, newDog });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.put('/api/dogs/:id', async (req, res) => {
  const { id } = req.params;
  const { breed, age, vaccinationDate, foodExpense, medicalExpense, status, username } = req.body;
  try {
    const result = await db.query(
      `UPDATE dogs 
       SET breed = $1, age = $2, "vaccinationDate" = $3, "foodExpense" = $4, "medicalExpense" = $5, status = $6 
       WHERE id = $7 RETURNING *`,
      [breed, parseInt(age) || 0, vaccinationDate, parseFloat(foodExpense) || 0, parseFloat(medicalExpense) || 0, status, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Eeyga lama helin!' });
    }

    await logActivity(username, `Cusboonaysiiyay xogta eeyga ID: ${id} (${breed})`);
    const allDogs = await db.query('SELECT * FROM dogs ORDER BY id ASC');
    res.json({ success: true, dogs: allDogs.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.delete('/api/dogs/:id', async (req, res) => {
  const { id } = req.params;
  const { username } = req.query;
  try {
    const dogRes = await db.query('SELECT breed FROM dogs WHERE id = $1', [id]);
    const dog = dogRes.rows[0];
    if (!dog) {
      return res.status(404).json({ success: false, message: 'Eeyga lama helin!' });
    }

    await db.query('DELETE FROM dogs WHERE id = $1', [id]);
    await logActivity(username, `Masaxay eeygii ID: ${id} (${dog.breed})`);
    const allDogs = await db.query('SELECT * FROM dogs ORDER BY id ASC');
    res.json({ success: true, dogs: allDogs.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 6. Vehicles Management
app.get('/api/vehicles', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM vehicles ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/vehicles', async (req, res) => {
  const { id, driver, fuelCost, serviceCost, repairCost, username } = req.body;
  try {
    const vehicleId = id.toUpperCase().trim();
    const existingRes = await db.query('SELECT id FROM vehicles WHERE id = $1', [vehicleId]);
    const exists = existingRes.rows[0];

    const fuel = parseFloat(fuelCost) || 0;
    const service = parseFloat(serviceCost) || 0;
    const repair = parseFloat(repairCost) || 0;

    if (exists) {
      await db.query(
        'UPDATE vehicles SET driver = $1, "fuelCost" = $2, "serviceCost" = $3, "repairCost" = $4 WHERE id = $5',
        [driver, fuel, service, repair, vehicleId]
      );
      await logActivity(username, `Cusboonaysiiyay baabuurka lambarkiisu yahay: ${id}`);
    } else {
      await db.query(
        'INSERT INTO vehicles (id, driver, "fuelCost", "serviceCost", "repairCost") VALUES ($1, $2, $3, $4, $5)',
        [vehicleId, driver, fuel, service, repair]
      );
      await logActivity(username, `Diiwaangeliyay baabuur cusub: ${id}`);
    }

    const allVehicles = await db.query('SELECT * FROM vehicles ORDER BY id ASC');
    res.json({ success: true, vehicles: allVehicles.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.delete('/api/vehicles/:id', async (req, res) => {
  const { id } = req.params;
  const { username } = req.query;
  try {
    const existsRes = await db.query('SELECT id FROM vehicles WHERE id = $1', [id]);
    if (existsRes.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Baabuurka lama helin!' });
    }

    await db.query('DELETE FROM vehicles WHERE id = $1', [id]);
    await logActivity(username, `Masaxay baabuurkii lambarkiisu ahaa: ${id}`);
    const allVehicles = await db.query('SELECT * FROM vehicles ORDER BY id ASC');
    res.json({ success: true, vehicles: allVehicles.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 7. Finance (Income Management)
app.get('/api/income', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM income ORDER BY date DESC, id DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/income', async (req, res) => {
  const { date, source, description, amount, username } = req.body;
  try {
    const id = `INC-${Date.now()}-${Math.floor(Math.random() * 100)}`;
    const amt = parseFloat(amount) || 0;

    await db.query(
      'INSERT INTO income (id, date, source, description, amount) VALUES ($1, $2, $3, $4, $5)',
      [id, date, source, description, amt]
    );

    await logActivity(username, `Galiyay dakhli cusub: ${source} ($${amt})`);
    const allIncome = await db.query('SELECT * FROM income ORDER BY date DESC, id DESC');
    res.json({ success: true, income: allIncome.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.delete('/api/income/:id', async (req, res) => {
  const { id } = req.params;
  const { username } = req.query;
  try {
    const incRes = await db.query('SELECT source, amount FROM income WHERE id = $1', [id]);
    const inc = incRes.rows[0];
    if (!inc) {
      return res.status(404).json({ success: false, message: 'Dakhliga lama helin!' });
    }

    await db.query('DELETE FROM income WHERE id = $1', [id]);
    await logActivity(username, `Masaxay dakhligii: ${inc.source} ($${inc.amount})`);
    const allIncome = await db.query('SELECT * FROM income ORDER BY date DESC, id DESC');
    res.json({ success: true, income: allIncome.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 8. Kitchen Daily Entry
app.get('/api/kitchen-daily', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM kitchen_daily ORDER BY date DESC, id DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/kitchen-daily', async (req, res) => {
  const { date, amount, note, username } = req.body;
  try {
    const id = `KIT-${Date.now()}`;
    const amt = parseFloat(amount) || 0;

    await db.query(
      'INSERT INTO kitchen_daily (id, date, amount, note) VALUES ($1, $2, $3, $4)',
      [id, date, amt, note || '']
    );

    await logActivity(username, `Galiyay kharashka jikada: $${amt} (${date})`);
    const allKitchen = await db.query('SELECT * FROM kitchen_daily ORDER BY date DESC, id DESC');
    res.json({ success: true, kitchenDaily: allKitchen.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.delete('/api/kitchen-daily/:id', async (req, res) => {
  const { id } = req.params;
  const { username } = req.query;
  try {
    const entryRes = await db.query('SELECT amount, date FROM kitchen_daily WHERE id = $1', [id]);
    const entry = entryRes.rows[0];
    if (!entry) return res.status(404).json({ success: false, message: 'Lama helin!' });

    await db.query('DELETE FROM kitchen_daily WHERE id = $1', [id]);
    await logActivity(username, `Masaxay kharashka jikada: $${entry.amount} (${entry.date})`);
    const allKitchen = await db.query('SELECT * FROM kitchen_daily ORDER BY date DESC, id DESC');
    res.json({ success: true, kitchenDaily: allKitchen.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 9. Dog Food Itemized
app.get('/api/dog-food', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM dog_food ORDER BY date DESC, id DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/dog-food', async (req, res) => {
  const { date, cowMeat, milk, egg, username } = req.body;
  try {
    const cowMeatVal = parseFloat(cowMeat) || 0;
    const milkVal = parseFloat(milk) || 0;
    const eggVal = parseFloat(egg) || 0;
    const total = cowMeatVal + milkVal + eggVal;
    const id = `DOGF-${Date.now()}`;

    await db.query(
      'INSERT INTO dog_food (id, date, "cowMeat", milk, egg, total) VALUES ($1, $2, $3, $4, $5, $6)',
      [id, date, cowMeatVal, milkVal, eggVal, total]
    );

    await logActivity(username, `Galiyay cuntada eeyaha: Hilib $${cowMeatVal}, Caano $${milkVal}, Ukun $${eggVal} — Total: $${total}`);
    const allDogFood = await db.query('SELECT * FROM dog_food ORDER BY date DESC, id DESC');
    res.json({ success: true, dogFood: allDogFood.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.delete('/api/dog-food/:id', async (req, res) => {
  const { id } = req.params;
  const { username } = req.query;
  try {
    const entryRes = await db.query('SELECT total, date FROM dog_food WHERE id = $1', [id]);
    const entry = entryRes.rows[0];
    if (!entry) return res.status(404).json({ success: false, message: 'Lama helin!' });

    await db.query('DELETE FROM dog_food WHERE id = $1', [id]);
    await logActivity(username, `Masaxay cuntada eeyaha: $${entry.total} (${entry.date})`);
    const allDogFood = await db.query('SELECT * FROM dog_food ORDER BY date DESC, id DESC');
    res.json({ success: true, dogFood: allDogFood.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 9.5 Checkpoint logs
app.get('/api/checkpoint-logs', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM checkpoint_logs ORDER BY date DESC, id DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/checkpoint-logs', async (req, res) => {
  const { date, location, dispatchTime, returnTime, dogIds, staffIds, status, username } = req.body;
  try {
    const id = `CP-${Date.now()}`;
    await db.query(
      `INSERT INTO checkpoint_logs (id, date, location, "dispatchTime", "returnTime", "dogIds", "staffIds", status) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        id, 
        date, 
        location, 
        dispatchTime, 
        returnTime || '', 
        JSON.stringify(dogIds || []), 
        JSON.stringify(staffIds || []), 
        status || 'Dispatched'
      ]
    );

    const dogsCount = (dogIds || []).length;
    const staffCount = (staffIds || []).length;
    await logActivity(username, `Loo diray checkpoint: ${location} (${dogsCount} eey iyo ${staffCount} shaqaale)`);
    
    const allLogs = await db.query('SELECT * FROM checkpoint_logs ORDER BY date DESC, id DESC');
    res.json({ success: true, checkpointLogs: allLogs.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.put('/api/checkpoint-logs/:id', async (req, res) => {
  const { id } = req.params;
  const { date, location, dispatchTime, returnTime, dogIds, staffIds, status, username } = req.body;
  try {
    const existRes = await db.query('SELECT status FROM checkpoint_logs WHERE id = $1', [id]);
    const oldLog = existRes.rows[0];
    if (!oldLog) {
      return res.status(404).json({ success: false, message: 'Diiwaanka checkpoint-ka lama helin!' });
    }
    const oldStatus = oldLog.status;

    await db.query(
      `UPDATE checkpoint_logs 
       SET date = $1, location = $2, "dispatchTime" = $3, "returnTime" = $4, "dogIds" = $5, "staffIds" = $6, status = $7 
       WHERE id = $8`,
      [
        date, 
        location, 
        dispatchTime, 
        returnTime, 
        JSON.stringify(dogIds || []), 
        JSON.stringify(staffIds || []), 
        status, 
        id
      ]
    );

    if (oldStatus !== 'Returned' && status === 'Returned') {
      await logActivity(username, `Laga soo celiyay checkpoint-ka: ${location} (Eeyahii iyo shaqaalihii waa soo noqdeen)`);
    } else {
      await logActivity(username, `La cusboonaysiiyay diiwaanka checkpoint-ka ee ${location}`);
    }

    const allLogs = await db.query('SELECT * FROM checkpoint_logs ORDER BY date DESC, id DESC');
    res.json({ success: true, checkpointLogs: allLogs.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.delete('/api/checkpoint-logs/:id', async (req, res) => {
  const { id } = req.params;
  const { username } = req.query;
  try {
    const logRes = await db.query('SELECT location FROM checkpoint_logs WHERE id = $1', [id]);
    const log = logRes.rows[0];
    if (!log) {
      return res.status(404).json({ success: false, message: 'Diiwaanka checkpoint-ka lama helin!' });
    }

    await db.query('DELETE FROM checkpoint_logs WHERE id = $1', [id]);
    await logActivity(username, `La masaxay diiwaankii checkpoint-ka ee ${log.location}`);
    
    const allLogs = await db.query('SELECT * FROM checkpoint_logs ORDER BY date DESC, id DESC');
    res.json({ success: true, checkpointLogs: allLogs.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 10. Dynamic Dashboard Statistics Endpoint
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    // 1. Staff count
    const staffRes = await db.query("SELECT COUNT(*)::int as count FROM staff WHERE status = 'Active'");
    const totalStaff = staffRes.rows[0].count;

    // 2. Dogs count
    const dogsCountRes = await db.query("SELECT COUNT(*)::int as count FROM dogs WHERE status = 'Active'");
    const totalDogs = dogsCountRes.rows[0].count;

    // 3. Vehicles count
    const vehiclesCountRes = await db.query("SELECT COUNT(*)::int as count FROM vehicles");
    const totalVehicles = vehiclesCountRes.rows[0].count;

    // 4. Payroll calculations
    // Allow filtering by ?month=YYYY-MM. Fallback uses Nairobi month for the business timezone.
    const selectedMonth = req.query.month || new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Africa/Nairobi',
      year: 'numeric',
      month: '2-digit'
    }).format(new Date());

    // Get selected month net salary sum
    const monthlyPayrollRes = await db.query('SELECT SUM("netSalary")::numeric as sum FROM payroll WHERE month = $1', [selectedMonth]);
    const latestPayroll = parseFloat(monthlyPayrollRes.rows[0].sum) || 0;

    // 5. Expense summaries for the selected month
    const kitchenExpensesRes = await db.query('SELECT SUM(amount)::numeric as sum FROM kitchen_daily WHERE LEFT(date, 7) = $1', [selectedMonth]);
    const kitchenExpenses = parseFloat(kitchenExpensesRes.rows[0].sum) || 0;

    const dogFoodExpensesRes = await db.query('SELECT SUM(total)::numeric as sum FROM dog_food WHERE LEFT(date, 7) = $1', [selectedMonth]);
    const dogFoodExpenses = parseFloat(dogFoodExpensesRes.rows[0].sum) || 0;

    // Monthly dashboard totals should only include expenses entered with dates in the selected month.
    const dogMedicalExpenses = 0;
    const dogsExpenses = dogFoodExpenses;
    const vehicleExpenses = 0;

    const expenseGroupsRes = await db.query(
      'SELECT category, SUM(amount)::numeric as sum FROM expenses WHERE LEFT(date, 7) = $1 GROUP BY category',
      [selectedMonth]
    );
    const expenseGroups = expenseGroupsRes.rows.reduce((acc, row) => {
      acc[String(row.category || '').toLowerCase()] = parseFloat(row.sum) || 0;
      return acc;
    }, {});
    const categorySum = (...names) => names.reduce((sum, name) => sum + (expenseGroups[name.toLowerCase()] || 0), 0);

    const fuelExpenses = categorySum('Fuel', 'Shidaal');
    const repairExpenses = categorySum('Repairs', 'Repair', 'Dayactir');
    const utilityExpenses = categorySum('Utilities', 'Utility', 'Adeegyada');
    const otherExpenses = categorySum('Others', 'Other Expenses', 'Other', 'Kale');

    // Total monthly expenses
    const totalExpenses = latestPayroll + dogsExpenses + vehicleExpenses + kitchenExpenses + fuelExpenses + repairExpenses + utilityExpenses + otherExpenses;

    // Income for the selected month
    const totalIncomeRes = await db.query('SELECT SUM(amount)::numeric as sum FROM income WHERE LEFT(date, 7) = $1', [selectedMonth]);
    const totalIncome = parseFloat(totalIncomeRes.rows[0].sum) || 0;

    const profitLoss = totalIncome - totalExpenses;

    res.json({
      totalStaff,
      totalDogs,
      totalVehicles,
      monthlyPayroll: latestPayroll,
      monthlyPayrollMonth: selectedMonth,
      totalExpenses,
      totalIncome,
      profitLoss,
      breakdown: {
        payroll: latestPayroll,
        dogs: dogsExpenses,
        dogFood: dogFoodExpenses,
        dogMedical: dogMedicalExpenses,
        vehicles: vehicleExpenses,
        kitchen: kitchenExpenses,
        fuel: fuelExpenses,
        repairs: repairExpenses,
        utilities: utilityExpenses,
        others: otherExpenses
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Fallback route
app.get('*', (req, res) => {
  res.status(404).json({ error: 'API route not found' });
});

app.listen(PORT, () => {
  console.log(`SmartWay Security System running on http://localhost:${PORT}`);
  logActivity('System', 'Server started successfully.');
});
