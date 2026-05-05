const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const db = require('../config/db');
const emailService = require('../utils/emailService');

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

    // 3. Generate Verification Token
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // 4. Create Admin User (Default Unverified)
    const userResult = await db.query(
      'INSERT INTO users (full_name, email, password, role, factory_id, verification_token, is_verified) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, full_name, email, role, factory_id',
      [full_name, email, hashedPassword, 'Admin', factoryId, verificationToken, false]
    );

    const user = userResult.rows[0];

    // 5. Send Verification Email
    try {
        await emailService.sendVerificationEmail(email, verificationToken, full_name);
    } catch (emailErr) {
        console.error('Email could not be sent, but user was created:', emailErr);
    }

    res.status(201).json({ 
      message: 'Registration successful! Please check your email to verify your account.',
      user: { ...user, is_verified: false } 
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
      return res.status(400).json({ message: 'User not found. Please register first.' });
    }

    // Check if verified
    if (!user.is_verified) {
      return res.status(401).json({ 
        message: 'Your email is not verified. Please check your inbox for the verification link.',
        unverified: true 
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
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
    console.error('CRITICAL LOGIN ERROR:', err);
    res.status(500).json({ message: 'Server Error during login', error: err.message });
  }
};

// Verify Email
exports.verifyEmail = async (req, res) => {
    const { token } = req.params;
    
    try {
        const result = await db.query(
            'UPDATE users SET is_verified = TRUE, verification_token = NULL WHERE verification_token = $1 RETURNING id',
            [token]
        );
        
        if (result.rows.length === 0) {
            return res.status(400).json({ message: 'Invalid or expired verification token.' });
        }
        
        res.json({ message: 'Email verified successfully! You can now login.' });
    } catch (err) {
        console.error('Verification Error:', err);
        res.status(500).json({ message: 'Server Error during verification' });
    }
};
