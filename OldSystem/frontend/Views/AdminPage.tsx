import React, { useState, useEffect } from 'react';
import { dbService } from '../services/db';
import { Course, Config } from '../types';
import {
    ArrowLeft,
    ShieldCheck,
    AlertCircle,
    RefreshCw
} from 'lucide-react';
import { motion } from 'motion/react';
import { AdminSidebar } from '../components/admin/AdminSidebar';
import { CourseManager } from '../components/admin/CourseManager';
import { ConfigManager } from '../components/admin/ConfigManager';
import { SystemTools } from '../components/admin/SystemTools';
import { CourseEditor } from '../components/admin/CourseEditor';
import { ConfigEditor } from '../components/admin/ConfigEditor';
import { ChatLogManager } from '../components/admin/ChatLogManager';
import { ErrorLogManager } from '../components/admin/ErrorLogManager';
import { UserManager } from '../components/admin/UserManager';

// ============================================================================
// ADMIN DASHBOARD MAIN PAGE
// ============================================================================
// This component is the root of the secure Admin Panel. It handles:
// 1. Authentication (Login/Logout)
// 2. State management for courses and system configurations
// 3. Routing between different admin tabs (Courses, Config, System)
// 4. CRUD operations (delegating API calls to dbService)
export default function AdminPage() {
    // --- STATE MANAGEMENT ---

    // Auth state: Initializes from sessionStorage to keep the user logged in only for the session
    const [user, setUser] = useState<{ username: string } | null>(() => {
        const saved = sessionStorage.getItem('elitc_admin_auth');
        return saved ? JSON.parse(saved) : null;
    });
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showRetry, setShowRetry] = useState(false);

    // UI Navigation State
    const [activeTab, setActiveTab] = useState<'courses' | 'config' | 'system' | 'chats' | 'errors' | 'users'>('courses');
    const [selectedChatSessionId, setSelectedChatSessionId] = useState<string | null>(null);

    const [courses, setCourses] = useState<Course[]>([]);
    const [configs, setConfigs] = useState<Config[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [migrationLoading, setMigrationLoading] = useState(false);

    const [editingCourse, setEditingCourse] = useState<Partial<Course> | null>(null);
    const [editingConfig, setEditingConfig] = useState<Partial<Config> | null>(null);
    const [courseToDelete, setCourseToDelete] = useState<string | null>(null);

    const [migrationStatus, setMigrationStatus] = useState<{ type: 'idle' | 'success' | 'error'; message: string }>({ type: 'idle', message: '' });
    const [loginForm, setLoginForm] = useState({ username: '', password: '' });
    const [loginError, setLoginError] = useState('');

    // --- AUTHENTICATION ---
    useEffect(() => {
        let timeout: NodeJS.Timeout;
        if (!isAdmin && user) {
            setLoading(true);
            timeout = setTimeout(() => {
                setLoading(false);
                setShowRetry(true);
            }, 5000);
        }

        if (user && user.username === 'admin') {
            setIsAdmin(true);
            setLoading(false);
            setShowRetry(false);
            clearTimeout(timeout!);
        }

        return () => clearTimeout(timeout);
    }, [user, isAdmin]);

    // --- DATA FETCHING & REFRESH HELPERS ---

    // Triggers a fresh fetch of all database content to keep the UI synchronized
    const refreshData = () => {
        dbService.subscribeToCourses(setCourses);
        dbService.subscribeToConfigs(setConfigs);
    };

    useEffect(() => {
        if (!isAdmin) return;
        refreshData();
    }, [isAdmin]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoginError('');
        try {
            const data = await dbService.login(loginForm.username, loginForm.password);
            setUser(data.user);
            setIsAdmin(true);
            sessionStorage.setItem('elitc_admin_auth', JSON.stringify({ token: data.token, username: data.user.username }));
        } catch (err: any) {
            setLoginError(err.message || 'Invalid credentials.');
        }
    };

    const handleLogout = () => {
        setUser(null);
        setIsAdmin(false);
        sessionStorage.removeItem('elitc_admin_auth');
    };

    const handleMigrate = async () => {
        setMigrationLoading(true);
        setMigrationStatus({ type: 'idle', message: '' });
        try {
            const count = await dbService.migrateData((msg) => {
                console.log(msg);
            });
            setMigrationStatus({ type: 'success', message: `Migration successful! ${count} courses loaded.` });
            setTimeout(() => setActiveTab('courses'), 1500);
        } catch (e: any) {
            console.error("Migration error:", e);
            setMigrationStatus({ type: 'error', message: `Failed: ${e.message || 'Unknown error'}` });
        } finally {
            setMigrationLoading(false);
        }
    };

    // ============================================================================
    // CRUD OPERATIONS
    // ============================================================================
    // These functions act as middlemen. They take the updated data from the UI
    // components, send it to the backend via dbService, and then trigger a refreshData()
    // so the table/list instantly reflects the changes.

    // Saves a new or edited course
    const saveCourse = async () => {
        // FIX: Removed the ID check so new courses can be saved properly
        if (!editingCourse?.title) return;
        try {
            await dbService.saveCourse(editingCourse, (editingCourse as any)._isNew);
            setEditingCourse(null);
            refreshData(); // FIX: Re-fetch data to update the UI
        } catch (e) {
            console.error("Error saving course:", e);
        }
    };

    // Initiates the deletion of a course by bringing up the custom confirmation modal
    const deleteCourse = async () => {
        if (!courseToDelete) return;
        try {
            await dbService.deleteCourse(courseToDelete);
            refreshData(); // FIX: Re-fetch data to update the UI
        } finally {
            setCourseToDelete(null);
        }
    };

    // Saves configuration changes (like the AI System Prompt)
    const saveConfig = async () => {
        if (!editingConfig?.key || !editingConfig.value) return;
        try {
            await dbService.saveConfig(editingConfig);
            setEditingConfig(null);
            refreshData(); // FIX: Re-fetch data to update the UI
        } catch (e) {
            console.error("Error saving config:", e);
        }
    };

    const saveConfigDirectly = async (config: Partial<Config>) => {
        try {
            await dbService.saveConfig(config);
            refreshData();
        } catch (e) {
            console.error("Error saving config:", e);
        }
    };

    if (loading || (!isAdmin && user && !showRetry)) {
        return (
            <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6">
                <div className="bg-white p-8 rounded-3xl border border-zinc-200 shadow-xl w-full max-w-sm flex flex-col items-center">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                        className="w-12 h-12 border-4 border-elitc-gold border-t-transparent rounded-full mb-6"
                    />
                    <h2 className="text-xl font-bold text-zinc-900 mb-2">Connecting...</h2>
                    <p className="text-zinc-500 text-sm text-center mb-6">Verifying your admin access secure parameters.</p>

                    {showRetry && (
                        <button
                            onClick={() => window.location.reload()}
                            className="w-full bg-zinc-900 text-white font-bold py-3 rounded-xl hover:bg-zinc-800 transition-all flex items-center justify-center gap-2"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Retry Connection
                        </button>
                    )}
                </div>
            </div>
        );
    }

    if (!isAdmin) {
        return (
            <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-md bg-white p-8 rounded-3xl border border-zinc-200 shadow-xl"
                >
                    <div className="flex flex-col items-center mb-8">
                        <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center mb-4">
                            <ShieldCheck className="w-8 h-8 text-elitc-gold" />
                        </div>
                        <h1 className="text-2xl font-bold text-zinc-900">Admin Portal</h1>
                        <p className="text-zinc-500 text-sm text-center mt-2">Enter credentials to manage ELITC Assistant</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-zinc-700 mb-1">Username</label>
                            <input
                                type="text"
                                value={loginForm.username}
                                onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-elitc-gold/20 outline-none transition-all"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-zinc-700 mb-1">Password</label>
                            <input
                                type="password"
                                value={loginForm.password}
                                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-elitc-gold/20 outline-none transition-all"
                                required
                            />
                        </div>

                        {loginError && (
                            <div className="p-3 bg-rose-50 text-rose-600 text-sm rounded-lg flex items-center gap-2">
                                <AlertCircle className="w-4 h-4" />
                                {loginError}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="w-full bg-zinc-900 text-white font-bold py-4 rounded-xl hover:bg-zinc-800 transition-all active:scale-95 cursor-pointer"
                        >
                            Access Dashboard
                        </button>
                    </form>

                    <footer className="mt-8 pt-8 border-t border-zinc-100 flex items-center justify-center">
                        <button
                            onClick={() => window.location.href = '/'}
                            className="text-zinc-400 hover:text-zinc-900 text-sm flex items-center gap-2 cursor-pointer"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Assistant
                        </button>
                    </footer>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-50 font-sans">
            <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} handleLogout={handleLogout} />

            <main className="lg:ml-64 p-6 lg:p-10 min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-zinc-100/50 via-white to-white">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">
                            {activeTab === 'courses' ? 'Course Catalog' : activeTab === 'config' ? 'Bot Configuration' : activeTab === 'system' ? 'System Control' : activeTab === 'chats' ? 'Chat Audit Logs' : activeTab === 'errors' ? 'System Error Logs' : 'User Management'}
                        </h1>
                        <p className="text-zinc-500 text-base mt-1">Manage the core intelligence and data assets of your ELITC Assistant.</p>
                    </motion.div>
                </header>

                {activeTab === 'courses' && (
                    <CourseManager
                        courses={courses}
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                        onEdit={setEditingCourse}
                        onDelete={(id) => setCourseToDelete(id)}
                        onAdd={() => setEditingCourse({ category: 'WSQ', _isNew: true } as any)}
                    />
                )}

                {activeTab === 'config' && (
                    <ConfigManager
                        configs={configs}
                        onSave={saveConfigDirectly}
                    />
                )}

                {activeTab === 'system' && (
                    <SystemTools
                        onMigrate={handleMigrate}
                        migrationLoading={migrationLoading}
                        migrationStatus={migrationStatus}
                        stats={{ courses: courses.length, configs: configs.length }}
                    />
                )}

                {activeTab === 'chats' && (
                    <ChatLogManager 
                        initialSessionId={selectedChatSessionId}
                        onSelectSession={setSelectedChatSessionId}
                    />
                )}

                {activeTab === 'errors' && (
                    <ErrorLogManager 
                        onViewChatSession={(sessionId) => {
                            setSelectedChatSessionId(sessionId);
                            setActiveTab('chats');
                        }}
                    />
                )}

                {activeTab === 'users' && (
                    <UserManager />
                )}
            </main>

            <CourseEditor
                course={editingCourse}
                onClose={() => setEditingCourse(null)}
                onSave={saveCourse}
                onChange={setEditingCourse}
            />

            <ConfigEditor
                config={editingConfig}
                onClose={() => setEditingConfig(null)}
                onSave={saveConfig}
                onChange={setEditingConfig}
            />

            {/* Custom Delete Confirmation Modal */}
            {courseToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={() => setCourseToDelete(null)}
                    />
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        className="relative w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col"
                    >
                        <div className="p-8 pb-6 flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-4">
                                <AlertCircle className="w-8 h-8" />
                            </div>
                            <h2 className="text-xl font-bold text-zinc-900 mb-2">Delete Course?</h2>
                            <p className="text-sm text-zinc-500">
                                Are you sure you want to delete this course? This action cannot be undone.
                            </p>
                        </div>
                        <div className="p-6 bg-zinc-50 border-t border-zinc-100 flex items-center justify-end gap-3">
                            <button
                                onClick={() => setCourseToDelete(null)}
                                className="px-6 py-2.5 text-sm font-semibold text-zinc-500 hover:text-zinc-900 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={deleteCourse}
                                className="bg-rose-500 hover:bg-rose-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-rose-500/20 transition-all active:scale-95"
                            >
                                Yes, Delete It
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}