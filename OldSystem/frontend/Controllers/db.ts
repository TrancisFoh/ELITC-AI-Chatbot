import { Course, Config } from '../types';
import { ELITC_COURSES } from '../data/courses';

// Safe env read: works in both Vite (browser) and Node.js (backend imports)
const API_BASE_URL = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_URL)
    ? (import.meta as any).env.VITE_API_URL
    : (typeof process !== 'undefined' && process.env?.VITE_API_URL)
        ? process.env.VITE_API_URL
        : 'http://localhost:3001/api';

const getToken = () => {
    if (typeof sessionStorage === 'undefined') return null;
    const auth = sessionStorage.getItem('elitc_admin_auth');
    if (!auth) return null;
    try {
        const parsed = JSON.parse(auth);
        return parsed.token || null;
    } catch {
        return null;
    }
};

const getHeaders = (isJson = true) => {
    const headers: Record<string, string> = {};
    if (isJson) headers['Content-Type'] = 'application/json';
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
};

// ============================================================================
// DATABASE SERVICE (FRONTEND API WRAPPER)
// ============================================================================
// This service handles all communication between the React frontend and the
// Express.js backend server. It provides functions to fetch, create, update, 
// and delete data in the SQL database.
export const dbService = {
    // --- Authentication ---
    async login(username: string, password: string) {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `HTTP Error: ${response.status}`);
        }
        
        return await response.json();
    },

    async registerUser(username: string, password: string, role: string = 'admin') {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: getHeaders(true),
            body: JSON.stringify({ username, password, role })
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `HTTP Error: ${response.status}`);
        }
        
        return await response.json();
    },

    // --- Courses ---
    subscribeToCourses(onUpdate: (courses: Course[]) => void) {
        this.getAllCourses()
            .then(courses => onUpdate(courses))
            .catch(err => console.error("Failed to fetch courses:", err));
        return () => { };
    },

    async getAllCourses(): Promise<Course[]> {
        try {
            const response = await fetch(`${API_BASE_URL}/courses`);
            if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.warn("Backend not ready, falling back to default courses", error);
            return ELITC_COURSES;
        }
    },

    async saveCourse(course: Partial<Course>, isNew: boolean = false) {
        const isUpdate = isNew ? false : !!course.id;
        const url = isUpdate ? `${API_BASE_URL}/courses/${course.id}` : `${API_BASE_URL}/courses`;
        const method = isUpdate ? 'PUT' : 'POST';

        console.log(`Sending ${method} request to ${url}`, course);

        try {
            const response = await fetch(url, {
                method,
                headers: getHeaders(true),
                body: JSON.stringify(course)
            });

            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(`Server returned ${response.status}: ${errorData}`);
            }

            alert("✅ Course successfully saved to database!");
            return await response.json();
        } catch (error: any) {
            console.error("CRITICAL SAVE ERROR:", error);
            alert(`❌ Failed to save course!\n\nError: ${error.message}\n\nCheck your backend terminal for more details.`);
            throw error;
        }
    },

    async deleteCourse(id: string) {
        console.log(`Sending DELETE request for course ID: ${id}`);

        try {
            const response = await fetch(`${API_BASE_URL}/courses/${id}`, {
                method: 'DELETE',
                headers: getHeaders(false)
            });

            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(`Server returned ${response.status}: ${errorData}`);
            }

            alert("🗑️ Course successfully deleted!");
            return await response.json();
        } catch (error: any) {
            console.error("CRITICAL DELETE ERROR:", error);
            alert(`❌ Failed to delete course!\n\nError: ${error.message}\n\nCheck your backend terminal for more details.`);
            throw error;
        }
    },

    // --- Configs ---
    subscribeToConfigs(onUpdate: (configs: Config[]) => void) {
        fetch(`${API_BASE_URL}/configs`, { headers: getHeaders(false) })
            .then(res => res.json())
            .then(onUpdate)
            .catch(() => onUpdate([]));
        return () => { };
    },
    
    subscribeToSystemInstruction(onUpdate: (instruction: string) => void) {
        fetch(`${API_BASE_URL}/configs/system-instruction`)
            .then(res => res.json())
            .then(d => { if (d?.value) onUpdate(d.value); })
            .catch(() => onUpdate("Default..."));
        return () => { };
    },

    async saveConfig(config: Partial<Config>) {
        const isUpdate = !!config.id;
        const url = isUpdate ? `${API_BASE_URL}/configs/${config.id}` : `${API_BASE_URL}/configs`;
        const method = isUpdate ? 'PUT' : 'POST';

        console.log(`Sending ${method} request to ${url}`, config);

        try {
            const response = await fetch(url, {
                method,
                headers: getHeaders(true),
                body: JSON.stringify(config)
            });

            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(`Server returned ${response.status}: ${errorData}`);
            }

            alert("✅ Config successfully saved to database!");
            return await response.json();
        } catch (error: any) {
            console.error("CRITICAL SAVE ERROR:", error);
            alert(`❌ Failed to save config!\n\nError: ${error.message}\n\nCheck your backend terminal for more details.`);
            throw error;
        }
    },
    async migrateData(onProgress?: (msg: string) => void) {
        let count = 0;
        for (const course of ELITC_COURSES) {
            onProgress?.(`Migrating ${course.title}...`);
            try {
                const response = await fetch(`${API_BASE_URL}/courses`, {
                    method: 'POST',
                    headers: getHeaders(true),
                    body: JSON.stringify(course)
                });
                if (response.ok) {
                    count++;
                } else if (response.status === 409) {
                    // Already exists
                    count++;
                }
            } catch (err) {
                console.error("Migration error for course", course.id, err);
            }
        }
        
        try {
            onProgress?.('Ensuring system prompt is seeded...');
            const geminiModule = await import('../services/gemini');
            await fetch(`${API_BASE_URL}/configs`, {
                method: 'POST',
                headers: getHeaders(true),
                body: JSON.stringify({
                    id: 'config-1',
                    key: 'SYSTEM_PROMPT',
                    value: geminiModule.DEFAULT_SYSTEM_INSTRUCTION.trim()
                })
            });
        } catch (err) {
            console.error("Migration error for system prompt", err);
        }
        
        return count;
    },

    // --- Chat Logs ---
    async saveChatLog(log: { session_id: string; role: 'user' | 'assistant'; content: string }) {
        try {
            const response = await fetch(`${API_BASE_URL}/chat-logs`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }, // Public endpoint
                body: JSON.stringify(log)
            });
            if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error("Failed to save chat log:", error);
        }
    },
    
    async getChatSessions(): Promise<any[]> {
        try {
            const response = await fetch(`${API_BASE_URL}/chat-logs/sessions`, { headers: getHeaders(false) });
            if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error("Failed to fetch chat sessions:", error);
            return [];
        }
    },
    
    async getChatSessionMessages(sessionId: string): Promise<any[]> {
        try {
            const response = await fetch(`${API_BASE_URL}/chat-logs/sessions/${sessionId}`, { headers: getHeaders(false) });
            if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error("Failed to fetch session messages:", error);
            return [];
        }
    },

    // --- Error Logs ---
    async saveErrorLog(log: { session_id?: string; error_message: string; stack_trace?: string; component: string }) {
        try {
            const response = await fetch(`${API_BASE_URL}/error-logs`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }, // Public endpoint
                body: JSON.stringify(log)
            });
            if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error("Failed to save error log to server:", error);
        }
    },
    
    async getErrorLogs(): Promise<any[]> {
        try {
            const response = await fetch(`${API_BASE_URL}/error-logs`, { headers: getHeaders(false) });
            if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error("Failed to fetch error logs:", error);
            return [];
        }
    },
    
    async clearErrorLogs(): Promise<boolean> {
        try {
            const response = await fetch(`${API_BASE_URL}/error-logs`, {
                method: 'DELETE',
                headers: getHeaders(false)
            });
            if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
            return true;
        } catch (error) {
            console.error("Failed to clear error logs:", error);
            return false;
        }
    }
};