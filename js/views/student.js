/* =====================================================================
   AGC Learning Portal — Student views.
   Scripts share one global scope and load in the order listed in index.html.
   ===================================================================== */
/* ---------- views: student ---------- */
function greeting(){ const h=new Date().getHours(); return h<12?"Good morning":h<18?"Good afternoon":"Good evening"; }
const V = {};
V.dashboard = () => {
  const s = currentStudent(), o = overall(s);
  const todo = assignFor(s.id).filter(a=>a.status==="assigned").sort((a,b)=>a.due.localeCompare(b.due));
  const cont = s.courses.map(cid=>({cid,l:nextLesson(s,cid)})).filter(x=>x.l);
  const note = notesFor(s.id)[0];
  return `<div class="head"><h1>${greeting()}, ${esc(s.name.split(" ")[0])}</h1><p>Every step counts. Here's where you are this week.</p></div>
  <div class="grid g3">
    <div class="card hero-card"><div class="label">Overall progress</div><div class="big">${o.done} <small>of ${o.total} lessons</small></div>${stairs(o.done,o.total,true)}</div>
    ${balanceCard(s)}
    ${nextSessionCard(s.id)}
  </div>
  <h2 class="section-title">Continue learning</h2>
  ${cont.length?`<div class="grid g2">${cont.map(x=>`<a class="lesson" href="#/lesson/${x.cid}/${x.l.id}"><span class="check" aria-hidden="true"></span><b>${esc(x.l.title)}</b><span>${esc(S.courses[x.cid].title)} · ${x.l.mins} min</span></a>`).join("")}</div>`:empty("You've finished every lesson. Amazing work!")}
  <div class="grid g2" style="margin-top:36px">
    <div class="card"><h2>Due soon</h2>${todo.length?`<div class="list">${todo.slice(0,4).map(a=>`<div class="row"><div><h4><a class="linkish" style="color:inherit" href="#/assignment/${a.id}">${esc(a.title)}</a></h4><div class="meta">${esc(S.courses[a.course].title)}</div></div>${statusTag(a)}</div>`).join("")}</div>`:`<p class="muted">You're all caught up.</p>`}</div>
    <div class="card"><h2>Latest note from your tutor</h2>${note?`<h3>${esc(note.focus)}</h3><div class="label" style="margin-bottom:8px">${fmtLong(note.date)}</div><p class="small">${esc(note.summary)}</p><a class="linkish" href="#/notes">See all session notes</a>`:`<p class="muted">Notes appear here after each session.</p>`}</div>
  </div>`;
};
V.courses = () => {
  const s = currentStudent();
  return `<div class="head"><h1>My courses</h1><p>Lessons are built around your diagnostic results, so each one starts where you are.</p></div>
  <div class="grid g3">${s.courses.map(c=>courseCard(s,c,true)).join("")}</div>`;
};
V.course = (cid) => {
  const c = S.courses[cid]; if(!c) return V.notfound();
  const s = currentStudent(); const p = s ? courseProgress(s,cid) : null;
  const back = ME.role==="tutor" ? `<a class="crumb" href="#/library">← Course library</a>` : `<a class="crumb" href="#/courses">← My courses</a>`;
  return `${back}<div class="head"><h1>${esc(c.title)}</h1><p>${esc(c.service)} · ${esc(c.level)}. ${esc(c.blurb)}</p></div>
  ${p?`<div class="card" style="margin-bottom:28px;display:flex;gap:24px;align-items:center;flex-wrap:wrap"><div style="flex:1;min-width:200px">${stairs(p.done,p.total,true)}</div><div><div class="big">${Math.round(p.done/p.total*100)}%</div><div class="label">${p.done} of ${p.total} lessons complete</div></div></div>`:""}
  ${c.modules.map((m,i)=>`<div class="module"><h3>Module ${i+1}: ${esc(m.title)}</h3>
    ${m.lessons.map(l=>{const d=s&&s.done.includes(l.id);return `<a class="lesson" href="#/lesson/${cid}/${l.id}"><span class="check ${d?"on":""}" aria-label="${d?"Complete":"Not started"}">${d?"✓":""}</span><b>${esc(l.title)}</b><span>${l.mins} min</span></a>`}).join("")}
  </div>`).join("")}`;
};
V.lesson = (cid, lid) => {
  const c = S.courses[cid]; if(!c) return V.notfound();
  const ls = lessonsOf(c), i = ls.findIndex(l=>l.id===lid), l = ls[i]; if(!l) return V.notfound();
  const s = ME.role==="student" ? currentStudent() : null; const done = s && s.done.includes(l.id);
  const prev = ls[i-1], next = ls[i+1];
  return `<a class="crumb" href="#/course/${cid}">← ${esc(c.title)}</a>
  <article class="reader">
    <div class="head"><div class="label">Lesson ${i+1} of ${ls.length} · ${l.mins} min</div><h1 style="margin-top:6px">${esc(l.title)}</h1></div>
    <div class="body">${l.body.map(p=>`<p>${esc(p)}</p>`).join("")}</div>
    <div class="keys"><h3>Key ideas</h3><ul>${l.keys.map(k=>`<li>${esc(k)}</li>`).join("")}</ul></div>
    <div class="try"><h3>Worked example</h3><p style="margin:0">${esc(l.example)}</p></div>
    <div class="pager">
      <div>${prev?`<a class="linkish" href="#/lesson/${cid}/${prev.id}">← ${esc(prev.title)}</a>`:""}</div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center">
        ${s?(done?`<span class="tag ok">Completed ✓</span>`:`<button class="btn btn-primary" data-act="complete" data-cid="${cid}" data-lid="${l.id}" data-next="${next?next.id:""}">Mark complete${next?" & continue":""}</button>`):""}
        ${next&&(!s||done)?`<a class="btn btn-ghost" href="#/lesson/${cid}/${next.id}">Next: ${esc(next.title)}</a>`:""}
      </div>
    </div>
  </article>`;
};
V.assignments = () => {
  const s = currentStudent(), all = assignFor(s.id);
  const groups = [["To do",all.filter(a=>a.status==="assigned").sort((a,b)=>a.due.localeCompare(b.due))],["Submitted",all.filter(a=>a.status==="submitted")],["Graded",all.filter(a=>a.status==="graded")]];
  return `<div class="head"><h1>Assignments</h1><p>Practice work from your tutor. Open one to read the instructions and submit your answer.</p></div>
  ${groups.map(([t,list])=>`<h2 class="section-title">${t} <span class="muted small">(${list.length})</span></h2>
    ${list.length?`<div class="card"><div class="list">${list.map(a=>`<div class="row"><div><h4><a class="linkish" style="color:inherit" href="#/assignment/${a.id}">${esc(a.title)}</a></h4><div class="meta">${esc(S.courses[a.course].title)} · due ${fmt(a.due)}</div></div>${statusTag(a)}</div>`).join("")}</div></div>`:empty("Nothing here.")}`).join("")}`;
};
V.assignment = (id) => {
  const a = S.assignments.find(x=>x.id===id); if(!a) return V.notfound();
  const s = stu(a.student);
  const back = ME.role==="tutor" ? `<a class="crumb" href="#/review">← Review work</a>` : `<a class="crumb" href="#/assignments">← Assignments</a>`;
  let action = "";
  if(ME.role==="student" && a.status==="assigned") action = `<form class="card" data-form="submit" data-id="${a.id}"><div class="field"><label for="ans">Your answer</label><textarea id="ans" name="ans" required placeholder="Type your work here. Show your steps!"></textarea></div><button class="btn btn-primary">Submit assignment</button></form>`;
  if(a.submission) action = `<div class="card"><h2>${ME.role==="tutor"?esc(s.name)+"'s":"Your"} submission</h2><p style="white-space:pre-wrap;margin:0">${esc(a.submission)}</p></div>`;
  if(ME.role==="tutor" && a.status==="submitted") action += `<form class="card" style="margin-top:16px" data-form="grade" data-id="${a.id}"><h2>Grade this work</h2><div class="form-row"><div class="field"><label for="g">Grade</label><select id="g" name="grade">${["A","A−","B+","B","B−","C+","C","Needs revision"].map(g=>`<option>${g}</option>`).join("")}</select></div></div><div class="field"><label for="fb">Feedback</label><textarea id="fb" name="fb" required placeholder="What went well, and what to try next"></textarea></div><button class="btn btn-primary">Return graded work</button></form>`;
  if(a.status==="graded") action += `<div class="card note" style="margin-top:16px"><div class="top"><h3>Tutor feedback</h3><span class="tag ok">Grade: ${esc(a.grade)}</span></div><p style="margin:0">${esc(a.feedback)}</p></div>`;
  return `${back}<div class="head"><div class="label">${esc(S.courses[a.course].title)}${ME.role==="tutor"?" · "+esc(s.name):""}</div><h1 style="margin-top:6px">${esc(a.title)}</h1><div style="margin-top:10px">${statusTag(a)}</div></div>
  <div class="reader"><div class="keys"><h3>Instructions</h3><p style="margin:0">${esc(a.instructions)}</p></div>${action}</div>`;
};
V.assessments = () => {
  const s = currentStudent(); const qs = Object.values(S.quizzes).filter(q=>s.courses.includes(q.course));
  return `<div class="head"><h1>Assessments</h1><p>Short checks that show what you've mastered and what to practice next. You can retake any of them.</p></div>
  ${qs.length?`<div class="grid g2">${qs.map(q=>{const r=S.results.filter(x=>x.student===s.id&&x.quiz===q.id).sort((a,b)=>b.date.localeCompare(a.date))[0];
    return `<div class="card"><span class="label">${esc(S.courses[q.course].title)} · ${q.questions.length} questions</span><h3 style="margin:6px 0 12px">${esc(q.title)}</h3>
    ${r?`<p class="small muted">Last score: <b style="color:var(--ink)">${r.score}/${r.total}</b> on ${fmt(r.date)}</p>`:`<p class="small muted">Not taken yet.</p>`}
    <a class="btn ${r?"btn-ghost":"btn-primary"} btn-sm" href="#/quiz/${q.id}">${r?"Retake":"Start"} assessment</a></div>`}).join("")}</div>`:empty("No assessments for your courses yet.")}`;
};
let lastQuiz = null;
V.quiz = (id) => {
  const q = S.quizzes[id]; if(!q) return V.notfound();
  const res = lastQuiz && lastQuiz.id===id ? lastQuiz : null;
  return `<a class="crumb" href="#/assessments">← Assessments</a><div class="head"><h1>${esc(q.title)}</h1><p>${esc(S.courses[q.course].title)} · ${q.questions.length} questions</p></div>
  <div class="reader">
  ${res?`<div class="card hero-card score"><div class="big">${res.score}/${q.questions.length}</div><div><b style="font-family:var(--display)">${res.score===q.questions.length?"Perfect score!":res.score/q.questions.length>=.7?"Great work!":"Good effort. Let's keep practicing."}</b><div class="small muted">Your tutor can see this result.</div></div></div>`:""}
  <form class="card" data-form="quiz" data-id="${id}">
    ${q.questions.map((x,i)=>`<div class="q"><fieldset><legend>${i+1}. ${esc(x.q)}</legend>
      ${x.o.map((o,j)=>{let cls="";if(res){if(j===x.a)cls="right";else if(res.answers[i]===j)cls="wrong";}
        return `<label class="opt ${cls}"><input type="radio" name="q${i}" value="${j}" ${res&&res.answers[i]===j?"checked":""} ${res?"disabled":""} required> ${esc(o)}</label>`}).join("")}
    </fieldset></div>`).join("")}
    ${res?`<button type="button" class="btn btn-ghost" data-act="retake" data-id="${id}">Retake assessment</button>`:`<button class="btn btn-primary">Submit answers</button>`}
  </form></div>`;
};
V.notes = () => {
  const s = currentStudent(); const ns = notesFor(s.id);
  return `<div class="head"><h1>Session notes</h1><p>Written after every 60-minute session: what ${ME.role==="parent"?esc(s.name.split(" ")[0]):"you"} worked on and what comes next.</p></div>
  <div class="grid">${ns.length?ns.map(n=>noteCard(n)).join(""):empty("Notes appear here after the first session.")}</div>`;
};
V.schedule = () => {
  const sid = isStaff() ? null : ME.student;
  const up = upcoming(sid);
  const form = ME.role==="tutor" ? `<form class="card" data-form="session" style="margin-bottom:28px"><h2>Schedule a session</h2>
    <div class="form-row"><div class="field"><label for="st">Student</label><select id="st" name="student">${S.students.map(s=>`<option value="${s.id}">${esc(s.name)}</option>`).join("")}</select></div>
    <div class="field"><label for="sb">Subject</label><input type="text" id="sb" name="subject" required placeholder="e.g. Algebra I"></div>
    <div class="field"><label for="dt">Date</label><input type="date" id="dt" name="date" required value="${dayOffset(1)}"></div>
    <div class="field"><label for="tm">Time</label><input type="time" id="tm" name="time" required value="16:00"></div>
    <div class="field"><label for="sv">Service</label><select id="sv" name="service"><option>AGC Core Tutoring</option><option>AGC Ascent Coaching</option></select></div>
    <div class="field"><label for="md">Location</label><select id="md" name="mode"><option>In-home</option><option>Public library</option><option>AGC Anywhere</option></select></div></div>
    <button class="btn btn-primary">Add to schedule</button></form>` : "";
  return `<div class="head"><h1>Schedule</h1><p>Upcoming 1:1 sessions, in person or online through AGC Anywhere.</p></div>${form}
  <div class="card">${up.length?`<div class="list">${up.map(x=>sessionRow(x,!sid)).join("")}</div>`:`<p class="muted" style="margin:0">No upcoming sessions.</p>`}</div>`;
};
