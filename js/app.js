/* =====================================================================
   AGC Learning Portal — Navigation, login, page rendering and event handling. Starts the app.
   Scripts share one global scope and load in the order listed in index.html.
   ===================================================================== */
/* ---------- navigation ---------- */
const NAV = {
  student:[["dashboard","Dashboard"],["courses","My courses"],["assignments","Assignments"],["assessments","Assessments"],["notes","Session notes"],["schedule","Schedule"]],
  parent:[["overview","Overview"],["notes","Session notes"],["schedule","Schedule"],["packages","Packages & balance"]],
  tutor:[["tdash","Dashboard"],["log","Log a session"],["review","Review work"],["schedule","Schedule"],["calendar","Calendar"],["hours","Hours & payments"],["library","Course library"]],
  admin:[["adash","Students & progress"],["profiles","Student profiles"],["schedule","Schedule"],["calendar","Calendar"]],
  superadmin:[["portal","Portal progress"],["adash","Students & progress"],["profiles","Student profiles"],["schedule","Schedule"],["calendar","Calendar"],["hours","Tutor hours & payments"],["access","Admin access"]],
  developer:[["dev","System"],["devdata","Data editor"]]
};
const ALLOWED = {
  student:["dashboard","courses","course","lesson","assignments","assignment","assessments","quiz","notes","schedule"],
  parent:["overview","notes","schedule","packages"],
  // Tutors don't see student pages (progress or profiles): only Admin and Super Admin do.
  tutor:["tdash","log","review","assignment","schedule","calendar","hours","library","course","lesson"],
  admin:["adash","student","profiles","profile","schedule","calendar"],
  superadmin:["portal","adash","student","profiles","profile","schedule","calendar","hours","access"],
  developer:["dev","devdata"]
};
// Pages the Admin only sees when the Super Admin allows it
const NEEDS = {adash:"viewStudents", student:"viewStudents", profiles:"viewProfiles", profile:"viewProfiles", schedule:"viewSchedule", calendar:"viewSchedule"};
const navFor = role => NAV[role].filter(([k]) => role!=="admin" || !NEEDS[k] || can(NEEDS[k]));
function route(){ const h = location.hash.replace(/^#\/?/,""); const [name,...args] = h.split("/"); return {name,args}; }

/* ---------- Login (email + password) ----------
   DEMO ONLY: there is no server, so accounts and the password live in this page and anyone can read them.
   Before real families use the portal, sign-in must move to a real service (e.g. Supabase Auth). */
const DEMO_PASSWORD = "agc2026";
const slug = n => String(n||"").toLowerCase().normalize("NFD").replace(/[^a-z0-9 ]/g,"").trim().replace(/ +/g,".");
function accounts(){
  const list = [
    {email:"rconcepcion@agctutorials.com", role:"tutor", label:"Tutor · "+S.tutor},
    {email:"admin@agctutorials.com", role:"admin", label:"Admin · "+ADMIN},
    {email:"superadmin@agctutorials.com", role:"superadmin", label:"Super Admin · "+SUPER},
    {email:"developer@agctutorials.com", role:"developer", label:"Developer"}
  ];
  S.students.forEach(s => {
    list.push({email:slug(s.name)+"@students.agctutorials.com", role:"student", student:s.id, label:"Student · "+s.name});
    if(s.parentEmail && !list.some(a=>a.email===s.parentEmail.toLowerCase())) list.push({email:s.parentEmail.toLowerCase(), role:"parent", student:s.id, label:"Parent · "+s.parent});
  });
  return list;
}
function renderLogin(){
  const accts = accounts();
  document.getElementById("root").innerHTML = `<div class="login"><div class="login-card narrow">
    <div class="login-logo"><img src="${LOGO}" alt="AGC Tutorials — Aspire. Grow. Conquer."></div>
    <h1>Log in</h1><p class="sub">Welcome to the AGC Learning Portal.</p>
    <form class="login-form" id="loginForm" novalidate>
      <div class="login-err" role="alert" hidden></div>
      <div class="field"><label for="le">Email</label><input type="email" id="le" name="email" autocomplete="username" required></div>
      <div class="field"><label for="lp">Password</label><div class="pw"><input type="password" id="lp" name="password" autocomplete="current-password" required><button type="button" data-act="togglepw" aria-controls="lp" aria-pressed="false">Show</button></div></div>
      <div class="login-row"><label><input type="checkbox" name="remember" checked> Keep me logged in</label><a href="mailto:rconcepcion@agctutorials.com?subject=${encodeURIComponent("AGC Learning Portal password help")}">Forgot password?</a></div>
      <button type="submit" class="btn btn-primary">Log in</button>
    </form>
    <details class="demo"><summary>Demo accounts</summary>
      <p>Every demo account uses the password <b>${DEMO_PASSWORD}</b>. Click one to fill it in.</p>
      <ul>${accts.map(a=>`<li><button type="button" data-act="demofill" data-email="${esc(a.email)}"><b>${esc(a.email)}</b><span>${esc(a.label)}</span></button></li>`).join("")}</ul>
    </details>
    <p class="foot">Changes are saved in this browser · <button data-act="reset" style="background:none;border:0;color:var(--gold-text);cursor:pointer;text-decoration:underline;font:inherit">Reset demo data</button></p>
  </div></div>`;
  const f = document.getElementById("loginForm"), err = f.querySelector(".login-err");
  f.addEventListener("input", () => { err.hidden = true; });
  f.addEventListener("submit", e => {
    e.preventDefault();
    const email = f.email.value.trim().toLowerCase(), pw = f.password.value;
    if(!email || !pw){ err.textContent = "Enter your email and password."; err.hidden = false; (email?f.password:f.email).focus(); return; }
    const a = accounts().find(x => x.email === email);
    if(!a || pw !== DEMO_PASSWORD){ err.textContent = "That email and password don't match. Check them and try again."; err.hidden = false; f.password.value = ""; f.password.focus(); return; }
    ME = {role:a.role, student:a.student||null, email:a.email};
    if(f.remember.checked) saveMe(); else { try{ localStorage.removeItem(ME_KEY); }catch(e2){} }
    location.hash = "#/"+NAV[ME.role][0][0]; render();
  });
}
function whoLabel(){
  if(ME.role==="tutor") return {n:S.tutor,r:"Founder & Tutor"};
  if(ME.role==="admin") return {n:ADMIN,r:"Admin"};
  if(ME.role==="superadmin") return {n:SUPER,r:"Super Admin"};
  if(ME.role==="developer") return {n:DEV,r:"System maintenance"};
  const s = stu(ME.student); return ME.role==="parent" ? {n:s.parent,r:"Parent of "+s.name.split(" ")[0]} : {n:s.name,r:"Student · "+s.grade};
}
function render(){
  if(!ME){ renderLogin(); return; }
  let {name,args} = route();
  if(!ALLOWED[ME.role]){ ME = null; saveMe(); renderLogin(); return; }
  if(!ALLOWED[ME.role].includes(name)){ name = (navFor(ME.role)[0]||NAV[ME.role][0])[0]; history.replaceState(null,"","#/"+name); args=[]; }
  let html;
  try { html = ME.role==="admin" && NEEDS[name] && !can(NEEDS[name]) ? V.restricted() : (V[name]||V.notfound)(...args); }
  catch(err) { logError(err.message, "#/"+name); html = `<div class="head"><h1>Something went wrong</h1><p>This page couldn't load. The error was saved to the Developer error log.</p></div><div class="card"><p class="small muted" style="margin:0">${esc(err.message)}</p></div>`; }
  if(ME.dev){ const w0 = whoLabel(); html = `<div class="devbar"><span>Developer preview · viewing as <b>${esc(w0.n)}</b> (${esc(w0.r)})</span><button data-act="devback">Back to Developer</button></div>` + html; }
  const pending = S.assignments.filter(a=>a.status==="submitted").length;
  const todo = ME.role==="student" ? assignFor(ME.student).filter(a=>a.status==="assigned").length : 0;
  const parentOf = {course:"courses",lesson:ME.role==="tutor"?"library":"courses",assignment:ME.role==="tutor"?"review":"assignments",quiz:"assessments",student:ME.role==="tutor"?"students":"adash",profile:"profiles"};
  const active = parentOf[name] || name;
  const w = whoLabel();
  document.getElementById("root").innerHTML = `<div class="app">
    <div class="topbar"><button data-act="menu" aria-controls="side" aria-expanded="false">Menu</button><b>AGC Learning Portal</b></div>
    <div class="scrim" data-act="closemenu"></div>
    <aside class="side" id="side"><div class="logo"><img src="${LOGO}" alt="AGC Tutorials"></div>
      <nav aria-label="Main">${navFor(ME.role).map(([k,l])=>{const badge=k==="review"&&pending?`<span class="pill">${pending}</span>`:k==="assignments"&&todo?`<span class="pill">${todo}</span>`:"";return `<a href="#/${k}" ${k===active?'aria-current="page"':""}>${l}${badge}</a>`}).join("")}</nav>
      ${viewAsSelect()}
      <div class="who"><b>${esc(w.n)}</b><span>${esc(w.r)}</span><br><button data-act="logout">Log out</button></div>
    </aside>
    <main><div class="page">${html}</div></main></div>`;
  document.querySelector("main").focus?.();
}

/* ---------- events ---------- */
document.addEventListener("click", e => {
  const b = e.target.closest("[data-act]"); if(!b) return;
  const a = b.dataset.act;
  if(a==="login"){ ME = {role:b.dataset.role, student:b.dataset.student||null}; saveMe(); location.hash = "#/"+NAV[ME.role][0][0]; render(); }
  if(a==="logout"){ ME = null; saveMe(); location.hash = ""; render(); }
  if(a==="togglepw"){ const i = document.getElementById("lp"), show = i.type==="password"; i.type = show?"text":"password"; b.textContent = show?"Hide":"Show"; b.setAttribute("aria-pressed", String(show)); i.focus(); }
  if(a==="demofill"){ const f = document.getElementById("loginForm"); f.email.value = b.dataset.email; f.password.value = DEMO_PASSWORD; f.querySelector(".login-err").hidden = true; f.querySelector('button[type="submit"]').focus(); }
  if(a==="reset"){ S = seed(); save(); toast("Demo data reset"); }
  if(a==="menu"){ document.getElementById("side").classList.add("open"); document.querySelector(".scrim").classList.add("show"); b.setAttribute("aria-expanded","true"); }
  if(a==="closemenu"){ document.getElementById("side").classList.remove("open"); b.classList.remove("show"); }
  if(a==="complete"){ const s = currentStudent(); if(!s.done.includes(b.dataset.lid)) s.done.push(b.dataset.lid); save(); toast("Lesson complete. One step higher!");
    location.hash = b.dataset.next ? `#/lesson/${b.dataset.cid}/${b.dataset.next}` : `#/course/${b.dataset.cid}`; }
  if(a==="permdefaults"){ S.adminPerms = defaultPerms(); S.accessLog.push({date:today(),text:"Admin access reset to defaults"}); save(); toast("Admin access reset to defaults"); render(); }
  if(a==="retake"){ lastQuiz = null; render(); window.scrollTo(0,0); }
  if(a==="csv"){ downloadCsv(b.dataset.kind); toast("Download started"); }
  if(a==="devback"){ switchView("developer"); }
  if(a==="calday"){ CAL.day = b.dataset.d; render(); }
  if(a==="calmove"){ const [y,m] = CAL.ym.split("-").map(Number); const d = new Date(y, m-1+Number(b.dataset.n), 1); CAL.ym = iso(d).slice(0,7); CAL.day = CAL.ym===today().slice(0,7) ? today() : iso(d); render(); }
  if(a==="avdel" && canAvail()){ S.unavail = (S.unavail||[]).filter(x => x.id!==b.dataset.id); save(); toast("Unavailable time removed"); render(); }
  if(a==="renewpick" && ME?.role==="parent"){ RENEW = b.dataset.pkg; render(); document.getElementById("renew")?.scrollIntoView({behavior:"smooth",block:"start"}); }
  if(a==="renewcancel"){ RENEW = null; render(); }
  if(a==="caltoday"){ CAL = {ym:today().slice(0,7), day:today()}; render(); }
  if(a==="devrevert"){ render(); toast("Edits discarded"); }
  if(a==="devclearerr"){ try{ localStorage.removeItem(ERR_KEY); }catch(e){} logDev("Cleared the error log"); save(); toast("Error log cleared"); render(); }
  if(a==="devexport"){ const blob = new Blob([JSON.stringify(S,null,2)],{type:"application/json"}); const l = document.createElement("a");
    l.href = URL.createObjectURL(blob); l.download = `agc-portal-backup_${today()}.json`; l.click(); setTimeout(()=>URL.revokeObjectURL(l.href),1000);
    logDev("Downloaded a backup"); save(); toast("Backup downloaded"); }
  if(a==="devreset" && confirm("Replace ALL portal data in this browser with the demo data? Download a backup first if you need it.")){ S = seed(); logDev("Reset all data to demo data"); save(); toast("Reset to demo data"); render(); }
});
document.addEventListener("input", e => {
  if(e.target.id!=="pfq") return;
  const q = e.target.value.trim().toLowerCase(); let n = 0;
  document.querySelectorAll(".pf-tbl tbody tr[data-q]").forEach(tr => { const show = !q || tr.dataset.q.includes(q); tr.hidden = !show; if(show) n++; });
  document.querySelector(".pf-tbl .pf-none").hidden = n > 0;
  document.getElementById("pfcount").textContent = q ? `${n} of ${S.students.length} students` : `${S.students.length} students`;
});
document.addEventListener("change", e => {
  if(e.target.id==="vas"){ if(ME?.role==="developer" || ME?.dev) switchView(e.target.value); return; }
  if(e.target.name==="allday"){ e.target.closest(".av-panel")?.classList.toggle("is-allday", e.target.checked); return; }
  if(e.target.id==="dk"){ location.hash = "#/devdata/"+e.target.value; return; }
  if(e.target.id==="devimp" && e.target.files[0]){ const file = e.target.files[0]; file.text().then(txt => {
    let d; try { d = JSON.parse(txt); } catch(err) { toast("That file isn't valid JSON"); return; }
    if(!d || !Array.isArray(d.students) || !Array.isArray(d.notes) || !d.courses){ toast("That file isn't an AGC portal backup"); return; }
    if(!confirm(`Replace ALL portal data in this browser with "${file.name}"?`)) return;
    S = d; logDev("Imported backup "+file.name); save(); location.reload(); }); return; }
  if(e.target.id==="ls"){ const pe = document.getElementById("lpe"); if(pe) pe.value = stu(e.target.value)?.parentEmail||""; }
});
document.addEventListener("submit", e => {
  const f = e.target.closest("form[data-form]"); if(!f) return; e.preventDefault();
  const d = Object.fromEntries(new FormData(f)); const kind = f.dataset.form;
  if(kind==="submit"){ const a = S.assignments.find(x=>x.id===f.dataset.id); a.submission=d.ans.trim(); a.status="submitted"; save(); toast("Assignment submitted"); render(); }
  if(kind==="grade"){ const a = S.assignments.find(x=>x.id===f.dataset.id); a.grade=d.grade; a.feedback=d.fb.trim(); a.status="graded"; save(); toast("Graded work returned"); location.hash="#/review"; }
  if(kind==="quiz"){ const q = S.quizzes[f.dataset.id]; const answers = q.questions.map((_,i)=>Number(d["q"+i]));
    const score = answers.filter((x,i)=>x===q.questions[i].a).length;
    S.results.push({id:uid("r"),student:ME.student,quiz:q.id,score,total:q.questions.length,date:today()}); save();
    lastQuiz = {id:q.id,answers,score}; render(); window.scrollTo(0,0); }
  if(kind==="note"){ const s = stu(d.student); const email = (d.parentEmail||"").trim(); if(email) s.parentEmail = email;
    const n = {id:uid("n"),student:d.student,date:d.date,service:d.service,mode:d.mode,focus:d.focus.trim(),summary:d.summary.trim(),next:d.next.trim()};
    S.notes.push(n); s.pkg.used = Math.min(s.pkg.total, s.pkg.used+1); save();
    const mail = d.emailParent && email;
    toast(`Note saved · ${remaining(s)} sessions left for ${s.name.split(" ")[0]}${mail?" · opening email to "+s.parent.split(" ")[0]:d.emailParent?" · add a parent email to send notes":""}`);
    location.hash = ME.role==="tutor" ? "#/tdash" : "#/student/"+s.id; if(mail) location.href = noteMailto(n, email); }
  if(kind==="perms"){ if(ME.role!=="superadmin") return;
    const changes = PERMS.filter(p => !!d[p[0]] !== !!S.adminPerms[p[0]]).map(p => (d[p[0]]?"Allowed ":"Removed ")+p[1]);
    PERMS.forEach(p => S.adminPerms[p[0]] = !!d[p[0]]);
    changes.forEach(c => S.accessLog.push({date:today(),text:c}));
    save(); toast(changes.length ? `Admin access updated · ${changes.length} change${changes.length>1?"s":""}` : "No changes"); render(); }
  if(kind==="profile"){ if(!can("editProfiles")) return; const s = stu(f.dataset.id);
    if(d.name.trim()) s.name = d.name.trim(); if(d.grade.trim()) s.grade = d.grade.trim(); if(d.parent.trim()) s.parent = d.parent.trim();
    s.parentEmail = d.parentEmail.trim();
    s.tutors = (d.tutors||"").split(",").map(t=>t.trim()).filter(Boolean);
    s.profile = {birthday:d.birthday, school:d.school.trim(), lives:d.lives.trim(), from:d.from.trim(), enrolled:d.enrolled, source:d.source, parentPhone:d.parentPhone.trim(), emergency:d.emergency.trim(), needs:d.needs.trim()};
    save(); toast("Profile saved for "+s.name.split(" ")[0]); render(); }
  if(kind==="billing"){ if(!can("editBilling")) return; const s = stu(f.dataset.id);
    Object.assign(s.pkg, {price:Math.max(0,Number(d.price)||0), paid:Math.max(0,Number(d.paid)||0), due:d.due||"", expires:d.expires||""}); save();
    const b = billing(s); toast(b.owed ? `Saved · ${money(b.owed)} balance for ${s.parent.split(" ")[0]}` : "Saved · paid in full"); render(); }
  if(kind==="assign"){ S.assignments.push({id:uid("as"),student:d.student,course:d.course,title:d.title.trim(),due:d.due,instructions:d.instructions.trim(),status:"assigned"});
    const s = stu(d.student); if(!s.courses.includes(d.course)) s.courses.push(d.course); save(); toast("Assignment sent to "+s.name.split(" ")[0]); render(); }
  if(kind==="devdata"){ if(ME?.role!=="developer") return; const key = f.dataset.key; let v;
    try { v = JSON.parse(d.json); } catch(err) { toast("Not saved: invalid JSON · "+err.message.slice(0,80)); return; }
    const want = Array.isArray(S[key]) ? "list" : "object", got = Array.isArray(v) ? "list" : v && typeof v==="object" ? "object" : "other";
    if(S[key]!=null && want!==got){ toast(`Not saved: ${key} must be a ${want==="list"?"list [ … ]":"object { … }"}`); return; }
    if(key==="students" && v.some(s => !s || !s.id || !s.name || !s.pkg || !Array.isArray(s.courses) || !Array.isArray(s.done))){ toast("Not saved: every student needs id, name, pkg, courses and done"); return; }
    S[key] = v; logDev(`Edited ${(DATA_KEYS.find(x=>x[0]===key)||[key,key])[1]}`); save();
    const w = healthChecks().filter(i=>i[0]==="warn").length; toast(w ? `Saved · ${w} health warning${w>1?"s":""} to review` : "Saved · all health checks pass"); render(); }
  if(kind==="renew"){ if(ME?.role!=="parent") return; confirmRenewal(currentStudent(), f.dataset.pkg); render(); window.scrollTo(0,0); }
  if(kind==="avail"){ if(!canAvail()) return;
    const allDay = !!d.allday, start = allDay ? "00:00" : d.start, end = allDay ? "24:00" : d.end;
    if(end <= start){ toast("End time must be after the start time"); return; }
    const weeks = Number(d.repeat)||0, base = parse(d.date); let added = 0, skipped = 0, clash = 0;
    for(let w=0; w<=Math.max(0,weeks-1); w++){
      const dt = new Date(base); dt.setDate(dt.getDate()+7*w); const ds = iso(dt);
      if(availOn(ds).some(x => start < x.end && x.start < end)){ skipped++; continue; }
      const blk = {id:uid("un"), date:ds, start, end, ...(allDay?{allDay:true}:{})};
      S.unavail.push(blk); added++; clash += clashes(blk).length; }
    save(); CAL.day = d.date; CAL.ym = d.date.slice(0,7);
    toast(added ? `Unavailable time added${added>1?` for ${added} weeks`:""}${skipped?` · ${skipped} skipped (already blocked)`:""}${clash?` · heads up: ${clash} session${clash>1?"s are":" is"} already booked then`:""}` : "Not added: that time is already blocked");
    render(); }
  if(kind==="hours"){ HP = {status:d.status, student:d.student, from:d.from<=d.to?d.from:d.to, to:d.from<=d.to?d.to:d.from}; render(); }
  if(kind==="session"){ S.sessions.push({id:uid("ss"),student:d.student,date:d.date,time:d.time,subject:d.subject.trim(),service:d.service,mode:d.mode}); save(); toast("Session scheduled"); render(); }
});
window.addEventListener("hashchange", () => { if(route().name!=="quiz") lastQuiz=null; if(route().name!=="packages") RENEW=null; render(); window.scrollTo(0,0); });
render();
