const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

// Register User & Factory
exports.register = async (req, res) => {
  const { full_name, email, password, factory_name } = req.body;

  try {
    // Check if user exists
    const userExists = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // 1. Create Factory
    const factoryResult = await db.query(
      'INSERT INTO factories (name) VALUES ($1) RETURNING id',
      [factory_name]
    );
    const factoryId = factoryResult.rows[0].id;

    // 2. Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Create Admin User
    const userResult = await db.query(
      'INSERT INTO users (full_name, email, password, role, factory_id) VALUES ($1, $2, $3, $4, $5) RETURNING id, full_name, email, role, factory_id',
      [full_name, email, hashedPassword, 'Admin', factoryId]
    );

    const user = userResult.rows[0];

    // 4. Create JWT
    const token = jwt.sign(
      { 
        id: user.id, 
        role: user.role, 
        factory_id: user.factory_id,
        is_demo: false,
        is_readonly: false
      },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '1d' }
    );

    res.status(201).json({ 
      token, 
      user: { ...user, is_demo: false, is_readonly: false } 
    });
  } catch (err) {
    console.error('Registration Error Details:', err);
    res.status(500).json({ message: 'Server Error during registration', error: err.message });
  }
};

// Login User
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await db.query(`
      SELECT u.*, f.is_demo, f.is_readonly 
      FROM users u 
      JOIN factories f ON u.factory_id = f.id 
      WHERE u.email = $1
    `, [email]);
    const user = result.rows[0];

    if (!user) {
      console.log('Login failed: User not found:', email);
      return res.status(400).json({ message: 'User not found. Please register first.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('Login failed: Password mismatch for:', email);
      return res.status(400).json({ message: 'Incorrect password. Please try again.' });
    }

    const token = jwt.sign(
      { 
        id: user.id, 
        role: user.role, 
        factory_id: user.factory_id,
        is_demo: user.is_demo,
        is_readonly: user.is_readonly
      },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '1d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        factory_id: user.factory_id,
        is_demo: user.is_demo,
        is_readonly: user.is_readonly
      }
    });
  } catch (err) {
    console.error('Login Error Details:', err);
    res.status(500).json({ message: 'Server Error during login', error: err.message });
  }
};
