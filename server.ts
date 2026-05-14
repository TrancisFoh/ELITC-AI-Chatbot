import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { ELITC_COURSES } from './src/data/courses'; 

const app = express();
const PORT = 3001;

// Middleware
app.use(cors({
    origin: '*', // Allows requests from any origin (e.g., your localhost:3000)
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Explicitly allows all methods
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Initialize Database and Run Migration
async function initDB() {
  const db = await open({
    filename: './database.sqlite', // This creates a local DB file
    driver: sqlite3.Database
  });

  // Create the courses table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS courses (
      id TEXT PRIMARY KEY,
      title TEXT,
      category TEXT,
      level TEXT,
      description TEXT,
      prerequisites TEXT,
      price REAL,
      duration TEXT,
      url TEXT
    );
  `);

  // Check if we need to add missing columns (for existing databases)
  const columns = await db.all("PRAGMA table_info(courses)");
  const columnNames = columns.map(c => c.name);
  if (!columnNames.includes('prerequisites')) {
    await db.exec("ALTER TABLE courses ADD COLUMN prerequisites TEXT");
  }
  if (!columnNames.includes('price')) {
    await db.exec("ALTER TABLE courses ADD COLUMN price REAL");
  }
  if (!columnNames.includes('duration')) {
    await db.exec("ALTER TABLE courses ADD COLUMN duration TEXT");
  }
  if (!columnNames.includes('url')) {
    await db.exec("ALTER TABLE courses ADD COLUMN url TEXT");
  }

  // MIGRATION LOGIC: Check if the table is empty. If it is, migrate the data!
  const row = await db.get('SELECT COUNT(*) as count FROM courses');
  if (row.count === 0) {
    console.log("Database is empty. Migrating courses from src/data/courses.ts...");
    
    for (const course of ELITC_COURSES) {
      await db.run(
        'INSERT INTO courses (id, title, category, level, description, prerequisites, price, duration, url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          course.id,
          course.title,
          course.category,
          course.level,
          course.description,
          JSON.stringify(course.prerequisites || []),
          course.price || 0,
          course.duration,
          course.url
        ]
      );
    }
    console.log(`✅ Successfully migrated ${ELITC_COURSES.length} courses to SQLite!`);
  } else {
    console.log(`✅ Database ready. Found ${row.count} existing courses.`);
  }

  return db;
}

const dbPromise = initDB();

// --- API ROUTES ---

// 1. GET: Read all courses
app.get('/api/courses', async (req, res) => {
    const db = await dbPromise;
    const courses = await db.all('SELECT * FROM courses');
    res.json(courses);
});

// 2. POST: Create a new course
app.post('/api/courses', async (req, res) => {
    const db = await dbPromise;
    const course = req.body;

    // The frontend might send an ID, if not, generate a unique one
    const id = course.id || `C-${Date.now()}`;

    try {
        await db.run(
            'INSERT INTO courses (id, title, category, level, description, prerequisites, price, duration, url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [
              id,
              course.title,
              course.category,
              course.level,
              course.description,
              JSON.stringify(course.prerequisites || []),
              course.price || 0,
              course.duration,
              course.url
            ]
        );
        res.status(201).json({ ...course, id }); // Send back the created course
    } catch (error) {
        console.error("Error adding course:", error);
        res.status(500).json({ error: "Failed to add course" });
    }
});

// 3. PUT: Update an existing course
app.put('/api/courses/:id', async (req, res) => {
    const db = await dbPromise;
    const id = req.params.id;
    const course = req.body;

    try {
        await db.run(
            'UPDATE courses SET title = ?, category = ?, level = ?, description = ?, prerequisites = ?, price = ?, duration = ?, url = ? WHERE id = ?',
            [
              course.title,
              course.category,
              course.level,
              course.description,
              JSON.stringify(course.prerequisites || []),
              course.price || 0,
              course.duration,
              course.url,
              id
            ]
        );
        res.json({ ...course, id }); // Send back the updated course
    } catch (error) {
        console.error("Error updating course:", error);
        res.status(500).json({ error: "Failed to update course" });
    }
});

// 4. DELETE: Remove a course
app.delete('/api/courses/:id', async (req, res) => {
    const db = await dbPromise;
    const id = req.params.id;

    try {
        await db.run('DELETE FROM courses WHERE id = ?', [id]);
        res.json({ success: true, id }); // Confirm deletion
    } catch (error) {
        console.error("Error deleting course:", error);
        res.status(500).json({ error: "Failed to delete course" });
    }
});

// Fallback for system configs so your UI doesn't break
app.get('/api/configs/system-instruction', (req, res) => {
    res.json({ value: "You are the ELITC Assistant, an expert training consultant for the Electronics Industries Training Centre." });
});

// Start the server
app.listen(PORT, () => {
    console.log(`🚀 Backend server running on http://localhost:${PORT}`);
});