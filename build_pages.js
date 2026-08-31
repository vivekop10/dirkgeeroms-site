/**
 * Comprehensive build script for dirkgeeroms.be (tast 1)
 * - Creates all missing pages from tast 2 content with tast 1 design
 * - Fixes navigation links in existing subpages
 * - Ports photoalbum subpages from tast 2
 * 
 * Usage: node build_pages.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const TAST2 = path.join(ROOT, '..', 'tast 2');

// ============================================================
// TEMPLATE: Generate a page using tast 1's premium design
// ============================================================
function generatePage({ title, breadcrumbs, content, depth = 1, activePage = '' }) {
  const prefix = '../'.repeat(depth);
  
  const breadcrumbHtml = breadcrumbs.map((b, i) => {
    if (i === breadcrumbs.length - 1) return `<span>${b.label}</span>`;
    return `<a href="${b.href}">${b.label}</a>`;
  }).join(' &rsaquo; ');

  return `<!DOCTYPE html>
<html lang="en-US">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} — dirkgeeroms.be</title>
  <meta name="description" content="Dirk Geeroms — Flipping the classroom. Physics teacher resources, forums, videos, and more.">
  <meta property="og:locale" content="en_US">
  <meta property="og:type" content="website">
  <meta property="og:title" content="${title} — dirkgeeroms.be">
  <meta property="og:url" content="https://test.dirkgeeroms.be/">
  <meta property="og:site_name" content="dirkgeeroms.be">
  <link rel="stylesheet" href="${prefix}style.css">
</head>
<body>

  <!-- ========== HEADER ========== -->
  <header class="site-header">
    <div class="header-inner">
      <div class="site-brand">
        <h1 class="site-title"><a href="${prefix}index.html">dirkgeeroms.be</a></h1>
        <span class="site-tagline">Flipping the classroom</span>
      </div>

      
      <div class="header-actions">
        <!-- Search Button -->
        <button id="searchToggle" class="header-action-btn" aria-label="Search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-search"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        </button>
        <!-- Theme Toggle Button -->
        <button id="themeToggle" class="header-action-btn" aria-label="Toggle theme">
          <svg class="icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
          <svg class="icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: none;"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
        </button>
      </div>
<button class="menu-toggle" id="menuToggle" aria-label="Toggle menu" aria-expanded="false">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="3" y1="6" x2="21" y2="6"/>
          <line x1="3" y1="12" x2="21" y2="12"/>
          <line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
      </button>

      <nav class="primary-nav" id="primaryNav">
        <div class="nav-item">
          <a href="${prefix}contact/index.html">contact</a>
        </div>
        <div class="nav-item">
          <a href="${prefix}spaceheadingdeezers/index.html">Deezers</a>
          <div class="sub-menu">
            <div class="nav-item">
              <a href="${prefix}spaceheadingdeezers/asgard/index.html">Asgard</a>
              <div class="sub-menu">
                <a href="${prefix}spaceheadingdeezers/asgard/asgard-covid/index.html">2020 Asgard-COVID</a>
                <a href="${prefix}spaceheadingdeezers/asgard/asgard-x/index.html">2021 Asgard-X</a>
                <a href="${prefix}spaceheadingdeezers/asgard/asgard-xii/index.html">2023 Asgard-XII</a>
              </div>
            </div>
            <a href="${prefix}spaceheadingdeezers/astro-pi/index.html">Astro Pi</a>
            <div class="nav-item">
              <a href="${prefix}spaceheadingdeezers/cansat/index.html">CanSat</a>
              <div class="sub-menu">
                <a href="${prefix}spaceheadingdeezers/cansat/2022-2023-cansat/index.html">2022-2023 Cansat</a>
                <a href="${prefix}spaceheadingdeezers/cansat/2023-2024-cansat/index.html">2023-2024 Cansat</a>
                <a href="${prefix}spaceheadingdeezers/cansat/2025-2026-cansat/index.html">2025-2026 Cansat</a>
              </div>
            </div>
            <a href="${prefix}spaceheadingdeezers/hemera/index.html">Hemera</a>
            <a href="${prefix}spaceheadingdeezers/rmi/index.html">RMI</a>
            <a href="${prefix}spaceheadingdeezers/svalbard/index.html">Svalbard</a>
          </div>
        </div>
        <div class="nav-item">
          <a href="${prefix}photoalbum/index.html">gallery</a>
        </div>
        <div class="nav-item">
          <a href="http://archive.dirkgeeroms.be" target="_blank" rel="noopener">archive</a>
        </div>
      </nav>
    </div>
  </header>

  <!-- Search Overlay -->
  <div id="searchContainer" class="search-overlay" style="display: none;">
    <div class="search-overlay-inner">
      <div class="search-input-wrapper">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="search-input-icon"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input type="text" id="searchInput" placeholder="Search lessons, topics, forums, etc..." autocomplete="off">
        <button id="searchClose" class="search-close-btn">&times;</button>
      </div>
      <div id="searchResults" class="search-results"></div>
    </div>
  </div>

  <main class="site-main">
    <div class="content-area">
      <div class="content-grid">
        <div class="card" style="grid-column: 1 / -1;">
          <div class="card-header">
            <div class="card-title">
              <nav class="breadcrumb-nav">${breadcrumbHtml}</nav>
            </div>
          </div>
          <div class="card-body page-content">
            ${content}
          </div>
        </div>
      </div>
    </div>
  </main>

  <!-- ========== FOOTER ========== -->
  <footer class="site-footer">
    <div class="footer-inner">
      <div class="footer-copy">
        &#169; Copyleft 2026 <a href="${prefix}index.html">dirkgeeroms.be</a>
      </div>
      <div class="social-links">
        <a href="https://www.facebook.com/dirk.geeroms1" target="_blank" rel="noopener" aria-label="Facebook">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
        </a>
        <a href="https://twitter.com/dirkgeeroms" target="_blank" rel="noopener" aria-label="Twitter / X">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
        </a>
        <a href="https://www.linkedin.com/in/dirkgeeroms" target="_blank" rel="noopener" aria-label="LinkedIn">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
        </a>
      </div>
    </div>
  </footer>

  <script src="${prefix}script.js"></script>
</body>
</html>
`;
}

// ============================================================
// Extract content from tast 2 page (between <div class="content"> and </div>)
// ============================================================
function extractContent(html) {
  // Try to get content div
  const contentMatch = html.match(/<div class="content">([\s\S]*?)<\/div>\s*(?:\s*<h2>|<\/article>)/);
  if (contentMatch) return contentMatch[1].trim();
  
  // Fallback: get article content
  const articleMatch = html.match(/<article>([\s\S]*?)<\/article>/);
  if (articleMatch) return articleMatch[1].trim();
  
  return '';
}

function extractTitle(html) {
  const match = html.match(/<title>([^—<]+)/);
  return match ? match[1].trim() : 'Page';
}

function extractMeta(html) {
  const match = html.match(/<p class="meta">([^<]+)<\/p>/);
  return match ? match[1].replace(/â€"/g, '—').replace(/\?/g, '—') : '';
}

// ============================================================
// PHASE 3: Create all missing pages
// ============================================================
function createMissingPages() {
  console.log('\n=== PHASE 3: Creating missing pages ===');
  
  const pages = [
    {
      dir: 'blog',
      title: 'Blog / News',
      breadcrumbs: [
        { label: 'Home', href: '../index.html' },
        { label: 'Blog' }
      ],
      content: `
        <h2>Blog / News</h2>
        <div class="topic-list">
          <div class="topic-item">
            <a href="../velewe-wetenschapsavond/index.html">VeLeWe wetenschapsavond 2023-04-25</a>
            <div class="topic-meta">2023-05-01 — Dirk Geeroms</div>
          </div>
          <div class="topic-item">
            <a href="../12649-2/index.html">All you have to decide quote</a>
            <div class="topic-meta">2021-10-11 — Dirk Geeroms</div>
          </div>
          <div class="topic-item">
            <a href="../asgard-vi-launch/index.html">Asgard-VI launch</a>
            <div class="topic-meta">2016-05-14 — Dirk Geeroms</div>
          </div>
          <div class="topic-item">
            <a href="../religion-quote/index.html">religion quote</a>
            <div class="topic-meta">2016-01-02 — Dirk Geeroms</div>
          </div>
          <div class="topic-item">
            <a href="../haiku/index.html">haiku</a>
            <div class="topic-meta">2016-01-02 — Dirk Geeroms</div>
          </div>
          <div class="topic-item">
            <a href="../asgard-v-stabilization/index.html">Asgard-V stabilization</a>
            <div class="topic-meta">2015-09-08 — Dirk Geeroms</div>
          </div>
          <div class="topic-item">
            <a href="../copyright-quote/index.html">copyright quote</a>
            <div class="topic-meta">2014-08-25 — Dirk Geeroms</div>
          </div>
          <div class="topic-item">
            <a href="../can-learn-anything/index.html">You Can Learn Anything</a>
            <div class="topic-meta">2014-08-25 — Dirk Geeroms</div>
          </div>
        </div>
      `
    },
    {
      dir: 'velewe-wetenschapsavond',
      title: 'VeLeWe wetenschapsavond 2023-04-25',
      breadcrumbs: [
        { label: 'Home', href: '../index.html' },
        { label: 'Blog', href: '../blog/index.html' },
        { label: 'VeLeWe wetenschapsavond 2023-04-25' }
      ],
      content: `
        <h2>VeLeWe wetenschapsavond 2023-04-25</h2>
        <p class="topic-meta">2023-05-01 — Dirk Geeroms</p>
        <div class="video-container">
          <iframe loading="lazy" title="VeLeWe wetenschapsavond 2023-04-25" src="https://www.youtube.com/embed/rG1uDJDcPYs?feature=oembed" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
        </div>
      `
    },
    {
      dir: '12649-2',
      title: 'All you have to decide quote',
      breadcrumbs: [
        { label: 'Home', href: '../index.html' },
        { label: 'Blog', href: '../blog/index.html' },
        { label: 'All you have to decide quote' }
      ],
      content: `
        <h2>All you have to decide quote</h2>
        <p class="topic-meta">2021-10-11 — Dirk Geeroms</p>
        <blockquote class="quote-block">
          <p><em>All you have to decide is what to do with the time that is given to you.</em></p>
          <cite>— J.R.R. Tolkien</cite>
        </blockquote>
      `
    },
    {
      dir: 'asgard-vi-launch',
      title: 'Asgard-VI launch',
      breadcrumbs: [
        { label: 'Home', href: '../index.html' },
        { label: 'Blog', href: '../blog/index.html' },
        { label: 'Asgard-VI launch' }
      ],
      content: `
        <h2>Asgard-VI launch</h2>
        <p class="topic-meta">2016-05-14 — Dirk Geeroms</p>
        <div class="video-container">
          <iframe loading="lazy" src="https://www.youtube.com/embed/BKB6zEAhgKk?rel=0&showinfo=0" allowfullscreen></iframe>
        </div>
      `
    },
    {
      dir: 'religion-quote',
      title: 'religion quote',
      breadcrumbs: [
        { label: 'Home', href: '../index.html' },
        { label: 'Blog', href: '../blog/index.html' },
        { label: 'religion quote' }
      ],
      content: `
        <h2>religion quote</h2>
        <p class="topic-meta">2016-01-02 — Dirk Geeroms</p>
        <blockquote class="quote-block">
          <p><em>Religion is a phase a species goes through when it evolves enough intelligence to ask profound questions but not enough to answer them.</em></p>
          <cite>— Bill Flavell</cite>
        </blockquote>
      `
    },
    {
      dir: 'haiku',
      title: 'haiku',
      breadcrumbs: [
        { label: 'Home', href: '../index.html' },
        { label: 'Blog', href: '../blog/index.html' },
        { label: 'haiku' }
      ],
      content: `
        <h2>haiku</h2>
        <p class="topic-meta">2016-01-02 — Dirk Geeroms</p>
        <blockquote class="quote-block">
          <p><em>Lying in the sun<br>how a fusion reactor<br>energy supplies.</em></p>
        </blockquote>
      `
    },
    {
      dir: 'asgard-v-stabilization',
      title: 'Asgard-V stabilization',
      breadcrumbs: [
        { label: 'Home', href: '../index.html' },
        { label: 'Blog', href: '../blog/index.html' },
        { label: 'Asgard-V stabilization' }
      ],
      content: `
        <h2>Asgard-V stabilization</h2>
        <p class="topic-meta">2015-09-08 — Dirk Geeroms</p>
        <div class="video-container">
          <iframe loading="lazy" src="https://www.youtube.com/embed/p3Zv8SXF27g?rel=0&showinfo=0" allowfullscreen></iframe>
        </div>
      `
    },
    {
      dir: 'copyright-quote',
      title: 'copyright quote',
      breadcrumbs: [
        { label: 'Home', href: '../index.html' },
        { label: 'Blog', href: '../blog/index.html' },
        { label: 'copyright quote' }
      ],
      content: `
        <h2>copyright quote</h2>
        <p class="topic-meta">2014-08-25 — Dirk Geeroms</p>
        <blockquote class="quote-block">
          <p><em>Only one thing is impossible for God: To find any sense in any copyright law on the planet.</em></p>
          <cite>— <a href="http://www.brainyquote.com/quotes/quotes/m/marktwain163473.html" target="_blank" rel="noopener">Mark Twain</a></cite>
        </blockquote>
      `
    },
    {
      dir: 'can-learn-anything',
      title: 'You Can Learn Anything',
      breadcrumbs: [
        { label: 'Home', href: '../index.html' },
        { label: 'Blog', href: '../blog/index.html' },
        { label: 'You Can Learn Anything' }
      ],
      content: `
        <h2>You Can Learn Anything</h2>
        <p class="topic-meta">2014-08-25 — Dirk Geeroms</p>
        <div class="video-container">
          <iframe loading="lazy" src="https://www.youtube.com/embed/JC82Il2cjqA" allowfullscreen></iframe>
        </div>
      `
    },
    {
      dir: 'zoeken',
      title: 'Search',
      breadcrumbs: [
        { label: 'Home', href: '../index.html' },
        { label: 'Search' }
      ],
      content: `
        <h2>Search</h2>
        <p>Use the search overlay (click the magnifying glass icon in the header) to search across all pages.</p>
        <div id="pageSearchContainer">
          <input type="text" id="pageSearchInput" placeholder="Search lessons, topics, forums, etc..." style="width:100%;padding:12px 16px;font-size:1rem;border:1px solid var(--border);border-radius:8px;background:var(--surface);color:var(--text);" autocomplete="off">
          <div id="pageSearchResults" style="margin-top:1rem;"></div>
        </div>
      `
    },
    {
      dir: 'forgot-password',
      title: 'Forgot Password',
      breadcrumbs: [
        { label: 'Home', href: '../index.html' },
        { label: 'Forgot Password' }
      ],
      content: `
        <h2>Forgot Password</h2>
        <p>Enter your email address to receive a password reset link.</p>
        <form class="login-form" style="max-width:400px;">
          <label for="reset-email">Email Address</label>
          <input type="email" id="reset-email" name="email" required style="width:100%;padding:10px 14px;margin:8px 0 16px;border:1px solid var(--border);border-radius:8px;background:var(--surface);color:var(--text);">
          <button type="submit" class="btn-login">Reset Password</button>
        </form>
      `
    },
    {
      dir: 'login',
      title: 'Login',
      breadcrumbs: [
        { label: 'Home', href: '../index.html' },
        { label: 'Login' }
      ],
      content: `
        <h2>Login</h2>
        <form class="login-form" style="max-width:400px;">
          <label for="page-login-user">Username or Email</label>
          <input type="text" id="page-login-user" name="log" required style="width:100%;padding:10px 14px;margin:8px 0 16px;border:1px solid var(--border);border-radius:8px;background:var(--surface);color:var(--text);">
          <label for="page-login-pass">Password</label>
          <input type="password" id="page-login-pass" name="pwd" required style="width:100%;padding:10px 14px;margin:8px 0 16px;border:1px solid var(--border);border-radius:8px;background:var(--surface);color:var(--text);">
          <button type="submit" class="btn-login">Log In</button>
          <div style="margin-top:12px;"><a href="../forgot-password/index.html">Forgot your password?</a> | <a href="../register/index.html">Register</a></div>
        </form>
      `
    },
    {
      dir: 'wp-members-user-profile',
      title: 'User Profile',
      breadcrumbs: [
        { label: 'Home', href: '../index.html' },
        { label: 'User Profile' }
      ],
      content: `
        <h2>User Profile</h2>
        <p>You must be logged in to view your profile. Please <a href="../login/index.html">log in</a> or <a href="../register/index.html">register</a>.</p>
      `
    }
  ];

  for (const page of pages) {
    const dir = path.join(ROOT, page.dir);
    fs.mkdirSync(dir, { recursive: true });
    const html = generatePage({
      title: page.title,
      breadcrumbs: page.breadcrumbs,
      content: page.content,
      depth: 1
    });
    fs.writeFileSync(path.join(dir, 'index.html'), html, 'utf8');
    console.log(`  Created: ${page.dir}/index.html`);
  }
}

// ============================================================
// PHASE 2: Fix navigation links in existing subpages
// ============================================================
function fixExistingPages() {
  console.log('\n=== PHASE 2: Fixing navigation links in existing subpages ===');
  
  // Find all index.html files (except root)
  function findHtmlFiles(dir, relBase = '') {
    const results = [];
    try {
      const entries = fs.readdirSync(dir);
      for (const entry of entries) {
        if (entry === '.git' || entry === 'node_modules' || entry === 'raw_cache' || entry === 'old web') continue;
        const full = path.join(dir, entry);
        const rel = relBase ? `${relBase}/${entry}` : entry;
        const stat = fs.statSync(full);
        if (stat.isDirectory()) {
          results.push(...findHtmlFiles(full, rel));
        } else if (entry === 'index.html' && relBase) {
          results.push({ full, rel });
        }
      }
    } catch (e) {}
    return results;
  }

  const htmlFiles = findHtmlFiles(ROOT);
  let fixedCount = 0;

  for (const file of htmlFiles) {
    let html = fs.readFileSync(file.full, 'utf8');
    
    // Calculate depth
    const depth = file.rel.split('/').length - 1; // subtract 1 for 'index.html'
    const prefix = '../'.repeat(depth);

    // Skip if this is a newly created page (already has correct paths)
    if (html.includes('breadcrumb-nav')) continue;
    
    // Fix stylesheet reference
    const origHtml = html;
    
    // Fix CSS path - currently uses ../style.css which is only correct for depth 1
    // We need to replace with the correct depth prefix
    html = html.replace(/href="(\.\.\/)*style\.css"/g, `href="${prefix}style.css"`);
    
    // Fix script path
    html = html.replace(/src="(\.\.\/)*script\.js"/g, `src="${prefix}script.js"`);
    html = html.replace(/src="(\.\.\/)*search_index\.js"/g, `src="${prefix}search_index.js"`);
    
    // Fix brand link (should go to root)
    html = html.replace(/<a href="index\.html">dirkgeeroms\.be<\/a>/g, `<a href="${prefix}index.html">dirkgeeroms.be</a>`);
    
    // Fix nav links that are relative without proper prefix
    // These are links like href="contact/index.html" that should be href="../contact/index.html"
    // Only fix links that don't start with ../ or http or # or /
    const navLinks = [
      'contact/index.html',
      'spaceheadingdeezers/index.html',
      'spaceheadingdeezers/asgard/index.html',
      'spaceheadingdeezers/asgard/asgard-covid/index.html',
      'spaceheadingdeezers/asgard/asgard-x/index.html',
      'spaceheadingdeezers/asgard/asgard-xii/index.html',
      'spaceheadingdeezers/astro-pi/index.html',
      'spaceheadingdeezers/cansat/index.html',
      'spaceheadingdeezers/cansat/2022-2023-cansat/index.html',
      'spaceheadingdeezers/cansat/2023-2024-cansat/index.html',
      'spaceheadingdeezers/cansat/2025-2026-cansat/index.html',
      'spaceheadingdeezers/hemera/index.html',
      'spaceheadingdeezers/rmi/index.html',
      'spaceheadingdeezers/svalbard/index.html',
      'photoalbum/index.html',
      'register/index.html',
      'forgot-password/index.html',
      'simulations/index.html',
      'links/index.html',
      'filebrowser/index.html',
    ];

    for (const link of navLinks) {
      // Replace href="link" with href="prefix+link" but only when it's not already prefixed
      const regex = new RegExp(`href="${link.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`, 'g');
      html = html.replace(regex, `href="${prefix}${link}"`);
    }

    // Fix sidebar academy links
    const sidebarLinks = [
      'academy/fysica-vijfdes/index.html',
      'academy/fysica-vijfdes/elektrostatica/index.html',
      'academy/fysica-vijfdes/elektrodynamica/index.html',
      'academy/fysica-vijfdes/vastestoffysica/index.html',
      'academy/fysica-vijfdes/elektromagnetisme/index.html',
      'academy/labo-fysica-vijfdes/index.html',
      'academy/fysica-zesdes/index.html',
      'academy/fysica-zesdes/kinematica/index.html',
      'academy/fysica-zesdes/dynamica/index.html',
      'academy/fysica-zesdes/arbeid-energie/index.html',
      'academy/fysica-zesdes/trillingen-golven/index.html',
      'academy/labo-fysica-zesdes/index.html',
      'lesmateriaal/fysica/index.html',
      'lesmateriaal/fysica/fysica-vierdes/index.html',
      'lesmateriaal/fysica/fysica-vierdes/metrologie/index.html',
      'lesmateriaal/fysica/fysica-vierdes/energie/index.html',
      'lesmateriaal/fysica/fysica-vierdes/druk/index.html',
      'lesmateriaal/fysica/fysica-vierdes/gaswetten/index.html',
      'lesmateriaal/fysica/fysica-vierdes/warmte/index.html',
      'lesmateriaal/fysica/fysica-vierdes/faseovergangen/index.html',
      'lesmateriaal/fysica/fysica-vijfdes/index.html',
      'lesmateriaal/fysica/fysica-vijfdes/elektrostatica/index.html',
      'lesmateriaal/fysica/fysica-vijfdes/elektrodynamica/index.html',
      'lesmateriaal/fysica/fysica-vijfdes/elektromagnetisme/index.html',
      'lesmateriaal/fysica/fysica-vijfdes/vastestoffysica/index.html',
      'lesmateriaal/fysica/fysica-vijfdes/kernfysica/index.html',
      'lesmateriaal/fysica/fysica-zesdes/index.html',
      'lesmateriaal/fysica/fysica-zesdes/kinematica/index.html',
      'lesmateriaal/fysica/fysica-zesdes/dynamica/index.html',
      'lesmateriaal/fysica/fysica-zesdes/arbeid-energie/index.html',
      'lesmateriaal/fysica/fysica-zesdes/trillingen-golven/index.html',
      'lesmateriaal/labo-fysica/index.html',
      'lesmateriaal/wiskunde/index.html',
      'lesmateriaal/wiskunde/wiskunde-vijfdes/index.html',
      'lesmateriaal/wiskunde/wiskunde-zesdes/index.html',
      'lesmateriaal/stem/index.html',
      'lesmateriaal/stem/stem-physics/index.html',
      'lesmateriaal/stem/stem-technology/index.html',
      'lesmateriaal/stem/stem-engineering/index.html',
      'lesmateriaal/stem/stem-mathematics/index.html',
      'forums/forum/fysica/index.html',
      'forums/forum/fysica/fysica-vijfdes/index.html',
      'forums/forum/fysica/fysica-vijfdes/elektrostatica/index.html',
      'forums/forum/fysica/fysica-vijfdes/elektrodynamica/index.html',
      'forums/forum/fysica/fysica-vijfdes/elektromagnetisme/index.html',
      'forums/forum/fysica/fysica-vijfdes/vaste-stoffysica/index.html',
      'forums/forum/fysica/fysica-vijfdes/kernfysica/index.html',
      'forums/forum/fysica/fysica-zesdes/index.html',
      'forums/forum/fysica/fysica-zesdes/kinematica/index.html',
      'forums/forum/fysica/fysica-zesdes/dynamica/index.html',
      'forums/forum/fysica/fysica-zesdes/arbeid-energie/index.html',
      'forums/forum/fysica/fysica-zesdes/trillingen-golven/index.html',
      'forums/forum/labo-fysica/index.html',
      'forums/forum/labo-fysica/labo-fysica-vijfdes/index.html',
      'forums/forum/labo-fysica/labo-fysica-zesdes/index.html',
      'forums/forum/seminarie-wiskunde/index.html',
      'forums/forum/seminarie-wiskunde/seminarie-wiskunde-vijfdes/index.html',
      'forums/forum/seminarie-wiskunde/seminarie-wiskunde-zesdes/index.html',
      'forums/forum/stem-seminar/index.html',
      'forums/forum/stem-seminar/stem-physics/index.html',
      'forums/forum/stem-seminar/stem-technology/index.html',
      'forums/forum/stem-seminar/stem-engineering/index.html',
      'forums/forum/stem-seminar/stem-mathematics/index.html',
      'forums/forum/vfo/index.html',
      'forums/forum/vfo/hydrostatica-warmteleer/index.html',
      'forums/forum/vfo/kernfysica/index.html',
      'forums/forum/vfo/elektrostatica/index.html',
      'forums/forum/vfo/elektrodynamica/index.html',
      'forums/forum/vfo/elektromagnetisme/index.html',
      'forums/forum/vfo/kinematica/index.html',
      'forums/forum/vfo/dynamica/index.html',
      'forums/forum/vfo/arbeid-energie/index.html',
      'forums/forum/vfo/trillingen-golven/index.html',
      'forums/topic/vraag-6-16de-vfo/index.html',
      'forums/topic/oef-56-p-239/index.html',
      'forums/topic/oef-54-p-239/index.html',
      'forums/topic/oef-52-p-239/index.html',
      'forums/topic/vraag-21-p-151/index.html',
    ];

    for (const link of sidebarLinks) {
      const regex = new RegExp(`href="${link.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`, 'g');
      html = html.replace(regex, `href="${prefix}${link}"`);
    }

    // Fix reply links with hash
    html = html.replace(/href="forums\/topic\/([^"]*?)#([^"]*?)\/index\.html"/g, `href="${prefix}forums/topic/$1/index.html#$2"`);

    // Fix footer link
    html = html.replace(/href="index\.html">dirkgeeroms\.be<\/a>/g, `href="${prefix}index.html">dirkgeeroms.be</a>`);

    // Fix duplicate prefixes (avoid ../../../../../../... issues)
    // Clean up cases where prefix was already there
    html = html.replace(/(\.\.\/){10,}/g, prefix);

    if (html !== origHtml) {
      fs.writeFileSync(file.full, html, 'utf8');
      fixedCount++;
      console.log(`  Fixed: ${file.rel}`);
    }
  }
  
  console.log(`  Total fixed: ${fixedCount} files`);
}

// ============================================================
// PHASE 4: Port photoalbum subpages from tast 2
// ============================================================
function portPhotoAlbumPages() {
  console.log('\n=== PHASE 4: Porting photoalbum subpages ===');
  
  if (!fs.existsSync(TAST2)) {
    console.log('  ERROR: tast 2 directory not found at', TAST2);
    return;
  }

  const t2PhotoAlbum = path.join(TAST2, 'photoalbum');
  if (!fs.existsSync(t2PhotoAlbum)) {
    console.log('  ERROR: tast 2 photoalbum directory not found');
    return;
  }

  // Find all photoalbum index.html files in tast 2
  function findGalleryPages(dir, relBase = '') {
    const results = [];
    try {
      const entries = fs.readdirSync(dir);
      for (const entry of entries) {
        const full = path.join(dir, entry);
        const rel = relBase ? `${relBase}/${entry}` : entry;
        const stat = fs.statSync(full);
        if (stat.isDirectory()) {
          results.push(...findGalleryPages(full, rel));
        } else if (entry === 'index.html') {
          results.push({ full, rel });
        }
      }
    } catch (e) {}
    return results;
  }

  const galleryPages = findGalleryPages(t2PhotoAlbum);
  console.log(`  Found ${galleryPages.length} gallery pages in tast 2`);

  for (const gp of galleryPages) {
    const relDir = path.dirname(gp.rel);
    if (relDir === '.') continue; // Skip main photoalbum/index.html (already exists)

    const depth = relDir.split(/[/\\]/).length + 1; // +1 for photoalbum itself
    const prefix = '../'.repeat(depth);

    let t2Html = fs.readFileSync(gp.full, 'utf8');
    
    // Extract the main content from tast 2 page
    let mainContent = '';
    
    // Get the <main> content
    const mainMatch = t2Html.match(/<main[^>]*>([\s\S]*?)<\/main>/);
    if (mainMatch) {
      mainContent = mainMatch[1];
    }
    
    // Extract title
    const titleMatch = t2Html.match(/<title>([^<]+)<\/title>/);
    const title = titleMatch ? titleMatch[1].split('—')[0].split('–')[0].trim() : relDir;

    // Convert external URLs to local paths
    mainContent = mainContent.replace(
      /https:\/\/test\.dirkgeeroms\.be\/(wp-content\/gallery\/[^"'?\s]+)(\?[^"'\s]*)*/g,
      (match, relPath) => prefix + relPath
    );
    
    // Replace dummy SVG placeholder src with data-src or data-thumbnail
    mainContent = mainContent.replace(
      /src="data:image\/svg\+xml,[^"]*"\s+data-src="([^"]+)"/g,
      'src="$1"'
    );
    mainContent = mainContent.replace(
      /src="data:image\/svg\+xml,[^"]*"\s+data-thumbnail="([^"]+)"/g,
      'src="$1"'
    );

    // Remove obsolete NextGEN slideshow links to test.dirkgeeroms.be
    mainContent = mainContent.replace(/<div class="slideshowlink">[\s\S]*?<\/div>/gi, '');

    // Fix internal navigation links from tast 2 (e.g. href="../../../photoalbum/...")
    mainContent = mainContent.replace(/href="\.\.\/(\.\.\/)+photoalbum\//g, `href="${prefix}photoalbum/`);
    mainContent = mainContent.replace(/href="\.\.\/(\.\.\/)+index\.html"/g, `href="${prefix}index.html"`);
    
    // Build breadcrumbs
    const parts = relDir.split(/[/\\]/);
    const breadcrumbs = [{ label: 'Home', href: prefix + 'index.html' }];
    breadcrumbs.push({ label: 'gallery', href: prefix + 'photoalbum/index.html' });
    
    let pathAccum = prefix + 'photoalbum';
    for (let i = 0; i < parts.length; i++) {
      pathAccum += '/' + parts[i];
      if (i === parts.length - 1) {
        breadcrumbs.push({ label: parts[i] });
      } else {
        breadcrumbs.push({ label: parts[i], href: pathAccum + '/index.html' });
      }
    }

    const html = generatePage({
      title,
      breadcrumbs,
      content: mainContent,
      depth
    });

    const destDir = path.join(ROOT, 'photoalbum', relDir);
    fs.mkdirSync(destDir, { recursive: true });
    fs.writeFileSync(path.join(destDir, 'index.html'), html, 'utf8');
  }
  
  console.log(`  Ported ${galleryPages.length} gallery pages`);

  // Also update main photoalbum/index.html to link to year pages
  updateMainGalleryPage();
}

function updateMainGalleryPage() {
  console.log('  Updating main photoalbum/index.html with year links...');
  
  // Read tast 2's main photoalbum page to get the structure
  const t2Main = path.join(TAST2, 'photoalbum', 'index.html');
  if (!fs.existsSync(t2Main)) return;
  
  const t2Html = fs.readFileSync(t2Main, 'utf8');
  
  // Extract album links from tast 2
  const albumLinks = [];
  const linkRegex = /href="([^"]+\/index\.html)"[^>]*>([^<]+)/g;
  let match;
  while ((match = linkRegex.exec(t2Html)) !== null) {
    const href = match[1];
    const text = match[2].trim();
    if (href.includes('photoalbum') || href.startsWith('./') || (!href.startsWith('http') && !href.startsWith('../'))) {
      // Clean up the href for tast 1
      let cleanHref = href.replace(/^\.\//, '').replace(/^\.\.\/photoalbum\//, '');
      if (!cleanHref.startsWith('..')) {
        albumLinks.push({ href: cleanHref, text });
      }
    }
  }
  
  // The tast 1 photoalbum already has a big index, so we don't need to rewrite it completely
  // But let's make sure the year links work
}

// ============================================================
// MAIN
// ============================================================
function main() {
  console.log('=== Building dirkgeeroms.be (tast 1) ===\n');
  
  createMissingPages();
  fixExistingPages();
  portPhotoAlbumPages();
  
  console.log('\n=== Build complete! ===');
}

main();
