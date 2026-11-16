/* WANTOK PNG - top bar (menu + profile) and bottom nav that matches the home tiles.
   Add ONE line to index.html, right before </body>:
   <script src="wantok-nav.js"></script>
   Uses the app's own data-a actions, so no other code needs to change. */
(function () {
  if (window.__wkNav) return;
  window.__wkNav = true;

  var css = [
    ':root{--wk-top:56px;--wk-nav:62px}',
    '.phone{padding-top:var(--wk-top)!important}',
    '#tabs{display:none!important}',
    '.sh{top:var(--wk-top)!important}',
    '.hdr-icons .avatar{display:none!important}',

    /* top bar */
    '.wk-top{position:fixed;top:0;left:50%;transform:translateX(-50%);width:100%;max-width:430px;height:var(--wk-top);z-index:40;',
    'display:flex;align-items:center;justify-content:space-between;padding:0 12px 0 16px;background:#0d1b2e;color:#fff}',
    '.wk-brand{font-weight:900;font-size:19px;letter-spacing:.4px;color:#fff}',
    '.wk-brand span{color:#f5b800}',
    '.wk-right{display:flex;align-items:center;gap:10px}',
    '.wk-ib{position:relative;width:40px;height:40px;border-radius:50%;display:grid;place-items:center;background:rgba(255,255,255,.14);color:#fff;padding:0}',
    '.wk-ib svg{width:22px;height:22px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}',
    '.wk-ib.me{border:2px solid #f5b800}',
    '.wk-dot{position:absolute;top:-3px;right:-3px;min-width:17px;height:17px;border-radius:9px;background:#e11d2e;color:#fff;font-size:10px;font-weight:700;display:none;place-items:center;padding:0 4px}',
    '.wk-dot.on{display:grid}',

    /* bottom nav */
    '.wk-nav{position:fixed;bottom:0;left:50%;transform:translateX(-50%);width:100%;max-width:430px;z-index:40;',
    'display:grid;grid-template-columns:repeat(7,1fr);height:calc(var(--wk-nav) + env(safe-area-inset-bottom));',
    'padding-bottom:env(safe-area-inset-bottom);background:#fff;border-top:1px solid #e5e8ee;box-shadow:0 -4px 16px rgba(13,27,46,.10)}',
    '.wk-tab{--c:#0d1b2e;position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;',
    'min-width:0;padding:6px 1px;color:#0d1b2e;text-align:center}',
    '.wk-tab svg{width:23px;height:23px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}',
    '.wk-tab span{font-size:10px;line-height:1;font-weight:500;max-width:100%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
    '.wk-tab[data-k="home"]{--c:#f5b800}.wk-tab[data-k="market"]{--c:#e11d2e}.wk-tab[data-k="business"]{--c:#f5b800}',
    '.wk-tab[data-k="work"]{--c:#f5b800}.wk-tab[data-k="wantok"]{--c:#1f9d4a}.wk-tab[data-k="talent"]{--c:#a63fc0}.wk-tab[data-k="gov"]{--c:#f5b800}',
    '.wk-tab.active{color:var(--c)}.wk-tab.active span{font-weight:700}.wk-tab.active svg{stroke-width:2.4}',
    '.wk-tab.active::before{content:"";position:absolute;top:0;width:26px;height:3px;border-radius:0 0 3px 3px;background:var(--c)}',
    'body.inchat .wk-nav{display:none}',

    /* drawer */
    '.wk-scrim{position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:52;display:none}',
    '.wk-scrim.open{display:block}',
    '.wk-drawer{position:fixed;top:0;bottom:0;right:max(0px,calc(50% - 215px));width:min(82vw,320px);z-index:53;background:#fff;',
    'transform:translateX(110%);transition:transform .22s ease;overflow-y:auto;padding:14px 8px 24px;box-shadow:-8px 0 24px rgba(0,0,0,.2)}',
    '.wk-drawer.open{transform:none}',
    '.wk-drawer h3{margin:6px 12px 10px;font-size:12px;letter-spacing:.08em;color:#6b7686;text-transform:uppercase}',
    '.wk-drawer button{display:flex;align-items:center;gap:12px;width:100%;padding:13px 12px;border-radius:10px;font-size:16px;font-weight:500;color:#0d1b2e}',
    '.wk-drawer button:active{background:#f1f4f9}',
    '.wk-drawer .em{width:26px;text-align:center;font-size:20px}',
    '.wk-drawer .sep{height:1px;background:#eef1f5;margin:6px 8px}',
    '.wk-drawer .bd{margin-left:auto;background:#e11d2e;color:#fff;font-size:11px;font-weight:700;border-radius:9px;min-width:18px;height:18px;display:none;place-items:center;padding:0 5px}',
    '.wk-drawer .bd.on{display:grid}'
  ].join('');
  var st = document.createElement('style');
  st.id = 'wk-nav-css';
  st.textContent = css;
  document.head.appendChild(st);

  function ic(d) { return '<svg viewBox="0 0 24 24">' + d + '</svg>'; }
  var I = {
    menu: ic('<path d="M4 7h16M4 12h16M4 17h16"/>'),
    user: ic('<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"/>'),
    home: ic('<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>'),
    market: ic('<circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/><path d="M2 3h3l2.5 12h11L21 7H6"/>'),
    business: ic('<path d="M3 9l1.5-5h15L21 9"/><path d="M3 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0"/><path d="M5 12v8h14v-8"/><path d="M10 20v-5h4v5"/>'),
    work: ic('<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/><path d="M3 13h18"/>'),
    wantok: ic('<circle cx="9" cy="8" r="3"/><path d="M3 20v-1a6 6 0 0 1 12 0v1"/><circle cx="17" cy="9" r="2.5"/><path d="M16 14a5 5 0 0 1 6 5v1"/>'),
    talent: ic('<path d="M12 3l2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.2 6.4 20.2l1.1-6.2L3 9.6l6.2-.9z"/>'),
    gov: ic('<path d="M3 9l9-6 9 6"/><path d="M5 9v9M9.5 9v9M14.5 9v9M19 9v9"/><path d="M3 21h18"/>')
  };

  /* [key, label, data-a, data-v] - same targets as the home tiles */
  var TABS = [
    ['home', 'Home', 'tab', 'home'],
    ['market', 'Market', 'tab', 'market'],
    ['business', 'Business', 'regBiz', ''],
    ['work', 'Work', 'tab', 'jobs'],
    ['wantok', 'Wantok', 'go', 'circles'],
    ['talent', 'Talent', 'go', 'talent'],
    ['gov', 'Gov', 'tab', 'gov']
  ];

  var top = document.createElement('div');
  top.className = 'wk-top';
  top.innerHTML = '<div class="wk-brand">WANTOK <span>PNG</span></div><div class="wk-right">' +
    '<button class="wk-ib" id="wkMenu" aria-label="Menu">' + I.menu + '<span class="wk-dot" id="wkMenuDot"></span></button>' +
    '<button class="wk-ib me" data-a="profileBtn" aria-label="Profile">' + I.user + '</button></div>';

  var nav = document.createElement('div');
  nav.className = 'wk-nav';
  nav.setAttribute('role', 'navigation');
  nav.innerHTML = TABS.map(function (t) {
    return '<button class="wk-tab" data-k="' + t[0] + '" data-a="' + t[2] + '"' + (t[3] ? ' data-v="' + t[3] + '"' : '') + '>' + I[t[0]] + '<span>' + t[1] + '</span></button>';
  }).join('');

  var scrim = document.createElement('div');
  scrim.className = 'wk-scrim';

  var drawer = document.createElement('div');
  drawer.className = 'wk-drawer';
  var ITEMS = [
    ['💬', 'Messages', 'tab', 'messages', 'wkMsgBd'],
    ['🔔', 'Notifications', 'go', 'notes'],
    ['sep'],
    ['🤝', 'Wantok Circles', 'go', 'circles'],
    ['⭐', 'Talent', 'go', 'talent'],
    ['❤️', 'Saved Items', 'go', 'saved'],
    ['🗂️', 'My Posts & Listings', 'go', 'mine'],
    ['🏪', 'Register a Business', 'regBiz', ''],
    ['sep'],
    ['🧭', 'Services Guide', 'go', 'services'],
    ['🏢', 'Contact Offices', 'go', 'directory'],
    ['🚩', 'My Reports', 'go', 'reports'],
    ['🇵🇬', 'National Intelligence Centre', 'go', 'intelligence'],
    ['sep'],
    ['🌐', 'Language', 'toggleLang', ''],
    ['📱', 'Share WANTOK PNG (QR)', 'showQR', ''],
    ['ℹ️', 'About WANTOK PNG', 'about', ''],
    ['☰', 'More', 'tab', 'more']
  ];
  drawer.innerHTML = '<h3>Menu</h3>' + ITEMS.map(function (i) {
    if (i[0] === 'sep') return '<div class="sep"></div>';
    return '<button data-a="' + i[2] + '"' + (i[3] ? ' data-v="' + i[3] + '"' : '') + '><span class="em">' + i[0] + '</span>' + i[1] +
      (i[4] ? '<span class="bd" id="' + i[4] + '"></span>' : '') + '</button>';
  }).join('');

  document.body.appendChild(top);
  document.body.appendChild(nav);
  document.body.appendChild(scrim);
  document.body.appendChild(drawer);

  function openD() { drawer.classList.add('open'); scrim.classList.add('open'); }
  function closeD() { drawer.classList.remove('open'); scrim.classList.remove('open'); }
  document.getElementById('wkMenu').addEventListener('click', function () {
    if (drawer.classList.contains('open')) closeD(); else openD();
  });
  scrim.addEventListener('click', closeD);
  drawer.addEventListener('click', function (e) { if (e.target.closest('button')) closeD(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeD(); });
  nav.addEventListener('click', closeD);

  var MAP = { home: 'home', market: 'market', jobs: 'work', gov: 'gov' };
  function update() {
    var h = document.querySelector('#screen .sh h2');
    var ht = h ? h.textContent.trim() : '';
    var a = document.querySelector('#tabs button.active');
    var v = a ? a.getAttribute('data-v') : '';
    var cur = MAP[v] || '';
    if (/^(Wantok Circles|Ol Wantok Grup)$/.test(ht)) cur = 'wantok';
    else if (/^(Talent|Talen)$/.test(ht)) cur = 'talent';
    nav.querySelectorAll('.wk-tab').forEach(function (b) {
      b.classList.toggle('active', b.getAttribute('data-k') === cur);
    });
    var bd = document.querySelector('#tabs button[data-v="messages"] .badge');
    var n = bd ? bd.textContent.trim() : '';
    var d1 = document.getElementById('wkMsgBd'), d2 = document.getElementById('wkMenuDot');
    if (d1) { d1.textContent = n; d1.classList.toggle('on', !!n); }
    if (d2) { d2.textContent = n; d2.classList.toggle('on', !!n); }
  }
  var tabsEl = document.getElementById('tabs'), screenEl = document.getElementById('screen');
  if (window.MutationObserver) {
    if (tabsEl) new MutationObserver(update).observe(tabsEl, { childList: true, subtree: true });
    if (screenEl) new MutationObserver(update).observe(screenEl, { childList: true });
  }
  update();
})();
