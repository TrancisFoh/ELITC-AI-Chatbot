import { Course, Config } from '../types';
import { ELITC_COURSES } from '../data/courses';

const API_BASE_URL = 'http://localhost:3001/api';

// ============================================================================
// DATABASE SERVICE (FRONTEND API WRAPPER)
// ============================================================================
// This service handles all communication between the React frontend and the
// Express.js backend server. It provides functions to fetch, create, update, 
// and delete data in the SQLite database.
export const dbService = {
    // --- Courses ---
    
    // Subscribes to the course list. In a full production app, this might use WebSockets,
    // but here it simply fetches the initial data when the component mounts.
    subscribeToCourses(onUpdate: (courses: Course[]) => void) {
        this.getAllCourses()
            .then(courses => onUpdate(courses))
            .catch(err => console.error("Failed to fetch courses:", err));
        return () => { };
    },

    // Fetches all courses from the backend API. Falls back to static data if the server is off.
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

    // Creates a new course or updates an existing one based on the 'isNew' flag.
    async saveCourse(course: Partial<Course>, isNew: boolean = false) {
        const isUpdate = isNew ? false : !!course.id;
        const url = isUpdate ? `${API_BASE_URL}/courses/${course.id}` : `${API_BASE_URL}/courses`;
        const method = isUpdate ? 'PUT' : 'POST';

        console.log(`Sending ${method} request to ${url}`, course); // Debug log

        try {
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
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

    // Deletes a specific course from the database by sending a DELETE request to the API.
    async deleteCourse(id: string) {
        console.log(`Sending DELETE request for course ID: ${id}`); // Debug log

        try {
            const response = await fetch(`${API_BASE_URL}/courses/${id}`, {
                method: 'DELETE'
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

    // --- Configs (Left minimal for now) ---
    subscribeToConfigs(onUpdate: (configs: Config[]) => void) {
        fetch(`${API_BASE_URL}/configs`).then(res => res.json()).then(onUpdate).catch(() => onUpdate([]));
        return () => { };
    },
    subscribeToSystemInstruction(onUpdate: (instruction: string) => void) {
        fetch(`${API_BASE_URL}/configs/system-instruction`).then(res => res.json()).then(d => { if (d?.value) onUpdate(d.value); }).catch(() => onUpdate("Default..."));
        return () => { };
    },
    async saveConfig(config: Partial<Config>) {
        const isUpdate = !!config.id;
        const url = isUpdate ? `${API_BASE_URL}/configs/${config.id}` : `${API_BASE_URL}/configs`;
        const method = isUpdate ? 'PUT' : 'POST';

        console.log(`Sending ${method} request to ${url}`, config); // Debug log

        try {
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
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
    async migrateData(onProgress?: (msg: string) => void) { return 0; },

    // --- Chat Logs ---
    async saveChatLog(log: { session_id: string; role: 'user' | 'assistant'; content: string }) {
        try {
            const response = await fetch(`${API_BASE_URL}/chat-logs`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(log)
            });
            if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error("Failed to save chat log:", error);
            // Non-blocking fail so chat works even if backend is offline
        }
    },
    async getChatSessions(): Promise<any[]> {
        try {
            const response = await fetch(`${API_BASE_URL}/chat-logs/sessions`);
            if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error("Failed to fetch chat sessions:", error);
            return [];
        }
    },
    async getChatSessionMessages(sessionId: string): Promise<any[]> {
        try {
            const response = await fetch(`${API_BASE_URL}/chat-logs/sessions/${sessionId}`);
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
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(log)
            });
            if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error("Failed to save error log to server:", error);
            // Silent fallback to avoid crashing loops
        }
    },
    async getErrorLogs(): Promise<any[]> {
        try {
            const response = await fetch(`${API_BASE_URL}/error-logs`);
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
                method: 'DELETE'
            });
            if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
            return true;
        } catch (error) {
            console.error("Failed to clear error logs:", error);
            return false;
        }
    }
};