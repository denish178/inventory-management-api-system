const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

// Create database file in the database directory
const dbPath = path.join(__dirname, 'inventory.db');
const db = new sqlite3.Database(dbPath);

console.log('Initializing database...');

// Create tables
db.serialize(() => {
  // Users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('Error creating users table:', err);
    } else {
      console.log('Users table created successfully');
    }
  });

  // Products table
  db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      sku TEXT UNIQUE NOT NULL,
      image_url TEXT,
      description TEXT,
      quantity INTEGER NOT NULL DEFAULT 0,
      price REAL NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('Error creating products table:', err);
    } else {
      console.log('Products table created successfully');
    }
  });

  // Insert default user
  const defaultPassword = bcrypt.hashSync('mypassword', 10);
  db.run(`
    INSERT OR IGNORE INTO users (username, password) 
    VALUES (?, ?)
  `, ['puja', defaultPassword], (err) => {
    if (err) {
      console.error('Error inserting default user:', err);
    } else {
      console.log('Default user created: username=puja, password=mypassword');
    }
  });

  // Insert some sample products
  const sampleProducts = [
    {
      name: 'Laptop',
      type: 'Electronics',
      sku: 'LAP-001',
      image_url: 'https://example.com/laptop.jpg',
      description: 'High-performance laptop',
      quantity: 10,
      price: 1299.99
    },
    {
      name: 'Phone',
      type: 'Electronics',
      sku: 'PHN-001',
      image_url: 'https://example.com/phone.jpg',
      description: 'Latest Phone',
      quantity: 5,
      price: 999.99
    },
    {
      name: 'Desk Chair',
      type: 'Furniture',
      sku: 'CHR-001',
      image_url: 'https://example.com/chair.jpg',
      description: 'Ergonomic office chair',
      quantity: 15,
      price: 299.99
    }
  ];

  sampleProducts.forEach(product => {
    db.run(`
      INSERT OR IGNORE INTO products (name, type, sku, image_url, description, quantity, price)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [product.name, product.type, product.sku, product.image_url, product.description, product.quantity, product.price], (err) => {
      if (err) {
        console.error(`Error inserting product ${product.name}:`, err);
      } else {
        console.log(`Sample product created: ${product.name}`);
      }
    });
  });
});

db.close((err) => {
  if (err) {
    console.error('Error closing database:', err);
  } else {
    console.log('Database initialization completed successfully!');
  }
}); 