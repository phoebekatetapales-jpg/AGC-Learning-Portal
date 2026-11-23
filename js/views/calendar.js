/* =====================================================================
   AGC Learning Portal — Calendar view (tutor, admin, super admin).
   Scripts share one global scope and load in the order listed in index.html.
   ===================================================================== */
/* ---------- views: calendar (tutor, admin, super admin) ---------- */
let CAL = {ym:today().slice(0,7), day:today()};
function calEvents(){
  const ev = {};
  const add = (d, e) => (ev[d] ||= []).push(e);
  S.sessions.forEach(x => add(x.date, {kind:x.date < today() ? "Past" : "Scheduled", time:x.time||"", student:x.student, title:x.subject, service:x.service, mode:x.mode}));
  S.notes.forEach(n => add(n.date, {kind:"Attended", time:n.time||"", student:n.student, title:n.focus, service:n.service, mode:n.mode}));
  Object.values(ev).forEach(l => l.sort((a,b) => (a.time||"99").localeCompare(b.time||"99")));
  return ev;
}
const calTag = k => k==="Attended" ? "ok" : k==="Scheduled" ? "sched" : "";
// Tutor unavailability: blocked-off times when the tutor can't take sessions
const canAvail = () => ME.role==="tutor" || ME.role==="superadmin";
const availOn = d => (S.unavail ||= []).filter(a => a.date===d).sort((a,b)=>a.start.localeCompare(b.start));
const shortT = t => fmtTime(t).replace(":00","");
const shortRange = (s,e) => { const a = shortT(s), b = shortT(e); return a.slice(-2)===b.slice(-2) ? a.slice(0,-3)+"–"+b : a+"–"+b; };
const TIMES = Array.from({length:33}, (_,i) => pad(6+Math.floor(i/2))+":"+(i%2?"30":"00")); // 6:00 AM – 10:00 PM
const timeOpts = sel => TIMES.map(t=>`<option value="${t}" ${t===sel?"selected":""}>${fmtTime(t)}</option>`).join("");
// Scheduled sessions (60 min) that fall inside a blocked-off time
const clashes = blk => S.sessions.filter(x => x.date===blk.date && x.time && x.time < blk.end && plusHour(x.time) > blk.start);
function availDropdown(){
  if(!canAvail()) return "";
  return `<details class="av-drop"><summary class="btn btn-primary btn-sm">+ Add unavailability</summary>
    <form class="av-panel" data-form="avail">
      <h3>Add unavailability</h3><p class="small muted">Block off times when ${esc(S.tutor.split(" ")[0])} can't take sessions.</p>
      <div class="field"><label for="avd">Date</label><input type="date" id="avd" name="date" required value="${CAL.day}"></div>
      <label class="av-allday"><input type="checkbox" name="allday"> All day</label>
      <div class="form-row" id="avtimes"><div class="field"><label for="avs">From</label><select id="avs" name="start">${timeOpts("15:00")}</select></div>
        <div class="field"><label for="ave">To</label><select id="ave" name="end">${timeOpts("18:00")}</select></div></div>
      <div class="field"><label for="avr">Repeat</label><select id="avr" name="repeat"><option value="0">Does not repeat</option><option value="4">Weekly for 4 weeks</option><option value="8">Weekly for 8 weeks</option><option value="12">Weekly for 12 weeks</option></select></div>
      <button class="btn btn-primary" style="width:100%">Save unavailability</button>
    </form></details>`;
}
V.calendar = () => {
  const [y, m] = CAL.ym.split("-").map(Number);
  const lead = new Date(y, m-1, 1).getDay(), days = new Date(y, m, 0).getDate();
  const ev = calEvents(), first = s => (stu(s)?.name||"Student").split(" ")[0];
  const monthEv = Object.entries(ev).filter(([d]) => d.startsWith(CAL.ym)).flatMap(([,l]) => l);
  const cells = [];
  for(let i=0;i<lead;i++) cells.push(`<div class="cal-cell cal-blank" aria-hidden="true"></div>`);
  for(let d=1; d<=days; d++){
    const ds = `${CAL.ym}-${pad(d)}`, l = ev[ds] || [], av = availOn(ds);
    const chips = [...av.map(a=>`<span class="cal-chip av">${a.allDay?"Unavailable all day":"Off "+shortRange(a.start,a.end)}</span>`), ...l.map(e=>`<span class="cal-chip ${calTag(e.kind)}">${e.time?shortT(e.time)+" ":""}${esc(first(e.student))}</span>`)];
    cells.push(`<button class="cal-cell${ds===today()?" is-today":""}${ds===CAL.day?" is-sel":""}${av.length?" has-av":""}" data-act="calday" data-d="${ds}" aria-label="${fmtLong(ds)}, ${l.length} session${l.length===1?"":"s"}${av.length?", has unavailable time":""}" ${ds===CAL.day?'aria-pressed="true"':""}>
      <span class="cal-num">${d}</span>
      ${chips.slice(0,3).join("")}
      ${chips.length>3?`<span class="cal-more">+${chips.length-3} more</span>`:""}
      <span class="cal-dots">${av.length?`<span class="cal-avdot" title="Unavailable"></span>`:""}${l.length?`<span class="cal-dot${l.some(e=>e.kind==="Scheduled")?" sched":""}">${l.length}</span>`:""}</span></button>`);
  }
  const dayEv = ev[CAL.day] || [], dayAv = availOn(CAL.day);
  const monthAv = (S.unavail||[]).filter(a => a.date.startsWith(CAL.ym)).length;
  const label = new Date(y, m-1, 1).toLocaleDateString("en-US",{month:"long",year:"numeric"});
  return `<div class="head"><h1>Calendar</h1><p>Every tutoring session by month: what's scheduled, what's already been taught, and when ${esc(S.tutor.split(" ")[0])} is unavailable. Select a day to see its details.</p></div>
  <div class="cal-bar card">
    <div class="cal-nav"><button class="btn btn-ghost btn-sm" data-act="calmove" data-n="-1" aria-label="Previous month">‹ Prev</button>
      <h2 class="cal-title">${label}</h2>
      <button class="btn btn-ghost btn-sm" data-act="calmove" data-n="1" aria-label="Next month">Next ›</button>
      <button class="btn btn-ghost btn-sm" data-act="caltoday">Today</button></div>
    <div class="cal-legend small"><span><i class="cal-key sched"></i>Scheduled ${monthEv.filter(e=>e.kind==="Scheduled").length}</span><span><i class="cal-key ok"></i>Attended ${monthEv.filter(e=>e.kind==="Attended").length}</span><span><i class="cal-key av"></i>Unavailable ${monthAv}</span>${ME.role==="tutor"?`<a class="btn btn-ghost btn-sm" href="#/schedule">Schedule a session</a>`:""}${availDropdown()}</div>
  </div>
  <div class="card cal-wrap">
    <div class="cal-grid cal-head">${["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d=>`<div>${d}</div>`).join("")}</div>
    <div class="cal-grid">${cells.join("")}</div>
  </div>
  <h2 class="section-title">${fmtLong(CAL.day)}</h2>
  ${dayAv.length?`<div class="card" style="margin-bottom:12px"><h3 style="margin:0 0 4px">Unavailable</h3><div class="list">${dayAv.map(a=>`<div class="row"><div><h4>${a.allDay?"All day":fmtTime(a.start)+" – "+fmtTime(a.end)}</h4><div class="meta">${esc(S.tutor)} can't take sessions${clashes(a).length?` · <span style="color:var(--warn)">${clashes(a).length} session${clashes(a).length>1?"s":""} booked in this time</span>`:""}</div></div>${canAvail()?`<button class="btn btn-ghost btn-sm" data-act="avdel" data-id="${a.id}" aria-label="Remove unavailable time ${a.allDay?"all day":fmtTime(a.start)+" to "+fmtTime(a.end)}">Remove</button>`:`<span class="tag warn">Unavailable</span>`}</div>`).join("")}</div></div>`:""}
  <div class="card">${dayEv.length?`<div class="list">${dayEv.map(e=>`<div class="row"><div><h4>${e.time?fmtTime(e.time)+" – "+fmtTime(plusHour(e.time))+" · ":""}${esc(stu(e.student)?.name||"Student")}</h4><div class="meta">${esc(e.title)} · ${esc(e.service||"")}${e.mode?" · "+esc(e.mode):""}${e.kind==="Scheduled"&&e.time&&dayAv.some(b=>e.time<b.end&&plusHour(e.time)>b.start)?` · <span style="color:var(--warn)">During unavailable time</span>`:""}</div></div><span class="tag ${calTag(e.kind)}">${e.kind}</span></div>`).join("")}</div>`:`<p class="muted" style="margin:0">No sessions on this day.</p>`}</div>`;
};
