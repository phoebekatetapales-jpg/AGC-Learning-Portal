/* =====================================================================
   AGC Learning Portal — Parent views.
   Scripts share one global scope and load in the order listed in index.html.
   ===================================================================== */
/* ---------- views: parent ---------- */
V.overview = () => {
  const s = currentStudent(), o = overall(s);
  const graded = assignFor(s.id).filter(a=>a.status==="graded");
  const res = S.results.filter(r=>r.student===s.id).sort((a,b)=>b.date.localeCompare(a.date));
  const note = notesFor(s.id)[0];
  const b = billing(s);
  return `<div class="head"><h1>${esc(s.name)}'s progress</h1><p>${esc(s.grade)} · Your window into every session, lesson and result.</p></div>
  ${b.owed?`<a class="card" href="#/packages" style="display:flex;justify-content:space-between;align-items:center;gap:14px;flex-wrap:wrap;margin-bottom:20px;border-left:4px solid ${b.urgent?"var(--warn)":"var(--gold)"};text-decoration:none;color:inherit">
    <div><div class="label">Payment reminder</div><div style="font-family:var(--display);font-weight:600;font-size:1.1rem;margin-top:2px">${money(b.owed)} balance on ${esc(s.pkg.name)}${s.pkg.due?` · due ${fmtLong(s.pkg.due)}`:""}</div></div>
    <span class="tag ${b.urgent?"warn":"gold"}">${b.status}</span></a>`:""}
  <div class="grid g3">${balanceCard(s,true)}${nextSessionCard(s.id)}
    <div class="card"><div class="label">Lessons completed</div><div class="big">${o.done} <small>of ${o.total}</small></div>${stairs(o.done,o.total)}</div></div>
  <h2 class="section-title">Progress by course</h2>
  <div class="grid g3">${s.courses.map(c=>courseCard(s,c,false)).join("")}</div>
  <div class="grid g2" style="margin-top:36px">
    <div class="card"><h2>Recent results</h2>${graded.length||res.length?`<div class="list">
      ${res.map(r=>`<div class="row"><div><h4>${esc(S.quizzes[r.quiz].title)}</h4><div class="meta">Assessment · ${fmt(r.date)}</div></div><span class="tag gold">${r.score}/${r.total}</span></div>`).join("")}
      ${graded.map(a=>`<div class="row"><div><h4>${esc(a.title)}</h4><div class="meta">Assignment · ${esc(S.courses[a.course].title)}</div></div><span class="tag ok">${esc(a.grade)}</span></div>`).join("")}
    </div>`:`<p class="muted">Results appear here as work is graded.</p>`}</div>
    <div class="card"><h2>Latest session note</h2>${note?`<h3>${esc(note.focus)}</h3><div class="label" style="margin-bottom:8px">${fmtLong(note.date)}</div><p class="small">${esc(note.summary)}</p>${note.next?`<p class="small"><b style="font-family:var(--display)">Next steps:</b> ${esc(note.next)}</p>`:""}<a class="linkish" href="#/notes">Read all notes</a>`:`<p class="muted">Notes appear after each session.</p>`}</div>
  </div>`;
};
// Package renewal: the parent picks a package, reviews it, then confirms
let RENEW = null; // name of the package being reviewed
const RENEW_DUE_DAYS = 7;
const validDays = n => Math.max(30, n*7); // a new package stays valid 1 week per session (min. 30 days)
function renewPlan(s, p){
  const carry = remaining(s), old = billing(s).owed;
  return {name:p[0], sessions:p[2], carry, total:p[2]+carry, price:p[4], old, due:dayOffset(RENEW_DUE_DAYS), expires:dayOffset(validDays(p[2]+carry))};
}
function renewPanel(s){
  const p = PACKAGES.find(x => x[0]===RENEW); if(!p) return "";
  const r = renewPlan(s, p), same = p[0]===s.pkg.name;
  const line = (k,v,strong) => `<div class="row"><span class="small ${strong?"":"muted"}">${k}</span><span class="small" style="font-family:var(--display);font-weight:${strong?700:500};text-align:right">${v}</span></div>`;
  return `<form class="card renew-panel" data-form="renew" data-pkg="${esc(p[0])}" id="renew">
    <div class="label">${same?"Renew your package":"Switch & renew"}</div>
    <h2 style="margin:4px 0 2px">${esc(p[0])}</h2><p class="small muted" style="margin:0 0 12px">${esc(s.name)} · ${p[1]} at $${p[3]}/session</p>
    <div class="list">
      ${line("New sessions", p[2])}
      ${r.carry?line("Unused sessions carried over", "+"+r.carry):""}
      ${line("Total sessions", r.total, true)}
      ${line("Package price", money(r.price))}
      ${r.old?line("Unpaid balance from current package", money(r.old)):""}
      ${line("Amount due", money(r.price + r.old), true)}
      ${line("Payment due by", fmtLong(r.due))}
      ${line("Package valid until", fmtLong(r.expires))}
    </div>
    <label class="renew-ok"><input type="checkbox" name="agree" required> I understand AGC Tutorials will send an invoice for ${money(r.price + r.old)}, due ${fmt(r.due)}.</label>
    <div style="display:flex;gap:10px;flex-wrap:wrap"><button class="btn btn-primary">Confirm renewal</button><button type="button" class="btn btn-ghost" data-act="renewcancel">Cancel</button></div>
  </form>`;
}
V.packages = () => {
  const s = currentStudent();
  const P = PACKAGES, hist = (s.pkgHistory||[]).slice().reverse();
  const canRenew = ME.role==="parent";
  return `<div class="head"><h1>Packages &amp; balance</h1><p>Track sessions used, what you owe and when it's due, and renew or switch packages when it's time.</p></div>
  <div class="grid g2" style="margin-bottom:28px">${balanceCard(s,true)}${billingCard(s)}</div>
  ${canRenew?`<div class="card renew-cta"><div><h2 style="margin:0">Renew ${esc(s.pkg.name)}</h2><p class="small muted" style="margin:4px 0 0">${remaining(s)} unused session${remaining(s)===1?"":"s"} will carry over to the new package.</p></div>
    <button class="btn btn-primary" data-act="renewpick" data-pkg="${esc(s.pkg.name)}">Renew this package</button></div>`:""}
  ${canRenew?renewPanel(s):""}
  <h2 class="section-title">${canRenew?"Compare &amp; switch packages":"Compare packages"}</h2>
  <div class="card table-wrap"><div class="list">${P.map(p=>`<div class="row"><div><h4>${p[0]}${p[0]===s.pkg.name?' <span class="tag gold">Current</span>':""}</h4><div class="meta">${p[1]} · $${p[3]}/session</div></div><div class="pkg-buy"><div style="text-align:right;font-family:var(--display)"><b>$${p[4].toLocaleString()}</b>${p[5]?`<div class="small" style="color:var(--gold-text)">Save $${p[5].toLocaleString()}</div>`:""}</div>${canRenew?`<button class="btn ${p[0]===RENEW?"btn-primary":"btn-ghost"} btn-sm" data-act="renewpick" data-pkg="${esc(p[0])}">${p[0]===s.pkg.name?"Renew":"Choose"}</button>`:""}</div></div>`).join("")}</div></div>
  ${hist.length?`<h2 class="section-title">Past packages</h2><div class="card"><div class="list">${hist.map(h=>`<div class="row"><div><h4>${esc(h.name)}</h4><div class="meta">${h.used} of ${h.total} sessions used · ${money(h.paid||0)} of ${money(h.price||0)} paid${h.carried?` · ${h.carried} carried over`:""}</div></div><span class="small muted" style="white-space:nowrap">Renewed ${fmt(h.renewed)}</span></div>`).join("")}</div></div>`:""}
  <p class="small muted" style="margin-top:14px">Questions about packages? Contact AGC Tutorials${canRenew?"":" or use the cart on our website"}.</p>`;
};
function confirmRenewal(s, name){
  const p = PACKAGES.find(x => x[0]===name); if(!p) return;
  const r = renewPlan(s, p), old = s.pkg;
  (s.pkgHistory ||= []).push({...old, carried:r.carry, renewed:today()});
  s.pkg = {name:p[0], total:r.total, used:0, price:r.price + r.old, paid:0, due:r.due, expires:r.expires, ...(r.old?{prevOwed:r.old}:{})};
  (S.renewals ||= []).push({id:uid("rn"), student:s.id, date:today(), from:old.name, to:p[0], sessions:p[2], carried:r.carry, amount:r.price + r.old, by:s.parent});
  RENEW = null; save();
  toast(`Renewed: ${p[0]} · ${r.total} sessions · ${money(r.price + r.old)} due ${fmt(r.due)}`);
}
