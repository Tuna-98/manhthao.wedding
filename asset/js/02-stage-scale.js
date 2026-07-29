(function(){
      try {
        var cw = 575;
        var phone = 600;
        var vw = 0;
        try { vw = Math.max(0, Number(window.innerWidth || 0)); } catch(e) { vw = 0; }
        if (!cw || !vw) return;
        var sw = vw <= 480 ? vw : Math.min(phone, Math.max(0, vw - 32));
        var s = Math.min(1, sw / cw);
        document.documentElement.style.setProperty('--miu-s', String(s));
      } catch(e) {}
    })();
