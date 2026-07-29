(function(){
  try {
    var toast = function(msg, kind){
      try {
        msg = String(msg||'').trim();
        if (!msg) return;
        var wrap = document.querySelector('.ton-toast-wrap');
        if (!wrap) {
          wrap = document.createElement('div');
          wrap.className = 'ton-toast-wrap';
          document.body.appendChild(wrap);
        }
        var el = document.createElement('div');
        el.className = 'ton-toast';
        el.setAttribute('data-kind', kind || 'info');
        el.textContent = msg;
        wrap.appendChild(el);
        setTimeout(function(){ try { if (el && el.parentNode) el.parentNode.removeChild(el); } catch(e) {} }, 2000);
      } catch(e) {}
    };

    var overlay = null;
    var overlayContent = null;
    var overlayBackdrop = null;
    var currentModalId = '';

    function ensureOverlay(){
      try {
        if (overlay && overlay.parentNode) return;
        overlay = document.createElement('div');
        overlay.id = 'tonRuntimeModal';
        overlay.style.position = 'fixed';
        overlay.style.inset = '0';
        overlay.style.zIndex = '2147483000';
        overlay.style.display = 'none';
        overlay.style.alignItems = 'center';
        overlay.style.justifyContent = 'center';
        overlay.style.padding = '16px';
        overlay.style.overflow = 'auto';

        overlayBackdrop = document.createElement('div');
        overlayBackdrop.style.position = 'absolute';
        overlayBackdrop.style.inset = '0';
        overlayBackdrop.style.background = 'rgba(0,0,0,0.45)';

        overlayContent = document.createElement('div');
        overlayContent.style.position = 'relative';
        overlayContent.style.maxWidth = '100%';
        overlayContent.style.boxSizing = 'border-box';
        overlayContent.style.boxShadow = '0 18px 60px rgba(0,0,0,0.35)';
        overlayContent.style.overflow = 'hidden';

        overlay.appendChild(overlayBackdrop);
        overlay.appendChild(overlayContent);
        document.body.appendChild(overlay);
      } catch(_e) {}
    }

    function closeModal(){
      try {
        currentModalId = '';
        if (overlayContent) overlayContent.innerHTML = '';
        if (overlay) overlay.style.display = 'none';
      } catch(_e) {}
    }

    function openModal(modalId){
      try {
        modalId = String(modalId || '').trim();
        if (!modalId) return;
        ensureOverlay();
        var tpl = document.getElementById('ton-modal-tpl-' + modalId);
        if (!tpl) return;

        currentModalId = modalId;
        var html = '';
        try { html = tpl.innerHTML || ''; } catch(_e) { html = ''; }

        var bg = tpl.getAttribute('data-bg') || '#ffffff';
        var mw = parseFloat(tpl.getAttribute('data-w') || '520');
        var mh = parseFloat(tpl.getAttribute('data-h') || '420');
        if (!isFinite(mw) || mw <= 0) mw = 520;
        if (!isFinite(mh) || mh <= 0) mh = 420;
        var radius = parseFloat(tpl.getAttribute('data-radius') || '18');
        if (!isFinite(radius)) radius = 18;
        var pres = tpl.getAttribute('data-pres') || 'center';
        var closeOnBackdrop = (tpl.getAttribute('data-close-backdrop') || '1') === '1';
        var showCloseButton = (tpl.getAttribute('data-show-close') || '1') === '1';

        var vw = 0;
        var vh = 0;
        try { vw = Number(window.innerWidth || 0); } catch(_e) { vw = 0; }
        try { vh = Number(window.innerHeight || 0); } catch(_e) { vh = 0; }
        if (!vw) vw = 1200;
        if (!vh) vh = 800;
        var stage = null;
        try { stage = document.querySelector('.ton-stage'); } catch(_e) { stage = null; }
        var boundW = vw;
        try {
          var sw = stage && stage.clientWidth ? Number(stage.clientWidth) : 0;
          if (sw && isFinite(sw)) boundW = Math.min(boundW, sw);
        } catch(_e) {}
        var availW = Math.max(1, boundW - 24);
        var availH = Math.max(1, vh - 120);
        var s = Math.min(1, Math.min(availW / mw, availH / mh));
        if (!isFinite(s) || s <= 0) s = 1;
        if (s < 0.2) s = 0.2;

        overlay.style.display = 'flex';
        overlay.style.alignItems = pres === 'bottom_sheet' ? 'flex-end' : 'center';
        overlay.style.justifyContent = 'center';

        overlayContent.style.background = bg;
        overlayContent.style.borderRadius = pres === 'bottom_sheet' ? (radius + 'px ' + radius + 'px 0 0') : (radius + 'px');
        overlayContent.style.width = (mw * s) + 'px';
        overlayContent.style.height = (mh * s) + 'px';
        overlayContent.style.marginTop = pres === 'bottom_sheet' ? 'auto' : '0';
        overlayContent.style.marginBottom = pres === 'bottom_sheet' ? '0' : '0';

        overlayContent.innerHTML =
          (showCloseButton
            ? '<button type="button" data-ton-modal-close="1" style="position:absolute;top:10px;right:10px;width:36px;height:36px;border-radius:999px;border:1px solid rgba(0,0,0,0.12);background:rgba(255,255,255,0.95);cursor:pointer;display:flex;align-items:center;justify-content:center;z-index:5">×</button>'
            : '') +
          '<div style="position:absolute;inset:0;overflow:hidden;">' +
            '<div style="transform:scale(' + s + ');transform-origin:top left;width:' + mw + 'px;height:' + mh + 'px;position:relative;">' +
              html +
            '</div>' +
          '</div>';

        overlayBackdrop.onclick = function(ev){
          try {
            if (!closeOnBackdrop) return;
            if (ev && ev.target !== overlayBackdrop) return;
            closeModal();
          } catch(_e) {}
        };
      } catch(_e) {}
    }

    document.addEventListener('keydown', function(e){
      try {
        if (!overlay || overlay.style.display === 'none') return;
        if (e && e.key === 'Escape') {
          e.preventDefault();
          closeModal();
        }
      } catch(_e) {}
    }, true);

    var onClick = function(e){
      try {
        var t = e && e.target;
        if (!t) return;

        // Close button inside modal
        var closeBtn = (t.closest && t.closest('[data-ton-modal-close="1"]')) ? t.closest('[data-ton-modal-close="1"]') : null;
        if (closeBtn) {
          closeModal();
          e.preventDefault();
          e.stopPropagation();
          return;
        }

        var btn = (t.closest && t.closest('[data-ton-btn="1"]')) ? t.closest('[data-ton-btn="1"]') : null;
        if (!btn) return;
        var action = btn.getAttribute('data-action') || '';
        var url = btn.getAttribute('data-url') || '';
        var newTab = btn.getAttribute('data-newtab') === '1';
        var targetId = btn.getAttribute('data-target-id') || '';
        var copyValue = btn.getAttribute('data-copy') || '';
        var modalId = btn.getAttribute('data-modal-id') || '';

        if (action === 'modal' && modalId) {
          openModal(modalId);
          e.preventDefault();
          return;
        }
        if (action === 'modal_close') {
          closeModal();
          e.preventDefault();
          return;
        }
        if (action === 'link' && url) {
          if (newTab) window.open(url, '_blank', 'noopener,noreferrer');
          else window.location.href = url;
          e.preventDefault();
          return;
        }
        if (action === 'scroll' && targetId) {
          var el = document.getElementById(targetId) || document.querySelector('[data-node-id="' + targetId.replace(/"/g,'\"') + '"]');
          if (el && el.scrollIntoView) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          e.preventDefault();
          return;
        }
        if (action === 'copy' && copyValue) {
          try {
            if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(copyValue);
          } catch(_) {}
          try { toast('Đã copy', 'success'); } catch(_) {}
          e.preventDefault();
          return;
        }
      } catch(_e) {}
    };
    document.addEventListener('click', onClick, true);
  } catch(e) {}
})();
