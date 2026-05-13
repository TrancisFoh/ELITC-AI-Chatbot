import {
  collection,
  onSnapshot,
  query,
  orderBy,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  writeBatch,
  where
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Course, Config } from '../types';
import { ELITC_COURSES } from '../data/courses';

const COURSES_COLLECTION = 'courses';
const CONFIGS_COLLECTION = 'configs';

export const dbService = {
  // --- Courses ---
  subscribeToCourses(onUpdate: (courses: Course[]) => void) {
    const q = query(collection(db, COURSES_COLLECTION), orderBy('category'));
    return onSnapshot(q, (snapshot) => {
      const courses = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Course));
      onUpdate(courses);
    });
  },

  async getAllCourses(): Promise<Course[]> {
    const q = query(collection(db, COURSES_COLLECTION), orderBy('category'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Course));
  },

  async saveCourse(course: Partial<Course>) {
    if (!course.id) {
      return await addDoc(collection(db, COURSES_COLLECTION), course);
    }
    const { id, ...data } = course;
    return await setDoc(doc(db, COURSES_COLLECTION, id), data, { merge: true });
  },

  async deleteCourse(id: string) {
    return await deleteDoc(doc(db, COURSES_COLLECTION, id));
  },

  // --- Configs ---
  subscribeToConfigs(onUpdate: (configs: Config[]) => void) {
    return onSnapshot(collection(db, CONFIGS_COLLECTION), (snapshot) => {
      const configs = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Config));
      onUpdate(configs);
    });
  },

  subscribeToSystemInstruction(onUpdate: (instruction: string) => void) {
    const q = query(collection(db, CONFIGS_COLLECTION), where('key', '==', 'SYSTEM_INSTRUCTION'));
    return onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        onUpdate(snapshot.docs[0].data().value);
      }
    });
  },

  async saveConfig(config: Partial<Config>) {
    if (config.id) {
      const { id, ...data } = config;
      return await updateDoc(doc(db, CONFIGS_COLLECTION, id), data);
    } else {
      return await addDoc(collection(db, CONFIGS_COLLECTION), config);
    }
  },

  // --- Migration ---
  async migrateData(onProgress?: (progress: string) => void) {
    onProgress?.('Starting migration...');

    // Migrate Courses
    const batchSize = 400;
    const courseChunks = [];
    for (let i = 0; i < ELITC_COURSES.length; i += batchSize) {
      courseChunks.push(ELITC_COURSES.slice(i, i + batchSize));
    }

    for (const [index, chunk] of courseChunks.entries()) {
      const batch = writeBatch(db);
      chunk.forEach(course => {
        batch.set(doc(db, COURSES_COLLECTION, course.id), course, { merge: true });
      });
      await batch.commit();
      onProgress?.(`Migrated course chunk ${index + 1}/${courseChunks.length}`);
    }

    // Migrate Default Config
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
    configBatch.set(doc(db, CONFIGS_COLLECTION, 'SYSTEM_PROMPT_DEFAULT'), {
      key: 'SYSTEM_INSTRUCTION',
      value: defaultPrompt
    }, { merge: true });
    await configBatch.commit();

    onProgress?.('Migration complete!');
    return ELITC_COURSES.length;
  }
};
