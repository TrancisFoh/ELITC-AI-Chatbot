import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { ELITC_COURSES } from './src/data/courses'; 
import { DEFAULT_SYSTEM_INSTRUCTION } from './src/services/gemini';

const app = express();
const PORT = 3001;

// Middleware
app.use(cors({
    origin: '*', 
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], 
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// ============================================================================
// DATABASE INITIALIZATION & MIGRATION
// ============================================================================
// This function sets up the SQLite database when the server starts.
// It creates the necessary tables ('courses' and 'configs') and populates
// them with initial hardcoded data from 'src/data/courses.ts' if needed.
async function initDB() {
  const db = await open({
    filename: './database.sqlite', // The local file where all data is persistently stored
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
      targetAudience TEXT,
      url TEXT
    );
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS configs (
      id TEXT PRIMARY KEY,
      key TEXT UNIQUE,
      value TEXT
    );
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS chat_logs (
      id TEXT PRIMARY KEY,
      session_id TEXT,
      role TEXT,
      content TEXT,
      timestamp INTEGER
    );
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS error_logs (
      id TEXT PRIMARY KEY,
      session_id TEXT,
      error_message TEXT,
      stack_trace TEXT,
      component TEXT,
      timestamp INTEGER
    );
  `);
  
  await db.run(
    'INSERT OR IGNORE INTO configs (id, key, value) VALUES (?, ?, ?)',
    ['config-1', 'SYSTEM_PROMPT', DEFAULT_SYSTEM_INSTRUCTION.trim()]
  );

  console.log("Database schema updated. Migrating courses from src/data/courses.ts...");
  
  for (const course of ELITC_COURSES) {
    await db.run(
      'INSERT INTO courses (id, title, category, duration, synopsis, objectives, targetAudience, url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [
        course.id, 
        course.title, 
        course.category, 
        course.duration,
        course.synopsis,
        JSON.stringify(course.objectives || []),
        JSON.stringify(course.targetAudience || []),
        course.url
      ]
    );
  }
  console.log(`✅ Successfully migrated ${ELITC_COURSES.length} courses to SQLite!`);

  return db;
}

const dbPromise = initDB();

// ============================================================================
// API ROUTES - COURSE MANAGEMENT
// ============================================================================
// These endpoints allow the frontend Admin Dashboard to perform CRUD operations
// (Create, Read, Update, Delete) on the courses dataset.

// 1. GET: Read all courses
// Fetches all courses from the database. It also parses the 'objectives' and 
// 'targetAudience' JSON strings back into JavaScript arrays for the frontend.
app.get('/api/courses', async (req, res) => {
    const db = await dbPromise;
    const courses = await db.all('SELECT * FROM courses');
    const parsedCourses = courses.map(c => ({
        ...c,
        objectives: typeof c.objectives === 'string' ? JSON.parse(c.objectives) : c.objectives,
        targetAudience: typeof c.targetAudience === 'string' ? JSON.parse(c.targetAudience) : c.targetAudience
    }));
    res.json(parsedCourses);
});

// 2. POST: Create a new course
// Accepts a new course object from the frontend and inserts it into the database.
// Stringifies arrays into JSON text before saving to SQLite.
app.post('/api/courses', async (req, res) => {
    const db = await dbPromise;
    const course = req.body;
    const id = course.id || `C-${Date.now()}`;

    try {
        await db.run(
            'INSERT INTO courses (id, title, category, duration, synopsis, objectives, targetAudience, url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [
              id, 
              course.title, 
              course.category, 
              course.duration,
              course.synopsis,
              JSON.stringify(course.objectives || []),
              JSON.stringify(course.targetAudience || []),
              course.url
            ]
        );
        res.status(201).json({ ...course, id });
    } catch (error) {
        console.error("Error adding course:", error);
        res.status(500).json({ error: "Failed to add course" });
    }
});

// 3. PUT: Update an existing course
// Finds a course by its specific ID and overwrites its fields with the new data.
app.put('/api/courses/:id', async (req, res) => {
    const db = await dbPromise;
    const id = req.params.id;
    const course = req.body;

    try {
        await db.run(
            'UPDATE courses SET title = ?, category = ?, duration = ?, synopsis = ?, objectives = ?, targetAudience = ?, url = ? WHERE id = ?',
            [
              course.title, 
              course.category, 
              course.duration,
              course.synopsis,
              JSON.stringify(course.objectives || []),
              JSON.stringify(course.targetAudience || []),
              course.url,
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
// Permanently deletes a course from the SQLite database using its ID.
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

// ============================================================================
// API ROUTES - CONFIGURATION & SYSTEM SETTINGS
// ============================================================================
// These endpoints manage dynamic configurations, such as the AI's System Prompt.

// GET: Fetch specifically the system instruction used by the Gemini AI
app.get('/api/configs/system-instruction', async (req, res) => {
    try {
        const db = await dbPromise;
        const config = await db.get('SELECT value FROM configs WHERE key = ?', ['SYSTEM_PROMPT']);
        res.json({ value: config ? config.value : "You are the ELITC Assistant, an expert training consultant for the Electronics Industries Training Centre." });
    } catch (error) {
        console.error("Error fetching system instruction:", error);
        res.status(500).json({ error: "Failed to fetch system instruction" });
    }
});

// 5. GET: Read all configurations
// Fetches all stored configuration key-value pairs.
app.get('/api/configs', async (req, res) => {
    try {
        const db = await dbPromise;
        const configs = await db.all('SELECT * FROM configs');
        res.json(configs);
    } catch (error) {
        console.error("Error fetching configs:", error);
        res.status(500).json({ error: "Failed to fetch configs" });
    }
});

// 6. POST: Create a new configuration
app.post('/api/configs', async (req, res) => {
    const db = await dbPromise;
    const config = req.body;
    const id = config.id || `CFG-${Date.now()}`;

    try {
        await db.run(
            'INSERT INTO configs (id, key, value) VALUES (?, ?, ?)',
            [id, config.key, config.value]
        );
        res.status(201).json({ ...config, id });
    } catch (error) {
        console.error("Error adding config:", error);
        res.status(500).json({ error: "Failed to add config" });
    }
});

// 7. PUT: Update an existing configuration
app.put('/api/configs/:id', async (req, res) => {
    const db = await dbPromise;
    const id = req.params.id;
    const config = req.body;

    try {
        await db.run(
            'UPDATE configs SET key = ?, value = ? WHERE id = ?',
            [config.key, config.value, id]
        );
        res.json({ ...config, id });
    } catch (error) {
        console.error("Error updating config:", error);
        res.status(500).json({ error: "Failed to update config" });
    }
});

// ============================================================================
// API ROUTES - CHAT LOGS & RETENTION POLICY
// ============================================================================

// 8. POST: Log a new chat message
// Records a chat message in the DB and runs the 1-week automatic retention deletion.
app.post('/api/chat-logs', async (req, res) => {
    const db = await dbPromise;
    const { session_id, role, content } = req.body;
    const id = `MSG-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const timestamp = Date.now();

    if (!session_id || !role || !content) {
        res.status(400).json({ error: "Missing required fields: session_id, role, content" });
        return;
    }

    try {
        await db.run(
            'INSERT INTO chat_logs (id, session_id, role, content, timestamp) VALUES (?, ?, ?, ?, ?)',
            [id, session_id, role, content, timestamp]
        );

        // Weekly retention policy: Delete any messages older than 7 days
        const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        const deleteResult = await db.run('DELETE FROM chat_logs WHERE timestamp < ?', [oneWeekAgo]);
        if (deleteResult.changes && deleteResult.changes > 0) {
            console.log(`🧹 Auto-retention: Cleared ${deleteResult.changes} messages older than 1 week.`);
        }

        res.status(201).json({ id, session_id, role, content, timestamp });
    } catch (error) {
        console.error("Error saving chat log:", error);
        res.status(500).json({ error: "Failed to save chat log" });
    }
});

// 9. GET: Read all distinct chat sessions for audit
app.get('/api/chat-logs/sessions', async (req, res) => {
    try {
        const db = await dbPromise;
        // Group messages by session_id, sorting by latest activity
        const sessions = await db.all(`
            SELECT 
                session_id, 
                count(*) as count, 
                max(timestamp) as last_active,
                (SELECT content FROM chat_logs WHERE session_id = t.session_id ORDER BY timestamp DESC LIMIT 1) as last_message
            FROM chat_logs t
            GROUP BY session_id
            ORDER BY last_active DESC
        `);
        res.json(sessions);
    } catch (error) {
        console.error("Error fetching chat sessions:", error);
        res.status(500).json({ error: "Failed to fetch chat sessions" });
    }
});

// 10. GET: Read all messages in a specific session
app.get('/api/chat-logs/sessions/:session_id', async (req, res) => {
    const session_id = req.params.session_id;
    try {
        const db = await dbPromise;
        const messages = await db.all(
            'SELECT * FROM chat_logs WHERE session_id = ? ORDER BY timestamp ASC',
            [session_id]
        );
        res.json(messages);
    } catch (error) {
        console.error("Error fetching session messages:", error);
        res.status(500).json({ error: "Failed to fetch session messages" });
    }
});

// ============================================================================
// API ROUTES - ERROR LOGGING
// ============================================================================

// 11. POST: Log a client-side error
app.post('/api/error-logs', async (req, res) => {
    const db = await dbPromise;
    const { session_id, error_message, stack_trace, component } = req.body;
    const id = `ERR-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const timestamp = Date.now();

    if (!error_message || !component) {
        res.status(400).json({ error: "Missing required fields: error_message, component" });
        return;
    }

    try {
        await db.run(
            'INSERT INTO error_logs (id, session_id, error_message, stack_trace, component, timestamp) VALUES (?, ?, ?, ?, ?, ?)',
            [id, session_id || null, error_message, stack_trace || null, component, timestamp]
        );

        // Weekly retention policy: Delete any error logs older than 7 days
        const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        const deleteResult = await db.run('DELETE FROM error_logs WHERE timestamp < ?', [oneWeekAgo]);
        if (deleteResult.changes && deleteResult.changes > 0) {
            console.log(`🧹 Auto-retention: Cleared ${deleteResult.changes} error logs older than 1 week.`);
        }

        res.status(201).json({ id, session_id, error_message, stack_trace, component, timestamp });
    } catch (error) {
        console.error("Error saving error log:", error);
        res.status(500).json({ error: "Failed to save error log" });
    }
});

// 12. GET: Read all error logs sorted by timestamp DESC
app.get('/api/error-logs', async (req, res) => {
    try {
        const db = await dbPromise;
        const logs = await db.all('SELECT * FROM error_logs ORDER BY timestamp DESC');
        res.json(logs);
    } catch (error) {
        console.error("Error fetching error logs:", error);
        res.status(500).json({ error: "Failed to fetch error logs" });
    }
});

// 13. DELETE: Clear all error logs
app.delete('/api/error-logs', async (req, res) => {
    try {
        const db = await dbPromise;
        await db.run('DELETE FROM error_logs');
        res.json({ success: true });
    } catch (error) {
        console.error("Error clearing error logs:", error);
        res.status(500).json({ error: "Failed to clear error logs" });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`🚀 Backend server running on http://localhost:${PORT}`);
});
