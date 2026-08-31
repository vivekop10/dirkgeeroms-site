import os
import re
import sys
import json
import urllib.request
import urllib.error
import time
from html.parser import HTMLParser

# Force unbuffered output
sys.stdout.reconfigure(line_buffering=True)

BASE_URL = "https://test.dirkgeeroms.be"
WORKSPACE_DIR = os.path.dirname(os.path.abspath(__file__))
WP_CONTENT_DIR = os.path.join(WORKSPACE_DIR, "wp-content")
CACHE_DIR = os.path.join(WORKSPACE_DIR, "raw_cache")

os.makedirs(WP_CONTENT_DIR, exist_ok=True)
os.makedirs(CACHE_DIR, exist_ok=True)

# List of all 101 URLs to build
URLS = [
    # Main Navigation
    "https://test.dirkgeeroms.be/contact",
    "https://test.dirkgeeroms.be/spaceheadingdeezers",
    "https://test.dirkgeeroms.be/spaceheadingdeezers/asgard",
    "https://test.dirkgeeroms.be/spaceheadingdeezers/asgard/asgard-covid",
    "https://test.dirkgeeroms.be/spaceheadingdeezers/asgard/asgard-x",
    "https://test.dirkgeeroms.be/spaceheadingdeezers/asgard/asgard-xii",
    "https://test.dirkgeeroms.be/spaceheadingdeezers/astro-pi",
    "https://test.dirkgeeroms.be/spaceheadingdeezers/cansat",
    "https://test.dirkgeeroms.be/spaceheadingdeezers/cansat/2022-2023-cansat",
    "https://test.dirkgeeroms.be/spaceheadingdeezers/cansat/2023-2024-cansat",
    "https://test.dirkgeeroms.be/spaceheadingdeezers/cansat/2025-2026-cansat",
    "https://test.dirkgeeroms.be/spaceheadingdeezers/hemera",
    "https://test.dirkgeeroms.be/spaceheadingdeezers/rmi",
    "https://test.dirkgeeroms.be/spaceheadingdeezers/svalbard",
    "https://test.dirkgeeroms.be/photoalbum",
    "https://test.dirkgeeroms.be/register",
    
    # Academy Pages
    "https://test.dirkgeeroms.be/academy",
    "https://test.dirkgeeroms.be/academy/fysica-vijfdes",
    "https://test.dirkgeeroms.be/academy/fysica-vijfdes/elektrostatica",
    "https://test.dirkgeeroms.be/academy/fysica-vijfdes/elektrodynamica",
    "https://test.dirkgeeroms.be/academy/fysica-vijfdes/vastestoffysica",
    "https://test.dirkgeeroms.be/academy/fysica-vijfdes/elektromagnetisme",
    "https://test.dirkgeeroms.be/academy/labo-fysica-vijfdes",
    "https://test.dirkgeeroms.be/academy/fysica-zesdes",
    "https://test.dirkgeeroms.be/academy/fysica-zesdes/kinematica",
    "https://test.dirkgeeroms.be/academy/fysica-zesdes/dynamica",
    "https://test.dirkgeeroms.be/academy/fysica-zesdes/arbeid-energie",
    "https://test.dirkgeeroms.be/academy/fysica-zesdes/trillingen-golven",
    "https://test.dirkgeeroms.be/academy/labo-fysica-zesdes",
    
    # Resources (Lesmateriaal) Pages
    "https://test.dirkgeeroms.be/lesmateriaal",
    "https://test.dirkgeeroms.be/lesmateriaal/fysica",
    "https://test.dirkgeeroms.be/lesmateriaal/fysica/fysica-vierdes",
    "https://test.dirkgeeroms.be/lesmateriaal/fysica/fysica-vierdes/metrologie",
    "https://test.dirkgeeroms.be/lesmateriaal/fysica/fysica-vierdes/energie",
    "https://test.dirkgeeroms.be/lesmateriaal/fysica/fysica-vierdes/druk",
    "https://test.dirkgeeroms.be/lesmateriaal/fysica/fysica-vierdes/gaswetten",
    "https://test.dirkgeeroms.be/lesmateriaal/fysica/fysica-vierdes/warmte",
    "https://test.dirkgeeroms.be/lesmateriaal/fysica/fysica-vierdes/faseovergangen",
    "https://test.dirkgeeroms.be/lesmateriaal/fysica/fysica-vijfdes",
    "https://test.dirkgeeroms.be/lesmateriaal/fysica/fysica-vijfdes/elektrostatica",
    "https://test.dirkgeeroms.be/lesmateriaal/fysica/fysica-vijfdes/elektrodynamica",
    "https://test.dirkgeeroms.be/lesmateriaal/fysica/fysica-vijfdes/elektromagnetisme",
    "https://test.dirkgeeroms.be/lesmateriaal/fysica/fysica-vijfdes/vastestoffysica",
    "https://test.dirkgeeroms.be/lesmateriaal/fysica/fysica-vijfdes/kernfysica",
    "https://test.dirkgeeroms.be/lesmateriaal/fysica/fysica-zesdes",
    "https://test.dirkgeeroms.be/lesmateriaal/fysica/fysica-zesdes/kinematica",
    "https://test.dirkgeeroms.be/lesmateriaal/fysica/fysica-zesdes/dynamica",
    "https://test.dirkgeeroms.be/lesmateriaal/fysica/fysica-zesdes/arbeid-energie",
    "https://test.dirkgeeroms.be/lesmateriaal/fysica/fysica-zesdes/trillingen-golven",
    "https://test.dirkgeeroms.be/lesmateriaal/labo-fysica",
    "https://test.dirkgeeroms.be/lesmateriaal/wiskunde",
    "https://test.dirkgeeroms.be/lesmateriaal/wiskunde/wiskunde-vijfdes",
    "https://test.dirkgeeroms.be/lesmateriaal/wiskunde/wiskunde-zesdes",
    "https://test.dirkgeeroms.be/lesmateriaal/stem",
    "https://test.dirkgeeroms.be/lesmateriaal/stem/stem-physics",
    "https://test.dirkgeeroms.be/lesmateriaal/stem/stem-technology",
    "https://test.dirkgeeroms.be/lesmateriaal/stem/stem-engineering",
    "https://test.dirkgeeroms.be/lesmateriaal/stem/stem-mathematics",
    
    # Simulations, Links, Filebrowser
    "https://test.dirkgeeroms.be/simulations",
    "https://test.dirkgeeroms.be/links",
    "https://test.dirkgeeroms.be/filebrowser",
    
    # Forums
    "https://test.dirkgeeroms.be/forums",
    "https://test.dirkgeeroms.be/forums/forum/fysica",
    "https://test.dirkgeeroms.be/forums/forum/fysica/fysica-vijfdes",
    "https://test.dirkgeeroms.be/forums/forum/fysica/fysica-vijfdes/elektrostatica",
    "https://test.dirkgeeroms.be/forums/forum/fysica/fysica-vijfdes/elektrodynamica",
    "https://test.dirkgeeroms.be/forums/forum/fysica/fysica-vijfdes/elektromagnetisme",
    "https://test.dirkgeeroms.be/forums/forum/fysica/fysica-vijfdes/vaste-stoffysica",
    "https://test.dirkgeeroms.be/forums/forum/fysica/fysica-vijfdes/kernfysica",
    "https://test.dirkgeeroms.be/forums/forum/fysica/fysica-zesdes",
    "https://test.dirkgeeroms.be/forums/forum/fysica/fysica-zesdes/kinematica",
    "https://test.dirkgeeroms.be/forums/forum/fysica/fysica-zesdes/dynamica",
    "https://test.dirkgeeroms.be/forums/forum/fysica/fysica-zesdes/arbeid-energie",
    "https://test.dirkgeeroms.be/forums/forum/fysica/fysica-zesdes/trillingen-golven",
    "https://test.dirkgeeroms.be/forums/forum/labo-fysica",
    "https://test.dirkgeeroms.be/forums/forum/labo-fysica/labo-fysica-vijfdes",
    "https://test.dirkgeeroms.be/forums/forum/labo-fysica/labo-fysica-zesdes",
    "https://test.dirkgeeroms.be/forums/forum/seminarie-wiskunde",
    "https://test.dirkgeeroms.be/forums/forum/seminarie-wiskunde/seminarie-wiskunde-vijfdes",
    "https://test.dirkgeeroms.be/forums/forum/seminarie-wiskunde/seminarie-wiskunde-zesdes",
    "https://test.dirkgeeroms.be/forums/forum/stem-seminar",
    "https://test.dirkgeeroms.be/forums/forum/stem-seminar/stem-physics",
    "https://test.dirkgeeroms.be/forums/forum/stem-seminar/stem-technology",
    "https://test.dirkgeeroms.be/forums/forum/stem-seminar/stem-engineering",
    "https://test.dirkgeeroms.be/forums/forum/stem-seminar/stem-mathematics",
    
    # VFO Forum & VFO Sub-forums
    "https://test.dirkgeeroms.be/forums/forum/vfo",
    "https://test.dirkgeeroms.be/forums/forum/vfo/hydrostatica-warmteleer",
    "https://test.dirkgeeroms.be/forums/forum/vfo/kernfysica",
    "https://test.dirkgeeroms.be/forums/forum/vfo/elektrostatica",
    "https://test.dirkgeeroms.be/forums/forum/vfo/elektrodynamica",
    "https://test.dirkgeeroms.be/forums/forum/vfo/elektromagnetisme",
    "https://test.dirkgeeroms.be/forums/forum/vfo/kinematica",
    "https://test.dirkgeeroms.be/forums/forum/vfo/dynamica",
    "https://test.dirkgeeroms.be/forums/forum/vfo/arbeid-energie",
    "https://test.dirkgeeroms.be/forums/forum/vfo/trillingen-golven",
    
    # Specific Forum Topics from homepage
    "https://test.dirkgeeroms.be/forums/topic/vraag-6-16de-vfo",
    "https://test.dirkgeeroms.be/forums/topic/oef-56-p-239",
    "https://test.dirkgeeroms.be/forums/topic/oef-54-p-239",
    "https://test.dirkgeeroms.be/forums/topic/oef-52-p-239",
    "https://test.dirkgeeroms.be/forums/topic/vraag-21-p-151",
    "https://test.dirkgeeroms.be/forums/topic/vraag-12-14de-vfo"
]

# Base Layout Template components extracted from homepage index.html
TEMPLATE_HEADER_ACTIONS = """
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
"""

TEMPLATE_SEARCH_OVERLAY = """
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
"""

# Load template index.html to rebuild other pages based on it
with open(os.path.join(WORKSPACE_DIR, "index.html"), "r", encoding="utf-8") as f:
    RAW_INDEX_TEMPLATE = f.read()

# Make sure template index.html has the theme toggle and search container
def patch_template(html):
    # If already patched, skip
    if "header-actions" in html:
        return html
    
    # 1. Insert header actions before mobile menuToggle
    menu_toggle_idx = html.find('<button class="menu-toggle"')
    if menu_toggle_idx != -1:
        html = html[:menu_toggle_idx] + TEMPLATE_HEADER_ACTIONS + html[menu_toggle_idx:]
        
    # 2. Insert search overlay right before main
    main_idx = html.find('<main class="site-main">')
    if main_idx != -1:
        html = html[:main_idx] + TEMPLATE_SEARCH_OVERLAY + html[main_idx:]
        
    return html

PATCHED_INDEX_TEMPLATE = patch_template(RAW_INDEX_TEMPLATE)

# Write patched index.html back
with open(os.path.join(WORKSPACE_DIR, "index.html"), "w", encoding="utf-8") as f:
    f.write(PATCHED_INDEX_TEMPLATE)

print("Patched template index.html with new header features.")

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}

def fetch_page(url):
    # Clean URL to create a cache file name
    safe_name = re.sub(r'https?://(?:test\.)?dirkgeeroms\.be/', '', url).replace("/", "_") or "homepage"
    cache_path = os.path.join(CACHE_DIR, f"{safe_name}.html")
    
    if os.path.exists(cache_path):
        with open(cache_path, "r", encoding="utf-8", errors="ignore") as f:
            return f.read()
            
    print(f"Fetching from web: {url}")
    try:
        req = urllib.request.Request(url + "/", headers=headers)
        with urllib.request.urlopen(req, timeout=20) as response:
            html = response.read().decode('utf-8', errors='ignore')
        with open(cache_path, "w", encoding="utf-8") as f:
            f.write(html)
        time.sleep(0.5)
        return html
    except Exception as e:
        print(f"Error fetching {url}: {e}")
        # Fallback: if cached index.html exists, use empty or load from existing local file
        return ""

# HTML parser to extract content and normalize links and media
class RobustWPParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.title = ""
        self.body_parts = []
        self.in_title = False
        self.in_content = False
        self.content_depth = 0
        self.in_entry_title = False

    def handle_starttag(self, tag, attrs):
        ad = dict(attrs)
        
        # Capture title
        if tag == "title":
            self.in_title = True
            return
        if tag == "h1" and "entry-title" in ad.get("class", ""):
            self.in_entry_title = True
            return

        # Check for content area
        is_content_start = (
            (tag == "div" and "entry-content" in ad.get("class", "")) or
            (tag == "article" and "post" in ad.get("class", ""))
        )
        
        if is_content_start and not self.in_content:
            self.in_content = True
            self.content_depth = 1
            # We don't write the wrapper tag itself to avoid leaking page containers
            return
            
        if self.in_content:
            self.content_depth += 1
            
            # Standardize YouTube Iframes
            if tag == "iframe" and "youtube.com/embed/" in ad.get("src", ""):
                src = ad["src"]
                # Replace with standard clean autoplay/embed parameters
                src = src.replace("allowfullscreen=\"None\"", "").replace("allowfullscreen", "")
                self.body_parts.append(
                    f'<div class="video-container">'
                    f'<iframe src="{src}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>'
                    f'</div>'
                )
                return
                
            # Clean and standardize images
            if tag == "img":
                # Get the real URL from data-src or src
                img_src = ad.get("data-src") or ad.get("src", "")
                
                # Skip inline SVGs or tiny transparent tracking GIFs
                if "data:image/svg+xml" in img_src or "data:image/gif" in img_src:
                    return
                
                alt = ad.get("alt", "")
                title_attr = ad.get("title", "")
                
                # Check if it points to dirkgeeroms.be
                # We will convert it to a local relative wp-content path later
                self.body_parts.append(f'<img src="{img_src}" alt="{alt}" title="{title_attr}" class="content-img">')
                return
                
            # Keep links but we will localize them
            # For galleries, the link wraps the image:
            # We can tag ngg-fancybox link class to trigger the Lightbox
            if tag == "a":
                href = ad.get("href", "")
                cls = ad.get("class", "")
                if "ngg-fancybox" in cls or href.lower().endswith(('.jpg', '.jpeg', '.png', '.gif')):
                    self.body_parts.append(f'<a href="{href}" class="lightbox-trigger" title="{ad.get("title", "")}">')
                    return
                
            # Output standard tags
            astr = " ".join(f'{k}="{v}"' for k, v in attrs if k not in ["data-src", "data-srcset"])
            self.body_parts.append(f"<{tag} {astr}>" if astr else f"<{tag}>")

    def handle_endtag(self, tag):
        if tag == "title":
            self.in_title = False
            return
        if tag == "h1" and self.in_entry_title:
            self.in_entry_title = False
            return
            
        if self.in_content:
            self.content_depth -= 1
            if self.content_depth == 0:
                self.in_content = False
                return
            
            # Skip closing iframes or images since we custom handled them
            if tag in ["iframe", "img"]:
                return
                
            self.body_parts.append(f"</{tag}>")

    def handle_data(self, data):
        if self.in_title:
            self.title = data.strip()
        elif self.in_entry_title and not self.title:
            self.title = data.strip()
        elif self.in_content:
            self.body_parts.append(data)

    def handle_entityref(self, name):
        if self.in_content:
            self.body_parts.append(f"&{name};")

    def handle_charref(self, name):
        if self.in_content:
            self.body_parts.append(f"&#{name};")

def get_relative_prefix(depth):
    return "../" * depth

def build_subpage_html(url, title, body_content):
    # Determine directory depth
    path_part = url.replace(BASE_URL + "/", "")
    parts = [p for p in path_part.split("/") if p]
    depth = len(parts)
    prefix = get_relative_prefix(depth)
    
    # Build content wrapper
    wrapper = f"""
    <div class="content-area">
      <article class="card page-content-card">
        <div class="card-header">
          <h1 class="card-title page-main-title">{title}</h1>
        </div>
        <div class="card-body">
          <span id="breadcrumbs" class="breadcrumbs">You are here: 
            <a href="{prefix}index.html">home</a> &raquo; <span class="breadcrumb_last">{title}</span>
          </span>
          <div class="subpage-body-content">
            {body_content}
          </div>
        </div>
      </article>
    </div>
    """
    
    # Locate content-area in template index
    marker = '<div class="content-area">'
    si = PATCHED_INDEX_TEMPLATE.find(marker)
    if si == -1:
        raise ValueError("Could not find content-area marker in patched template")
        
    # Count matching divs to find end index
    dc = 0
    ei = -1
    for i in range(si, len(PATCHED_INDEX_TEMPLATE)):
        if PATCHED_INDEX_TEMPLATE[i:i+4] == "<div":
            dc += 1
        elif PATCHED_INDEX_TEMPLATE[i:i+5] == "</div":
            dc -= 1
            if dc == 0:
                ei = i + 6
                break
                
    if ei == -1:
        raise ValueError("Unmatched content-area div in template")
        
    html = PATCHED_INDEX_TEMPLATE[:si] + wrapper + PATCHED_INDEX_TEMPLATE[ei:]
    
    # Replace stylesheets and script references with correct depth
    html = html.replace('href="style.css"', f'href="{prefix}style.css"')
    html = html.replace('src="script.js"', f'src="{prefix}script.js"')
    html = re.sub(r'<title>.*?</title>', f'<title>{title} — dirkgeeroms.be</title>', html)
    
    # Make all absolute links on test.dirkgeeroms.be relative to this page
    def rel_link_replacer(match):
        full_url = match.group(1).rstrip("/")
        if full_url == BASE_URL:
            return f'href="{prefix}index.html"'
            
        target_path = full_url.replace(BASE_URL + "/", "")
        tparts = [p for p in target_path.split("/") if p]
        
        # Skip login query pages
        if any(q in target_path for q in ["?a=", "wp-login", "wp-admin"]):
            return match.group(0)
            
        return f'href="{prefix}{"/".join(tparts)}/index.html"'
        
    html = re.sub(r'href=["\'](https?://test\.dirkgeeroms\.be/[^"\']*)["\']', rel_link_replacer, html)
    
    # Localize wp-content paths in page body to match current page depth
    # E.g. https://test.dirkgeeroms.be/wp-content/gallery/... -> ../../wp-content/gallery/...
    def wp_content_replacer(match):
        full_asset_url = match.group(1)
        # Extract relative path of the asset under wp-content
        # e.g., wp-content/gallery/2022-2023/image.jpg
        asset_rel_path = re.sub(r'https?://(?:test\.|www\.)?dirkgeeroms\.be/', '', full_asset_url)
        return f'{prefix}{asset_rel_path}'
        
    html = re.sub(r'src=["\'](https?://(?:test\.|www\.)?dirkgeeroms\.be/wp-content/[^"\']+)["\']', lambda m: f'src="{wp_content_replacer(m)}"', html)
    html = re.sub(r'href=["\'](https?://(?:test\.|www\.)?dirkgeeroms\.be/wp-content/[^"\']+)["\']', lambda m: f'href="{wp_content_replacer(m)}"', html)
    
    return html

# Generate search index array
search_index = []

print("\nStarting clean rebuild of all pages...")

for i, url in enumerate(URLS):
    parts = [p for p in url.replace(BASE_URL + "/", "").split("/") if p]
    
    print(f"[{i+1}/{len(URLS)}] Building page: {'/'.join(parts) or 'homepage'}")
    
    raw_html = fetch_page(url)
    if not raw_html:
        print(f"  SKIPPING: Page fetch failed")
        continue
        
    parser = RobustWPParser()
    parser.feed(raw_html)
    
    title = parser.title or "Page"
    title = title.replace(" - dirkgeeroms.be", "").replace(" — dirkgeeroms.be", "").strip()
    
    body = "".join(parser.body_parts)
    # Strip layout leaking sidebars if present
    body = re.sub(r'<div id="secondary".*', '', body, flags=re.DOTALL)
    
    # Save search index info (only indexing page title and text content, not html tags)
    clean_text = re.sub(r'<[^>]+>', ' ', body)
    clean_text = re.sub(r'\s+', ' ', clean_text).strip()
    
    page_rel_url = f"{'/'.join(parts)}/index.html" if parts else "index.html"
    search_index.append({
        "title": title,
        "url": page_rel_url,
        "content": clean_text[:600] # Index first 600 chars of body content
    })
    
    # Save the page html
    if parts:
        page_html = build_subpage_html(url, title, body)
        outdir = os.path.join(WORKSPACE_DIR, *parts)
        os.makedirs(outdir, exist_ok=True)
        outfile = os.path.join(outdir, "index.html")
        with open(outfile, "w", encoding="utf-8") as f:
            f.write(page_html)

# Save the search index file to root
with open(os.path.join(WORKSPACE_DIR, "search_index.js"), "w", encoding="utf-8") as f:
    f.write(f"const SEARCH_INDEX = {json.dumps(search_index, indent=2)};")

print("\nGenerated search_index.js file successfully!")
print("Rebuild of all subpages completed successfully!")
