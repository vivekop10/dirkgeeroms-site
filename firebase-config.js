// Firebase Configuration for dirkgeeroms.be
// Real Firebase SDK credentials

const firebaseConfig = {
  apiKey: "AIzaSyD6tgcnSEzunMRwBr-dEcpeh0Niy8Y2zP0",
  authDomain: "gen-lang-client-0928459464.firebaseapp.com",
  projectId: "gen-lang-client-0928459464",
  storageBucket: "gen-lang-client-0928459464.firebasestorage.app",
  messagingSenderId: "333350462108",
  appId: "1:333350462108:web:6e7d1cb86f54bfc9658359",
  measurementId: "G-G9HWSSWDQP"
};

// Initialize Firebase if not already initialized
if (typeof firebase !== 'undefined' && !firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Services
const auth = (typeof firebase !== 'undefined') ? firebase.auth() : null;
const db = (typeof firebase !== 'undefined') ? firebase.firestore() : null;
const storage = (typeof firebase !== 'undefined') ? firebase.storage() : null;

// Google Auth Provider
const googleProvider = (typeof firebase !== 'undefined' && firebase.auth) ? new firebase.auth.GoogleAuthProvider() : null;

// Master Admin Secret Key for instant promotion
const ADMIN_SECRET_KEY = "dirkgeeroms-admin-2026";

// ============================================================
//  AUTH HELPER FUNCTIONS
// ============================================================

/** Sign up with email and password */
async function firebaseSignUp(email, password, displayName) {
  if (!auth) throw new Error("Firebase Auth not loaded");
  const cred = await auth.createUserWithEmailAndPassword(email, password);
  if (displayName) {
    await cred.user.updateProfile({ displayName });
  }
  // Create user document in Firestore
  if (db) {
    await db.collection('users').doc(cred.user.uid).set({
      email,
      displayName: displayName || email.split('@')[0],
      role: 'student',
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      avatarUrl: ''
    });
  }
  return cred.user;
}

/** Sign in with email and password */
async function firebaseSignIn(email, password) {
  if (!auth) throw new Error("Firebase Auth not loaded");
  const cred = await auth.signInWithEmailAndPassword(email, password);
  return cred.user;
}

/** Sign in with Google */
async function firebaseSignInWithGoogle() {
  if (!auth || !googleProvider) throw new Error("Firebase Auth/Google Provider not available");
  const result = await auth.signInWithPopup(googleProvider);
  const user = result.user;
  if (db) {
    const doc = await db.collection('users').doc(user.uid).get();
    if (!doc.exists) {
      await db.collection('users').doc(user.uid).set({
        email: user.email,
        displayName: user.displayName || user.email.split('@')[0],
        role: 'student',
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        avatarUrl: user.photoURL || ''
      });
    }
  }
  return user;
}

/** Sign out */
async function firebaseSignOut() {
  if (auth) await auth.signOut();
  localStorage.removeItem('currentUser');
}

/** Get user profile from Firestore */
async function getUserProfile(uid) {
  if (!db || !uid) return null;
  const doc = await db.collection('users').doc(uid).get();
  return doc.exists ? { uid, ...doc.data() } : null;
}

/** Promote user to admin with secret key */
async function promoteToAdmin(uid, secretKey) {
  if (secretKey !== ADMIN_SECRET_KEY) {
    throw new Error('Invalid master admin key');
  }
  if (!db || !uid) return;
  await db.collection('users').doc(uid).update({ role: 'admin' });
}

/** Update profile info */
async function updateUserProfile(uid, data) {
  if (db && uid) {
    await db.collection('users').doc(uid).update(data);
  }
  if (data.displayName && auth && auth.currentUser) {
    await auth.currentUser.updateProfile({ displayName: data.displayName });
  }
}

// ============================================================
//  CONTENT MANAGEMENT (CMS) FUNCTIONS
// ============================================================

/** Save page content to Firestore */
async function savePageContent(pageId, content) {
  if (!db) throw new Error("Firestore not loaded");
  await db.collection('pages').doc(pageId).set({
    content,
    updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    updatedBy: (auth && auth.currentUser) ? auth.currentUser.uid : 'admin'
  }, { merge: true });
}

/** Load page content from Firestore */
async function loadPageContent(pageId) {
  if (!db) return null;
  const doc = await db.collection('pages').doc(pageId).get();
  return doc.exists ? doc.data() : null;
}

/** Upload file to Firebase Storage */
async function uploadFile(file, path, onProgress) {
  if (!storage) throw new Error("Firebase Storage not loaded");
  const storageRef = storage.ref(path);
  const uploadTask = storageRef.put(file);

  return new Promise((resolve, reject) => {
    uploadTask.on('state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        if (onProgress) onProgress(progress);
      },
      reject,
      async () => {
        const url = await uploadTask.snapshot.ref.getDownloadURL();
        resolve(url);
      }
    );
  });
}

/** Get all users */
async function getAllUsers() {
  if (!db) return [];
  const snapshot = await db.collection('users').orderBy('createdAt', 'desc').get();
  return snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
}

/** Update user role */
async function updateUserRole(uid, role) {
  if (!db) return;
  await db.collection('users').doc(uid).update({ role });
}

console.log('🔥 Firebase initialized with live project credentials for dirkgeeroms.be');
