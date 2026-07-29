(function(){
  try {
    var started = false;
    var start = function(){
      if (started) return;
      started = true;

    var prefersReduced = false;
    try {
      prefersReduced = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    } catch(e) {}

    var q = function(){
      try { return document.querySelectorAll('[data-anim-preset]'); } catch(e) { return []; }
    };

    var isInfinitePreset = function(p){
      return p === 'rotate' || p === 'spin' || p === 'flicker' || p === 'pulse' || p === 'wiggle' || p === 'heartBeat' || p === 'swayBottom';
    };

    var applyAnim = function(el){
      try {
        if (!el) return;
        var preset = el.getAttribute('data-anim-preset') || '';
        var duration = Number(el.getAttribute('data-anim-duration') || 600);
        var delay = Number(el.getAttribute('data-anim-delay') || 0);
        var easing = el.getAttribute('data-anim-easing') || 'cubic-bezier(0.2,0.8,0.2,1)';
        var loopAttr = el.getAttribute('data-anim-loop');
        var loop = loopAttr === '1' || isInfinitePreset(preset);
        var distance = el.getAttribute('data-anim-distance') || '';
        var distanceStyle = distance ? '--miu-anim-distance:' + distance + 'px;' : '';
        var hideAfter = Number(el.getAttribute('data-anim-hide-after') || 0);
        
        // Use custom cubic-bezier for swayBottom to create smoother pendulum-like motion
        if (preset === 'swayBottom') {
          easing = 'cubic-bezier(0.45, 0.05, 0.55, 0.95)';
        }
        var timing = preset === 'typewriter' ? 'steps(14,end)' : easing;
        var name = 'miu-' + preset;
        try { el.style.opacity = '1'; } catch(e) {}
        try { 
          el.style.animation = name + ' ' + duration + 'ms ' + timing + ' ' + delay + 'ms both' + (loop ? ' infinite' : '');
          if (distanceStyle) el.style.cssText += distanceStyle;
        } catch(e) {}
        try {
          // Hide after X ms (plus delay) if configured and not looping
          if (!loop && isFinite(hideAfter) && hideAfter > 0) {
            try {
              if (el.__miuHideTimer) clearTimeout(el.__miuHideTimer);
            } catch(_e) {}
            var total = Math.max(0, Math.floor(hideAfter + (isFinite(delay) && delay > 0 ? delay : 0)));
            el.__miuHideTimer = setTimeout(function(){
              try {
                el.style.display = 'none';
                el.setAttribute('data-miu-hidden-by-anim', '1');
              } catch(_e2) {}
            }, total);
          }
        } catch(e) {}
        try { el.__miuAnimApplied = true; } catch(e) {}
      } catch(e) {
        try { if (el) el.style.opacity = '1'; } catch(_e) {}
      }
    };

    var els = q();
    if (!els || !els.length) return;

    if (prefersReduced) {
      for (var i=0;i<els.length;i++) applyAnim(els[i]);
      return;
    }

    if (!('IntersectionObserver' in window)) {
      for (var i=0;i<els.length;i++) applyAnim(els[i]);
      return;
    }

    var obs = new IntersectionObserver(function(entries){
      for (var i=0;i<entries.length;i++) {
        var e = entries[i];
        if (e && e.isIntersecting) {
          applyAnim(e.target);
          try { obs.unobserve(e.target); } catch(_e) {}
        }
      }
    }, { root: null, rootMargin: '0px 0px -12% 0px', threshold: [0.08, 0.15, 0.22] });

    for (var i=0;i<els.length;i++) {
      try { obs.observe(els[i]); } catch(e) { applyAnim(els[i]); }
    }
    };

    var getOpeningState = function(){
      try {
        var opening = document.getElementById('miuOpening');
        if (!opening) return { exists: false, open: false };
        var openAttr = String(opening.getAttribute('data-open') || '');
        return { exists: true, open: openAttr === '1' };
      } catch(e) {
        return { exists: false, open: false };
      }
    };

    var boot = function(){
      try {
        var st0 = getOpeningState();
        if (!st0.exists) {
          start();
          return;
        }

        var sawOpen = st0.open;

        var onClosed = function(){
          try {
            var st = getOpeningState();
            if (st.exists && st.open) return;
          } catch(e) {}
          cleanup();
          start();
        };

        var obs = null;
        var fallbackTimer = null;

        var cleanup = function(){
          try { window.removeEventListener('miu:opening:closed', onClosed, true); } catch(e) {}
          try { window.removeEventListener('miu:opening:willClose', onWillClose, true); } catch(e) {}
          try { if (obs) obs.disconnect(); } catch(e) {}
          try { if (fallbackTimer) clearTimeout(fallbackTimer); } catch(e) {}
        };

        try {
          window.addEventListener('miu:opening:closed', onClosed, true);
        } catch(e) {}

        var onWillClose = function(){
          try {
            cleanup();
            start();
          } catch(e) {}
        };

        try {
          window.addEventListener('miu:opening:willClose', onWillClose, true);
        } catch(e) {}

        try {
          var opening = document.getElementById('miuOpening');
          if (opening && typeof MutationObserver !== 'undefined') {
            obs = new MutationObserver(function(){
              try {
                var st = getOpeningState();
                if (st.open) {
                  sawOpen = true;
                  try { if (fallbackTimer) { clearTimeout(fallbackTimer); fallbackTimer = null; } } catch(e) {}
                  return;
                }
                if (sawOpen && !st.open) onClosed();
              } catch(e) {}
            });
            obs.observe(opening, { attributes: true, attributeFilter: ['data-open', 'style'] });
          }
        } catch(e) {}

        // If opening never opens (remembered / disabled), start soon.
        fallbackTimer = setTimeout(function(){
          try {
            if (!sawOpen) { cleanup(); start(); }
          } catch(e) { cleanup(); start(); }
        }, 2500);
      } catch(e) {
        start();
      }
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', boot);
    } else {
      boot();
    }
  } catch(e) {}
})();
