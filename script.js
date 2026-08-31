/* ============================================
   dirkgeeroms.be — Minimalistic Redesign JS
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initSlideshow();
  initSidebarAccordion();
  initQuoteRotation();
  initThemeToggle();
  initSearch();
  initGalleryLightbox();
  initLoginStatus();
  initInteractiveVideoCards();
  initSimulationFilters();
});


/* --- Interactive Login Status System --- */
/* --- Interactive Login Status System (with Firebase Auth & Roles) --- */
function initLoginStatus() {
  const loginWidgets = document.querySelectorAll('#login-widget');
  const fbLockedView = document.getElementById('fbLockedView');
  const fbUnlockedView = document.getElementById('fbUnlockedView');
  const fbUsernameDisplay = document.getElementById('fbUsernameDisplay');
  const fbDemoLoginBtn = document.getElementById('fbDemoLoginBtn');
  const fbLogoutBtn = document.getElementById('fbLogoutBtn');

  function getRelativeRoot() {
    const parts = window.location.pathname.split('/').filter(Boolean);
    const depth = parts.length > 0 && parts[parts.length - 1].endsWith('.html') ? parts.length - 1 : parts.length;
    return depth > 0 ? '../'.repeat(depth) : './';
  }

  function getCachedUser() {
    try {
      const u = localStorage.getItem('currentUser');
      return u ? JSON.parse(u) : null;
    } catch (e) { return null; }
  }

  function setCachedUser(user) {
    if (user) localStorage.setItem('currentUser', JSON.stringify(user));
    else localStorage.removeItem('currentUser');
  }

  function renderUserUI(user) {
    loginWidgets.forEach(widget => {
      if (user) {
        const root = getRelativeRoot();
        const role = user.role || 'Student';
        const isAdmin = role.toLowerCase() === 'admin' || role.toLowerCase() === 'teacher';

        widget.innerHTML = `
          <div class="sidebar-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            My Account
          </div>
          <div class="user-profile-card" style="display:flex; flex-direction:column; gap:8px;">
            <div style="display:flex; align-items:center; gap:10px;">
              <div class="user-avatar-badge" style="background:var(--primary); color:#fff; width:38px; height:38px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:bold; font-size:1.1rem;">
                ${user.username.charAt(0).toUpperCase()}
              </div>
              <div class="user-details" style="flex:1; overflow:hidden;">
                <strong class="user-name" style="display:block; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${escapeHtml(user.username)}</strong>
                <span class="user-role-tag" style="font-size:0.75rem; text-transform:uppercase; padding:2px 6px; border-radius:4px; background:rgba(65,166,42,0.15); color:var(--primary); font-weight:700;">${escapeHtml(role)}</span>
              </div>
            </div>
            
            <div class="user-quick-links" style="display:flex; flex-direction:column; gap:4px; margin-top:6px; font-size:0.88rem;">
              <a href="${root}profile/index.html" class="user-link" style="color:var(--text); text-decoration:none; display:flex; align-items:center; gap:6px;">👤 Profile & Settings</a>
              <a href="${root}filebrowser/index.html" class="user-link" style="color:var(--text); text-decoration:none; display:flex; align-items:center; gap:6px;">📁 Unlocked Filebrowser</a>
              ${isAdmin ? `<a href="${root}admin/index.html" class="user-link" style="color:#ef4444; font-weight:700; text-decoration:none; display:flex; align-items:center; gap:6px;">⚙️ Admin Control Panel</a>` : ''}
            </div>

            <button class="btn-logout" id="sidebarLogoutBtn" style="margin-top:6px; padding:6px 10px; background:rgba(239,68,68,0.1); border:1px solid rgba(239,68,68,0.25); color:#ef4444; border-radius:6px; cursor:pointer; font-weight:600; font-size:0.85rem;">Log Out</button>
          </div>
        `;
        const logoutBtn = widget.querySelector('#sidebarLogoutBtn');
        if (logoutBtn) {
          logoutBtn.addEventListener('click', async () => {
            if (typeof firebaseSignOut === 'function') {
              await firebaseSignOut();
            } else if (typeof auth !== 'undefined' && auth) {
              await auth.signOut();
            }
            setCachedUser(null);
            renderUserUI(null);
          });
        }
      } else {
        const root = getRelativeRoot();
        widget.innerHTML = `
          <div class="sidebar-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            Login Status
          </div>
          <form class="login-form" id="sidebarLoginForm" action="${root}login/index.html">
            <label for="login-user">Username or Email</label>
            <input type="text" id="login-user" name="log" placeholder="e.g. Student" required>
            <label for="login-pass">Password</label>
            <input type="password" id="login-pass" name="pwd" placeholder="••••••••" required>
            <div class="login-actions">
              <button type="submit" class="btn-login">log in</button>
              <div class="login-links">
                <a href="${root}forgot-password/index.html">Forgot?</a>
                <a href="${root}register/index.html">Register</a>
              </div>
            </div>
          </form>
        `;
        const form = widget.querySelector('#sidebarLoginForm');
        if (form) {
          form.addEventListener('submit', (e) => {
            e.preventDefault();
            const root = getRelativeRoot();
            window.location.href = root + 'login/index.html';
          });
        }
      }
    });

    if (fbLockedView && fbUnlockedView) {
      if (user) {
        fbLockedView.style.display = 'none';
        fbUnlockedView.style.display = 'block';
        if (fbUsernameDisplay) fbUsernameDisplay.textContent = user.username;
      } else {
        fbLockedView.style.display = 'block';
        fbUnlockedView.style.display = 'none';
      }
    }
  }

  // Initial render from local cache for instant UI
  renderUserUI(getCachedUser());

  // Listen to live Firebase Auth state if SDK is available
  if (typeof auth !== 'undefined' && auth) {
    auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        let role = 'student';
        try {
          if (typeof getUserProfile === 'function') {
            const prof = await getUserProfile(firebaseUser.uid);
            if (prof && prof.role) role = prof.role;
          }
        } catch (e) {}

        const userObj = {
          uid: firebaseUser.uid,
          username: firebaseUser.displayName || firebaseUser.email.split('@')[0],
          email: firebaseUser.email,
          role: role
        };
        setCachedUser(userObj);
        renderUserUI(userObj);
      } else {
        setCachedUser(null);
        renderUserUI(null);
      }
    });
  }

  if (fbDemoLoginBtn) {
    fbDemoLoginBtn.addEventListener('click', () => {
      const u = { username: 'Demo Student', role: 'Student' };
      setCachedUser(u);
      renderUserUI(u);
    });
  }

  if (fbLogoutBtn) {
    fbLogoutBtn.addEventListener('click', async () => {
      if (typeof firebaseSignOut === 'function') await firebaseSignOut();
      setCachedUser(null);
      renderUserUI(null);
    });
  }
}

/* --- Pop-Up Window Video Player Modal --- */
function openVideoModal(videoId, title) {
  if (!videoId) return;

  // Remove existing modal if any
  const existing = document.querySelector('.video-modal-overlay');
  if (existing) existing.remove();

  const isLocalFile = window.location.protocol === 'file:';

  const overlay = document.createElement('div');
  overlay.className = 'video-modal-overlay';
  overlay.innerHTML = `
    <div class="video-modal-dialog">
      <div class="video-modal-header">
        <div class="video-modal-title">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="video-modal-icon"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          <span>${escapeHtml(title || 'Video Player')}</span>
        </div>
        <div class="video-modal-actions">
          <a href="https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}" target="_blank" rel="noopener" class="video-modal-yt-btn" title="Open directly on YouTube">
            Bekijk op YouTube ↗
          </a>
          <button class="video-modal-close" aria-label="Close video">&times;</button>
        </div>
      </div>
      ${isLocalFile ? `
      <div class="video-modal-notice">
        <span>💡 <strong>Tip:</strong> YouTube beperkt videoweergave in offline bestandsmodus (<code>file:///</code>). Klik op <strong>"Bekijk op YouTube ↗"</strong> om de video direct af te spelen, of start <code>start_server.bat</code> voor lokale webserver.</span>
      </div>` : ''}
      <div class="video-modal-body">
        <iframe 
          src="https://www.youtube.com/embed/${encodeURIComponent(videoId)}?autoplay=1&enablejsapi=1&rel=0&modestbranding=1" 
          class="video-modal-iframe"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
          allowfullscreen 
          referrerpolicy="strict-origin-when-cross-origin">
        </iframe>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  document.body.style.overflow = 'hidden';
  requestAnimationFrame(() => overlay.classList.add('active'));

  function closeVideoModal() {
    overlay.classList.remove('active');
    document.body.style.overflow = '';
    setTimeout(() => overlay.remove(), 250);
  }

  const closeBtn = overlay.querySelector('.video-modal-close');
  if (closeBtn) closeBtn.addEventListener('click', closeVideoModal);

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeVideoModal();
  });

  function escHandler(e) {
    if (e.key === 'Escape') {
      closeVideoModal();
      document.removeEventListener('keydown', escHandler);
    }
  }
  document.addEventListener('keydown', escHandler);
}

/* --- Initialize YouTube Video Thumbnails & Pop-Up Trigger --- */
function initInteractiveVideoCards() {
  // Populate thumbnails for all .embed-youtube containers
  const ytContainers = document.querySelectorAll('.embed-youtube');
  ytContainers.forEach(container => {
    const videoId = container.dataset.videoId;
    if (!videoId) return;

    if (!container.querySelector('img')) {
      container.innerHTML = `
        <div class="video-thumb-container">
          <img src="https://img.youtube.com/vi/${videoId}/hqdefault.jpg" alt="Video thumbnail" class="video-thumb" loading="lazy">
          <div class="video-play-badge">▶</div>
        </div>
      `;
    }
    container.style.cursor = 'pointer';
  });

  // Delegated click handler for all video triggers
  document.addEventListener('click', (e) => {
    // 1. .embed-youtube click
    const embedContainer = e.target.closest('.embed-youtube');
    if (embedContainer) {
      e.preventDefault();
      const videoId = embedContainer.dataset.videoId;
      const row = embedContainer.closest('tr');
      let title = '';
      if (row) {
        const topicCol = row.querySelector('.column-2, td:nth-child(2)');
        const descCol = row.querySelector('.column-4, .column-5, td:nth-child(4), td:nth-child(5)');
        title = (topicCol ? topicCol.textContent.trim() : '') + (descCol ? ' — ' + descCol.textContent.trim() : '');
      }
      openVideoModal(videoId, title || 'Videoles');
      return;
    }

    // 2. .video-preview-card click
    const previewCard = e.target.closest('.video-preview-card');
    if (previewCard && !e.target.closest('.video-yt-link')) {
      e.preventDefault();
      const videoId = previewCard.dataset.videoId;
      const title = previewCard.dataset.title || previewCard.querySelector('.video-title')?.textContent || 'Videoles';
      openVideoModal(videoId, title);
      return;
    }

    // 3. YouTube link click (e.g. href containing youtube.com/watch?v= or youtu.be/)
    const ytLink = e.target.closest('a');
    if (ytLink && !ytLink.closest('.video-modal-actions')) {
      const href = ytLink.getAttribute('href') || '';
      const match = href.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
      if (match && !ytLink.classList.contains('video-modal-yt-btn')) {
        // If clicking a video link in content, pop up modal instead of redirecting or breaking
        e.preventDefault();
        const videoId = match[1];
        openVideoModal(videoId, ytLink.textContent.trim() || 'Video');
      }
    }
  });
}

/* --- Simulation Library Category Filtering --- */
function initSimulationFilters() {
  const filterBtns = document.querySelectorAll('.sim-filter-btn');
  const simCards = document.querySelectorAll('.sim-card');
  if (!filterBtns.length || !simCards.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;

      simCards.forEach(card => {
        if (filter === 'all' || card.dataset.category === filter) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}


/* --- Mobile Menu Toggle --- */
function initMobileMenu() {
  const toggle = document.getElementById('menuToggle');
  const nav = document.getElementById('primaryNav');
  if (!toggle || !nav) return;

  toggle.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!expanded));
    nav.classList.toggle('active');

    // Animate hamburger to X
    const lines = toggle.querySelectorAll('line');
    if (!expanded) {
      lines[0].setAttribute('y1', '12'); lines[0].setAttribute('y2', '12');
      lines[0].setAttribute('x1', '5');  lines[0].setAttribute('x2', '19');
      lines[0].style.transform = 'rotate(45deg)';
      lines[0].style.transformOrigin = 'center';
      lines[1].style.opacity = '0';
      lines[2].setAttribute('y1', '12'); lines[2].setAttribute('y2', '12');
      lines[2].setAttribute('x1', '5');  lines[2].setAttribute('x2', '19');
      lines[2].style.transform = 'rotate(-45deg)';
      lines[2].style.transformOrigin = 'center';
    } else {
      lines[0].setAttribute('y1', '6');  lines[0].setAttribute('y2', '6');
      lines[0].setAttribute('x1', '3');  lines[0].setAttribute('x2', '21');
      lines[0].style.transform = '';
      lines[1].style.opacity = '1';
      lines[2].setAttribute('y1', '18'); lines[2].setAttribute('y2', '18');
      lines[2].setAttribute('x1', '3');  lines[2].setAttribute('x2', '21');
      lines[2].style.transform = '';
    }
  });
}

/* --- Image Slideshow --- */
function initSlideshow() {
  const container = document.getElementById('slideshowContainer');
  if (!container) return;

  const images = container.querySelectorAll('img');
  const dotsContainer = document.getElementById('slideshowDots');
  if (!images.length || !dotsContainer) return;
  let currentIndex = 0;
  let interval;

  // Create dots
  images.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', `Slide ${i + 1}`);
    dot.addEventListener('click', () => goToSlide(i));
    dotsContainer.appendChild(dot);
  });

  const dots = dotsContainer.querySelectorAll('.dot');

  function goToSlide(index) {
    images[currentIndex].classList.remove('active');
    dots[currentIndex].classList.remove('active');
    currentIndex = index;
    images[currentIndex].classList.add('active');
    dots[currentIndex].classList.add('active');
    resetInterval();
  }

  function nextSlide() {
    goToSlide((currentIndex + 1) % images.length);
  }

  function resetInterval() {
    clearInterval(interval);
    interval = setInterval(nextSlide, 4000);
  }

  // Start auto-play
  resetInterval();
}

/* --- Sidebar Accordion --- */
function initSidebarAccordion() {
  const items = document.querySelectorAll('.sidebar-nav-item.has-children > a');

  items.forEach(link => {
    link.addEventListener('click', (e) => {
      // If it has a chevron, toggle the submenu instead of navigating
      const chevron = link.querySelector('.chevron');
      if (chevron) {
        e.preventDefault();
        const parent = link.parentElement;
        parent.classList.toggle('open');
      }
    });
  });
}

/* --- Quote Rotation --- */
function initQuoteRotation() {
  const quoteEl = document.getElementById('quoteText');
  const authorEl = document.getElementById('quoteAuthor');
  if (!quoteEl || !authorEl) return;

  const quotes = [
    {
      text: "Religion is a phase a species goes through when it evolves enough intelligence to ask profound questions but not enough to answer them.",
      author: "Bill Flavell"
    },
    {
      text: "The important thing is not to stop questioning. Curiosity has its own reason for existing.",
      author: "Albert Einstein"
    },
    {
      text: "If you can't explain it simply, you don't understand it well enough.",
      author: "Albert Einstein"
    },
    {
      text: "The only way to do great work is to love what you do.",
      author: "Steve Jobs"
    },
    {
      text: "In the middle of difficulty lies opportunity.",
      author: "Albert Einstein"
    },
    {
      text: "Science is a way of thinking much more than it is a body of knowledge.",
      author: "Carl Sagan"
    },
    {
      text: "The good thing about science is that it's true whether or not you believe in it.",
      author: "Neil deGrasse Tyson"
    },
    {
      text: "Somewhere, something incredible is waiting to be known.",
      author: "Carl Sagan"
    }
  ];

  let currentQuote = 0;

  function showQuote(index) {
    quoteEl.style.opacity = '0';
    authorEl.style.opacity = '0';

    setTimeout(() => {
      quoteEl.textContent = quotes[index].text;
      authorEl.textContent = '— ' + quotes[index].author;
      quoteEl.style.opacity = '1';
      authorEl.style.opacity = '1';
    }, 400);
  }

  // Show first quote immediately
  showQuote(0);

  // Rotate every 8 seconds
  setInterval(() => {
    currentQuote = (currentQuote + 1) % quotes.length;
    showQuote(currentQuote);
  }, 8000);
}

/* --- Theme Toggle (Dark / Light) --- */
function initThemeToggle() {
  const btn = document.getElementById('themeToggle');
  if (!btn) return;

  const sunIcon = btn.querySelector('.icon-sun');
  const moonIcon = btn.querySelector('.icon-moon');

  // Check saved preference or system preference
  const saved = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  if (saved === 'dark' || (!saved && prefersDark)) {
    document.documentElement.setAttribute('data-theme', 'dark');
    if (sunIcon) sunIcon.style.display = 'none';
    if (moonIcon) moonIcon.style.display = 'block';
  } else {
    document.documentElement.setAttribute('data-theme', 'light');
    if (sunIcon) sunIcon.style.display = 'block';
    if (moonIcon) moonIcon.style.display = 'none';
  }

  btn.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);

    if (next === 'dark') {
      if (sunIcon) sunIcon.style.display = 'none';
      if (moonIcon) moonIcon.style.display = 'block';
    } else {
      if (sunIcon) sunIcon.style.display = 'block';
      if (moonIcon) moonIcon.style.display = 'none';
    }
  });
}

/* --- Search Functionality --- */
function initSearch() {
  const toggleBtn = document.getElementById('searchToggle');
  const container = document.getElementById('searchContainer');
  const input = document.getElementById('searchInput');
  const closeBtn = document.getElementById('searchClose');
  const resultsDiv = document.getElementById('searchResults');

  if (!toggleBtn || !container || !input) return;

  // Open search overlay
  toggleBtn.addEventListener('click', () => {
    container.style.display = 'flex';
    requestAnimationFrame(() => {
      container.classList.add('active');
      input.focus();
    });
  });

  // Close search overlay
  function closeSearch() {
    container.classList.remove('active');
    setTimeout(() => {
      container.style.display = 'none';
      input.value = '';
      if (resultsDiv) resultsDiv.innerHTML = '';
    }, 300);
  }

  if (closeBtn) closeBtn.addEventListener('click', closeSearch);

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && container.style.display !== 'none') {
      closeSearch();
    }
  });

  // Close on backdrop click
  container.addEventListener('click', (e) => {
    if (e.target === container) closeSearch();
  });

  // Search functionality using search_index.js data
  let searchData = [];
  
  // Load search index — try relative paths for subpages
  const script = document.createElement('script');
  // Determine root path by counting directory depth
  const pathParts = window.location.pathname.split('/').filter(Boolean);
  let rootPath = '';
  // If we're in a subpage like /forums/topic/foo/index.html, go up
  if (pathParts.length > 1) {
    rootPath = '../'.repeat(pathParts.length - 1);
  }
  script.src = rootPath + 'search_index.js';
  script.onload = () => {
    if (typeof SEARCH_INDEX !== 'undefined') {
      searchData = SEARCH_INDEX;
    }
  };
  document.head.appendChild(script);

  // Search on input
  let debounceTimer;
  input.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      const query = input.value.trim().toLowerCase();
      if (!resultsDiv) return;

      if (query.length < 2) {
        resultsDiv.innerHTML = '<div class="search-hint">Type at least 2 characters to search...</div>';
        return;
      }

      // Search through all local pages and links
      const results = performSearch(query);
      displayResults(results, resultsDiv);
    }, 250);
  });
}

function performSearch(query) {
  const results = [];
  
  // Search through search index if available
  const data = (typeof SEARCH_INDEX !== 'undefined') ? SEARCH_INDEX : [];
  data.forEach(item => {
    const titleMatch = item.title && item.title.toLowerCase().includes(query);
    const contentMatch = item.content && item.content.toLowerCase().includes(query);
    if (titleMatch || contentMatch) {
      results.push({
        title: item.title || 'Untitled',
        url: item.url || '#',
        snippet: contentMatch ? getSnippet(item.content, query) : ''
      });
    }
  });

  // Also search through all local navigation links
  const allLinks = document.querySelectorAll('a[href]');
  const seen = new Set(results.map(r => r.url));
  
  allLinks.forEach(link => {
    const href = link.getAttribute('href');
    const text = link.textContent.trim();
    if (href && !href.startsWith('http') && !href.startsWith('#') && text && 
        text.toLowerCase().includes(query) && !seen.has(href)) {
      seen.add(href);
      results.push({
        title: text,
        url: href,
        snippet: ''
      });
    }
  });

  return results.slice(0, 20); // Limit to 20 results
}

function getSnippet(content, query) {
  const idx = content.toLowerCase().indexOf(query);
  if (idx === -1) return '';
  const start = Math.max(0, idx - 60);
  const end = Math.min(content.length, idx + query.length + 60);
  let snippet = content.substring(start, end).trim();
  if (start > 0) snippet = '...' + snippet;
  if (end < content.length) snippet += '...';
  return snippet;
}

function displayResults(results, container) {
  if (results.length === 0) {
    container.innerHTML = '<div class="search-no-results">No results found</div>';
    return;
  }

  let html = '';
  results.forEach(r => {
    html += `<a href="${r.url}" class="search-result-item">
      <div class="search-result-title">${escapeHtml(r.title)}</div>
      ${r.snippet ? `<div class="search-result-snippet">${escapeHtml(r.snippet)}</div>` : ''}
    </a>`;
  });
  container.innerHTML = html;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/* --- Gallery Lightbox --- */
function initGalleryLightbox() {
  // 1. Slideshow
  const slideshowContainer = document.getElementById('slideshowContainer');
  if (slideshowContainer) {
    const ssImages = slideshowContainer.querySelectorAll('img');
    ssImages.forEach(img => {
      img.style.cursor = 'pointer';
      img.style.pointerEvents = 'none'; // prevent click going to stacked hidden images
    });
    slideshowContainer.style.cursor = 'pointer';
    slideshowContainer.addEventListener('click', (e) => {
      if (e.target.closest('.slideshow-dots')) return;
      const activeImg = slideshowContainer.querySelector('img.active') || ssImages[0];
      const imgs = Array.from(ssImages).map(img => ({
        src: img.src,
        alt: img.alt || 'Slideshow image'
      }));
      const activeIndex = Array.from(ssImages).indexOf(activeImg);
      openLightbox(imgs, Math.max(0, activeIndex));
    });
  }

  // 2. Universal delegated click listener for all gallery images & image links
  const IMG_EXT_REGEX = /\.(jpe?g|png|gif|webp|avif)(\?.*)?$/i;

  document.addEventListener('click', (e) => {
    // If clicked on slideshow container, handled by slideshow listener
    if (e.target.closest('#slideshowContainer')) return;

    // Check if clicked an anchor with image href
    const link = e.target.closest('a');
    if (link) {
      const href = link.getAttribute('href') || '';
      if (IMG_EXT_REGEX.test(href)) {
        e.preventDefault();
        const container = link.closest('.page-content, .content, .entry-content, .card-body') || document.body;
        const allImageLinks = Array.from(container.querySelectorAll('a')).filter(a => IMG_EXT_REGEX.test(a.getAttribute('href') || ''));
        const imagesList = allImageLinks.map(a => {
          const imgChild = a.querySelector('img');
          return {
            src: a.href,
            alt: (imgChild && (imgChild.alt || imgChild.title)) || a.title || 'Gallery image'
          };
        });
        const clickedIndex = allImageLinks.indexOf(link);
        openLightbox(imagesList, Math.max(0, clickedIndex));
        return;
      }
    }

    // Check if clicked directly on an img (not inside an image link)
    const img = e.target.closest('.page-content img, .content img, .ngg-gallery-thumbnail img, .gallery-item img, .card-body img');
    if (img && !img.closest('a')) {
      const container = img.closest('.page-content, .content, .entry-content, .card-body') || document.body;
      const allImgs = Array.from(container.querySelectorAll('img')).filter(i => !i.closest('#slideshowContainer'));
      const imagesList = allImgs.map(i => ({
        src: i.currentSrc || i.src,
        alt: i.alt || i.title || 'Image'
      }));
      const clickedIndex = allImgs.indexOf(img);
      openLightbox(imagesList, Math.max(0, clickedIndex));
    }
  });
}

function openLightbox(images, startIndex) {
  if (!images || !images.length) return;
  let currentIndex = startIndex >= 0 && startIndex < images.length ? startIndex : 0;

  // Remove existing lightbox if any
  const existing = document.querySelector('.lightbox-overlay');
  if (existing) existing.remove();

  // Create lightbox overlay with prev/next buttons
  const overlay = document.createElement('div');
  overlay.className = 'lightbox-overlay';
  overlay.innerHTML = `
    <div class="lightbox-content">
      <button class="lightbox-close" aria-label="Close">&times;</button>
      ${images.length > 1 ? '<button class="lightbox-prev" aria-label="Previous photo">&lsaquo;</button>' : ''}
      <img src="${images[currentIndex].src}" alt="${images[currentIndex].alt || 'Gallery image'}">
      ${images.length > 1 ? '<button class="lightbox-next" aria-label="Next photo">&rsaquo;</button>' : ''}
      ${images.length > 1 ? `<div class="lightbox-counter">${currentIndex + 1} / ${images.length}</div>` : ''}
    </div>
  `;

  document.body.appendChild(overlay);
  document.body.style.overflow = 'hidden';
  requestAnimationFrame(() => overlay.classList.add('active'));

  const imgEl = overlay.querySelector('img');
  const counterEl = overlay.querySelector('.lightbox-counter');

  function showImage(index) {
    currentIndex = (index + images.length) % images.length;
    imgEl.src = images[currentIndex].src;
    imgEl.alt = images[currentIndex].alt || 'Gallery image';
    if (counterEl) counterEl.textContent = `${currentIndex + 1} / ${images.length}`;
  }

  // Close handlers
  const closeBtn = overlay.querySelector('.lightbox-close');
  closeBtn.addEventListener('click', () => closeLightbox(overlay));
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeLightbox(overlay);
  });

  // Prev/Next handlers
  const prevBtn = overlay.querySelector('.lightbox-prev');
  const nextBtn = overlay.querySelector('.lightbox-next');
  if (prevBtn) prevBtn.addEventListener('click', (e) => { e.stopPropagation(); showImage(currentIndex - 1); });
  if (nextBtn) nextBtn.addEventListener('click', (e) => { e.stopPropagation(); showImage(currentIndex + 1); });

  // Keyboard navigation
  function keyHandler(e) {
    if (e.key === 'Escape') {
      closeLightbox(overlay);
      document.removeEventListener('keydown', keyHandler);
    } else if (e.key === 'ArrowLeft' && images.length > 1) {
      showImage(currentIndex - 1);
    } else if (e.key === 'ArrowRight' && images.length > 1) {
      showImage(currentIndex + 1);
    }
  }
  document.addEventListener('keydown', keyHandler);
}

function closeLightbox(overlay) {
  overlay.classList.remove('active');
  document.body.style.overflow = '';
  setTimeout(() => overlay.remove(), 300);
}

