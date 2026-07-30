(function(){
  try {
    var modalId = 'tonAlbumModal';
    var ensureModal = function(){
      var existing = document.getElementById(modalId);
      if (existing) return existing;
      var wrap = document.createElement('div');
      wrap.id = modalId;
      wrap.setAttribute('aria-hidden','true');
      wrap.style.cssText = 'position:fixed;inset:0;z-index:2147483000;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,0.78);padding:16px;opacity:0;transition:opacity 180ms ease;';
      wrap.innerHTML = ''+
        '<div data-tonalbum-panel="1" style="width:min(920px,100%);max-height:min(90vh,860px);display:grid;grid-template-rows:auto 1fr;gap:10px;transform:scale(0.985);opacity:0.98;transition:transform 180ms ease, opacity 180ms ease;will-change:transform,opacity;">'+
          '<div style="display:flex;align-items:center;justify-content:space-between;color:rgba(255,255,255,0.92);font-size:13px;">'+
            '<div data-tonalbum-count="1">1 / 1</div>'+
            '<button type="button" data-tonalbum-close="1" style="border:0;background:transparent;color:rgba(255,255,255,0.92);font-size:26px;line-height:1;padding:6px 10px;cursor:pointer;">×</button>'+
          '</div>'+
          '<div style="position:relative;border-radius:14px;overflow:hidden;background:rgba(255,255,255,0.04);box-shadow:0 18px 60px rgba(0,0,0,0.45);display:flex;align-items:center;justify-content:center;min-height:320px;">'+
            '<button type="button" data-tonalbum-prev="1" style="position:absolute;left:12px;top:50%;transform:translateY(-50%);width:44px;height:44px;border-radius:9999px;border:1px solid rgba(255,255,255,0.25);background:rgba(0,0,0,0.35);color:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;z-index:20;">‹</button>'+
            '<img data-tonalbum-img="1" alt="" style="max-width:100%;max-height:90vh;display:block;object-fit:contain;transition:opacity 220ms ease-in-out;opacity:1;will-change:opacity;position:relative;z-index:1;pointer-events:none;" />'+
            '<button type="button" data-tonalbum-next="1" style="position:absolute;right:12px;top:50%;transform:translateY(-50%);width:44px;height:44px;border-radius:9999px;border:1px solid rgba(255,255,255,0.25);background:rgba(0,0,0,0.35);color:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;z-index:20;">›</button>'+
          '</div>'+
        '</div>';
      document.body.appendChild(wrap);
      return wrap;
    };

    var state = { open: false, albumId: '', idx: 0, imgs: [], preloaded: {} };

    var preloadAll = function(albumId, imgs){
      try {
        if (!imgs || !imgs.length) return;
        if (!state.preloaded) state.preloaded = {};
        var key = String(albumId || '');
        if (!key) return;
        if (state.preloaded[key] === 1) return;
        state.preloaded[key] = 1;
        for (var i=0;i<imgs.length;i++) {
          try { var im = new Image(); im.decoding = 'async'; im.loading = 'eager'; im.src = imgs[i]; } catch(_e) {}
        }
      } catch(_e) {}
    };

    var setModalImage = function(modal, imgs, idx){
      try {
        var img = modal.querySelector('[data-tonalbum-img="1"]');
        var count = modal.querySelector('[data-tonalbum-count="1"]');
        if (!img) return;
        idx = Math.max(0, Math.min(imgs.length - 1, idx || 0));
        if (count) count.textContent = (idx + 1) + ' / ' + imgs.length;
        // fade
        try { img.style.transition = img.style.transition || 'opacity 220ms ease-in-out'; } catch(_e) {}
        try { img.style.opacity = '0'; } catch(_e) {}
        var nextSrc = imgs[idx];
        var preload = new Image();
        preload.onload = function(){
          try { img.setAttribute('src', nextSrc); } catch(_e) {}
          try { requestAnimationFrame(function(){ try { img.style.opacity = '1'; } catch(_e2) {} }); } catch(_e) { try { img.style.opacity = '1'; } catch(_e2) {} }
        };
        preload.src = nextSrc;
      } catch(_e) {}
    };

    var openAt = function(albumId, idx){
      var modal = ensureModal();
      var imgs = [];
      try {
        var nodes = document.querySelectorAll('[data-ton-album-item="1"][data-ton-album-id="' + albumId.replace(/"/g,'\"') + '"]');
        for (var i=0;i<nodes.length;i++) {
          var s = nodes[i].getAttribute('data-src') || '';
          if (s) imgs.push(s);
        }
      } catch(e) {}
      if (!imgs.length) return;
      preloadAll(albumId, imgs);
      state.open = true;
      state.albumId = albumId;
      state.imgs = imgs;
      state.idx = Math.max(0, Math.min(imgs.length - 1, idx || 0));

      setModalImage(modal, imgs, state.idx);

      modal.style.display = 'flex';
      modal.setAttribute('aria-hidden','false');
      try {
        modal.style.opacity = '0';
        var panel = modal.querySelector('[data-tonalbum-panel="1"]');
        if (panel) { panel.style.transform = 'scale(0.985)'; panel.style.opacity = '0.98'; }
        requestAnimationFrame(function(){
          try { modal.style.opacity = '1'; } catch(_e) {}
          try { if (panel) { panel.style.transform = 'scale(1)'; panel.style.opacity = '1'; } } catch(_e) {}
        });
      } catch(_e) {}
    };

    var close = function(){
      var modal = document.getElementById(modalId);
      if (!modal) return;
      state.open = false;
      try {
        modal.style.opacity = '0';
        var panel = modal.querySelector('[data-tonalbum-panel="1"]');
        if (panel) { panel.style.transform = 'scale(0.985)'; panel.style.opacity = '0.98'; }
        setTimeout(function(){
          try { modal.style.display = 'none'; } catch(_e) {}
          try { modal.setAttribute('aria-hidden','true'); } catch(_e) {}
        }, 180);
      } catch(_e) {
        modal.style.display = 'none';
        modal.setAttribute('aria-hidden','true');
      }
    };

    var step = function(dir){
      var modal = document.getElementById(modalId);
      if (!modal || !state.open || !state.imgs || !state.imgs.length) return;
      state.idx = (state.idx + dir + state.imgs.length) % state.imgs.length;
      setModalImage(modal, state.imgs, state.idx);
    };

    var setSliderIdx = function(albumId, idx){
      try {
        var items = document.querySelectorAll('[data-ton-album-item="1"][data-ton-album-id="' + albumId.replace(/"/g,'\"') + '"]');
        var src = '';
        var len = items ? items.length : 0;
        if (!len) return;
        idx = (Number(idx || 0) % len + len) % len;
        try { src = (items[idx] && items[idx].getAttribute) ? (items[idx].getAttribute('data-src') || '') : ''; } catch(_e) { src = ''; }
        if (!src) return;

        // preload whole album once
        try {
          var all = [];
          for (var ii=0;ii<len;ii++) {
            try { var ss = (items[ii] && items[ii].getAttribute) ? (items[ii].getAttribute('data-src') || '') : ''; if (ss) all.push(ss); } catch(_e) {}
          }
          preloadAll(albumId, all);
        } catch(_e) {}

        var mainImg = document.querySelector('[data-ton-album-main-img="1"][data-ton-album-id="' + albumId.replace(/"/g,'\"') + '"]');
        if (mainImg) {
          try { mainImg.style.opacity = '0'; } catch(_e) {}
          var preload = new Image();
          preload.onload = function(){
            try { mainImg.setAttribute('src', src); } catch(_e) {}
            try { requestAnimationFrame(function(){ try { mainImg.style.opacity = '1'; } catch(_e2) {} }); } catch(_e) { try { mainImg.style.opacity = '1'; } catch(_e2) {} }
          };
          preload.src = src;
        }

        var thumbs = document.querySelectorAll('[data-ton-album-thumb="1"][data-ton-album-id="' + albumId.replace(/"/g,'\"') + '"]');
        for (var i=0;i<thumbs.length;i++) {
          var th = thumbs[i];
          var isActive = String(th.getAttribute('data-idx')||'') === String(idx);
          try {
            if (isActive) {
              th.setAttribute('data-active','1');
              th.style.boxShadow = '0 0 0 2px rgba(236,72,153,0.95)';
            } else {
              th.removeAttribute('data-active');
              th.style.boxShadow = '0 0 0 1px rgba(0,0,0,0.08)';
            }
          } catch(_e) {}
        }

        var slider = document.querySelector('[data-ton-album-slider="1"][data-ton-album-id="' + albumId.replace(/"/g,'\"') + '"]');
        if (slider) slider.setAttribute('data-idx', String(idx));
      } catch(_e) {}
    };

    document.addEventListener('click', function(e){
      try {
        var t = e && e.target;
        if (!t) return;
        // Nhãn "+22 ảnh" trên ô cuối là link sang album.html -> để trình duyệt tự điều hướng
        if (t.closest && t.closest('[data-ton-album-more="1"]')) return;
        var mainBtn = t.closest ? t.closest('[data-ton-album-main="1"]') : null;
        if (mainBtn) {
          e.preventDefault();
          e.stopPropagation();
          var albumId0 = mainBtn.getAttribute('data-ton-album-id') || '';
          if (!albumId0) return;
          var slider0 = document.querySelector('[data-ton-album-slider="1"][data-ton-album-id="' + albumId0.replace(/"/g,'\"') + '"]');
          var idx0 = 0;
          try { idx0 = Number(slider0 ? (slider0.getAttribute('data-idx')||'0') : '0') || 0; } catch(_e) { idx0 = 0; }
          openAt(albumId0, idx0);
          return;
        }

        var prevBtn = t.closest ? t.closest('[data-ton-album-prev="1"]') : null;
        if (prevBtn) {
          e.preventDefault();
          e.stopPropagation();
          var aidp = prevBtn.getAttribute('data-ton-album-id') || '';
          var slp = document.querySelector('[data-ton-album-slider="1"][data-ton-album-id="' + aidp.replace(/"/g,'\"') + '"]');
          var curp = 0;
          try { curp = Number(slp ? (slp.getAttribute('data-idx')||'0') : '0') || 0; } catch(_e) { curp = 0; }
          setSliderIdx(aidp, curp - 1);
          return;
        }

        var nextBtn = t.closest ? t.closest('[data-ton-album-next="1"]') : null;
        if (nextBtn) {
          e.preventDefault();
          e.stopPropagation();
          var aidn = nextBtn.getAttribute('data-ton-album-id') || '';
          var sln = document.querySelector('[data-ton-album-slider="1"][data-ton-album-id="' + aidn.replace(/"/g,'\"') + '"]');
          var curn = 0;
          try { curn = Number(sln ? (sln.getAttribute('data-idx')||'0') : '0') || 0; } catch(_e) { curn = 0; }
          setSliderIdx(aidn, curn + 1);
          return;
        }

        var thumb = t.closest ? t.closest('[data-ton-album-thumb="1"]') : null;
        if (thumb) {
          e.preventDefault();
          e.stopPropagation();
          var aidt = thumb.getAttribute('data-ton-album-id') || '';
          var idxt = Number(thumb.getAttribute('data-idx') || '0') || 0;
          setSliderIdx(aidt, idxt);
          return;
        }

        var item = t.closest ? t.closest('[data-ton-album-item="1"]') : null;
        if (item) {
          e.preventDefault();
          e.stopPropagation();
          var albumId = item.getAttribute('data-ton-album-id') || '';
          var idx = Number(item.getAttribute('data-idx') || '0') || 0;
          if (albumId) openAt(albumId, idx);
          return;
        }
        var modal = t.closest ? t.closest('#' + modalId) : null;
        if (modal) {
          var closeBtn = (t.closest && t.closest('[data-tonalbum-close="1"]')) ? t.closest('[data-tonalbum-close="1"]') : null;
          if (closeBtn) { close(); return; }
          var prevBtn2 = (t.closest && t.closest('[data-tonalbum-prev="1"]')) ? t.closest('[data-tonalbum-prev="1"]') : null;
          if (prevBtn2) { step(-1); return; }
          var nextBtn2 = (t.closest && t.closest('[data-tonalbum-next="1"]')) ? t.closest('[data-tonalbum-next="1"]') : null;
          if (nextBtn2) { step(1); return; }
          // click backdrop
          if (t === modal) { close(); return; }
        }
      } catch(_e) {}
    }, true);

    document.addEventListener('keydown', function(e){
      try {
        if (!state.open) return;
        if (e.key === 'Escape') close();
        if (e.key === 'ArrowLeft') step(-1);
        if (e.key === 'ArrowRight') step(1);
      } catch(_e) {}
    }, true);

    // init sliders
    try {
      var sliders = document.querySelectorAll('[data-ton-album-slider="1"]');
      for (var i=0;i<sliders.length;i++) {
        var s = sliders[i];
        var aid = s.getAttribute('data-ton-album-id') || '';
        if (!aid) continue;
        if (!s.getAttribute('data-idx')) s.setAttribute('data-idx','0');
        setSliderIdx(aid, Number(s.getAttribute('data-idx')||'0')||0);

        // autoplay
        try {
          if (s.getAttribute('data-autoplay') !== '1') continue;
          if (s.getAttribute('data-autoplay-init') === '1') continue;
          s.setAttribute('data-autoplay-init','1');
          (function(sliderEl, albumId){
            var timer = null;
            var stop = function(){ try { if (timer) clearInterval(timer); } catch(_e) {} timer = null; };
            var start = function(){
              stop();
              timer = setInterval(function(){
                try {
                  var cur = Number(sliderEl.getAttribute('data-idx')||'0')||0;
                  setSliderIdx(albumId, cur + 1);
                } catch(_e) {}
              }, 2500);
            };
            sliderEl.addEventListener('pointerdown', stop, true);
            sliderEl.addEventListener('touchstart', stop, { passive: true, capture: true });
            sliderEl.addEventListener('mouseenter', stop, { passive: true });
            sliderEl.addEventListener('mouseleave', start, { passive: true });

            // Lazy-start autoplay only when slider is in viewport
            try {
              if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
                var started = false;
                var obs = new IntersectionObserver(function(entries){
                  try {
                    var e = entries && entries[0];
                    if (!e) return;
                    if (e.isIntersecting) {
                      if (!started) {
                        started = true;
                        start();
                      } else {
                        start();
                      }
                    } else {
                      stop();
                    }
                  } catch(_e2) {}
                }, { root: null, rootMargin: '0px 0px -10% 0px', threshold: [0.08, 0.15] });
                obs.observe(sliderEl);
              } else {
                start();
              }
            } catch(_e) {
              start();
            }
          })(s, aid);
        } catch(_e) {}
      }
    } catch(_e) {}
  } catch(e) {}
})();
