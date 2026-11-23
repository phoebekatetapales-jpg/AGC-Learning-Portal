/* =====================================================================
   AGC Learning Portal — Developer views and error log.
   Scripts share one global scope and load in the order listed in index.html.
   ===================================================================== */
/* ---------- views: developer ---------- */
const DEV = "Developer", ERR_KEY = "agc-lms-errors";
const DATA_KEYS = [["students","Students & packages"],["sessions","Scheduled sessions"],["notes","Session notes"],["assignments","Assignments"],["results","Assessment results"],["pay","Tutor hours & payments"],["unavail","Tutor unavailability"],["renewals","Package renewals"],["adminPerms","Admin permissions"],["accessLog","Admin access history"],["devLog","Developer log"],["courses","Courses & lessons"],["quizzes","Assessments"]];
function getErrors(){ try { return JSON.parse(localStorage.getItem(ERR_KEY)) || []; } catch(e) { return []; } }
function logError(msg, where){ try { const l = getErrors(); l.push({at:new Date().toISOString(), msg:String(msg).slice(0,300), where:where||location.hash||"#/"}); localStorage.setItem(ERR_KEY, JSON.stringify(l.slice(-50))); } catch(e){} }
window.addEventListener("error", e => logError(e.message, location.hash));
function logDev(text){ (S.devLog ||= []).push({date:today(), text}); }
const countOf = v => Array.isArray(v) ? v.length : v && typeof v==="object" ? Object.keys(v).length : v==null ? 0 : 1;
const kb = n => (n/1024).toFixed(1)+" KB";
function healthChecks(){
  const out = [], ids = new Set(S.students.map(s=>s.id));
  [["notes","session notes"],["assignments","assignments"],["results","assessment results"],["sessions","scheduled sessions"]].forEach(([k,n]) => {
    const c = (S[k]||[]).filter(x => !ids.has(x.student)).length;
    if(c) out.push(["warn",`${c} ${n} belong to a student that no longer exists. Pages that list them may break.`,k]); });
  const bc = S.assignments.filter(a => !S.courses[a.course]).length; if(bc) out.push(["warn",`${bc} assignment${bc>1?"s use":" uses"} a course that doesn't exist`,"assignments"]);
  const bq = S.results.filter(r => !S.quizzes[r.quiz]).length; if(bq) out.push(["warn",`${bq} assessment result${bq>1?"s point":" points"} to an assessment that doesn't exist`,"results"]);
  S.students.forEach(s => {
    (s.courses||[]).filter(c => !S.courses[c]).forEach(c => out.push(["warn",`${s.name} is enrolled in a course that doesn't exist (${c})`,"students"]));
    if(!s.pkg) { out.push(["warn",`${s.name} has no package`,"students"]); return; }
    if(s.pkg.used > s.pkg.total) out.push(["warn",`${s.name} has used more sessions than the package includes (${s.pkg.used} of ${s.pkg.total})`,"students"]);
    if((s.pkg.paid||0) > (s.pkg.price||0)) out.push(["info",`${s.name}'s family has paid more than the package price`,"students"]);
    if(!s.parentEmail) out.push(["info",`${s.name} has no parent email, so session notes can't be emailed`,"students"]); });
  const past = S.sessions.filter(x => x.date < today()).length;
  if(past) out.push(["info",`${past} scheduled session${past>1?"s are":" is"} in the past and no longer show${past>1?"":"s"} on any schedule`,"sessions"]);
  const errs = getErrors().length; if(errs) out.push(["warn",`${errs} page error${errs>1?"s":""} recorded in this browser (see Error log below)`,null]);
  return out;
}
V.dev = () => {
  const issues = healthChecks(), warns = issues.filter(i=>i[0]==="warn").length;
  const used = JSON.stringify(S).length + JSON.stringify(ME).length + JSON.stringify(getErrors()).length;
  const errs = getErrors().slice().reverse(), log = (S.devLog||[]).slice().reverse();
  const records = DATA_KEYS.reduce((a,[k])=>a+countOf(S[k]),0);
  const line = (k,v) => `<div class="row"><span class="small muted">${k}</span><span class="small" style="font-family:var(--display);font-weight:500;text-align:right">${v}</span></div>`;
  return `<div class="head"><h1>System</h1><p>Health, data and maintenance tools for the AGC Learning Portal. Portal data lives in this browser's storage, so these tools act on this browser only.</p></div>
  <div class="grid g4">
    ${kpi("System health", warns?warns+" warning"+(warns>1?"s":""):"Healthy", issues.length?`${issues.length} item${issues.length>1?"s":""} to review`:"No problems found", true)}
    ${kpi("Storage used", kb(used), "of about 5 MB browser limit")}
    ${kpi("Records", records, `${DATA_KEYS.length} data collections`)}
    ${kpi("Page errors", errs.length, errs.length?"Last: "+new Date(errs[0].at).toLocaleString("en-US",{month:"short",day:"numeric",hour:"numeric",minute:"2-digit"}):"None recorded")}
  </div>
  <h2 class="section-title">Health checks</h2>
  <div class="card">${issues.length?`<div class="list">${issues.map(([lvl,t,k])=>`<div class="row"><div><h4>${esc(t)}</h4>${k?`<a class="linkish small" href="#/devdata/${k}">Open in data editor</a>`:""}</div><span class="tag ${lvl==="warn"?"warn":""}">${lvl==="warn"?"Warning":"Info"}</span></div>`).join("")}</div>`:`<p class="muted" style="margin:0">Everything checks out: every record points to a real student, course and assessment.</p>`}</div>
  <div class="grid g2" style="margin-top:16px">
    <div class="card"><h2>Data collections</h2><div class="list">${DATA_KEYS.map(([k,l])=>line(`<a class="linkish" style="color:inherit" href="#/devdata/${k}">${l}</a>`, countOf(S[k])+" · "+kb(JSON.stringify(S[k]??null).length))).join("")}</div></div>
    <div class="card"><h2>Maintenance</h2><p class="small muted">Download a backup before making big changes. Importing or resetting replaces all portal data in this browser.</p>
      <div style="display:flex;flex-direction:column;gap:10px">
        <button class="btn btn-primary" data-act="devexport">Download backup (.json)</button>
        <label class="btn btn-ghost" for="devimp" style="cursor:pointer">Import backup…</label><input type="file" id="devimp" accept=".json,application/json" hidden>
        <button class="btn btn-ghost" data-act="devclearerr">Clear error log</button>
        <button class="btn btn-ghost" data-act="devreset" style="border-color:var(--warn)">Reset to demo data</button>
      </div>
      <div class="list" style="margin-top:16px">${line("Data storage key", KEY)}${line("Signed-in account key", ME_KEY)}${line("Roles", Object.keys(NAV).length)}${line("Tutor pay rate", money2(RATE)+"/hour")}</div></div>
  </div>
  <div class="grid g2" style="margin-top:16px">
    <div class="card"><h2>Developer log</h2>${log.length?`<div class="list">${log.slice(0,12).map(l=>`<div class="row"><h4 style="font-weight:500">${esc(l.text)}</h4><span class="small muted" style="white-space:nowrap">${fmt(l.date)}</span></div>`).join("")}</div>`:`<p class="muted" style="margin:0">No developer changes yet.</p>`}</div>
    <div class="card"><h2>Error log</h2>${errs.length?`<div class="list">${errs.slice(0,12).map(e=>`<div class="row"><div><h4 style="font-weight:500">${esc(e.msg)}</h4><div class="meta">Page ${esc(e.where)}</div></div><span class="small muted" style="white-space:nowrap">${new Date(e.at).toLocaleString("en-US",{month:"short",day:"numeric",hour:"numeric",minute:"2-digit"})}</span></div>`).join("")}</div>`:`<p class="muted" style="margin:0">No errors recorded in this browser.</p>`}</div>
  </div>`;
};
V.devdata = (key) => {
  if(!DATA_KEYS.some(d=>d[0]===key)) key = "students";
  if(key==="pay") ensurePay();
  const v = S[key] ?? [];
  return `<div class="head"><h1>Data editor</h1><p>View and fix the raw data behind the portal. Saving replaces the whole collection, so download a backup from System first if you're unsure.</p></div>
  <form class="card" data-form="devdata" data-key="${key}">
    <div class="form-row"><div class="field"><label for="dk">Collection</label><select id="dk">${DATA_KEYS.map(([k,l])=>`<option value="${k}" ${k===key?"selected":""}>${l} (${countOf(S[k])})</option>`).join("")}</select></div>
      <div class="field"><label>Size</label><div class="small muted" style="padding:10px 0">${countOf(v)} records · ${kb(JSON.stringify(v).length)}</div></div></div>
    <div class="field"><label for="dj">JSON</label><textarea id="dj" name="json" spellcheck="false" class="code" rows="22">${esc(JSON.stringify(v,null,2))}</textarea></div>
    <div style="display:flex;gap:10px;flex-wrap:wrap"><button class="btn btn-primary">Save changes</button><button type="button" class="btn btn-ghost" data-act="devrevert">Discard edits</button></div>
  </form>`;
};
// Sidebar "View as" dropdown for the Developer (also shown while previewing another account)
function viewAsSelect(){
  if(ME.role!=="developer" && !ME.dev) return "";
  const cur = ME.role==="developer" ? "developer" : ME.role+(ME.student?":"+ME.student:"");
  const opt = (v,l) => `<option value="${v}" ${v===cur?"selected":""}>${esc(l)}</option>`;
  return `<div class="viewas"><label for="vas">View as</label><select id="vas">
    ${opt("developer","Developer (me)")}
    <optgroup label="Students">${S.students.map(s=>opt("student:"+s.id,s.name)).join("")}</optgroup>
    <optgroup label="Parents">${S.students.map(s=>opt("parent:"+s.id,s.parent+" (parent of "+s.name.split(" ")[0]+")")).join("")}</optgroup>
    <optgroup label="Staff">${opt("tutor","Tutor · "+S.tutor)}${opt("admin","Admin · "+ADMIN)}${opt("superadmin","Super Admin · "+SUPER)}</optgroup>
  </select></div>`;
}
function switchView(v){
  if(v==="developer"){ ME = {role:"developer"}; saveMe(); location.hash = "#/dev"; render(); return; }
  const [role, student] = v.split(":");
  ME = {role, student:student||null, dev:true}; saveMe(); location.hash = "#/"+NAV[role][0][0]; render();
}
