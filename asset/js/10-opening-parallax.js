(function(){
  try {
    var enabled = true;
    if (!enabled) return;

    var rafId = 0;
    var active = false;
    var prevBehavior = null;
    var lastTop = 0;
    var stallCount = 0;
    var scrollRoot = null;
    var ignoreStopUntil = 0;

    var detectScrollRoot = function(){
      try {
        var cand = [document.scrollingElement, document.documentElement, document.body].filter(Boolean);
        for (var i=0;i<cand.length;i++) {
          var el = cand[i];
          var delta = (el.scrollHeight - (el.clientHeight || window.innerHeight));
          if (delta > 2) return el;
        }
      } catch(e) {}

      var best = null;
      var bestDelta = 0;
      try {
        var nodes = document.body ? document.body.querySelectorAll('*') : [];
        for (var j=0;j<nodes.length;j++) {
          var el2 = nodes[j];
          var cs = getComputedStyle(el2);
          var oy = cs.overflowY;
          if (oy === 'auto' || oy === 'scroll') {
            var d2 = el2.scrollHeight - el2.clientHeight;
            if (d2 > bestDelta + 2) { bestDelta = d2; best = el2; }
          }
        }
      } catch(e) {}

      return best || document.scrollingElement || document.documentElement || document.body;
    };

    var stop = function(){
      if (Date.now() < ignoreStopUntil) return;
      if (!active) return;
      active = false;
      if (rafId) { try { cancelAnimationFrame(rafId); } catch(e) {} rafId = 0; }
      try {
        if (prevBehavior !== null) document.documentElement.style.scrollBehavior = prevBehavior || '';
      } catch(e) {}
    };

    var start = function(){
      if (active) return;
      active = true;
      ignoreStopUntil = Date.now() + 700;
      try {
        prevBehavior = document.documentElement.style.scrollBehavior;
        document.documentElement.style.scrollBehavior = 'auto';
      } catch(e) {}

      try {
        scrollRoot = detectScrollRoot();
        var isDocRoot = (scrollRoot === document.scrollingElement || scrollRoot === document.documentElement || scrollRoot === document.body);
        var cur0 = isDocRoot ? (window.pageYOffset || scrollRoot.scrollTop || 0) : (scrollRoot.scrollTop || 0);
        lastTop = cur0;
        if (cur0 === 0) {
          if (isDocRoot) { try { window.scrollTo(0, 1); } catch(e) {} }
          try { scrollRoot.scrollTop = 1; } catch(e) {}
        }
      } catch(e) {}

      var lastTs = 0;
      var SPEED = 40;
      var carryPx = 0;
      var MAX_STEP_PX = 2;

      var tick = function(ts){
        if (!active) return;
        var root = scrollRoot || detectScrollRoot();
        var isDoc = (root === document.scrollingElement || root === document.documentElement || root === document.body);
        var max = root.scrollHeight - (root.clientHeight || window.innerHeight) - 2;
        var current = isDoc
          ? (window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || root.scrollTop || 0)
          : (root.scrollTop || 0);

        if (max <= 0) { scrollRoot = detectScrollRoot(); rafId = requestAnimationFrame(tick); return; }
        if (!lastTs) lastTs = ts;
        var dt = Math.min(64, ts - lastTs);
        lastTs = ts;

        var rawDelta = (dt * SPEED) / 1000 + carryPx;
        var stepPx = Math.max(1, Math.min(MAX_STEP_PX, Math.floor(rawDelta)));
        carryPx = rawDelta - stepPx;
        var next = Math.min(max, current + stepPx);

        if (next !== current) {
          if (isDoc) {
            try { document.documentElement.scrollTop = next; document.body.scrollTop = next; } catch(e) {}
            try { window.scrollTo(0, next); } catch(e) {}
          } else {
            try { root.scrollTop = next; } catch(e) {}
          }
        }

        try {
          var after = isDoc ? (window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0) : (root.scrollTop || 0);
          if (after <= lastTop + 0.01) {
            stallCount += 1;
            if (stallCount >= 12) {
              stallCount = 0;
              scrollRoot = detectScrollRoot();
              var r2 = scrollRoot;
              var isDoc2 = (r2 === document.scrollingElement || r2 === document.documentElement || r2 === document.body);
              if (isDoc2) {
                var y2 = Math.min((document.documentElement.scrollTop || document.body.scrollTop || 0) + 2, max);
                try { document.documentElement.scrollTop = y2; document.body.scrollTop = y2; } catch(e) {}
                try { window.scrollTo(0, y2); } catch(e) {}
                lastTop = y2;
              } else {
                try { r2.scrollTop = Math.min((r2.scrollTop || 0) + 2, max); } catch(e) {}
                lastTop = r2.scrollTop || 0;
              }
            }
          } else {
            stallCount = 0;
          }
          lastTop = after;
        } catch(e) {}

        if (next >= max - 1) { stop(); return; }
        rafId = requestAnimationFrame(tick);
      };

      rafId = requestAnimationFrame(tick);
    };

    // Stop on user intent
    ['wheel','touchstart','keydown','pointerdown'].forEach(function(ev){
      try { window.addEventListener(ev, stop, { passive: true }); } catch(e) {}
    });

    var opening = document.getElementById('tonOpening');
    if (opening) {
      // start after opening closes
      try {
        var stage = document.getElementById('tonOpeningSides');
        if (stage) {
          var sides = stage.querySelectorAll('.card-side');
          var done = 0;
          var onEnd = function(){
            done += 1;
            if (done >= 2) setTimeout(start, 350);
          };
          for (var i=0;i<sides.length;i++) {
            try { sides[i].addEventListener('animationend', onEnd, { once: true }); } catch(e) {}
          }
        }
      } catch(e) {}
      // fallback in case animation events fail
      setTimeout(function(){
        try {
          var open = opening.getAttribute('data-open');
          if (open === '0') start();
        } catch(e) {}
      }, 6000);
    } else {
      // no cover => start immediately
      setTimeout(start, 350);
    }
  } catch(e) {}
})();
