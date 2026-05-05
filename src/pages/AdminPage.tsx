import React, { useState, useEffect } from 'react';
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy,
  onSnapshot,
  setDoc,
  where,
  writeBatch,
  getDoc
} from 'firebase/firestore';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged,
  signOut,
  User
} from 'firebase/auth';
import { db, auth } from '../lib/firebase';
import { Course, Config } from '../types';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Save, 
  X, 
  Layout, 
  Database, 
  Settings, 
  LogOut, 
  ChevronRight,
  Search,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Zap,
  ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ELITC_COURSES } from '../data/courses';

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'courses' | 'config' | 'system'>('courses');
  
  const [courses, setCourses] = useState<Course[]>([]);
  const [configs, setConfigs] = useState<Config[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [migrationLoading, setMigrationLoading] = useState(false);
  
  const [editingCourse, setEditingCourse] = useState<Partial<Course> | null>(null);
  const [editingConfig, setEditingConfig] = useState<Partial<Config> | null>(null);

  const [migrationStatus, setMigrationStatus] = useState<{ type: 'idle' | 'success' | 'error'; message: string }>({ type: 'idle', message: '' });

  // --- Data Migration Utility ---
  const handleMigrate = async () => {
    setMigrationStatus({ type: 'idle', message: '' });
    
    const confirmMessage = `This will synchronize ${ELITC_COURSES.length} course records and the default system instructions to your Firestore database. \n\nContinue?`;

    if (!confirm(confirmMessage)) return;
    
    setMigrationLoading(true);
    try {
      console.log("Starting migration for", ELITC_COURSES.length, "courses...");
      const batchSize = 400; // Firestore limit is 500 per batch
      const courseChunks = [];
      
      for (let i = 0; i < ELITC_COURSES.length; i += batchSize) {
        courseChunks.push(ELITC_COURSES.slice(i, i + batchSize));
      }

      // Process Course Batches
      for (const [index, chunk] of courseChunks.entries()) {
        const batch = writeBatch(db);
        chunk.forEach(course => {
          const docRef = doc(db, 'courses', course.id);
          batch.set(docRef, course, { merge: true });
        });
        await batch.commit();
        console.log(`Committed patch ${index + 1}/${courseChunks.length}`);
      }

      // 2. Default System Instruction
      const defaultPrompt = `You are the ELITC Assistant, an expert training consultant for the Electronics Industries Training Centre (https://www.elitc.com/).

Primary Objective:
Your mission is to provide helpful information about ELITC's services, courses, and facilities. While you aim to help users discover training that benefits their career or company, always address their specific questions first (location, contact, etc.) before pivoting to consultation. You are a professional and helpful guide for the Electronics Industries Training Centre.

Consultative Approach:
1. Be Inquisitive: If a user's request is broad (e.g., "I want to learn AI"), you MUST ask follow-up questions before giving a final recommendation. Ask about their current role, their technical background, and what they hope to achieve (e.g., career switch, upskilling for current job, or personal interest).
2. Personalize Recommendations: Once you have information, explain exactly *why* a specific course (like WSQ or IPC) is the best fit for their specific situation.
3. Keep responses concise but warm (max 3-4 sentences).
4. ALWAYS end with a helpful follow-up question that helps narrow down their needs or moves them closer to a decision.

Proactive Behavior:
- If they are an individual, ask about their career aspirations or current industry.
- If they are a company representative, ask about their team's current challenges or the specific skills they want to uplift.
- You can "trigger" course displays by mentioning specific categories like "WSQ Courses", "AI & Digital", "IPC Training", "Foreign Workers", or "Skills Improvement".

Key Info:
- Training for SMEs/MNCs.
- Location: Blk 5000 Ang Mo Kio Avenue 5, #02-08 TECHplace II, Singapore 569870
- Contact: +65 6483 2535 | enquiry@elitc.com
- Free consultation available for Workforce Skills Qualifications (WSQ) roadmaps.`;

      const configBatch = writeBatch(db);
      const configRef = doc(db, 'configs', 'SYSTEM_PROMPT_DEFAULT');
      configBatch.set(configRef, {
        key: 'SYSTEM_INSTRUCTION',
        value: defaultPrompt
      }, { merge: true });
      await configBatch.commit();

      setMigrationStatus({ type: 'success', message: `Migration successful! ${ELITC_COURSES.length} courses loaded.` });
      setTimeout(() => setActiveTab('courses'), 1500);
    } catch (e: any) {
      console.error("Migration fatal error:", e);
      setMigrationStatus({ type: 'error', message: `Failed: ${e.message || 'Unknown error'}` });
    } finally {
      setMigrationLoading(false);
    }
  };

  // Authentication & Admin Check
  useEffect(() => {
    // Immediate check if we already have the user (unlikely but good for HMR)
    if (auth.currentUser) {
      setUser(auth.currentUser);
    }

    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      console.log("Auth State Changed:", u?.email);
      setUser(u);
      
      if (u) {
        // Fast-path for root admin
        const isRootAdmin = u.email === 'francis.toh@elitc.com';
        if (isRootAdmin) {
          setIsAdmin(true);
          setLoading(false);
          
          // Background sync
          const adminRef = doc(db, 'admins', u.uid);
          setDoc(adminRef, {
            email: u.email,
            name: u.displayName,
            providerId: u.providerId,
            lastLogin: Date.now()
          }, { merge: true }).catch(err => console.error("Admin sync failed:", err));
          return;
        }

        try {
          const adminRef = doc(db, 'admins', u.uid);
          const adminDoc = await getDoc(adminRef);
          setIsAdmin(adminDoc.exists());
        } catch (e) {
          console.error("Critical Admin Check Error:", e);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
      
      setLoading(false);
    });

    // Heartbeat: Ensure we don't stay stuck for more than 4s
    const timer = setTimeout(() => {
      setLoading(false);
    }, 4000);

    return () => {
      unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  // Data Fetching
  useEffect(() => {
    if (!isAdmin) return;

    // Real-time courses
    const unsubCourses = onSnapshot(query(collection(db, 'courses'), orderBy('category')), (snapshot) => {
      setCourses(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Course)));
    });

    // Real-time configs
    const unsubConfigs = onSnapshot(collection(db, 'configs'), (snapshot) => {
      setConfigs(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Config)));
    });

    return () => {
      unsubCourses();
      unsubConfigs();
    };
  }, [isAdmin]);

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (e) {
      console.error("Login failed:", e);
    }
  };

  const handleLogout = () => signOut(auth);

  // Course CRUD
  const saveCourse = async () => {
    if (!editingCourse?.id || !editingCourse.title) return;
    try {
      const { id, ...data } = editingCourse;
      const docRef = doc(db, 'courses', id);
      await updateDoc(docRef, data);
      setEditingCourse(null);
    } catch (e) {
      // If doc doesn't exist, try adding it
      try {
        const { id, ...data } = editingCourse;
        await addDoc(collection(db, 'courses'), { ...data, id });
        setEditingCourse(null);
      } catch (err) {
        console.error("Error saving course:", err);
      }
    }
  };

  const deleteCourse = async (id: string) => {
    if (confirm('Are you sure you want to delete this course?')) {
      await deleteDoc(doc(db, 'courses', id));
    }
  };

  // Config CRUD
  const saveConfig = async () => {
    if (!editingConfig?.key || !editingConfig.value) return;
    try {
      const { id, ...data } = editingConfig;
      if (id) {
        await updateDoc(doc(db, 'configs', id), data);
      } else {
        await addDoc(collection(db, 'configs'), data);
      }
      setEditingConfig(null);
    } catch (e) {
      console.error("Error saving config:", e);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-elitc-gold" />
    </div>
  );

  if (!user || !isAdmin) return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-6">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center border border-zinc-100">
        <Layout className="w-16 h-16 text-elitc-gold mx-auto mb-6" />
        <h1 className="text-2xl font-bold text-zinc-900 mb-2">Admin Portal</h1>
        <p className="text-zinc-500 mb-8">Access restricted to ELITC administrators only. Please sign in to continue.</p>
        
        {!user ? (
          <button 
            onClick={handleLogin}
            className="w-full bg-zinc-900 text-white py-4 rounded-2xl font-semibold flex items-center justify-center gap-3 hover:bg-zinc-800 transition-all shadow-lg"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5 bg-white rounded-full p-0.5" />
            Sign in with Google
          </button>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-3 text-left">
              <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-rose-900">Access Denied</p>
                <p className="text-xs text-rose-700">Account: {user.email}</p>
                <p className="text-xs text-rose-700 mt-1">Your account is not registered as an administrator. Please contact IT for access.</p>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="text-zinc-500 hover:text-zinc-900 text-sm font-medium transition-colors"
            >
              Sign out and try another account
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-50 font-sans">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-zinc-200 hidden lg:flex flex-col z-10">
        <div className="p-6 border-b border-zinc-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-elitc-gold rounded-xl flex items-center justify-center">
              <Database className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-zinc-900">ELITC</h2>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Admin Panel</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <button 
            onClick={() => setActiveTab('courses')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'courses' ? 'bg-elitc-gold/10 text-elitc-gold font-semibold shadow-sm' : 'text-zinc-500 hover:bg-zinc-50'}`}
          >
            <Database className="w-5 h-5" />
            Course Catalog
          </button>
          <button 
            onClick={() => setActiveTab('config')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'config' ? 'bg-elitc-gold/10 text-elitc-gold font-semibold shadow-sm' : 'text-zinc-500 hover:bg-zinc-50'}`}
          >
            <Settings className="w-5 h-5" />
            Bot Configuration
          </button>
          <button 
            onClick={() => setActiveTab('system')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'system' ? 'bg-elitc-gold/10 text-elitc-gold font-semibold shadow-sm' : 'text-zinc-500 hover:bg-zinc-50'}`}
          >
            <Zap className="w-5 h-5" />
            System Tools
          </button>
        </nav>

        <div className="p-4 border-t border-zinc-100">
          <div className="flex items-center gap-3 mb-4 px-2">
            <img src={user.photoURL || ''} alt="User" className="w-8 h-8 rounded-full border border-zinc-200" />
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-bold text-zinc-900 truncate">{user.displayName}</p>
              <p className="text-[10px] text-zinc-500 truncate">{user.email}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 text-zinc-500 hover:text-zinc-900 text-xs font-medium hover:bg-zinc-50 rounded-lg transition-all"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 p-6 lg:p-10 min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-zinc-100/50 via-white to-white">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">
              {activeTab === 'courses' ? 'Course Catalog' : activeTab === 'config' ? 'Bot Configuration' : 'System Control'}
            </h1>
            <p className="text-zinc-500 text-base mt-1">Manage the core intelligence and data assets of your ELITC Assistant.</p>
          </motion.div>
          
          <div className="flex items-center gap-3">
            {activeTab === 'courses' && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input 
                  type="text" 
                  placeholder="Search courses..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-2 bg-white border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-elitc-gold/20 focus:border-elitc-gold transition-all w-64"
                />
              </div>
            )}
            <button 
              onClick={() => activeTab === 'courses' ? setEditingCourse({ category: 'WSQ' }) : setEditingConfig({})}
              className="bg-elitc-gold hover:bg-elitc-gold-dark text-white px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-lg shadow-elitc-gold/20 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              {activeTab === 'courses' ? 'Add Course' : 'Add Config'}
            </button>
          </div>
        </header>

        {/* Courses Table / Cards */}
        {activeTab === 'courses' && (
          <div className="bg-white rounded-3xl border border-zinc-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-50/50 border-b border-zinc-100">
                    <th className="px-6 py-4 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Course Title</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Level</th>
                    <th className="px-6 py-4 text-right text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50">
                  {courses
                    .filter(c => c.title.toLowerCase().includes(searchTerm.toLowerCase()) || c.id.toLowerCase().includes(searchTerm.toLowerCase()))
                    .map((course) => (
                      <tr key={course.id} className="hover:bg-zinc-50/50 transition-colors group">
                        <td className="px-6 py-4">
                          <span className="font-mono text-xs text-zinc-500 bg-zinc-100 px-1.5 py-0.5 rounded uppercase">{course.id}</span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-semibold text-zinc-900 line-clamp-1">{course.title}</p>
                          <p className="text-xs text-zinc-400 line-clamp-1">{course.description}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                            course.category === 'WSQ' ? 'bg-blue-50 text-blue-600' :
                            course.category === 'AI & Digital' ? 'bg-purple-50 text-purple-600' :
                            course.category === 'IPC' ? 'bg-amber-50 text-amber-600' :
                            'bg-zinc-100 text-zinc-600'
                          }`}>
                            {course.category}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs text-zinc-600">{course.level}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => setEditingCourse(course)}
                              className="p-2 text-zinc-400 hover:text-elitc-gold hover:bg-elitc-gold/10 rounded-lg transition-all"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => deleteCourse(course.id)}
                              className="p-2 text-zinc-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Config List */}
        {activeTab === 'config' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2 p-6 bg-white rounded-3xl border border-zinc-200 shadow-sm relative overflow-hidden group">
               <div className="flex items-start gap-4 mb-4">
                  <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                    <Settings className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-zinc-900">AI Personality & Tone</h3>
                    <p className="text-xs text-zinc-500 font-medium">Control how the bot interacts with users.</p>
                  </div>
               </div>
               <div className="space-y-4">
                  {configs.map(config => (
                    <div key={config.id} className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{config.key}</span>
                        <button 
                          onClick={() => setEditingConfig(config)}
                          className="text-elitc-gold text-xs font-bold hover:underline"
                        >
                          Edit Value
                        </button>
                      </div>
                      <p className="text-sm text-zinc-700 whitespace-pre-wrap">{config.value}</p>
                    </div>
                  ))}
                  {configs.length === 0 && (
                    <div className="text-center py-10">
                      <p className="text-zinc-400 text-sm">No configurations found. Add your first instruction to calibrate the AI.</p>
                    </div>
                  )}
               </div>
            </div>
          </div>
        )}

        {/* System Tools List */}
        {activeTab === 'system' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="p-8 bg-white rounded-3xl border border-zinc-200 shadow-sm">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600">
                  <RefreshCw className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-zinc-900 text-lg">Initial Data Migration</h3>
                  <p className="text-sm text-zinc-500">Seed your Firestore database with the built-in course catalog and default bot instructions.</p>
                </div>
              </div>
              
              <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100 mb-8">
                <p className="text-xs text-amber-800 leading-relaxed">
                  <strong>Warning:</strong> This will attempt to merge and update existing records. It is recommended to perform this only once during setup or when the catalog needs a full reset from the code defaults.
                </p>
              </div>

              <button 
                onClick={handleMigrate}
                disabled={migrationLoading}
                className="w-full bg-zinc-900 text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-zinc-800 hover:shadow-xl transition-all disabled:opacity-50 ring-offset-2 focus:ring-2 focus:ring-elitc-gold/50 cursor-pointer"
              >
                {migrationLoading ? (
                  <>
                    <RefreshCw className="w-6 h-6 animate-spin text-elitc-gold" />
                    <span className="animate-pulse">Processing Batch...</span>
                  </>
                ) : migrationStatus.type === 'success' ? (
                  <>
                    <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                    <span>Synchronization Complete</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-6 h-6 text-elitc-gold fill-elitc-gold" />
                    <span>Synchronize Database</span>
                  </>
                )}
              </button>

              {migrationStatus.type !== 'idle' && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mt-4 p-4 rounded-xl flex items-center gap-3 text-sm ${
                    migrationStatus.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'
                  }`}
                >
                  {migrationStatus.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  {migrationStatus.message}
                </motion.div>
              )}
            </div>
            
            <div className="p-8 bg-white rounded-3xl border border-zinc-200 shadow-sm">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-zinc-900 text-lg">Database Health</h3>
                  <p className="text-sm text-zinc-500">Current active collections and record counts.</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Courses</p>
                    <p className="text-2xl font-bold text-zinc-900">{courses.length}</p>
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                </div>
                <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Configs</p>
                    <p className="text-2xl font-bold text-zinc-900">{configs.length}</p>
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Editor Modal for Courses */}
      <AnimatePresence>
        {editingCourse && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setEditingCourse(null)}
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[32px] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
              <div className="p-8 border-b border-zinc-100 flex items-center justify-between bg-gradient-to-r from-zinc-50 to-white">
                <div>
                  <h2 className="text-xl font-bold text-zinc-900">{editingCourse.id ? 'Edit Course' : 'New Course'}</h2>
                  <p className="text-xs text-zinc-500 font-medium">Define the technical details for this program.</p>
                </div>
                <button onClick={() => setEditingCourse(null)} className="p-2 hover:bg-zinc-100 rounded-full transition-all">
                  <X className="w-5 h-5 text-zinc-400" />
                </button>
              </div>

              <div className="p-8 overflow-y-auto flex-1 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest px-1">Course ID</label>
                    <input 
                      type="text"
                      placeholder="e.g. WSQ-001"
                      value={editingCourse.id || ''}
                      onChange={e => setEditingCourse({ ...editingCourse, id: e.target.value })}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-elitc-gold/5 focus:border-elitc-gold transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest px-1">Category</label>
                    <select 
                      value={editingCourse.category || 'WSQ'}
                      onChange={e => setEditingCourse({ ...editingCourse, category: e.target.value })}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-elitc-gold/5 focus:border-elitc-gold transition-all"
                    >
                      <option value="WSQ">WSQ Courses</option>
                      <option value="AI & Digital">AI & Digital</option>
                      <option value="IPC">IPC Specialist</option>
                      <option value="Foreign Workers">Foreign Workers</option>
                      <option value="Skills Improvement">Skills Improvement</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest px-1">Full Course Title</label>
                  <input 
                    type="text"
                    value={editingCourse.title || ''}
                    onChange={e => setEditingCourse({ ...editingCourse, title: e.target.value })}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-elitc-gold/5 focus:border-elitc-gold transition-all font-semibold"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest px-1">Marketing Description</label>
                  <textarea 
                    rows={4}
                    value={editingCourse.description || ''}
                    onChange={e => setEditingCourse({ ...editingCourse, description: e.target.value })}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-elitc-gold/5 focus:border-elitc-gold transition-all resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest px-1">Duration</label>
                    <input 
                      type="text"
                      value={editingCourse.duration || ''}
                      onChange={e => setEditingCourse({ ...editingCourse, duration: e.target.value })}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-elitc-gold/5 focus:border-elitc-gold transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest px-1">Skill Level</label>
                    <select 
                      value={editingCourse.level || 'Intermediate'}
                      onChange={e => setEditingCourse({ ...editingCourse, level: e.target.value as any })}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-elitc-gold/5 focus:border-elitc-gold transition-all"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                      <option value="Professional">Professional</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest px-1">Official Website URL</label>
                  <input 
                    type="url"
                    value={editingCourse.url || ''}
                    onChange={e => setEditingCourse({ ...editingCourse, url: e.target.value })}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-elitc-gold/5 focus:border-elitc-gold transition-all"
                  />
                </div>
              </div>

              <div className="p-8 bg-zinc-50 border-t border-zinc-100 flex items-center justify-end gap-3">
                <button 
                  onClick={() => setEditingCourse(null)}
                  className="px-6 py-2.5 text-sm font-semibold text-zinc-500 hover:text-zinc-900 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={saveCourse}
                  className="bg-elitc-gold hover:bg-elitc-gold-dark text-white px-8 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-elitc-gold/20 flex items-center gap-2 transition-all active:scale-95"
                >
                  <Save className="w-4 h-4" />
                  Apply Changes
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Editor Modal for Configs */}
      <AnimatePresence>
        {editingConfig && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setEditingConfig(null)}
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-xl bg-white rounded-[32px] overflow-hidden shadow-2xl flex flex-col"
            >
              <div className="p-8 border-b border-zinc-100 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-zinc-900">System Instruction</h2>
                  <p className="text-xs text-zinc-500 font-medium">Fine-tune the AI's response logic.</p>
                </div>
                <button onClick={() => setEditingConfig(null)} className="p-2 hover:bg-zinc-100 rounded-full transition-all">
                  <X className="w-5 h-5 text-zinc-400" />
                </button>
              </div>

              <div className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest px-1">Identifier Key</label>
                  <input 
                    type="text"
                    placeholder="e.g. SYSTEM_PROMPT"
                    value={editingConfig.key || ''}
                    onChange={e => setEditingConfig({ ...editingConfig, key: e.target.value })}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-elitc-gold/5 focus:border-elitc-gold transition-all font-mono"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest px-1">Directive Value</label>
                  <textarea 
                    rows={12}
                    value={editingConfig.value || ''}
                    onChange={e => setEditingConfig({ ...editingConfig, value: e.target.value })}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-elitc-gold/5 focus:border-elitc-gold transition-all resize-none font-medium leading-relaxed"
                  />
                </div>
              </div>

              <div className="p-8 bg-zinc-50 border-t border-zinc-100 flex items-center justify-end gap-3">
                <button 
                  onClick={() => setEditingConfig(null)}
                  className="px-6 py-2.5 text-sm font-semibold text-zinc-500 hover:text-zinc-900 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={saveConfig}
                  className="bg-elitc-gold hover:bg-elitc-gold-dark text-white px-8 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-elitc-gold/20 flex items-center gap-2 transition-all active:scale-95"
                >
                  <Save className="w-4 h-4" />
                  Update Config
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
