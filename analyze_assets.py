import os
import re

WORKSPACE_DIR = os.path.dirname(os.path.abspath(__file__))
images = []
iframes = []

for root, dirs, files in os.walk(WORKSPACE_DIR):
    for file in files:
        if file.endswith(".html"):
            path = os.path.join(root, file)
            with open(path, "r", encoding="utf-8") as f:
                content = f.read()
            
            # Find all img src
            img_matches = re.findall(r'<img[^>]+src=["\']([^"\']+)["\']', content)
            for img in img_matches:
                if img not in images:
                    images.append(img)
            
            # Find all iframe src
            iframe_matches = re.findall(r'<iframe[^>]+src=["\']([^"\']+)["\']', content)
            for iframe in iframe_matches:
                if iframe not in iframes:
                    iframes.append(iframe)

print("=== FOUND IMAGES ===")
for img in sorted(images):
    print(img)

print("\n=== FOUND IFRAMES ===")
for iframe in sorted(iframes):
    print(iframe)
