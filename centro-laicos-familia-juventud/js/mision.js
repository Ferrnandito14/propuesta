(function(){
  /* Misión de los laicos: el trazo se dibuja con el scroll y cada frase aparece al llegar. Sin JS, con movimiento reducido o con Save-Data se ve todo fijo. */
  var sec = document.querySelector('.mision');
  var ahorro = !!(navigator.connection && navigator.connection.saveData);
  var reducido = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!sec || reducido || ahorro || !('IntersectionObserver' in window)) return;
  var lista = sec.querySelector('.mision-lista'), items = [].slice.call(lista.children);
  sec.classList.add('mision-anim');
  var obs = new IntersectionObserver(function(es){ es.forEach(function(e){ if (e.isIntersecting) { e.target.classList.add('en'); obs.unobserve(e.target); } }); }, { rootMargin: '0px 0px -15% 0px', threshold: 0.2 });
  items.forEach(function(li){ obs.observe(li); });
  var pend = false;
  function pinta(){ pend = false; var r = lista.getBoundingClientRect(), h = window.innerHeight; var p = (h * 0.75 - r.top) / r.height; lista.style.setProperty('--p', Math.max(0, Math.min(1, p)).toFixed(3)); }
  function pide(){ if (!pend) { pend = true; requestAnimationFrame(pinta); } }
  addEventListener('scroll', pide, { passive: true }); addEventListener('resize', pide); pinta();
})();
