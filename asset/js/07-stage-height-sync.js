(function(){
  try {
    var stage = document.querySelector('.miu-stage');
    var canvas = document.querySelector('.miu-canvas');
    if (!stage || !canvas) return;
    var sync = function(){
      try {
        var sw = Number(stage.clientWidth || 0);
        var cw = 575;
        if (!sw || !cw) return;
        var s = Math.min(1, sw / cw);
        try { document.documentElement.style.setProperty('--miu-s', String(s)); } catch(_e) {}

        // Auto expand height when some nodes (e.g. RSVP) render taller than configured h
        try {
          var baseH = 11709;
          var sh = Number(canvas.scrollHeight || 0);
          var nextH = Math.max(baseH, sh || 0);
          if (nextH && isFinite(nextH)) {
            canvas.style.height = String(nextH) + 'px';
            try { stage.style.setProperty('--sh', String(nextH) + 'px'); } catch(__e) {}
          }
        } catch(_e2) {}
      } catch(_e) {}
    };
    sync();
    try { setTimeout(sync, 0); setTimeout(sync, 300); setTimeout(sync, 1200); } catch(_e) {}
    window.addEventListener('resize', sync, { passive: true });
  } catch(e) {}
})();
