(function(){
  var reducido = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

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

  /* Franja de eventos: rota sola cada 9,5 s; se detiene con cursor y foco; Pausar y flechas son ayuda */
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
      var arranca = function(){ clearInterval(timer); timer = setInterval(function(){ if (activo()) mostrar(i + 1); }, 9500); };
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
