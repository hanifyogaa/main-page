// Generates the four pages from the content below. Run:  node tools/build.cjs
// The generated .html files are what gets uploaded; the server needs no build step.
// Edit TEXT here (or edit the generated HTML directly for a one-off fix, then mirror it here).
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const OUT = path.join(__dirname, '..');
const YEAR = new Date().getFullYear();

/** `?v=<content hash>` on css/js: nginx lets browsers cache those for a day, and this makes an edit show up immediately. */
const ver = (rel) => crypto.createHash('sha1').update(fs.readFileSync(path.join(OUT, rel))).digest('hex').slice(0, 8);

/** Addresses live in assets/js/config.js (single source); baked into the HTML so links work without JavaScript. */
const SITE = new Function('window', fs.readFileSync(path.join(OUT, 'assets/js/config.js'), 'utf8') + '\nreturn window.SITE;')({});
const bake = (html) => html
  .replace(/data-merci-link href="#"/g, `data-merci-link href="${SITE.merciUrl || '#'}"`)
  .replace(/data-sofi-link href="#"/g, `data-sofi-link href="${SITE.sofiUrl || '#'}"`)
  .replace(/data-sijaki-link href="#"/g, `data-sijaki-link href="${SITE.sijakiUrl || '#'}"`)
  .replace(/data-onedesk-link href="#"/g, `data-onedesk-link href="${SITE.onedeskUrl || '#'}"`);

/* ---------- icons (Lucide, stroke) ---------- */
const svg = (inner, size = 22) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${inner}</svg>`;
const ICON = {
  cap: svg('<path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"/><path d="M22 10v6"/><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"/>', 24),
  users: svg('<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>', 24),
  info: svg('<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>', 20),
  clipboard: svg('<rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="m9 14 2 2 4-4"/>', 24),
  presentation: svg('<path d="M2 3h20"/><path d="M21 3v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V3"/><path d="m7 21 5-5 5 5"/>', 24),
  briefcase: svg('<path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/><rect width="20" height="14" x="2" y="6" rx="2"/>', 24),
  warn: svg('<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>', 20),
};

/* ---------- screenshots: name -> [width, height] (see tools/optimize-shots.cjs) ---------- */
const SHOT = {
  login: [1280, 800], 'dash-belumplot': [1280, 921], 'skta-belumplot': [1280, 800], 'skta-index': [1280, 1197],
  'dash-skta-diproses': [1280, 968], 'dash-skta-aktif': [1280, 800], 'subdefense-create': [1280, 1383],
  'subdefense-show': [1280, 1141], 'subdefense-revisi': [1280, 1204], 'dash-pengganti': [1280, 800],
  'dash-yud-draft': [1280, 956], 'documents-draft': [1280, 1453], 'documents-kat-d': [1280, 1239],
  'documents-verifikasi': [1280, 1453], 'dash-yud-verifikasi': [1280, 1134], 'dash-yud-sesi': [1280, 998],
  'dash-lulus': [1280, 1041], 'finaldocs-lulus': [1280, 1065], 'notifications-lulus': [1280, 2609],
  'profile-draft': [1280, 1618], 'guide-mhs': [1280, 1832], 'lec-dashboard': [1280, 1366], 'lec-approvals': [1280, 800],
  'lec-advisees': [1280, 1772], 'lec-advisee-detail': [1280, 1038], 'lec-subdefense-index': [1280, 800],
  'lec-subdefense-grade': [1280, 2100], 'lec-docs': [1280, 1671], 'lec-docs-pengganti': [1280, 911],
  'lec-scheduler-index': [1280, 846], 'lec-sched-sub-show': [1280, 935], 'lec-profile': [1280, 800], 'lec-guide': [1280, 1474],
};

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function fig(root, name, alt, caption) {
  const [w, h] = SHOT[name];
  return `<figure class="shot"><button type="button" aria-label="Perbesar tangkapan layar: ${esc(alt)}">` +
    `<img src="${root}assets/img/shots/${name}.webp" alt="${esc(alt)}" width="${w}" height="${h}" loading="lazy" decoding="async"></button>` +
    (caption ? `<figcaption>${esc(caption)}</figcaption>` : '') + `</figure>`;
}

const callout = (kind, html) =>
  `<div class="callout ${kind}">${kind === 'warn' ? ICON.warn : ICON.info}<p>${html}</p></div>`;

/** Every step gets an anchor id (`<stage>-<n>`) so the finder and the quick list can link straight to it. */
function step(root, { title, text, shots = [], note }, id, keywords = '') {
  return `<li class="step" id="${id}" data-keywords="${esc(keywords)}"><div><h3>${title}</h3><p>${text}</p>` +
    (note ? note : '') +
    shots.map((s) => fig(root, ...s)).join('') + `</div></li>`;
}

function stage(root, { id, title, intro, steps, note, video }, keywords = {}) {
  return `<section class="stage" id="${id}"${video ? ` data-video="${video}"` : ''} aria-labelledby="${id}-h"><header><h2 id="${id}-h">${title}</h2><p>${intro}</p>${note || ''}</header>` +
    `<ol class="steps">${steps.map((s, i) => step(root, s, `${id}-${i + 1}`, keywords[`${id}-${i + 1}`])).join('')}</ol></section>`;
}

/** "What do you want to do?" block: static shortcut cards (work without JavaScript); site.js adds the search box. */
function finder(stages, quick) {
  const hint = (sid) => {
    const k = sid.lastIndexOf('-');
    const st = stages.find((s) => s.id === sid.slice(0, k));
    return `${st.title} &middot; langkah ${sid.slice(k + 1)}`;
  };
  return `<section class="section finder" aria-labelledby="finder-h" data-finder><div class="wrap">
  <div class="section-head"><h2 id="finder-h">Anda ingin melakukan apa?</h2><p>Ketik kebutuhan Anda atau pilih salah satu di bawah. Anda akan diarahkan ke langkah panduan dan video yang sesuai.</p></div>
  <div data-finder-box></div>
  <div class="finder-results" data-finder-results aria-live="polite" hidden></div>
  <ul class="quick" data-finder-quick>${quick.map(([label, sid]) => `<li><a href="#${sid}"><b>${label.replace(/SK-TA/g, '<span class="nb">SK-TA</span>')}</b><span>${hint(sid)}</span></a></li>`).join('')}</ul>
</div></section>`;
}

const videoSection = (role, hintText) => `<section class="section" style="padding-top:8px"><div class="wrap">
  <div class="section-head"><h2>Video tutorial</h2><p>${hintText}</p></div>
  <div class="videos videos--row" data-videos="${role}" data-carousel></div>
</div></section>`;

/* ---------- page shell ---------- */
/** `brand: 'fri'` swaps the MERCI logo for the faculty logo (the home page covers Tugas Akhir in general, incl. SOFI). */
function page({ root, file, title, description, current, body, brand = 'merci' }) {
  const headerLogo = brand === 'fri'
    ? `<a class="brand brand--fri" href="${root || './'}"><img src="${root}assets/img/fri-logo.webp" alt="Fakultas Rekayasa Industri, Telkom University" width="94" height="56"></a>`
    : `<a class="brand" href="${root || './'}"><img src="${root}assets/img/merci-logo.png" alt="MERCI-FRI" width="146" height="34"><span>Fakultas Rekayasa Industri<br>Telkom University</span></a>`;
  const footerLogo = brand === 'fri'
    ? `<img class="fri" src="${root}assets/img/fri-logo.webp" alt="Fakultas Rekayasa Industri" width="107" height="64">`
    : `<img src="${root}assets/img/merci-logo.png" alt="MERCI-FRI" width="111" height="26">`;
  const nav = [['mahasiswa/', 'Mahasiswa'], ['dosen/', 'Dosen'], ['bantuan/', 'Bantuan']]
    .map(([href, label]) => `<a href="${root}${href}"${current === href ? ' aria-current="page"' : ''}>${label}</a>`).join('');
  const html = `<!doctype html>
<html lang="id" data-root="${root}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:type" content="website">
<meta name="theme-color" content="#0b6b3a">
<link rel="icon" type="image/png" href="${root}assets/img/merci-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="${root}assets/css/site.css?v=${ver('assets/css/site.css')}">
</head>
<body>
<a class="skip-link" href="#isi">Lewati ke konten</a>
<header class="site-header"><div class="wrap">
  ${headerLogo}
  <nav class="nav" aria-label="Menu utama">${nav}</nav>
</div></header>
<main id="isi">
${body}
</main>
<footer class="site-footer"><div class="wrap">
  <div>${footerLogo}<br>&copy; ${YEAR} Fakultas Rekayasa Industri, Telkom University.<br>Tangkapan layar memakai data contoh, bukan data mahasiswa atau dosen sebenarnya.</div>
  <div>Tampilan MERCI dapat sedikit berbeda dari panduan ini seiring pembaruan.<br><a href="${root}bantuan/">Pertanyaan umum</a> &middot; <a data-onedesk-link href="#">Helpdesk OneDesk FRI</a><br><a data-merci-link href="#">MERCI (Tugas Akhir)</a> &middot; <a data-sofi-link href="#">SOFI (Sidang TA)</a> &middot; <a data-sijaki-link href="#">SIJAKI (Kerja Praktik)</a></div>
</div></footer>
<script src="${root}assets/js/config.js?v=${ver('assets/js/config.js')}"></script>
<script src="${root}assets/data/videos.js?v=${ver('assets/data/videos.js')}"></script>
<script src="${root}assets/js/site.js?v=${ver('assets/js/site.js')}" defer></script>
</body>
</html>
`;
  const dest = path.join(OUT, file);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, bake(html));
  console.log('wrote', file, Math.round(html.length / 1024) + ' KB');
}

const SOFI_LINK = '<a data-sofi-link href="#" rel="noopener">buka SOFI</a>';
const SIDANG_TA_NOTE_MHS = callout('note',
  `<b>Sidang Tugas Akhir dilaksanakan di SOFI</b>, bukan di MERCI (${SOFI_LINK}). Bagian ini untuk mahasiswa yang menempuh jalur <b>Pengganti Sidang</b> (publikasi jurnal atau konferensi), yang berjalan di MERCI. Setelah sidang dinyatakan lulus, kembali ke MERCI untuk mendaftar Yudisium.`);
const SIDANG_TA_NOTE_DOSEN = callout('note',
  `<b>Sidang Tugas Akhir diselenggarakan di SOFI</b> (${SOFI_LINK}). Bagian ini membahas <b>Pengganti Sidang</b> (publikasi jurnal atau konferensi) yang berjalan di MERCI.`);

/* ======================================================================
   HOME
   ====================================================================== */
page({
  root: '', file: 'index.html',
  title: 'Panduan Tugas Akhir FRI — tutorial untuk mahasiswa dan dosen',
  description: 'Panduan bergambar dan video Tugas Akhir Fakultas Rekayasa Industri Telkom University: SK-TA, Sidang TA di SOFI, serta Pengganti Sidang, Yudisium, SKL dan KHS di MERCI.',
  current: '',
  brand: 'fri',
  body: `
<section class="hero"><div class="wrap">
  <h1 class="typing-h1">
    <span class="sr-only">Panduan Tugas Akhir untuk mahasiswa dan dosen FRI: SK-TA, Sidang TA, Pengganti Sidang, Yudisium, SKL dan KHS</span>
    <span aria-hidden="true"><span class="t-lead">Panduan </span><span class="t-line"><span class="typed" data-typing='["Tugas Akhir","SK-TA","Sidang TA","Pengganti Sidang","Yudisium","SKL &amp; KHS"]'>Tugas Akhir</span><span class="cursor" hidden>|</span></span><span class="t-tail">untuk mahasiswa &amp; dosen FRI.</span></span>
  </h1>
  <p class="lead">Panduan bergambar dan video untuk mahasiswa tingkat akhir dan dosen: SK-TA, Sidang TA di SOFI, Pengganti Sidang, Yudisium, sampai mengunduh SKL &amp; KHS di MERCI. Terbuka untuk umum, tanpa login.</p>
  <div class="role-cards">
    <a class="role-card" href="mahasiswa/"><span class="icon">${ICON.cap}</span><h2>Saya mahasiswa</h2>
      <p>SK-TA, Pengganti Sidang, pendaftaran Yudisium, dan mengunduh SKL &amp; KHS.</p><span class="go">Buka panduan mahasiswa &rarr;</span></a>
    <a class="role-card" href="dosen/"><span class="icon">${ICON.users}</span><h2>Saya dosen</h2>
      <p>Membimbing, menyetujui pendaftaran, menilai, kelola revisi, dan dokumen sidang.</p><span class="go">Buka panduan dosen &rarr;</span></a>
  </div>
</div></section>

<section class="section"><div class="wrap">
  <div class="section-head"><h2>Tonton video pengantar</h2><p>Satu menit cukup untuk mendapat gambaran. Rincian langkahnya ada di halaman panduan.</p></div>
  <div class="videos" data-videos="all" data-featured-only></div>
</div></section>

<section class="section"><div class="wrap">
  <div class="section-head"><h2>Empat tahap bagi mahasiswa</h2><p>Alur mahasiswa dari awal sampai lulus: Sidang TA di SOFI, tahap lainnya di MERCI.</p></div>
  <ol class="stages">
    <li><b>SK-TA</b><span>Ajukan pembimbing dan Surat Keputusan Tugas Akhir, lalu pantau statusnya.</span></li>
    <li><b>Sidang TA</b><span>Dilaksanakan di SOFI. Jalur publikasi jurnal atau konferensi memakai Pengganti Sidang di MERCI.</span></li>
    <li><b>Yudisium</b><span>Unggah dokumen Kategori A&ndash;D, pilih jalur cumlaude bila memenuhi.</span></li>
    <li><b>SKL &amp; KHS</b><span>Unduh surat keterangan lulus dan kartu hasil studi setelah hasil diumumkan.</span></li>
  </ol>
</div></section>

<section class="section"><div class="wrap">
  <div class="section-head"><h2>Buka sistemnya</h2><p>Tiga sistem akademik Fakultas Rekayasa Industri.</p></div>
  <div class="role-cards three">
    <a class="role-card" data-merci-link href="#" rel="noopener"><span class="icon"><img src="assets/img/merci-icon.png" alt="" width="30" height="18"></span><h3>MERCI &middot; Tugas Akhir</h3>
      <p>SK-TA, Pengganti Sidang, Yudisium, serta SKL &amp; KHS. Panduannya ada di situs ini.</p><span class="go">Buka MERCI &rarr;</span></a>
    <a class="role-card" data-sofi-link href="#" rel="noopener"><span class="icon">${ICON.presentation}</span><h3>SOFI &middot; Sidang TA</h3>
      <p>Sidang Online Fakultas Industri: tempat Sidang Tugas Akhir dilaksanakan.</p><span class="go">Buka SOFI &rarr;</span></a>
    <a class="role-card" data-sijaki-link href="#" rel="noopener"><span class="icon">${ICON.briefcase}</span><h3>SIJAKI &middot; Kerja Praktik</h3>
      <p>Pengajuan KP, logbook, dan penilaian Kerja Praktik.</p><span class="go">Buka SIJAKI &rarr;</span></a>
  </div>
</div></section>

<section class="section"><div class="wrap">
  <div class="cta-band">
    <div><h2>Belum ketemu jawabannya?</h2><p>Lihat pertanyaan yang paling sering diajukan, atau buat tiket ke helpdesk.</p></div>
    <div style="display:flex;gap:10px;flex-wrap:wrap"><a class="btn" href="bantuan/">Pertanyaan umum</a><a class="btn" data-onedesk-link href="#">Helpdesk OneDesk FRI</a></div>
  </div>
</div></section>`,
});

/* ======================================================================
   MAHASISWA
   ====================================================================== */
const R = '../';
const mahasiswaStages = [
  {
    id: 'sk-ta', title: '1 · SK-TA', video: 'mahasiswa-tutorial-skta',
    intro: 'Mulai dari pembimbing dan Surat Keputusan Tugas Akhir. Semua pengajuan dan statusnya ada di satu halaman.',
    steps: [
      { title: 'Masuk dengan akun iGracias', text: 'Buka MERCI lalu masuk memakai username dan password iGracias Anda (SSO Telkom University). Tidak ada akun terpisah untuk dibuat.',
        shots: [['login', 'Halaman masuk MERCI dengan kolom username dan password iGracias', 'Halaman masuk MERCI.']] },
      { title: 'Lihat posisi Anda di dashboard', text: 'Dashboard menunjukkan tahap Anda saat ini (SK-TA, Sidang, Yudisium), periode berjalan, dan hal yang perlu ditindaklanjuti.',
        shots: [['dash-belumplot', 'Dashboard mahasiswa yang menunjukkan tahap SK-TA sedang diproses', 'Dashboard: tahap SK-TA dan ringkasan akademik.']] },
      { title: 'Belum punya pembimbing? Ajukan dulu', text: 'Mahasiswa yang belum diplot membuka <b>Pengajuan Pembimbing</b>, memilih Kelompok Keahlian dan Peminatan, lalu mengunggah berkas dalam <b>satu PDF</b> (maksimal 2&nbsp;MB). Bila calon pembimbing dari luar kampus, sertakan juga form <b>Biodata Pembimbing</b> dalam PDF yang sama. Admin yang menetapkan pembimbingnya.',
        shots: [['skta-belumplot', 'Halaman Pengajuan Pembimbing untuk mahasiswa yang belum punya pembimbing', 'Pengajuan Pembimbing.']] },
      { title: 'Ajukan SK-TA', text: 'Setelah pembimbing ditetapkan, ajukan SK-TA: pilih jenis permohonan, unduh template berkas bila tersedia, unggah satu PDF berisi dokumen yang diminta, dan isi nomor WhatsApp aktif (diawali <b>08</b> atau <b>628</b>).',
        shots: [['skta-index', 'Halaman Permohonan SK-TA berisi data pembimbing dan tata cara pengajuan', 'Permohonan SK-TA.']] },
      { title: 'Pantau statusnya sampai terbit', text: 'Status bergerak dari <b>Menunggu Review</b>, <b>Sedang Diproses</b>, lalu <b>Disetujui</b>. Setelah admin memprosesnya di iGracias, tekan <b>Refresh Data</b>: SK-TA yang sudah aktif di iGracias otomatis tercatat di MERCI.',
        shots: [['dash-skta-diproses', 'Dashboard dengan kartu SK-TA berstatus Sedang Diproses', 'SK-TA sedang diproses.'], ['dash-skta-aktif', 'Dashboard setelah SK-TA aktif', 'SK-TA sudah aktif, tahap Sidang terbuka.']] },
    ],
  },
  {
    id: 'pengganti-sidang', title: '2 · Sidang TA &amp; Pengganti Sidang',
    intro: 'Pengganti Sidang adalah jalur bagi mahasiswa yang memenuhi ketentuan publikasi jurnal atau konferensi.',
    note: SIDANG_TA_NOTE_MHS,
    steps: [
      { title: 'Daftar pada periode yang dibuka', text: 'Buka <b>Pengganti Sidang</b>, pilih jenis publikasi (jurnal atau konferensi), isi datanya, dan unggah dokumen yang diminta. Berkas berformat PDF, JPG, atau PNG maksimal 5&nbsp;MB; dokumen tertentu, seperti rekaman, berupa link Google Drive.',
        shots: [['subdefense-create', 'Formulir pendaftaran Pengganti Sidang', 'Formulir pendaftaran.']] },
      { title: 'Pantau verifikasi, jadwal, dan penilaian', text: 'Halaman detail menampilkan tahapan pendaftaran Anda, tim penilai beserta status penilaiannya, dan jadwal. Nilai individual penilai tidak ditampilkan kepada mahasiswa.',
        shots: [['subdefense-show', 'Halaman detail Pengganti Sidang dengan tahapan dan tim penilai', 'Detail pendaftaran dan tim penilai.'], ['dash-pengganti', 'Dashboard saat Pengganti Sidang sedang berjalan', 'Dashboard saat tahap Sidang berjalan.']] },
      { title: 'Selesaikan revisi', text: 'Bila ada catatan revisi, unggah <b>satu berkas perbaikan</b> di halaman utama lalu balas setiap butir revisi dengan penjelasan singkat. Balasan untuk catatan seorang dosen dibuka begitu dosen itu mengirim nilainya.',
        shots: [['subdefense-revisi', 'Tab Revisi pada halaman Pengganti Sidang', 'Revisi dan balasan.']] },
    ],
  },
  {
    id: 'yudisium', title: '3 · Yudisium', video: 'mahasiswa-tutorial-yudisium',
    intro: 'Daftar Yudisium setelah sidang dinyatakan lulus dan seluruh revisi selesai.',
    note: callout('note', '<b>Syarat:</b> periode Yudisium dibuka, sidang dinyatakan lulus, dan seluruh revisi selesai.'),
    steps: [
      { title: 'Cek status pendaftaran', text: 'Dashboard menampilkan apakah pendaftaran Yudisium sudah bisa dibuka beserta batas waktunya.',
        shots: [['dash-yud-draft', 'Dashboard dengan tahap Yudisium berstatus draft', 'Tahap Yudisium di dashboard.']] },
      { title: 'Lengkapi dokumen di Pusat Unggah Dokumen', text: 'Dokumen dibagi per kategori: <b>A</b> identitas, <b>B</b> tugas akhir, <b>C</b> revisi dan administrasi, <b>D</b> cumlaude. Setiap jenis dokumen menampilkan format dan ukuran maksimal yang berlaku.',
        shots: [['documents-draft', 'Pusat Unggah Dokumen dengan kategori A sampai D', 'Pusat Unggah Dokumen.']] },
      { title: 'Pilih jalur cumlaude bila memenuhi', text: 'Mahasiswa yang memenuhi syarat memilih jalur <b>Publikasi</b>, <b>Lomba</b>, atau <b>HKI</b> di Kategori D. Bila tidak, pilih tanpa cumlaude.',
        shots: [['documents-kat-d', 'Pilihan jalur cumlaude pada Kategori D', 'Pilihan jalur cumlaude.']] },
      { title: 'Kirim pendaftaran dan ikuti verifikasi', text: 'Setelah semua dokumen wajib lengkap, kirim pendaftaran. Admin memverifikasi dokumen; dokumen yang ditolak diperbaiki dan diunggah ulang dari halaman yang sama.',
        shots: [['documents-verifikasi', 'Pusat Unggah Dokumen saat dokumen diverifikasi', 'Dokumen sedang diverifikasi.'], ['dash-yud-verifikasi', 'Dashboard yang menandai tindakan perbaikan dokumen', 'Dashboard menandai dokumen yang perlu diperbaiki.']] },
      { title: 'Tunggu sesi dan pengumuman hasil', text: 'Setelah verifikasi selesai, pendaftaran masuk sesi Yudisium. Hasil dan predikat baru tampil setelah admin mengumumkannya.',
        shots: [['dash-yud-sesi', 'Dashboard saat menunggu sesi Yudisium', 'Menunggu sesi Yudisium.']] },
    ],
  },
  {
    id: 'skl-khs', title: '4 · SKL &amp; KHS',
    intro: 'Dokumen kelulusan tersedia setelah hasil Yudisium Anda diumumkan.',
    note: callout('note', '<b>Syarat:</b> sesi Yudisium selesai dan hasil Anda sudah diumumkan.'),
    steps: [
      { title: 'Lihat hasil Anda', text: 'Dashboard dan Pusat Notifikasi memberi tahu begitu hasil diumumkan.',
        shots: [['dash-lulus', 'Dashboard setelah hasil Yudisium diumumkan', 'Dashboard setelah hasil diumumkan.'], ['notifications-lulus', 'Pusat Notifikasi berisi pemberitahuan hasil', 'Pusat Notifikasi.']] },
      { title: 'Unduh SKL dan KHS', text: 'Buka <b>Unduh SKL &amp; KHS</b>, lalu unduh Surat Keterangan Lulus dan Kartu Hasil Studi.',
        shots: [['finaldocs-lulus', 'Halaman Unduh SKL dan KHS', 'Unduh SKL dan KHS.']] },
    ],
  },
  {
    id: 'data-diri', title: 'Data diri &amp; bantuan',
    intro: 'Profil akademik dan petunjuk di dalam aplikasi.',
    steps: [
      { title: 'Periksa data akademik', text: 'Profil menampilkan IPK, SKS, EPrT, dan TAK dari SOFI/iGracias. Bila ada data pribadi yang keliru (NIK, nama, tanggal lahir), ajukan koreksi; admin yang memprosesnya, perubahan tidak tersimpan langsung.',
        shots: [['profile-draft', 'Halaman Profil Saya berisi data akademik', 'Profil dan data akademik.']] },
      { title: 'Buka Panduan Pengguna di dalam MERCI', text: 'Menu <b>Panduan Pengguna</b> memuat daftar semua fitur, pencarian, dan syarat tiap langkah, selalu sesuai versi terbaru aplikasi.',
        shots: [['guide-mhs', 'Halaman Panduan Pengguna untuk mahasiswa', 'Panduan Pengguna di dalam MERCI.']] },
    ],
  },
];

/** Extra search words per step id (synonyms and the words a student would actually type). */
const mahasiswaKeywords = {
  'sk-ta-1': 'login masuk akun sso igracias username password',
  'sk-ta-2': 'dashboard beranda tahap status periode',
  'sk-ta-3': 'pembimbing dosen pembimbing belum punya belum diplot plotting kelompok keahlian peminatan luar kampus eksternal biodata',
  'sk-ta-4': 'sk ta surat keputusan tugas akhir ajukan pengajuan permohonan whatsapp wa template pdf unggah upload',
  'sk-ta-5': 'status refresh data igracias disetujui menunggu review diproses terbit sk aktif',
  'pengganti-sidang-1': 'daftar pendaftaran jurnal konferensi publikasi sidang pengganti periode unggah dokumen link google drive sidang ta',
  'pengganti-sidang-2': 'verifikasi jadwal penilaian tim penilai penguji status nilai',
  'pengganti-sidang-3': 'revisi perbaikan catatan balas berkas perbaikan unggah revisi',
  'yudisium-1': 'cek status syarat pendaftaran yudisium dibuka periode batas waktu',
  'yudisium-2': 'dokumen unggah upload kategori a b c d berkas pusat unggah dokumen persyaratan',
  'yudisium-3': 'cumlaude jalur publikasi lomba hki predikat kategori d',
  'yudisium-4': 'kirim submit pendaftaran verifikasi admin dokumen ditolak perbaikan unggah ulang',
  'yudisium-5': 'sesi yudisium pengumuman hasil predikat tunggu',
  'skl-khs-1': 'hasil lulus diumumkan notifikasi dashboard',
  'skl-khs-2': 'unduh download skl khs surat keterangan lulus kartu hasil studi',
  'data-diri-1': 'profil data akademik ipk sks eprt tak nik nama tanggal lahir koreksi data salah',
  'data-diri-2': 'panduan pengguna bantuan fitur',
};
const mahasiswaQuick = [
  ['Belum punya pembimbing', 'sk-ta-3'],
  ['Mengajukan SK-TA', 'sk-ta-4'],
  ['Mengecek status SK-TA', 'sk-ta-5'],
  ['Mendaftar Pengganti Sidang', 'pengganti-sidang-1'],
  ['Membalas catatan revisi', 'pengganti-sidang-3'],
  ['Mengunggah dokumen Yudisium', 'yudisium-2'],
  ['Memilih jalur cumlaude', 'yudisium-3'],
  ['Mengunduh SKL dan KHS', 'skl-khs-2'],
];

page({
  root: R, file: 'mahasiswa/index.html',
  title: 'Panduan Mahasiswa — MERCI-FRI',
  description: 'Panduan langkah demi langkah untuk mahasiswa: SK-TA, Pengganti Sidang, pendaftaran Yudisium, dan mengunduh SKL & KHS di MERCI-FRI.',
  current: 'mahasiswa/',
  body: `
<section class="hero" style="text-align:left;padding-bottom:8px"><div class="wrap">
  <span class="eyebrow">Panduan mahasiswa</span>
  <h1>Dari SK-TA sampai <em style="font-style:normal;color:var(--brand)">SKL</em>.</h1>
  <p class="lead" style="margin-left:0">Ikuti empat tahap berurutan. Klik gambar mana pun untuk memperbesarnya.</p>
  <a class="btn" style="background:var(--brand);color:#fff" data-merci-link href="#"><span class="chip"><img src="${R}assets/img/merci-icon.png" alt="" width="20" height="12"></span>Buka MERCI</a>
</div></section>
${finder(mahasiswaStages, mahasiswaQuick)}
${videoSection('mahasiswa', 'Geser ke kanan untuk melihat video lainnya.')}
<div class="wrap"><div class="layout">
  <aside class="toc" aria-label="Isi halaman"><h2>Isi halaman</h2><ol>${mahasiswaStages.map((s) => `<li><a href="#${s.id}">${s.title}</a></li>`).join('')}</ol></aside>
  <div>${mahasiswaStages.map((s) => stage(R, s, mahasiswaKeywords)).join('')}</div>
</div></div>`,
});

/* ======================================================================
   DOSEN
   ====================================================================== */
const dosenStages = [
  {
    id: 'ringkasan', title: 'Dashboard &amp; mahasiswa bimbingan',
    intro: 'Mulai dari ringkasan tugas, lalu pantau tiap mahasiswa bimbingan dari satu daftar.',
    steps: [
      { title: 'Baca ringkasan tugas', text: 'Dashboard menampilkan persetujuan yang tertunda, sidang mendatang, dan nilai yang belum masuk.',
        shots: [['lec-dashboard', 'Dashboard dosen berisi tugas yang menunggu', 'Dashboard dosen.']] },
      { title: 'Pantau mahasiswa bimbingan', text: 'Daftar bimbingan menunjukkan tahap tiap mahasiswa, dari SK-TA sampai Yudisium. Buka satu mahasiswa untuk melihat berkas yang mereka unggah di tiap tahap.',
        shots: [['lec-advisees', 'Daftar mahasiswa bimbingan beserta tahapnya', 'Daftar mahasiswa bimbingan.'], ['lec-advisee-detail', 'Detail satu mahasiswa bimbingan', 'Detail mahasiswa bimbingan.']] },
    ],
  },
  {
    id: 'persetujuan', title: 'Persetujuan Pembimbing 2',
    intro: 'Pendaftaran yang menunggu persetujuan Anda sebagai Pembimbing 2.',
    steps: [
      { title: 'Setujui atau tolak pendaftaran', text: 'Buka <b>Persetujuan Pembimbing 2</b>. Setujui, atau tolak dengan alasan yang akan terbaca mahasiswa. Halaman ini hanya menampilkan mahasiswa yang Anda bimbing sebagai Pembimbing 2.',
        shots: [['lec-approvals', 'Halaman Persetujuan Pembimbing 2', 'Persetujuan Pembimbing 2.']] },
    ],
  },
  {
    id: 'pengganti-sidang', title: 'Menilai Pengganti Sidang &amp; revisi',
    intro: 'Isi rubrik penilaian, tulis butir revisi, lalu tutup revisi setelah perbaikan memadai.',
    note: SIDANG_TA_NOTE_DOSEN,
    steps: [
      { title: 'Buka daftar Pengganti Sidang', text: 'Daftar menampilkan pendaftaran yang Anda bimbing atau uji beserta tahapnya.',
        shots: [['lec-subdefense-index', 'Daftar Pengganti Sidang untuk dosen', 'Daftar Pengganti Sidang.']] },
      { title: 'Nilai dan tulis revisi', text: 'Isi rubrik penilaian lalu kirim nilai. Tambahkan butir revisi bila perlu, baca balasan dan berkas perbaikan mahasiswa, dan tandai tiap butir selesai atau ditolak. Selama ada butir revisi terbuka, mahasiswa belum dapat mendaftar Yudisium. Penguji Ketua dapat memperpanjang tenggat.',
        shots: [['lec-subdefense-grade', 'Halaman penilaian Pengganti Sidang berisi tim penilai dan rubrik', 'Penilaian dan revisi.']] },
    ],
  },
  {
    id: 'dokumen', title: 'Dokumen sidang',
    intro: 'Unduh dokumen untuk mahasiswa yang Anda bimbing atau uji.',
    steps: [
      { title: 'Unduh Nota Dinas, Berita Acara, dan Lembar Nilai', text: 'Menu <b>Dokumen Sidang</b> memuat daftar per mahasiswa. Dokumen yang belum tersedia tetap terlihat bersama alasannya, sehingga Anda tahu apa yang ditunggu.',
        shots: [['lec-docs', 'Halaman Dokumen Sidang untuk dosen', 'Dokumen Sidang.'], ['lec-docs-pengganti', 'Dokumen Sidang untuk mahasiswa Pengganti Sidang', 'Dokumen untuk Pengganti Sidang.']] },
    ],
  },
  {
    id: 'penjadwalan', title: 'Penjadwalan (khusus scheduler KK)',
    intro: 'Hanya tersedia bagi dosen yang ditandai Admin KK sebagai scheduler.',
    steps: [
      { title: 'Susun jadwal dan panel penilai Pengganti Sidang', text: 'Tentukan tanggal, ruang, dan panel penilai untuk mahasiswa Pengganti Sidang di KK Anda, lalu simpan agar mahasiswa dan dosen menerima pemberitahuan.',
        shots: [['lec-scheduler-index', 'Daftar penjadwalan untuk scheduler KK', 'Penjadwalan.'], ['lec-sched-sub-show', 'Halaman penjadwalan satu Pengganti Sidang', 'Menjadwalkan Pengganti Sidang.']] },
    ],
  },
  {
    id: 'profil', title: 'Profil &amp; bantuan',
    intro: 'Nomor WhatsApp dan panduan di dalam aplikasi.',
    steps: [
      { title: 'Lengkapi profil', text: 'Isi nomor WhatsApp pada <b>Profil Saya</b> agar mahasiswa dan admin dapat menghubungi Anda saat revisi.',
        shots: [['lec-profile', 'Halaman Profil Saya dosen', 'Profil dosen.']] },
      { title: 'Buka Panduan Pengguna', text: 'Menu <b>Panduan Pengguna</b> memuat seluruh fitur untuk dosen beserta syarat tiap langkah.',
        shots: [['lec-guide', 'Halaman Panduan Pengguna untuk dosen', 'Panduan Pengguna di dalam MERCI.']] },
    ],
  },
];

const dosenKeywords = {
  'ringkasan-1': 'dashboard tugas ringkasan persetujuan sidang nilai belum masuk',
  'ringkasan-2': 'mahasiswa bimbingan daftar pantau tahap berkas advisee',
  'persetujuan-1': 'persetujuan pembimbing 2 setujui tolak approve pendaftaran',
  'pengganti-sidang-1': 'daftar pengganti sidang jurnal konferensi publikasi',
  'pengganti-sidang-2': 'nilai penilaian rubrik revisi butir tutup selesai tenggat perpanjang penguji ketua',
  'dokumen-1': 'dokumen sidang nota dinas berita acara bap lembar nilai unduh download',
  'penjadwalan-1': 'jadwal penjadwalan scheduler kk panel penilai ruang tanggal',
  'profil-1': 'profil whatsapp nomor wa kontak',
  'profil-2': 'panduan pengguna bantuan fitur',
};
const dosenQuick = [
  ['Menyetujui Pembimbing 2', 'persetujuan-1'],
  ['Menilai dan menulis revisi', 'pengganti-sidang-2'],
  ['Memantau mahasiswa bimbingan', 'ringkasan-2'],
  ['Mengunduh dokumen sidang', 'dokumen-1'],
  ['Menyusun jadwal (scheduler KK)', 'penjadwalan-1'],
  ['Melengkapi profil dan WhatsApp', 'profil-1'],
];

page({
  root: R, file: 'dosen/index.html',
  title: 'Panduan Dosen — MERCI-FRI',
  description: 'Panduan untuk dosen: membimbing, menyetujui pendaftaran, menilai Pengganti Sidang, mengelola revisi, mengunduh dokumen sidang, dan menjadwalkan di MERCI-FRI.',
  current: 'dosen/',
  body: `
<section class="hero" style="text-align:left;padding-bottom:8px"><div class="wrap">
  <span class="eyebrow">Panduan dosen</span>
  <h1>Bimbingan TA kini <em style="font-style:normal;color:var(--brand)">ringkas</em>.</h1>
  <p class="lead" style="margin-left:0">Dari menyetujui pendaftaran sampai menutup revisi. Klik gambar mana pun untuk memperbesarnya.</p>
  <a class="btn" style="background:var(--brand);color:#fff" data-merci-link href="#"><span class="chip"><img src="${R}assets/img/merci-icon.png" alt="" width="20" height="12"></span>Buka MERCI</a>
</div></section>
${finder(dosenStages, dosenQuick)}
${videoSection('dosen', 'Tonton video pengantar untuk dosen.')}
<div class="wrap"><div class="layout">
  <aside class="toc" aria-label="Isi halaman"><h2>Isi halaman</h2><ol>${dosenStages.map((s) => `<li><a href="#${s.id}">${s.title}</a></li>`).join('')}</ol></aside>
  <div>${dosenStages.map((s) => stage(R, s, dosenKeywords)).join('')}</div>
</div></div>`,
});

/* ======================================================================
   BANTUAN / FAQ
   ====================================================================== */
const faq = [
  ['Saya tidak bisa masuk ke MERCI.', '<p>Masuk memakai username dan password <b>iGracias</b> Anda. Bila muncul pesan bahwa akun sudah tercatat tetapi belum punya hak akses, hubungi Administrator Fakultas untuk meminta akses; MERCI khusus civitas Fakultas Rekayasa Industri.</p>'],
  ['Format dan ukuran berkas apa yang diterima?', '<ul><li><b>SK-TA:</b> satu berkas PDF, maksimal 2&nbsp;MB.</li><li><b>Pengganti Sidang:</b> PDF, JPG, atau PNG, maksimal 5&nbsp;MB per berkas; dokumen tertentu berupa link Google Drive.</li><li><b>Yudisium:</b> PDF, JPG, atau PNG; batas ukuran tiap jenis dokumen tertera di halaman unggah.</li></ul>'],
  ['Nomor WhatsApp saya ditolak.', '<p>Gunakan nomor HP Indonesia yang diawali <b>08</b> atau <b>628</b>, misalnya 0812-3456-7890. Telepon rumah dan nomor luar negeri tidak diterima.</p>'],
  ['SK-TA saya masih &ldquo;Sedang Diproses&rdquo;.', '<p>Admin sedang memprosesnya di iGracias. Setelah SK-TA aktif di iGracias, tekan <b>Refresh Data</b> di halaman SK-TA; MERCI mencatat dan menyetujuinya otomatis. Bila belum berubah setelah beberapa hari, buat tiket ke helpdesk.</p>'],
  ['Pembimbing saya dari luar kampus. Bagaimana mengajukannya?', '<p>Ajukan lewat <b>Pengajuan Pembimbing</b> dan sertakan form <b>Biodata Pembimbing</b> dalam satu PDF yang sama dengan form pengajuan.</p>'],
  ['Di mana saya mendaftar Sidang Tugas Akhir?', '<p>Sidang Tugas Akhir dilaksanakan di <b>SOFI</b> (<a data-sofi-link href="#" rel="noopener">buka SOFI</a>). Tahap lainnya — SK-TA, Pengganti Sidang, Yudisium, serta SKL &amp; KHS — ada di <b>MERCI</b> (<a data-merci-link href="#" rel="noopener">buka MERCI</a>).</p>'],
  ['Kenapa pendaftaran Yudisium saya belum terbuka?', '<p>Pendaftaran terbuka bila periode Yudisium dibuka, sidang dinyatakan lulus, dan seluruh revisi selesai. Dashboard menampilkan alasan yang menghalangi bila ada.</p>'],
  ['Data akademik atau data pribadi saya keliru.', '<p>IPK, SKS, EPrT, dan TAK berasal dari SOFI/iGracias. Untuk NIK, nama, atau tanggal lahir yang keliru, ajukan koreksi di <b>Profil Saya</b>; admin memprosesnya, perubahan tidak tersimpan langsung.</p>'],
  ['Saya tidak melihat nilai penilai satu per satu.', '<p>Memang begitu: mahasiswa melihat nama tim penilai dan statusnya, tidak pernah nilai tiap penilai.</p>'],
];

page({
  root: R, file: 'bantuan/index.html',
  title: 'Bantuan dan pertanyaan umum — MERCI-FRI',
  description: 'Jawaban atas pertanyaan yang sering diajukan tentang MERCI-FRI, dan cara menghubungi helpdesk OneDesk FRI.',
  current: 'bantuan/',
  body: `
<section class="hero" style="text-align:left;padding-bottom:8px"><div class="wrap">
  <span class="eyebrow">Bantuan</span>
  <h1>Pertanyaan yang <em style="font-style:normal;color:var(--brand)">sering</em> diajukan.</h1>
  <p class="lead" style="margin-left:0">Jawaban singkat untuk kendala yang paling umum.</p>
</div></section>
<section class="section" style="padding-top:8px"><div class="wrap" style="max-width:820px">
  <div class="faq">${faq.map(([q, a]) => `<details><summary>${q}</summary>${a}</details>`).join('')}</div>
</div></section>
<section class="section"><div class="wrap">
  <div class="cta-band"><div><h2>Masih buntu?</h2><p>Buat tiket di helpdesk OneDesk FRI dan sebutkan NIM atau kode dosen, tahap yang bermasalah, serta pesan yang muncul.</p></div>
  <a class="btn" data-onedesk-link href="#">Buka OneDesk FRI</a></div>
</div></section>`,
});

/* ======================================================================
   404 (root-absolute paths: nginx serves it from any URL)
   ====================================================================== */
page({
  root: '/', file: '404.html',
  title: 'Halaman tidak ditemukan — MERCI-FRI',
  description: 'Halaman yang Anda cari tidak ada di situs panduan MERCI-FRI.',
  current: '',
  body: `
<section class="hero"><div class="wrap">
  <span class="eyebrow">Kesalahan 404</span>
  <h1>Halaman ini <em>tidak ditemukan</em>.</h1>
  <p class="lead">Alamatnya mungkin salah ketik atau halamannya sudah dipindah. Pilih panduan yang Anda butuhkan.</p>
  <div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center">
    <a class="btn" style="background:var(--brand);color:#fff" href="/mahasiswa/">Panduan mahasiswa</a>
    <a class="btn" style="background:var(--brand);color:#fff" href="/dosen/">Panduan dosen</a>
    <a class="btn" style="background:var(--brand);color:#fff" href="/">Beranda</a>
  </div>
</div></section>`,
});
