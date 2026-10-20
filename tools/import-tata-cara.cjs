// Imports the team's raw guide folders into what the site publishes. Run:  node tools/import-tata-cara.cjs
// Needs the `sharp` package (resolved from ../merci-promo-video/node_modules, same as optimize-shots.cjs).
// Idempotent: unchanged images are skipped. Writes content/tata-cara/*.md, assets/pdf/*.pdf, assets/img/tata-cara/*.webp
// and content/tata-cara/images.json (name -> [width, height], used by build.cjs so it needs no image library).
const fs = require('fs');
const path = require('path');
const sharp = require(path.join(__dirname, '..', '..', 'merci-promo-video', 'node_modules', 'sharp'));
const { guides } = require('./tata-cara.config.cjs');

const ROOT = path.join(__dirname, '..');
const MD_DIR = path.join(ROOT, 'content', 'tata-cara');
const PDF_DIR = path.join(ROOT, 'assets', 'pdf');
const IMG_DIR = path.join(ROOT, 'assets', 'img', 'tata-cara');
for (const d of [MD_DIR, PDF_DIR, IMG_DIR]) fs.mkdirSync(d, { recursive: true });

const manifestFile = path.join(MD_DIR, 'images.json');
const manifest = fs.existsSync(manifestFile) ? JSON.parse(fs.readFileSync(manifestFile, 'utf8')) : {};

(async () => {
  let converted = 0, skipped = 0, missing = 0;
  for (const g of guides) {
    const src = path.join(ROOT, g.dir, `${g.file}.md`);
    const md = fs.readFileSync(src, 'utf8');
    fs.writeFileSync(path.join(MD_DIR, `${g.slug}.md`), md.replace(/\r\n/g, '\n'));
    fs.copyFileSync(path.join(ROOT, g.dir, `${g.file}.pdf`), path.join(PDF_DIR, `tata-cara-${g.slug}.pdf`));

    for (const m of md.matchAll(/!\[[^\]]*\]\(([^)]+)\)/g)) {
      const base = path.basename(m[1], path.extname(m[1]));
      const from = path.join(ROOT, g.dir, g.imgDir, `${base}.png`);
      const to = path.join(IMG_DIR, `${base}.webp`);
      if (!fs.existsSync(from)) { console.error('MISSING image', from); missing++; continue; }
      if (fs.existsSync(to) && manifest[base] && fs.statSync(to).mtimeMs > fs.statSync(from).mtimeMs) { skipped++; continue; }
      const info = await sharp(from).resize({ width: 1280, withoutEnlargement: true }).webp({ quality: 80, effort: 5 }).toFile(to);
      manifest[base] = [info.width, info.height];
      converted++;
    }
    console.log(`ok ${g.slug}`);
  }
  fs.writeFileSync(manifestFile, JSON.stringify(manifest, null, 1) + '\n');
  const total = Object.keys(manifest).length;
  const mb = fs.readdirSync(IMG_DIR).reduce((s, f) => s + fs.statSync(path.join(IMG_DIR, f)).size, 0) / 1048576;
  console.log(`images: ${converted} converted, ${skipped} unchanged, ${missing} missing; ${total} in manifest, ${mb.toFixed(1)} MB of WebP`);
  if (missing) process.exit(1);
})();
