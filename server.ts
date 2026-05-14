import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { ELITC_COURSES } from './src/data/courses'; 

const app = express();
const PORT = 3001;

// Middleware
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Initialize Database and Run Migration
async function initDB() {
  const db = await open({
    filename: './database.sqlite',
    driver: sqlite3.Database
  });

  // Re-create the courses table with the requested schema
  await db.exec(`DROP TABLE IF EXISTS courses;`);
  await db.exec(`
    CREATE TABLE courses (
      id TEXT PRIMARY KEY,
      title TEXT,
      category TEXT,
      duration TEXT,
      synopsis TEXT,
      objectives TEXT,
      targetAudience TEXT
    );
  `);

  console.log("Database schema updated. Migrating courses from src/data/courses.ts...");

  for (const course of ELITC_COURSES) {
    await db.run(
      'INSERT INTO courses (id, title, category, duration, synopsis, objectives, targetAudience) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        course.id,
        course.title,
        course.category,
        course.duration,
        course.synopsis,
        JSON.stringify(course.objectives || []),
        JSON.stringify(course.targetAudience || [])
      ]
    );
  }
  console.log(`✅ Successfully migrated ${ELITC_COURSES.length} courses to SQLite!`);

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
    const id = course.id || `C-${Date.now()}`;

    try {
        await db.run(
            'INSERT INTO courses (id, title, category, duration, synopsis, objectives, targetAudience) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [
              id,
              course.title,
              course.category,
              course.duration,
              course.synopsis,
              JSON.stringify(course.objectives || []),
              JSON.stringify(course.targetAudience || [])
            ]
        );
        res.status(201).json({ ...course, id });
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
            'UPDATE courses SET title = ?, category = ?, duration = ?, synopsis = ?, objectives = ?, targetAudience = ? WHERE id = ?',
            [
              course.title,
              course.category,
              course.duration,
              course.synopsis,
              JSON.stringify(course.objectives || []),
              JSON.stringify(course.targetAudience || []),
              id
            ]
        );
        res.json({ ...course, id });
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
        res.json({ success: true, id });
    } catch (error) {
        console.error("Error deleting course:", error);
        res.status(500).json({ error: "Failed to delete course" });
    }
});

app.get('/api/configs/system-instruction', (req, res) => {
    res.json({ value: "You are the ELITC Assistant, an expert training consultant for the Electronics Industries Training Centre." });
});

// Start the server
app.listen(PORT, () => {
    console.log(`🚀 Backend server running on http://localhost:${PORT}`);
});
