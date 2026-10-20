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
      card.setAttribute('data-video-id', v.id);

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

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var CHEVRON = {
    '-1': '<path d="m15 18-6-6 6-6"/>',
    '1': '<path d="m9 18 6-6-6-6"/>'
  };

  /* Video row that scrolls sideways, with previous/next buttons (hidden when everything already fits). */
  document.querySelectorAll('[data-carousel]').forEach(function (row) {
    if (row.hidden) { return; }
    row.setAttribute('tabindex', '0');
    row.setAttribute('role', 'region');
    row.setAttribute('aria-label', 'Daftar video tutorial, geser untuk melihat lainnya');

    var nav = document.createElement('div');
    nav.className = 'carousel-nav';
    ['-1', '1'].forEach(function (dir) {
      var b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('data-dir', dir);
      b.setAttribute('aria-label', dir === '-1' ? 'Video sebelumnya' : 'Video berikutnya');
      b.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + CHEVRON[dir] + '</svg>';
      nav.appendChild(b);
    });
    row.parentNode.insertBefore(nav, row);
    var prev = nav.children[0];
    var next = nav.children[1];

    function update() {
      var max = row.scrollWidth - row.clientWidth;
      nav.hidden = max <= 4;
      prev.disabled = row.scrollLeft <= 4;
      next.disabled = row.scrollLeft >= max - 4;
    }
    nav.addEventListener('click', function (e) {
      var b = e.target.closest('button');
      if (!b) { return; }
      var card = row.querySelector('.video-card');
      var gap = parseFloat(window.getComputedStyle(row).columnGap) || 18;
      var by = (card ? card.getBoundingClientRect().width + gap : row.clientWidth) * Number(b.getAttribute('data-dir'));
      row.scrollBy({ left: by, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
    row.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  });

  /* Bring a video card into view and give it a short highlight. */
  function goToVideo(id) {
    var card = document.querySelector('.video-card[data-video-id="' + id + '"]');
    if (!card) { return; }
    card.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'nearest', inline: 'start' });
    card.classList.add('flash');
    window.setTimeout(function () { card.classList.remove('flash'); }, 1800);
    var video = card.querySelector('video');
    if (video) { video.focus({ preventScroll: true }); }
  }

  /* "Anda ingin melakukan apa?": the shortcut cards are plain links; this adds the search box and the video hints. */
  var finder = document.querySelector('[data-finder]');
  if (finder) {
    var box = finder.querySelector('[data-finder-box]');
    var out = finder.querySelector('[data-finder-results]');
    var quick = finder.querySelector('[data-finder-quick]');
    box.innerHTML = '<label class="finder-label" for="finder-q">Cari kebutuhan Anda</label>' +
      '<input id="finder-q" type="search" autocomplete="off" placeholder="Contoh: ajukan pembimbing, unggah dokumen, unduh SKL">';
    var input = box.querySelector('input');

    function norm(s) {
      return (s || '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
    }
    var STOP = ['saya', 'aku', 'mau', 'ingin', 'cara', 'bagaimana', 'gimana', 'untuk', 'yang', 'di', 'ke', 'dan', 'atau', 'dari', 'apa', 'bisa', 'tolong', 'akan', 'dengan', 'itu', 'ini'];

    /* Light Indonesian affix stripping so "mengajukan" finds "ajukan" and "mengunggah" finds "unggah". */
    function variants(t) {
      var v = [t];
      var m = t.replace(/^(meng|meny|mem|men|me|peng|pem|pen|pe|ber|ter|di|ke|se)/, '');
      if (m !== t && m.length > 3) {
        v.push(m);
        if (/^meng/.test(t)) { v.push('k' + m); }
        if (/^mem/.test(t)) { v.push('p' + m); }
        if (/^men/.test(t) && !/^meng|^meny/.test(t)) { v.push('t' + m); }
        if (/^meny/.test(t)) { v.push('s' + m); }
      }
      v.slice().forEach(function (x) {
        var y = x.replace(/(kan|an|i|nya)$/, '');
        if (y !== x && y.length > 3) { v.push(y); }
      });
      return v;
    }

    var steps = [].map.call(document.querySelectorAll('.stage .step'), function (li) {
      var stageEl = li.closest('.stage');
      var title = li.querySelector('h3').textContent;
      return {
        id: li.id,
        href: '#' + li.id,
        title: title,
        stage: stageEl.querySelector('h2').textContent,
        n: li.id.slice(li.id.lastIndexOf('-') + 1),
        video: stageEl.getAttribute('data-video'),
        nTitle: norm(title),
        nStage: norm(stageEl.querySelector('h2').textContent),
        nKeywords: norm(li.getAttribute('data-keywords')),
        nText: norm(li.querySelector('p').textContent)
      };
    });
    var byId = {};
    steps.forEach(function (s) { byId[s.id] = s; });

    /* The detailed guide cards are searchable too; they open their own page. */
    [].forEach.call(document.querySelectorAll('.guide-card'), function (a) {
      var gTitle = a.querySelector('b').textContent;
      var gGroup = a.getAttribute('data-group') || '';
      steps.push({
        guide: true,
        href: a.getAttribute('href'),
        title: gTitle,
        stage: gGroup,
        video: null,
        nTitle: norm(gTitle),
        nStage: norm(gGroup),
        nKeywords: norm(a.getAttribute('data-keywords')),
        nText: norm(a.querySelector(':scope > span').textContent)
      });
    });

    function search(q) {
      var tokens = norm(q).split(' ').filter(function (t) { return t && STOP.indexOf(t) === -1; });
      if (!tokens.length) { return null; }
      var found = [];
      steps.forEach(function (s) {
        var score = 0;
        for (var i = 0; i < tokens.length; i++) {
          var best = 0;
          variants(tokens[i]).forEach(function (t) {
            var w = s.nTitle.indexOf(t) !== -1 ? 3 :
              (s.nKeywords.indexOf(t) !== -1 || s.nStage.indexOf(t) !== -1) ? 2 :
              s.nText.indexOf(t) !== -1 ? 1 : 0;
            if (w > best) { best = w; }
          });
          if (!best) { return; }
          score += best;
        }
        found.push({ s: s, score: score + (s.guide ? 3 : 0) });
      });
      found.sort(function (a, b) { return b.score - a.score; });
      return found.slice(0, 8);
    }

    function videoHint(s) {
      if (!s || !s.video) { return null; }
      var v = (window.TUTORIAL_VIDEOS || []).filter(function (x) { return x.id === s.video; })[0];
      if (!v) { return null; }
      var el = document.createElement('div');
      el.className = 'video-hint';
      if (v.file) {
        var b = document.createElement('button');
        b.type = 'button';
        b.textContent = 'Tonton video: ' + v.title;
        b.addEventListener('click', function () { goToVideo(v.id); });
        el.appendChild(b);
      } else {
        el.textContent = 'Video tutorial: segera hadir';
      }
      return el;
    }

    quick.querySelectorAll('li').forEach(function (li) {
      var a = li.querySelector('a');
      var hint = videoHint(byId[a.getAttribute('href').slice(1)]);
      if (hint) { li.appendChild(hint); }
    });

    function render(q) {
      var results = search(q);
      out.textContent = '';
      if (results === null) { out.hidden = true; quick.hidden = false; return; }
      quick.hidden = true;
      out.hidden = false;
      var count = document.createElement('p');
      count.className = 'finder-count';
      count.textContent = results.length ?
        results.length + ' langkah yang cocok dengan "' + q.trim() + '"' :
        'Tidak ada yang cocok dengan "' + q.trim() + '". Coba kata lain, atau buka halaman Bantuan untuk pertanyaan umum.';
      out.appendChild(count);
      var ul = document.createElement('ul');
      ul.className = 'results';
      results.forEach(function (r) {
        var li = document.createElement('li');
        var a = document.createElement('a');
        a.className = 'result';
        a.href = r.s.href;
        var b = document.createElement('b');
        b.textContent = r.s.title;
        var span = document.createElement('span');
        span.textContent = r.s.guide ? 'Tata cara lengkap · ' + r.s.stage : r.s.stage + ' · langkah ' + r.s.n;
        a.appendChild(b);
        a.appendChild(span);
        li.appendChild(a);
        var hint = videoHint(r.s);
        if (hint) { li.appendChild(hint); }
        ul.appendChild(li);
      });
      out.appendChild(ul);
    }
    input.addEventListener('input', function () { render(input.value); });
  }

  /*
   * Typing headline on the home page: type a word, hold it, delete it, next word (the same effect as SIJAKI's landing page).
   * Without JavaScript, or with "reduce motion" on, the first word simply stays; a screen reader gets the full sentence
   * from the visually hidden copy, so the animated part is aria-hidden.
   */
  var typed = document.querySelector('[data-typing]');
  if (typed && !reduceMotion) {
    var words = null;
    try { words = JSON.parse(typed.getAttribute('data-typing')); } catch (err) { words = null; }
    if (words && words.length) {
      var cursor = typed.parentNode.querySelector('.cursor');
      if (cursor) { cursor.hidden = false; }
      var wi = 0;
      var ci = words[0].length;
      var deleting = false;
      var timer = null;
      var tick = function () {
        var word = words[wi];
        var delay;
        if (!deleting) {
          if (ci < word.length) { ci++; typed.textContent = word.slice(0, ci); delay = 60; }
          else { deleting = true; delay = 2200; }
        } else if (ci > 0) {
          ci--; typed.textContent = word.slice(0, ci); delay = 35;
        } else {
          deleting = false; wi = (wi + 1) % words.length; delay = 300;
        }
        timer = window.setTimeout(tick, delay);
      };
      timer = window.setTimeout(tick, 1800);
      /* Stop working while the headline is scrolled out of view. */
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (entries) {
          if (entries[0].isIntersecting) {
            if (!timer) { timer = window.setTimeout(tick, 400); }
          } else if (timer) {
            window.clearTimeout(timer);
            timer = null;
          }
        }).observe(typed.closest('h1'));
      }
    }
  }

  /* "Tata cara lengkap" is a show/hide block: open it when a link points at it (or inside it). */
  var tataCara = document.getElementById('tata-cara');
  if (tataCara && tataCara.tagName === 'DETAILS') {
    var openTataCara = function () {
      if (!/^#tata-cara/.test(window.location.hash)) { return; }
      tataCara.open = true;
      var target = document.getElementById(window.location.hash.slice(1));
      if (target) { target.scrollIntoView(); }
    };
    openTataCara();
    window.addEventListener('hashchange', openTataCara);
    [].forEach.call(document.querySelectorAll('a[href="#tata-cara"]'), function (a) {
      a.addEventListener('click', function () { tataCara.open = true; });
    });
  }

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
