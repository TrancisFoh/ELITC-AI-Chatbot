import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

// CRITICAL: Validate connection to Firestore
async function testConnection() {
  try {
    // Attempting a read to verify connection and credentials
    await getDocFromServer(doc(db, 'system', 'connection-test'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Firebase Connection Error: The client is offline.");
    }
    // "Missing or insufficient permissions" is expected if 'system' collection doesn't exist
    // but the connection is still working.
  }
}
testConnection();
