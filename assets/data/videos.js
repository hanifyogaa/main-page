/*
 * The tutorial videos. To add one: copy the .mp4 into /videos, add (or edit) an entry below, upload both.
 * A page shows the entries whose `role` matches it; `featured: true` ones also appear on the home page.
 * An entry with `file: null` renders as a "Segera hadir" placeholder card, so a planned video can be announced.
 *
 * Keep each file under ~100 MB and encode as H.264 + AAC (.mp4) so every browser plays it.
 */
window.TUTORIAL_VIDEOS = [
  {
    id: 'mahasiswa-pengenalan',
    role: 'mahasiswa',
    featured: true,
    title: 'Pengenalan MERCI untuk Mahasiswa',
    description: 'Gambaran alur dari SK-TA, Pengganti Sidang, Yudisium, sampai mengunduh SKL & KHS.',
    duration: '1:18',
    file: 'videos/mahasiswa-pengenalan.mp4',
    poster: 'assets/img/posters/mahasiswa-pengenalan.webp',
  },
  {
    id: 'dosen-pengenalan',
    role: 'dosen',
    featured: true,
    title: 'Pengenalan MERCI untuk Dosen',
    description: 'Membimbing, menilai Pengganti Sidang, penjadwalan KK, dan mengunduh dokumen.',
    duration: '0:58',
    file: 'videos/dosen-pengenalan.mp4',
    poster: 'assets/img/posters/dosen-pengenalan.webp',
  },
  {
    id: 'mahasiswa-tutorial-skta',
    role: 'mahasiswa',
    title: 'Tutorial SK-TA langkah demi langkah',
    description: 'Mengajukan pembimbing dan SK-TA, mengisi berkas, sampai SK terbit.',
    file: null,
  },
  {
    id: 'mahasiswa-tutorial-yudisium',
    role: 'mahasiswa',
    title: 'Tutorial pendaftaran Yudisium',
    description: 'Mengunggah dokumen Kategori A–D dan memilih jalur cumlaude.',
    file: null,
  },
];
