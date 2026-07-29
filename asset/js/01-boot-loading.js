(function(){
      try {
        var htmlEl = document.documentElement;
        if (!htmlEl) return;
        var startedAt = Date.now();
        var minMs = 500;
        var maxMs = 1800;
        var shown = false;
        var removed = false;
        var ensureOverlay = function(){
          try {
            if (shown) return;
            shown = true;
            var d = document.createElement('div');
            d.id = 'miuBootLoading';
            d.innerHTML = '<div class="miuBootSpinner" aria-label="loading"></div>';
            var mount = document.body || document.documentElement;
            mount.appendChild(d);
          } catch(_e) {}
        };
        var release = function(){
          try {
            if (removed) return;
            removed = true;
            var d = document.getElementById('miuBootLoading');
            if (d) {
              try { d.setAttribute('data-hide','1'); } catch(_e3) {}
              setTimeout(function(){ try { if (d && d.parentNode) d.parentNode.removeChild(d); } catch(_e4) {} }, 220);
            }
          } catch(_e5) {}
        };

        ensureOverlay();

        var scheduleRelease = function(){
          try {
            var elapsed = Date.now() - startedAt;
            var wait = Math.max(0, minMs - elapsed);
            setTimeout(release, wait);
          } catch(_e) { release(); }
        };

        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', scheduleRelease, { once: true });
        } else {
          scheduleRelease();
        }

        try {
          window.addEventListener('load', scheduleRelease, { once: true });
        } catch(_e) {}

        setTimeout(release, maxMs);
      } catch(_e) {}
    })();
