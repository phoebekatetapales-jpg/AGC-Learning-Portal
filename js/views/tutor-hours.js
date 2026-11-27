/* =====================================================================
   AGC Learning Portal — Tutor hours & payments view.
   Scripts share one global scope and load in the order listed in index.html.
   ===================================================================== */
/* ---------- views: tutor hours & payments ---------- */
const RATE = 43; // tutor hourly rate per 60-minute session
const money2 = n => "$" + Number(n).toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2});
const mdy = s => s.slice(5,7)+"/"+s.slice(8,10)+"/"+s.slice(0,4);
const plusHour = t => { const [h,m] = t.split(":").map(Number); return pad((h+1)%24)+":"+pad(m); };
const monthStart = () => today().slice(0,8)+"01";
const monthEnd = () => { const d = new Date(); return iso(new Date(d.getFullYear(), d.getMonth()+1, 0)); };
let HP = {status:"all", student:"all", from:monthStart(), to:monthEnd()};
function ensurePay(){
  if(S.pay) return S.pay;
  const paidIds = S.notes.filter(n => daysUntil(n.date) <= -7).map(n => n.id);
  const other = [{id:"oh1",date:dayOffset(-8),title:"Curriculum planning: Algebra I unit",hours:1.5,wage:20,paid:true}];
  const comp = [{id:"oc1",date:dayOffset(-10),desc:"Travel reimbursement: in-home sessions",amount:25,paid:true}];
  const amt = paidIds.length*RATE + other.reduce((a,o)=>a+o.hours*o.wage,0) + comp.reduce((a,c)=>a+c.amount,0);
  S.pay = {paid:Object.fromEntries(paidIds.map(id=>[id,true])), other, comp,
    payments: amt ? [{id:"py1",date:dayOffset(-6),desc:`${paidIds.length} sessions, other hours & reimbursement`,method:"Direct deposit",amount:amt}] : []};
  save(); return S.pay;
}
function hoursRows(){
  const P = ensurePay(), inRange = d => d >= HP.from && d <= HP.to;
  const done = S.notes.map(n => ({id:n.id,student:n.student,date:n.date,time:n.time||"",title:n.focus,status:"Attended"}));
  const sched = S.sessions.filter(x => x.date >= today()).map(x => ({id:x.id,student:x.student,date:x.date,time:x.time,title:x.subject,status:"Scheduled"}));
  return [...done, ...sched]
    .filter(r => inRange(r.date) && (HP.status==="all" || r.status===HP.status) && (HP.student==="all" || r.student===HP.student))
    .map(r => ({...r, name:stu(r.student)?.name||"Student", hours:1, earn:RATE, paid:!!P.paid[r.id]}))
    .sort((a,b) => (a.date+a.time).localeCompare(b.date+b.time));
}
const hpTable = (cols, rows, foot="") => `<div class="table-wrap"><table class="tbl"><thead><tr>${cols.map(c=>`<th scope="col"${c[1]?' class="num"':""}>${c[0]}</th>`).join("")}</tr></thead>
  <tbody>${rows.length ? rows.join("") : `<tr><td colspan="${cols.length}" class="hp-none">No results found for selected period and status.</td></tr>`}</tbody>${rows.length?foot:""}</table></div>`;
V.hours = () => {
  const P = ensurePay(), rows = hoursRows(), inRange = d => d >= HP.from && d <= HP.to;
  const other = P.other.filter(o => inRange(o.date)), comp = P.comp.filter(c => inRange(c.date)), pays = P.payments.filter(p => inRange(p.date));
  const hrs = rows.reduce((a,r)=>a+r.hours,0), earn = rows.reduce((a,r)=>a+r.earn,0);
  const earned = rows.filter(r=>r.status==="Attended").reduce((a,r)=>a+r.earn,0) + other.reduce((a,o)=>a+o.hours*o.wage,0) + comp.reduce((a,c)=>a+c.amount,0);
  const unpaid = rows.filter(r=>r.status==="Attended"&&!r.paid).reduce((a,r)=>a+r.earn,0) + other.filter(o=>!o.paid).reduce((a,o)=>a+o.hours*o.wage,0) + comp.filter(c=>!c.paid).reduce((a,c)=>a+c.amount,0);
  const yn = b => b ? `<span class="tag ok">Yes</span>` : `<span class="tag">No</span>`;
  return `<div class="head"><h1>${esc(S.tutor.split(" ").reverse().join(", "))} · Hours &amp; payments</h1><p>Your sessions, other hours, compensation and payments for the selected period. Every session is 60 minutes at ${money2(RATE)}/hour.</p></div>
  <div class="card hp-filters">
    <form data-form="hours">
      <div class="field"><label for="hst">Status</label><select id="hst" name="status">${[["all","All statuses"],["Attended","Attended"],["Scheduled","Scheduled"]].map(([v,l])=>`<option value="${v}" ${HP.status===v?"selected":""}>${l}</option>`).join("")}</select></div>
      <div class="field"><label for="hsu">Student</label><select id="hsu" name="student"><option value="all">All students</option>${S.students.map(s=>`<option value="${s.id}" ${HP.student===s.id?"selected":""}>${esc(s.name)}</option>`).join("")}</select></div>
      <div class="field"><label for="hfr">From</label><input type="date" id="hfr" name="from" required value="${HP.from}"></div>
      <div class="field"><label for="hto">To</label><input type="date" id="hto" name="to" required value="${HP.to}"></div>
      <button class="btn btn-primary">Go</button>
    </form>
    <div class="hp-dl"><button class="btn btn-ghost btn-sm" data-act="csv" data-kind="sessions">↓ Session hours</button><button class="btn btn-ghost btn-sm" data-act="csv" data-kind="payments">↓ Payments</button></div>
  </div>
  <div class="grid g3" style="margin-bottom:24px">
    <div class="card hero-card"><div class="label">Earned this period</div><div class="big">${money2(earned)}</div><div class="small muted">Attended sessions, other hours &amp; compensation</div></div>
    <div class="card"><div class="label">Paid to you</div><div class="big">${money2(pays.reduce((a,p)=>a+p.amount,0))}</div><div class="small muted">${pays.length} payment${pays.length===1?"":"s"} in this period</div></div>
    <div class="card"><div class="label">Awaiting payment</div><div class="big">${money2(unpaid)}</div><div class="small muted">Attended work not yet paid</div></div>
  </div>
  <section class="card hp-sec"><h2>Session hours</h2>
    ${hpTable([["Date"],["Student &amp; title"],["Status"],["Hours",1],["Earnings",1],["Paid"],...(ME.role==="tutor"?[]:[["Actions"]])],
      rows.map(r=>`<tr><td>${mdy(r.date)}${r.time?`<div class="small muted">${fmtTime(r.time)} – ${fmtTime(plusHour(r.time))}</div>`:""}</td>
        <td><b style="font-family:var(--display);font-weight:600">${esc(r.name)}</b><div class="small muted">${esc(r.title)}</div></td>
        <td><span class="tag ${r.status==="Attended"?"ok":"gold"}">${r.status}</span></td>
        <td class="num">${r.hours.toFixed(1)}</td><td class="num">${money2(r.earn)}</td><td>${yn(r.paid)}</td>
        ${ME.role==="tutor"?"":`<td><a class="linkish small" href="#/student/${r.student}">View student</a></td>`}</tr>`),
      `<tfoot><tr><td></td><td></td><td>Totals</td><td class="num">${hrs.toFixed(1)}</td><td class="num">${money2(earn)}</td><td></td>${ME.role==="tutor"?"":"<td></td>"}</tr></tfoot>`)}
  </section>
  <section class="card hp-sec"><h2>Other hours</h2>
    ${hpTable([["Date"],["Title"],["Hours",1],["Wage",1],["Paid"]], other.map(o=>`<tr><td>${mdy(o.date)}</td><td>${esc(o.title)}</td><td class="num">${o.hours.toFixed(1)}</td><td class="num">${money2(o.wage)}/hr</td><td>${yn(o.paid)}</td></tr>`))}
  </section>
  <section class="card hp-sec"><h2>Other compensation</h2>
    ${hpTable([["Date"],["Description"],["Amount",1],["Paid"]], comp.map(c=>`<tr><td>${mdy(c.date)}</td><td>${esc(c.desc)}</td><td class="num">${money2(c.amount)}</td><td>${yn(c.paid)}</td></tr>`))}
  </section>
  <section class="card hp-sec"><h2>Payments</h2>
    ${hpTable([["Date"],["Description"],["Method"],["Amount",1]], pays.map(p=>`<tr><td>${mdy(p.date)}</td><td>${esc(p.desc)}</td><td>${esc(p.method)}</td><td class="num">${money2(p.amount)}</td></tr>`))}
  </section>`;
};
function downloadCsv(kind){
  const q = v => `"${String(v).replace(/"/g,'""')}"`;
  const P = ensurePay(), inRange = d => d >= HP.from && d <= HP.to;
  const lines = kind==="sessions"
    ? [["Date","Time","Student","Title","Status","Hours","Earnings","Paid"], ...hoursRows().map(r=>[mdy(r.date), r.time?fmtTime(r.time)+" - "+fmtTime(plusHour(r.time)):"", r.name, r.title, r.status, r.hours.toFixed(1), r.earn.toFixed(2), r.paid?"Yes":"No"])]
    : [["Date","Description","Method","Amount"], ...P.payments.filter(p=>inRange(p.date)).map(p=>[mdy(p.date), p.desc, p.method, p.amount.toFixed(2)])];
  const blob = new Blob([lines.map(l=>l.map(q).join(",")).join("\r\n")], {type:"text/csv"});
  const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
  a.download = `${kind==="sessions"?"session-hours":"payments"}_${HP.from}_to_${HP.to}.csv`; a.click(); setTimeout(()=>URL.revokeObjectURL(a.href), 1000);
}
