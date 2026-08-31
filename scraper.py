import os
import re
import sys
import time
import urllib.request
import urllib.error
from html.parser import HTMLParser

# Force unbuffered output
sys.stdout.reconfigure(line_buffering=True)

BASE_URL = "https://test.dirkgeeroms.be"
WORKSPACE_DIR = os.path.dirname(os.path.abspath(__file__))

# Read original index.html
with open(os.path.join(WORKSPACE_DIR, "index.html"), "r", encoding="utf-8") as f:
    INDEX_HTML = f.read()

# Extract ONLY menu/navigation URLs (no recursive discovery)
def extract_urls(html):
    urls = re.findall(r'href=["\'](https?://test\.dirkgeeroms\.be/[^"\']*)["\']', html)
    cleaned = []
    for u in urls:
        if any(x in u for x in ["wp-admin", "wp-json", "wp-content", "feed", "xmlrpc", "?a=", "redirect_to", "?s="]):
            continue
        u = u.split("#")[0].rstrip("/")
        if u not in cleaned and u != BASE_URL:
            cleaned.append(u)
    return cleaned

ALL_URLS = extract_urls(INDEX_HTML)
# Also add the top-level pages we know exist
extra = [
    f"{BASE_URL}/academy",
    f"{BASE_URL}/lesmateriaal",
    f"{BASE_URL}/links",
    f"{BASE_URL}/filebrowser",
    f"{BASE_URL}/forums",
    f"{BASE_URL}/simulations",
]
for e in extra:
    if e not in ALL_URLS:
        ALL_URLS.append(e)

print(f"Total URLs to crawl: {len(ALL_URLS)}")

# WordPress content parser
class WPContentParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.title = ""
        self.content_parts = []
        self.in_title = False
        self.in_content = False
        self.content_depth = 0
        self.in_entry_title = False
        self._tag_stack = []

    def handle_starttag(self, tag, attrs):
        ad = dict(attrs)
        if tag == "title":
            self.in_title = True
        if tag == "h1" and "entry-title" in ad.get("class", ""):
            self.in_entry_title = True

        is_start = (
            (tag == "div" and "entry-content" in ad.get("class", "")) or
            (tag == "article" and "post" in ad.get("class", ""))
        )
        if is_start and not self.in_content:
            self.in_content = True
            self.content_depth = 1
            astr = " ".join(f'{k}="{v}"' for k, v in attrs)
            self.content_parts.append(f"<{tag} {astr}>" if astr else f"<{tag}>")
        elif self.in_content:
            self.content_depth += 1
            astr = " ".join(f'{k}="{v}"' for k, v in attrs)
            self.content_parts.append(f"<{tag} {astr}>" if astr else f"<{tag}>")

    def handle_endtag(self, tag):
        if tag == "title":
            self.in_title = False
        if tag == "h1" and self.in_entry_title:
            self.in_entry_title = False
        if self.in_content:
            self.content_parts.append(f"</{tag}>")
            self.content_depth -= 1
            if self.content_depth == 0:
                self.in_content = False

    def handle_data(self, data):
        if self.in_title:
            self.title = data.strip()
        elif self.in_entry_title and not self.title:
            self.title = data.strip()
        elif self.in_content:
            self.content_parts.append(data)

    def handle_entityref(self, name):
        if self.in_content:
            self.content_parts.append(f"&{name};")

    def handle_charref(self, name):
        if self.in_content:
            self.content_parts.append(f"&#{name};")

    def handle_comment(self, data):
        pass  # skip comments

def get_path_info(url):
    path = url.replace(BASE_URL + "/", "")
    parts = [p for p in path.split("/") if p]
    depth = len(parts)
    to_root = "../" * depth if depth > 0 else ""
    return parts, to_root

def build_subpage(url, title, body):
    parts, to_root = get_path_info(url)
    css = f"{to_root}style.css"
    js = f"{to_root}script.js"

    sub = f'''
    <div class="content-area">
      <article class="card page-content-card">
        <div class="card-header">
          <h1 class="card-title page-main-title">{title}</h1>
        </div>
        <div class="card-body">
          {body}
        </div>
      </article>
    </div>'''

    # Find content-area block in INDEX_HTML
    marker = '<div class="content-area">'
    si = INDEX_HTML.find(marker)
    if si == -1:
        raise ValueError("No content-area in index.html")
    dc = 0
    ei = -1
    for i in range(si, len(INDEX_HTML)):
        if INDEX_HTML[i:i+4] == "<div":
            dc += 1
        elif INDEX_HTML[i:i+5] == "</div":
            dc -= 1
            if dc == 0:
                ei = i + 6
                break
    if ei == -1:
        raise ValueError("Unmatched content-area div")

    html = INDEX_HTML[:si] + sub + INDEX_HTML[ei:]
    html = html.replace('href="style.css"', f'href="{css}"')
    html = html.replace('src="script.js"', f'src="{js}"')
    html = re.sub(r'<title>.*?</title>', f'<title>{title} — dirkgeeroms.be</title>', html)

    def repl(m):
        u = m.group(1).rstrip("/")
        if u == BASE_URL:
            return f'href="{to_root}index.html"'
        tp = u.replace(BASE_URL + "/", "")
        tparts = [p for p in tp.split("/") if p]
        return f'href="{to_root}{"/".join(tparts)}/index.html"'

    html = re.sub(r'href=["\'](https?://test\.dirkgeeroms\.be/[^"\']*)["\']', repl, html)
    return html

def fetch(url, timeout=20, retries=2):
    headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
    for attempt in range(retries):
        try:
            req = urllib.request.Request(url + "/", headers=headers)
            with urllib.request.urlopen(req, timeout=timeout) as resp:
                return resp.read().decode('utf-8', errors='ignore')
        except Exception as e:
            if attempt < retries - 1:
                print(f"    Retry {attempt+1} for {url}: {e}")
                time.sleep(1)
            else:
                raise

# Crawl
done = 0
errors = []
for i, url in enumerate(ALL_URLS):
    parts, _ = get_path_info(url)
    outdir = os.path.join(WORKSPACE_DIR, *parts)
    outfile = os.path.join(outdir, "index.html")

    # Skip if already exists
    if os.path.exists(outfile):
        done += 1
        print(f"[{i+1}/{len(ALL_URLS)}] SKIP (exists): {'/'.join(parts)}")
        continue

    print(f"[{i+1}/{len(ALL_URLS)}] Crawling: {url}")
    try:
        raw = fetch(url)
        parser = WPContentParser()
        parser.feed(raw)

        title = parser.title or "Page"
        title = title.replace(" - dirkgeeroms.be", "").replace(" — dirkgeeroms.be", "").strip()

        body = "".join(parser.content_parts)
        if not body.strip():
            body = "<p>This page's content could not be automatically extracted. Visit the <a href='" + url + "'>original page</a>.</p>"

        # Clean leaked sidebar
        body = re.sub(r'<div id="secondary".*', '', body, flags=re.DOTALL)

        html = build_subpage(url, title, body)
        os.makedirs(outdir, exist_ok=True)
        with open(outfile, "w", encoding="utf-8") as f:
            f.write(html)

        done += 1
        print(f"    Saved: {'/'.join(parts)}/index.html")
    except Exception as e:
        errors.append((url, str(e)))
        print(f"    ERROR: {e}")

# Update main index.html links to local
print("\nUpdating index.html links to local paths...")
def idx_repl(m):
    u = m.group(1).rstrip("/")
    if u == BASE_URL:
        return 'href="index.html"'
    tp = u.replace(BASE_URL + "/", "")
    tparts = [p for p in tp.split("/") if p]
    return f'href="{"/".join(tparts)}/index.html"'

with open(os.path.join(WORKSPACE_DIR, "index.html"), "r", encoding="utf-8") as f:
    idx = f.read()
idx = re.sub(r'href=["\'](https?://test\.dirkgeeroms\.be/[^"\']*)["\']', idx_repl, idx)
with open(os.path.join(WORKSPACE_DIR, "index.html"), "w", encoding="utf-8") as f:
    f.write(idx)

print(f"\nDone! {done} pages saved, {len(errors)} errors.")
if errors:
    print("Failed URLs:")
    for u, e in errors:
        print(f"  {u}: {e}")
