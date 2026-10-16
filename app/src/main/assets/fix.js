(function () {
  // Viewport corretto per smartphone
  var m = document.querySelector('meta[name=viewport]');
  if (!m) { m = document.createElement('meta'); m.name = 'viewport'; document.head.appendChild(m); }
  m.content = 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no';

  // Altezza reale della topbar (serve per il padding del contenuto)
  function upd() {
    var t = document.getElementById('topbar');
    if (t) document.documentElement.style.setProperty('--tb-h', t.offsetHeight + 'px');
  }
  upd();
  setTimeout(upd, 300);
  setTimeout(upd, 1200);
  window.addEventListener('resize', upd);
  var tb = document.getElementById('topbar');
  if (tb && window.ResizeObserver) { new ResizeObserver(upd).observe(tb); }

  if (document.getElementById('app-fix')) return;

  var css = [
    'html,body{max-width:100vw;overflow-x:hidden;-webkit-text-size-adjust:100%;}',
    '@media(max-width:1000px){',

    /* ── TOPBAR: due righe distinte per le ricerche ── */
    '#topbar.topbar{height:auto!important;left:0!important;right:0!important;flex-wrap:wrap!important;padding:.5rem .75rem!important;gap:.5rem!important;}',
    '#searchMainWrap.search-main-wrap,#searchDocWrap.search-doc-wrap{flex:1 1 100%!important;max-width:none!important;width:100%!important;}',
    '#taskWrapTop,#chgWrap{flex:1 1 40%!important;}',
    '#taskBtnTop,#chgBtn{width:100%!important;justify-content:center!important;}',
    '#taskDropTop,#chgDrop{position:fixed!important;left:.5rem!important;right:.5rem!important;width:auto!important;top:var(--tb-h,100px)!important;}',
    '.main,.main-content{padding-top:calc(var(--tb-h,100px) + .75rem)!important;}',

    /* ── Contenuto ── */
    '.main,.main-content{margin-left:0!important;padding-left:.75rem!important;padding-right:.75rem!important;max-width:100vw!important;box-sizing:border-box!important;}',
    '.main table,.main-content table{display:block;overflow-x:auto;max-width:100%;-webkit-overflow-scrolling:touch;}',
    'input,select,textarea{font-size:16px!important;max-width:100%;}',
    '[style*="grid-template-columns"]{grid-template-columns:1fr!important;}',

    /* ── LISTA CLIENTI: card al posto della tabella ── */
    '.card-lista{padding:.25rem!important;background:transparent!important;box-shadow:none!important;}',
    '.card-lista .table-wrap{border:0!important;overflow:visible!important;margin-top:0!important;}',
    '#tabellaClienti,#tabellaClienti tbody{display:block!important;overflow:visible!important;width:100%!important;max-width:none!important;}',
    '#tabellaClienti thead{display:none!important;}',
    '#tabellaClienti tr.cliente-row{display:grid!important;grid-template-columns:1fr 1fr 1fr;',
      'grid-template-areas:"nome nome x" "cod tel tel" "pag acq real" "azioni azioni azioni";',
      'gap:.45rem .5rem;background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:.8rem;margin:0 0 .65rem;box-shadow:0 1px 3px rgba(0,0,0,.06);}',
    '#tabellaClienti tr.cliente-row.row-azienda{background:#fffbeb;border-color:#fde68a;}',
    '#tabellaClienti tr.hidden-row{display:none!important;}',
    '#tabellaClienti td{display:block!important;padding:0!important;border:0!important;background:transparent!important;text-align:left!important;white-space:normal!important;min-width:0;}',
    '#tabellaClienti td:nth-child(1){grid-area:x;justify-self:end;}',
    '#tabellaClienti td:nth-child(2){grid-area:cod;align-self:center;}',
    '#tabellaClienti td:nth-child(3){grid-area:nome;}',
    '#tabellaClienti td:nth-child(4){grid-area:tel;text-align:right!important;align-self:center;}',
    '#tabellaClienti td:nth-child(5){grid-area:pag;}',
    '#tabellaClienti td:nth-child(6){grid-area:acq;}',
    '#tabellaClienti td:nth-child(7){grid-area:real;}',
    '#tabellaClienti td:nth-child(8){grid-area:azioni;margin-top:.25rem;}',
    '#tabellaClienti td:nth-child(5),#tabellaClienti td:nth-child(6),#tabellaClienti td:nth-child(7){background:#f8fafc!important;border-radius:8px;padding:.4rem .3rem!important;text-align:center!important;}',
    '#tabellaClienti td:nth-child(5)::before{content:"Pagato";}',
    '#tabellaClienti td:nth-child(6)::before{content:"Acquisti";}',
    '#tabellaClienti td:nth-child(7)::before{content:"Realizzo";}',
    '#tabellaClienti td:nth-child(5)::before,#tabellaClienti td:nth-child(6)::before,#tabellaClienti td:nth-child(7)::before{display:block;font-size:.62rem;font-weight:600;color:#6b7280;text-transform:uppercase;margin-bottom:.1rem;}',
    '#tabellaClienti .nome-cell{white-space:normal!important;}',
    '#tabellaClienti .nome-cell strong{font-size:1rem!important;}',
    '#tabellaClienti .btn-x{width:34px!important;height:34px!important;font-size:1.3rem!important;}',
    '#tabellaClienti .btn-group{display:grid!important;grid-template-columns:1fr 1fr 1fr;gap:.4rem;}',
    '#tabellaClienti .btn-group .btn{justify-content:center;padding:.65rem .2rem!important;font-size:.82rem!important;}',

    '}'
  ].join('');

  var s = document.createElement('style');
  s.id = 'app-fix';
  s.textContent = css;
  document.head.appendChild(s);
})();
