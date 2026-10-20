# Situs Panduan MERCI-FRI (fri-dev.cloud)

Situs statis tanpa login: HTML, CSS, dan sedikit JavaScript. Tidak ada PHP, database, atau proses build di server — cukup folder berisi file yang disajikan nginx. Situs ini **terpisah dari repo MERCI**: tidak perlu `git push` ke `origin`/`org`, dan tidak ikut deploy MERCI.

## Isi folder

| Path | Fungsi |
|------|--------|
| `index.html`, `mahasiswa/`, `dosen/`, `bantuan/`, `404.html` | Halaman (hasil generator, ini yang diunggah) |
| `assets/` | CSS, JS, logo, tangkapan layar (`.webp`), poster video |
| `videos/` | File video `.mp4` |
| `assets/data/videos.js` | Daftar video — **edit ini untuk menambah/mengganti video** |
| `assets/js/config.js` | Pengaturan: alamat MERCI (`merciUrl`) dan helpdesk |
| `tools/build.cjs` | Generator halaman (teks panduan ada di sini) |
| `tools/optimize-shots.cjs` | Konversi tangkapan layar PNG ke WebP |
| `tools/import-tata-cara.cjs`, `tools/tata-cara.config.cjs` | Impor 11 panduan terperinci (teks, PDF, gambar) dan daftar panduannya |
| `content/tata-cara/` | Teks panduan terperinci (`.md`) dan ukuran gambarnya (`images.json`) |
| `assets/pdf/` | PDF tiap panduan terperinci (untuk diunduh) |
| `deploy/nginx-fri-dev.cloud.conf` | Server block nginx |

## Sekali saja di VPS

```bash
sudo mkdir -p /var/www/fri-dev.cloud
sudo chown -R $USER:$USER /var/www/fri-dev.cloud        # agar bisa diunggah tanpa sudo
sudo cp deploy/nginx-fri-dev.cloud.conf /etc/nginx/sites-available/fri-dev.cloud
sudo ln -s /etc/nginx/sites-available/fri-dev.cloud /etc/nginx/sites-enabled/fri-dev.cloud
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d fri-dev.cloud   # HTTPS untuk domain utama
```

Per 2026-10-20 `fri-dev.cloud` dan `merci.fri-dev.cloud` sudah mengarah ke VPS yang sama, tetapi `www.fri-dev.cloud` **belum punya record DNS**. Tambahkan A/CNAME untuk `www` dulu, baru jalankan `certbot --nginx -d fri-dev.cloud -d www.fri-dev.cloud`; bila tidak, certbot gagal untuk nama `www`.

Jika `fri-dev.cloud` sudah punya server block lain (halaman default, redirect, dsb.), ganti/disable dulu agar tidak bentrok — `sudo nginx -T | grep -n "server_name"` menunjukkan siapa yang memakai nama itu.

## Unggah / perbarui (tiap kali ada perubahan)

Dari folder situs ini, di komputer lokal (Git Bash/WSL dengan `ssh`, `tar`, `sha256sum`, dan kunci SSH ke VPS):

```bash
DRY=1 bash deploy/publish.sh     # lihat dulu apa yang akan diunggah, tanpa mengubah apa pun
bash deploy/publish.sh           # build ulang halaman, lalu unggah hanya file yang isinya berbeda
```

Skrip membandingkan checksum file lokal dengan yang ada di VPS, jadi video yang tidak berubah tidak dikirim ulang (koneksi unggah ke VPS lambat). File yang sudah dihapus lokal hanya didaftar, tidak dihapus di server. `HOST`, `KEY`, dan `DEST` bisa diganti lewat environment.

Tanpa skrip: `scp -r index.html 404.html mahasiswa dosen bantuan assets videos USER@IP_VPS:/var/www/fri-dev.cloud/`.

Tidak perlu restart nginx. Tekan Ctrl+F5 di browser bila perubahan CSS/JS belum terlihat (cache aset 1 hari).

## Mengubah isi

- **Teks panduan / urutan langkah:** edit `tools/build.cjs`, lalu `node tools/build.cjs` (hanya perlu Node, tanpa paket tambahan) — halaman ter-generate ulang.
- **Menambah video:** salin `.mp4` (H.264 + AAC, di bawah ~100 MB) ke `videos/`, tambahkan/ubah entri di `assets/data/videos.js`. Entri dengan `file: null` tampil sebagai kartu "Segera hadir". Poster opsional di `assets/img/posters/`.
- **Tombol "Buka MERCI":** isi `merciUrl` di `assets/js/config.js` setelah alamat produksi final. Selama kosong, tombolnya otomatis disembunyikan.
- **Tangkapan layar baru:** letakkan PNG, jalankan `tools/optimize-shots.cjs` (butuh paket `sharp`), daftarkan nama dan ukurannya di `SHOT` pada `tools/build.cjs`.
- **Tata cara (panduan terperinci mahasiswa, 11 halaman di `mahasiswa/tata-cara/`):** sumbernya folder mentah dari tim (`panduan_skta_mahasiswa/`, `panduan_pengganti_sidang_mahasiswa/`, `panduan_yudisium_mahasiswa/`, masing-masing berisi `.md`, `.pdf`, dan gambar; tidak ikut di-commit). Untuk menambah/memperbarui: taruh folder/berkasnya di root situs, daftarkan panduan baru di `tools/tata-cara.config.cjs` (slug, judul, ringkasan, kata kunci pencarian), lalu `node tools/import-tata-cara.cjs` (menyalin teks ke `content/tata-cara/`, PDF ke `assets/pdf/`, dan mengonversi gambar ke `assets/img/tata-cara/`), `node tools/build.cjs`, dan `bash deploy/publish.sh`. Format `.md` yang dipahami: judul `#`, baris `**Untuk:**` dan `**Alur:**`, kutipan `>`, daftar dokumen, `### Langkah N` + gambar, dan catatan penutup.

## Catatan

- Tangkapan layar memakai data contoh/seeder lokal MERCI, bukan data mahasiswa atau dosen sebenarnya.
- Font Poppins dimuat dari Google Fonts; tanpa itu situs tetap terbaca dengan font sistem.
- Halaman tidak menyetel cookie dan tidak memakai pelacak.
