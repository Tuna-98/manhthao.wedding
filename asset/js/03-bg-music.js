(function(){
  try {
    var sp = null;
    try { sp = new URLSearchParams(window.location.search || ''); } catch(e) {}
    if (sp && sp.get('muteMusic') === '1') return;
    if (window.TON_MUTE_MUSIC) return;

    var audioRef = null;

    var getAudio = function(){
      if (audioRef && audioRef.play) return audioRef;
      var a = document.getElementById('bgAudio') || document.getElementById('musicPlayer');
      if (!a || !a.play) return null;
      audioRef = a;
      try { a.volume = typeof a.volume === 'number' ? a.volume : 0.5; } catch(e) {}
      return a;
    };

    var add = function(type, handler, options){
      try { document.addEventListener(type, handler, options); } catch(e) {
        try { document.addEventListener(type, handler, true); } catch(_) {}
      }
    };
    var remove = function(type, handler, options){
      try { document.removeEventListener(type, handler, options); } catch(e) {
        try { document.removeEventListener(type, handler, true); } catch(_) {}
      }
    };

    var started = false;
    var removeAll = function(){
      remove('pointerdown', start, true);
      remove('touchstart', start, { capture: true, passive: true });
      remove('touchend', start, { capture: true, passive: true });
      remove('keydown', start, true);
      remove('scroll', start, { capture: true, passive: true });
      remove('click', start, true);
    };

    var getStartAt = function(){
      try {
        var v = (window && (window.TON_BG_START_AT != null)) ? window.TON_BG_START_AT : null;
        var n = Number(v);
        if (!isFinite(n) || n <= 0) return 0;
        return Math.floor(n);
      } catch(e) { return 0; }
    };
    var trySeekStart = function(aud){
      try {
        if (!aud) return;
        var t0 = getStartAt();
        if (!t0) return;
        var d = aud.duration;
        var max = (isFinite(d) && d > 0) ? Math.max(0, d - 0.05) : t0;
        var t = Math.max(0, Math.min(t0, max));
        if (!isFinite(aud.currentTime) || aud.currentTime < t - 0.01) { aud.currentTime = t; }
      } catch(e) {}
    };

    var start = function(){
      if (started) return;
      var audio = getAudio();
      if (!audio) return;
      started = true;
      try {
        trySeekStart(audio);
        try {
          audio.addEventListener && audio.addEventListener('loadedmetadata', function(){ try { trySeekStart(audio); } catch(e) {} }, { once: true });
          audio.addEventListener && audio.addEventListener('canplay', function(){ try { trySeekStart(audio); } catch(e) {} }, { once: true });
          audio.addEventListener && audio.addEventListener('playing', function(){ try { trySeekStart(audio); } catch(e) {} }, { once: true });
        } catch(e) {}
        var p = audio.play();
        if (p && p.then) {
          p.then(function(){ removeAll(); }).catch(function(){ started = false; });
        } else {
          removeAll();
        }
      } catch(e) {
        started = false;
      }
    };

    add('pointerdown', start, true);
    add('touchstart', start, { capture: true, passive: true });
    add('touchend', start, { capture: true, passive: true });
    add('keydown', start, true);
    add('scroll', start, { capture: true, passive: true });
    add('click', start, true);

    // Also attempt as soon as DOM is ready (won't wait for full assets/fonts).
    var onReady
 = function(){ try { start(); } catch(e) {} };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', onReady, { once: true });
    else onReady();
  } catch(e) {}
})();
