const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Create database file in the database directory
const dbPath = path.join(__dirname, 'inventory.db');

// Create a new database connection
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON');

module.exports = db; 