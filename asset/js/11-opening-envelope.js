(function(){
  try {
    var el = document.getElementById('miuOpening');
    var btn = document.getElementById('miuOpeningBtn');
    var cta = document.getElementById('miuOpeningCtaBtn');
    var stage = document.getElementById('miuOpeningSides');
    var mainStage = document.querySelector('.miu-stage');
    if (!el) return;
    var presetId = "";
    var key = 'miu_opening_opened_' + "duc-thai-thu-hien-2026-05-24";

    var getParam = function(name){
      try {
        var qs = (window && window.location && window.location.search) ? window.location.search : '';
        if (!qs) return '';
        var sp = new URLSearchParams(qs);
        return String(sp.get(name) || '');
      } catch(e) { return ''; }
    };

    var forceOpen = getParam('opening') === '1';
    var resetOpen = getParam('openingReset') === '1';

    var remember = false;
    var autoOpen = false;

    var clearOpened = function(){
      if (!remember) return;
      try { localStorage.removeItem(key); } catch(e) {}
      try { document.cookie = key + '=; path=/; max-age=0; samesite=lax'; } catch(e) {}
    };

    if (resetOpen) {
      try { clearOpened(); } catch(e) {}
    }
    var opened = false;
    if (remember) {
      try { opened = localStorage.getItem(key) === '1'; } catch(e) {}
      if (!opened) {
        try {
          opened = (document.cookie || '').indexOf(key + '=1') >= 0;
        } catch(e) {}
      }
    }

    var setOpen = function(v){
      try {
        el.setAttribute('data-open', v ? '1' : '0');
        try { el.style.display = v ? 'block' : 'none'; } catch(e) {}
        if (v) {
          document.documentElement.style.overflow = 'hidden';
          document.body.style.overflow = 'hidden';
        } else {
          document.documentElement.style.overflow = '';
          document.body.style.overflow = '';
        }
      } catch(e) {}
    };

    var syncStageSize = function(){
      try {
        if (!stage) return;
        var cw = 575;
        var ch = 11709;
        var phone = 600;
        try {
          if (mainStage) {
            var cs = getComputedStyle(mainStage);
            var cw2 = parseFloat((cs.getPropertyValue('--cw') || '').trim());
            var ch2 = parseFloat((cs.getPropertyValue('--ch') || '').trim());
            var phone2 = parseFloat((cs.getPropertyValue('--phone') || '').trim());
            if (isFinite(cw2) && cw2 > 0) cw = cw2;
            if (isFinite(ch2) && ch2 > 0) ch = ch2;
            if (isFinite(phone2) && phone2 > 0) phone = phone2;
          }
        } catch(e) {}

        var vw = (window && window.innerWidth) ? window.innerWidth : phone;
        var s = Math.min(1, phone / cw, vw / cw);
        if (!isFinite(s) || s <= 0) s = 1;
        // For PC, use fixed 600px width for opening
        var openingWidth = vw <= 480 ? String(Math.round(cw * s)) + 'px' : '600px';
        stage.style.setProperty('--miu-opening-w', openingWidth);
      } catch(e) {}
    };

    if (forceOpen || autoOpen) {
      try { syncStageSize(); } catch(e) {}
      setOpen(true);
    } else if (!remember) {
      try { syncStageSize(); } catch(e) {}
      setOpen(true);
    } else if (!opened) {
      try { syncStageSize(); } catch(e) {}
      setOpen(true);
    }

    try {
      window.addEventListener('resize', function(){ syncStageSize(); }, { passive: true });
    } catch(e) {}

    try {
      setTimeout(function(){ try { syncStageSize(); } catch(e) {} }, 0);
      setTimeout(function(){ try { syncStageSize(); } catch(e) {} }, 250);
    } catch(e) {}

    var markOpened = function(){
      if (!remember) return;
      try { localStorage.setItem(key, '1'); } catch(e) {}
      try { document.cookie = key + '=1; path=/; max-age=' + (60*60*24*365) + '; samesite=lax'; } catch(e) {}
    };

    var runOpen = function(){
      try {
        if (!stage) return;
        try { syncStageSize(); } catch(e) {}
        // prevent double click
        try { if (btn) btn.setAttribute('disabled', 'disabled'); } catch(e) {}
        try { if (cta) cta.setAttribute('disabled', 'disabled'); } catch(e) {}

        var sides = stage.querySelectorAll('.card-side');
        var done = 0;
        var earlyTimer = 0;
        var finish = function(){
          try { if (earlyTimer) clearTimeout(earlyTimer); } catch(e) {}
          var doClose = function(){
            try { setOpen(false); } catch(e) {}
            try { markOpened(); } catch(e) {}
            try { stage.classList.remove('_animating'); } catch(e) {}
            try { if (btn) btn.removeAttribute('disabled'); } catch(e) {}
            try { if (cta) cta.removeAttribute('disabled'); } catch(e) {}
            try { window.dispatchEvent(new Event('miu:opening:closed')); } catch(e) {}
          };
          // For envelope presets (phongbixanh), keep the cover a bit longer after parts move away.
          // This avoids revealing the invitation too early.
          if (presetId === 'phongbixanh') {
            doClose();
            return;
          }
          doClose();
        };
        var onEnd = function(){
          done += 1;
          if (done >= 2) finish();
        };

        if (sides && sides.length) {
          // listen once per side, then start animation
          for (var i=0;i<sides.length;i++) {
            try { sides[i].addEventListener('animationend', onEnd, { once: true }); } catch(e) {}
          }
        } else {
          // fallback: if no sides found
          setTimeout(finish, 1200);
        }
        stage.classList.add('_animating');

        // Fire a bit earlier so page animations start before the cover fully disappears.
        // Compute from actual CSS animation timing to avoid hardcoded constants.
        try {
          var parseMs = function(v){
            try {
              var s = String(v || '').trim();
              if (!s) return 0;
              var head = (s.split(',')[0] || '').trim();
              if (!head) return 0;
              if (head.indexOf('ms') >= 0) return Math.max(0, Math.round(parseFloat(head)) || 0);
              if (head.indexOf('s') >= 0) return Math.max(0, Math.round((parseFloat(head) || 0) * 1000));
              var n = Number(head);
              return isFinite(n) ? Math.max(0, Math.round(n)) : 0;
            } catch(e) { return 0; }
          };

          var total = 0;
          try {
            for (var ti=0; ti<sides.length; ti++) {
              var cs = null;
              try { cs = window.getComputedStyle(sides[ti]); } catch(e) { cs = null; }
              if (!cs) continue;
              var d = parseMs(cs.animationDelay);
              var du = parseMs(cs.animationDuration);
              total = Math.max(total, d + du);
            }
          } catch(e) {}

          // Default if style read fails
          if (!total) total = 4500;

          // Start a bit before end (tunable)
          var lead = 1200;
          var t = Math.max(0, Math.round(total - lead));
          earlyTimer = setTimeout(function(){
            try { window.dispatchEvent(new Event('miu:opening:willClose')); } catch(e) {}
          }, t);
        } catch(e) {}
      } catch(e) {
        try { setOpen(false); } catch(_e) {}
      }
    };

    // Click anywhere to open
    try {
      el.style.cursor = 'pointer';
      el.addEventListener('click', function(){
        try { runOpen(); } catch(e) {}
      }, true);
    } catch(e) {}

    if (btn) {
      try {
        btn.addEventListener('click', function(){
          try { runOpen(); } catch(e) {}
        }, true);
      } catch(e) {}
    }
    if (cta && "Mở thiệp" !== '') {
      try {
        cta.addEventListener('click', function(){
          try { runOpen(); } catch(e) {}
        }, true);
      } catch(e) {}
    }

    // Auto-open if flag is set
    if (autoOpen) {
      try { setTimeout(function(){ runOpen(); }, 500); } catch(e) {}
    }
  } catch(e) {}
})();
