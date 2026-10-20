/* Progressive enhancement only: every page is readable without this file. */
(function () {
  'use strict';

  var root = document.documentElement.getAttribute('data-root') || '';
  var cfg = window.SITE || {};

  /* Links that depend on settings in config.js. */
  document.querySelectorAll('[data-merci-link]').forEach(function (el) {
    if (cfg.merciUrl) { el.setAttribute('href', cfg.merciUrl); } else { el.hidden = true; }
  });
  document.querySelectorAll('[data-sofi-link]').forEach(function (el) {
    if (cfg.sofiUrl) { el.setAttribute('href', cfg.sofiUrl); } else { el.hidden = true; }
  });
  document.querySelectorAll('[data-sijaki-link]').forEach(function (el) {
    if (cfg.sijakiUrl) { el.setAttribute('href', cfg.sijakiUrl); } else { el.hidden = true; }
  });
  document.querySelectorAll('[data-onedesk-link]').forEach(function (el) {
    if (cfg.onedeskUrl) { el.setAttribute('href', cfg.onedeskUrl); } else { el.hidden = true; }
  });

  /* Video cards, built from assets/data/videos.js. */
  document.querySelectorAll('[data-videos]').forEach(function (host) {
    var role = host.getAttribute('data-videos');
    var featuredOnly = host.hasAttribute('data-featured-only');
    var list = (window.TUTORIAL_VIDEOS || []).filter(function (v) {
      return (role === 'all' || v.role === role) && (!featuredOnly || v.featured);
    });

    list.forEach(function (v) {
      var card = document.createElement('article');
      card.className = 'video-card' + (v.file ? '' : ' soon');

      if (v.file) {
        var video = document.createElement('video');
        video.controls = true;
        video.preload = 'metadata';
        video.playsInline = true;
        video.setAttribute('aria-label', v.title);
        if (v.poster) { video.poster = root + v.poster; }
        var src = document.createElement('source');
        src.src = root + v.file;
        src.type = 'video/mp4';
        video.appendChild(src);
        video.appendChild(document.createTextNode('Peramban Anda tidak mendukung pemutar video.'));
        card.appendChild(video);
      }

      var meta = document.createElement('div');
      meta.className = 'meta';
      var badge = document.createElement('span');
      badge.className = 'badge';
      badge.textContent = v.file ? (v.duration ? 'Video · ' + v.duration : 'Video') : 'Segera hadir';
      var h = document.createElement('h3');
      h.textContent = v.title;
      var p = document.createElement('p');
      p.textContent = v.description || '';
      meta.appendChild(badge);
      meta.appendChild(h);
      meta.appendChild(p);
      card.appendChild(meta);
      host.appendChild(card);
    });

    if (!list.length) { host.hidden = true; }
  });

  /* Screenshot lightbox. */
  var dialog = document.createElement('dialog');
  dialog.className = 'lightbox';
  dialog.setAttribute('aria-label', 'Tangkapan layar diperbesar');
  dialog.innerHTML = '<div class="frame"><button type="button" aria-label="Tutup">Tutup</button><img alt=""></div>';
  document.body.appendChild(dialog);
  var bigImg = dialog.querySelector('img');
  dialog.querySelector('button').addEventListener('click', function () { dialog.close(); });
  dialog.addEventListener('click', function (e) { if (e.target === dialog) { dialog.close(); } });

  document.querySelectorAll('figure.shot button').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var img = btn.querySelector('img');
      bigImg.src = img.currentSrc || img.src;
      bigImg.alt = img.alt;
      if (typeof dialog.showModal === 'function') { dialog.showModal(); }
    });
  });

  /* Highlight the contents entry of the section being read. */
  var links = document.querySelectorAll('.toc a[href^="#"]');
  if (links.length && 'IntersectionObserver' in window) {
    var byId = {};
    links.forEach(function (a) { byId[a.getAttribute('href').slice(1)] = a; });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && byId[entry.target.id]) {
          links.forEach(function (a) { a.classList.remove('active'); });
          byId[entry.target.id].classList.add('active');
        }
      });
    }, { rootMargin: '-20% 0px -70% 0px' });
    Object.keys(byId).forEach(function (id) {
      var section = document.getElementById(id);
      if (section) { io.observe(section); }
    });
  }
})();
