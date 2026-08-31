/**
 * Convert all external image URLs to local paths in HTML files
 * Usage: node localize_images.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;

function findHtmlFiles(dir, relBase = '') {
  const results = [];
  try {
    const entries = fs.readdirSync(dir);
    for (const entry of entries) {
      if (entry === '.git' || entry === 'node_modules' || entry === 'raw_cache' || entry === 'old web' || entry === 'wp-content') continue;
      const full = path.join(dir, entry);
      const rel = relBase ? `${relBase}/${entry}` : entry;
      const stat = fs.statSync(full);
      if (stat.isDirectory()) {
        results.push(...findHtmlFiles(full, rel));
      } else if (entry === 'index.html') {
        results.push({ full, rel });
      }
    }
  } catch (e) {}
  return results;
}

function main() {
  const htmlFiles = findHtmlFiles(ROOT);
  let totalFixed = 0;

  for (const file of htmlFiles) {
    let html = fs.readFileSync(file.full, 'utf8');
    const origHtml = html;

    // Calculate depth from root
    const relDir = path.dirname(file.rel);
    const depth = relDir === '.' ? 0 : relDir.split(/[/\\]/).length;
    const prefix = depth > 0 ? '../'.repeat(depth) : '';

    // Replace external URLs with local paths
    // Pattern: https://test.dirkgeeroms.be/wp-content/gallery/PATH(?query)
    html = html.replace(
      /https?:\/\/test\.dirkgeeroms\.be\/(wp-content\/gallery\/[^"'\s>]+?)(\?[^"'\s>]*)?(["'\s>])/g,
      (match, relPath, query, ending) => {
        return prefix + relPath + ending;
      }
    );

    // Also fix href links that point to external gallery images  
    html = html.replace(
      /href="https?:\/\/test\.dirkgeeroms\.be\/(wp-content\/gallery\/[^"]+?)(\?[^"]*)?" /g,
      (match, relPath) => {
        return `href="${prefix}${relPath}" `;
      }
    );

    if (html !== origHtml) {
      fs.writeFileSync(file.full, html, 'utf8');
      totalFixed++;
    }
  }

  console.log(`Localized image paths in ${totalFixed} files`);
}

main();
