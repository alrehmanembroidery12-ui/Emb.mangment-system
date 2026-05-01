-- ==========================================
-- Embroidery SaaS Database Schema
-- Multi-tenant Support (Factory-based)
-- ==========================================

-- 1. Factories (Tenants)
CREATE TABLE factories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    phone VARCHAR(50),
    is_demo BOOLEAN DEFAULT FALSE,
    is_readonly BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Users (System Access)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    factory_id INTEGER REFERENCES factories(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) CHECK (role IN ('Admin', 'Manager', 'Operator')) DEFAULT 'Operator',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Workers (Factory Floor Employees)
CREATE TABLE workers (
    id SERIAL PRIMARY KEY,
    factory_id INTEGER REFERENCES factories(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    salary_type VARCHAR(50) CHECK (salary_type IN ('Fixed', 'Piece-rate')),
    base_salary DECIMAL(10, 2) DEFAULT 0.00,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Attendance
CREATE TABLE attendance (
    id SERIAL PRIMARY KEY,
    factory_id INTEGER REFERENCES factories(id) ON DELETE CASCADE,
    worker_id INTEGER REFERENCES workers(id) ON DELETE CASCADE,
    attendance_date DATE NOT NULL,
    status VARCHAR(50) CHECK (status IN ('Present', 'Absent', 'Leave', 'Half-day')),
    check_in TIME,
    check_out TIME,
    UNIQUE(worker_id, attendance_date)
);

-- 5. Worker Transactions (Salaries, Advances, Deductions)
CREATE TABLE worker_transactions (
    id SERIAL PRIMARY KEY,
    factory_id INTEGER REFERENCES factories(id) ON DELETE CASCADE,
    worker_id INTEGER REFERENCES workers(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    transaction_type VARCHAR(50) CHECK (transaction_type IN ('Credit', 'Debit')), -- Credit for earnings, Debit for payments/advances
    description TEXT,
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Machines
CREATE TABLE machines (
    id SERIAL PRIMARY KEY,
    factory_id INTEGER REFERENCES factories(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    model_number VARCHAR(100),
    total_heads INTEGER DEFAULT 1,
    status VARCHAR(50) CHECK (status IN ('Active', 'Maintenance', 'Inactive')) DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Machine Logs (Production Tracking)
CREATE TABLE machine_logs (
    id SERIAL PRIMARY KEY,
    factory_id INTEGER REFERENCES factories(id) ON DELETE CASCADE,
    machine_id INTEGER REFERENCES machines(id) ON DELETE CASCADE,
    worker_id INTEGER REFERENCES workers(id),
    stitches_count INTEGER DEFAULT 0,
    shift VARCHAR(50),
    downtime_minutes INTEGER DEFAULT 0,
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    status VARCHAR(50)
);

-- 8. Clients
CREATE TABLE clients (
    id SERIAL PRIMARY KEY,
    factory_id INTEGER REFERENCES factories(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. Orders
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    factory_id INTEGER REFERENCES factories(id) ON DELETE CASCADE,
    client_id INTEGER REFERENCES clients(id) ON DELETE SET NULL,
    order_number VARCHAR(100) UNIQUE NOT NULL,
    status VARCHAR(50) CHECK (status IN ('Pending', 'In-Production', 'Completed', 'Delivered', 'Cancelled')) DEFAULT 'Pending',
    total_price DECIMAL(10, 2) NOT NULL,
    advance_paid DECIMAL(10, 2) DEFAULT 0.00,
    production_cost DECIMAL(10, 2) DEFAULT 0.00,
    fabric_quantity DECIMAL(10, 2) DEFAULT 0.00,
    due_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 10. Invoices
CREATE TABLE invoices (
    id SERIAL PRIMARY KEY,
    factory_id INTEGER REFERENCES factories(id) ON DELETE CASCADE,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    invoice_number VARCHAR(100) UNIQUE NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    tax_amount DECIMAL(10, 2) DEFAULT 0.00,
    status VARCHAR(50) CHECK (status IN ('Unpaid', 'Partially-Paid', 'Paid')) DEFAULT 'Unpaid',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 11. Payments (Customer Payments)
CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    factory_id INTEGER REFERENCES factories(id) ON DELETE CASCADE,
    invoice_id INTEGER REFERENCES invoices(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(50) CHECK (payment_method IN ('Cash', 'Bank Transfer', 'Cheque', 'Other')),
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 12. Inventory
CREATE TABLE inventory (
    id SERIAL PRIMARY KEY,
    factory_id INTEGER REFERENCES factories(id) ON DELETE CASCADE,
    item_name VARCHAR(255) NOT NULL,
    category VARCHAR(100), -- Thread, Fabric, Needle, etc.
    quantity DECIMAL(10, 2) DEFAULT 0.00,
    unit VARCHAR(50), -- Kg, Rolls, Boxes
    min_stock_level DECIMAL(10, 2) DEFAULT 0.00,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- INDEXES FOR PERFORMANCE
-- ==========================================
CREATE INDEX idx_users_factory ON users(factory_id);
CREATE INDEX idx_workers_factory ON workers(factory_id);
CREATE INDEX idx_orders_factory ON orders(factory_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_invoices_factory ON invoices(factory_id);
CREATE INDEX idx_inventory_factory ON inventory(factory_id);
CREATE INDEX idx_attendance_date ON attendance(attendance_date);
CREATE INDEX idx_worker_transactions_worker ON worker_transactions(worker_id);
