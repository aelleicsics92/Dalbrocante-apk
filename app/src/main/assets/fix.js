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

  /* ── Tabelle: etichette, schede, categoria sotto il nome ── */
  var PATH = location.pathname;
  function labelTables() {
    var tbs = document.querySelectorAll('table');
    for (var i = 0; i < tbs.length; i++) {
      var tb = tbs[i];
      if (tb.id === 'tabellaClienti' || tb.classList.contains('fermate')) continue;
      var ths = tb.querySelectorAll('thead th');
      var txt = '';
      var labels = [];
      for (var j = 0; j < ths.length; j++) { labels.push((ths[j].textContent || '').replace(/[▶◀]/g, '').trim()); txt += ' ' + labels[j]; }
      var mode = null;
      if (/Provenienza/i.test(txt)) mode = 'app-card';
      else if (/Nome Articolo/i.test(txt)) mode = 'art';
      else if (/magazzino/.test(PATH)) mode = null;
      else if (ths.length >= 5 && tb.closest('.main,.main-content')) mode = 'app-list';
      if (!mode) continue;
      if (mode === 'art') {
        var rr = tb.querySelectorAll('tbody tr.art-row');
        for (var q = 0; q < rr.length; q++) {
          var tn = rr[q].querySelector('td.td-nome');
          var lnk = rr[q].querySelector('td.td-cat a');
          var nt = rr[q].getAttribute('data-note');
          if (tn && nt && !tn.querySelector('.app-note')) {
            var n = document.createElement('div');
            n.className = 'app-note';
            n.textContent = '📝 ' + nt;
            tn.appendChild(n);
          }
          if (tn && lnk && !tn.querySelector('.app-cat')) {
            var d = document.createElement('span');
            d.className = 'app-cat';
            d.textContent = lnk.textContent;
            tn.appendChild(d);
          }
        }
        continue;
      }
      tb.classList.add(mode);
      var rows = tb.querySelectorAll('tbody tr');
      for (var r = 0; r < rows.length; r++) {
        var tds = rows[r].children;
        for (var k = 0; k < tds.length; k++) {
          var td = tds[k];
          if (!td.getAttribute('data-label') && labels[k]) td.setAttribute('data-label', labels[k]);
          if (mode === 'app-list') {
            var t = (td.textContent || '').trim();
            var hasCtl = td.querySelector('a,button,input');
            if (!labels[k] && hasCtl) td.classList.add('app-act');
            else if ((t === '' || t === '—' || t === '-') && !hasCtl && k > 0) td.classList.add('app-empty');
            if (/total|importo|incass/i.test(labels[k] || '')) td.classList.add('app-tot');
          }
        }
      }
    }
  }

  /* ── Trasporti: elenco giornate = link al giro consegne ── */
  function trasporti() {
    if (!/trasporti\.php$/.test(PATH)) return;
    var st = document.getElementById('app-tr');
    if (!st) { st = document.createElement('style'); st.id = 'app-tr'; document.head.appendChild(st); }
    st.textContent = '.page-title .btn-green{display:none!important;}.giornate-grid{grid-template-columns:1fr!important;}.giornata-card{border:2px solid #d1fae5!important;}.app-vai{margin-top:.6rem;display:flex;gap:.5rem;align-items:center;justify-content:space-between;}.app-vai b{background:#10b981;color:#fff;border-radius:10px;padding:.55rem .9rem;font-size:.9rem;}.app-vai button{background:#f1f5f9;border:1px solid #d1d5db;border-radius:10px;padding:.5rem .7rem;font-size:.8rem;color:#374151;}';
    function wire() {
      var cards = document.querySelectorAll('.giornata-card');
      for (var i = 0; i < cards.length; i++) {
        (function (c) {
          if (c.getAttribute('data-app')) return;
          var m = /apriGiornata\('([^']+)'\)/.exec(c.getAttribute('onclick') || '');
          if (!m) return;
          var date = m[1];
          c.setAttribute('data-app', '1');
          c.removeAttribute('onclick');
          var body = c.querySelector('.card-body');
          if (body) {
            var bar = document.createElement('div');
            bar.className = 'app-vai';
            bar.innerHTML = '<b>🗺️ Apri giro consegne</b><button type="button">✏️ Modifica</button>';
            bar.querySelector('button').onclick = function (e) {
              e.stopPropagation();
              if (window.apriGiornata) window.apriGiornata(date);
            };
            body.appendChild(bar);
          }
          c.onclick = function () {
            fetch('trasporti.php', { method: 'POST', credentials: 'same-origin',
              headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
              body: 'ajax=get_giornata&data=' + encodeURIComponent(date) })
              .then(function (r) { return r.json(); })
              .then(function (d) { if (d && d.ok && d.token) location.href = 'trasporti_view.php?token=' + d.token; });
          };
        })(cards[i]);
      }
    }
    wire();
    setTimeout(wire, 500);
  }

  function run() { upd(); labelTables(); trasporti(); }
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
    'html body #topbar.topbar{height:auto!important;left:0!important;right:0!important;flex-wrap:wrap!important;padding:.5rem .75rem!important;gap:.5rem!important;}',
    'html body #searchMainWrap.search-main-wrap{flex:1 1 100%!important;max-width:none!important;width:100%!important;}',
    'html body #searchDocWrap.search-doc-wrap{flex:1 1 0!important;min-width:0!important;max-width:none!important;width:auto!important;}',
    'html body #taskWrapTop{flex:0 0 auto!important;}',
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
    '#tblArticoli:not(.app-card) th,#tblArticoli:not(.app-card) td{white-space:nowrap!important;padding:.4rem .25rem!important;font-size:.7rem!important;}',
    '#tblArticoli:not(.app-card) th{position:static!important;font-size:.58rem!important;}',
    '#tblArticoli:not(.app-card) td.td-nome{white-space:normal!important;word-break:break-word;max-width:none!important;min-width:90px!important;overflow:visible!important;text-overflow:clip!important;font-weight:600;font-size:.78rem!important;}',
    '#tblArticoli:not(.app-card) .app-cat{display:block;margin-top:.2rem;font-size:.6rem;font-weight:600;color:#7c3aed;background:#f3e8ff;border-radius:99px;padding:.05rem .4rem;width:fit-content;white-space:normal;}',
    '#tblArticoli:not(.app-card) .app-note{font-size:.68rem;font-weight:400;color:#6b7280;margin-top:.25rem;white-space:normal;line-height:1.3;}',
    '#tblArticoli.has-editing:not(.app-card) .app-note{display:none!important;}',
    '#tblArticoli.has-editing:not(.app-card) th:nth-child(13),#tblArticoli.has-editing:not(.app-card) td:nth-child(13){display:table-cell!important;}',
    '#tblArticoli:not(.app-card) .prezzo-acq,#tblArticoli:not(.app-card) .prezzo-vend{font-size:.74rem!important;white-space:nowrap!important;}',
    '#tblArticoli:not(.app-card) .codice-badge{font-size:.66rem!important;}',
    '#tblArticoli:not(.app-card) td.td-view:first-child span[title]{display:block;margin:0 0 .15rem!important;}',
    '#tblArticoli:not(.app-card) .act-icon{width:28px!important;height:28px!important;}',
    '#tblArticoli:not(.app-card) td:last-child>div{flex-direction:column!important;gap:.25rem!important;align-items:center;}',
    '#tblArticoli:not(.app-card) .td-edit{flex-direction:column!important;}',
    '#tblArticoli:not(.app-card) th:nth-child(4),#tblArticoli:not(.app-card) td:nth-child(4),',
    '#tblArticoli:not(.app-card) th:nth-child(8),#tblArticoli:not(.app-card) td:nth-child(8),',
    '#tblArticoli:not(.app-card) th:nth-child(9),#tblArticoli:not(.app-card) td:nth-child(9),',
    '#tblArticoli:not(.app-card) th:nth-child(10),#tblArticoli:not(.app-card) td:nth-child(10),',
    '#tblArticoli:not(.app-card) th:nth-child(13),#tblArticoli:not(.app-card) td:nth-child(13),',
    '#tblArticoli:not(.app-card) th:nth-child(14),#tblArticoli:not(.app-card) td:nth-child(14),',
    '#tblArticoli:not(.app-card) th:nth-child(15),#tblArticoli:not(.app-card) td:nth-child(15){display:none!important;}',
    '#tblArticoli:not(.app-card) tfoot{display:none!important;}',
    '#tblArticoli.has-editing:not(.app-card) th:nth-child(4),#tblArticoli.has-editing:not(.app-card) td:nth-child(4){display:table-cell!important;}',
    '#tblArticoli.has-editing:not(.app-card) .app-cat{display:none!important;}',
    '#tblArticoli:not(.app-card) td input.inline-input{width:100%!important;min-width:0!important;font-size:14px!important;}',

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

    /* ── Elenchi (vendite, caparre, altri): schede a 2 colonne ── */
    '.app-list,.app-list tbody{display:block!important;width:100%!important;min-width:0!important;max-width:none!important;overflow:visible!important;}',
    '.app-list thead,.app-list tfoot{display:none!important;}',
    '.app-list tr{display:grid!important;grid-template-columns:1fr 1fr;gap:.35rem .6rem;padding:.7rem .8rem;margin:0 0 .55rem;background:#fff;border:1px solid #e5e7eb;border-radius:12px;box-shadow:0 1px 3px rgba(0,0,0,.05);}',
    '.app-list td{display:block!important;padding:0!important;border:0!important;background:transparent!important;text-align:left!important;white-space:normal!important;min-width:0;word-break:break-word;font-size:.88rem!important;color:#374151;}',
    '.app-list td::before{content:attr(data-label);display:block;font-size:.6rem;font-weight:700;text-transform:uppercase;color:#6b7280;letter-spacing:.3px;margin-bottom:.05rem;}',
    '.app-list td:first-child{grid-column:1/3;font-size:1rem!important;font-weight:700;}',
    '.app-list td:first-child::before{display:none;}',
    '.app-list td.app-empty{display:none!important;}',
    '.app-list td.app-act{grid-column:1/3;text-align:right!important;}',
    '.app-list td.app-act::before{display:none;}',
    '.app-list td.app-tot{font-weight:700;color:#059669;}',

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
