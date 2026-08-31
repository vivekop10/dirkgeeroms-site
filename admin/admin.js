// Admin Control Panel Logic for dirkgeeroms.be
// Upgraded with SVG icons, Document Library, WYSIWYG helper, and DB Exporter

let currentAdminUser = null;
let isUnlockedViaKey = false;

// UI Elements
const authGate = document.getElementById('authGate');
const adminDashboard = document.getElementById('adminDashboard');
const notification = document.getElementById('adminNotification');

function showNotice(msg, isSuccess = true) {
  notification.textContent = msg;
  notification.style.display = 'block';
  notification.style.background = isSuccess ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)';
  notification.style.border = isSuccess ? '1px solid rgba(34,197,94,0.3)' : '1px solid rgba(239,68,68,0.3)';
  notification.style.color = isSuccess ? '#22c55e' : '#ef4444';
  setTimeout(() => notification.style.display = 'none', 4500);
}

// Tab Switching
function switchAdminTab(tabName) {
  document.querySelectorAll('.admin-nav-item').forEach(el => {
    el.classList.toggle('active', el.getAttribute('data-tab') === tabName);
  });
  document.querySelectorAll('.admin-panel').forEach(panel => {
    panel.classList.toggle('active', panel.id === `panel-${tabName}`);
  });
}

document.querySelectorAll('.admin-nav-item').forEach(item => {
  item.addEventListener('click', () => {
    const tab = item.getAttribute('data-tab');
    if (tab) switchAdminTab(tab);
  });
});

// Authorize & Initialize Dashboard
function unlockAdminInterface(email = 'Admin') {
  authGate.style.display = 'none';
  adminDashboard.style.display = 'flex';
  document.getElementById('adminUserEmail').textContent = email;
  loadStats();
  loadPageEditorContent('homepage');
  loadMediaLibrary();
  loadDocumentsLibrary();
  loadLinksList();
  loadUsersTable();
  loadAnnouncementBanner();
}

// Master Key Quick Unlock Form
document.getElementById('quickUnlockForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const key = document.getElementById('quickKeyInput').value.trim();
  if (key === ADMIN_SECRET_KEY) {
    isUnlockedViaKey = true;
    unlockAdminInterface('Master Key Session');
  } else {
    alert('Incorrect Master Key.');
  }
});

// Firebase Auth State Listener
auth.onAuthStateChanged(async (user) => {
  if (isUnlockedViaKey) return;
  if (!user) {
    authGate.style.display = 'block';
    adminDashboard.style.display = 'none';
    return;
  }

  currentAdminUser = user;
  try {
    const profile = await getUserProfile(user.uid);
    if (profile && (profile.role === 'admin' || profile.role === 'teacher')) {
      unlockAdminInterface(user.email);
    } else {
      authGate.style.display = 'block';
      adminDashboard.style.display = 'none';
    }
  } catch (err) {
    console.error('Error verifying admin permissions:', err);
  }
});

// Admin Sign Out
document.getElementById('adminSignOutBtn').addEventListener('click', async () => {
  isUnlockedViaKey = false;
  await firebaseSignOut();
  window.location.reload();
});

// ============================================================
//  1. STATS
// ============================================================
async function loadStats() {
  try {
    const usersSnap = await db.collection('users').get();
    document.getElementById('statUserCount').textContent = usersSnap.size;
  } catch (e) {
    document.getElementById('statUserCount').textContent = '1+';
  }
}

// ============================================================
//  2. CONTENT / PAGE TEXT EDITOR & TOOLBAR
// ============================================================
const pageSelect = document.getElementById('pageSelect');
const contentTitle = document.getElementById('contentTitle');
const contentBody = document.getElementById('contentBody');
const saveContentBtn = document.getElementById('saveContentBtn');
const saveStatus = document.getElementById('saveStatus');

function insertFormat(before, after) {
  const start = contentBody.selectionStart;
  const end = contentBody.selectionEnd;
  const selectedText = contentBody.value.substring(start, end);
  const replacement = before + (selectedText || 'text') + after;
  contentBody.value = contentBody.value.substring(0, start) + replacement + contentBody.value.substring(end);
  contentBody.focus();
  contentBody.selectionStart = start + before.length;
  contentBody.selectionEnd = start + before.length + (selectedText ? selectedText.length : 4);
}

async function loadPageEditorContent(pageId) {
  saveStatus.textContent = 'Loading content...';
  try {
    const data = await loadPageContent(pageId);
    if (data && data.content) {
      contentTitle.value = data.content.title || '';
      contentBody.value = data.content.body || '';
      saveStatus.textContent = `Last updated: ${data.updatedAt ? new Date(data.updatedAt.toDate()).toLocaleString() : 'Recently'}`;
    } else {
      contentTitle.value = '';
      contentBody.value = '';
      saveStatus.textContent = 'No custom overrides yet. Default template active.';
    }
  } catch (e) {
    saveStatus.textContent = 'Ready to edit.';
  }
}

pageSelect.addEventListener('change', () => {
  loadPageEditorContent(pageSelect.value);
});

saveContentBtn.addEventListener('click', async () => {
  const pageId = pageSelect.value;
  saveContentBtn.disabled = true;
  saveContentBtn.textContent = 'Saving...';
  
  try {
    await savePageContent(pageId, {
      title: contentTitle.value,
      body: contentBody.value
    });
    showNotice(`Page "${pageId}" published successfully!`);
    saveStatus.textContent = 'Saved just now.';
  } catch (e) {
    showNotice('Failed to save: ' + e.message, false);
  } finally {
    saveContentBtn.disabled = false;
    saveContentBtn.innerHTML = `
      <svg viewBox="0 0 24 24" class="svg-icon" style="width:16px; height:16px;"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
      Save & Publish Changes
    `;
  }
});

// ============================================================
//  3. PHOTO & MEDIA MANAGER (Firebase Storage)
// ============================================================
const dropzone = document.getElementById('photoDropzone');
const filePicker = document.getElementById('filePicker');
const progressBar = document.getElementById('uploadProgressBar');
const progressText = document.getElementById('uploadProgressText');
const progressContainer = document.getElementById('uploadProgressContainer');
const mediaGrid = document.getElementById('mediaLibraryGrid');

dropzone.addEventListener('click', () => filePicker.click());

dropzone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropzone.classList.add('dragover');
});
dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
dropzone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropzone.classList.remove('dragover');
  if (e.dataTransfer.files.length) {
    handleFileUploads(e.dataTransfer.files);
  }
});

filePicker.addEventListener('change', () => {
  if (filePicker.files.length) {
    handleFileUploads(filePicker.files);
  }
});

async function handleFileUploads(files) {
  progressContainer.style.display = 'block';
  let total = files.length;
  let done = 0;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const path = `uploads/${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
    try {
      progressText.textContent = `Uploading ${file.name} (${i + 1}/${total})...`;
      const url = await uploadFile(file, path, (pct) => {
        progressBar.style.width = pct + '%';
      });

      await db.collection('media').add({
        name: file.name,
        url: url,
        path: path,
        size: file.size,
        uploadedAt: firebase.firestore.FieldValue.serverTimestamp()
      });

      done++;
    } catch (e) {
      console.error('Upload failed for', file.name, e);
    }
  }

  progressText.textContent = `Completed ${done} photo uploads!`;
  setTimeout(() => progressContainer.style.display = 'none', 3000);
  loadMediaLibrary();
}

async function loadMediaLibrary() {
  try {
    const snap = await db.collection('media').orderBy('uploadedAt', 'desc').limit(30).get();
    if (snap.empty) {
      mediaGrid.innerHTML = `<div style="grid-column: 1 / -1; color:var(--text-muted); font-size:0.9rem;">No photos uploaded yet. Drop photos above to start your collection.</div>`;
      document.getElementById('statPhotoCount').textContent = '0';
      return;
    }

    document.getElementById('statPhotoCount').textContent = snap.size;
    mediaGrid.innerHTML = '';
    snap.docs.forEach(doc => {
      const data = doc.data();
      const card = document.createElement('div');
      card.className = 'media-card';
      card.innerHTML = `
        <img src="${data.url}" alt="${data.name}" loading="lazy">
        <div class="media-card-info">
          <span style="font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${data.name}">${data.name}</span>
          <div style="display:flex; gap:6px;">
            <button class="btn-login" style="flex:1; padding:4px 8px; font-size:0.75rem; background:var(--surface); border:1px solid var(--border); color:var(--text);" onclick="copyToClipboard('${data.url}')">
              Copy URL
            </button>
            <button onclick="deleteMediaDoc('${doc.id}')" style="background:none; border:1px solid rgba(239,68,68,0.3); color:#ef4444; border-radius:4px; padding:2px 8px; cursor:pointer;" title="Delete">
              ✕
            </button>
          </div>
        </div>
      `;
      mediaGrid.appendChild(card);
    });
  } catch (e) {
    console.error('Error loading media:', e);
  }
}

async function deleteMediaDoc(docId) {
  if (confirm('Delete this photo reference?')) {
    await db.collection('media').doc(docId).delete();
    showNotice('Photo reference removed.');
    loadMediaLibrary();
  }
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    showNotice('Link copied to clipboard!');
  });
}

// ============================================================
//  4. PDF & DOCUMENT MANAGER
// ============================================================
const docUploadForm = document.getElementById('docUploadForm');
const documentsList = document.getElementById('documentsList');

docUploadForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const title = document.getElementById('docTitle').value.trim();
  const grade = document.getElementById('docGrade').value;
  const fileInput = document.getElementById('docFile');
  const btn = document.getElementById('docUploadBtn');

  if (!fileInput.files.length) return;
  const file = fileInput.files[0];

  btn.disabled = true;
  btn.textContent = 'Uploading Document...';

  try {
    const path = `documents/${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
    const url = await uploadFile(file, path);

    await db.collection('documents').add({
      title,
      grade,
      fileName: file.name,
      url,
      size: file.size,
      uploadedAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    showNotice(`Document "${title}" uploaded to library!`);
    docUploadForm.reset();
    loadDocumentsLibrary();
  } catch (err) {
    showNotice('Document upload failed: ' + err.message, false);
  } finally {
    btn.disabled = false;
    btn.textContent = 'Upload to Student Library';
  }
});

async function loadDocumentsLibrary() {
  try {
    const snap = await db.collection('documents').orderBy('uploadedAt', 'desc').get();
    if (snap.empty) {
      documentsList.innerHTML = `<div style="color:var(--text-muted); font-size:0.9rem;">No documents uploaded yet. Upload PDFs or worksheets above.</div>`;
      return;
    }
    documentsList.innerHTML = '';
    snap.docs.forEach(doc => {
      const d = doc.data();
      const item = document.createElement('div');
      item.style.cssText = 'background:var(--surface); border:1px solid var(--border); border-radius:8px; padding:12px 16px; display:flex; justify-content:space-between; align-items:center;';
      item.innerHTML = `
        <div>
          <a href="${d.url}" target="_blank" style="font-weight:700; text-decoration:none; color:var(--primary); font-size:0.95rem;">📄 ${d.title}</a>
          <span style="font-size:0.8rem; color:var(--text-muted); margin-left:8px;">[${d.grade}]</span>
          <div style="font-size:0.8rem; color:var(--text-muted); margin-top:2px;">File: ${d.fileName}</div>
        </div>
        <div style="display:flex; align-items:center; gap:8px;">
          <button class="btn-login" style="padding:4px 10px; font-size:0.78rem; background:var(--surface); border:1px solid var(--border); color:var(--text);" onclick="copyToClipboard('${d.url}')">
            Copy Download Link
          </button>
          <button onclick="deleteDocFile('${doc.id}')" style="background:none; border:none; color:#ef4444; cursor:pointer; font-weight:bold; font-size:1.1rem;">✕</button>
        </div>
      `;
      documentsList.appendChild(item);
    });
  } catch (e) {
    console.error('Error loading documents:', e);
  }
}

async function deleteDocFile(docId) {
  if (confirm('Delete this document?')) {
    await db.collection('documents').doc(docId).delete();
    showNotice('Document removed.');
    loadDocumentsLibrary();
  }
}

// ============================================================
//  5. LINKS & NAV MANAGER
// ============================================================
const addLinkForm = document.getElementById('addLinkForm');
const activeLinksList = document.getElementById('activeLinksList');

addLinkForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const title = document.getElementById('linkTitle').value.trim();
  const url = document.getElementById('linkUrl').value.trim();
  const category = document.getElementById('linkCategory').value;

  try {
    await db.collection('links').add({
      title,
      url,
      category,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    showNotice(`Link "${title}" added successfully!`);
    addLinkForm.reset();
    loadLinksList();
  } catch (err) {
    showNotice('Failed to add link: ' + err.message, false);
  }
});

async function loadLinksList() {
  try {
    const snap = await db.collection('links').orderBy('createdAt', 'desc').get();
    if (snap.empty) {
      activeLinksList.innerHTML = `<div style="color:var(--text-muted); font-size:0.9rem;">No custom links added yet.</div>`;
      return;
    }
    activeLinksList.innerHTML = '';
    snap.docs.forEach(doc => {
      const l = doc.data();
      const item = document.createElement('div');
      item.style.cssText = 'background:var(--surface); border:1px solid var(--border); border-radius:8px; padding:10px 14px; display:flex; justify-content:space-between; align-items:center;';
      item.innerHTML = `
        <div>
          <a href="${l.url}" target="_blank" style="font-weight:600; text-decoration:none; color:var(--primary);">${l.title}</a>
          <span style="font-size:0.8rem; color:var(--text-muted); margin-left:8px;">[${l.category}]</span>
          <div style="font-size:0.8rem; color:var(--text-muted);">${l.url}</div>
        </div>
        <button onclick="deleteLinkDoc('${doc.id}')" style="background:none; border:none; color:#ef4444; cursor:pointer; font-weight:bold; font-size:1.1rem;" title="Delete">✕</button>
      `;
      activeLinksList.appendChild(item);
    });
  } catch (e) {
    console.error('Error loading links:', e);
  }
}

async function deleteLinkDoc(docId) {
  if (confirm('Delete this link?')) {
    await db.collection('links').doc(docId).delete();
    showNotice('Link removed.');
    loadLinksList();
  }
}

// ============================================================
//  6. USER MANAGEMENT TABLE
// ============================================================
async function loadUsersTable() {
  const tbody = document.getElementById('userTableBody');
  try {
    const users = await getAllUsers();
    if (!users.length) {
      tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;">No users registered yet.</td></tr>`;
      return;
    }
    tbody.innerHTML = '';
    users.forEach(u => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><b>${u.displayName || 'No Name'}</b></td>
        <td>${u.email || '-'}</td>
        <td><span class="role-badge role-${u.role || 'student'}">${u.role || 'student'}</span></td>
        <td>
          <select onchange="changeUserRole('${u.uid}', this.value)" style="padding:4px 8px; border-radius:6px; border:1px solid var(--border); background:var(--surface); color:var(--text);">
            <option value="student" ${u.role === 'student' ? 'selected' : ''}>Student</option>
            <option value="teacher" ${u.role === 'teacher' ? 'selected' : ''}>Teacher</option>
            <option value="admin" ${u.role === 'admin' ? 'selected' : ''}>Admin</option>
          </select>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (e) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; color:var(--text-muted);">Users will appear as they register.</td></tr>`;
  }
}

async function changeUserRole(uid, newRole) {
  try {
    await updateUserRole(uid, newRole);
    showNotice(`Updated role to ${newRole}`);
  } catch (e) {
    showNotice('Failed to update role: ' + e.message, false);
  }
}

// ============================================================
//  7. ANNOUNCEMENT BANNER
// ============================================================
const announcementForm = document.getElementById('announcementForm');
const announceActive = document.getElementById('announceActive');
const announceText = document.getElementById('announceText');
const announceLink = document.getElementById('announceLink');

async function loadAnnouncementBanner() {
  try {
    const doc = await db.collection('settings').doc('announcement').get();
    if (doc.exists) {
      const data = doc.data();
      announceActive.checked = data.active || false;
      announceText.value = data.text || '';
      announceLink.value = data.link || '';
    }
  } catch (e) {
    console.error('Error loading announcement:', e);
  }
}

announcementForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  try {
    await db.collection('settings').doc('announcement').set({
      active: announceActive.checked,
      text: announceText.value.trim(),
      link: announceLink.value.trim(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    showNotice('Global notice banner saved!');
  } catch (e) {
    showNotice('Failed to update notice: ' + e.message, false);
  }
});

// ============================================================
//  8. DATABASE 1-CLICK EXPORT & BACKUP
// ============================================================
document.getElementById('exportDbBtn').addEventListener('click', async () => {
  try {
    showNotice('Preparing complete JSON database archive...');
    await exportDatabaseBackup();
    showNotice('🎉 Database backup exported successfully!');
  } catch (e) {
    showNotice('Backup failed: ' + e.message, false);
  }
});

console.log('🛡️ Admin CMS logic active with full toolkit.');
