(function(){
  try {
    var isZalo = function(){
      try {
        var ua = String(navigator.userAgent || '');
        if (!ua) return false;
        // Zalo iOS/Android
        if (/Zalo/i.test(ua)) return true;
        return false;
      } catch(e) {
        return false;
      }
    };

    var isIOS = function(){
      try {
        var ua = String(navigator.userAgent || '');
        if (!ua) return false;
        return /iPhone|iPad|iPod/i.test(ua);
      } catch(e) {
        return false;
      }
    };

    var hasVipVideo = function(){
      try {
        return !!document.querySelector('video[data-vip-video="1"], video[data-vip-video="true"], [data-vip-video="true"], [data-vip-video="1"]');
      } catch(e) {
        return false;
      }
    };

    var swapVipVideosToGif = function(){
      try {
        var vids = document.querySelectorAll('video[data-vip-video="1"], video[data-vip-video="true"], video[data-vip-video]');
        for (var i=0;i<vids.length;i++) {
          try {
            var v = vids[i];
            if (!v) continue;
            var src = String(v.getAttribute('src') || '');
            if (!src) continue;

            // Convert any .../api/vip-video/<name>.mp4 to .../api/vip-video/<name>.gif
            // Also handle .../vipvideo/<name>.mp4 just in case.
            var gifSrc = src;
            try {
              gifSrc = gifSrc.replace(/\.(mp4|webm|ogg)(\?.*)?$/i, '.gif$2');
            } catch(_e1) {}
            try {
              gifSrc = gifSrc.replace('/vipvideo/', '/api/vip-video/');
            } catch(_e2) {}

            var img = document.createElement('img');
            img.setAttribute('src', gifSrc);
            img.setAttribute('alt', '');
            try { img.setAttribute('decoding', 'async'); } catch(_e3) {}
            try { img.setAttribute('loading', 'eager'); } catch(_e4) {}

            // Preserve sizing/fit similar to the <video>
            try {
              img.style.width = '100%';
              img.style.height = '100%';
              img.style.objectFit = 'cover';
              img.style.display = 'block';
            } catch(_e5) {}
            try {
              var cs = v.getAttribute('style');
              if (cs) img.setAttribute('style', cs + ';width:100%;height:100%;object-fit:cover;display:block;');
            } catch(_e6) {}

            try {
              var parent = v.parentNode;
              if (!parent) continue;
              parent.replaceChild(img, v);
            } catch(_e7) {}
          } catch(_e8) {}
        }
      } catch(e) {}
    };

    var renderGate = function(){
      try {
        var href = String(location.href || '');
        var cleanHref = href;
        var html = '' +
          '<div style="position:fixed;inset:0;z-index:2147483647;background:#0b1220;color:#fff;padding:24px;">' +
            '<div style="position:absolute;top:10px;right:10px;left:10px;height:120px;pointer-events:none;">' +
              '<div style="position:absolute;top:6px;right:6px;width:190px;text-align:right;font-size:13px;opacity:0.95;line-height:1.35;">Bấm dấu <b>3 chấm</b> góc phải</div>' +
              '<div style="position:absolute;top:30px;right:78px;width:120px;height:60px;">' +
                '<svg viewBox="0 0 120 60" width="120" height="60" style="display:block;">' +
                  '<path d="M5,55 C40,20 70,20 112,10" fill="none" stroke="rgba(255,255,255,0.92)" stroke-width="3" stroke-linecap="round" />' +
                  '<path d="M112,10 L98,6 L102,20 Z" fill="rgba(255,255,255,0.92)" />' +
                '</svg>' +
              '</div>' +
            '</div>' +
            '<div style="max-width:560px;margin:0 auto;padding-top:120px;">' +
              '<div style="font-size:18px;font-weight:800;line-height:1.35;">Thiệp VIP: Mở thiệp bằng Safari để có trải nghiệp tốt nhất!</div>' +
              '<div style="margin-top:14px;font-size:14px;line-height:1.6;">' +
                '<div style="margin-top:8px;"><b>Bước 1:</b> Bấm dấu <b>3 chấm</b> ở góc phải trên.</div>' +
                '<div style="margin-top:8px;"><b>Bước 2:</b> Chọn <b>Mở bằng Safari</b>.</div>' +
              '</div>' +
              '<div style="margin-top:16px;padding:12px 14px;border-radius:14px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.14);">' +
                '<div style="font-size:12px;opacity:0.9;line-height:1.5;">Nếu bạn không thấy mục “Mở bằng Safari”, hãy dùng cách dự phòng:</div>' +
                '<div style="margin-top:10px;display:flex;gap:10px;flex-wrap:wrap;">' +
                  '<button id="tonCopyLink" type="button" style="display:inline-flex;align-items:center;justify-content:center;padding:12px 14px;border-radius:12px;background:#ffffff;color:#0b1220;border:0;font-weight:800;">Sao chép link</button>' +
                  '<button id="tonShareLink" type="button" style="display:inline-flex;align-items:center;justify-content:center;padding:12px 14px;border-radius:12px;background:rgba(255,255,255,0.12);color:#fff;border:1px solid rgba(255,255,255,0.18);font-weight:700;">Chia sẻ</button>' +
                '</div>' +
              '</div>' +
            '</div>' +
          '</div>';
        document.documentElement.style.background = '#0b1220';
        var mount = document.body;
        if (!mount) {
          try { mount = document.getElementsByTagName('body')[0]; } catch(e) {}
        }
        if (!mount) {
          return;
        }
        mount.innerHTML = html;

        // Share sheet (iOS) gives the user a native way to open in Safari.
        try {
          var shareBtn = document.getElementById('tonShareLink');
          if (shareBtn) {
            shareBtn.addEventListener('click', function(){
              try {
                if (navigator.share) {
                  var p = navigator.share({ url: cleanHref, title: document.title || 'Thiệp mời' });
                  try { if (p && typeof p.catch === 'function') p.catch(function(){}); } catch(e) {}
                  return;
                }
              } catch(e) {}
              try {
                var copyBtn = document.getElementById('tonCopyLink');
                if (copyBtn && typeof copyBtn.click === 'function') copyBtn.click();
              } catch(e) {}
            }, { passive: true });
          }
        } catch(e) {}

        // Copy link button
        try {
          var copyBtn2 = document.getElementById('tonCopyLink');
          if (copyBtn2) {
            copyBtn2.addEventListener('click', function(){
              try {
                var done = false;
                if (navigator.clipboard && navigator.clipboard.writeText) {
                  var pp = navigator.clipboard.writeText(cleanHref);
                  done = true;
                  try { if (pp && typeof pp.catch === 'function') pp.catch(function(){}); } catch(e) {}
                }
                if (!done) {
                  var ta = document.createElement('textarea');
                  ta.value = cleanHref;
                  ta.setAttribute('readonly','');
                  ta.style.position = 'fixed';
                  ta.style.left = '-9999px';
                  document.body.appendChild(ta);
                  ta.select();
                  try { document.execCommand('copy'); } catch(e) {}
                  try { document.body.removeChild(ta); } catch(e) {}
                }
              } catch(e) {}
              try { alert('Đã sao chép link. Bạn hãy dán vào Safari/Chrome để mở.'); } catch(e) {}
            }, { passive: true });
          }
        } catch(e) {}
      } catch(e) {}
    };

    // Gate only for Zalo iOS AND only when VIP video exists
    if (isZalo() && isIOS() && hasVipVideo()) {
      try {
        if (!document.body) {
          window.addEventListener('DOMContentLoaded', function(){
            try { renderGate(); } catch(e) {}
          }, { once: true });
        } else {
          renderGate();
        }
      } catch(e) {
        renderGate();
      }
      return;
    }

    // Zalo (both iOS/Android): swap VIP <video> to <img> with .gif source for better compatibility.
    if (isZalo() && hasVipVideo()) {
      try {
        if (!document.body) {
          window.addEventListener('DOMContentLoaded', function(){
            try { swapVipVideosToGif(); } catch(e) {}
          }, { once: true });
        } else {
          swapVipVideosToGif();
        }
      } catch(e) {}
    }

    var playAll = function(){
      try {
        var vids = document.querySelectorAll('video[data-ton-play-on-opening-closed="1"]');
        for (var i=0;i<vids.length;i++) {
          try {
            var v = vids[i];
            if (!v) continue;
            // Ensure no looping; keep last frame when ended
            try { v.loop = false; } catch(_e) {}
            // Only attempt once
            if (v.getAttribute('data-ton-played') === '1') continue;
            v.setAttribute('data-ton-played','1');
            // Autoplay policies require muted; we render muted already
            var p = v.play && v.play();
            try { if (p && typeof p.catch === 'function') p.catch(function(){}); } catch(_e2) {}
          } catch(_e3) {}
        }
      } catch(_e4) {}
    };

    var getOpeningState = function(){
      try {
        var opening = document.getElementById('tonOpening');
        if (!opening) return { exists: false, open: false };
        var openAttr = String(opening.getAttribute('data-open') || '');
        return { exists: true, open: openAttr === '1' };
      } catch(e) {
        return { exists: false, open: false };
      }
    };

    var st = getOpeningState();
    if (!st.exists || !st.open) {
      // No opening cover, or already closed
      setTimeout(playAll, 0);
      return;
    }

    var onClosed = function(){
      try { window.removeEventListener('ton:opening:closed', onClosed, true); } catch(_e) {}
      playAll();
    };
    window.addEventListener('ton:opening:closed', onClosed, true);
  } catch(e) {}
})();
