(function(){
  var ahorro = !!(navigator.connection && navigator.connection.saveData);
  var reducido = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  var quieto = reducido || ahorro;
  if (ahorro) document.documentElement.classList.add('quieto');
  var viewH = window.innerHeight || document.documentElement.clientHeight;

  /* Aparición suave: solo se marcan los bloques que empiezan fuera de la primera pantalla */
  if (!quieto && 'IntersectionObserver' in window) {
    var sel = '.sec h2,.tarjetas>li,.galeria>li,.ev,.datos,.fig,.texto>p,.texto>ul,.fuentes,.migas+*';
    var pendientes = [];
    var obs = new IntersectionObserver(function(es){
      es.forEach(function(e){ if (e.isIntersecting) { e.target.classList.add('en'); obs.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -40px 0px', threshold: 0 });
    [].slice.call(document.querySelectorAll(sel)).forEach(function(el){
      var r = el.getBoundingClientRect();
      if (r.top < viewH) return;
      var k = [].indexOf.call(el.parentNode.children, el) % 4;
      el.style.setProperty('--k', k);
      el.classList.add('rv'); obs.observe(el); pendientes.push(el);
    });
    /* Si se salta de golpe (ancla, scroll rápido), lo que quedó arriba se muestra igual */
    var barrido = function(){ pendientes = pendientes.filter(function(el){
      if (el.classList.contains('en')) return false;
      if (el.getBoundingClientRect().top < window.innerHeight) { el.classList.add('en'); obs.unobserve(el); return false; }
      return true; }); };
    addEventListener('scroll', function(){ requestAnimationFrame(barrido); }, { passive: true });
  }

  /* Parallax leve (máx. 24 px) en imágenes grandes */
  if (!quieto) {
    var pxs = [];
    [].slice.call(document.querySelectorAll('.cab-img img,.hero img,.fig img')).forEach(function(im){
      var w = document.createElement('div'); w.className = 'px on';
      im.parentNode.insertBefore(w, im); w.appendChild(im); pxs.push(w);
    });
    if (pxs.length) {
      var pend = false;
      var pinta = function(){
        pend = false; var h = window.innerHeight;
        pxs.forEach(function(w){
          var r = w.getBoundingClientRect(); if (r.bottom < -50 || r.top > h + 50) return;
          var t = ((r.top + r.height / 2) - h / 2) / h;
          var max = Math.min(24, r.height * 0.05);
          w.style.setProperty('--py', Math.max(-max, Math.min(max, -t * max * 2)).toFixed(1) + 'px');
        });
      };
      var pide = function(){ if (!pend) { pend = true; requestAnimationFrame(pinta); } };
      addEventListener('scroll', pide, { passive: true }); addEventListener('resize', pide); pinta();
    }
  }

  /* Con ahorro de datos no hay transición entre páginas */
  addEventListener('pagereveal', function(e){ if (ahorro && e.viewTransition) e.viewTransition.skipTransition(); });

  /* Menú móvil */
  var mb = document.querySelector('.menu-btn'), nav = document.getElementById('menu');
  if (mb && nav) {
    mb.addEventListener('click', function(){
      var a = nav.classList.toggle('abierto');
      mb.setAttribute('aria-expanded', a ? 'true' : 'false');
    });
    document.addEventListener('keydown', function(e){
      if (e.key === 'Escape' && nav.classList.contains('abierto')) { nav.classList.remove('abierto'); mb.setAttribute('aria-expanded','false'); mb.focus(); }
    });
  }

  /* Franja de eventos: rota sola cada 3 s (decisión del usuario; WCAG 2.2.2: Pausar y Reanudar visibles, pausa con cursor y foco, lista estática con movimiento reducido o sin JS); se detiene con cursor y foco; Pausar y flechas son ayuda */
  var fr = document.querySelector('.franja');
  if (fr) {
    var items = [].slice.call(fr.querySelectorAll('li'));
    var cuenta = fr.querySelector('.f-cuenta'), bPausa = fr.querySelector('.f-pausa');
    var i = 0, pausaManual = false, encima = false, conFoco = false, timer = null;
    if (reducido) { document.documentElement.classList.add('sin-rot'); }
    else if (items.length > 1) {
      var mostrar = function(n){
        i = (n + items.length) % items.length;
        items.forEach(function(li, k){ li.classList.toggle('act', k === i); li.setAttribute('aria-hidden', k === i ? 'false' : 'true'); [].forEach.call(li.querySelectorAll('a'), function(a){ a.tabIndex = k === i ? 0 : -1; }); });
        if (cuenta) cuenta.textContent = (i + 1) + ' de ' + items.length;
      };
      var activo = function(){ return !pausaManual && !encima && !conFoco; };
      var arranca = function(){ clearInterval(timer); timer = setInterval(function(){ if (activo()) mostrar(i + 1); }, 3000); };
      mostrar(0); arranca();
      fr.addEventListener('mouseenter', function(){ encima = true; });
      fr.addEventListener('mouseleave', function(){ encima = false; });
      fr.addEventListener('focusin', function(e){ if (!(bPausa && e.target === bPausa)) conFoco = true; });
      fr.addEventListener('focusout', function(){ conFoco = false; });
      fr.querySelector('.f-prev').addEventListener('click', function(){ mostrar(i - 1); arranca(); });
      fr.querySelector('.f-next').addEventListener('click', function(){ mostrar(i + 1); arranca(); });
      if (bPausa) bPausa.addEventListener('click', function(){
        pausaManual = !pausaManual;
        bPausa.textContent = pausaManual ? 'Reanudar' : 'Pausar';
        bPausa.setAttribute('aria-pressed', pausaManual ? 'true' : 'false');
        if (!pausaManual) { conFoco = false; encima = false; arranca(); }
      });
      document.addEventListener('visibilitychange', function(){ if (!document.hidden) arranca(); });
    }
  }

  /* Filtro de la agenda por área */
  var chips = document.querySelectorAll('.chips button');
  if (chips.length) {
    var evs = [].slice.call(document.querySelectorAll('.ev')), est = document.getElementById('estado-filtro');
    var bloques = [].slice.call(document.querySelectorAll('.bloque')), vacio = document.getElementById('vacio');
    chips.forEach(function(b){ b.addEventListener('click', function(){
      chips.forEach(function(x){ x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      var f = b.getAttribute('data-f'), n = 0;
      evs.forEach(function(e){ var ok = f === 'todas' || (e.getAttribute('data-area') || '').split(' ').indexOf(f) > -1; e.hidden = !ok; if (ok) n++; });
      bloques.forEach(function(bl){ bl.hidden = !bl.querySelector('.ev:not([hidden])'); });
      if (vacio) vacio.hidden = n > 0;
      if (est) est.textContent = f === 'todas' ? '' : (n + (n === 1 ? ' evento' : ' eventos') + ' en «' + b.textContent + '»');
    }); });
  }
})();
