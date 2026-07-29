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

    var sections = document.querySelectorAll('[data-miu-rsvp="1"]');
    if (!sections || !sections.length) return;
    var attach = function(sec){
      try {
        var id = sec.getAttribute('data-miu-rsvp-id') || '';
        var slug = sec.getAttribute('data-slug') || '';
        if (!id || !slug) return;
        var form = sec.querySelector('[data-miu-rsvp-form="1"][data-miu-rsvp-id="' + id.replace(/"/g,'\"') + '"]');
        if (!form) return;
        form.addEventListener('submit', function(ev){
          try {
            ev.preventDefault();
            var fd = new FormData(form);
            var guestName = String(fd.get('guestName')||'').trim();
            var willAttend = String(fd.get('willAttend')||'yes') === 'yes';
            var eventType = String(fd.get('eventType')||'').trim();
            var eventName = String(fd.get('eventName')||'').trim();
            var message = String(fd.get('message')||'').trim();
            var hasNumField = (function(){
              try {
                return fd.get('numberOfGuests') !== null;
              } catch(e) { return false; }
            })();
            var hasExtraCheckbox = (function(){
              try {
                return fd.get('extraCheckbox') !== null;
              } catch(e) { return false; }
            })();
            var hasExtraOptions = (function(){
              try {
                return fd.getAll('extraOptions').length > 0;
              } catch(e) { return false; }
            })();
            var hasExtraOther = (function(){
              try {
                return fd.get('extraOther') !== null;
              } catch(e) { return false; }
            })();
            var num = (function(){
              try {
                if (!hasNumField) return 1;
                var raw = String(fd.get('numberOfGuests')||'').trim();
                var n = parseInt(raw, 10);
                if (!isFinite(n) || n < 1) return 1;
                if (n > 50) return 50;
                return n;
              } catch(e) { return 1; }
            })();
            if (!guestName) { toast('Vui lòng nhập họ tên', 'error'); return; }
            var payload = { guestName: guestName, willAttend: willAttend, eventType: eventType, eventName: eventName, message: message };
            if (hasNumField) payload.numberOfGuests = num;
            if (hasExtraCheckbox) payload.extraCheckbox = String(fd.get('extraCheckbox')||'') === '1';
            if (hasExtraOptions) {
              try {
                payload.extraOptions = fd.getAll('extraOptions').map(function(x){ return String(x||'').trim(); }).filter(Boolean);
              } catch(e) {}
            }
            if (hasExtraOther) {
              try {
                var otherChecked = String(fd.get('extraOtherChecked')||'') === '1';
                var otherText = String(fd.get('extraOther')||'').trim();
                if (otherChecked && otherText) payload.extraOther = otherText;
              } catch(e) {}
            }

            try {
              var custom = {};
              var customOtherText = {};
              var customOtherSelected = {};
              fd.forEach(function(v, k){
                try {
                  k = String(k||'');
                  if (k.indexOf('cf_') !== 0) return;
                  if (k.indexOf('__otherText') > -1) {
                    try {
                      var baseKey = k.slice(3).replace(/__otherText.*$/, '');
                      var ov = String(v||'').trim();
                      if (baseKey && ov) customOtherText[baseKey] = ov;
                    } catch(_e2) {}
                    return;
                  }

                  var kk = k.slice(3);
                  if (!kk) return;
                  var vv = String(v||'').trim();
                  if (!vv) return;
                  if (vv === '__other__') {
                    customOtherSelected[kk] = true;
                    return;
                  }
                  if (custom[kk]) {
                    custom[kk] = String(custom[kk]) + ', ' + vv;
                  } else {
                    custom[kk] = vv;
                  }
                } catch(_e) {}
              });

              try {
                for (var k2 in customOtherSelected) {
                  if (!customOtherSelected.hasOwnProperty(k2)) continue;
                  var txt = customOtherText[k2];
                  if (!txt) continue;
                  if (custom[k2]) custom[k2] = String(custom[k2]) + ', ' + String(txt);
                  else custom[k2] = String(txt);
                }
              } catch(_e3) {}

              if (custom && Object.keys(custom).length) payload.customFields = custom;
            } catch(e) {}

            fetch('/api/invitations/slug/' + encodeURIComponent(slug) + '/rsvp', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
            })
            .then(function(res){
              return res.json().then(function(j){ return { ok: res.ok, json: j }; });
            }).then(function(out){
              if (!out.ok || !out.json || out.json.success !== true) throw new Error((out.json && out.json.error) || 'Gửi thất bại');
              try { form.reset(); } catch(_e) {}
              toast('Đã gửi xác nhận. Cảm ơn bạn!', 'success');
            }).catch(function(err){
              toast((err && err.message) ? err.message : 'Có lỗi xảy ra', 'error');
            });
          } catch(e) {}
        }, true);
      } catch(e) {}
    };
    for (var i=0;i<sections.length;i++) attach(sections[i]);
  } catch(e) {}
})();
