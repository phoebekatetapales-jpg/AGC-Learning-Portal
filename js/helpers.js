/* =====================================================================
   AGC Learning Portal — Settings and small helpers (dates, money, escaping, toast).
   Scripts share one global scope and load in the order listed in index.html.
   ===================================================================== */
const LOGO = "images/logo.jpg";
const KEY = "agc-lms-v1", ME_KEY = "agc-lms-me";

/* ---------- helpers ---------- */
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const pad = n => String(n).padStart(2,"0");
const iso = d => d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate());
const dayOffset = n => { const d = new Date(); d.setDate(d.getDate()+n); return iso(d); };
const today = () => iso(new Date());
const parse = s => { const [y,m,d] = s.split("-").map(Number); return new Date(y,m-1,d); };
const fmt = s => parse(s).toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"});
const fmtLong = s => parse(s).toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"});
const fmtTime = t => { if(!t) return ""; let [h,m]=t.split(":").map(Number); const ap=h>=12?"PM":"AM"; h=h%12||12; return h+":"+pad(m)+" "+ap; };
const daysUntil = s => Math.round((parse(s) - parse(today()))/86400000);
const uid = p => p + Math.random().toString(36).slice(2,8);
function dueLabel(s){ const n=daysUntil(s); if(n<0) return {t:Math.abs(n)+" day"+(n===-1?"":"s")+" overdue",c:"warn"}; if(n===0) return {t:"Due today",c:"warn"}; if(n===1) return {t:"Due tomorrow",c:"gold"}; return {t:"Due "+fmt(s),c:""}; }
let toastT; function toast(m){ const t=document.getElementById("toast"); t.textContent=m; t.classList.add("show"); clearTimeout(toastT); toastT=setTimeout(()=>t.classList.remove("show"),2000); }
