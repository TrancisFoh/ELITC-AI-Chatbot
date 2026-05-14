import { Course, Config } from '../types';
import { ELITC_COURSES } from '../data/courses';

const API_BASE_URL = 'http://localhost:3001/api';

export const dbService = {
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
            const data = await response.json();
            return data.map((c: any) => ({
                ...c,
                objectives: typeof c.objectives === 'string' ? JSON.parse(c.objectives) : (c.objectives || []),
                targetAudience: typeof c.targetAudience === 'string' ? JSON.parse(c.targetAudience) : (c.targetAudience || [])
            }));
        } catch (error) {
            console.warn("Backend not ready, falling back to default courses", error);
            return ELITC_COURSES;
        }
    },

    async saveCourse(course: Partial<Course>, isUpdate: boolean = false) {
        const url = isUpdate ? `${API_BASE_URL}/courses/${course.id}` : `${API_BASE_URL}/courses`;
        const method = isUpdate ? 'PUT' : 'POST';

        console.log(`Sending ${method} request to ${url}`, course);

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
            alert(`❌ Failed to save course!\n\nError: ${error.message}`);
            throw error;
        }
    },

    async deleteCourse(id: string) {
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
            alert(`❌ Failed to delete course!\n\nError: ${error.message}`);
            throw error;
        }
    },

    // --- Configs ---
    subscribeToConfigs(onUpdate: (configs: Config[]) => void) {
        fetch(`${API_BASE_URL}/configs`).then(res => res.json()).then(onUpdate).catch(() => onUpdate([]));
        return () => { };
    },
    subscribeToSystemInstruction(onUpdate: (instruction: string) => void) {
        fetch(`${API_BASE_URL}/configs/system-instruction`).then(res => res.json()).then(d => { if (d?.value) onUpdate(d.value); }).catch(() => onUpdate("Default..."));
        return () => { };
    },
    async saveConfig(config: Partial<Config>) { return config; },
    async migrateData(onProgress?: (message: string) => void) {
        if (onProgress) onProgress("Migration started...");
        return 0;
    }
};
