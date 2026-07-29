(function(){
  try {
    function isSingleLine(el){
      try {
        var t = (el && el.textContent != null) ? String(el.textContent) : '';
        return t.indexOf('\n') === -1;
      } catch(e){ return true; }
    }

    function copyStyle(src, dst){
      try {
        var cs = window.getComputedStyle(src);
        dst.style.fontFamily = cs.fontFamily;
        dst.style.fontSize = cs.fontSize;
        dst.style.fontWeight = cs.fontWeight;
        dst.style.fontStyle = cs.fontStyle;
        dst.style.letterSpacing = cs.letterSpacing;
        dst.style.textTransform = cs.textTransform;
        dst.style.textDecoration = cs.textDecoration;
        dst.style.lineHeight = cs.lineHeight;
        // Match builder measurement: pre-wrap + max-content width
        dst.style.whiteSpace = 'pre-wrap';
        dst.style.textAlign = cs.textAlign;
      } catch(e) {}
    }

    function getCssPx(el, prop){
      try {
        var cs = window.getComputedStyle(el);
        var v = cs && cs.getPropertyValue ? cs.getPropertyValue(prop) : '';
        var n = parseFloat(String(v || ''));
        return isFinite(n) ? n : 0;
      } catch(e) { return 0; }
    }

    function measureWidth(el){
      var span = document.createElement('span');
      span.textContent = (el && el.textContent != null) ? String(el.textContent) : '';
      span.style.position = 'absolute';
      span.style.left = '-99999px';
      span.style.top = '-99999px';
      span.style.padding = '0';
      span.style.margin = '0';
      span.style.display = 'inline-block';
      span.style.width = 'max-content';
      span.style.maxWidth = 'none';
      span.style.pointerEvents = 'none';
      span.style.visibility = 'hidden';
      copyStyle(el, span);
      document.body.appendChild(span);
      var w = 0;
      try { w = Math.ceil(span.scrollWidth || span.getBoundingClientRect().width || 0); } catch(e) { w = 0; }
      try { document.body.removeChild(span); } catch(_e) {}
      return w;
    }

    function measureNoWrapWidth(el){
      var span = document.createElement('span');
      span.textContent = (el && el.textContent != null) ? String(el.textContent) : '';
      span.style.position = 'absolute';
      span.style.left = '-99999px';
      span.style.top = '-99999px';
      span.style.padding = '0';
      span.style.margin = '0';
      span.style.display = 'inline-block';
      span.style.width = 'max-content';
      span.style.maxWidth = 'none';
      span.style.pointerEvents = 'none';
      span.style.visibility = 'hidden';
      copyStyle(el, span);
      // force single-line to measure required width to avoid wrapping
      span.style.whiteSpace = 'nowrap';
      document.body.appendChild(span);
      var w = 0;
      try { w = Math.ceil(span.scrollWidth || span.getBoundingClientRect().width || 0); } catch(e) { w = 0; }
      try { document.body.removeChild(span); } catch(_e) {}
      return w;
    }

    function detectWrap(el){
      try {
        // Case 1: overflow-based (some layouts keep fixed height)
        var ch = Number(el.clientHeight || 0);
        var sh = Number(el.scrollHeight || 0);
        if (ch && sh && sh > ch + 1) return true;

        // Case 2: no overflow but actual layout is multiple lines
        // (common when height is auto/large enough)
        var t = (el && el.textContent != null) ? String(el.textContent) : '';
        if (t.indexOf('\n') !== -1) return false;

        var lh = getCssPx(el, 'line-height');
        if (!lh || !isFinite(lh)) {
          var fs = getCssPx(el, 'font-size');
          if (fs && isFinite(fs)) lh = fs * 1.2;
        }

        var h = getCssPx(el, 'height');
        if (!h || !isFinite(h)) h = Number(el.clientHeight || 0);
        if (lh && h && isFinite(lh) && isFinite(h) && h > lh + 1) return true;
      } catch(e) {}
      return false;
    }

    function fitOne(el){
      try {
        if (!el) return;
        // Builder-strict behavior: only auto-fit when not manualSized and single-line
        if (el.getAttribute('data-manual-sized') === '1') return;
        if (!isSingleLine(el)) return;

        var w = measureWidth(el);
        if (!w || !isFinite(w)) return;
        var target = w + 6;

        // Use unscaled CSS width (builder stores/uses px in schema; canvas may be scaled).
        var cur = getCssPx(el, 'width');
        if (cur && target <= cur + 1) return;

        // Preserve visual center to match builder layout expectation.
        // If we only change width, the box grows to the right and appears shifted.
        try {
          var left = getCssPx(el, 'left');
          var align = '';
          try { align = String((window.getComputedStyle(el) || {}).textAlign || ''); } catch(_e) { align = ''; }
          if (left && isFinite(left) && cur && isFinite(cur)) {
            var delta = target - cur;
            // For center-aligned text (most titles), keep the center constant.
            if (align === 'center') {
              el.style.left = String(left - delta / 2) + 'px';
            }
          }
        } catch(_e) {}

        el.style.width = String(target) + 'px';
        // ensure height is sufficient after widening
        try {
          var sh = Math.ceil(el.scrollHeight || 0);
          if (sh && isFinite(sh)) el.style.height = String(sh) + 'px';
        } catch(_e) {}
      } catch(e) {}
    }

    function run(){
      try {
        var els = document.querySelectorAll('[data-node-type="element_text"]');
        for (var i=0;i<els.length;i++) fitOne(els[i]);
      } catch(e) {}
    }

    // Wait for fonts to load so measurement matches preview.
    try {
      if (document.fonts && document.fonts.ready && typeof document.fonts.ready.then === 'function') {
        document.fonts.ready.then(function(){ setTimeout(run, 0); }).catch(function(){ setTimeout(run, 0); });
      } else {
        setTimeout(run, 0);
      }
    } catch(e) { setTimeout(run, 0); }
  } catch(e) {}
})();
