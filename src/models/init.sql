-- This script will run automatically the first time the postgres container starts.

CREATE TABLE products (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    stock INTEGER NOT NULL
);

-- Optional: Add some initial data for testing
INSERT INTO products (id, name, price, stock) VALUES
('101', 'Wireless Mouse', 29.99, 150),
('102', 'Mechanical Keyboard', 89.99, 75),
('103', 'HD Monitor', 199.99, 50);