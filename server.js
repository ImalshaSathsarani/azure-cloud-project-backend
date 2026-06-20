// const express = require('express');
// const mysql = require('mysql2');
// const { BlobServiceClient} = require('@azure/storage-blob');
// const multer = require('multer');
// const cors = require('cors');
// require('dotenv').config();

// const app = express();
// app.use(cors());
// app.use(express.json());

// const PORT = process.env.PORT || 8080;

// // 1. Azure Database for MySQL Connection Setup\

// const dbConfig = {
//     host: process.env.DB_HOST,
//     user: process.env.DB_USER,
//     password: process.env.DB_PASSWORD,
//     database: process.env.DB_NAME || 'taskdb',
//     port: 3306,
//     ssl: {
//         rejectUnauthorized: false
//     }
// }

// const pool = mysql.createPool(dbConfig).promise();

// // Auto-initialize the database schema table
// async function initDatabase() {
//   try{
//     await pool.query(`
//         CREATE TABLE IF NOT EXISTS tasks (
//         id INT AUTO_INCREMENT PRIMARY KEY,
//         title VARCHAR(255) NOT NULL,
//         priority VARCHAR(50) DEFAULT 'Medium',
//         attachmentUrl VARCHAR(500) DEFAULT NULL,
//         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//         )
//         `);
//         console.log("Azure MySQL Tables initialized.");

//   }catch(e){
//     console.error('Databse connection/initialization error:', e.message);
//   }
// }

// initDatabase();

// // 2. Azure Storage Config
// const blobServiceClient = process.env.AZURE_STORAGE_CONNECTION_STRING ? BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING) : null;
// const CONTAINER_NAME= process.env.AZURE_STORAGE_CONTAINER_NAME || 'task-assets';
// const upload = multer({storage: multer.memoryStorage()});

// // --- API Endpoints ---

// // API Health Check
// app.get('/', (req,res)=> {
//     res.send({status: "Task Hub API is online!"});
// });

// // GET: Fetch all tasks
// app.get('/api/tasks' , async (req,res)=>{
//     try{
//         const [rows] = await pool.query('SELECT * FROM tasks ORDER BY created_at DESC')
//         res.json(rows);
//     }catch(e){
//         console.error('Error fetching tasks:', e.message);
//         res.status(500).json({error: 'Failed to fetch tasks'});
//     }
// });

// // POST: Add new task with attachment uploading to Azure Blob Storage
// app.post('/api/tasks', upload.single('file'), async (req,res)=>{

//     try{
//         const { title, priority } = req.body;
//         let attachmentUrl = null;

//         if (req.file && blobServiceClient) {
//             const containerClient = blobServiceClient.getBlobContainerClient(CONTAINER_NAME);
//             const blobName = `${Date.now()}-${req.file.originalname}`;
//             const blockBlobClient = containerClient.getBlockBlobClient(blobName);

//             await blockBlobClient.upload(req.file.buffer, req.file.buffer.length,{
//                 blobHTTPHeaders : {blobContentType: req.file.mimetype}
//             });
//             attachmentUrl = blockBlobClient.url;
//         }

//         const [result] = await pool.query(
//             'INSERT INTO tasks (title, priority, attachmentUrl) VALUES (?, ?, ?)',
//             [title, priority, attachmentUrl]
//         );

//         res.status(201).json({ id: result.insertId, title, priority, attachmentUrl, success: true,message: 'Task created successfully' });
//     }catch(e){
//         console.error('Error creating task:', e.message);
//         res.status(500).json({error: 'Failed to create task'});
//     }
// })

// app.listen(PORT, () => {
//     console.log(`Task Hub API is running on port ${PORT}`);

// })

// const express = require("express");
// const cors = require("cors");
// const multer = require("multer");
// const db = require("./db");

// const app = express();

// app.use(cors());
// app.use(express.json());

// const storage = multer.memoryStorage();
// const upload = multer({ storage });

// app.get("/notes", async (req, res) => {

//     const [rows] = await db.query(
//         "SELECT * FROM notes ORDER BY id DESC"
//     );

//     res.json(rows);
// });

// app.post("/notes", upload.single("image"), async (req, res) => {

//     const { title, description } = req.body;

//     let imageUrl = "";

//     if (req.file) {
//         imageUrl = `uploads/${req.file.originalname}`;
//     }

//     await db.query(
//         "INSERT INTO notes(title,description,image_url) VALUES(?,?,?)",
//         [title, description, imageUrl]
//     );

//     res.json({
//         success: true
//     });
// });

// app.delete("/notes/:id", async (req, res) => {

//     await db.query(
//         "DELETE FROM notes WHERE id=?",
//         [req.params.id]
//     );

//     res.json({
//         success: true
//     });
// });

// app.listen(5000, () => {
//     console.log("Server Running");
// });

// const express = require("express");
// const cors = require("cors");
// const multer = require("multer");
// const { BlobServiceClient } = require("@azure/storage-blob"); // Added Azure Storage SDK
// const db = require("./db");
// require('dotenv').config();

// const app = express();

// app.use(cors());
// app.use(express.json());
// app.use('/uploads', express.static('uploads'));
// // Set up Multer to keep files in memory buffers rather than writing local files
// const storage = multer.memoryStorage();
// const upload = multer({ storage });

// // Azure Storage Account Setup
// const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;
// const CONTAINER_NAME = process.env.AZURE_CONTAINER_NAME || "notes-assets";
// let blobServiceClient = null;

// if (AZURE_STORAGE_CONNECTION_STRING) {
//     blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
// }

// // 🚀 AUTO-CREATE TABLE INITIALIZER
// // This runs immediately when the server boots up, ensuring your database tables exist
// async function initializeDatabaseSchema() {
//     try {
//         await db.query(`
//             CREATE TABLE IF NOT EXISTS notes (
//                 id INT AUTO_INCREMENT PRIMARY KEY,
//                 title VARCHAR(255) NOT NULL,
//                 description TEXT,
//                 image_url VARCHAR(500) DEFAULT NULL,
//                 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//             )
//         `);
//         console.log("Database table 'notes' is verified and ready.");
//     } catch (err) {
//         console.error("Failed to automatically initialize database schema:", err.message);
//     }
// }
// initializeDatabaseSchema();

// // GET: Load all notes
// app.get("/notes", async (req, res) => {
//     try {
//         const [rows] = await db.query("SELECT * FROM notes ORDER BY id DESC");
//         res.json(rows);
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// });

// // POST: Add a new note with optional Azure Blob streaming
// app.post("/notes", upload.single("image"), async (req, res) => {
//     try {
//         const { title, description } = req.body;
//         let imageUrl = "";

//         // If a file exists and Azure Connection String is configured, upload to Azure Storage
//         if (req.file && blobServiceClient) {
//             const containerClient = blobServiceClient.getContainerClient(CONTAINER_NAME);
//             const blobName = `${Date.now()}-${req.file.originalname}`;
//             const blockBlobClient = containerClient.getBlockBlobClient(blobName);

//             // Stream the file directly from memory buffer up to the Azure Cloud
//             await blockBlobClient.upload(req.file.buffer, req.file.buffer.length, {
//                 blobHTTPHeaders: { blobContentType: req.file.mimetype }
//             });

//             // Set imageUrl to the public Azure URL string
//             imageUrl = blockBlobClient.url;
//         } else if (req.file) {
//             // Local fallback if Azure environment variables aren't set yet during local testing
//             imageUrl = `uploads/${req.file.originalname}`;
//         }

//         await db.query(
//             "INSERT INTO notes(title, description, image_url) VALUES(?,?,?)",
//             [title, description, imageUrl]
//         );

//         res.json({ success: true });
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// });

// // DELETE: Remove a note
// app.delete("/notes/:id", async (req, res) => {
//     try {
//         await db.query("DELETE FROM notes WHERE id=?", [req.params.id]);
//         res.json({ success: true });
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// });

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//     console.log(`Server Running on port ${PORT}`);
// });

const express = require("express");
const cors = require("cors");
const multer = require("multer");
const { BlobServiceClient } = require("@azure/storage-blob");
const db = require("./db");
const fs = require("fs"); // Added Node.js File System module
const path = require("path");
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// 📁 Ensure the local 'uploads' directory exists for local testing fallback
const UPLOADS_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOADS_DIR)){
    fs.mkdirSync(UPLOADS_DIR);
}

app.use('/uploads', express.static(UPLOADS_DIR));

// Keep files in memory buffers to support direct cloud streaming
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Azure Storage Account Setup
const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;
const CONTAINER_NAME = process.env.AZURE_CONTAINER_NAME || "notes-assets";
let blobServiceClient = null;

if (AZURE_STORAGE_CONNECTION_STRING) {
    blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
}

// 🚀 AUTO-CREATE TABLE INITIALIZER
async function initializeDatabaseSchema() {
    try {
        await db.query(`
            CREATE TABLE IF NOT EXISTS notes (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                image_url VARCHAR(500) DEFAULT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log("Database table 'notes' is verified and ready.");
    } catch (err) {
        console.error("Failed to automatically initialize database schema:", err.message);
    }
}
initializeDatabaseSchema();

// GET: Load all notes
app.get("/notes", async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM notes ORDER BY id DESC");
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST: Add a new note
app.post("/notes", upload.single("image"), async (req, res) => {
    try {
        const { title, description } = req.body;
        let imageUrl = "";

        console.log("--- New Note Request Received ---");
        console.log("Text Body Content:", req.body);
        console.log("Intercepted File Buffer Object:", req.file);

        if (req.file) {
            const uniqueFileName = `${Date.now()}-${req.file.originalname}`;

            // A. PRODUCTION ROUTE: Upload to Azure Storage Account
            if (blobServiceClient) {
                const containerClient = blobServiceClient.getContainerClient(CONTAINER_NAME);
                const blockBlobClient = containerClient.getBlockBlobClient(uniqueFileName);

                await blockBlobClient.upload(req.file.buffer, req.file.buffer.length, {
                    blobHTTPHeaders: { blobContentType: req.file.mimetype }
                });

                imageUrl = blockBlobClient.url;
            } 
            // B. LOCAL FALLBACK ROUTE: Actually write the memory buffer to your local disk
            else {
                const localFilePath = path.join(UPLOADS_DIR, uniqueFileName);
                
                // Write the file from RAM memory buffer down onto your hard drive
                fs.writeFileSync(localFilePath, req.file.buffer);
                
                // Save the dynamic link pointing to your local server port context
                imageUrl = `http://localhost:${process.env.PORT || 5000}/uploads/${uniqueFileName}`;
            }
        }

        await db.query(
            "INSERT INTO notes(title, description, image_url) VALUES(?,?,?)",
            [title, description, imageUrl]
        );

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE: Remove a note
app.delete("/notes/:id", async (req, res) => {
    try {
        // Optional: Local cleanup if you want to delete the file from the hard drive too
        const [rows] = await db.query("SELECT image_url FROM notes WHERE id=?", [req.params.id]);
        if (rows.length > 0 && rows[0].image_url && rows[0].image_url.includes('localhost')) {
            const fileName = rows[0].image_url.split('/uploads/')[1];
            const filePath = path.join(UPLOADS_DIR, fileName);
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }

        await db.query("DELETE FROM notes WHERE id=?", [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server Running on port ${PORT}`);
});