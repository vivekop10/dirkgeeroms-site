import os
import re
import urllib.request
import urllib.error
import time

WORKSPACE_DIR = os.path.dirname(os.path.abspath(__file__))
WP_CONTENT_DIR = os.path.join(WORKSPACE_DIR, "wp-content")
os.makedirs(WP_CONTENT_DIR, exist_ok=True)

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}

def download_file(url, local_path):
    os.makedirs(os.path.dirname(local_path), exist_ok=True)
    if os.path.exists(local_path):
        return True
    
    print(f"Downloading: {url} -> {local_path}")
    for attempt in range(3):
        try:
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, timeout=15) as response:
                with open(local_path, "wb") as f:
                    f.write(response.read())
            return True
        except Exception as e:
            print(f"  Attempt {attempt+1} failed: {e}")
            time.sleep(1)
    return False

def get_relative_prefix(depth):
    return "../" * depth

# Find all HTML files
html_files = []
for root, dirs, files in os.walk(WORKSPACE_DIR):
    for file in files:
        if file.endswith(".html") and "wp-content" not in root:
            html_files.append(os.path.join(root, file))

print(f"Found {len(html_files)} HTML files to process.")

# Set of all URLs we need to download
download_mapping = {}

for html_path in html_files:
    # Determine depth relative to workspace root
    rel_path = os.path.relpath(html_path, WORKSPACE_DIR)
    parts = rel_path.split(os.sep)
    depth = len(parts) - 1 # 0 for root index.html, 1 for academy/index.html, etc.
    
    with open(html_path, "r", encoding="utf-8", errors="ignore") as f:
        content = f.read()

    # 1. Clean lazy loaded images: replace src="data:..." data-src="real_url" with src="real_url"
    # We find all <img ...> tags
    def img_cleaner(match):
        img_tag = match.group(0)
        # Find data-src
        data_src_match = re.search(r'data-src=["\']([^"\']+)["\']', img_tag)
        if data_src_match:
            real_url = data_src_match.group(1)
            # Replace src="..." with src="real_url" and remove data-src
            cleaned = re.sub(r'src=["\']([^"\']+)["\']', f'src="{real_url}"', img_tag)
            cleaned = re.sub(r'data-src=["\']([^"\']+)["\']', '', cleaned)
            # Also clean data-srcset if present
            data_srcset_match = re.search(r'data-srcset=["\']([^"\']+)["\']', cleaned)
            if data_srcset_match:
                real_srcset = data_srcset_match.group(1)
                cleaned = re.sub(r'srcset=["\']([^"\']+)["\']', f'srcset="{real_srcset}"', cleaned)
                cleaned = re.sub(r'data-srcset=["\']([^"\']+)["\']', '', cleaned)
            return cleaned
        return img_tag

    content = re.sub(r'<img[^>]+>', img_cleaner, content)

    # 2. Collect all images/iframes/scripts that point to dirkgeeroms.be/wp-content/...
    # We support both http/https and test/www
    asset_urls = re.findall(r'(https?://(?:test\.|www\.)?dirkgeeroms\.be/wp-content/([^\s"\'\?#]+))', content)
    for full_url, rel_url_path in asset_urls:
        # Clean url_path from query string
        clean_rel_path = rel_url_path.split("?")[0]
        # Map full_url (with possible query) to local destination path
        local_dest = os.path.join(WP_CONTENT_DIR, *clean_rel_path.split("/"))
        download_mapping[full_url] = (local_dest, clean_rel_path)

    # Write back the cleaned file temporarily
    with open(html_path, "w", encoding="utf-8") as f:
        f.write(content)

print(f"Collected {len(download_mapping)} unique assets to download.")

# Download all assets
downloaded_count = 0
for url, (dest, rel_url_path) in download_mapping.items():
    if download_file(url, dest):
        downloaded_count += 1

print(f"Successfully downloaded {downloaded_count}/{len(download_mapping)} assets.")

# Update the HTML files to use relative paths to the local assets
for html_path in html_files:
    rel_path = os.path.relpath(html_path, WORKSPACE_DIR)
    parts = rel_path.split(os.sep)
    depth = len(parts) - 1
    prefix = get_relative_prefix(depth)
    
    with open(html_path, "r", encoding="utf-8", errors="ignore") as f:
        content = f.read()

    # Replace absolute asset URLs with local relative paths
    for url, (dest, rel_url_path) in download_mapping.items():
        # E.g. prefix is "../../", rel_url_path is "gallery/2022-2023/..."
        # Result relative link: "../../wp-content/gallery/2022-2023/..."
        local_rel_link = f"{prefix}wp-content/{rel_url_path}"
        content = content.replace(url, local_rel_link)
        
        # Also handle any variants like without https/http or relative paths
        # (e.g. sometimes written as /wp-content/uploads/...)
        content = content.replace(f"/wp-content/{rel_url_path}", f"{prefix}wp-content/{rel_url_path}")
        content = content.replace(f"wp-content/{rel_url_path}", f"{prefix}wp-content/{rel_url_path}")

    with open(html_path, "w", encoding="utf-8") as f:
        f.write(content)

print("Asset localization completed successfully!")
