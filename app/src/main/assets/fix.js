(function () {
  if (document.getElementById('app-fix')) return;

  var m = document.querySelector('meta[name=viewport]');
  if (!m) { m = document.createElement('meta'); m.name = 'viewport'; document.head.appendChild(m); }
  m.content = 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no';

  /* ── Nasconde calendario e novita dalla topbar ── */
  function hideTop() {
    var t = document.getElementById('topbar');
    if (!t) return;
    var kids = t.children;
    for (var i = 0; i < kids.length; i++) {
      var c = kids[i];
      if (c.querySelector && c.querySelector('input')) continue;
      var meta = (c.id || '') + ' ' + (c.className && c.className.baseVal === undefined ? c.className : '') + ' ' + (c.title || '') + ' ' + (c.textContent || '').substring(0, 25);
      if (/📅|🆕|novit|chgWrap|agenda|calend/i.test(meta)) {
        c.style.setProperty('display', 'none', 'important');
      }
    }
  }

  /* ── Spazio sotto la topbar fissa ── */
  function upd() {
    hideTop();
    var t = document.getElementById('topbar');
    if (!t) return;
    var h = t.offsetHeight;
    document.documentElement.style.setProperty('--tb-h', h + 'px');
    var els = document.querySelectorAll('.main,.main-content');
    for (var i = 0; i < els.length; i++) {
      els[i].style.setProperty('padding-top', (h + 12) + 'px', 'important');
    }
  }

  /* ── Tabelle a schede (Provenienza / Listino): etichette per cella ── */
  function labelTables() {
    var tbs = document.querySelectorAll('table');
    for (var i = 0; i < tbs.length; i++) {
      var tb = tbs[i];
      var ths = tb.querySelectorAll('thead th');
      var txt = '';
      var labels = [];
      for (var j = 0; j < ths.length; j++) { labels.push((ths[j].textContent || '').trim()); txt += ' ' + labels[j]; }
      if (!/Provenienza/i.test(txt)) continue;
      tb.classList.add('app-card');
      var rows = tb.querySelectorAll('tbody tr');
      for (var r = 0; r < rows.length; r++) {
        var tds = rows[r].children;
        for (var k = 0; k < tds.length; k++) {
          if (!tds[k].getAttribute('data-label') && labels[k]) tds[k].setAttribute('data-label', labels[k]);
        }
      }
    }
  }

  function run() { upd(); labelTables(); }
  run();
  setTimeout(run, 300);
  setTimeout(run, 1200);
  window.addEventListener('resize', run);
  var tb0 = document.getElementById('topbar');
  if (tb0 && window.ResizeObserver) { new ResizeObserver(upd).observe(tb0); }
  var deb = null;
  if (window.MutationObserver) {
    new MutationObserver(function () {
      clearTimeout(deb);
      deb = setTimeout(labelTables, 150);
    }).observe(document.body, { childList: true, subtree: true });
  }

  var css = [
    'html,body{max-width:100vw;overflow-x:hidden;-webkit-text-size-adjust:100%;}',
    '#chgWrap,#chgDrop{display:none!important;}',
    '@media(max-width:1000px){',

    /* ── TOPBAR ── */
    '#topbar.topbar{height:auto!important;left:0!important;right:0!important;flex-wrap:wrap!important;padding:.5rem .75rem!important;gap:.5rem!important;}',
    '#searchMainWrap.search-main-wrap{flex:1 1 100%!important;max-width:none!important;width:100%!important;}',
    '#searchDocWrap.search-doc-wrap{flex:1 1 0!important;min-width:0!important;max-width:none!important;width:auto!important;}',
    '#taskWrapTop{flex:0 0 auto!important;}',
    '#taskDropTop{position:fixed!important;left:.5rem!important;right:.5rem!important;width:auto!important;top:var(--tb-h,100px)!important;}',

    /* ── Contenuto ── */
    'html body .main,html body .main-content{margin-left:0!important;padding-left:.75rem!important;padding-right:.75rem!important;max-width:100vw!important;box-sizing:border-box!important;}',
    'input,select,textarea{font-size:16px!important;max-width:100%;}',
    '[style*="grid-template-columns"]{grid-template-columns:1fr!important;}',
    '.stats{grid-template-columns:1fr 1fr!important;}',
    '.card{padding:1rem!important;}',
    '.card>div[style*="justify-content:space-between"]{flex-wrap:wrap!important;gap:.5rem!important;}',
    '.card>div[style*="justify-content:space-between"]>div{flex-wrap:wrap!important;}',
    '.totali-box,.sconto-inline-box{min-width:0!important;width:100%!important;}',
    '.riepilogo-wrap{justify-content:stretch!important;}',
    '[style*="width:320px"]{width:100%!important;}',
    '.sconto-form input{max-width:none!important;}',

    /* Filtro date */
    '.filtro-date{flex-wrap:wrap!important;overflow:visible!important;}',
    '.filtro-date input[type=date]{width:auto!important;flex:1 1 120px!important;font-size:14px!important;}',

    /* Tabelle generiche: scorrimento solo come ripiego */
    '.main table:not(.app-card):not(#tabellaClienti):not(#tblArticoli),.main-content table:not(.app-card):not(#tabellaClienti):not(#tblArticoli){display:block;overflow-x:auto;max-width:100%;-webkit-overflow-scrolling:touch;}',

    /* ── ACQUISTATI cliente: tabella compatta stile magazzino ── */
    '.art-table-wrap{overflow:visible!important;max-height:none!important;}',
    '#tblArticoli:not(.app-card){width:100%!important;min-width:0!important;table-layout:auto!important;}',
    '#tblArticoli:not(.app-card) th,#tblArticoli:not(.app-card) td{white-space:normal!important;padding:.4rem .25rem!important;font-size:.7rem!important;word-break:break-word;}',
    '#tblArticoli:not(.app-card) th{position:static!important;}',
    '#tblArticoli:not(.app-card) td.td-nome{max-width:none!important;min-width:0!important;overflow:visible!important;text-overflow:clip!important;font-weight:600;font-size:.76rem!important;}',
    '#tblArticoli:not(.app-card) td.td-cat,#tblArticoli:not(.app-card) th.th-cat{width:auto!important;max-width:60px!important;}',
    '#tblArticoli:not(.app-card) .cat-link{font-size:.6rem!important;white-space:normal;}',
    '#tblArticoli:not(.app-card) .codice-badge{font-size:.66rem!important;}',
    '#tblArticoli:not(.app-card) td.td-view:first-child span[title]{display:block;margin:0 0 .15rem!important;}',
    '#tblArticoli:not(.app-card) .act-icon{width:28px!important;height:28px!important;}',
    '#tblArticoli:not(.app-card) td:last-child>div{flex-direction:column!important;gap:.25rem!important;align-items:center;}',
    '#tblArticoli:not(.app-card) .td-edit{flex-direction:column!important;}',
    /* colonne secondarie nascoste (tot acq, venduti, scorte, note, foto, data) */
    '#tblArticoli:not(.app-card) th:nth-child(8),#tblArticoli:not(.app-card) td:nth-child(8),',
    '#tblArticoli:not(.app-card) th:nth-child(9),#tblArticoli:not(.app-card) td:nth-child(9),',
    '#tblArticoli:not(.app-card) th:nth-child(10),#tblArticoli:not(.app-card) td:nth-child(10),',
    '#tblArticoli:not(.app-card) th:nth-child(13),#tblArticoli:not(.app-card) td:nth-child(13),',
    '#tblArticoli:not(.app-card) th:nth-child(14),#tblArticoli:not(.app-card) td:nth-child(14),',
    '#tblArticoli:not(.app-card) th:nth-child(15),#tblArticoli:not(.app-card) td:nth-child(15){display:none!important;}',
    '#tblArticoli:not(.app-card) tfoot{display:none!important;}',
    '#tblArticoli:not(.app-card) td input.inline-input{width:100%!important;min-width:0!important;font-size:14px!important;}',
    '#tblArticoli:not(.app-card).has-editing th:nth-child(13),#tblArticoli:not(.app-card).has-editing td:nth-child(13){display:table-cell!important;}',

    /* ── Righe articoli (vendita / caparra): schede senza scroll ── */
    '.app-card,.app-card tbody{display:block!important;width:100%!important;min-width:0!important;max-width:none!important;overflow:visible!important;}',
    '.app-card thead{display:none!important;}',
    '.app-card tr{display:grid!important;grid-template-columns:repeat(4,1fr);gap:.3rem .5rem;padding:.65rem .7rem;border-bottom:1px solid #d1fae5;border-left:3px solid #10b981;background:#fff;}',
    '.app-card td{padding:0!important;border:0!important;background:transparent!important;text-align:left!important;white-space:normal!important;min-width:0;word-break:break-word;font-size:.85rem!important;}',
    '.app-card td:not(.td-del){display:block!important;}',
    '.app-card td::before{content:attr(data-label);display:block;font-size:.58rem;font-weight:700;text-transform:uppercase;color:#6b7280;letter-spacing:.3px;margin-bottom:.05rem;}',
    '.app-card td:nth-child(1){grid-column:1/2;}',
    '.app-card td:nth-child(2){grid-column:2/5;}',
    '.app-card td:nth-child(3){grid-column:1/5;}',
    '.app-card td:nth-child(8){grid-column:1/5;text-align:right!important;}',
    '.app-card td:nth-child(8)::before{display:none;}',
    '.app-card td.td-del{grid-column:1/5;text-align:right!important;}',
    '.app-card td.td-del::before{display:none;}',
    '.app-card td input.ie{font-size:14px!important;min-width:0;}',
    '.app-card td .ie-wrap input{width:100%!important;}',

    /* ── LISTA CLIENTI: schede ── */
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
