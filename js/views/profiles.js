/* =====================================================================
   AGC Learning Portal — Student profiles views.
   Scripts share one global scope and load in the order listed in index.html.
   ===================================================================== */
/* ---------- views: student profiles module ---------- */
function birthdayList(ss){
  const up = ss.filter(s=>s.profile?.birthday).map(s=>({s,d:daysToBirthday(s.profile.birthday)})).sort((a,b)=>a.d-b.d);
  if(!up.length) return "";
  return `<div class="card"><h2>Upcoming birthdays</h2><div class="list">${up.map(({s,d})=>`<div class="row"><div><h4><a class="linkish" style="color:inherit" href="#/profile/${s.id}">${esc(s.name)}</a></h4><div class="meta">${fmtBday(s.profile.birthday).replace(/, \d{4}$/,"")} · turns ${ageOf(s.profile.birthday)+(d===0?0:1)}</div></div><span class="tag ${d<=30?"gold":""}">${d===0?"Today 🎂":d===1?"Tomorrow":"In "+d+" days"}</span></div>`).join("")}</div></div>`;
}
V.profiles = () => {
  const ss = S.students, missing = ss.filter(s=>{ const p=s.profile||{}; return !p.birthday||!p.school||!p.parentPhone||!p.emergency; });
  return `<div class="head"><h1>Student profiles</h1><p>Personal details, family contacts and learning needs for every student. Kept separate from progress and payments.</p></div>
  <div class="pf-tools"><label for="pfq" class="sr-only">Search students</label><input type="search" id="pfq" placeholder="Search by student, parent, school or city" autocomplete="off"><span class="small muted" id="pfcount">${ss.length} student${ss.length===1?"":"s"}</span></div>
  <div class="card table-wrap"><table class="tbl pf-tbl"><thead><tr><th scope="col">Student</th><th scope="col">Age</th><th scope="col">School</th><th scope="col">Lives in</th><th scope="col">Parent</th><th scope="col">Birthday</th><th scope="col"><span class="sr-only">Actions</span></th></tr></thead><tbody>
  ${ss.map(s=>{ const p=s.profile||{}, soon=bdayLabel(p.birthday), dash=`<span class="muted">—</span>`;
    const q=[s.name,s.grade,s.parent,p.school,p.lives,p.from,p.parentPhone].filter(Boolean).join(" ").toLowerCase();
    return `<tr data-q="${esc(q)}"><td><a class="linkish" style="color:inherit;font-weight:600" href="#/profile/${s.id}">${esc(s.name)}</a><div class="small muted">${esc(s.grade)}</div></td>
      <td>${p.birthday?ageOf(p.birthday):dash}</td>
      <td>${p.school?esc(p.school):dash}</td>
      <td>${p.lives?esc(p.lives):dash}${p.from&&p.from!==p.lives?`<div class="small muted">From ${esc(p.from)}</div>`:""}</td>
      <td>${esc(s.parent)}${p.parentPhone?`<div class="small muted">${esc(p.parentPhone)}</div>`:""}</td>
      <td>${p.birthday?fmtBday(p.birthday).replace(/, \d{4}$/,""):dash}${soon?`<div><span class="tag gold">${soon}</span></div>`:""}</td>
      <td style="text-align:right"><a class="btn btn-ghost btn-sm" href="#/profile/${s.id}">View</a></td></tr>`; }).join("")}
  <tr class="pf-none" hidden><td colspan="7" class="muted" style="text-align:center;padding:22px 0">No students match your search.</td></tr>
  </tbody></table></div>
  <div class="grid g2" style="margin-top:36px">${birthdayList(ss)}
    <div class="card"><h2>Profiles to complete</h2>${missing.length?`<div class="list">${missing.map(s=>{ const p=s.profile||{}; const gaps=[["birthday","birthday"],["school","school"],["parentPhone","parent phone"],["emergency","emergency contact"]].filter(([k])=>!p[k]).map(x=>x[1]);
      return `<div class="row"><div><h4><a class="linkish" style="color:inherit" href="#/profile/${s.id}">${esc(s.name)}</a></h4><div class="meta">Missing ${gaps.join(", ")}</div></div></div>`; }).join("")}</div>`:`<p class="muted" style="margin:0">Every profile is complete.</p>`}</div>
  </div>`;
};
V.profile = (id) => {
  const s = stu(id); if(!s) return V.notfound();
  return `<a class="crumb" href="#/profiles">← Student profiles</a><div class="head"><div class="label">Student profile</div><h1 style="margin-top:6px">${esc(s.name)}</h1><p>${esc(s.grade)} · Parent: ${esc(s.parent)}</p>
    ${(ME.role==="tutor"||can("viewStudents"))?`<a class="btn btn-ghost btn-sm" style="margin-top:12px" href="#/student/${s.id}">View progress</a>`:""}</div>
  <div class="grid g2">${profileCard(s)}</div>${can("editProfiles")?profileForm(s):""}`;
};
V.notfound = () => `<div class="head"><h1>Page not found</h1><p>That page doesn't exist. Use the menu to find your way back.</p></div>`;
