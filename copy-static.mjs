import fs from 'fs';
import path from 'path';

function copyDirSync(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// 1. Copy images
console.log('Copying images directory to dist/images...');
copyDirSync('images', 'dist/images');

// 2. Copy lang
console.log('Copying lang directory to dist/lang...');
copyDirSync('lang', 'dist/lang');

// 3. Copy SEO files
for (const file of ['robots.txt', 'sitemap.xml']) {
  if (fs.existsSync(file)) {
    fs.copyFileSync(file, path.join('dist', file));
    console.log(`Copied ${file} to dist/`);
  }
}

console.log('Post-build static assets copy complete.');
