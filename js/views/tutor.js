/* =====================================================================
   AGC Learning Portal — Tutor views.
   Scripts share one global scope and load in the order listed in index.html.
   ===================================================================== */
/* ---------- views: tutor ---------- */
V.tdash = () => {
  const up = upcoming().slice(0,5), sub = S.assignments.filter(a=>a.status==="submitted"), low = S.students.filter(s=>remaining(s)<=2);
  return `<div class="head"><h1>${greeting()}, Rochelle</h1><p>${S.students.length} active students · ${up.length} upcoming sessions</p></div>
  <div class="grid g3">
    <div class="card hero-card"><div class="label">Work to review</div><div class="big">${sub.length}</div><a class="linkish" style="color:var(--gold)" href="#/review">Open review queue</a></div>
    <div class="card"><div class="label">Sessions this week</div><div class="big">${upcoming().filter(x=>daysUntil(x.date)<7).length}</div><a class="linkish" href="#/schedule">View schedule</a></div>
    <div class="card"><div class="label">Low session balance</div><div class="big">${low.length}</div><div class="small muted">${low.length?low.map(s=>esc(s.name)+" ("+remaining(s)+" left)").join(", "):"Everyone is well stocked."}</div></div>
  </div>
  <div class="grid g2" style="margin-top:36px">
    <div class="card"><h2>Upcoming sessions</h2>${up.length?`<div class="list">${up.map(x=>sessionRow(x,true)).join("")}</div>`:`<p class="muted">Nothing scheduled.</p>`}</div>
    <div class="card"><h2>Quick actions</h2><div style="display:flex;flex-direction:column;gap:10px">
      <a class="btn btn-primary" href="#/log">Log a session</a><a class="btn btn-ghost" href="#/review">Create an assignment</a><a class="btn btn-ghost" href="#/schedule">Schedule a session</a></div></div>
  </div>`;
};
V.students = () => `<div class="head"><h1>Students</h1><p>Progress, balances and notes for every student you work with.</p></div>
  <div class="grid g3">${S.students.map(s=>{const o=overall(s),r=remaining(s);return `<a class="card course" href="#/student/${s.id}"><span class="svc">${esc(s.grade)} · Parent: ${esc(s.parent)}</span><h3>${esc(s.name)}</h3>${stairs(o.done,o.total)}
    <div class="foot"><span>${o.done}/${o.total} lessons</span><span class="tag ${r<=2?"warn":""}">${r} sessions left</span></div></a>`}).join("")}</div>`;
V.student = (id) => {
  const s = stu(id); if(!s) return V.notfound();
  const res = S.results.filter(r=>r.student===id), tutor = ME.role==="tutor";
  const back = tutor ? `<a class="crumb" href="#/students">← Students</a>` : `<a class="crumb" href="#/adash">← Students &amp; progress</a>`;
  const billingForm = can("editBilling") ? `<form class="card" data-form="billing" data-id="${s.id}"><h2>Update payment</h2>
      <p class="small muted" style="margin-top:0">${esc(s.parent)} sees these details on their Overview and Packages pages.</p>
      <div class="form-row">
        <div class="field"><label for="bpr">Package price ($)</label><input type="number" id="bpr" name="price" min="0" step="1" required value="${s.pkg.price||0}"></div>
        <div class="field"><label for="bpd">Paid so far ($)</label><input type="number" id="bpd" name="paid" min="0" step="1" required value="${s.pkg.paid||0}"></div>
        <div class="field"><label for="bdu">Payment due date</label><input type="date" id="bdu" name="due" value="${s.pkg.due||""}"></div>
        <div class="field"><label for="bex">Package valid until</label><input type="date" id="bex" name="expires" value="${s.pkg.expires||""}"></div>
      </div>
      <button class="btn btn-primary">Save payment details</button>
    </form>` : "";
  return `${back}<div class="head"><h1>${esc(s.name)}</h1><p>${esc(s.grade)} · Parent: ${esc(s.parent)}</p>${can("viewProfiles")?`<a class="btn btn-ghost btn-sm" style="margin-top:12px" href="#/profile/${s.id}">View student profile</a>`:""}</div>
  <div class="grid g3">${balanceCard(s,true)}${can("viewSchedule")?nextSessionCard(id):`<div class="card"><div class="label">Lessons completed</div><div class="big">${overall(s).done} <small>of ${overall(s).total}</small></div></div>`}${can("viewResults")?`<div class="card"><h2>Assessments</h2>${res.length?res.map(r=>`<div class="row"><h4>${esc(S.quizzes[r.quiz].title)}</h4><span class="tag gold">${r.score}/${r.total}</span></div>`).join(""):`<p class="muted small" style="margin:0">None taken yet.</p>`}</div>`:""}</div>
  ${can("viewBilling")?`<h2 class="section-title">Payment &amp; package</h2><div class="grid g2">${billingCard(s)}${billingForm}</div>`:""}
  <h2 class="section-title">Courses</h2><div class="grid g3">${s.courses.map(c=>courseCard(s,c,false)).join("")}</div>
  ${can("viewResults")?`<h2 class="section-title">Assignments</h2><div class="card">${assignFor(id).length?`<div class="list">${assignFor(id).map(a=>`<div class="row"><div><h4>${tutor?`<a class="linkish" style="color:inherit" href="#/assignment/${a.id}">${esc(a.title)}</a>`:esc(a.title)}</h4><div class="meta">${esc(S.courses[a.course].title)} · due ${fmt(a.due)}</div></div>${statusTag(a)}</div>`).join("")}</div>`:`<p class="muted" style="margin:0">No assignments yet.</p>`}</div>`:""}
  ${can("viewNotes")?`<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px"><h2 class="section-title">Session notes</h2>${tutor?`<a class="btn btn-primary btn-sm" href="#/log/${id}">Log a session</a>`:""}</div>
  <div class="grid">${notesFor(id).map(n=>noteCard(n)).join("")||empty("No notes yet.")}</div>`:""}`;
};
V.log = (pre) => `<div class="head"><h1>Log a session</h1><p>Saving a note shares it with the student and parent right away and deducts one session from their balance. You can also email the notes straight to the parent.</p></div>
  <form class="card reader" data-form="note">
    <div class="form-row">
      <div class="field"><label for="ls">Student</label><select id="ls" name="student">${S.students.map(s=>`<option value="${s.id}" ${s.id===pre?"selected":""}>${esc(s.name)} (${remaining(s)} left)</option>`).join("")}</select></div>
      <div class="field"><label for="ld">Date</label><input type="date" id="ld" name="date" required value="${today()}"></div>
      <div class="field"><label for="lsv">Service</label><select id="lsv" name="service"><option>AGC Core Tutoring</option><option>AGC Ascent Coaching</option></select></div>
      <div class="field"><label for="lm">Location</label><select id="lm" name="mode"><option>In-home</option><option>Public library</option><option>AGC Anywhere</option></select></div>
    </div>
    <div class="field"><label for="lf">Focus</label><input type="text" id="lf" name="focus" required placeholder="e.g. Algebra I: slope"></div>
    <div class="field"><label for="lsum">What we worked on</label><textarea id="lsum" name="summary" required placeholder="Progress, wins and what was challenging"></textarea></div>
    <div class="field"><label for="ln">Next steps</label><input type="text" id="ln" name="next" placeholder="Practice or goals before the next session"></div>
    <div class="field"><label for="lpe">Parent email</label><input type="email" id="lpe" name="parentEmail" placeholder="parent@example.com" value="${esc((stu(pre)||S.students[0]).parentEmail||"")}"></div>
    <label style="display:flex;align-items:center;gap:8px;margin-bottom:18px;cursor:pointer"><input type="checkbox" name="emailParent" checked style="accent-color:var(--navy);width:18px;height:18px"> Email these notes to the parent after saving</label>
    <button class="btn btn-primary">Save note &amp; deduct session</button>
  </form>`;
V.review = () => {
  const sub = S.assignments.filter(a=>a.status==="submitted");
  const open = S.assignments.filter(a=>a.status==="assigned").sort((a,b)=>a.due.localeCompare(b.due));
  return `<div class="head"><h1>Review work</h1><p>Grade submitted assignments and set new practice.</p></div>
  <h2 class="section-title">Waiting for review (${sub.length})</h2>
  ${sub.length?`<div class="card"><div class="list">${sub.map(a=>`<div class="row"><div><h4>${esc(a.title)}</h4><div class="meta">${esc(stu(a.student).name)} · ${esc(S.courses[a.course].title)}</div></div><a class="btn btn-primary btn-sm" href="#/assignment/${a.id}">Grade</a></div>`).join("")}</div></div>`:empty("Nothing to review right now.")}
  <h2 class="section-title">Create an assignment</h2>
  <form class="card" data-form="assign">
    <div class="form-row">
      <div class="field"><label for="as">Student</label><select id="as" name="student">${S.students.map(s=>`<option value="${s.id}">${esc(s.name)}</option>`).join("")}</select></div>
      <div class="field"><label for="ac">Course</label><select id="ac" name="course">${Object.values(S.courses).map(c=>`<option value="${c.id}">${esc(c.title)}</option>`).join("")}</select></div>
      <div class="field"><label for="at">Title</label><input type="text" id="at" name="title" required></div>
      <div class="field"><label for="adue">Due date</label><input type="date" id="adue" name="due" required value="${dayOffset(7)}"></div>
    </div>
    <div class="field"><label for="ai">Instructions</label><textarea id="ai" name="instructions" required></textarea></div>
    <button class="btn btn-primary">Assign</button>
  </form>
  <h2 class="section-title">Open assignments (${open.length})</h2>
  <div class="card">${open.length?`<div class="list">${open.map(a=>`<div class="row"><div><h4>${esc(a.title)}</h4><div class="meta">${esc(stu(a.student).name)} · ${esc(S.courses[a.course].title)}</div></div>${statusTag(a)}</div>`).join("")}</div>`:`<p class="muted" style="margin:0">None open.</p>`}</div>`;
};
V.library = () => `<div class="head"><h1>Course library</h1><p>All lessons across AGC Core Tutoring and AGC Ascent Coaching.</p></div>
  <div class="grid g3">${Object.values(S.courses).map(c=>`<a class="card course" href="#/course/${c.id}"><span class="svc">${esc(c.service)}</span><h3>${esc(c.title)}</h3><p class="small muted" style="margin:0">${esc(c.blurb)}</p><div class="foot"><span>${lessonsOf(c).length} lessons</span><span>${S.students.filter(s=>s.courses.includes(c.id)).length} enrolled</span></div></a>`).join("")}</div>`;
