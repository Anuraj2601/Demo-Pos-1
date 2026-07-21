require("dotenv").config();

const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");


const app = express();

app.use(cors());
app.use(express.json());


// MySQL connection — supports Railway DATABASE_URL or local .env vars

let dbConfig;

if (process.env.DATABASE_URL) {
    const url = new URL(process.env.DATABASE_URL);
    dbConfig = {
        host: url.hostname,
        port: url.port || 3306,
        user: url.username,
        password: url.password,
        database: url.pathname.replace("/", ""),
        ssl: { rejectUnauthorized: false }
    };
    console.log("Using Railway cloud database");
} else {
    dbConfig = {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    };
    console.log("Using local database");
}

const db = mysql.createConnection(dbConfig);


db.connect((err)=>{

    if(err){
        console.log("Database connection failed");
        console.log(err);
    }
    else{
        console.log("MySQL Connected");
    }

});



// Get customers

app.get("/api/customers",(req,res)=>{

    const sql = `
        SELECT *
        FROM customers
        ORDER BY id DESC
    `;

    db.query(sql,(err,result)=>{
        if(err){
            return res.status(500).json(err);
        }

        res.json(result);
    });

});

// Dashboard counts

app.get("/api/dashboard",(req,res)=>{

    const sql = `

    SELECT

    (SELECT COUNT(*) FROM customers) AS customers,

    (SELECT COUNT(*) FROM products) AS products,

    (SELECT COUNT(*) FROM sales) AS sales,    

    (SELECT COUNT(*) 
            FROM stock 
            WHERE quantity <= minimum_level
        ) AS lowStock

    `;


    db.query(sql,(err,result)=>{

        if(err)
            return res.status(500).json(err);


        res.json(result[0]);

    });


});

app.get("/api/products", (req, res) => {

    const sql = "SELECT * FROM products";

    db.query(sql, (err, result) => {

        if (err) {
            console.log(err);
            return res.status(500).json(err);
        }

        res.json(result);

    });

});

// Get Sales Data

app.get("/api/sales", (req, res) => {

    const sql = `
        SELECT

            id,
            invoice_no,
            customer_name,
            total_amount,
            payment_method,
            sale_date

        FROM sales

        ORDER BY id DESC

    `;

    db.query(sql, (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({
                error: "Failed to fetch sales"
            });

        }
        res.json(result);
    });
});

// Get Stock Data

app.get("/api/stock", (req, res) => {

    const sql = `

        SELECT

            id,
            product_name,
            quantity,
            minimum_level

        FROM stock

        ORDER BY quantity ASC

    `;

    db.query(sql, (err, result) => {
        if (err) {
            console.log(err);

            return res.status(500).json({
                error:"Failed to fetch stock"
            });

        }
        res.json(result);

    });
});


app.listen(process.env.PORT,()=>{

    console.log("Server running on port "+process.env.PORT);

});