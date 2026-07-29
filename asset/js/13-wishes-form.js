(function(){
  try {
    var toast = function(msg, kind){
      try {
        msg = String(msg||'').trim();
        if (!msg) return;
        var wrap = document.querySelector('.miu-toast-wrap');
        if (!wrap) {
          wrap = document.createElement('div');
          wrap.className = 'miu-toast-wrap';
          document.body.appendChild(wrap);
        }
        var el = document.createElement('div');
        el.className = 'miu-toast';
        el.setAttribute('data-kind', kind || 'info');
        el.textContent = msg;
        wrap.appendChild(el);
        setTimeout(function(){ try { if (el && el.parentNode) el.parentNode.removeChild(el); } catch(e) {} }, 2400);
      } catch(e) {}
    };

    var esc = function(s){ return String(s||'')
      .replace(/&/g,'&amp;')
      .replace(/</g,'&lt;')
      .replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;')
      .replace(/'/g,'&#39;');
    };
    var sections = document.querySelectorAll('[data-miu-wishes="1"]');
    if (!sections || !sections.length) return;

    var attach = function(sec){
      try {
        var id = sec.getAttribute('data-miu-wishes-id') || '';
        var slug = sec.getAttribute('data-slug') || '';
        if (!id || !slug) return;
        var listEl = sec.querySelector('[data-miu-wishes-list="1"][data-miu-wishes-id="' + id.replace(/"/g,'\"') + '"]');
        var form = sec.querySelector('[data-miu-wishes-form="1"][data-miu-wishes-id="' + id.replace(/"/g,'\"') + '"]');
        var moreBtn = sec.querySelector('[data-miu-wishes-more="1"][data-miu-wishes-id="' + id.replace(/"/g,'\"') + '"]');
        if (!form) return;

        var initial = parseInt(sec.getAttribute('data-initial-limit') || '3', 10);
        if (!isFinite(initial) || initial < 1) initial = 3;
        var showN = Math.max(1, initial);
        var cache = null;
        var loading = false;

        var renderItems = function(arr, limit){
          try {
            var out = '';
            for (var i=0;i<Math.min(limit, arr.length);i++) {
              var w = arr[i] || {};
              out += '<div class="miu-wishes-item">'
                + '<div class="miu-wishes-name">' + esc(w.fullname||'') + '</div>'
                + '<div class="miu-wishes-comment">' + esc(w.comment||'') + '</div>'
                + '</div>';
            }
            return out;
          } catch(e) {
            return '';
          }
        };

        var renderPreview = function(){
          try {
            if (!listEl) return;
            var arr = (cache && cache.length) ? cache : [];
            if (!arr.length) {
              var emptyText = String(sec.getAttribute('data-empty-text') || 'Chưa có lời chúc nào');
              listEl.innerHTML = '<div class="miu-wishes-empty">' + esc(emptyText) + '</div>';
              try { listEl.style.display = ''; } catch(e) {}
              if (moreBtn) moreBtn.style.display = 'none';
              return;
            }

            try { listEl.style.display = ''; } catch(e) {}
            if (moreBtn) moreBtn.style.display = '';
            listEl.innerHTML = renderItems(arr, showN);
            if (moreBtn) {
              moreBtn.style.display = (arr.length > showN) ? '' : 'none';
              if (sec.getAttribute('data-loadmore-text')) moreBtn.textContent = sec.getAttribute('data-loadmore-text');
            }
          } catch(e) {}
        };

        var renderAll = function(){
          try { renderPreview(); } catch(e) {}
        };

        var load = function(force){
          try {
            if (loading) return;
            if (!listEl) return;
            if (cache && !force) { renderAll(); return; }
            loading = true;
            fetch('/api/invitations/slug/' + encodeURIComponent(slug) + '/wishes', { cache: 'no-store' })
              .then(function(res){ return res.json().then(function(j){ return { ok: res.ok, json: j }; }); })
              .then(function(out){
                if (!out.ok || !out.json || out.json.success !== true) throw new Error((out.json && out.json.error) || 'Tải thất bại');
                cache = Array.isArray(out.json.data) ? out.json.data : [];
                renderAll();
              })
              .catch(function(err){ toast((err && err.message) ? err.message : 'Có lỗi xảy ra', 'error'); })
              .finally(function(){ loading = false; });
          } catch(e) {}
        };

        if (moreBtn) {
          moreBtn.addEventListener('click', function(){
            try {
              var step = Math.max(3, initial);
              showN = showN + step;
              renderPreview();
              try { listEl.scrollTo({ top: listEl.scrollHeight, behavior: 'smooth' }); } catch(_e) {}
            } catch(e) {}
          }, true);
        }

        form.addEventListener('submit', function(ev){
          try {
            ev.preventDefault();
            var fd = new FormData(form);
            var fullname = String(fd.get('fullname')||'').trim();
            var comment = String(fd.get('comment')||'').trim();
            if (!fullname) { toast('Vui lòng nhập tên', 'error'); return; }
            if (!comment) { toast('Vui lòng nhập lời chúc', 'error'); return; }
            fetch('/api/invitations/slug/' + encodeURIComponent(slug) + '/wishes', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ fullname: fullname, comment: comment })
            }).then(function(res){
              return res.json().then(function(j){ return { ok: res.ok, json: j }; });
            }).then(function(out){
              if (!out.ok || !out.json || out.json.success !== true) throw new Error((out.json && out.json.error) || 'Gửi thất bại');
              try { form.reset(); } catch(_e) {}
              // prepend
              if (!cache) cache = [];
              try { cache.unshift(out.json.data || { fullname: fullname, comment: comment }); } catch(_e) {}
              showN = Math.max(showN, 1);
              toast('Đã gửi lời chúc!', 'success');
              if (listEl) renderAll();
            }).catch(function(err){
              toast((err && err.message) ? err.message : 'Có lỗi xảy ra', 'error');
            });
          } catch(e) {}
        }, true);
        if (listEl) load(false);
      } catch(e) {}
    };

    for (var i=0;i<sections.length;i++) attach(sections[i]);
  } catch(e) {}
})();
