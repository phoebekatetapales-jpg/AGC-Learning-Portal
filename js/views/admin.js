/* =====================================================================
   AGC Learning Portal — Admin & Super Admin views.
   Scripts share one global scope and load in the order listed in index.html.
   ===================================================================== */
/* ---------- views: admin & super admin ---------- */
const pct = (a,b) => b ? Math.round(a/b*100) : 0;
const avgScore = rs => rs.length ? Math.round(rs.reduce((a,r)=>a+r.score/r.total,0)/rs.length*100) : null;
const miniBar = p => `<div class="bar" aria-hidden="true"><i style="width:${p}%"></i></div>`;
const kpi = (label, value, sub, hero) => `<div class="card${hero?" hero-card":""}"><div class="label">${label}</div><div class="big">${value}</div>${sub?`<div class="small muted">${sub}</div>`:""}</div>`;
const isOverdue = s => { const b = billing(s); return b.owed>0 && b.d!==null && b.d<0; };
V.restricted = () => `<div class="head"><h1>Access limited</h1><p>The Super Admin has not given the Admin access to this area.</p></div>
  <div class="card locked"><p style="margin:0">Ask ${esc(SUPER)} (Super Admin) to turn this on under <b>Admin access</b>.</p></div>`;
V.adash = () => {
  if(!can("viewStudents")) return V.restricted();
  const ss = S.students, all = ss.map(s=>overall(s));
  const done = all.reduce((a,o)=>a+o.done,0), total = all.reduce((a,o)=>a+o.total,0);
  const low = ss.filter(s=>remaining(s)<=2).length;
  const owed = ss.reduce((a,s)=>a+billing(s).owed,0), overdue = ss.filter(isOverdue).length;
  const avg = avgScore(S.results);
  const cols = ["Student","Tutor","Progress","Lessons"].concat(can("viewResults")?["Avg. score"]:[],["Sessions left"],can("viewBilling")?["Balance"]:[],can("viewNotes")?["Last session"]:[]);
  return `<div class="head"><h1>${ME.role==="admin"?greeting()+", "+esc(ADMIN.split(" ")[0]):"Students &amp; progress"}</h1><p>Details and progress for every student at AGC Tutorials.</p></div>
  <div class="grid g4">
    ${kpi("Active students", ss.length, `${ss.reduce((a,s)=>a+s.courses.length,0)} course enrollments`, true)}
    ${kpi("Average progress", pct(done,total)+"%", `${done} of ${total} lessons completed`)}
    ${can("viewResults")?kpi("Average assessment score", avg===null?"—":avg+"%", `${S.results.length} assessments taken`):kpi("Low session balance", low, "2 or fewer sessions left")}
    ${can("viewBilling")?kpi("Outstanding balances", money(owed), overdue?`${overdue} overdue`:"Nothing overdue"):kpi("Session notes", S.notes.length, "logged so far")}
  </div>
  <h2 class="section-title">All students</h2>
  <div class="card table-wrap"><table class="tbl"><thead><tr>${cols.map(c=>`<th scope="col">${c}</th>`).join("")}</tr></thead><tbody>
  ${ss.map(s=>{ const o=overall(s), p=pct(o.done,o.total), r=remaining(s), b=billing(s), last=notesFor(s.id)[0], sc=avgScore(S.results.filter(x=>x.student===s.id));
    return `<tr><td><a class="linkish" style="color:inherit;font-weight:600" href="#/student/${s.id}">${esc(s.name)}</a><div class="small muted">${esc(s.grade)} · ${esc(s.parent)}</div></td>
      <td>${s.tutors?.length?esc(tutorsOf(s)):`<span class="muted">—</span>`}</td>
      <td>${p}%${miniBar(p)}</td><td>${o.done}/${o.total}</td>
      ${can("viewResults")?`<td>${sc===null?`<span class="muted">—</span>`:sc+"%"}</td>`:""}
      <td><span class="tag ${r<=2?"warn":""}">${r} of ${s.pkg.total}</span></td>
      ${can("viewBilling")?`<td>${b.owed?`<span class="tag ${b.urgent?"warn":"gold"}">${money(b.owed)} · ${b.status}</span>`:`<span class="tag ok">Paid</span>`}</td>`:""}
      ${can("viewNotes")?`<td>${last?`${fmt(last.date)}<div class="small muted">${esc(last.focus)}</div>`:`<span class="muted">—</span>`}</td>`:""}</tr>`; }).join("")}
  </tbody></table></div>
  <h2 class="section-title">Progress by course</h2>
  <div class="grid g3">${Object.values(S.courses).map(c=>{ const en=ss.filter(s=>s.courses.includes(c.id)); const t=en.reduce((a,s)=>{const q=courseProgress(s,c.id);a.d+=q.done;a.t+=q.total;return a},{d:0,t:0}); const p=pct(t.d,t.t);
    return `<div class="card"><span class="svc">${esc(c.service)}</span><h3 style="margin-top:4px">${esc(c.title)}</h3>${miniBar(p)}<div class="small muted">${en.length} enrolled · ${p}% complete</div></div>`; }).join("")}</div>`;
};
V.portal = () => {
  const ss = S.students, all = ss.map(s=>overall(s));
  const done = all.reduce((a,o)=>a+o.done,0), total = all.reduce((a,o)=>a+o.total,0);
  const bought = ss.reduce((a,s)=>a+s.pkg.total,0), used = ss.reduce((a,s)=>a+s.pkg.used,0);
  const value = ss.reduce((a,s)=>a+(s.pkg.price||0),0), paid = ss.reduce((a,s)=>a+Math.min(s.pkg.paid||0,s.pkg.price||0),0);
  const overdue = ss.filter(isOverdue);
  const A = S.assignments, sub = A.filter(a=>a.status!=="assigned").length, graded = A.filter(a=>a.status==="graded").length;
  const avg = avgScore(S.results), granted = PERMS.filter(p=>S.adminPerms[p[0]]);
  const acts = [...S.notes.map(n=>({d:n.date,t:`Session logged for ${stu(n.student)?.name||"a student"}`,m:n.focus})),
    ...S.results.map(r=>({d:r.date,t:`${stu(r.student)?.name||"A student"} took ${S.quizzes[r.quiz]?.title||"an assessment"}`,m:`Scored ${r.score}/${r.total}`})),
    ...S.accessLog.map(l=>({d:l.date,t:l.text,m:"Admin access"})),
    ...(S.renewals||[]).map(r=>({d:r.date,t:`${r.by} renewed ${stu(r.student)?.name||"a student"}'s package`,m:`${r.from} → ${r.to} · ${r.sessions} sessions${r.carried?` + ${r.carried} carried over`:""} · ${money(r.amount)} invoiced`}))].sort((a,b)=>b.d.localeCompare(a.d)).slice(0,8);
  const line = (k,v) => `<div class="row"><span class="small muted">${k}</span><span class="small" style="font-family:var(--display);font-weight:500;text-align:right">${v}</span></div>`;
  return `<div class="head"><h1>${greeting()}, ${esc(SUPER.split(" ")[0])}</h1><p>How the whole AGC Learning Portal is doing: learning, sessions, payments and admin access.</p></div>
  <div class="grid g4">
    ${kpi("Lessons completed", pct(done,total)+"%", `${done} of ${total} across ${ss.length} students`, true)}
    ${kpi("Sessions delivered", used, `of ${bought} purchased · ${pct(used,bought)}%`)}
    ${kpi("Revenue collected", money(paid), `of ${money(value)} in packages`)}
    ${kpi("Average assessment", avg===null?"—":avg+"%", `${S.results.length} taken`)}
  </div>
  <div class="grid g3" style="margin-top:16px">
    <div class="card"><h2>Learning activity</h2><div class="list">
      ${line("Assignments set", A.length)}${line("Submitted", `${sub} · ${pct(sub,A.length)}%`)}${line("Graded", `${graded} · ${pct(graded,A.length)}%`)}${line("Session notes written", S.notes.length)}${line("Upcoming sessions", upcoming().length)}</div></div>
    <div class="card"><h2>Payments</h2>${miniBar(pct(paid,value))}<div class="small muted" style="margin-bottom:12px">${pct(paid,value)}% of package value collected</div><div class="list">
      ${line("Outstanding", money(value-paid))}${line("Overdue accounts", overdue.length?overdue.map(s=>esc(s.parent)).join(", "):"None")}${line("Low session balance", ss.filter(s=>remaining(s)<=2).length+" students")}</div></div>
    <div class="card"><h2>Admin access</h2><div class="big">${granted.length} <small>of ${PERMS.length} areas</small></div>${miniBar(pct(granted.length,PERMS.length))}
      <p class="small muted">${esc(ADMIN)} can see: ${granted.map(p=>p[1]).join(", ")||"nothing yet"}.</p><a class="btn btn-ghost btn-sm" href="#/access">Manage access</a></div>
  </div>
  <h2 class="section-title">Recent activity</h2>
  <div class="card">${acts.length?`<div class="list">${acts.map(x=>`<div class="row"><div><h4>${esc(x.t)}</h4><div class="meta">${esc(x.m)}</div></div><span class="small muted" style="white-space:nowrap">${fmt(x.d)}</span></div>`).join("")}</div>`:`<p class="muted" style="margin:0">No activity yet.</p>`}</div>`;
};
V.access = () => `<div class="head"><h1>Admin access</h1><p>Choose what ${esc(ADMIN)} (Admin) can see and do. Changes apply the next time the Admin opens a page.</p></div>
  <div class="grid g2">
  <form class="card" data-form="perms"><h2>Permissions</h2><div>
    ${PERMS.map(p=>`<label class="perm"><span><b>${p[1]}</b><span class="small muted">${p[2]}</span></span><input type="checkbox" name="${p[0]}" ${S.adminPerms[p[0]]?"checked":""}></label>`).join("")}
  </div><div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:18px"><button class="btn btn-primary">Save access</button><button type="button" class="btn btn-ghost" data-act="permdefaults">Restore defaults</button></div></form>
  <div class="card"><h2>Access history</h2>${S.accessLog.length?`<div class="list">${[...S.accessLog].reverse().slice(0,12).map(l=>`<div class="row"><div><h4>${esc(l.text)}</h4><div class="meta">by ${esc(SUPER)}</div></div><span class="small muted" style="white-space:nowrap">${fmt(l.date)}</span></div>`).join("")}</div>`:`<p class="muted" style="margin:0">No changes yet. The Admin has the default access.</p>`}</div>
  </div>`;
