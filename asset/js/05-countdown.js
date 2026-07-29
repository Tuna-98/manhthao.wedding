(function(){
  try {
    function pad(n){ n = Math.max(0, n|0); return (n<10?'0':'')+n; }
    function parseTarget(raw){
      try {
        raw = String(raw || '').trim();
        if (!raw) return NaN;
        // timestamp (ms)
        if (/^d{10,13}$/.test(raw)) {
          var ts = parseInt(raw, 10);
          if (isFinite(ts)) return raw.length === 10 ? ts * 1000 : ts;
        }
        var t = Date.parse(raw);
        if (isFinite(t)) return t;
        // common form: YYYY-MM-DD HH:mm or YYYY-MM-DD HH:mm:ss
        if (/^d{4}-d{2}-d{2}s+d{2}:d{2}(:d{2})?$/.test(raw)) {
          t = Date.parse(raw.replace(' ', 'T'));
          if (isFinite(t)) return t;
          // assume local time -> add Z as a fallback
          t = Date.parse(raw.replace(' ', 'T') + 'Z');
          if (isFinite(t)) return t;
        }
      } catch(e) {}
      return NaN;
    }
    function tick(){
      var els = document.querySelectorAll('[data-countdown="1"]');
      var now = Date.now();
      for (var i=0;i<els.length;i++){
        var el = els[i];
        var t = parseTarget(el.getAttribute('data-target')||'');
        if (!isFinite(t)) continue;
        var diff = Math.max(0, t - now);
        var total = Math.floor(diff/1000);
        var d = Math.floor(total/86400);
        var h = Math.floor((total%86400)/3600);
        var m = Math.floor((total%3600)/60);
        var s = total%60;
        var sep = el.getAttribute('data-sep');
        if (sep == null) sep = ' : ';
        var parts = [];

        var sd = el.getAttribute('data-suf-d');
        var sh = el.getAttribute('data-suf-h');
        var sm = el.getAttribute('data-suf-m');
        var ss = el.getAttribute('data-suf-s');

        // Back-compat: infer suffix from current text content (e.g. "00d: 00h: 00m: 00s")
        if ((sd == null || sh == null || sm == null || ss == null) && el.textContent) {
          try {
            var raw = String(el.textContent || '');
            var chunks = raw.split(sep);
            var pick = function(idx){
              try {
                var c = String(chunks[idx] || '');
                return c.replace(/[0-9s]/g, '');
              } catch(e) { return ''; }
            };
            if (sd == null) sd = pick(0);
            if (sh == null) sh = pick(1);
            if (sm == null) sm = pick(2);
            if (ss == null) ss = pick(3);
          } catch(e) {}
        }
        if (sd == null) sd = '';
        if (sh == null) sh = '';
        if (sm == null) sm = '';
        if (ss == null) ss = '';

        if ((el.getAttribute('data-show-d')||'1')==='1') parts.push(pad(d) + sd);
        if ((el.getAttribute('data-show-h')||'1')==='1') parts.push(pad(h) + sh);
        if ((el.getAttribute('data-show-m')||'1')==='1') parts.push(pad(m) + sm);
        if ((el.getAttribute('data-show-s')||'0')==='1') parts.push(pad(s) + ss);
        el.textContent = parts.join(sep);
      }
    }
    tick();
    setInterval(tick, 1000);
  } catch(e) {}
})();
