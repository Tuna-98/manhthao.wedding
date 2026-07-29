(function(){
  try {
    var dock = document.getElementById('miuFabDock');
    var t = document.getElementById('miuFabToggle');
    if (!dock || !t) return;

    try {
      var key = 'miu_fab_dock_open';
      var stored = localStorage.getItem(key);
      if (stored === '0' || stored === '1') {
        dock.setAttribute('data-open', stored);
      }
    } catch(e) {}

    t.addEventListener('click', function(){
      try {
        var open = dock.getAttribute('data-open') === '1';
        var next = open ? '0' : '1';
        dock.setAttribute('data-open', next);
        try { localStorage.setItem('miu_fab_dock_open', next); } catch(e) {}
      } catch(e) {}
    }, true);

    var showTip = function(btn){
      try {
        if (!btn) return;
        btn.classList.add('miu-tip');
        setTimeout(function(){ try{btn.classList.remove('miu-tip');}catch(e){} }, 1200);
      } catch(e) {}
    };
    dock.addEventListener('touchstart', function(e){
      try {
        var target = e && e.target ? e.target : null;
        if (!target) return;
        var btn = (target.closest && target.closest('.miu-fab-item')) ? target.closest('.miu-fab-item') : null;
        if (!btn) return;
        showTip(btn);
      } catch(err) {}
    }, {passive:true});
  } catch(e) {}
})();
