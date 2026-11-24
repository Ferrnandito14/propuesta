(function(){
  /* Videos de YouTube: se reproducen mudos solo cuando el visible, de a uno; el sonido solo con el botón.
     Con movimiento reducido, ahorro de datos o sin JS queda el enlace a YouTube. */
  var ahorro = !!(navigator.connection && navigator.connection.saveData);
  var reducido = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var bloques = [].slice.call(document.querySelectorAll('.vid'));
  if (!bloques.length || reducido || ahorro || !('IntersectionObserver' in window)) return;
  var ORIGEN = 'https://www.youtube-nocookie.com';
  var estado = [];
  function cmd(ifr, f, args){ try { ifr.contentWindow.postMessage(JSON.stringify({ event: 'command', func: f, args: args || [] }), ORIGEN); } catch(e){} }

  bloques.forEach(function(b){
    var ratio = 0, ifr = null, listo = false, quiere = false, sonando = false;
    var boton = b.parentNode.querySelector('.vid-son');
    var o = { b: b, ratio: 0 };
    o.crear = function(){
      if (ifr) return;
      ifr = document.createElement('iframe');
      ifr.src = ORIGEN + '/embed/' + b.getAttribute('data-id') + '?enablejsapi=1&mute=1&playsinline=1&rel=0&modestbranding=1';
      ifr.title = 'Video: ' + (b.parentNode.querySelector('h3') || {}).textContent;
      ifr.allow = 'autoplay; encrypted-media; picture-in-picture';
      ifr.setAttribute('allowfullscreen', '');
      ifr.loading = 'lazy';
      ifr.addEventListener('load', function(){ listo = true; if (quiere) cmd(ifr, 'playVideo'); });
      b.classList.add('vid-listo');
      b.appendChild(ifr);
    };
    o.play = function(){ o.crear(); quiere = true; if (listo) cmd(ifr, 'playVideo'); if (boton) boton.hidden = false; };
    o.pausa = function(){ quiere = false; if (ifr && listo) { cmd(ifr, 'pauseVideo'); if (sonando) { cmd(ifr, 'mute'); sonando = false; if (boton) { boton.textContent = 'Activar sonido'; boton.setAttribute('aria-pressed', 'false'); } } } };
    if (boton) boton.addEventListener('click', function(){
      if (!ifr) return;
      sonando = !sonando;
      cmd(ifr, sonando ? 'unMute' : 'mute');
      if (sonando) cmd(ifr, 'setVolume', [80]);
      boton.textContent = sonando ? 'Silenciar' : 'Activar sonido';
      boton.setAttribute('aria-pressed', sonando ? 'true' : 'false');
    });
    estado.push(o);
  });

  var cerca = new IntersectionObserver(function(es){ es.forEach(function(e){ if (e.isIntersecting) { var o = estado.filter(function(x){ return x.b === e.target; })[0]; if (o) o.crear(); } }); }, { rootMargin: '300px 0px' });
  bloques.forEach(function(b){ cerca.observe(b); });

  var vis = new IntersectionObserver(function(es){
    es.forEach(function(e){ var o = estado.filter(function(x){ return x.b === e.target; })[0]; if (o) o.ratio = e.intersectionRatio; });
    var mejor = estado.slice().sort(function(a, b){ return b.ratio - a.ratio; })[0];
    estado.forEach(function(o){ if (o === mejor && o.ratio >= 0.5) o.play(); else o.pausa(); });
  }, { threshold: [0, 0.25, 0.5, 0.75, 1] });
  bloques.forEach(function(b){ vis.observe(b); });
  document.addEventListener('visibilitychange', function(){ if (document.hidden) estado.forEach(function(o){ o.pausa(); }); });
})();
