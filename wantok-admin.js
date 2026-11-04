/* WANTOK PNG Admin Dashboard - live Supabase edition (complete)
   Works with wantok-dashboard.html (ids: login, loginForm, email, password, app, side,
   pageTitle, search, content, who, toast). */
(function () {
  'use strict';

  const SUPABASE_URL = 'https://rpcekiqhvsmzjmjimnsj.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_bmR_OLpVkON13vH-uTCkRg_GGH8jllW';

  const $ = s => document.querySelector(s);
  const esc = v => String(v == null ? '' : v).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  if (!window.supabase || !window.supabase.createClient) {
    document.addEventListener('DOMContentLoaded', () => message('Could not load the Supabase library. Check your internet connection and refresh.', true));
    return;
  }
  const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

  const STATUS3 = ['pending', 'approved', 'rejected'];
  const tables = {
    overview: { label: 'Overview' },
    reports: { label: 'Government Connect Reports', table: 'reports', status: ['Received', 'In Progress', 'Resolved', 'Rejected'], del: true,
      fields: ['ref', 'category', 'location', 'description', 'status', 'created_at'] },
    businesses: { label: 'Businesses', table: 'businesses', status: STATUS3, del: true,
      fields: ['name', 'category', 'location', 'province', 'town', 'phone', 'email', 'status', 'created_at'] },
    jobs: { label: 'Jobs', table: 'jobs', status: STATUS3, del: true,
      fields: ['title', 'employer', 'location', 'province', 'town', 'job_type', 'status', 'created_at'] },
    posts: { label: 'Community Posts', table: 'posts', status: STATUS3, del: true,
      fields: ['author_name', 'title', 'body', 'kind', 'province', 'media_type', 'media_url', 'status', 'created_at'] },
    notices: { label: 'Government Notices', table: 'notices', published: true, del: true, form: 'notice',
      fields: ['title', 'body', 'is_published', 'created_at'] },
    gov_services: { label: 'Government Services', table: 'gov_services', del: true, form: 'service',
      fields: ['name', 'category', 'description', 'url', 'sort', 'created_at'] },
    profiles: { label: 'Members / Profiles', table: 'profiles',
      fields: ['full_name', 'email', 'phone', 'province', 'district', 'created_at'] },
    registrations: { label: 'Registrations', table: 'registrations', del: true,
      fields: ['full_name', 'business_name', 'category', 'location', 'phone', 'email', 'created_at'] },
    feedback: { label: 'Feedback', table: 'feedback', del: true,
      fields: ['topic', 'province', 'name', 'contact', 'message', 'created_at'] }
  };

  let current = 'overview';
  let cache = {};
  let me = null;
  let tt;

  /* ---------- helpers ---------- */
  function toast(m) {
    const e = $('#toast');
    e.textContent = m;
    e.classList.add('show');
    clearTimeout(tt);
    tt = setTimeout(() => e.classList.remove('show'), 2600);
  }
  function message(m, bad) {
    let el = $('#login-status');
    if (!el) {
      el = document.createElement('p');
      el.id = 'login-status';
      el.setAttribute('role', 'status');
      const box = $('.loginbox') || document.body;
      const form = $('#loginForm');
      if (form && form.parentNode === box) box.insertBefore(el, form.nextSibling); else box.appendChild(el);
    }
    el.textContent = m;
    el.style.cssText = 'margin:12px 0 0;font-size:14px;font-weight:600;color:' + (bad ? '#b42318' : '#17643a');
  }
  function friendly(err) {
    const m = (err && err.message) || String(err);
    if (/invalid login/i.test(m)) return 'Wrong email or password. If you forgot it, reset the password in Supabase (Authentication > Users).';
    if (/not confirmed/i.test(m)) return 'This email has not been confirmed yet. Confirm it in Supabase (Authentication > Users).';
    if (/failed to fetch|network/i.test(m)) return 'No connection. Check your internet and try again.';
    return m;
  }
  function fmtDate(v) {
    const d = new Date(v);
    return isNaN(d) ? '-' : d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  }
  function cell(field, v) {
    if (v == null || v === '') return '<td>-</td>';
    if (field === 'created_at') return '<td>' + esc(fmtDate(v)) + '</td>';
    if (field === 'media_url' || field === 'url') {
      const u = String(v);
      return /^https?:\/\//i.test(u) ? '<td class="wide"><a href="' + esc(u) + '" target="_blank" rel="noopener noreferrer">Open link</a></td>' : '<td class="wide">' + esc(u) + '</td>';
    }
    if (field === 'is_published') return '<td>' + (v ? '<span class="tag g">Published</span>' : '<span class="tag y">Hidden</span>') + '</td>';
    const s = typeof v === 'object' ? JSON.stringify(v) : String(v);
    if (s.length > 160) return '<td class="wide" title="' + esc(s) + '">' + esc(s.slice(0, 160)) + '...</td>';
    return '<td>' + esc(s) + '</td>';
  }
  function head(field) { return '<th>' + esc(field.replace(/_/g, ' ')) + '</th>'; }
  function count(table, filter) {
    let q = db.from(table).select('*', { count: 'exact', head: true });
    if (filter) q = filter(q);
    return q.then(r => (r.error ? null : r.count));
  }

  /* ---------- sign in ---------- */
  async function isAdmin(user) {
    const { data, error } = await db.from('user_roles').select('role').eq('user_id', user.id).eq('role', 'admin').limit(1);
    if (error) throw error;
    return !!(data && data.length);
  }
  async function enter(user) {
    if (!(await isAdmin(user))) {
      await db.auth.signOut();
      message('This account is not an administrator.', true);
      return false;
    }
    me = user;
    $('#login').hidden = true;
    $('#app').hidden = false;
    $('#who').textContent = user.email || 'Admin';
    cache = {};
    go('overview');
    return true;
  }
  $('#loginForm').addEventListener('submit', async e => {
      if (error) throw error;
      const ok = await enter(data.user);
      if (ok) $('#password').value = '';
    } catch (err) {
      message(friendly(err), true);
    } finally {
      btn.disabled = false;
    }
  });
  async function signOut() {
    await db.auth.signOut();
    me = null;
    cache = {};
    $('#app').hidden = true;
    $('#login').hidden = false;
    message('Signed out.');
  }

  /* ---------- navigation ---------- */
  function renderSide() {
    $('#side').innerHTML =
      '<div class="brand"><i></i><div>WANTOK <span>PNG</span><small>National Admin</small></div></div>' +
      Object.keys(tables).map(k => '<button class="nav' + (k === current ? ' on' : '') + '" data-view="' + k + '">' + esc(tables[k].label) + '</button>').join('') +
      '<div class="conn">&#128994; Live database<br>' + esc(me ? me.email : '') + '</div>' +
      '<button class="btn alt signout" data-act="signout">Sign out</button>';
  }
  function go(k) {
    current = k;
    $('#search').value = '';
    $('#pageTitle').textContent = tables[k].label;
    $('#search').style.display = k === 'overview' ? 'none' : '';
    renderSide();
    if (k === 'overview') loadOverview(); else load(k);
    window.scrollTo(0, 0);
  }

  /* ---------- overview ---------- */
  async function loadOverview() {
    const c = $('#content');
    c.innerHTML = '<div class="card"><p>Loading...</p></div>';
    const open = q => q.not('status', 'in', '(Resolved,Rejected)');
    const pend = q => q.eq('status', 'pending');
    const [profiles, registrations, businesses, jobs, posts, reports, openReports, notices, feedback, pb, pj] = await Promise.all([
      count('profiles'), count('registrations'), count('businesses'), count('jobs'), count('posts'), count('reports'),
      count('reports', open), count('notices'), count('feedback'), count('businesses', pend), count('jobs', pend)
    ]);
    const k = (label, n, color) => '<div class="kpi"' + (color ? ' style="--c:' + color + '"' : '') + '><small>' + label + '</small><b>' + (n == null ? '?' : n) + '</b></div>';
    const act = (label, n, view) => '<tr><td>' + label + '</td><td><b>' + (n == null ? '?' : n) + '</b></td><td><button class="btn sm" data-view="' + view + '">Review</button></td></tr>';
    c.innerHTML =
      '<div class="kpis">' + k('Members', profiles, '#1565c0') + k('Registrations', registrations, '#1f9d4a') + k('Businesses', businesses, '#d62828') +
      k('Jobs', jobs, '#f5b800') + k('Posts', posts, '#1f9d4a') + k('Reports', reports, '#b14bc4') + k('Notices', notices, '#0f4c81') + k('Feedback', feedback, '#6b7686') + '</div>' +
      '<div class="card"><h3>Needs your attention</h3><div class="tw"><table><tbody>' +
      act('Open Government Connect reports', openReports, 'reports') + act('Businesses waiting for approval', pb, 'businesses') + act('Jobs waiting for approval', pj, 'jobs') +
      '</tbody></table></div><p class="note">Signed in as ' + esc(me ? me.email : '') + '. Changes here update the live database straight away.</p></div>';
  }

  /* ---------- table views ---------- */
  async function load(k) {
    const cfg = tables[k];
    const c = $('#content');
    c.innerHTML = '<div class="card"><p>Loading...</p></div>';
    const { data, error } = await db.from(cfg.table).select('*').order('created_at', { ascending: false }).limit(500);
    if (error) {
      c.innerHTML = '<div class="card"><p>Could not load ' + esc(cfg.label) + ': ' + esc(error.message) + '</p></div>';
      return;
    }
    cache[k] = data || [];
    renderView(k);
  }
  function formHtml(kind) {
    if (kind === 'notice') {
      return '<div class="card"><h3>Publish a notice</h3><form class="form" data-form="notice"><input name="title" placeholder="Title" required maxlength="150"><textarea name="body" rows="3" placeholder="Message to the community" required maxlength="2000"></textarea><label class="check"><input type="checkbox" name="pub" checked> Publish now</label><button class="btn gold">Save notice</button></form></div>';
    }
    if (kind === 'service') {
      return '<div class="card"><h3>Add a government service</h3><form class="form" data-form="service"><input name="name" placeholder="Service name" required maxlength="150"><input name="category" placeholder="Category" maxlength="80"><input name="url" placeholder="Website link (https://...)" maxlength="500"><textarea name="description" rows="2" placeholder="Short description" maxlength="1000"></textarea><input name="sort" type="number" placeholder="Sort order (0)" value="0"><button class="btn gold">Add service</button></form></div>';
    }
    return '';
  }
  function renderView(k) {
    const cfg = tables[k];
    const q = ($('#search').value || '').trim().toLowerCase();
    const all = cache[k] || [];
    const rows = q ? all.filter(r => JSON.stringify(r).toLowerCase().indexOf(q) > -1) : all;
    let body;
    if (!rows.length) {
      body = '<div class="empty">' + (all.length ? 'Nothing matches your search.' : 'No records yet.') + '</div>';
    } else {
      const hasAct = cfg.status || cfg.published || cfg.del;
      body = '<div class="tw"><table><thead><tr>' + cfg.fields.map(head).join('') + (hasAct ? '<th>actions</th>' : '') + '</tr></thead><tbody>' +
        rows.map(r => {
          const tds = cfg.fields.map(f => {
            if (f === 'status' && cfg.status) {
              return '<td><select class="status" data-act="status" data-id="' + esc(r.id) + '">' +
                cfg.status.map(s => '<option' + (s === r.status ? ' selected' : '') + '>' + esc(s) + '</option>').join('') + '</select></td>';
            }
            return cell(f, r[f]);
          }).join('');
          let acts = '';
          if (cfg.published) acts += '<button class="btn sm alt" data-act="toggle" data-id="' + esc(r.id) + '">' + (r.is_published ? 'Hide' : 'Publish') + '</button> ';
          if (cfg.del) acts += '<button class="btn sm danger" data-act="delete" data-id="' + esc(r.id) + '">Delete</button>';
          return '<tr>' + tds + (hasAct ? '<td><div class="actions">' + acts + '</div></td>' : '') + '</tr>';
        }).join('') + '</tbody></table></div>';
    }
    $('#content').innerHTML = formHtml(cfg.form) +
      '<div class="card"><h3>' + esc(cfg.label) + ' (' + rows.length + (rows.length !== all.length ? ' of ' + all.length : '') + ') <button class="btn sm alt" data-act="csv">Export CSV</button></h3>' + body + '</div>';
  }
  $('#search').addEventListener('input', () => { if (current !== 'overview' && cache[current]) renderView(current); });

  /* ---------- actions ---------- */
  function csv() {
    const cfg = tables[current], rows = cache[current] || [];
    const esc2 = v => '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"';
    const out = [cfg.fields.map(esc2).join(',')].concat(rows.map(r => cfg.fields.map(f => esc2(r[f])).join(','))).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([out], { type: 'text/csv' }));
    a.download = current + '.csv';
    document.body.appendChild(a); a.click(); a.remove();
    toast('Exported ' + current + '.csv');
  }
  async function changed(promise, okMsg) {
    const { data, error } = await promise;
    if (error) { toast('Failed: ' + error.message); return false; }
    if (!data || !data.length) { toast('Not allowed, or the record no longer exists.'); return false; }
    toast(okMsg);
    return true;
  }
  document.addEventListener('click', async e => {
    const v = e.target.closest('[data-view]');
    if (v && tables[v.dataset.view]) { go(v.dataset.view); return; }
    const el = e.target.closest('[data-act]');
    if (!el || el.tagName === 'SELECT') return;
    const act = el.dataset.act, cfg = tables[current], id = el.dataset.id;
    if (act === 'signout') { signOut(); return; }
    if (act === 'csv') { csv(); return; }
    if (act === 'delete') {
      if (!confirm('Delete this record permanently?')) return;
      if (await changed(db.from(cfg.table).delete().eq('id', id).select(), 'Deleted')) load(current);
    }
    if (act === 'toggle') {
      const row = (cache[current] || []).find(r => String(r.id) === String(id));
      if (!row) return;
      if (await changed(db.from(cfg.table).update({ is_published: !row.is_published }).eq('id', id).select(), row.is_published ? 'Hidden' : 'Published')) load(current);
    }
  });
  document.addEventListener('change', async e => {
    const el = e.target;
    if (!el.dataset || el.dataset.act !== 'status') return;
    const cfg = tables[current];
    if (await changed(db.from(cfg.table).update({ status: el.value }).eq('id', el.dataset.id).select(), 'Status: ' + el.value)) {
      const row = (cache[current] || []).find(r => String(r.id) === String(el.dataset.id));
      if (row) row.status = el.value;
    } else {
      load(current);
    }
  });
  document.addEventListener('submit', async e => {
    const f = e.target, kind = f.dataset && f.dataset.form;
    if (!kind) return;
    e.preventDefault();
    const btn = f.querySelector('button');
    btn.disabled = true;
    try {
      let res;
      if (kind === 'notice') {
        res = await db.from('notices').insert({ title: f.elements.title.value.trim(), body: f.elements.body.value.trim(), is_published: f.elements.pub.checked, created_by: me ? me.id : null }).select();
        if (await changed(Promise.resolve(res), 'Notice saved')) load('notices');
      } else if (kind === 'service') {
        const url = f.elements.url.value.trim();
        if (url && !/^https?:\/\//i.test(url)) { toast('Link must start with https://'); return; }
        res = await db.from('gov_services').insert({ name: f.elements.name.value.trim(), category: f.elements.category.value.trim() || null, url: url || null, description: f.elements.description.value.trim() || null, sort: parseInt(f.elements.sort.value, 10) || 0 }).select();
        if (await changed(Promise.resolve(res), 'Service added')) load('gov_services');
      }
    } finally {
      btn.disabled = false;
    }
  });

  /* ---------- start: reuse an existing session ---------- */
  (async function init() {
    try {
      const { data } = await db.auth.getSession();
      if (data && data.session) await enter(data.session.user);
    } catch (e) { /* stay on the login screen */ }
  })();
})();
