/**
 * Chấm sáng nhỏ nhấp nháy bay lên (đom đóm / bokeh dây đèn).
 *
 * Chỉ tạo DOM một lần rồi để CSS lo phần chuyển động (xem 05-fireflies.css),
 * không dùng requestAnimationFrame nên không tốn CPU khi chạy.
 *
 * Lớp phủ nằm ở z-index 30: trên nội dung canvas (0–20), dưới FAB dock (9999),
 * phong bì mở thiệp (12000) và modal (20000).
 */
(function(){
  try {
    // Người xem đã bật "giảm chuyển động" thì không tạo gì cả.
    try {
      if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    } catch(e) {}

    if (document.querySelector('.ton-fireflies')) return;

    var layer = document.createElement('div');
    layer.className = 'ton-fireflies';
    layer.setAttribute('aria-hidden', 'true');
    layer.setAttribute('data-on', '0');

    // Số chấm theo bề rộng thực của lớp phủ (thiệp rộng 575px là tối đa).
    var vw = 575;
    try {
      var iw = window.innerWidth || 575;
      vw = Math.min(575, iw <= 480 ? iw : iw - 32);
    } catch(e) {}
    var count = Math.max(11, Math.min(17, Math.round(vw / 34)));

    // Chia bề rộng thành từng dải, mỗi dải một chấm + xê dịch ngẫu nhiên.
    // Cách này tránh việc các chấm dồn cục vào một chỗ.
    var band = 100 / count;
    for (var i = 0; i < count; i++) {
      var dot = document.createElement('span');
      dot.className = 'ton-firefly';

      var x     = (i * band) + (Math.random() * band * 0.82) + (band * 0.09);
      var size  = 3 + Math.random() * 2.5;             // 3 – 5.5px lõi; quầng loe theo tỉ lệ
      var dur   = 15 + Math.random() * 11;             // 15 – 26s, bay rất chậm
      var tw    = 1.7 + Math.random() * 2.1;           // 1.7 – 3.8s, nhịp nhấp nháy
      var sway  = 12 + Math.random() * 20;             // biên độ lượn ngang
      // Delay âm: các chấm đã ở lưng chừng hành trình ngay khi hiện ra,
      // thay vì cùng lúc bật lên từ đáy màn hình.
      var delay = -(Math.random() * dur);

      if (Math.random() < 0.5) sway = -sway;

      var s = dot.style;
      s.setProperty('--ff-x',     x.toFixed(2) + '%');
      s.setProperty('--ff-size',  size.toFixed(2) + 'px');
      s.setProperty('--ff-dur',   dur.toFixed(2) + 's');
      s.setProperty('--ff-tw',    tw.toFixed(2) + 's');
      s.setProperty('--ff-sway',  sway.toFixed(1) + 'px');
      s.setProperty('--ff-delay', delay.toFixed(2) + 's');

      dot.appendChild(document.createElement('i'));
      layer.appendChild(dot);
    }

    (document.body || document.documentElement).appendChild(layer);

    var on = function(){
      try { layer.setAttribute('data-on', '1'); } catch(e) {}
    };

    // Hiện lên đúng lúc thiệp bắt đầu mở ra. Lớp phủ nằm dưới phong bì
    // (z-index 30 < 12000) nên trước đó có bật cũng không ai thấy.
    try { window.addEventListener('ton:opening:willClose', on, { once: true }); } catch(e) {}
    try { window.addEventListener('ton:opening:closed', on, { once: true }); } catch(e) {}

    // Dự phòng: nếu màn mở thiệp bị bỏ qua hoặc không tồn tại thì bật luôn.
    try {
      setTimeout(function(){
        try {
          var opening = document.getElementById('tonOpening');
          if (!opening) { on(); return; }
          if (opening.getAttribute('data-open') !== '1') on();
        } catch(e) { on(); }
      }, 600);
    } catch(e) {}

    // Chuyển tab thì tạm dừng cho đỡ tốn pin.
    try {
      document.addEventListener('visibilitychange', function(){
        try {
          layer.setAttribute('data-paused', document.hidden ? '1' : '0');
        } catch(e) {}
      }, { passive: true });
    } catch(e) {}
  } catch(e) {}
})();
