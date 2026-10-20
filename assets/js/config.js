/*
 * Site settings, read by tools/build.cjs (baked into the HTML) and by site.js. An empty address hides every
 * button that points to it, so a system that is not live yet never gets a dead link.
 * `merciUrl` is the live MERCI application (Tugas Akhir), `sofiUrl` is SOFI (Sidang Online Fakultas Industri)
 * and `sijakiUrl` is SIJAKI (Kerja Praktik).
 */
window.SITE = {
  merciUrl: 'https://merci.virtualfri.id',
  sofiUrl: 'https://sofi.virtualfri.id',
  sijakiUrl: 'https://sijaki.virtualfri.id',
  onedeskUrl: 'https://bit.ly/OneDeskFRI',
};
