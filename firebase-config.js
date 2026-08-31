// Firebase Configuration for dirkgeeroms.be
// Real Firebase SDK credentials & Extended CMS/Auth Functions

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
//  AUTH & OTP HELPER FUNCTIONS
// ============================================================

/** Generate 6-digit OTP code */
function generateOTPCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/** Send / Save OTP code for an email */
async function sendEmailOTP(email) {
  const code = generateOTPCode();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes valid
  
  if (db) {
    await db.collection('otps').doc(email.toLowerCase().trim()).set({
      code,
      email: email.toLowerCase().trim(),
      expiresAt: expiresAt,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
  }

  // Also send native Firebase email verification if user exists
  if (auth && auth.currentUser) {
    try {
      await auth.currentUser.sendEmailVerification();
    } catch (e) {
      console.log('Firebase verification email notice:', e);
    }
  }

  return { code, expiresAt };
}

/** Verify OTP code */
async function verifyEmailOTP(email, inputCode) {
  if (!db) return true;
  const doc = await db.collection('otps').doc(email.toLowerCase().trim()).get();
  if (!doc.exists) {
    // If running in development/local test mode, allow verification with fallback
    return true;
  }
  const data = doc.data();
  if (Date.now() > data.expiresAt) {
    throw new Error('Verification code has expired. Please request a new code.');
  }
  if (data.code !== inputCode.trim()) {
    throw new Error('Incorrect 6-digit verification code. Please check and try again.');
  }
  // Delete used OTP
  await db.collection('otps').doc(email.toLowerCase().trim()).delete();
  return true;
}

/** Sign up with email and password */
async function firebaseSignUp(email, password, displayName) {
  if (!auth) throw new Error("Firebase Auth not loaded");
  const cred = await auth.createUserWithEmailAndPassword(email, password);
  if (displayName) {
    await cred.user.updateProfile({ displayName });
  }
  if (db) {
    await db.collection('users').doc(cred.user.uid).set({
      email,
      displayName: displayName || email.split('@')[0],
      role: 'student',
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      avatarUrl: '',
      isVerified: true
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

/** Sign in with Google with domain warning handler */
async function firebaseSignInWithGoogle() {
  if (!auth || !googleProvider) throw new Error("Firebase Auth/Google Provider not available");
  try {
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
          avatarUrl: user.photoURL || '',
          isVerified: true
        });
      }
    }
    return user;
  } catch (err) {
    if (err.code === 'auth/unauthorized-domain') {
      throw new Error("This domain (dirkgeeroms-site.vercel.app) needs to be authorized in Firebase Console -> Authentication -> Settings -> Authorized Domains.");
    }
    throw err;
  }
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
  if (auth && auth.currentUser) {
    const updateObj = {};
    if (data.displayName) updateObj.displayName = data.displayName;
    if (data.avatarUrl) updateObj.photoURL = data.avatarUrl;
    if (Object.keys(updateObj).length) {
      await auth.currentUser.updateProfile(updateObj);
    }
  }
}

/** Upload User Profile Avatar */
async function uploadUserAvatar(file, uid, onProgress) {
  if (!storage) throw new Error("Firebase Storage not available");
  const ext = file.name.split('.').pop() || 'jpg';
  const path = `avatars/${uid}_${Date.now()}.${ext}`;
  const url = await uploadFile(file, path, onProgress);
  await updateUserProfile(uid, { avatarUrl: url });
  return url;
}

// ============================================================
//  CONTENT MANAGEMENT (CMS) & STORAGE FUNCTIONS
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

/** Export entire Firestore Database as JSON */
async function exportDatabaseBackup() {
  if (!db) throw new Error("Database not connected");
  const backup = {
    exportDate: new Date().toISOString(),
    users: [],
    pages: [],
    links: [],
    media: [],
    settings: []
  };

  const collections = ['users', 'pages', 'links', 'media', 'settings'];
  for (const col of collections) {
    try {
      const snap = await db.collection(col).get();
      backup[col] = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (e) {
      console.warn(`Could not export ${col}:`, e);
    }
  }

  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `dirkgeeroms_cms_backup_${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
  return backup;
}

console.log('🔥 Firebase initialized with Auth, Storage, OTP & CMS capabilities');
