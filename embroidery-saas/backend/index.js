const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();
const db = require('./src/config/db');

// Routes & Middleware
const authRoutes = require('./src/routes/authRoutes');
const workerRoutes = require('./src/routes/workerRoutes');
const clientRoutes = require('./src/routes/clientRoutes');
const inventoryRoutes = require('./src/routes/inventoryRoutes');
const orderRoutes = require('./src/routes/orderRoutes');
const transactionRoutes = require('./src/routes/transactionRoutes');
const machineRoutes = require('./src/routes/machineRoutes');
const billingRoutes = require('./src/routes/billingRoutes');
const dashboardRoutes = require('./src/routes/dashboardRoutes');
const demoRoutes = require('./src/routes/demoRoutes');
const settingsRoutes = require('./src/routes/settingsRoutes');

const { authMiddleware, authorizeRoles } = require('./src/middleware/authMiddleware');
const checkSubscription = require('./src/middleware/subscriptionMiddleware');
const readonlyMiddleware = require('./src/middleware/readonlyMiddleware');

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Logging
app.use(helmet({
  crossOriginResourcePolicy: false, // Allow images/PDFs if needed
})); 
app.use(morgan('dev')); 
app.use(cors({
  origin: true, // Allow all origins for debugging
  credentials: true
}));
app.use(express.json());

// Public Routes
app.use('/api/auth', authRoutes);

// Protected Routes (Required Login)
app.use('/api/dashboard', authMiddleware, dashboardRoutes);
app.use('/api/demo', authMiddleware, demoRoutes);

// Subscription Restricted Routes (Required Active Plan)
app.use('/api/workers', authMiddleware, checkSubscription, readonlyMiddleware, workerRoutes);
app.use('/api/clients', authMiddleware, checkSubscription, readonlyMiddleware, clientRoutes);
app.use('/api/inventory', authMiddleware, checkSubscription, readonlyMiddleware, inventoryRoutes);
app.use('/api/orders', authMiddleware, checkSubscription, readonlyMiddleware, orderRoutes);
app.use('/api/transactions', authMiddleware, checkSubscription, readonlyMiddleware, transactionRoutes);
app.use('/api/client-transactions', authMiddleware, checkSubscription, readonlyMiddleware, require('./src/routes/clientTransactionRoutes'));
app.use('/api/machines', authMiddleware, checkSubscription, readonlyMiddleware, machineRoutes);
app.use('/api/billing', authMiddleware, checkSubscription, readonlyMiddleware, billingRoutes);
app.use('/api/reports', authMiddleware, checkSubscription, require('./src/routes/reportRoutes'));
app.use('/api/settings', authMiddleware, checkSubscription, readonlyMiddleware, settingsRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Embroidery SaaS Backend API is running' });
});


// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({ message: 'Resource not found' });
});

// Global Error Handler (The Senior Dev Way)
app.use((err, req, res, next) => {
  console.error(err.stack);
  const status = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  res.status(status).json({
    success: false,
    status,
    message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});
