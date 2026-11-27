/* =====================================================================
   AGC Learning Portal — Demo data, saved state (localStorage) and data helpers.
   Scripts share one global scope and load in the order listed in index.html.
   ===================================================================== */
/* ---------- seed data ---------- */
function L(id,title,mins,body,keys,example){ return {id,title,mins,body,keys,example}; }
function seed(){
  const courses = {
    alg1:{id:"alg1",title:"Algebra I",service:"AGC Core Tutoring",subject:"Math",level:"Middle & High School",
      blurb:"Build fluency with expressions, equations and linear relationships.",
      modules:[
        {title:"Expressions & equations",lessons:[
          L("a1","Variables and expressions",20,["A variable is a letter that stands for a number we don't know yet. An expression combines numbers, variables and operations, such as 3x + 5. Because an expression has no equals sign, we simplify or evaluate it rather than solve it.","To evaluate an expression, replace the variable with its value and follow the order of operations."],["An expression has no equals sign","Like terms share the same variable and power","Order of operations: parentheses, exponents, multiply and divide, add and subtract"],"Evaluate 3x + 5 when x = 4: 3(4) + 5 = 12 + 5 = 17."),
          L("a2","Solving one-step equations",20,["An equation says that two expressions are equal. To solve it, isolate the variable by applying the inverse operation to both sides.","Addition undoes subtraction, and multiplication undoes division. Whatever you do to one side, you must do to the other."],["Keep the equation balanced","Use the inverse operation","Check by substituting your answer back in"],"x − 7 = 12 → add 7 to both sides → x = 19. Check: 19 − 7 = 12 ✓"),
          L("a3","Solving two-step equations",25,["Two-step equations need two inverse operations. Undo addition or subtraction first, then undo multiplication or division.","Writing each step on its own line makes mistakes easy to spot."],["Undo + and − first","Then undo × and ÷","One step per line"],"2x + 3 = 11 → subtract 3: 2x = 8 → divide by 2: x = 4.")]},
        {title:"Linear relationships",lessons:[
          L("a4","Slope as rate of change",25,["Slope measures how much y changes for each 1-unit change in x. We often describe it as rise over run.","A positive slope rises from left to right; a negative slope falls."],["Slope = (y₂ − y₁) ÷ (x₂ − x₁)","Positive slopes rise, negative slopes fall","A horizontal line has slope 0"],"Through (1, 2) and (3, 8): slope = (8 − 2) ÷ (3 − 1) = 6 ÷ 2 = 3."),
          L("a5","Graphing y = mx + b",25,["In slope-intercept form, m is the slope and b is the y-intercept, the point where the line crosses the y-axis.","Plot the y-intercept first, then use the slope to find a second point."],["m = slope","b = y-intercept","Start at (0, b), then rise and run"],"y = 2x + 1: start at (0, 1), go up 2 and right 1 to reach (1, 3).")]}
      ]},
    read:{id:"read",title:"Reading Foundations",service:"AGC Core Tutoring",subject:"Reading",level:"Elementary & Phonics",
      blurb:"Decode words with confidence and understand what you read.",
      modules:[
        {title:"Phonics",lessons:[
          L("r1","Closed syllables",15,["A closed syllable ends with a consonant, which 'closes in' the vowel and usually makes it short.","Words like cat, rab-bit and nap-kin are built from closed syllables."],["Ends in a consonant","The vowel is usually short","Split between two consonants: rab | bit"],"Tap out 'napkin': nap (short a) + kin (short i)."),
          L("r2","Vowel teams",20,["A vowel team is two letters that work together to make one vowel sound, such as ai, ay, ee, ea and oa.","Learning the common teams helps you read longer words smoothly."],["ai / ay say long a (rain, play)","ee / ea often say long e (feet, team)","oa says long o (boat)"],"Read: rain, stay, sheep, beach, coat.")]},
        {title:"Comprehension",lessons:[
          L("r3","Finding the main idea",20,["The main idea is what a whole paragraph is mostly about. The details support it.","Ask: if I had to explain this paragraph in one sentence, what would I say?"],["Look for what the details have in common","The main idea isn't always the first sentence","Say it in your own words"],"Details: bees carry pollen, bees make honey, bees help crops grow → Main idea: bees are important to people and plants."),
          L("r4","Making inferences",20,["An inference is a smart guess that combines clues from the text with what you already know.","Authors don't always say everything directly, so good readers fill in the gaps."],["Text clues + what I know = inference","Point to the clue that supports it","Inferences can be revised"],"'Ella grabbed her umbrella and frowned at the sky.' → It is probably about to rain.")]}
      ]},
    asc:{id:"asc",title:"Executive Functioning Essentials",service:"AGC Ascent Coaching",subject:"Coaching",level:"All grades",
      blurb:"Organize your week, start tasks with less stress, and stay calm under pressure.",
      modules:[
        {title:"Organize",lessons:[
          L("e1","Building a weekly planner",20,["A weekly planner turns a busy week into something you can see. When everything is on one page, it's easier to decide what comes first.","Start by writing in fixed commitments: school, practice, tutoring. Then add homework and study blocks in the gaps."],["Fixed commitments go in first","Give each subject a color","Review the planner every Sunday"],"Sunday: write in soccer (Tue/Thu), tutoring (Wed), then two 30-minute study blocks for the science test."),
          L("e2","Breaking big tasks into steps",20,["Big assignments feel overwhelming because the first step isn't clear. Breaking them into small, specific steps makes each one feel doable.","A good step starts with a verb and takes less than 30 minutes."],["Start each step with a verb","Keep steps under 30 minutes","Put a date next to each step"],"Book report → choose book, read chapters 1–4, write a summary, draft the intro, finish the draft, proofread.")]},
        {title:"Focus & calm",lessons:[
          L("e3","Starting when it feels hard",15,["Task initiation is the skill of getting started. Most people find starting harder than continuing.","Try the five-minute start: commit to working for just five minutes, then decide whether to keep going."],["Make the first step tiny","Set a five-minute timer","Clear your workspace first"],"Instead of 'study for math', start with 'open notebook and redo problem 1'."),
          L("e4","Managing test anxiety",20,["Some nervousness before a test is normal and can even help you focus. When it becomes overwhelming, a few simple tools can bring it back down.","Box breathing slows your heart rate: breathe in for 4, hold for 4, out for 4, hold for 4."],["Prepare early with short sessions","Use box breathing (4-4-4-4)","Start with a question you know"],"Before the test: three rounds of box breathing, then skim the whole test and circle two questions you know.")]}
      ]},
    chem:{id:"chem",title:"Chemistry",service:"AGC Core Tutoring",subject:"Science",level:"High School",
      blurb:"Understand atoms, bonding and chemical reactions from the ground up.",
      modules:[{title:"Foundations",lessons:[
        L("c1","Atoms and the periodic table",25,["Atoms are made of protons, neutrons and electrons. The number of protons defines the element.","The periodic table is organized so that elements in the same column share similar chemical properties."],["Protons (+), neutrons (0), electrons (−)","Atomic number = number of protons","Columns are groups with similar properties"],"Carbon has atomic number 6, so every carbon atom has 6 protons."),
        L("c2","Chemical bonds",25,["Atoms bond to become more stable. In ionic bonds, electrons are transferred; in covalent bonds, electrons are shared.","Metals and nonmetals tend to form ionic bonds, while nonmetals together form covalent bonds."],["Ionic: electrons transferred","Covalent: electrons shared","Bonding leads to stability"],"NaCl (table salt) is ionic; H₂O (water) is covalent."),
        L("c3","Balancing chemical equations",30,["Matter is conserved, so the number of each type of atom must be the same on both sides of an equation.","Change coefficients (the big numbers in front), never the subscripts."],["Count atoms on each side","Adjust coefficients only","Check every element at the end"],"H₂ + O₂ → H₂O becomes 2H₂ + O₂ → 2H₂O.")]}]},
    alg2:{id:"alg2",title:"Algebra II",service:"AGC Core Tutoring",subject:"Math",level:"High School",
      blurb:"Master quadratics, factoring and the tools for advanced math.",
      modules:[{title:"Quadratics",lessons:[
        L("b1","Quadratic functions",25,["A quadratic function has the form y = ax² + bx + c, and its graph is a U-shaped curve called a parabola.","If a is positive the parabola opens up; if negative it opens down."],["Graph is a parabola","a > 0 opens up, a < 0 opens down","The vertex is the turning point"],"y = x² − 4 opens up with vertex at (0, −4)."),
        L("b2","Factoring quadratics",30,["Factoring rewrites a quadratic as a product of two binomials. For x² + bx + c, find two numbers that multiply to c and add to b.","Factoring lets you find where the parabola crosses the x-axis."],["Multiply to c, add to b","Check by expanding","Set each factor to zero to solve"],"x² + 5x + 6 = (x + 2)(x + 3), so x = −2 or x = −3."),
        L("b3","The quadratic formula",30,["When a quadratic doesn't factor neatly, the quadratic formula always works: x = (−b ± √(b² − 4ac)) ÷ 2a.","The expression under the square root, the discriminant, tells you how many real solutions there are."],["Identify a, b and c first","Discriminant > 0: two solutions","Discriminant < 0: no real solutions"],"x² − 2x − 3 = 0: a=1, b=−2, c=−3 → x = (2 ± 4) ÷ 2 → x = 3 or x = −1.")]}]}
  };
  const quizzes = {
    "qz-alg1":{id:"qz-alg1",course:"alg1",title:"Algebra I diagnostic",questions:[
      {q:"Evaluate 4x − 3 when x = 5.",o:["17","20","23","12"],a:0},
      {q:"Solve: x + 9 = 15",o:["24","6","−6","9/15"],a:1},
      {q:"Solve: 3x − 4 = 11",o:["5","7/3","15","3"],a:0},
      {q:"What is the slope of the line through (0, 1) and (2, 7)?",o:["3","4","6","1/3"],a:0},
      {q:"In y = −2x + 5, where does the line cross the y-axis?",o:["(0, 5)","(5, 0)","(0, −2)","(−2, 5)"],a:0}]},
    "qz-read":{id:"qz-read",course:"read",title:"Reading skills check",questions:[
      {q:"Which word is a closed syllable?",o:["hat","he","go","me"],a:0},
      {q:"Which letters form the vowel team in 'boat'?",o:["oa","bo","at","ot"],a:0},
      {q:"The main idea of a paragraph is…",o:["What the whole paragraph is mostly about","Always the first sentence","The most interesting detail","The title of the book"],a:0},
      {q:"An inference combines clues from the text with…",o:["What you already know","The author's name","The page number","A dictionary definition"],a:0}]},
    "qz-chem":{id:"qz-chem",course:"chem",title:"Chemistry foundations check",questions:[
      {q:"Which particle has a negative charge?",o:["Proton","Electron","Neutron","Nucleus"],a:1},
      {q:"Elements in the same column of the periodic table share…",o:["Similar chemical properties","The same mass","The same number of neutrons","The same state of matter"],a:0},
      {q:"Balance H₂ + O₂ → H₂O. What is the coefficient of H₂O?",o:["1","2","3","4"],a:1},
      {q:"A bond in which electrons are shared is called…",o:["Ionic","Metallic","Covalent","Magnetic"],a:2}]},
    "qz-alg2":{id:"qz-alg2",course:"alg2",title:"Quadratics check",questions:[
      {q:"Which way does y = −x² + 3 open?",o:["Up","Down","Left","Right"],a:1},
      {q:"Factor x² + 7x + 12.",o:["(x + 3)(x + 4)","(x + 2)(x + 6)","(x + 1)(x + 12)","(x − 3)(x − 4)"],a:0},
      {q:"If the discriminant is negative, the equation has…",o:["Two real solutions","One real solution","No real solutions","Infinitely many solutions"],a:2}]}
  };
  const T = "Rochelle Concepcion";
  return {
    tutor:T,
    adminPerms:defaultPerms(), accessLog:[],
    courses, quizzes,
    students:[
      {id:"s1",name:"Maya Santos",grade:"Grade 8",parent:"Ana Santos",parentEmail:"ana.santos@example.com",profile:{birthday:"2013-10-12",school:"Lincoln Middle School",lives:"Pasadena, CA",from:"Quezon City, Philippines",enrolled:"2026-06-15",source:"Referral from a friend",parentPhone:"(555) 214-8830",emergency:"Ramon Santos (father) · (555) 214-8831",needs:"Visual learner who does best with worked examples. Gets nervous before tests."},pkg:{name:"Momentum Growth Pack",total:16,used:9,price:1360,paid:680,due:dayOffset(5),expires:dayOffset(75)},tutors:[T],courses:["alg1","read","asc"],done:["a1","a2","a3","r1","r2","e1"]},
      {id:"s2",name:"Ethan Cruz",grade:"Grade 11",parent:"Liza Cruz",parentEmail:"liza.cruz@example.com",profile:{birthday:"2010-02-03",school:"Westview High School",lives:"Glendale, CA",from:"Cebu City, Philippines",enrolled:"2026-08-01",source:"Google search",parentPhone:"(555) 377-1902",emergency:"Paolo Cruz (uncle) · (555) 377-4410",needs:"Preparing for AP Chemistry. Prefers online sessions on weekdays."},pkg:{name:"Sprint Growth Pack",total:8,used:6,price:720,paid:720,due:"",expires:dayOffset(21)},tutors:[T],courses:["chem","alg2","asc"],done:["c1","b1","e1","e2"]},
      {id:"s3",name:"Sofia Reyes",grade:"Grade 4",parent:"Mark Reyes",parentEmail:"mark.reyes@example.com",profile:{birthday:"2017-05-21",school:"Maple Elementary",lives:"Burbank, CA",from:"Burbank, CA",enrolled:"2026-09-10",source:"School recommendation",parentPhone:"(555) 408-5567",emergency:"Elena Reyes (grandmother) · (555) 408-1120",needs:"Has an IEP for reading fluency. Short movement break every 15 minutes."},pkg:{name:"Flex Aspire Pass",total:2,used:1,price:200,paid:100,due:dayOffset(-2),expires:dayOffset(30)},tutors:[T],courses:["read"],done:["r1"]}
    ],
    assignments:[
      {id:"as1",student:"s1",course:"alg1",title:"Two-step equations practice",due:dayOffset(3),status:"assigned",instructions:"Solve the five equations on your worksheet and show every step on its own line. Then write one sentence explaining which operation you undo first and why."},
      {id:"as2",student:"s1",course:"read",title:"Main idea paragraph",due:dayOffset(-4),status:"graded",instructions:"Read the article about honeybees and write the main idea in one sentence, followed by three supporting details.",submission:"Main idea: Honeybees are important because they help plants grow. Details: they carry pollen between flowers, they make honey, and farmers need them for crops like almonds.",grade:"A",feedback:"Excellent, Maya! Your main idea is clear and every detail supports it. Next time, try putting the main idea in your own words even more."},
      {id:"as3",student:"s1",course:"asc",title:"My weekly planner",due:dayOffset(6),status:"assigned",instructions:"Fill in next week's planner: fixed commitments first, then homework and two study blocks. Bring a photo or the paper copy to your next Ascent session."},
      {id:"as4",student:"s2",course:"chem",title:"Balancing equations set",due:dayOffset(-1),status:"submitted",instructions:"Balance the eight equations on the worksheet. Circle any you found tricky.",submission:"1) 2H₂ + O₂ → 2H₂O  2) N₂ + 3H₂ → 2NH₃  3) CH₄ + 2O₂ → CO₂ + 2H₂O … I found #6 tricky because of the oxygen on both sides."},
      {id:"as5",student:"s2",course:"alg2",title:"Graph three parabolas",due:dayOffset(5),status:"assigned",instructions:"Graph y = x², y = −x² + 4 and y = (x − 2)². Label each vertex and say which way it opens."},
      {id:"as6",student:"s3",course:"read",title:"Vowel team word hunt",due:dayOffset(2),status:"assigned",instructions:"Find 10 words with vowel teams in your favorite book. Write each word and underline the vowel team."}
    ],
    results:[
      {id:uid("r"),student:"s1",quiz:"qz-read",score:3,total:4,date:dayOffset(-10)},
      {id:uid("r"),student:"s2",quiz:"qz-chem",score:4,total:4,date:dayOffset(-6)}
    ],
    notes:[
      {id:"n1",student:"s1",date:dayOffset(-2),service:"AGC Core Tutoring",mode:"In-home",focus:"Algebra I: two-step equations",summary:"Maya solved 8 of 10 two-step equations independently. She's confident undoing addition first; equations with negative coefficients still slow her down.",next:"Practice five equations with negative coefficients before the next session."},
      {id:"n2",student:"s1",date:dayOffset(-7),service:"AGC Ascent Coaching",mode:"AGC Anywhere",focus:"Weekly planning",summary:"We built a color-coded weekly planner together. Maya identified Tuesday evenings as her most overloaded time and moved one study block to Monday.",next:"Fill in the planner every Sunday and bring it to the next Ascent session."},
      {id:"n3",student:"s1",date:dayOffset(-12),service:"AGC Core Tutoring",mode:"In-home",focus:"Reading: vowel teams",summary:"Strong progress decoding ai/ay and ee/ea words. Oral reading fluency rose from 88 to 97 words per minute on a grade-level passage.",next:"Read aloud for 10 minutes a day; mark any vowel-team words that are tricky."},
      {id:"n4",student:"s2",date:dayOffset(-3),service:"AGC Core Tutoring",mode:"Public library",focus:"Chemistry: balancing equations",summary:"Ethan balanced combustion reactions with support and is now counting atoms systematically. He rushes the final check.",next:"Finish the balancing set and check every element before submitting."},
      {id:"n5",student:"s2",date:dayOffset(-9),service:"AGC Ascent Coaching",mode:"AGC Anywhere",focus:"Breaking down the lab report",summary:"We split the chemistry lab report into six dated steps. Ethan felt much less stressed once he could see the whole plan.",next:"Complete steps 1–3 by Friday."},
      {id:"n6",student:"s3",date:dayOffset(-5),service:"AGC Core Tutoring",mode:"In-home",focus:"Phonics: closed syllables",summary:"Sofia read 18 of 20 closed-syllable words correctly and began splitting two-syllable words on her own. Very positive session!",next:"Practice the word cards with a parent three times this week."}
    ],
    sessions:[
      {id:"ss1",student:"s1",date:dayOffset(2),time:"16:00",subject:"Algebra I",service:"AGC Core Tutoring",mode:"In-home"},
      {id:"ss2",student:"s1",date:dayOffset(5),time:"17:00",subject:"Executive functioning",service:"AGC Ascent Coaching",mode:"AGC Anywhere"},
      {id:"ss3",student:"s2",date:dayOffset(1),time:"15:30",subject:"Chemistry",service:"AGC Core Tutoring",mode:"Public library"},
      {id:"ss4",student:"s2",date:dayOffset(4),time:"16:30",subject:"Algebra II",service:"AGC Core Tutoring",mode:"AGC Anywhere"},
      {id:"ss5",student:"s3",date:dayOffset(3),time:"14:00",subject:"Reading",service:"AGC Core Tutoring",mode:"In-home"}
    ]
  };
}

// What the Super Admin can grant or withhold from the Admin: [key, label, description, on by default]
const PERMS = [
  ["viewStudents","Student details & progress","Student list, grades, course progress and lessons completed.",true],
  ["viewProfiles","Student profiles","Birthdays, school, hometown, family contacts and learning needs.",true],
  ["editProfiles","Edit student profiles","Update birthdays, school, address, contacts and learning needs.",true],
  ["viewResults","Assignments & assessments","Assignment status, grades and assessment scores.",true],
  ["viewNotes","Session notes","Notes tutors write after every session.",true],
  ["viewSchedule","Schedule","Upcoming sessions for every student.",true],
  ["viewBilling","Payments & balances","Package prices, amounts paid, balances and due dates.",false],
  ["editBilling","Update payment details","Record payments and change due dates. Needs Payments & balances.",false],
  ["emailParents","Email parents","Send session notes to parents by email.",false]
];
const ADMIN = "Carla Mendoza", SUPER = "Rochelle Concepcion";
function defaultPerms(){ return Object.fromEntries(PERMS.map(p=>[p[0],p[3]])); }
function can(p){
  if(!ME) return false;
  if(ME.role==="tutor"||ME.role==="superadmin") return true;
  if(ME.role!=="admin") return false;
  if(p==="editBilling" && !S.adminPerms.viewBilling) return false;
  if(p==="editProfiles" && !S.adminPerms.viewProfiles) return false;
  return !!S.adminPerms[p];
}
const isStaff = () => ["tutor","admin","superadmin"].includes(ME?.role);
// [name, length, sessions, rate per session, price, savings]
const PACKAGES = [["Flex Aspire Pass","Pay-as-you-go",1,100,100,0],["Sprint Growth Pack","8 sessions",8,90,720,80],["Momentum Growth Pack","16 sessions",16,85,1360,240],["Ascent Progress Pack","32 sessions",32,80,2560,640],["Semester Conquer Pass","48 sessions",48,75,3600,1200],["Apex Scholar Elite","72 sessions",72,70,5040,2160]];
let S, ME;
try { S = JSON.parse(localStorage.getItem(KEY)); } catch(e) { S = null; }
if(!S || !S.students) S = seed();
if(!S.adminPerms) S.adminPerms = defaultPerms();
PERMS.forEach(p => { if(S.adminPerms[p[0]]==null) S.adminPerms[p[0]] = p[3]; });
if(!S.accessLog) S.accessLog = [];
// Program renamed 2026-11-11: update sessions, notes and courses saved under the old name
Object.values(S).forEach(v => { if(v && typeof v==="object") Object.values(v).forEach(o => { if(o && o.service==="AGC Core Tutoring: In-person Specialized Tutoring") o.service = "AGC Core Tutoring"; }); });
{ const base = seed(); S.students.forEach(s => { const b = base.students.find(x=>x.id===s.id);
  if(s.parentEmail==null) s.parentEmail = b ? b.parentEmail : "";
  if(!Array.isArray(s.tutors)) s.tutors = [S.tutor];
  if(!s.profile) s.profile = b && b.name===s.name ? {...b.profile} : {};
  if(s.pkg.price==null){ const bp = b && b.pkg.name===s.pkg.name ? b.pkg : null; const rate = (PACKAGES.find(p=>p[0]===s.pkg.name)||[])[3]||0;
    Object.assign(s.pkg, bp ? {price:bp.price,paid:bp.paid,due:bp.due,expires:bp.expires} : {price:rate*s.pkg.total,paid:0,due:"",expires:""}); } }); }
try { ME = JSON.parse(localStorage.getItem(ME_KEY)); } catch(e) { ME = null; }
function save(){ try{ localStorage.setItem(KEY, JSON.stringify(S)); }catch(e){} }
function saveMe(){ try{ ME ? localStorage.setItem(ME_KEY, JSON.stringify(ME)) : localStorage.removeItem(ME_KEY); }catch(e){} }

/* ---------- data helpers ---------- */
const stu = id => S.students.find(s => s.id === id);
// The tutor(s) assigned to a student, as "Name, Name"
const tutorsOf = s => (s.tutors||[]).join(", ");
const lessonsOf = c => c.modules.flatMap(m => m.lessons);
const courseProgress = (s, cid) => { const ls = lessonsOf(S.courses[cid]); const d = ls.filter(l => s.done.includes(l.id)).length; return {done:d,total:ls.length}; };
const overall = s => s.courses.reduce((a,c)=>{const p=courseProgress(s,c);a.done+=p.done;a.total+=p.total;return a},{done:0,total:0});
const remaining = s => Math.max(0, s.pkg.total - s.pkg.used);
const upcoming = sid => S.sessions.filter(x => (!sid || x.student===sid) && daysUntil(x.date) >= 0).sort((a,b)=> (a.date+a.time).localeCompare(b.date+b.time));
const notesFor = sid => S.notes.filter(n => !sid || n.student===sid).sort((a,b)=>b.date.localeCompare(a.date));
const assignFor = sid => S.assignments.filter(a => a.student===sid);
const nextLesson = (s, cid) => lessonsOf(S.courses[cid]).find(l => !s.done.includes(l.id));
function currentStudent(){ return ME && (ME.role==="student"||ME.role==="parent") ? stu(ME.student) : null; }
