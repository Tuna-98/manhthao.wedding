(function(){
  try {
    var btn = document.getElementById('audioToggleBtn');
    var audio = document.getElementById('bgAudio');
    if (!btn || !audio) return;
    var didLoadOnce = false;
    var loadTries = 0;
    var lastLoadAt = 0;
    var startAt = 0;
    if (!isFinite(startAt) || startAt < 0) startAt = 0;
    startAt = Math.floor(startAt);
    var seekTries = 0;
    var ensureStart = function(){
      try {
        if (!audio) return;
        // Avoid calling audio.load() in a retry loop.
        // Repeated load() calls can cause the browser to cancel/restart the media request continuously.
        if (audio.readyState < 1) {
          // Some browsers (notably Safari) may need a few explicit load() attempts before metadata becomes available.
          // Cap attempts to avoid spamming canceled requests.
          try {
            var now = Date.now();
            if (audio.load && loadTries < 4 && (now - lastLoadAt) > 800) {
              loadTries = (loadTries|0) + 1;
              lastLoadAt = now;
              audio.load();
            }
          } catch(e) {}
          return;
        }
        var d = audio.duration;
        var max = (isFinite(d) && d > 0) ? Math.max(0, d - 0.05) : startAt;
        var t = Math.max(0, Math.min(startAt, max));
        // Only seek when we're at the beginning (or before target) to avoid disrupting user seeking.
        if (!isFinite(audio.currentTime) || audio.currentTime < t - 0.01) {
          audio.currentTime = t;
        }
      } catch(e) {}
    };
    var ensureStartRetry = function(){
      try {
        ensureStart();
        seekTries = (seekTries|0) + 1;
        if (seekTries > 25) return;
        setTimeout(function(){
          try { ensureStart(); } catch(e) {}
        }, 120);
      } catch(e) {}
    };
    var sync = function(){
      try {
        var playing = !!(audio && !audio.paused);
        if (playing) { btn.classList.add('playing'); btn.classList.remove('muted'); }
        else { btn.classList.remove('playing'); btn.classList.add('muted'); }
      } catch(e) {}
    };
    btn.addEventListener('click', function(){
      try {
        if (!audio) return;
        if (audio.paused) {
          try {
            if (!didLoadOnce && audio.readyState < 1 && audio.load) {
              didLoadOnce = true;
              loadTries = 0;
              lastLoadAt = 0;
              audio.load();
            }
          } catch(e) {}
          seekTries = 0;
          ensureStartRetry();
          var p = audio.play();
          if (p && p.catch) p.catch(function(){});
          setTimeout(ensureStartRetry, 0);
          setTimeout(ensureStartRetry, 250);
          setTimeout(ensureStartRetry, 700);
        }
        else { audio.pause(); }
      } catch(e) {}
      setTimeout(sync, 50);
    }, true);
    try { audio.addEventListener('loadedmetadata', ensureStart); } catch(e) {}
    try { audio.addEventListener('canplay', ensureStartRetry); } catch(e) {}
    try { audio.addEventListener('play', ensureStart); } catch(e) {}
    try { audio.addEventListener('playing', ensureStartRetry); } catch(e) {}
    audio.addEventListener('play', sync);
    audio.addEventListener('pause', sync);
    audio.addEventListener('ended', sync);
    sync();
  } catch(e) {}
})();
