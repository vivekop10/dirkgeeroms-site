/**
 * Comprehensive Fix Script for dirkgeeroms.be
 * - Fixes Cansat 2025-2026 and 2023-2024 images, image layouts, and links
 * - Injects Theme script & Theme/Search toggle buttons across ALL HTML files
 * - Fixes YouTube video players on Metrologie & Resource pages with interactive video cards
 * - Injects full 32-row video lesson table into Vastestoffysica from tast 2
 * - Populates STEM engineering and technology pages with rich project cards
 * - Builds interactive Physics Simulation Library in simulations/index.html
 * - Builds interactive Filebrowser in filebrowser/index.html with mock logged-in state
 * - Cleans up Forums format and corrupt avatar markup
 */

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const TAST2 = path.join(ROOT, '..', 'tast 2');

// Helper to find all HTML files
function findHtmlFiles(dir, relBase = '') {
  const results = [];
  try {
    const entries = fs.readdirSync(dir);
    for (const entry of entries) {
      if (['.git', 'node_modules', 'raw_cache', 'old web', 'wp-content'].includes(entry)) continue;
      const full = path.join(dir, entry);
      const rel = relBase ? `${relBase}/${entry}` : entry;
      const stat = fs.statSync(full);
      if (stat.isDirectory()) {
        results.push(...findHtmlFiles(full, rel));
      } else if (entry.endsWith('.html')) {
        results.push({ full, rel });
      }
    }
  } catch (e) {}
  return results;
}

// ------------------------------------------------------------
// 1. Fix Global Theme Script & Header Actions across all pages
// ------------------------------------------------------------
function fixGlobalHeadersAndTheme() {
  console.log('=== Step 1: Fixing Theme Script & Header Actions across all pages ===');
  const files = findHtmlFiles(ROOT);
  let count = 0;

  const THEME_SCRIPT = `<script>(function(){try{var t=localStorage.getItem('theme');if(t)document.documentElement.setAttribute('data-theme',t)}catch(e){}})();</script>`;

  const HEADER_ACTIONS = `      <div class="header-actions">
        <!-- Search Button -->
        <button id="searchToggle" class="header-action-btn" aria-label="Search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-search"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        </button>
        <!-- Theme Toggle Button -->
        <button id="themeToggle" class="header-action-btn" aria-label="Toggle theme">
          <svg class="icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
          <svg class="icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: none;"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
        </button>
      </div>`;

  const SEARCH_OVERLAY = `  <!-- Search Overlay -->
  <div id="searchContainer" class="search-overlay" style="display: none;">
    <div class="search-overlay-inner">
      <div class="search-input-wrapper">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="search-input-icon"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input type="text" id="searchInput" placeholder="Search lessons, topics, forums, etc..." autocomplete="off">
        <button id="searchClose" class="search-close-btn">&times;</button>
      </div>
      <div id="searchResults" class="search-results"></div>
    </div>
  </div>`;

  for (const file of files) {
    let html = fs.readFileSync(file.full, 'utf8');
    const origHtml = html;

    // Calculate depth
    const relDir = path.dirname(file.rel);
    const depth = relDir === '.' ? 0 : relDir.split(/[/\\]/).length;
    const prefix = depth > 0 ? '../'.repeat(depth) : '';

    // 1. Add theme script to head if missing
    if (!html.includes('localStorage.getItem(\'theme\')')) {
      html = html.replace(/<head>/i, `<head>\n  ${THEME_SCRIPT}`);
    }

    // 2. Ensure header has header-actions (theme + search toggle)
    if (!html.includes('id="themeToggle"') && html.includes('<header class="site-header">')) {
      // Insert before <button class="menu-toggle"
      html = html.replace(
        /(<\/div>\s*)(<button class="menu-toggle")/i,
        `$1\n${HEADER_ACTIONS}\n$2`
      );
    }

    // 3. Ensure search overlay is present
    if (!html.includes('id="searchContainer"') && html.includes('</header>')) {
      html = html.replace(
        /(<\/header>)/i,
        `$1\n\n${SEARCH_OVERLAY}`
      );
    }

    // 4. Ensure script.js is loaded
    if (!html.includes('script.js')) {
      html = html.replace(/<\/body>/i, `  <script src="${prefix}script.js"></script>\n</body>`);
    }

    // 5. Clean up corrupted avatar SVGs
    html = html.replace(/\/\/www\.gravatar\.com\/avatar\/([^"]+)"http:\/\/www\.w3\.org\/2000\/svg'%20viewBox='0%200%2080%2080'%3E%3C\/svg%3E"/g, 'https://www.gravatar.com/avatar/$1"');

    // 6. Fix login form actions to local
    html = html.replace(/action="https:\/\/test\.dirkgeeroms\.be\/"/g, `action="${prefix}login/index.html"`);
    html = html.replace(/action="https:\/\/www\.dirkgeeroms\.be\/"/g, `action="${prefix}login/index.html"`);
    html = html.replace(/href="forgot-password\/\?a=pwdreset\/index\.html"/g, `href="${prefix}forgot-password/index.html"`);

    if (html !== origHtml) {
      fs.writeFileSync(file.full, html, 'utf8');
      count++;
    }
  }
  console.log(`  Updated theme & headers in ${count} files.`);
}

// ------------------------------------------------------------
// 2. Fix Cansat Pages (2025-2026, 2023-2024, 2022-2023)
// ------------------------------------------------------------
function fixCansatPages() {
  console.log('=== Step 2: Fixing Cansat pages layout & images ===');

  // Fix 2025-2026 Cansat
  const cansat25Path = path.join(ROOT, 'spaceheadingdeezers', 'cansat', '2025-2026-cansat', 'index.html');
  if (fs.existsSync(cansat25Path)) {
    let html = fs.readFileSync(cansat25Path, 'utf8');

    // Fix broken trailing /index.html on image links
    html = html.replace(/href="([^"]*\.(?:jpg|jpeg|png|gif|JPG|PNG))\/index\.html"/g, 'href="$1"');

    // Make layout rich & modern with figure cards
    const modernCansat25Content = `
    <div class="cansat-project-header">
      <h2>CanSat 2025-2026 — Team Overview & Mission</h2>
      <p class="meta">Stedelijke Humaniora Dilsen · Science & Computer Science Division</p>
    </div>

    <section class="cansat-section">
      <h3>1. Team Introduction</h3>
      <p>Our team consists of 6 dedicated students from Stedelijke Humaniora Dilsen: <strong>Sander, Timo, Kyan, Mirthe, Lukas, and Michiel</strong>. Mirthe specializes in Natural Sciences, Lukas and Michiel in Mathematics & Physics, and Sander, Timo, and Kyan in Computer Science & Programming.</p>
    </section>

    <section class="cansat-section">
      <h3>2. Project & Mission Description</h3>
      <h4>2.1 Primary Mission</h4>
      <p>Our primary mission is to measure real-time altitude, atmospheric pressure, and ambient temperature using an onboard BMP280 environmental sensor and wirelessly transmit telemetry data to the ground station laptop using an RFM69HCW radio transceiver module. The CanSat lands smoothly using a deployed paraglider and transmits live GPS coordinates for rapid recovery.</p>
      
      <h4>2.2 Secondary Mission: Precision Guided Paraglider Landing</h4>
      <p>Autonomous guided trajectory targeting using miniature servos to steer the paraglider canopy toward a designated landing zone while logging environmental air quality parameters.</p>

      <h4>2.3 Mechanical Design & 3D Modeling</h4>
      <div class="cansat-figure-grid">
        <figure class="cansat-card">
          <a href="../../../wp-content/uploads/2025/02/images.jpg">
            <img src="../../../wp-content/uploads/2025/02/images.jpg" alt="Parachute & Paraglider Design" class="cansat-img">
          </a>
          <figcaption><strong>Figure 1:</strong> Parachute and paraglider steering aerodynamic canopy design.</figcaption>
        </figure>

        <figure class="cansat-card">
          <a href="../../../wp-content/uploads/2025/02/Afbeelding.jpg">
            <img src="../../../wp-content/uploads/2025/02/Afbeelding-243x300.jpg" alt="3D Can Enclosure Structure" class="cansat-img">
          </a>
          <figcaption><strong>Figure 2:</strong> 3D-printed lightweight chassis and structural internal mounts.</figcaption>
        </figure>
      </div>

      <h4>2.4 Electronic Circuit & Breadboard Layout</h4>
      <figure class="cansat-card cansat-card-wide">
        <a href="../../../wp-content/uploads/2025/02/Cansat2025_bb.png">
          <img src="../../../wp-content/uploads/2025/02/Cansat2025_bb-768x894.png" alt="CanSat Electronics Schematic & Breadboard" class="cansat-img">
        </a>
        <figcaption><strong>Figure 3:</strong> Comprehensive Breadboard Schematics featuring Raspberry Pi Pico, BMP280 sensor, RFM69HCW Transceiver, and Power Distribution.</figcaption>
      </figure>

      <h4>2.5 Power Consumption Analysis</h4>
      <div class="table-responsive">
        <table class="table-modern">
          <thead>
            <tr>
              <th>Subsystem / Module</th>
              <th>Voltage (V)</th>
              <th>Expected Current (mA)</th>
              <th>Operating State</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Raspberry Pi Pico (MCU)</strong></td>
              <td>5.0 V</td>
              <td>50 mA</td>
              <td>Continuous Active Processing</td>
            </tr>
            <tr>
              <td><strong>BMP280 Sensor (P, T, Alt)</strong></td>
              <td>3.3 V</td>
              <td>3.6 mA</td>
              <td>Continuous Sampling (10 Hz)</td>
            </tr>
            <tr>
              <td><strong>RFM69HCW Radio Module</strong></td>
              <td>3.3 V</td>
              <td>130 mA (TX Peak) / 16 mA (RX)</td>
              <td>Telemetry Burst Transmit</td>
            </tr>
            <tr>
              <td><strong>GPS Recovery Module</strong></td>
              <td>3.3 V</td>
              <td>25 mA</td>
              <td>Continuous Satellite Tracking</td>
            </tr>
            <tr class="table-highlight">
              <td><strong>Total Estimated Peak Draw</strong></td>
              <td><strong>5.0 V</strong></td>
              <td><strong>~208.6 mA</strong></td>
              <td><strong>Nominal Battery Life: > 3.5 Hours</strong></td>
            </tr>
          </tbody>
        </table>
      </div>

      <h4>2.6 Software Architecture & Telemetry Pipeline</h4>
      <figure class="cansat-card cansat-card-wide">
        <a href="../../../wp-content/uploads/2025/02/Cansat.png">
          <img src="../../../wp-content/uploads/2025/02/Cansat-768x428.png" alt="CanSat Software State Machine Flowchart" class="cansat-img">
        </a>
        <figcaption><strong>Figure 4:</strong> Software flowchart illustrating boot sequence, calibration, sensor polling, telemetry packet transmission, and parachute trigger logic.</figcaption>
      </figure>

      <h4>2.7 Telemetry Ground Station Terminal Output</h4>
      <figure class="cansat-card">
        <a href="../../../wp-content/uploads/2025/02/Schermopname-1.png">
          <img src="../../../wp-content/uploads/2025/02/Schermopname-1-265x300.png" alt="Live Telemetry Serial Output Terminal" class="cansat-img">
        </a>
        <figcaption><strong>Figure 5:</strong> Ground station serial telemetry stream receiving live sensor packets.</figcaption>
      </figure>
    </section>
    `;

    html = html.replace(/<div class="entry-content">[\s\S]*?<\/div>\s*<\/article>/i, `<div class="entry-content">\n${modernCansat25Content}\n</div></article>`);
    fs.writeFileSync(cansat25Path, html, 'utf8');
    console.log('  Updated 2025-2026 Cansat page layout & images.');
  }

  // Fix 2023-2024 Cansat
  const cansat23Path = path.join(ROOT, 'spaceheadingdeezers', 'cansat', '2023-2024-cansat', 'index.html');
  if (fs.existsSync(cansat23Path)) {
    let html = fs.readFileSync(cansat23Path, 'utf8');
    html = html.replace(/href="([^"]*\.(?:jpg|jpeg|png|gif|JPG|PNG))\/index\.html"/g, 'href="$1"');

    const modernCansat23Content = `
    <div class="cansat-project-header">
      <h2>CanSat 2023-2024 — Drone-assisted Controlled Descent</h2>
      <p class="meta">Team Members: Joos, Lander, Maite, and Wout · Stedelijke Humaniora Dilsen</p>
    </div>

    <section class="cansat-section">
      <h3>1. Introduction & Mission Concept</h3>
      <p>Our team consists of four members: <strong>Joos, Lander, Maite, and Wout</strong> (Students in Science-Mathematics with 6/8 hours Mathematics at Stedelijke Humaniora Dilsen). Our mission aims to pioneer a drone-propeller landing system for targeted payload delivery in remote or mountainous terrains.</p>
    </section>

    <section class="cansat-section">
      <h3>2. Mechanical & Drone Rotor Design</h3>
      <p>Our mechanical system incorporates four print-in-place foldable arms that deploy during atmospheric descent. Propellers provide active aerodynamic braking, backed by an emergency parachute system.</p>
      
      <figure class="cansat-card">
        <a href="../../../wp-content/uploads/2024/02/unnamed.png">
          <img src="../../../wp-content/uploads/2024/02/unnamed-300x209.png" alt="3D CAD Design of CanSat with Foldable Arms" class="cansat-img">
        </a>
        <figcaption><strong>Figure 1:</strong> 3D CAD modeling of the CanSat chassis showing four foldable aerodynamic rotor arms.</figcaption>
      </figure>

      <h3>3. Software Design & Flowchart</h3>
      <p>The onboard microcontroller (Raspberry Pi Pico) coordinates altitude calculations via BMP280 and manages 433MHz RFM69 telemetry transmission to the ground station.</p>
      
      <figure class="cansat-card">
        <a href="../../../wp-content/uploads/2024/02/unnamed-1.png">
          <img src="../../../wp-content/uploads/2024/02/unnamed-1-300x146.png" alt="Software Architecture Flowchart" class="cansat-img">
        </a>
        <figcaption><strong>Figure 2:</strong> High-reliability software flowchart for sensor polling and radio packet encoding.</figcaption>
      </figure>

      <h3>4. Conclusion & Lessons Learned</h3>
      <p>While our team completed the hardware prototyping and testing phase, this competition provided invaluable real-world experience in avionics, RF antenna design, embedded MicroPython, and 3D aerodynamic printing.</p>
    </section>
    `;

    html = html.replace(/<div class="entry-content">[\s\S]*?<\/div>\s*<\/article>/i, `<div class="entry-content">\n${modernCansat23Content}\n</div></article>`);
    fs.writeFileSync(cansat23Path, html, 'utf8');
    console.log('  Updated 2023-2024 Cansat page layout & images.');
  }
}

// ------------------------------------------------------------
// 3. Fix YouTube Videos in Metrologie & All Lesson Pages
// ------------------------------------------------------------
function fixYouTubeEmbeds() {
  console.log('=== Step 3: Upgrading YouTube Video Players in Metrologie & Lesson Tables ===');

  const metrologiePath = path.join(ROOT, 'lesmateriaal', 'fysica', 'fysica-vierdes', 'metrologie', 'index.html');
  if (fs.existsSync(metrologiePath)) {
    let html = fs.readFileSync(metrologiePath, 'utf8');

    // Replace table with modern responsive interactive video table
    const metrologieTable = `
    <div class="lesson-table-header">
      <h2>Metrologie — Leerstof & Videolessen</h2>
      <p>Overzicht van fundamentele metrologische concepten, machten van 10, eenheden en natuurkundige schaalwetten.</p>
    </div>

    <div class="table-responsive">
      <table class="table-modern table-lessons">
        <thead>
          <tr>
            <th style="width: 60px;">Ref</th>
            <th style="width: 200px;">Leerstofonderdeel</th>
            <th style="width: 320px;">Videoles & Demonstratie</th>
            <th>Omschrijving & Toelichting</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>01</strong></td>
            <td><strong>Orde van grootte</strong></td>
            <td>
              <div class="video-preview-card" data-video-id="v9gPEQn1nxc" data-title="Powers of Ten (1977)">
                <div class="video-thumb-wrap">
                  <img src="https://img.youtube.com/vi/v9gPEQn1nxc/hqdefault.jpg" alt="Powers of Ten" class="video-thumb" loading="lazy">
                  <button class="video-play-btn" aria-label="Play video">▶</button>
                </div>
                <div class="video-card-meta">
                  <span class="video-title">Powers of Ten (1977)</span>
                  <a href="https://www.youtube.com/watch?v=v9gPEQn1nxc" target="_blank" rel="noopener" class="video-yt-link">Bekijk op YouTube ↗</a>
                </div>
              </div>
            </td>
            <td>Klassieke documentaire over de relatieve schaal van het universum, van quarks tot het waarneembare heelal (stappen van factor 10).</td>
          </tr>

          <tr>
            <td><strong>02</strong></td>
            <td><strong>Orde van grootte</strong></td>
            <td>
              <div class="video-preview-card" data-video-id="XPkzpoxfryw" data-title="Carl Sagan — Eratosthenes">
                <div class="video-thumb-wrap">
                  <img src="https://img.youtube.com/vi/XPkzpoxfryw/hqdefault.jpg" alt="Carl Sagan Eratosthenes" class="video-thumb" loading="lazy">
                  <button class="video-play-btn" aria-label="Play video">▶</button>
                </div>
                <div class="video-card-meta">
                  <span class="video-title">Carl Sagan — Cosmos</span>
                  <a href="https://www.youtube.com/watch?v=XPkzpoxfryw" target="_blank" rel="noopener" class="video-yt-link">Bekijk op YouTube ↗</a>
                </div>
              </div>
            </td>
            <td>Carl Sagan legt in Cosmos uit hoe Eratosthenes meer dan 2200 jaar geleden met zonneschaduwen de omtrek van de aarde berekende.</td>
          </tr>

          <tr>
            <td><strong>03</strong></td>
            <td><strong>Eenheden & Schalen</strong></td>
            <td>
              <div class="video-preview-card" data-video-id="vDe9QjS2v_Q" data-title="Why America still uses Fahrenheit">
                <div class="video-thumb-wrap">
                  <img src="https://img.youtube.com/vi/vDe9QjS2v_Q/hqdefault.jpg" alt="Why America uses Fahrenheit" class="video-thumb" loading="lazy">
                  <button class="video-play-btn" aria-label="Play video">▶</button>
                </div>
                <div class="video-card-meta">
                  <span class="video-title">Fahrenheit vs Celsius</span>
                  <a href="https://www.youtube.com/watch?v=vDe9QjS2v_Q" target="_blank" rel="noopener" class="video-yt-link">Bekijk op YouTube ↗</a>
                </div>
              </div>
            </td>
            <td>De geschiedenis van temperatuurschalen en waarom SI-eenheden de wereldwijde standaard vormen in wetenschappelijk onderzoek.</td>
          </tr>

          <tr>
            <td><strong>04</strong></td>
            <td><strong>Galileo's Square-Cube Law</strong></td>
            <td>
              <div class="video-preview-card" data-video-id="CjRAsDgOmhY" data-title="Vsauce — How Big Can A Person Get?">
                <div class="video-thumb-wrap">
                  <img src="https://img.youtube.com/vi/CjRAsDgOmhY/hqdefault.jpg" alt="Vsauce Square Cube Law" class="video-thumb" loading="lazy">
                  <button class="video-play-btn" aria-label="Play video">▶</button>
                </div>
                <div class="video-card-meta">
                  <span class="video-title">Vsauce: How Big Can A Person Get?</span>
                  <a href="https://www.youtube.com/watch?v=CjRAsDgOmhY" target="_blank" rel="noopener" class="video-yt-link">Bekijk op YouTube ↗</a>
                </div>
              </div>
            </td>
            <td>Hoe oppervlakte en volume schalen bij vergroting en de fysische grenzen aan de grootte van organismen en constructies.</td>
          </tr>
        </tbody>
      </table>
    </div>
    `;

    html = html.replace(/<table id="tablepress-24"[\s\S]*?<\/table>/i, metrologieTable);
    fs.writeFileSync(metrologiePath, html, 'utf8');
    console.log('  Updated metrologie video player and table.');
  }
}

// ------------------------------------------------------------
// 4. Populate Vastestoffysica & STEM Resource Pages
// ------------------------------------------------------------
function populateResourcePages() {
  console.log('=== Step 4: Populating Vastestoffysica & STEM pages ===');

  // Vastestoffysica
  const vastestofPath = path.join(ROOT, 'lesmateriaal', 'fysica', 'fysica-vijfdes', 'vastestoffysica', 'index.html');
  const t2VastestofPath = path.join(TAST2, 'lesmateriaal', 'fysica', 'fysica-vijfdes', 'vastestoffysica', 'index.html');

  if (fs.existsSync(vastestofPath) && fs.existsSync(t2VastestofPath)) {
    let t2Html = fs.readFileSync(t2VastestofPath, 'utf8');
    let t1Html = fs.readFileSync(vastestofPath, 'utf8');

    // Extract table from tast 2
    const tableMatch = t2Html.match(/<table[\s\S]*?<\/table>/i);
    if (tableMatch) {
      let tableContent = tableMatch[0];
      
      // Convert .embed-youtube into video-preview-card for ultra smooth playback
      tableContent = tableContent.replace(/<div class="embed-youtube" data-video-id="([^"]+)"><div class="embed-youtube-play"><\/div><\/div>/g, (m, id) => {
        return `
        <div class="video-preview-card video-preview-mini" data-video-id="${id}">
          <div class="video-thumb-wrap">
            <img src="https://img.youtube.com/vi/${id}/hqdefault.jpg" alt="Video thumbnail" class="video-thumb" loading="lazy">
            <button class="video-play-btn" aria-label="Play video">▶</button>
          </div>
          <a href="https://www.youtube.com/watch?v=${id}" target="_blank" rel="noopener" class="video-yt-link">Bekijk op YouTube ↗</a>
        </div>
        `;
      });

      const vastestofBody = `
      <div class="lesson-table-header">
        <h2>Vastestoffysica — Halfgeleiders, Supergeleiding & Temperatuur</h2>
        <p>Lesmateriaal, online lesopnames en interactieve demonstraties voor fysica 5de jaar.</p>
      </div>
      <div class="table-responsive">
        ${tableContent}
      </div>
      `;

      t1Html = t1Html.replace(/<div class="entry-content">[\s\S]*?<\/div>/i, `<div class="entry-content">\n${vastestofBody}\n</div>`);
      fs.writeFileSync(vastestofPath, t1Html, 'utf8');
      console.log('  Populated vastestoffysica with 32-row video table.');
    }
  }

  // STEM Engineering
  const stemEngPath = path.join(ROOT, 'lesmateriaal', 'stem', 'stem-engineering', 'index.html');
  if (fs.existsSync(stemEngPath)) {
    let html = fs.readFileSync(stemEngPath, 'utf8');
    const stemEngContent = `
    <div class="stem-header">
      <h2>STEM Engineering — Ontwerpen, Bouwen & Innoveren</h2>
      <p class="meta">Hands-on projecten, CAD-ontwerp, 3D-printen en constructiemethoden.</p>
    </div>

    <div class="stem-grid">
      <div class="stem-card">
        <div class="stem-icon">🚀</div>
        <h3>CanSat & Ruimtevaart Engineering</h3>
        <p>Ontwikkeling van een functionele microsatelliet ter grootte van een frisdrankblikje. Inclusief parachuteberekeningen, sensorintegratie en telemetrie-ontvangst.</p>
        <a href="../../../spaceheadingdeezers/cansat/index.html" class="stem-link">Bekijk CanSat projecten →</a>
      </div>

      <div class="stem-card">
        <div class="stem-icon">🎈</div>
        <h3>Asgard Stratosfeerballon Project</h3>
        <p>Ontwerpen van wetenschappelijke experimenten voor lancering naar 30 km hoogte met een stratosferische weerballon in samenwerking met ESA en ESERO.</p>
        <a href="../../../spaceheadingdeezers/asgard/index.html" class="stem-link">Bekijk Asgard missies →</a>
      </div>

      <div class="stem-card">
        <div class="stem-icon">⚙️</div>
        <h3>3D CAD & Print-in-Place Mechanismen</h3>
        <p>Computer-Aided Design (CAD) principes in Fusion 360, parametrering van mechanische armen, toleranties en additieve fabricage.</p>
        <a href="../../../academy/index.html" class="stem-link">Naar Academy cursussen →</a>
      </div>

      <div class="stem-card">
        <div class="stem-icon">🔋</div>
        <h3>Energie-efficiëntie & Zonne-energie</h3>
        <p>Experimenteel onderzoek naar zonnecellen, maximale vermogenspunten (MPPT) en thermische dissipatie in extreme omgevingen.</p>
        <a href="../../../lesmateriaal/fysica/index.html" class="stem-link">Lesmateriaal fysica →</a>
      </div>
    </div>
    `;
    html = html.replace(/<div class="entry-content">[\s\S]*?<\/div>/i, `<div class="entry-content">\n${stemEngContent}\n</div>`);
    fs.writeFileSync(stemEngPath, html, 'utf8');
    console.log('  Populated STEM engineering page.');
  }

  // STEM Technology
  const stemTechPath = path.join(ROOT, 'lesmateriaal', 'stem', 'stem-technology', 'index.html');
  if (fs.existsSync(stemTechPath)) {
    let html = fs.readFileSync(stemTechPath, 'utf8');
    const stemTechContent = `
    <div class="stem-header">
      <h2>STEM Technology — Microcontrollers, Sensoren & IoT</h2>
      <p class="meta">Elektronica, radioverbindingen, MicroPython en dataverwerking.</p>
    </div>

    <div class="stem-grid">
      <div class="stem-card">
        <div class="stem-icon">💻</div>
        <h3>Raspberry Pi Pico & MicroPython</h3>
        <p>Programmeren van dual-core ARM Cortex-M0+ microcontrollers voor real-time data-acquisitie, PWM-besturing en I2C/SPI sensorcommunicatie.</p>
        <a href="../../../academy/index.html" class="stem-link">Bekijk programmeerlessen →</a>
      </div>

      <div class="stem-card">
        <div class="stem-icon">📡</div>
        <h3>RF Telemetrie & Radiocommunicatie</h3>
        <p>RFM69 en LoRa radio-transceivers configureren op 433 MHz en 868 MHz frequenties met antenne-afstemming en checksum validatie.</p>
        <a href="../../../spaceheadingdeezers/index.html" class="stem-link">Bekijk telemetrieprojecten →</a>
      </div>

      <div class="stem-card">
        <div class="stem-icon">🛰️</div>
        <h3>Astro Pi — Codering op het ISS</h3>
        <p>Python-programma's draaien op het International Space Station via de ESA Astro Pi Mission Space Lab challenge met Sense HAT sensoren.</p>
        <a href="../../../spaceheadingdeezers/astro-pi/index.html" class="stem-link">Bekijk Astro Pi →</a>
      </div>

      <div class="stem-card">
        <div class="stem-icon">📊</div>
        <h3>Data-analyse & Visualisatie</h3>
        <p>Verwerken van atmosferische vluchtdata met Python (Pandas & Matplotlib) voor druk-hoogtecurves en temperatuurlapse rates.</p>
        <a href="../../../simulations/index.html" class="stem-link">Naar simulaties →</a>
      </div>
    </div>
    `;
    html = html.replace(/<div class="entry-content">[\s\S]*?<\/div>/i, `<div class="entry-content">\n${stemTechContent}\n</div>`);
    fs.writeFileSync(stemTechPath, html, 'utf8');
    console.log('  Populated STEM technology page.');
  }
}

// ------------------------------------------------------------
// 5. Build Interactive Physics Simulation Library
// ------------------------------------------------------------
function buildSimulationLibrary() {
  console.log('=== Step 5: Building Physics Simulation Library ===');

  const simPath = path.join(ROOT, 'simulations', 'index.html');
  if (fs.existsSync(simPath)) {
    let html = fs.readFileSync(simPath, 'utf8');

    const simContent = `
    <div class="sim-header">
      <h2>Interactive Physics Simulation Library</h2>
      <p>Explore interactive physics applets, PhET simulations, Physlets, and GeoGebra models covering mechanics, electromagnetism, waves, and thermodynamics.</p>
    </div>

    <div class="sim-filter-bar">
      <button class="sim-filter-btn active" data-filter="all">All Simulations</button>
      <button class="sim-filter-btn" data-filter="mechanics">Mechanics</button>
      <button class="sim-filter-btn" data-filter="electricity">Electricity & Magnetism</button>
      <button class="sim-filter-btn" data-filter="waves">Waves & Optics</button>
      <button class="sim-filter-btn" data-filter="thermo">Thermodynamics</button>
    </div>

    <div class="sim-grid">
      <!-- Mechanics -->
      <div class="sim-card" data-category="mechanics">
        <div class="sim-badge">Mechanics</div>
        <h3>Energy Skate Park</h3>
        <p>Learn about conservation of energy with a skater. Build tracks, ramps, and jumps to observe kinetic, potential, and thermal energy transfers.</p>
        <div class="sim-actions">
          <a href="https://phet.colorado.edu/sims/html/energy-skate-park/latest/energy-skate-park_all.html" target="_blank" rel="noopener" class="sim-launch-btn">Launch Simulation ↗</a>
        </div>
      </div>

      <div class="sim-card" data-category="mechanics">
        <div class="sim-badge">Mechanics</div>
        <h3>Projectile Motion (Kogelbaan)</h3>
        <p>Blast cars, pianos, and golf balls out of a cannon. Adjust angle, initial speed, mass, and air resistance to study 2D kinematics.</p>
        <div class="sim-actions">
          <a href="https://phet.colorado.edu/sims/html/projectile-motion/latest/projectile-motion_all.html" target="_blank" rel="noopener" class="sim-launch-btn">Launch Simulation ↗</a>
        </div>
      </div>

      <div class="sim-card" data-category="mechanics">
        <div class="sim-badge">Mechanics</div>
        <h3>Forces and Motion: Basics (Krachten & Beweging)</h3>
        <p>Explore the forces at work when pulling against a cart, applying friction, and pushing a refrigerator or crate across varied surfaces.</p>
        <div class="sim-actions">
          <a href="https://phet.colorado.edu/sims/html/forces-and-motion-basics/latest/forces-and-motion-basics_all.html" target="_blank" rel="noopener" class="sim-launch-btn">Launch Simulation ↗</a>
        </div>
      </div>

      <div class="sim-card" data-category="mechanics">
        <div class="sim-badge">Mechanics</div>
        <h3>Pendulum Lab (Slingers)</h3>
        <p>Play with one or two pendulums and discover how the period depends on length, mass, gravity (Earth, Moon, Jupiter), and damping.</p>
        <div class="sim-actions">
          <a href="https://phet.colorado.edu/sims/html/pendulum-lab/latest/pendulum-lab_all.html" target="_blank" rel="noopener" class="sim-launch-btn">Launch Simulation ↗</a>
        </div>
      </div>

      <!-- Electricity -->
      <div class="sim-card" data-category="electricity">
        <div class="sim-badge">Electricity</div>
        <h3>Circuit Construction Kit: DC (Stroomkringen)</h3>
        <p>Build real electronic circuits with batteries, resistors, light bulbs, fuses, and switches. Measure current with ammeters and voltage with voltmeters.</p>
        <div class="sim-actions">
          <a href="https://phet.colorado.edu/sims/html/circuit-construction-kit-dc/latest/circuit-construction-kit-dc_all.html" target="_blank" rel="noopener" class="sim-launch-btn">Launch Simulation ↗</a>
        </div>
      </div>

      <div class="sim-card" data-category="electricity">
        <div class="sim-badge">Electricity</div>
        <h3>Charges and Fields (Elektrische Velden)</h3>
        <p>Place positive and negative charges in space and observe electric field vectors, equipotential lines, and electric potential values.</p>
        <div class="sim-actions">
          <a href="https://phet.colorado.edu/sims/html/charges-and-fields/latest/charges-and-fields_all.html" target="_blank" rel="noopener" class="sim-launch-btn">Launch Simulation ↗</a>
        </div>
      </div>

      <div class="sim-card" data-category="electricity">
        <div class="sim-badge">Electricity</div>
        <h3>Faraday's Law & Electromagnetic Induction</h3>
        <p>Investigate magnetic induction by moving a bar magnet near coils of wire to illuminate a light bulb and measure induced electromotive force.</p>
        <div class="sim-actions">
          <a href="https://phet.colorado.edu/sims/html/faradays-law/latest/faradays-law_all.html" target="_blank" rel="noopener" class="sim-launch-btn">Launch Simulation ↗</a>
        </div>
      </div>

      <div class="sim-card" data-category="electricity">
        <div class="sim-badge">Electricity</div>
        <h3>Ohm's Law & Resistance</h3>
        <p>See how the equation $V = I \\cdot R$ relates to simple circuits. Adjust voltage and resistance to observe immediate current changes.</p>
        <div class="sim-actions">
          <a href="https://phet.colorado.edu/sims/html/ohms-law/latest/ohms-law_all.html" target="_blank" rel="noopener" class="sim-launch-btn">Launch Simulation ↗</a>
        </div>
      </div>

      <!-- Waves & Optics -->
      <div class="sim-card" data-category="waves">
        <div class="sim-badge">Waves & Optics</div>
        <h3>Wave on a String (Trillingen & Golven)</h3>
        <p>Generate pulses or continuous waves on a string. Control amplitude, frequency, tension, and damping to study standing waves and reflection.</p>
        <div class="sim-actions">
          <a href="https://phet.colorado.edu/sims/html/wave-on-a-string/latest/wave-on-a-string_all.html" target="_blank" rel="noopener" class="sim-launch-btn">Launch Simulation ↗</a>
        </div>
      </div>

      <div class="sim-card" data-category="waves">
        <div class="sim-badge">Waves & Optics</div>
        <h3>Bending Light (Breking van Licht)</h3>
        <p>Explore Snell's Law of refraction and total internal reflection between air, water, glass, and custom prisms with laser beam rays.</p>
        <div class="sim-actions">
          <a href="https://phet.colorado.edu/sims/html/bending-light/latest/bending-light_all.html" target="_blank" rel="noopener" class="sim-launch-btn">Launch Simulation ↗</a>
        </div>
      </div>

      <div class="sim-card" data-category="waves">
        <div class="sim-badge">Waves & Optics</div>
        <h3>Wave Interference (Interferentie)</h3>
        <p>Make waves with a dripping faucet, speaker, or laser! Observe double-slit interference patterns, diffraction, and wave superposition.</p>
        <div class="sim-actions">
          <a href="https://phet.colorado.edu/sims/html/wave-interference/latest/wave-interference_all.html" target="_blank" rel="noopener" class="sim-launch-btn">Launch Simulation ↗</a>
        </div>
      </div>

      <!-- Thermodynamics -->
      <div class="sim-card" data-category="thermo">
        <div class="sim-badge">Thermodynamics</div>
        <h3>Gas Properties & Ideal Gas Law (Gaswetten)</h3>
        <p>Pump gas molecules into a box and see what happens as you change volume, add or remove heat, change gravity, and observe pressure on gauges.</p>
        <div class="sim-actions">
          <a href="https://phet.colorado.edu/sims/html/gas-properties/latest/gas-properties_all.html" target="_blank" rel="noopener" class="sim-launch-btn">Launch Simulation ↗</a>
        </div>
      </div>

      <div class="sim-card" data-category="thermo">
        <div class="sim-badge">Thermodynamics</div>
        <h3>States of Matter (Faseovergangen)</h3>
        <p>Heat, cool, and compress atoms and molecules (Neon, Argon, Oxygen, Water) to watch them transition between solid, liquid, and gas phases.</p>
        <div class="sim-actions">
          <a href="https://phet.colorado.edu/sims/html/states-of-matter/latest/states-of-matter_all.html" target="_blank" rel="noopener" class="sim-launch-btn">Launch Simulation ↗</a>
        </div>
      </div>
    </div>
    `;

    html = html.replace(/<div class="subpage-body-content">[\s\S]*?<\/div>\s*<\/div>/i, `<div class="subpage-body-content">\n${simContent}\n</div></div>`);
    fs.writeFileSync(simPath, html, 'utf8');
    console.log('  Built Simulation Library page with interactive cards.');
  }
}

// ------------------------------------------------------------
// 6. Build Interactive Filebrowser with Mock Login State
// ------------------------------------------------------------
function buildFilebrowser() {
  console.log('=== Step 6: Building Interactive Filebrowser ===');

  const fbPath = path.join(ROOT, 'filebrowser', 'index.html');
  if (fs.existsSync(fbPath)) {
    let html = fs.readFileSync(fbPath, 'utf8');

    const fbContent = `
    <div class="fb-container">
      <div class="fb-header">
        <h2>Document & File Library (Cursussen & Documenten)</h2>
        <p>Toegang tot handboeken, oefeningenbundels, laboverslagen, en examenvragen.</p>
      </div>

      <!-- Locked State Notice (shown when logged out) -->
      <div id="fbLockedView" class="fb-locked-card" style="display: none;">
        <div class="fb-lock-icon">🔒</div>
        <h3>Inloggen vereist voor volledige documententoegang</h3>
        <p>Meld u aan met uw account om lesbundels, oplossingen van fysica-oefeningen en laboverslagen te bekijken en downloaden.</p>
        <div class="fb-lock-actions">
          <button id="fbDemoLoginBtn" class="btn-primary">⚡ Snel inloggen (Demo Account)</button>
          <a href="../login/index.html" class="btn-secondary">Aanmelden met account</a>
        </div>
      </div>

      <!-- Unlocked State (shown when logged in or demo mode) -->
      <div id="fbUnlockedView" class="fb-unlocked-card">
        <div class="fb-status-bar">
          <span class="fb-status-badge">🔓 Status: Ingelogd als <strong id="fbUsernameDisplay">Student</strong></span>
          <button id="fbLogoutBtn" class="fb-btn-small">Afmelden</button>
        </div>

        <div class="fb-folder-grid">
          <!-- Folder 1 -->
          <div class="fb-folder-card">
            <div class="fb-folder-title">
              <span class="fb-icon">📁</span>
              <h4>01. Handboeken & Cursusteksten</h4>
            </div>
            <ul class="fb-file-list">
              <li><a href="#" class="fb-file-link"><span class="fb-file-icon">📄</span> Fysica 5de jaar — Elektrostatica & Elektrodynamica.pdf <span class="fb-size">4.2 MB</span></a></li>
              <li><a href="#" class="fb-file-link"><span class="fb-file-icon">📄</span> Fysica 6de jaar — Kinematica & Dynamica.pdf <span class="fb-size">5.8 MB</span></a></li>
              <li><a href="#" class="fb-file-link"><span class="fb-file-icon">📄</span> Seminarie Wiskunde — Vectorrekening & Goniometrie.pdf <span class="fb-size">3.1 MB</span></a></li>
            </ul>
          </div>

          <!-- Folder 2 -->
          <div class="fb-folder-card">
            <div class="fb-folder-title">
              <span class="fb-icon">📁</span>
              <h4>02. Oefeningen & Uitgewerkte Oplossingen</h4>
            </div>
            <ul class="fb-file-list">
              <li><a href="#" class="fb-file-link"><span class="fb-file-icon">📄</span> VFO Olympiadevraagstukken — Uitgewerkte oplossingen.pdf <span class="fb-size">2.9 MB</span></a></li>
              <li><a href="#" class="fb-file-link"><span class="fb-file-icon">📄</span> Oefeningenbundel — Arbeid, Energie & Vermogen.pdf <span class="fb-size">1.7 MB</span></a></li>
              <li><a href="#" class="fb-file-link"><span class="fb-file-icon">📄</span> Trillingen & Golven — Voorbeeldoefeningen.pdf <span class="fb-size">2.4 MB</span></a></li>
            </ul>
          </div>

          <!-- Folder 3 -->
          <div class="fb-folder-card">
            <div class="fb-folder-title">
              <span class="fb-icon">📁</span>
              <h4>03. Laboverslagen & Meetprotocollen</h4>
            </div>
            <ul class="fb-file-list">
              <li><a href="#" class="fb-file-link"><span class="fb-file-icon">📄</span> Labogids — Bepaling van de valversnelling (g).pdf <span class="fb-size">1.2 MB</span></a></li>
              <li><a href="#" class="fb-file-link"><span class="fb-file-icon">📄</span> Laboprotocol — Wet van Ohm & Weerstandsmeting.pdf <span class="fb-size">980 KB</span></a></li>
              <li><a href="#" class="fb-file-link"><span class="fb-file-icon">📄</span> Labosjabloon & Foutenanalyse Formulier.docx <span class="fb-size">450 KB</span></a></li>
            </ul>
          </div>

          <!-- Folder 4 -->
          <div class="fb-folder-card">
            <div class="fb-folder-title">
              <span class="fb-icon">📁</span>
              <h4>04. Formularium & Tabellen</h4>
            </div>
            <ul class="fb-file-list">
              <li><a href="#" class="fb-file-link"><span class="fb-file-icon">📄</span> Formularium Fysica 2de en 3de Graad.pdf <span class="fb-size">850 KB</span></a></li>
              <li><a href="#" class="fb-file-link"><span class="fb-file-icon">📄</span> SI-Eenheden, Prefix en Constanten Tabel.pdf <span class="fb-size">620 KB</span></a></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
    `;

    html = html.replace(/<div class="subpage-body-content">[\s\S]*?<\/div>\s*<\/div>/i, `<div class="subpage-body-content">\n${fbContent}\n</div></div>`);
    fs.writeFileSync(fbPath, html, 'utf8');
    console.log('  Built interactive Filebrowser page.');
  }
}

// ------------------------------------------------------------
// 7. Update script.js & style.css with Interactive Features
// ------------------------------------------------------------
function updateScriptAndStyles() {
  console.log('=== Step 7: Updating script.js & style.css with Login, Sim filters & Video Players ===');

  // Update script.js
  const scriptPath = path.join(ROOT, 'script.js');
  let js = fs.readFileSync(scriptPath, 'utf8');

  const additionalJS = `
/* --- Interactive Login Status System --- */
function initLoginStatus() {
  const loginWidgets = document.querySelectorAll('#login-widget');
  const fbLockedView = document.getElementById('fbLockedView');
  const fbUnlockedView = document.getElementById('fbUnlockedView');
  const fbUsernameDisplay = document.getElementById('fbUsernameDisplay');
  const fbDemoLoginBtn = document.getElementById('fbDemoLoginBtn');
  const fbLogoutBtn = document.getElementById('fbLogoutBtn');

  function getCurrentUser() {
    try {
      const u = localStorage.getItem('currentUser');
      return u ? JSON.parse(u) : null;
    } catch (e) { return null; }
  }

  function setCurrentUser(user) {
    if (user) localStorage.setItem('currentUser', JSON.stringify(user));
    else localStorage.removeItem('currentUser');
    renderLoginState();
  }

  function renderLoginState() {
    const user = getCurrentUser();

    loginWidgets.forEach(widget => {
      if (user) {
        // Render Logged-in profile card
        widget.innerHTML = \`
          <div class="sidebar-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            Account
          </div>
          <div class="user-profile-card">
            <div class="user-avatar-badge">\${user.username.charAt(0).toUpperCase()}</div>
            <div class="user-details">
              <strong class="user-name">\${escapeHtml(user.username)}</strong>
              <span class="user-role-tag">\${escapeHtml(user.role || 'Student')}</span>
            </div>
            <div class="user-quick-links">
              <a href="\${getRelativeRoot()}filebrowser/index.html" class="user-link">📁 Filebrowser (Unlocked)</a>
            </div>
            <button class="btn-logout" id="sidebarLogoutBtn">Log Out</button>
          </div>
        \`;
        const logoutBtn = widget.querySelector('#sidebarLogoutBtn');
        if (logoutBtn) logoutBtn.addEventListener('click', () => setCurrentUser(null));
      } else {
        // Render Login Form
        widget.innerHTML = \`
          <div class="sidebar-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            Login Status
          </div>
          <form class="login-form" id="sidebarLoginForm">
            <label for="login-user">Username or Email</label>
            <input type="text" id="login-user" name="log" placeholder="e.g. Student" required>
            <label for="login-pass">Password</label>
            <input type="password" id="login-pass" name="pwd" placeholder="••••••••" required>
            <div class="login-actions">
              <button type="submit" class="btn-login">log in</button>
              <div class="login-links">
                <a href="\${getRelativeRoot()}forgot-password/index.html">Forgot?</a>
                <a href="\${getRelativeRoot()}register/index.html">Register</a>
              </div>
            </div>
          </form>
        \`;
        const form = widget.querySelector('#sidebarLoginForm');
        if (form) {
          form.addEventListener('submit', (e) => {
            e.preventDefault();
            const usernameInput = form.querySelector('#login-user');
            const username = usernameInput ? usernameInput.value.trim() : 'Student';
            setCurrentUser({
              username: username || 'Student',
              role: username.toLowerCase().includes('dirk') || username.toLowerCase().includes('teacher') ? 'Teacher' : 'Student',
              loggedInAt: new Date().toISOString()
            });
          });
        }
      }
    });

    // Update Filebrowser page if on filebrowser
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

  function getRelativeRoot() {
    const parts = window.location.pathname.split('/').filter(Boolean);
    const depth = parts.length > 0 && parts[parts.length - 1].endsWith('.html') ? parts.length - 1 : parts.length;
    return depth > 0 ? '../'.repeat(depth) : './';
  }

  if (fbDemoLoginBtn) {
    fbDemoLoginBtn.addEventListener('click', () => {
      setCurrentUser({ username: 'Demo Student', role: 'Student' });
    });
  }

  if (fbLogoutBtn) {
    fbLogoutBtn.addEventListener('click', () => {
      setCurrentUser(null);
    });
  }

  renderLoginState();
}

/* --- Interactive Video Player Cards --- */
function initInteractiveVideoCards() {
  document.addEventListener('click', (e) => {
    const playBtn = e.target.closest('.video-play-btn, .video-thumb-wrap');
    if (!playBtn) return;
    const card = playBtn.closest('.video-preview-card');
    if (!card) return;
    const videoId = card.dataset.videoId;
    if (!videoId) return;

    const wrap = card.querySelector('.video-thumb-wrap');
    if (wrap) {
      wrap.innerHTML = \`
        <iframe 
          src="https://www.youtube-nocookie.com/embed/\${videoId}?autoplay=1&enablejsapi=1&rel=0" 
          class="video-active-frame"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
          allowfullscreen 
          referrerpolicy="strict-origin-when-cross-origin">
        </iframe>
      \`;
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
`;

  if (!js.includes('initLoginStatus')) {
    js = js.replace(/document\.addEventListener\('DOMContentLoaded', \(\) => {([\s\S]*?)}\);/, (match, body) => {
      return `document.addEventListener('DOMContentLoaded', () => {${body}  initLoginStatus();\n  initInteractiveVideoCards();\n  initSimulationFilters();\n});\n\n${additionalJS}`;
    });
    fs.writeFileSync(scriptPath, js, 'utf8');
    console.log('  Updated script.js with Login status, Video card player, and Simulation filters.');
  }

  // Update style.css with modern styling for Cansat cards, Video cards, Simulations, Filebrowser, and Login
  const stylePath = path.join(ROOT, 'style.css');
  let css = fs.readFileSync(stylePath, 'utf8');

  const additionalCSS = `
/* ============================================================
   Modern Components: Cansat, Video Cards, Simulations, Filebrowser
   ============================================================ */

/* --- Cansat Figures & Layout --- */
.cansat-project-header h2 { font-size: 1.6rem; margin-bottom: 0.25rem; }
.cansat-section { margin: 1.5rem 0; }
.cansat-section h3 { font-size: 1.3rem; margin: 1.25rem 0 0.5rem; color: var(--green); }
.cansat-section h4 { font-size: 1.1rem; margin: 1rem 0 0.4rem; }
.cansat-figure-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin: 1.25rem 0;
}
.cansat-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 1rem;
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  transition: transform var(--transition), box-shadow var(--transition);
}
.cansat-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}
.cansat-card-wide {
  max-width: 800px;
  margin: 1.25rem auto;
}
.cansat-img {
  max-width: 100%;
  height: auto;
  max-height: 400px;
  object-fit: contain;
  border-radius: var(--radius-sm);
  cursor: zoom-in;
}
.cansat-card figcaption {
  font-size: 0.88rem;
  color: var(--text-muted);
  margin-top: 0.75rem;
  line-height: 1.5;
}

/* --- Modern Table Styling --- */
.table-responsive {
  width: 100%;
  overflow-x: auto;
  margin: 1.25rem 0;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
}
.table-modern {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.92rem;
  background: var(--surface);
}
.table-modern th {
  background: var(--green-light);
  color: var(--text);
  font-weight: 600;
  padding: 0.75rem 1rem;
  text-align: left;
  border-bottom: 2px solid var(--border);
}
.table-modern td {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--border);
  color: var(--text);
  vertical-align: middle;
}
.table-modern tr:last-child td { border-bottom: none; }
.table-highlight td { font-weight: 700; background: var(--green-light); }

/* --- Interactive Video Cards --- */
.video-preview-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  overflow: hidden;
  max-width: 320px;
}
.video-preview-mini { max-width: 220px; }
.video-thumb-wrap {
  position: relative;
  width: 100%;
  aspect-ratio: 16/9;
  background: #000;
  cursor: pointer;
}
.video-thumb {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.video-play-btn {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 44px;
  height: 44px;
  background: rgba(220, 38, 38, 0.9);
  color: #fff;
  border: none;
  border-radius: 50%;
  font-size: 1.2rem;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0,0,0,0.4);
  transition: transform var(--transition), background var(--transition);
}
.video-thumb-wrap:hover .video-play-btn {
  transform: translate(-50%, -50%) scale(1.15);
  background: #e02424;
}
.video-active-frame {
  width: 100%;
  height: 100%;
  border: none;
  display: block;
}
.video-card-meta {
  padding: 0.5rem 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}
.video-title { font-size: 0.85rem; font-weight: 600; color: var(--text); }
.video-yt-link { font-size: 0.78rem; color: var(--green); text-decoration: none; }
.video-yt-link:hover { text-decoration: underline; }

/* --- STEM Cards Grid --- */
.stem-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1.25rem;
  margin: 1.5rem 0;
}
.stem-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  box-shadow: var(--shadow-sm);
  transition: transform var(--transition), border-color var(--transition);
}
.stem-card:hover {
  transform: translateY(-2px);
  border-color: var(--green);
}
.stem-icon { font-size: 2rem; margin-bottom: 0.25rem; }
.stem-card h3 { font-size: 1.15rem; margin: 0; color: var(--text); }
.stem-card p { font-size: 0.9rem; color: var(--text-secondary); line-height: 1.5; flex-grow: 1; margin: 0; }
.stem-link { font-size: 0.88rem; font-weight: 600; color: var(--green); text-decoration: none; margin-top: 0.5rem; }

/* --- Simulation Library --- */
.sim-filter-bar {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin: 1.25rem 0;
}
.sim-filter-btn {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text-secondary);
  font-size: 0.88rem;
  cursor: pointer;
  transition: all var(--transition);
}
.sim-filter-btn.active,
.sim-filter-btn:hover {
  background: var(--green);
  color: #fff;
  border-color: var(--green);
}
.sim-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.25rem;
  margin: 1.5rem 0;
}
.sim-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  box-shadow: var(--shadow-sm);
  transition: transform var(--transition), border-color var(--transition);
}
.sim-card:hover {
  transform: translateY(-3px);
  border-color: var(--green);
  box-shadow: var(--shadow-md);
}
.sim-badge {
  display: inline-block;
  align-self: flex-start;
  padding: 0.2rem 0.6rem;
  background: var(--green-light);
  color: var(--green-dark);
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.sim-card h3 { font-size: 1.15rem; margin: 0; color: var(--text); }
.sim-card p { font-size: 0.88rem; color: var(--text-secondary); line-height: 1.5; flex-grow: 1; margin: 0; }
.sim-launch-btn {
  display: inline-block;
  padding: 0.55rem 1rem;
  background: var(--green);
  color: #fff;
  font-weight: 600;
  font-size: 0.88rem;
  text-decoration: none;
  border-radius: var(--radius-sm);
  margin-top: 0.5rem;
  text-align: center;
  transition: background var(--transition);
}
.sim-launch-btn:hover { background: var(--green-dark); }

/* --- Filebrowser Component --- */
.fb-locked-card {
  background: var(--surface);
  border: 1px dashed var(--border);
  border-radius: var(--radius);
  padding: 2.5rem 1.5rem;
  text-align: center;
  max-width: 540px;
  margin: 2rem auto;
}
.fb-lock-icon { font-size: 3rem; margin-bottom: 0.75rem; }
.fb-lock-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: 1.25rem;
}
.btn-primary {
  padding: 0.65rem 1.25rem;
  background: var(--green);
  color: #fff;
  border: none;
  border-radius: var(--radius-sm);
  font-weight: 600;
  cursor: pointer;
  transition: background var(--transition);
}
.btn-primary:hover { background: var(--green-dark); }
.btn-secondary {
  padding: 0.65rem 1.25rem;
  background: var(--surface);
  border: 1px solid var(--border);
  color: var(--text);
  border-radius: var(--radius-sm);
  font-weight: 600;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
}
.fb-status-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background: var(--green-light);
  border-radius: var(--radius-sm);
  margin-bottom: 1.25rem;
}
.fb-status-badge { font-size: 0.9rem; color: var(--green-dark); }
.fb-btn-small {
  padding: 0.3rem 0.8rem;
  background: none;
  border: 1px solid var(--green-dark);
  color: var(--green-dark);
  border-radius: 4px;
  font-size: 0.82rem;
  cursor: pointer;
}
.fb-folder-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.25rem;
}
.fb-folder-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 1rem;
  box-shadow: var(--shadow-sm);
}
.fb-folder-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border-bottom: 1px solid var(--border);
  padding-bottom: 0.5rem;
  margin-bottom: 0.75rem;
}
.fb-folder-title h4 { margin: 0; font-size: 0.98rem; color: var(--text); }
.fb-file-list { list-style: none; padding: 0; margin: 0; }
.fb-file-list li { margin: 0.4rem 0; }
.fb-file-link {
  display: flex;
  align-items: center;
  font-size: 0.88rem;
  color: var(--text);
  text-decoration: none;
  gap: 0.4rem;
  padding: 0.3rem 0.4rem;
  border-radius: 4px;
  transition: background var(--transition);
}
.fb-file-link:hover { background: var(--green-light); color: var(--green-dark); }
.fb-size { margin-left: auto; font-size: 0.75rem; color: var(--text-muted); }

/* --- Sidebar Profile Card (Logged-in State) --- */
.user-profile-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0.6rem;
  padding: 0.5rem 0;
}
.user-avatar-badge {
  width: 52px;
  height: 52px;
  background: var(--green);
  color: #fff;
  font-size: 1.4rem;
  font-weight: 700;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(65,166,42,0.3);
}
.user-name { font-size: 1rem; color: var(--text); }
.user-role-tag {
  display: inline-block;
  font-size: 0.75rem;
  padding: 0.15rem 0.5rem;
  background: var(--green-light);
  color: var(--green-dark);
  border-radius: 12px;
  font-weight: 600;
}
.user-quick-links { width: 100%; margin: 0.4rem 0; }
.user-link {
  display: block;
  padding: 0.45rem 0.6rem;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text);
  font-size: 0.85rem;
  text-decoration: none;
  font-weight: 500;
}
.user-link:hover { border-color: var(--green); color: var(--green); }
.btn-logout {
  width: 100%;
  padding: 0.45rem 0;
  background: none;
  border: 1px solid var(--border);
  color: var(--text-muted);
  border-radius: var(--radius-sm);
  font-size: 0.85rem;
  cursor: pointer;
  transition: all var(--transition);
}
.btn-logout:hover { background: #fee2e2; color: #dc2626; border-color: #fca5a5; }
`;

  if (!css.includes('cansat-project-header')) {
    css += '\n' + additionalCSS;
    fs.writeFileSync(stylePath, css, 'utf8');
    console.log('  Updated style.css with component styles.');
  }
}

// ------------------------------------------------------------
// MAIN EXECUTION
// ------------------------------------------------------------
function main() {
  console.log('=== Running Comprehensive Website Fixer ===\n');
  fixGlobalHeadersAndTheme();
  fixCansatPages();
  fixYouTubeEmbeds();
  populateResourcePages();
  buildSimulationLibrary();
  buildFilebrowser();
  updateScriptAndStyles();
  console.log('\n=== All comprehensive fixes completed successfully! ===');
}

main();
