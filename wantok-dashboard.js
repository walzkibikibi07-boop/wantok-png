(function(){
'use strict';
var APP_KEY='wantok_png_app_v1', EXTRA_KEY='wantok_admin_extra_v1';
function $(s){return document.querySelector(s);}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function uid(){return 'x'+Math.random().toString(36).slice(2,9);}
function H(h){return Date.now()-h*3600000;}
function ago(ts){var s=(Date.now()-ts)/1000;if(s<60)return 'now';var m=s/60;if(m<60)return Math.floor(m)+'m ago';var h=m/60;if(h<24)return Math.floor(h)+'h ago';return Math.floor(h/24)+'d ago';}
var tt;function toast(m){var e=$('#toast');e.textContent=m;e.classList.add('show');clearTimeout(tt);tt=setTimeout(function(){e.classList.remove('show');},1900);}

/* ---------- data ---------- */
function seedApp(){return {v:1,user:{name:'You',village:'Popondetta'},lang:'en',saver:false,tips:0,viewed:{},saved:{},
 listings:[
  {id:'l1',title:'Fresh Garden Produce',price:'K10',cat:'Food',desc:'Fresh kaukau and greens.',seller:'Mary Tonny',km:2,ts:H(3)},
  {id:'l2',title:'4WD Vehicle for Sale',price:'K35,000',cat:'Vehicles',desc:'Well kept 4WD.',seller:'Joe Kila',km:5,ts:H(20)},
  {id:'l3',title:'Local Food & Drinks',price:'K30',cat:'Business',desc:'Lunch packs and drinks.',seller:"Kila's Kitchen",km:4,ts:H(6)},
  {id:'l4',title:'Handmade Bilum Bag',price:'K80',cat:'Crafts',desc:'Hand woven bilum.',seller:'Sarah Ovia',km:7,ts:H(30)},
  {id:'l5',title:'Used Mobile Phone',price:'K250',cat:'Electronics',desc:'Works well.',seller:'Peter Auri',km:3,ts:H(9)},
  {id:'l6',title:'Sand & Gravel (per load)',price:'K150',cat:'Building',desc:'River sand and gravel.',seller:'Oro Supplies',km:9,ts:H(50)}],
 jobs:[
  {id:'j1',title:'General Labour Needed',pay:'K50/day',loc:'Popondetta',cat:'Labour',employer:'Oro Builders',desc:'Site clean-up.',applied:false},
  {id:'j2',title:'Carpenter Wanted',pay:'K120/day',loc:'Oro Bay',cat:'Trades',employer:'Coastal Construction',desc:'House framing.',applied:false},
  {id:'j3',title:'Shop Assistant',pay:'K400/week',loc:'Popondetta Town',cat:'Retail',employer:'Kai-Bar Grocery',desc:'Serve customers.',applied:false},
  {id:'j4',title:'PMV Driver',pay:'K100/day',loc:'Popondetta - Oro Bay',cat:'Transport',employer:'Oro Transport',desc:'Licence needed.',applied:false}],
 posts:[
  {id:'p0',author:'Gov Connect Official',verified:true,official:true,place:'Public Notice',text:'Birth registration and ID awareness this Friday at the district office.',ts:H(1),scope:'district',likes:412,shares:96,comments:[{},{}]},
  {id:'p1',author:'Mary Tonny',place:'Oro Province',text:'Community clean-up this Saturday at the village market.',ts:H(2),scope:'village',likes:248,shares:12,comments:[{}]},
  {id:'p2',author:"Kila's Kitchen",verified:true,place:'Popondetta',text:'Fresh mumu and kaukau lunch packs today, K15 each.',ts:H(5),scope:'village',likes:91,shares:5,comments:[]}],
 reports:[
  {id:'r1',ref:'GC-4821',cat:'Water',loc:'Embessa village',desc:'Water tap broken near the school.',status:'Received',ts:H(8)},
  {id:'r2',ref:'GC-1930',cat:'Roads',loc:'Oro Bay road',desc:'Large pothole near the wharf junction.',status:'In Progress',ts:H(30)},
  {id:'r3',ref:'GC-7712',cat:'Electricity',loc:'Sangara',desc:'Power lines down after storm.',status:'Resolved',ts:H(80)}],
 notices:[
  {id:'g1',title:'Water supply maintenance',body:'Maintenance in Popondetta tomorrow, 8am to 2pm. Please store water today.',ts:H(3)},
  {id:'g2',title:'Birth registration awareness',body:'Awareness session this Friday at the district office.',ts:H(1)}],
 talents:[],circles:[],stories:[],conv:{},notes:[],trend:[]};}
function seedExtra(){return {users:[
  {id:'u1',name:'Mary Tonny',village:'Popondetta',joined:H(900),status:'Active',verified:true},
  {id:'u2',name:'Joe Kila',village:'Oro Bay',joined:H(700),status:'Active',verified:false},
  {id:'u3',name:"Kila's Kitchen",village:'Popondetta',joined:H(600),status:'Active',verified:true},
  {id:'u4',name:'Sarah Ovia',village:'Embessa',joined:H(400),status:'Active',verified:false},
  {id:'u5',name:'Peter Auri',village:'Sangara',joined:H(200),status:'Suspended',verified:false},
  {id:'u6',name:'Oro Supplies',village:'Higaturu',joined:H(120),status:'Active',verified:true},
  {id:'u7',name:'Paul Mara',village:'Popondetta',joined:H(48),status:'Active',verified:false}],
  trend:[120,160,148,210,260,240,310]};}
var APP,EXTRA,live=false;
function load(){
  try{var r=localStorage.getItem(APP_KEY);if(r){var d=JSON.parse(r);if(d&&d.v===1){APP=d;live=true;}}}catch(e){}
  if(!APP){APP=seedApp();}
  try{var x=localStorage.getItem(EXTRA_KEY);if(x)EXTRA=JSON.parse(x);}catch(e){}
  if(!EXTRA||!EXTRA.users)EXTRA=seedExtra();
}
function save(){try{localStorage.setItem(APP_KEY,JSON.stringify(APP));localStorage.setItem(EXTRA_KEY,JSON.stringify(EXTRA));}catch(e){toast('Storage full');}}
load();

/* ---------- helpers ---------- */
var view='overview',q='';
var VIEWS=[['overview','📊','Overview'],['reports','🗂️','Reports'],['listings','🛒','Listings'],['jobs','💼','Jobs'],['posts','💬','Posts'],['users','👥','Users'],['notices','📢','Notices'],['settings','⚙️','Settings']];
function match(o){if(!q)return true;return JSON.stringify(o).toLowerCase().indexOf(q.toLowerCase())>-1;}
function openReports(){return APP.reports.filter(function(r){return r.status!=='Resolved';}).length;}
function count(arr,key){var m={};arr.forEach(function(x){var k=x[key]||'Other';m[k]=(m[k]||0)+1;});return m;}
function statusTag(s){return '<span class="tag '+(s==='Resolved'||s==='Active'?'g':s==='In Progress'?'y':s==='Suspended'?'r':'b')+'">'+esc(s)+'</span>';}
function csv(name,rows){
  var out=rows.map(function(r){return r.map(function(c){return '"'+String(c==null?'':c).replace(/"/g,'""')+'"';}).join(',');}).join('\n');
  var a=document.createElement('a');a.href=URL.createObjectURL(new Blob([out],{type:'text/csv'}));a.download=name+'.csv';document.body.appendChild(a);a.click();a.remove();toast('Exported '+name+'.csv');
}
function table(head,rows,empty){
  if(!rows.length)return '<div class="empty">'+esc(empty||'Nothing here yet.')+'</div>';
  return '<div class="tw"><table><thead><tr>'+head.map(function(h){return '<th>'+h+'</th>';}).join('')+'</tr></thead><tbody>'+rows.join('')+'</tbody></table></div>';
}

/* ---------- charts (inline SVG, no libraries) ---------- */
function bars(map,color){
  var keys=Object.keys(map);if(!keys.length)return '<div class="empty">No data</div>';
  var max=Math.max.apply(null,keys.map(function(k){return map[k];}));
  return '<div class="bars" style="--c:'+color+'">'+keys.sort(function(a,b){return map[b]-map[a];}).map(function(k){return '<div class="r"><span>'+esc(k)+'</span><div class="bar" style="width:'+Math.max(3,Math.round(map[k]/max*100))+'%"></div><b>'+map[k]+'</b></div>';}).join('')+'</div>';
}
function donut(parts){
  var tot=parts.reduce(function(a,p){return a+p.v;},0);if(!tot)return '<div class="empty">No data</div>';
  var r=52,c=2*Math.PI*r,off=0,svg='<svg viewBox="0 0 140 140" width="150" height="150" role="img" aria-label="Reports by status"><g transform="rotate(-90 70 70)">';
  parts.forEach(function(p){var len=p.v/tot*c;svg+='<circle cx="70" cy="70" r="'+r+'" fill="none" stroke="'+p.c+'" stroke-width="22" stroke-dasharray="'+len+' '+(c-len)+'" stroke-dashoffset="'+(-off)+'"/>';off+=len;});
  svg+='</g><text x="70" y="68" text-anchor="middle" font-size="26" font-weight="800">'+tot+'</text><text x="70" y="86" text-anchor="middle" font-size="11" fill="#6b7686">reports</text></svg>';
  return '<div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap">'+svg+'<div class="legend" style="flex-direction:column;gap:8px">'+parts.map(function(p){return '<span><i style="background:'+p.c+'"></i>'+esc(p.n)+': <b>'+p.v+'</b></span>';}).join('')+'</div></div>';
}
function line(vals){
  var w=420,h=150,p=22,max=Math.max.apply(null,vals)*1.1,n=vals.length;
  var pts=vals.map(function(v,i){return [p+i*(w-2*p)/(n-1),h-p-(v/max)*(h-2*p)];});
  var d=pts.map(function(a,i){return (i?'L':'M')+a[0].toFixed(1)+' '+a[1].toFixed(1);}).join(' ');
  var area=d+' L'+pts[n-1][0].toFixed(1)+' '+(h-p)+' L'+pts[0][0].toFixed(1)+' '+(h-p)+' Z';
  var days=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  return '<svg viewBox="0 0 '+w+' '+h+'" width="100%" role="img" aria-label="Daily active users"><path d="'+area+'" fill="rgba(21,101,192,.12)"/><path d="'+d+'" fill="none" stroke="#1565c0" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>'
   +pts.map(function(a,i){return '<circle cx="'+a[0].toFixed(1)+'" cy="'+a[1].toFixed(1)+'" r="4" fill="#1565c0"/><text x="'+a[0].toFixed(1)+'" y="'+(h-5)+'" text-anchor="middle" font-size="10" fill="#6b7686">'+days[i%7]+'</text><text x="'+a[0].toFixed(1)+'" y="'+(a[1]-9).toFixed(1)+'" text-anchor="middle" font-size="10" font-weight="700">'+vals[i]+'</text>';}).join('')+'</svg>';
}

/* ---------- views ---------- */
var R={};
R.overview=function(){
  var rep=APP.reports,st=count(rep,'status');
  var kp=[['Users',EXTRA.users.length,'#1565c0'],['Listings',APP.listings.length,'#d62828'],['Jobs',APP.jobs.length,'#f5b800'],['Posts',APP.posts.length,'#1f9d4a'],['Open reports',openReports(),'#b14bc4'],['Notices',APP.notices.length,'#0f4c81']];
  var recent=rep.slice().sort(function(a,b){return b.ts-a.ts;}).slice(0,4);
  return '<div class="kpis">'+kp.map(function(k){return '<div class="kpi" style="--c:'+k[2]+'"><small>'+k[0]+'</small><b>'+k[1]+'</b></div>';}).join('')+'</div>'
  +'<div class="grid2"><div class="card"><h3>Daily active users <span class="tag y">sample data</span></h3>'+line(EXTRA.trend)+'<p class="note">Real usage numbers need the live backend. This line is a placeholder you can edit in Settings.</p></div>'
  +'<div class="card"><h3>Gov Connect reports by status</h3>'+donut([{n:'Received',v:st['Received']||0,c:'#1565c0'},{n:'In Progress',v:st['In Progress']||0,c:'#f5b800'},{n:'Resolved',v:st['Resolved']||0,c:'#1f9d4a'}])+'</div></div>'
  +'<div class="grid2"><div class="card"><h3>Listings by category</h3>'+bars(count(APP.listings,'cat'),'#d62828')+'</div><div class="card"><h3>Jobs by category</h3>'+bars(count(APP.jobs,'cat'),'#f5b800')+'</div></div>'
  +'<div class="card"><h3>Latest reports <button class="btn sm alt" data-a="nav" data-v="reports">Manage</button></h3>'+table(['Ref','Type','Where','Status','When'],recent.map(function(r){return '<tr><td><b>'+esc(r.ref)+'</b></td><td>'+esc(r.cat)+'</td><td>'+esc(r.loc)+'</td><td>'+statusTag(r.status)+'</td><td>'+ago(r.ts)+'</td></tr>';}),'No reports yet.')+'</div>';
};
R.reports=function(){
  var rows=APP.reports.filter(match).sort(function(a,b){return b.ts-a.ts;}).map(function(r){
    return '<tr><td><b>'+esc(r.ref)+'</b></td><td>'+esc(r.cat)+'</td><td>'+esc(r.loc)+'</td><td class="t wrap">'+esc(r.desc)+'</td><td>'+ago(r.ts)+'</td><td><select class="st" data-a="repStatus" data-id="'+r.id+'">'+['Received','In Progress','Resolved'].map(function(s){return '<option'+(s===r.status?' selected':'')+'>'+s+'</option>';}).join('')+'</select></td><td><button class="btn sm alt" data-a="delReport" data-id="'+r.id+'">Delete</button></td></tr>';});
  return '<div class="card">'+table(['Ref','Type','Where','Problem','When','Status',''],rows,'No reports found.')+'</div>';
};
R.listings=function(){
  var rows=APP.listings.filter(match).sort(function(a,b){return b.ts-a.ts;}).map(function(l){
    return '<tr><td class="t"><b>'+esc(l.title)+'</b>'+(l.featured?' <span class="tag y">Featured</span>':'')+'</td><td>'+esc(l.price)+'</td><td>'+esc(l.cat)+'</td><td>'+esc(l.seller)+'</td><td>'+ago(l.ts)+'</td><td><div class="act"><button class="btn sm gold" data-a="feature" data-id="'+l.id+'">'+(l.featured?'Unfeature':'Feature')+'</button><button class="btn sm red" data-a="delListing" data-id="'+l.id+'">Remove</button></div></td></tr>';});
  return '<div class="card">'+table(['Item','Price','Category','Seller','Posted',''],rows,'No listings found.')+'</div>';
};
R.jobs=function(){
  var rows=APP.jobs.filter(match).map(function(j){
    return '<tr><td class="t"><b>'+esc(j.title)+'</b></td><td>'+esc(j.pay)+'</td><td>'+esc(j.employer)+'</td><td>'+esc(j.loc)+'</td><td>'+esc(j.cat)+'</td><td><button class="btn sm red" data-a="delJob" data-id="'+j.id+'">Remove</button></td></tr>';});
  return '<div class="card">'+table(['Job','Pay','Employer','Location','Category',''],rows,'No jobs found.')+'</div>';
};
R.posts=function(){
  var rows=APP.posts.filter(match).sort(function(a,b){return b.ts-a.ts;}).map(function(p){
    return '<tr><td><b>'+esc(p.author)+'</b>'+(p.verified?' <span class="tag b">✓</span>':'')+'</td><td class="t wrap">'+esc(p.text||'(photo only)')+'</td><td>'+esc(p.scope||'')+'</td><td>❤ '+(p.likes||0)+' · 💬 '+((p.comments||[]).length)+'</td><td>'+ago(p.ts)+'</td><td>'+(p.flagged?'<span class="tag r">Flagged</span>':'')+'</td><td><div class="act"><button class="btn sm alt" data-a="flagPost" data-id="'+p.id+'">'+(p.flagged?'Unflag':'Flag')+'</button><button class="btn sm red" data-a="delPost" data-id="'+p.id+'">Delete</button></div></td></tr>';});
  return '<div class="card">'+table(['Author','Post','Reach','Activity','When','',''],rows,'No posts found.')+'</div>';
};
R.users=function(){
  var rows=EXTRA.users.filter(match).map(function(u){
    return '<tr><td><b>'+esc(u.name)+'</b>'+(u.verified?' <span class="tag b">Verified ✓</span>':'')+'</td><td>'+esc(u.village)+'</td><td>'+ago(u.joined)+'</td><td>'+statusTag(u.status)+'</td><td><div class="act"><button class="btn sm alt" data-a="verifyUser" data-id="'+u.id+'">'+(u.verified?'Remove tick':'Verify')+'</button><button class="btn sm '+(u.status==='Active'?'red':'gold')+'" data-a="suspendUser" data-id="'+u.id+'">'+(u.status==='Active'?'Suspend':'Restore')+'</button></div></td></tr>';});
  return '<div class="card">'+table(['Name','Village','Joined','Status',''],rows,'No users found.')+'<p class="note">Demo user list. Real accounts arrive with the live backend and login.</p></div>';
};
R.notices=function(){
  var rows=APP.notices.filter(match).sort(function(a,b){return b.ts-a.ts;}).map(function(n){
    return '<tr><td class="t"><b>'+esc(n.title)+'</b></td><td class="wrap">'+esc(n.body)+'</td><td>'+ago(n.ts)+'</td><td><button class="btn sm red" data-a="delNotice" data-id="'+n.id+'">Delete</button></td></tr>';});
  return '<div class="grid2"><div class="card"><h3>Publish a notice</h3><form class="form" data-form="notice"><input name="title" placeholder="Title" required maxlength="80"><textarea name="body" rows="4" placeholder="Message to the community" required maxlength="500"></textarea><button class="btn gold">Publish to Gov Connect</button></form></div>'
   +'<div class="card"><h3>Published notices</h3>'+table(['Title','Message','When',''],rows,'No notices yet.')+'</div></div>';
};
R.settings=function(){
  return '<div class="grid2"><div class="card"><h3>Data connection</h3><p style="font-size:14px;line-height:1.5">'+(live?'<span class="tag g">Connected</span> Reading and writing the same saved data as the WANTOK PNG app in this browser.':'<span class="tag y">Demo data</span> The app data was not found in this browser, so sample data is shown. Open the app in the same browser and site first to connect.')+'</p></div>'
  +'<div class="card"><h3>Backup &amp; restore</h3><div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn" data-a="exportJson">Export JSON</button><label class="btn alt" style="cursor:pointer">Import JSON<input type="file" accept="application/json" id="imp" hidden></label></div><p class="note">Export saves a backup of everything. Import replaces current data.</p></div></div>'
  +'<div class="grid2"><div class="card"><h3>Export tables (CSV)</h3><div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn alt" data-a="csv" data-v="listings">Listings</button><button class="btn alt" data-a="csv" data-v="jobs">Jobs</button><button class="btn alt" data-a="csv" data-v="reports">Reports</button><button class="btn alt" data-a="csv" data-v="users">Users</button></div></div>'
  +'<div class="card"><h3>Sample trend line</h3><form class="form" data-form="trend"><input name="vals" value="'+EXTRA.trend.join(', ')+'" placeholder="7 numbers separated by commas"><button class="btn alt">Update chart</button></form></div></div>'
  +'<div class="card"><h3>Danger zone</h3><button class="btn red" data-a="reset">Reset dashboard to demo data</button></div>';
};

/* ---------- render ---------- */
function renderSide(){
  $('#side').innerHTML='<div class="brand"><i></i><div>WANTOK <span>PNG</span><small>Admin Dashboard</small></div></div>'
   +VIEWS.map(function(v){var c=v[0]==='reports'?openReports():0;return '<button class="nav'+(view===v[0]?' on':'')+'" data-a="nav" data-v="'+v[0]+'"><span>'+v[1]+'</span>'+v[2]+(c?'<span class="cnt">'+c+'</span>':'')+'</button>';}).join('')
   +'<div class="conn">'+(live?'🟢 Connected to app data':'🟡 Demo data')+'</div>';
}
function render(){
  renderSide();
  var t=VIEWS.filter(function(v){return v[0]===view;})[0];
  $('#title').textContent=t[2];
  var tb={listings:'listings',jobs:'jobs',reports:'reports',users:'users'}[view];
  $('#topbtn').innerHTML=tb?'<button class="btn alt" data-a="csv" data-v="'+tb+'">Export CSV</button>':'';
  $('#q').style.display=(view==='overview'||view==='settings')?'none':'';
  $('#view').innerHTML=R[view]();
}
function nav(v){view=v;q='';$('#q').value='';render();window.scrollTo(0,0);}

/* ---------- actions ---------- */
function by(arr,id){return arr.filter(function(x){return x.id===id;})[0];}
function rm(arr,id){return arr.filter(function(x){return x.id!==id;});}
var A={
nav:function(el){nav(el.dataset.v);},
delReport:function(el){if(!confirm('Delete this report?'))return;APP.reports=rm(APP.reports,el.dataset.id);save();render();toast('Report deleted');},
delListing:function(el){if(!confirm('Remove this listing?'))return;APP.listings=rm(APP.listings,el.dataset.id);if(APP.saved)delete APP.saved[el.dataset.id];save();render();toast('Listing removed');},
feature:function(el){var l=by(APP.listings,el.dataset.id);if(!l)return;l.featured=!l.featured;save();render();toast(l.featured?'Featured':'Unfeatured');},
delJob:function(el){if(!confirm('Remove this job?'))return;APP.jobs=rm(APP.jobs,el.dataset.id);save();render();toast('Job removed');},
delPost:function(el){if(!confirm('Delete this post?'))return;APP.posts=rm(APP.posts,el.dataset.id);save();render();toast('Post deleted');},
flagPost:function(el){var p=by(APP.posts,el.dataset.id);if(!p)return;p.flagged=!p.flagged;save();render();toast(p.flagged?'Post flagged':'Flag removed');},
verifyUser:function(el){var u=by(EXTRA.users,el.dataset.id);if(!u)return;u.verified=!u.verified;save();render();toast(u.verified?u.name+' verified':'Tick removed');},
suspendUser:function(el){var u=by(EXTRA.users,el.dataset.id);if(!u)return;u.status=u.status==='Active'?'Suspended':'Active';save();render();toast(u.name+': '+u.status);},
delNotice:function(el){APP.notices=rm(APP.notices,el.dataset.id);save();render();toast('Notice deleted');},
exportJson:function(){var a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify({app:APP,extra:EXTRA},null,2)],{type:'application/json'}));a.download='wantok-backup.json';document.body.appendChild(a);a.click();a.remove();toast('Backup downloaded');},
csv:function(el){var v=el.dataset.v;
  if(v==='listings')csv('listings',[['Title','Price','Category','Seller','Details']].concat(APP.listings.map(function(l){return [l.title,l.price,l.cat,l.seller,l.desc];})));
  else if(v==='jobs')csv('jobs',[['Title','Pay','Employer','Location','Category']].concat(APP.jobs.map(function(j){return [j.title,j.pay,j.employer,j.loc,j.cat];})));
  else if(v==='reports')csv('reports',[['Ref','Type','Location','Problem','Status']].concat(APP.reports.map(function(r){return [r.ref,r.cat,r.loc,r.desc,r.status];})));
  else csv('users',[['Name','Village','Status','Verified']].concat(EXTRA.users.map(function(u){return [u.name,u.village,u.status,u.verified?'yes':'no'];})));},
reset:function(){if(!confirm('Reset ALL data to demo data? This also resets what the app shows.'))return;APP=seedApp();EXTRA=seedExtra();save();render();toast('Reset to demo data');}
};
document.addEventListener('click',function(e){var el=e.target.closest('[data-a]');if(!el||el.tagName==='SELECT')return;var f=A[el.dataset.a];if(f){e.preventDefault();f(el);}});
document.addEventListener('change',function(e){var t=e.target;
  if(t.dataset&&t.dataset.a==='repStatus'){var r=by(APP.reports,t.dataset.id);if(r){r.status=t.value;save();render();toast(r.ref+': '+r.status);}}
  if(t.id==='imp'){var f=t.files&&t.files[0];if(!f)return;var rd=new FileReader();rd.onload=function(){try{var d=JSON.parse(rd.result);if(!d.app||d.app.v!==1)throw 1;APP=d.app;if(d.extra&&d.extra.users)EXTRA=d.extra;save();render();toast('Backup restored');}catch(x){toast('That file is not a valid backup');}};rd.readAsText(f);}
});
document.addEventListener('input',function(e){if(e.target.id==='q'){q=e.target.value;$('#view').innerHTML=R[view]();}});
document.addEventListener('submit',function(e){var f=e.target,n=f.dataset&&f.dataset.form;if(!n)return;e.preventDefault();
  if(n==='notice'){APP.notices.unshift({id:uid(),title:f.elements.title.value.trim(),body:f.elements.body.value.trim(),ts:Date.now()});save();render();toast('Notice published. It shows in the app.');}
  if(n==='trend'){var v=f.elements.vals.value.split(',').map(function(x){return parseFloat(x);}).filter(function(x){return !isNaN(x)&&x>=0;});if(v.length!==7){toast('Enter exactly 7 numbers');return;}EXTRA.trend=v;save();render();toast('Chart updated');}
});
window.addEventListener('storage',function(){load();render();});
render();
})();
