require("dotenv").config();
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

let dbConfig;

if (process.env.DATABASE_URL) {
  const url = new URL(process.env.DATABASE_URL);
  dbConfig = {
    host: url.hostname,
    port: url.port || 3306,
    user: url.username,
    password: url.password,
    database: url.pathname.replace("/", ""),
    ssl: { rejectUnauthorized: false },
  };
  console.log("Using Railway cloud database");
} else {
  dbConfig = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  };
  console.log("Using cloud database: " + process.env.DB_HOST);
}

const db = mysql.createPool({ ...dbConfig, waitForConnections: true, connectionLimit: 10 });

db.getConnection((err, conn) => {
  if (err) {
    console.log("Database connection failed", err);
  } else {
    console.log("MySQL Connected to " + process.env.DB_NAME);
    conn.release();
  }
});

// Get all branches
app.get("/api/branches", (req, res) => {
  const sql = "SELECT branchCode, branchName FROM branch ORDER BY branchCode";
  db.query(sql, (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json(err);
    }
    res.json(result);
  });
});

// Dashboard counts
app.get("/api/dashboard", (req, res) => {
  const { branch } = req.query;

  const sql = `
    SELECT
      (SELECT COUNT(*) FROM customer ${branch ? "WHERE custBranch = ?" : ""}) AS customers,
      (SELECT COUNT(*) FROM inventoryjournalitem ${branch ? "WHERE branchCode = ?" : ""}) AS products,
      (SELECT COUNT(*) FROM salessummary ${branch ? "WHERE branchCode = ?" : ""}) AS sales,
      (SELECT COUNT(*) FROM stock ${branch ? "WHERE branchCode = ?" : ""}) AS Stock
  `;

  const params = branch ? [branch, branch, branch, branch] : [];

  db.query(sql, params, (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json(err);
    }
    res.json(result[0]);
  });
});

// Get Customers
app.get("/api/customers", (req, res) => {
  const { branch } = req.query;
  let sql = "SELECT * FROM customer";
  const params = [];

  if (branch) {
    sql += " WHERE custBranch = ?";
    params.push(branch);
  }
  sql += " ORDER BY custCode ASC";

  db.query(sql, params, (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json(err);
    }
    res.json(result);
  });
});

// Get Sales Data
app.get("/api/sales", (req, res) => {
  const { branch } = req.query;
  let sql = "SELECT * FROM salessummary";
  const params = [];

  if (branch) {
    sql += " WHERE branchCode = ?";
    params.push(branch);
  }
  /* sql += " ORDER BY itemcode DESC"; */

  db.query(sql, params, (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json(err);
    }
    res.json(result);
  });
});

// Get Products
app.get("/api/products", (req, res) => {
  const { branch } = req.query;
  let sql = `SELECT i.*, item.descrip AS itemName FROM inventoryjournalitem i LEFT JOIN item ON i.itemcode = item.itemcode`;
  const params = [];

  if (branch) {
    sql += " WHERE i.branchCode = ?";
    params.push(branch);
  }

  db.query(sql, params, (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json(err);
    }
    res.json(result);
  });
});

// Get Stock Data
app.get("/api/stock", (req, res) => {
  const { branch } = req.query;
  let sql = "SELECT s.*, item.descrip As itemName FROM stock s LEFT JOIN item ON s.itemcode = item.itemcode";
  const params = [];

  if (branch) {
    sql += " WHERE s.branchCode = ?";
    params.push(branch);
  }
  sql += " ORDER BY s.jurDate ASC";

  db.query(sql, params, (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json(err);
    }
    res.json(result);
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
