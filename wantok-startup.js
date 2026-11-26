/* WANTOK PNG welcome and account-entry screen.
   Uses the existing Supabase authentication modal and keeps guest browsing available. */
(function () {
  'use strict';
  var KEY = 'wantok-startup-seen-v1';
  function hasExistingSession() {
    try {
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (k && k.indexOf('sb-') === 0 && k.indexOf('-auth-token') > -1) {
          var raw = localStorage.getItem(k);
          if (raw) {
            var data = JSON.parse(raw);
            if (data && (data.access_token || data.currentSession || data.user)) return true;
          }
        }
      }
    } catch (e) {}
    return false;
  }
  function launchAuth(mode) {
    var trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.dataset.a = 'signin';
    trigger.style.display = 'none';
    document.body.appendChild(trigger);
    trigger.click();
    trigger.remove();
    window.setTimeout(function () {
      var emailTab = document.querySelector('#modal [data-a="authTab"][data-v="email"]');
      if (emailTab) emailTab.click();
      if (mode === 'up') {
        window.setTimeout(function () {
          var signup = document.querySelector('#modal [data-a="authMode"][data-v="up"]');
          if (signup) signup.click();
        }, 30);
      }
    }, 30);
  }
  function mount() {
    if (hasExistingSession()) return;
    if (sessionStorage.getItem(KEY) === '1') return;
    var style = document.createElement('style');
    style.textContent = `
      #wantok-welcome{position:fixed;inset:0;z-index:9998;display:flex;align-items:center;justify-content:center;padding:18px;background:linear-gradient(145deg,#071426 0%,#102b48 55%,#071426 100%);color:#fff;font-family:inherit}
      #wantok-welcome .ww-card{width:min(100%,430px);overflow:hidden;border:1px solid rgba(245,184,0,.38);border-radius:26px;background:#f5f8fc;color:#132238;box-shadow:0 24px 80px rgba(0,0,0,.38)}
      #wantok-welcome .ww-hero{padding:28px 24px 24px;text-align:center;background:linear-gradient(145deg,#0d1b2e,#17476a);border-bottom:4px solid #f5b800}
      #wantok-welcome .ww-logo{width:96px;height:96px;object-fit:cover;border-radius:50%;border:3px solid #f5b800;background:#fff;box-shadow:0 6px 22px rgba(0,0,0,.25)}
      #wantok-welcome .ww-title{margin:14px 0 5px;font-size:31px;line-height:1;font-weight:950;letter-spacing:1.1px;color:#f5c542}
      #wantok-welcome .ww-tag{font-size:13px;font-weight:800;letter-spacing:.35px;color:#fff}
      #wantok-welcome .ww-copy{margin:16px auto 0;max-width:310px;font-size:14px;line-height:1.55;color:#e7eff8}
      #wantok-welcome .ww-body{padding:22px 20px 20px}
      #wantok-welcome .ww-body h2{margin:0 0 7px;text-align:center;font-size:21px;font-weight:900;color:#10243b}
      #wantok-welcome .ww-sub{margin:0 0 18px;text-align:center;font-size:13px;line-height:1.45;color:#5d6c7e}
      #wantok-welcome .ww-btn{display:block;width:100%;min-height:51px;margin:10px 0;border:0;border-radius:14px;text-align:center;font-size:15px;font-weight:900;cursor:pointer}
      #wantok-welcome .ww-primary{background:linear-gradient(100deg,#d62828,#ed8b00);color:#fff;box-shadow:0 6px 16px rgba(214,40,40,.2)}
      #wantok-welcome .ww-secondary{background:#10243b;color:#fff}
      #wantok-welcome .ww-guest{display:block;margin:14px auto 0;padding:8px 12px;background:transparent;border:0;color:#1762a0;font-weight:800;font-size:13px;cursor:pointer}
      #wantok-welcome .ww-foot{padding:0 18px 18px;text-align:center;color:#748195;font-size:10px;letter-spacing:.7px;font-weight:800}
      @media(max-height:650px){#wantok-welcome{align-items:flex-start;overflow:auto}#wantok-welcome .ww-hero{padding:18px 20px}#wantok-welcome .ww-logo{width:70px;height:70px}#wantok-welcome .ww-title{font-size:26px}#wantok-welcome .ww-copy{margin-top:9px}#wantok-welcome .ww-body{padding:15px 18px}}
    `;
    document.head.appendChild(style);
    var root = document.createElement('section');
    root.id = 'wantok-welcome';
    root.setAttribute('role','dialog');
    root.setAttribute('aria-modal','true');
    root.setAttribute('aria-label','Welcome to WANTOK PNG');
    root.innerHTML = '<div class="ww-card">'
      + '<div class="ww-hero"><img class="ww-logo" src="wantok-png-logo.png" alt="WANTOK PNG logo" onerror="this.style.display=\'none\'">'
      + '<div class="ww-title">WANTOK PNG</div><div class="ww-tag">ONE NATION. ONE DIGITAL CONNECTION.</div>'
      + '<p class="ww-copy">Connecting our people, empowering businesses and bringing communities closer to Government services across Papua New Guinea.</p></div>'
      + '<div class="ww-body"><h2>Welcome to your national digital hub</h2>'
      + '<p class="ww-sub">Create your account or sign in using your email address or PNG mobile number.</p>'
      + '<button type="button" class="ww-btn ww-primary" id="ww-create">CREATE ACCOUNT</button>'
      + '<button type="button" class="ww-btn ww-secondary" id="ww-signin">SIGN IN</button>'
      + '<button type="button" class="ww-guest" id="ww-guest">Continue exploring as a guest</button></div>'
      + '<div class="ww-foot">PAPUA NEW GUINEA • OUR PEOPLE • OUR FUTURE</div></div>';
    document.body.appendChild(root);
    function dismiss() {
      sessionStorage.setItem(KEY,'1');
      root.remove();
    }
    document.getElementById('ww-create').addEventListener('click', function () {
      dismiss();
      launchAuth('up');
    });
    document.getElementById('ww-signin').addEventListener('click', function () {
      dismiss();
      launchAuth('in');
    });
    document.getElementById('ww-guest').addEventListener('click', dismiss);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();
})();