import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import express from 'express';
import cors from 'cors';
import sql from 'mssql/msnodesqlv8';
import { ELITC_COURSES } from '../../frontend/Models/courses';
import { DEFAULT_SYSTEM_INSTRUCTION } from '../../frontend/Controllers/gemini';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const app = express();
const PORT = 3001;

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key_for_dev_123';

// Middleware
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

const verifyToken = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
        return;
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        (req as any).user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ error: 'Unauthorized: Invalid token' });
        return;
    }
};

// LocalDB uses named pipes, not TCP. Get the pipe path dynamically.
async function getLocalDBPipe(): Promise<string> {
    const { execSync } = await import('child_process');
    try {
        const output = execSync('sqllocaldb info MSSQLLocalDB', { encoding: 'utf8' });
        const match = output.match(/Instance pipe name:\s+(np:.+)/i);
        if (match) return match[1].trim();
    } catch {
        // fall through to default
    }
    return 'np:\\\\.\\pipe\\LOCALDB#MSSQLLocalDB\\tsql\\query';
}

// ============================================================================
// DATABASE INITIALIZATION & MIGRATION
// ============================================================================
// Creates all tables if they don't exist, and seeds the courses table
// from the static courses data file if it's empty.
let pool: sql.ConnectionPool;


async function initDB() {
    const server = process.env.DB_SERVER || 'MSI\\SQLEXPRESS02';
    const database = process.env.DB_NAME || 'elitc_chatbot';
    console.log(`Connecting to SQL Server at: ${server}`);

    const dbConfig = {
        driver: 'msnodesqlv8',
        connectionString: `Server=${server};Database=${database};Trusted_Connection=yes;Driver={SQL Server};`
    };

    pool = await sql.connect(dbConfig);
    console.log('✅ Connected to SQL Server database:', database);



    // Create tables if they don't already exist
    await pool.request().query(`
        IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='courses' AND xtype='U')
        CREATE TABLE courses (
            id          NVARCHAR(100) PRIMARY KEY,
            title       NVARCHAR(500),
            category    NVARCHAR(200),
            duration    NVARCHAR(100),
            synopsis    NVARCHAR(MAX),
            objectives  NVARCHAR(MAX),
            targetAudience NVARCHAR(MAX),
            url         NVARCHAR(500)
        );
    `);

    await pool.request().query(`
        IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='configs' AND xtype='U')
        CREATE TABLE configs (
            id      NVARCHAR(100) PRIMARY KEY,
            [key]   NVARCHAR(200) UNIQUE,
            value   NVARCHAR(MAX)
        );
    `);

    await pool.request().query(`
        IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='chat_logs' AND xtype='U')
        CREATE TABLE chat_logs (
            id          NVARCHAR(100) PRIMARY KEY,
            session_id  NVARCHAR(200),
            role        NVARCHAR(50),
            content     NVARCHAR(MAX),
            timestamp   BIGINT
        );
    `);

    await pool.request().query(`
        IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='error_logs' AND xtype='U')
        CREATE TABLE error_logs (
            id              NVARCHAR(100) PRIMARY KEY,
            session_id      NVARCHAR(200),
            error_message   NVARCHAR(MAX),
            stack_trace     NVARCHAR(MAX),
            component       NVARCHAR(200),
            timestamp       BIGINT
        );
    `);

    await pool.request().query(`
        IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='users' AND xtype='U')
        CREATE TABLE users (
            id          NVARCHAR(100) PRIMARY KEY,
            username    NVARCHAR(100) UNIQUE,
            password    NVARCHAR(200),
            role        NVARCHAR(50),
            created_at  BIGINT
        );
    `);

    // Seed default admin user
    const userCountResult = await pool.request().query(`SELECT COUNT(*) as cnt FROM users`);
    if (userCountResult.recordset[0].cnt === 0) {
        console.log('Seeding default admin user...');
        const hashedPassword = await bcrypt.hash('Admin1234', 10);
        await pool.request()
            .input('id', sql.NVarChar, `USR-${Date.now()}`)
            .input('username', sql.NVarChar, 'admin')
            .input('password', sql.NVarChar, hashedPassword)
            .input('role', sql.NVarChar, 'admin')
            .input('created_at', sql.BigInt, Date.now())
            .query(`INSERT INTO users (id, username, password, role, created_at) VALUES (@id, @username, @password, @role, @created_at)`);
        console.log('✅ Default admin user created (admin / Admin1234)');
    }

    // Seed default system prompt if not already present
    await pool.request()
        .input('id', sql.NVarChar, 'config-1')
        .input('key', sql.NVarChar, 'SYSTEM_PROMPT')
        .input('value', sql.NVarChar, DEFAULT_SYSTEM_INSTRUCTION.trim())
        .query(`
            IF NOT EXISTS (SELECT 1 FROM configs WHERE [key] = @key)
                INSERT INTO configs (id, [key], value) VALUES (@id, @key, @value);
        `);

    // Seed courses if the table is empty
    const countResult = await pool.request().query(`SELECT COUNT(*) as cnt FROM courses`);
    const count = countResult.recordset[0].cnt;

    if (count === 0) {
        console.log('Seeding courses from src/data/courses.ts...');
        for (const course of ELITC_COURSES) {
            await pool.request()
                .input('id', sql.NVarChar, course.id)
                .input('title', sql.NVarChar, course.title)
                .input('category', sql.NVarChar, course.category)
                .input('duration', sql.NVarChar, course.duration)
                .input('synopsis', sql.NVarChar, course.synopsis)
                .input('objectives', sql.NVarChar, JSON.stringify(course.objectives || []))
                .input('targetAudience', sql.NVarChar, JSON.stringify(course.targetAudience || []))
                .input('url', sql.NVarChar, course.url)
                .query(`
                    INSERT INTO courses (id, title, category, duration, synopsis, objectives, targetAudience, url)
                    VALUES (@id, @title, @category, @duration, @synopsis, @objectives, @targetAudience, @url)
                `);
        }
        console.log(`✅ Successfully seeded ${ELITC_COURSES.length} courses to SQL Server!`);
    } else {
        console.log(`ℹ️  Courses table already has ${count} rows — skipping seed.`);
    }
}

// ============================================================================
// API ROUTES - AUTHENTICATION
// ============================================================================

app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        res.status(400).json({ error: 'Username and password required' });
        return;
    }

    try {
        const result = await pool.request()
            .input('username', sql.NVarChar, username)
            .query('SELECT * FROM users WHERE username = @username');
        
        if (result.recordset.length === 0) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }

        const user = result.recordset[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }

        const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
        res.json({ token, user: { username: user.username, role: user.role } });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/auth/register', verifyToken, async (req, res) => {
    const { username, password, role } = req.body;
    if (!username || !password) {
        res.status(400).json({ error: 'Username and password required' });
        return;
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const id = `USR-${Date.now()}`;
        const userRole = role || 'admin';
        const timestamp = Date.now();

        await pool.request()
            .input('id', sql.NVarChar, id)
            .input('username', sql.NVarChar, username)
            .input('password', sql.NVarChar, hashedPassword)
            .input('role', sql.NVarChar, userRole)
            .input('created_at', sql.BigInt, timestamp)
            .query(`INSERT INTO users (id, username, password, role, created_at) VALUES (@id, @username, @password, @role, @created_at)`);

        res.status(201).json({ message: 'User created successfully', username });
    } catch (err: any) {
        console.error('Registration error:', err);
        if (err.message && err.message.includes('Violation of UNIQUE KEY constraint')) {
            res.status(409).json({ error: 'Username already exists' });
        } else {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
});

app.get('/api/auth/me', verifyToken, (req, res) => {
    res.json({ user: (req as any).user });
});

// ============================================================================
// API ROUTES - COURSE MANAGEMENT
// ============================================================================

// 1. GET: Read all courses
app.get('/api/courses', async (req, res) => {
    try {
        const result = await pool.request().query('SELECT * FROM courses');
        const parsedCourses = result.recordset.map(c => ({
            ...c,
            objectives: typeof c.objectives === 'string' ? JSON.parse(c.objectives) : c.objectives,
            targetAudience: typeof c.targetAudience === 'string' ? JSON.parse(c.targetAudience) : c.targetAudience,
        }));
        res.json(parsedCourses);
    } catch (error) {
        console.error('Error fetching courses:', error);
        res.status(500).json({ error: 'Failed to fetch courses' });
    }
});

// 2. POST: Create a new course
app.post('/api/courses', verifyToken, async (req, res) => {
    const course = req.body;
    const id = course.id || `C-${Date.now()}`;
    try {
        await pool.request()
            .input('id', sql.NVarChar, id)
            .input('title', sql.NVarChar, course.title)
            .input('category', sql.NVarChar, course.category)
            .input('duration', sql.NVarChar, course.duration)
            .input('synopsis', sql.NVarChar, course.synopsis)
            .input('objectives', sql.NVarChar, JSON.stringify(course.objectives || []))
            .input('targetAudience', sql.NVarChar, JSON.stringify(course.targetAudience || []))
            .input('url', sql.NVarChar, course.url)
            .query(`
                INSERT INTO courses (id, title, category, duration, synopsis, objectives, targetAudience, url)
                VALUES (@id, @title, @category, @duration, @synopsis, @objectives, @targetAudience, @url)
            `);
        res.status(201).json({ ...course, id });
    } catch (error) {
        console.error('Error adding course:', error);
        res.status(500).json({ error: 'Failed to add course' });
    }
});

// 3. PUT: Update an existing course
app.put('/api/courses/:id', verifyToken, async (req, res) => {
    const id = req.params.id;
    const course = req.body;
    try {
        await pool.request()
            .input('id', sql.NVarChar, id)
            .input('title', sql.NVarChar, course.title)
            .input('category', sql.NVarChar, course.category)
            .input('duration', sql.NVarChar, course.duration)
            .input('synopsis', sql.NVarChar, course.synopsis)
            .input('objectives', sql.NVarChar, JSON.stringify(course.objectives || []))
            .input('targetAudience', sql.NVarChar, JSON.stringify(course.targetAudience || []))
            .input('url', sql.NVarChar, course.url)
            .query(`
                UPDATE courses
                SET title = @title, category = @category, duration = @duration,
                    synopsis = @synopsis, objectives = @objectives,
                    targetAudience = @targetAudience, url = @url
                WHERE id = @id
            `);
        res.json({ ...course, id });
    } catch (error) {
        console.error('Error updating course:', error);
        res.status(500).json({ error: 'Failed to update course' });
    }
});

// 4. DELETE: Remove a course
app.delete('/api/courses/:id', verifyToken, async (req, res) => {
    const id = req.params.id;
    try {
        await pool.request()
            .input('id', sql.NVarChar, id)
            .query('DELETE FROM courses WHERE id = @id');
        res.json({ success: true, id });
    } catch (error) {
        console.error('Error deleting course:', error);
        res.status(500).json({ error: 'Failed to delete course' });
    }
});

// ============================================================================
// API ROUTES - CONFIGURATION & SYSTEM SETTINGS
// ============================================================================

// GET: Fetch specifically the system instruction used by the Gemini AI
app.get('/api/configs/system-instruction', async (req, res) => {
    try {
        const result = await pool.request()
            .query(`SELECT value FROM configs WHERE [key] = 'SYSTEM_PROMPT'`);
        const config = result.recordset[0];
        res.json({ value: config ? config.value : 'You are the ELITC Assistant, an expert training consultant for the Electronics Industries Training Centre.' });
    } catch (error) {
        console.error('Error fetching system instruction:', error);
        res.status(500).json({ error: 'Failed to fetch system instruction' });
    }
});

// 5. GET: Read all configurations
app.get('/api/configs', async (req, res) => {
    try {
        const result = await pool.request().query('SELECT * FROM configs');
        res.json(result.recordset);
    } catch (error) {
        console.error('Error fetching configs:', error);
        res.status(500).json({ error: 'Failed to fetch configs' });
    }
});

// 6. POST: Create a new configuration
app.post('/api/configs', verifyToken, async (req, res) => {
    const config = req.body;
    const id = config.id || `CFG-${Date.now()}`;
    try {
        await pool.request()
            .input('id', sql.NVarChar, id)
            .input('key', sql.NVarChar, config.key)
            .input('value', sql.NVarChar, config.value)
            .query(`INSERT INTO configs (id, [key], value) VALUES (@id, @key, @value)`);
        res.status(201).json({ ...config, id });
    } catch (error) {
        console.error('Error adding config:', error);
        res.status(500).json({ error: 'Failed to add config' });
    }
});

// 7. PUT: Update an existing configuration
app.put('/api/configs/:id', verifyToken, async (req, res) => {
    const id = req.params.id;
    const config = req.body;
    try {
        await pool.request()
            .input('id', sql.NVarChar, id)
            .input('key', sql.NVarChar, config.key)
            .input('value', sql.NVarChar, config.value)
            .query(`UPDATE configs SET [key] = @key, value = @value WHERE id = @id`);
        res.json({ ...config, id });
    } catch (error) {
        console.error('Error updating config:', error);
        res.status(500).json({ error: 'Failed to update config' });
    }
});

// ============================================================================
// API ROUTES - CHAT LOGS & RETENTION POLICY
// ============================================================================

// 8. POST: Log a new chat message
app.post('/api/chat-logs', async (req, res) => {
    const { session_id, role, content } = req.body;
    const id = `MSG-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const timestamp = Date.now();

    if (!session_id || !role || !content) {
        res.status(400).json({ error: 'Missing required fields: session_id, role, content' });
        return;
    }

    try {
        await pool.request()
            .input('id', sql.NVarChar, id)
            .input('session_id', sql.NVarChar, session_id)
            .input('role', sql.NVarChar, role)
            .input('content', sql.NVarChar, content)
            .input('timestamp', sql.BigInt, timestamp)
            .query(`INSERT INTO chat_logs (id, session_id, role, content, timestamp) VALUES (@id, @session_id, @role, @content, @timestamp)`);

        // Weekly retention policy: Delete any messages older than 7 days
        const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        const deleteResult = await pool.request()
            .input('oneWeekAgo', sql.BigInt, oneWeekAgo)
            .query('DELETE FROM chat_logs WHERE timestamp < @oneWeekAgo');
        if (deleteResult.rowsAffected[0] > 0) {
            console.log(`🧹 Auto-retention: Cleared ${deleteResult.rowsAffected[0]} messages older than 1 week.`);
        }

        res.status(201).json({ id, session_id, role, content, timestamp });
    } catch (error) {
        console.error('Error saving chat log:', error);
        res.status(500).json({ error: 'Failed to save chat log' });
    }
});

// 9. GET: Read all distinct chat sessions for audit
app.get('/api/chat-logs/sessions', verifyToken, async (req, res) => {
    try {
        const result = await pool.request().query(`
            SELECT
                t.session_id,
                COUNT(*) as count,
                MAX(t.timestamp) as last_active,
                (SELECT TOP 1 content FROM chat_logs WHERE session_id = t.session_id ORDER BY timestamp DESC) as last_message
            FROM chat_logs t
            GROUP BY t.session_id
            ORDER BY last_active DESC
        `);
        res.json(result.recordset);
    } catch (error) {
        console.error('Error fetching chat sessions:', error);
        res.status(500).json({ error: 'Failed to fetch chat sessions' });
    }
});

// 10. GET: Read all messages in a specific session
app.get('/api/chat-logs/sessions/:session_id', verifyToken, async (req, res) => {
    const session_id = req.params.session_id;
    try {
        const result = await pool.request()
            .input('session_id', sql.NVarChar, session_id)
            .query('SELECT * FROM chat_logs WHERE session_id = @session_id ORDER BY timestamp ASC');
        res.json(result.recordset);
    } catch (error) {
        console.error('Error fetching session messages:', error);
        res.status(500).json({ error: 'Failed to fetch session messages' });
    }
});

// ============================================================================
// API ROUTES - ERROR LOGGING
// ============================================================================

// 11. POST: Log a client-side error
app.post('/api/error-logs', async (req, res) => {
    const { session_id, error_message, stack_trace, component } = req.body;
    const id = `ERR-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const timestamp = Date.now();

    if (!error_message || !component) {
        res.status(400).json({ error: 'Missing required fields: error_message, component' });
        return;
    }

    try {
        await pool.request()
            .input('id', sql.NVarChar, id)
            .input('session_id', sql.NVarChar, session_id || null)
            .input('error_message', sql.NVarChar, error_message)
            .input('stack_trace', sql.NVarChar, stack_trace || null)
            .input('component', sql.NVarChar, component)
            .input('timestamp', sql.BigInt, timestamp)
            .query(`INSERT INTO error_logs (id, session_id, error_message, stack_trace, component, timestamp) VALUES (@id, @session_id, @error_message, @stack_trace, @component, @timestamp)`);

        // Weekly retention policy: Delete any error logs older than 7 days
        const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        const deleteResult = await pool.request()
            .input('oneWeekAgo', sql.BigInt, oneWeekAgo)
            .query('DELETE FROM error_logs WHERE timestamp < @oneWeekAgo');
        if (deleteResult.rowsAffected[0] > 0) {
            console.log(`🧹 Auto-retention: Cleared ${deleteResult.rowsAffected[0]} error logs older than 1 week.`);
        }

        res.status(201).json({ id, session_id, error_message, stack_trace, component, timestamp });
    } catch (error) {
        console.error('Error saving error log:', error);
        res.status(500).json({ error: 'Failed to save error log' });
    }
});

// 12. GET: Read all error logs sorted by timestamp DESC
app.get('/api/error-logs', verifyToken, async (req, res) => {
    try {
        const result = await pool.request().query('SELECT * FROM error_logs ORDER BY timestamp DESC');
        res.json(result.recordset);
    } catch (error) {
        console.error('Error fetching error logs:', error);
        res.status(500).json({ error: 'Failed to fetch error logs' });
    }
});

// 13. DELETE: Clear all error logs
app.delete('/api/error-logs', verifyToken, async (req, res) => {
    try {
        await pool.request().query('DELETE FROM error_logs');
        res.json({ success: true });
    } catch (error) {
        console.error('Error clearing error logs:', error);
        res.status(500).json({ error: 'Failed to clear error logs' });
    }
});

// ============================================================================
// START SERVER
// ============================================================================
initDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`🚀 Backend server running on http://localhost:${PORT}`);
        });
    })
    .catch(err => {
        console.error('❌ Failed to connect to SQL Server:', err.message);
        console.error('Make sure SQL Server is running and the DB_SERVER name is correct.');
        process.exit(1);
    });
