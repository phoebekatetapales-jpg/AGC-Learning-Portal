/* =====================================================================
   AGC Learning Portal — Shared UI pieces used by several views.
   Scripts share one global scope and load in the order listed in index.html.
   ===================================================================== */
/* ---------- components ---------- */
function stairs(done,total,lg){
  const n = Math.max(1, Math.min(total, 12)); const filled = total ? Math.round(done/total*n) : 0;
  let h=""; for(let i=0;i<n;i++){ const ht = 28 + (72*(i+1)/n); h += `<i class="${i<filled?"on":""}" style="height:${ht}%"></i>`; }
  return `<div class="stairs${lg?" lg":""}" role="img" aria-label="${done} of ${total} lessons complete">${h}</div>`;
}
function balanceCard(s, hero){
  const r = remaining(s), pct = s.pkg.total ? s.pkg.used/s.pkg.total*100 : 0;
  return `<div class="card ${hero?"hero-card":""}">
    <div class="label">Session balance</div>
    <div class="big">${r} <small>of ${s.pkg.total} sessions left</small></div>
    <div class="bar" aria-hidden="true"><i style="width:${pct}%"></i></div>
    <div class="small muted">${esc(s.pkg.name)} · ${s.pkg.used} used</div>
    ${r<=2?`<p class="small" style="margin:10px 0 0;color:${hero?"#E6C27E":"var(--warn)"}">${r===0?"No sessions left.":"Running low."} ${ME?.role==="parent"?`<a href="#/packages" style="color:inherit;font-weight:600">Renew a package</a>`:"Renew a package"} to keep your schedule.</p>`:""}
  </div>`;
}
const SOURCES = ["Referral from a friend","Google search","Facebook or Instagram","School recommendation","Returning family","Walk-in","Other"];
function ageOf(b){ if(!b) return null; const d = parse(b), n = parse(today()); let a = n.getFullYear()-d.getFullYear(); if(n.getMonth()<d.getMonth() || (n.getMonth()===d.getMonth() && n.getDate()<d.getDate())) a--; return a; }
function daysToBirthday(b){ if(!b) return null; const d = parse(b), n = parse(today()); let x = new Date(n.getFullYear(), d.getMonth(), d.getDate()); if(x < n) x = new Date(n.getFullYear()+1, d.getMonth(), d.getDate()); return Math.round((x-n)/86400000); }
const bdayLabel = b => { const d = daysToBirthday(b); return d===null ? "" : d===0 ? "Birthday today! 🎂" : d===1 ? "Birthday tomorrow" : d<=30 ? `Birthday in ${d} days` : ""; };
const fmtBday = b => parse(b).toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"});
function profileCard(s){
  const p = s.profile||{}, age = ageOf(p.birthday), soon = bdayLabel(p.birthday), dash = `<span class="muted">Not added</span>`;
  const line = (k,v) => `<div class="row"><span class="small muted">${k}</span><span class="small" style="font-family:var(--display);font-weight:500;text-align:right">${v||dash}</span></div>`;
  return `<div class="card"><h2>Student details</h2><div class="list">
    ${line("Birthday", p.birthday ? `${fmtBday(p.birthday)} · ${age} years old${soon?` <span class="tag gold">${soon}</span>`:""}` : "")}
    ${line("Grade", esc(s.grade))}
    ${line("School", esc(p.school||""))}
    ${line("Lives in", esc(p.lives||""))}
    ${line("Originally from", esc(p.from||""))}
    ${line("Joined AGC", p.enrolled ? fmtBday(p.enrolled) : "")}
    ${line("How they found AGC", esc(p.source||""))}
  </div></div>
  <div class="card"><h2>Family &amp; contacts</h2><div class="list">
    ${line("Parent / guardian", esc(s.parent))}
    ${line("Parent email", s.parentEmail ? `<a class="linkish" href="mailto:${esc(s.parentEmail)}">${esc(s.parentEmail)}</a>` : "")}
    ${line("Parent phone", p.parentPhone ? `<a class="linkish" href="tel:${esc(p.parentPhone.replace(/[^0-9+]/g,""))}">${esc(p.parentPhone)}</a>` : "")}
    ${line("Emergency contact", esc(p.emergency||""))}
  </div>
  <h2 style="margin-top:20px">Learning needs &amp; notes</h2><p class="small" style="margin:0">${p.needs?esc(p.needs):dash}</p></div>`;
}
function profileForm(s){
  const p = s.profile||{}, f = (id,label,name,type,val,ph) => `<div class="field"><label for="${id}">${label}</label><input type="${type}" id="${id}" name="${name}" value="${esc(val||"")}" ${ph?`placeholder="${ph}"`:""}></div>`;
  return `<details class="card" style="margin-top:16px"><summary style="cursor:pointer;font-family:var(--display);font-weight:600">Edit profile</summary>
  <form data-form="profile" data-id="${s.id}" style="margin-top:18px"><div class="form-row">
    ${f("pn","Student name","name","text",s.name)}
    ${f("pg","Grade","grade","text",s.grade,"e.g. Grade 8")}
    ${f("pb","Birthday","birthday","date",p.birthday)}
    ${f("psc","School","school","text",p.school,"School name")}
    ${f("pl","Lives in","lives","text",p.lives,"City, state")}
    ${f("pf","Originally from","from","text",p.from,"Hometown or country")}
    ${f("pe","Joined AGC","enrolled","date",p.enrolled)}
    <div class="field"><label for="ps">How they found AGC</label><select id="ps" name="source"><option value="">Choose…</option>${SOURCES.map(o=>`<option ${o===p.source?"selected":""}>${o}</option>`).join("")}</select></div>
    ${f("pp","Parent / guardian","parent","text",s.parent)}
    ${f("pm","Parent email","parentEmail","email",s.parentEmail,"parent@example.com")}
    ${f("pph","Parent phone","parentPhone","text",p.parentPhone)}
    ${f("pem","Emergency contact","emergency","text",p.emergency,"Name (relationship) · phone")}
  </div>
  <div class="field"><label for="pnd">Learning needs &amp; notes</label><textarea id="pnd" name="needs" placeholder="IEP or 504 plan, learning style, allergies, anything tutors should know">${esc(p.needs||"")}</textarea></div>
  <button class="btn btn-primary">Save profile</button></form></details>`;
}
const money = n => "$" + Math.round(n).toLocaleString("en-US");
function billing(s){
  const p = s.pkg, owed = Math.max(0, (p.price||0) - (p.paid||0)), rate = p.total ? (p.price||0)/p.total : 0;
  const d = owed && p.due ? daysUntil(p.due) : null;
  const status = !owed ? "Paid in full" : d===null ? "Balance due" : d<0 ? `Overdue by ${-d} day${d===-1?"":"s"}` : d===0 ? "Due today" : d===1 ? "Due tomorrow" : `Due in ${d} days`;
  return {owed, rate, d, status, urgent: owed>0 && d!==null && d<=3, availed: rate*p.used, left: rate*remaining(s)};
}
function billingCard(s){
  const p = s.pkg, b = billing(s);
  const line = (k,v) => `<div class="row"><span class="small muted">${k}</span><span class="small" style="font-family:var(--display);font-weight:500;text-align:right">${v}</span></div>`;
  return `<div class="card">
    <div class="label">Payment &amp; package</div>
    <div class="big" style="margin-top:4px">${money(b.owed)} <small>${b.owed?"balance due":"owed"}</small></div>
    <span class="tag ${!b.owed?"ok":b.urgent?"warn":"gold"}" style="display:inline-block;margin:8px 0 14px">${b.status}</span>
    <div class="list">
      ${line("Package", esc(p.name))}
      ${line("Package price", money((p.price||0)-(p.prevOwed||0)))}
      ${p.prevOwed?line("Unpaid from previous package", money(p.prevOwed)):""}
      ${line("Paid so far", money(p.paid||0))}
      ${b.owed?line("Payment due date", p.due?fmtLong(p.due):"Not set"):""}
      ${line("Sessions availed", `${p.used} of ${p.total} · ${money(b.availed)}`)}
      ${line("Sessions remaining", `${remaining(s)} · ${money(b.left)} value`)}
      ${line("Package valid until", p.expires?fmtLong(p.expires):"No expiry")}
    </div>
  </div>`;
}
function nextSessionCard(sid){
  const n = upcoming(sid)[0];
  if(!n) return `<div class="card"><div class="label">Next session</div><p class="muted" style="margin:8px 0 0">Nothing scheduled yet.</p></div>`;
  const d = daysUntil(n.date);
  return `<div class="card"><div class="label">Next session</div>
    <div class="big" style="font-size:1.6rem;margin-top:4px">${d===0?"Today":d===1?"Tomorrow":fmt(n.date)} <small>${fmtTime(n.time)}</small></div>
    <p style="margin:8px 0 0">${esc(n.subject)}</p><div class="small muted">${esc(n.service)} · ${esc(n.mode)}</div></div>`;
}
function noteMailto(n, to){
  const s = stu(n.student); const first = s.name.split(" ")[0];
  const body = [`Hi ${s.parent.split(" ")[0]},`,"",`Here are the notes from ${first}'s session on ${fmtLong(n.date)}.`,"",
    `Service: ${n.service} · ${n.mode}`,`Focus: ${n.focus}`,"","What we worked on:",n.summary,
    ...(n.next?["","Next steps:",n.next]:[]),"",`Sessions remaining: ${remaining(s)} of ${s.pkg.total} (${s.pkg.name})`,
    ...(()=>{ const b = billing(s); return b.owed ? [`Balance due: ${money(b.owed)}${s.pkg.due?` · ${b.status.toLowerCase()} (${fmtLong(s.pkg.due)})`:""}`] : ["Package: paid in full"]; })(),
    ...(s.pkg.expires?[`Package valid until: ${fmtLong(s.pkg.expires)}`]:[]),"","Thank you,",S.tutor,"AGC Tutorials"].join("\n");
  return `mailto:${encodeURIComponent(to||s.parentEmail||"").replace(/%40/g,"@")}?subject=${encodeURIComponent(`Session notes: ${s.name} · ${fmtLong(n.date)}`)}&body=${encodeURIComponent(body)}`;
}
function noteCard(n, showStudent){
  const s = stu(n.student);
  return `<article class="card note">
    <div class="top"><div><h3>${esc(n.focus)}</h3><div class="label">${fmtLong(n.date)}${showStudent?" · "+esc(s?.name):""}</div></div>
    <div style="display:flex;gap:6px;flex-wrap:wrap"><span class="tag">${esc(n.service)}</span><span class="tag">${esc(n.mode)}</span></div></div>
    <p>${esc(n.summary)}</p>
    ${n.next?`<div class="next"><b>Next steps:</b> ${esc(n.next)}</div>`:""}
    ${isStaff()&&can("emailParents")?`<div style="margin-top:12px"><a class="btn btn-ghost btn-sm" href="${esc(noteMailto(n))}">Email to ${esc(s.parent.split(" ")[0])}</a></div>`:""}
  </article>`;
}
function sessionRow(x, showStudent){
  const p = parse(x.date);
  return `<div class="row"><div class="srow"><div class="date"><b>${p.getDate()}</b><span>${p.toLocaleDateString("en-US",{month:"short"})}</span></div>
    <div><h4>${esc(x.subject)}${showStudent?" · "+esc(stu(x.student)?.name):""}</h4><div class="meta">${p.toLocaleDateString("en-US",{weekday:"long"})}, ${fmtTime(x.time)} · ${esc(x.service)}</div></div></div>
    <span class="tag ${x.mode==="AGC Anywhere"?"gold":""}">${esc(x.mode)}</span></div>`;
}
function statusTag(a){
  if(a.status==="graded") return `<span class="tag ok">Graded: ${esc(a.grade)}</span>`;
  if(a.status==="submitted") return `<span class="tag">Submitted</span>`;
  const d = dueLabel(a.due); return `<span class="tag ${d.c}">${d.t}</span>`;
}
function courseCard(s, cid, link){
  const c = S.courses[cid], p = courseProgress(s,cid);
  const inner = `<span class="svc">${esc(c.service)}</span><h3>${esc(c.title)}</h3><p class="small muted" style="margin:0">${esc(c.blurb)}</p>
    ${stairs(p.done,p.total)}<div class="foot"><span>${p.done} of ${p.total} lessons</span><span>${p.total?Math.round(p.done/p.total*100):0}%</span></div>`;
  return link ? `<a class="card course" href="#/course/${cid}">${inner}</a>` : `<div class="card course">${inner}</div>`;
}
const empty = m => `<div class="empty">${m}</div>`;
