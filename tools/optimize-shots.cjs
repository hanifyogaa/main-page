// Converts the chosen MERCI screenshots to web-sized WebP. Run from the merci-promo-video project (it has `sharp`):
//   node "F:/Web App/SIYU/merci-tutorial-site/tools/optimize-shots.cjs"
// Source shots come from seeded local accounts, never real student data.
const path = require('path');
const fs = require('fs');
const sharp = require('F:/Web App/SIYU/merci-promo-video/node_modules/sharp');

const SRC = 'F:/Web App/SIYU/merci-promo-video/public/shots';
const OUT = 'F:/Web App/SIYU/merci-tutorial-site/assets/img/shots';
const NAMES = [
  'login', 'm-login', 'dash-belumplot', 'skta-belumplot', 'skta-index', 'dash-skta-diproses', 'dash-skta-aktif',
  'subdefense-create', 'subdefense-show', 'subdefense-revisi', 'dash-pengganti',
  'dash-yud-draft', 'documents-draft', 'documents-kat-d', 'documents-verifikasi', 'dash-yud-verifikasi', 'dash-yud-sesi',
  'dash-lulus', 'finaldocs-lulus', 'notifications-lulus', 'profile-draft', 'guide-mhs',
  'lec-dashboard', 'lec-approvals', 'lec-advisees', 'lec-advisee-detail', 'lec-subdefense-index', 'lec-subdefense-grade',
  'lec-revisi-review', 'lec-docs', 'lec-docs-pengganti', 'lec-scheduler-index', 'lec-sched-sub-show', 'lec-profile', 'lec-guide',
];

(async () => {
  let total = 0;
  for (const name of NAMES) {
    const file = path.join(SRC, `${name}.png`);
    if (!fs.existsSync(file)) { console.log('MISSING', name); continue; }
    const mobile = name.startsWith('m-');
    const info = await sharp(file).resize({ width: mobile ? 540 : 1280, withoutEnlargement: true })
      .webp({ quality: 80 }).toFile(path.join(OUT, `${name}.webp`));
    total += info.size;
    console.log(name.padEnd(24), `${info.width}x${info.height}`, `${Math.round(info.size / 1024)} KB`);
  }
  console.log('TOTAL', Math.round(total / 1024), 'KB');
})();
