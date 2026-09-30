/**
 * CareBridge UAE — demo dashboard (React)
 * Bilingual (EN / AR, RTL) care-navigation console for the AWS Agentic AI Hackathon.
 * Demo mode: the agent loop and tools are simulated in the browser with synthetic data.
 * To connect the real agent, replace agent.callTool() below with your AgentCore invocation.
 * Prototype only: does not diagnose, prescribe, or replace clinicians.
 *
 * Fonts: add IBM Plex Sans, IBM Plex Sans Arabic and IBM Plex Mono (Google Fonts) to index.html.
 */
import React, { useState, useEffect, useRef } from "react";

const CSS = `
/* Layout: operator console — conversation | agent activity | consent + handoff, collapsing to one column on phones */
:root{
  --bg:#EEF2F0; --surface:#FFFFFF; --sunken:#F6F8F7; --ink:#14211E; --muted:#56655F; --line:#D8E0DC;
  --accent:#0B6E69; --accent-ink:#FFFFFF; --accent-soft:#DDEFEC;
  --pause:#A8621A; --pause-soft:#FBEEDD; --danger:#B42318; --danger-soft:#FDECEA; --ok:#1B7F4B; --ok-soft:#E3F3EA;
  --font-body:"IBM Plex Sans","IBM Plex Sans Arabic",system-ui,-apple-system,"Segoe UI",sans-serif;
  --font-ar:"IBM Plex Sans Arabic","IBM Plex Sans",Tahoma,sans-serif;
  --font-mono:"IBM Plex Mono",ui-monospace,SFMono-Regular,Menlo,monospace;
  --r:10px;
}
@media (prefers-color-scheme: dark){:root:not([data-theme="light"]){
  --bg:#0D1412; --surface:#151F1C; --sunken:#111A17; --ink:#E4ECE9; --muted:#95A6A0; --line:#27352F;
  --accent:#43B8AD; --accent-ink:#06201D; --accent-soft:#16312D;
  --pause:#E4A55A; --pause-soft:#33271A; --danger:#F07A72; --danger-soft:#3A1D1B; --ok:#55C58D; --ok-soft:#173026; color-scheme:dark}}
:root[data-theme="dark"]{
  --bg:#0D1412; --surface:#151F1C; --sunken:#111A17; --ink:#E4ECE9; --muted:#95A6A0; --line:#27352F;
  --accent:#43B8AD; --accent-ink:#06201D; --accent-soft:#16312D;
  --pause:#E4A55A; --pause-soft:#33271A; --danger:#F07A72; --danger-soft:#3A1D1B; --ok:#55C58D; --ok-soft:#173026; color-scheme:dark}

*{box-sizing:border-box}
body{background:var(--bg);color:var(--ink);font-family:var(--font-body);font-size:14px;line-height:1.5}
html[lang="ar"] body{font-family:var(--font-ar)}
.wrap{max-width:1440px;margin-inline:auto;padding-inline:16px;padding-block:14px 28px;display:flex;flex-direction:column;gap:14px}
button{font:inherit;cursor:pointer}
button:focus-visible,input:focus-visible,textarea:focus-visible,label:focus-within{outline:2px solid var(--accent);outline-offset:2px}
.mono{font-family:var(--font-mono)}

/* header */
header.top{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px}
.brand{display:flex;align-items:center;gap:12px;min-width:0}
.mark{width:38px;height:38px;border-radius:9px;background:var(--accent);display:grid;place-items:center;flex:none}
.mark svg{width:22px;height:22px}
.brand h1{margin:0;font-size:19px;font-weight:700;letter-spacing:-.01em}
.brand p{margin:0;color:var(--muted);font-size:12.5px}
.controls{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
.seg{display:inline-flex;border:1px solid var(--line);border-radius:8px;overflow:hidden;background:var(--surface)}
.seg button{border:0;background:transparent;color:var(--muted);padding:6px 12px;font-weight:500}
.seg button[aria-pressed="true"]{background:var(--accent);color:var(--accent-ink)}
.btn{border:1px solid var(--line);background:var(--surface);color:var(--ink);padding:6px 12px;border-radius:8px;font-weight:500}
.btn:hover{border-color:var(--accent)}
.btn.primary{background:var(--accent);color:var(--accent-ink);border-color:var(--accent)}
.btn.primary:disabled{opacity:.45;cursor:not-allowed}
.btn.ghost{background:transparent}
.notice{display:flex;flex-wrap:wrap;gap:6px 14px;align-items:center;font-size:12px;color:var(--muted);background:var(--surface);border:1px dashed var(--line);border-radius:8px;padding:7px 12px}
.notice b{color:var(--pause);font-weight:600;letter-spacing:.04em;text-transform:uppercase;font-size:11px}

/* stats */
.stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}
.stat{background:var(--surface);border:1px solid var(--line);border-radius:var(--r);padding:10px 14px;min-width:0}
.stat .k{font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.06em}
html[lang="ar"] .stat .k{letter-spacing:0}
.stat .v{font-size:20px;font-weight:600;font-variant-numeric:tabular-nums;margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.stat .v small{font-size:12px;color:var(--muted);font-weight:400}
.pill{display:inline-flex;align-items:center;gap:6px;font-size:13px;font-weight:600;padding:3px 10px;border-radius:999px;background:var(--sunken);color:var(--muted)}
.pill::before{content:"";width:7px;height:7px;border-radius:50%;background:currentColor}
.pill.ok{background:var(--ok-soft);color:var(--ok)} .pill.danger{background:var(--danger-soft);color:var(--danger)}
.pill.pause{background:var(--pause-soft);color:var(--pause)} .pill.accent{background:var(--accent-soft);color:var(--accent)}

/* grid */
.grid{display:grid;grid-template-columns:minmax(0,1.25fr) minmax(0,.95fr) minmax(0,1.2fr);gap:14px;align-items:start}
.panel{background:var(--surface);border:1px solid var(--line);border-radius:var(--r);display:flex;flex-direction:column;min-width:0}
.panel>h2{margin:0;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.07em;color:var(--muted);padding:12px 14px;border-bottom:1px solid var(--line);display:flex;justify-content:space-between;align-items:center;gap:8px}
html[lang="ar"] .panel>h2{letter-spacing:0;font-size:13px}
.col{display:flex;flex-direction:column;gap:14px;min-width:0}

/* chat */
.chat{height:min(680px,calc(100vh - 230px));min-height:520px}
.msgs{flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:10px}
.msg{max-width:88%;padding:9px 12px;border-radius:12px;white-space:pre-wrap;overflow-wrap:anywhere}
.msg.user{align-self:flex-end;background:var(--accent);color:var(--accent-ink);border-end-end-radius:4px}
.msg.agent{align-self:flex-start;background:var(--sunken);border:1px solid var(--line);border-end-start-radius:4px}
.msg.agent .who{font-size:11px;font-weight:600;color:var(--accent);margin-bottom:3px;display:block}
.msg.refusal{border-inline-start:3px solid var(--danger)}
.msg.urgent{background:var(--danger-soft);border:1px solid var(--danger);max-width:100%}
.msg.urgent .who{color:var(--danger)}
.msg.urgent .call{display:inline-block;margin-top:8px;font-weight:700;font-size:18px;color:var(--danger)}
.note{font-size:12px;color:var(--muted);margin-top:6px;display:block}
.typing{align-self:flex-start;color:var(--muted);font-size:12.5px;display:flex;gap:6px;align-items:center}
.dots span{display:inline-block;width:5px;height:5px;border-radius:50%;background:var(--muted);margin-inline:1px;animation:b 1s infinite}
.dots span:nth-child(2){animation-delay:.15s}.dots span:nth-child(3){animation-delay:.3s}
@keyframes b{0%,80%,100%{opacity:.25}40%{opacity:1}}
.opts{display:grid;gap:8px;margin-top:8px}
.opt{text-align:start;border:1px solid var(--line);background:var(--surface);border-radius:9px;padding:9px 11px;display:grid;grid-template-columns:1fr auto;gap:2px 10px;color:var(--ink)}
.opt:hover:not(:disabled){border-color:var(--accent)}
.opt:disabled{opacity:.55;cursor:default}
.opt.sel{border-color:var(--accent);box-shadow:inset 0 0 0 1px var(--accent)}
.opt .n{font-weight:600}.opt .t{font-weight:600;color:var(--accent);font-variant-numeric:tabular-nums;white-space:nowrap}
.opt .m{grid-column:1/-1;font-size:12px;color:var(--muted)}
.confirm{margin-top:8px;border:1px solid var(--pause);background:var(--pause-soft);border-radius:9px;padding:10px 12px}
.confirm .h{font-size:11px;font-weight:700;color:var(--pause);text-transform:uppercase;letter-spacing:.06em;display:flex;gap:6px;align-items:center}
.confirm .row{display:flex;gap:8px;margin-top:8px;flex-wrap:wrap}
.scen{padding:10px 14px 0;display:flex;flex-wrap:wrap;gap:6px;align-items:center;border-top:1px solid var(--line)}
.scen .lbl{font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.06em;margin-inline-end:4px}
.chip{border:1px solid var(--line);background:var(--sunken);color:var(--ink);border-radius:999px;padding:4px 10px;font-size:12.5px}
.chip:hover:not(:disabled){border-color:var(--accent);color:var(--accent)}
.chip.warn{color:var(--danger)}
.composer{display:flex;gap:8px;padding:10px 14px 14px}
.composer textarea{flex:1;min-width:0;resize:none;border:1px solid var(--line);background:var(--sunken);color:var(--ink);border-radius:9px;padding:9px 11px;font:inherit;height:44px}

/* activity */
.steps{list-style:none;margin:0;padding:10px 14px 12px;display:flex;flex-direction:column}
.step{display:grid;grid-template-columns:22px 1fr auto;gap:10px;align-items:start;padding:6px 0;position:relative}
.step:not(:last-child)::after{content:"";position:absolute;inset-inline-start:10px;top:28px;bottom:-6px;width:2px;background:var(--line)}
.dot{width:22px;height:22px;border-radius:50%;border:2px solid var(--line);background:var(--surface);display:grid;place-items:center;font-size:11px;font-weight:700;color:var(--muted);z-index:1}
.step.done .dot{background:var(--ok);border-color:var(--ok);color:var(--surface)}
.step.active .dot{border-color:var(--accent);box-shadow:0 0 0 4px var(--accent-soft)}
.step.wait .dot{background:var(--pause);border-color:var(--pause);color:var(--surface)}
.step.alert .dot{background:var(--danger);border-color:var(--danger);color:var(--surface)}
.step.skip{opacity:.45}
.step .code{font-family:var(--font-mono);font-size:11.5px;font-weight:500;overflow-wrap:anywhere}
.step .desc{font-size:12px;color:var(--muted)}
.step .ms{font-family:var(--font-mono);font-size:11px;color:var(--muted);font-variant-numeric:tabular-nums}
.trace{border-top:1px solid var(--line);padding:10px 14px 14px;display:flex;flex-direction:column;gap:6px;max-height:240px;overflow-y:auto}
.trace .empty{color:var(--muted);font-size:12.5px}
.tr{font-family:var(--font-mono);font-size:11.5px;display:grid;grid-template-columns:1fr auto;gap:8px;padding:6px 8px;border-radius:6px;background:var(--sunken);direction:ltr;text-align:left}
.tr .fn{color:var(--accent);font-weight:500;overflow-wrap:anywhere}
.tr .fn i{color:var(--muted);font-style:normal}
.tr.gate{background:var(--pause-soft)} .tr.gate .fn{color:var(--pause)}
.tr.block{background:var(--danger-soft)} .tr.block .fn{color:var(--danger)}
.mem{padding:10px 14px 14px;display:grid;grid-template-columns:auto 1fr;gap:6px 12px;font-size:12.5px}
.mem dt{color:var(--muted)} .mem dd{margin:0;font-weight:500;overflow-wrap:anywhere}
.mem .foot{grid-column:1/-1;font-size:11.5px;color:var(--muted);border-top:1px dashed var(--line);padding-top:8px;margin-top:2px}

/* consent */
.consent{padding:12px 14px 14px;display:flex;flex-direction:column;gap:10px}
.consent h3{margin:0;font-size:12px;color:var(--muted);font-weight:600}
.ck{display:flex;gap:10px;align-items:flex-start;padding:7px 9px;border-radius:8px;border:1px solid var(--line);cursor:pointer}
.ck input{margin-top:3px;accent-color:var(--accent);width:16px;height:16px;flex:none}
.ck.on{background:var(--accent-soft);border-color:transparent}
.ck.extra.on{background:var(--pause-soft)}
.purpose{display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap;font-size:12.5px;color:var(--muted)}
.purpose b{color:var(--ink)}
.consent .hint{font-size:12px;color:var(--muted)}

/* handoff */
.tabs{display:flex;gap:4px;padding:10px 14px 0;border-bottom:1px solid var(--line)}
.tab{border:0;background:transparent;color:var(--muted);padding:7px 10px;border-bottom:2px solid transparent;font-weight:500}
.tab[aria-selected="true"]{color:var(--accent);border-bottom-color:var(--accent)}
.doc{padding:14px;display:flex;flex-direction:column;gap:10px;font-size:13px}
.doc .emptyst{color:var(--muted);text-align:center;padding:28px 10px;border:1px dashed var(--line);border-radius:9px}
.doc h4{margin:0;font-size:15px}
.doc .sec{display:grid;gap:2px}
.doc .sec .l{font-size:11px;font-weight:600;color:var(--muted);text-transform:uppercase;letter-spacing:.05em}
.doc[dir="rtl"] .sec .l{letter-spacing:0;font-size:12px}
.doc[dir="rtl"]{font-family:var(--font-ar);font-size:14px}
.doc ul{margin:0;padding-inline-start:18px}
.doc .safety{border-inline-start:3px solid var(--danger);background:var(--danger-soft);padding:8px 10px;border-radius:6px;font-size:12.5px}
.doc .added{background:var(--pause-soft);border-radius:6px;padding:6px 8px}
.docbar{display:flex;justify-content:space-between;gap:8px;align-items:center;flex-wrap:wrap;font-size:11.5px;color:var(--muted)}
footer.fine{font-size:12px;color:var(--muted);text-align:center}

@media (max-width:1180px){.grid{grid-template-columns:minmax(0,1fr) minmax(0,1fr)}.grid>.col.right{grid-column:1/-1;display:grid;grid-template-columns:1fr 1fr}}
@media (max-width:760px){.grid{grid-template-columns:minmax(0,1fr)}.grid>.col.right{display:flex}.stats{grid-template-columns:repeat(2,minmax(0,1fr))}.chat{height:auto;min-height:0}.msgs{max-height:520px;min-height:300px}.msg{max-width:95%}}
@media (prefers-reduced-motion:reduce){.dots span{animation:none}}
`;

const T = {
en:{
 tagline:"Safe next steps. The right story at the right appointment.",
 reset:"Start over", demoTag:"Demo mode", demoText:"Simulated agent and mock tools · synthetic patient data only · not medical advice",
 sRoute:"Route", sTools:"Tool calls", sTime:"Symptoms → handoff", sShared:"Shared with clinician",
 pChat:"Conversation", pActivity:"Agent activity", pMemory:"AgentCore Memory", pConsent:"Care snapshot", pHandoff:"Handoff",
 patient:"Gary · synthetic profile", send:"Send", placeholder:"Describe how you feel…", scenarios:"Try",
 tabEn:"Clinician · English", tabAr:"Patient / caregiver · العربية",
 rNone:"Not started", rRoutine:"Routine booking", rUrgent:"Urgent escalation", rRefused:"Refused request", rClarify:"Clarifying",
 of:"of", idle:"Idle", thinking:"Reasoning", waiting:"Waiting for Gary", done:"Complete", stopped:"Stopped",
 agent:"CareBridge", typing:"CareBridge is working",
 notTrig:"not triggered", skipped:"skipped",
 ev:{TRIAGE_GUIDANCE_RETRIEVED:"Approved triage guidance retrieved",RELEVANT_CONTEXT_RETRIEVED:"Minimum-necessary context retrieved",
  MEDICATION_REFERENCE_CHECKED:"Medication reference checked",PROVIDER_OPTIONS_FOUND:"Mock provider options found",
  BOOKING_AWAITING_CONFIRMATION:"Waiting for explicit confirmation",MOCK_BOOKING_CONFIRMED:"Mock booking confirmed",
  VISIT_SUMMARY_GENERATED:"Bilingual handoff generated",URGENT_ESCALATION_SHOWN:"Urgent / emergency escalation shown"},
 traceEmpty:"Tool calls appear here. Arguments containing health data are redacted (•••).",
 mLang:"Language", mConsent:"Consent", mAppt:"Appointment", mNext:"Next action",
 memFoot:"Only these four fields are stored. Symptoms, history, medicines and allergies are never written to memory.",
 consentLimited:(n)=>`Limited handoff · ${n} items`, cPending:"Awaiting booking", cReady:"Ready to approve", cApproved:"Approved",
 share:"Share", dontShare:"Not shared by default", purpose:"Purpose", purposeV:"this mock appointment only",
 cItems:{symptoms:"Symptoms and symptom timeline",meds:"Current medicines and allergies",history:"Relevant medical history for this concern",medflag:"Medication-reference question for clinician / pharmacist",fullHistory:"Full consultation history",family:"Full family history",unrelated:"Unrelated historical notes"},
 approve:"Approve snapshot & generate handoff", approveHint:"Available after a booking is confirmed. Changes after approval update the handoff instantly.",
 hEmpty:"The handoff appears here after Gary confirms a booking and approves the care snapshot.",
 copy:"Copy", copied:"Copied", proto:"Synthetic data · prototype",
 chips:[["happy","Headache + blurry vision"],["vague","Symptoms, no duration"],["red","Red-flag symptoms"],["dose","Ask for a dose"],["dx","Ask for a diagnosis"],["next","What is my next step?"]],
 msgs:{
  happy:"I have had a headache and blurry vision for three days.",
  vague:"I have a headache and my vision is blurry.",
  red:"My headache suddenly became severe, my vision is getting worse, and I feel weak on one side.",
  dose:"Tell me what medication and dose I should take.",
  dx:"What is my diagnosis? Is this a migraine or a stroke?",
  next:"What is my next step?"},
 a:{
  clarify:"To find the right next step, how long have you had these symptoms?",
  routine:"Based on the approved triage guidance, a headache with blurry vision lasting more than 24 hours, in someone with high blood pressure, should be assessed by a clinician today or tomorrow.\n\nI found three mock neurology appointments within 24 hours. Choose one and I will ask you to confirm before booking anything.",
  medflag:"Medication reference note for your clinician or pharmacist: your profile lists ibuprofen as needed alongside amlodipine. The reference lists NSAIDs as possibly affecting blood-pressure control. I added this as a question for your appointment. I can't advise starting, stopping or changing any medicine.",
  safety:"This is not medical advice. If symptoms suddenly get worse, call 998 or go to the nearest emergency department.",
  confirmQ:(p)=>`Book ${p.doc} at ${p.clinic}, ${p.when}?`, confirmH:"Explicit confirmation required",
  confirmYes:"Confirm mock booking", confirmNo:"Choose another",
  booked:(r,p)=>`Booked (mock). Reference ${r} with ${p.doc}, ${p.when}.\n\nNext: review what will be shared in the Care snapshot panel, then approve it to generate your handoff.`,
  cancelled:"No problem. Nothing was booked. Choose another option above.",
  handoff:"Your handoff is ready: an English summary for the clinician and an Arabic summary for you or your caregiver. I remembered only your language, consent choice, appointment reference and next step.",
  urgent:"I can't diagnose, but what you describe (sudden severe headache, worsening vision, weakness on one side) matches the emergency criteria in the approved triage guidance.\n\nDo not wait for a routine appointment. I have not booked anything.",
  urgentCall:"Call 998 now, or go to the nearest emergency department.",
  dose:"I can't recommend a medication or a dose. That decision needs a licensed healthcare professional. I can help you find appropriate care, prepare a summary for your appointment, or explain the next navigation step. If symptoms are worsening or feel urgent, please seek urgent or emergency care. This is not medical advice.",
  dx:"I can't diagnose or say what might be causing your symptoms. A licensed clinician needs to assess you. I can help you find appropriate care or prepare a summary for your appointment. If symptoms are worsening or feel urgent, please seek urgent or emergency care. This is not medical advice.",
  nextBooked:(b)=>`Your next step: attend your mock appointment ${b.ref} with ${b.p.doc}, ${b.p.when}, and bring your handoff. If symptoms get worse before then, call 998.`,
  nextNone:"You don't have an appointment yet. Tell me your symptoms and how long you've had them, and I'll find the right next step.",
  pickFirst:"Choose one of the appointment options first, then I'll ask you to confirm.",
  fallback:"I help with care navigation. Describe your symptoms and how long you've had them, and I'll find the right next step. This is not medical advice."},
 footer:"Prototype uses synthetic data and simulated provider tools. CareBridge UAE supports healthcare navigation; it does not diagnose, prescribe, or replace clinicians."
},
ar:{
 tagline:"خطوات آمنة تالية. القصة الصحيحة في الموعد الصحيح.",
 reset:"البدء من جديد", demoTag:"وضع العرض", demoText:"وكيل وأدوات محاكاة · بيانات مرضى اصطناعية فقط · ليست نصيحة طبية",
 sRoute:"المسار", sTools:"استدعاءات الأدوات", sTime:"من الأعراض إلى الملخص", sShared:"تمت مشاركته مع الطبيب",
 pChat:"المحادثة", pActivity:"نشاط الوكيل", pMemory:"ذاكرة AgentCore", pConsent:"لقطة الرعاية", pHandoff:"ملخص التسليم",
 patient:"غاري · ملف اصطناعي", send:"إرسال", placeholder:"صف ما تشعر به…", scenarios:"جرّب",
 tabEn:"الطبيب · English", tabAr:"المريض ومقدم الرعاية · العربية",
 rNone:"لم يبدأ", rRoutine:"حجز روتيني", rUrgent:"تصعيد عاجل", rRefused:"طلب مرفوض", rClarify:"استيضاح",
 of:"من", idle:"خامل", thinking:"يفكّر", waiting:"بانتظار غاري", done:"مكتمل", stopped:"متوقف",
 agent:"كير بريدج", typing:"كير بريدج يعمل",
 notTrig:"لم يُفعَّل", skipped:"تم التخطي",
 ev:{TRIAGE_GUIDANCE_RETRIEVED:"تم استرجاع إرشادات الفرز المعتمدة",RELEVANT_CONTEXT_RETRIEVED:"تم استرجاع الحد الأدنى من السياق",
  MEDICATION_REFERENCE_CHECKED:"تم فحص مرجع الأدوية",PROVIDER_OPTIONS_FOUND:"تم العثور على مقدمي رعاية تجريبيين",
  BOOKING_AWAITING_CONFIRMATION:"بانتظار تأكيد صريح",MOCK_BOOKING_CONFIRMED:"تم تأكيد الحجز التجريبي",
  VISIT_SUMMARY_GENERATED:"تم إنشاء الملخص ثنائي اللغة",URGENT_ESCALATION_SHOWN:"تم عرض التصعيد العاجل / الطارئ"},
 traceEmpty:"تظهر استدعاءات الأدوات هنا. يتم إخفاء أي بيانات صحية في المعاملات (•••).",
 mLang:"اللغة", mConsent:"الموافقة", mAppt:"الموعد", mNext:"الخطوة التالية",
 memFoot:"تُحفظ هذه الحقول الأربعة فقط. لا تُكتب الأعراض أو التاريخ الطبي أو الأدوية أو الحساسية في الذاكرة أبداً.",
 consentLimited:(n)=>`مشاركة محدودة · ${n} عناصر`, cPending:"بانتظار الحجز", cReady:"جاهز للموافقة", cApproved:"تمت الموافقة",
 share:"مشاركة", dontShare:"لا تتم مشاركته افتراضياً", purpose:"الغرض", purposeV:"هذا الموعد التجريبي فقط",
 cItems:{symptoms:"الأعراض وتسلسلها الزمني",meds:"الأدوية الحالية والحساسية",history:"التاريخ الطبي ذو الصلة بهذه الحالة",medflag:"سؤال مرجعي حول الأدوية للطبيب أو الصيدلي",fullHistory:"سجل الاستشارات الكامل",family:"التاريخ العائلي الكامل",unrelated:"الملاحظات السابقة غير ذات الصلة"},
 approve:"الموافقة على اللقطة وإنشاء الملخص", approveHint:"متاح بعد تأكيد الحجز. أي تغيير بعد الموافقة يُحدّث الملخص فوراً.",
 hEmpty:"يظهر ملخص التسليم هنا بعد أن يؤكد غاري الحجز ويوافق على لقطة الرعاية.",
 copy:"نسخ", copied:"تم النسخ", proto:"بيانات اصطناعية · نموذج أولي",
 chips:[["happy","صداع وتشوش في الرؤية"],["vague","أعراض بدون مدة"],["red","أعراض خطرة"],["dose","طلب جرعة دواء"],["dx","طلب تشخيص"],["next","ما هي خطوتي التالية؟"]],
 msgs:{
  happy:"أعاني من صداع وتشوش في الرؤية منذ ثلاثة أيام.",
  vague:"أعاني من صداع ورؤيتي مشوشة.",
  red:"أصبح الصداع فجأة شديداً، ورؤيتي تزداد سوءاً، وأشعر بضعف في جانب واحد.",
  dose:"أخبرني ما الدواء والجرعة التي يجب أن أتناولها.",
  dx:"ما هو تشخيصي؟ هل هذا صداع نصفي أم سكتة دماغية؟",
  next:"ما هي خطوتي التالية؟"},
 a:{
  clarify:"لتحديد الخطوة التالية المناسبة، منذ متى تعاني من هذه الأعراض؟",
  routine:"وفقاً لإرشادات الفرز المعتمدة، يُنصح بأن يقيّم الطبيبُ الصداعَ المصحوب بتشوش الرؤية الذي يستمر أكثر من 24 ساعة لدى شخص يعاني من ارتفاع ضغط الدم، خلال اليوم أو الغد.\n\nوجدت ثلاثة مواعيد تجريبية في طب الأعصاب خلال 24 ساعة. اختر موعداً وسأطلب تأكيدك قبل حجز أي شيء.",
  medflag:"ملاحظة مرجعية للطبيب أو الصيدلي: يذكر ملفك تناول الإيبوبروفين عند الحاجة مع أملوديبين. ويشير المرجع إلى أن مضادات الالتهاب غير الستيرويدية قد تؤثر على التحكم في ضغط الدم. أضفت ذلك كسؤال لموعدك. لا يمكنني تقديم نصيحة ببدء أي دواء أو إيقافه أو تغييره.",
  safety:"هذه ليست نصيحة طبية. إذا ساءت الأعراض فجأة، اتصل بالرقم 998 أو توجّه إلى أقرب قسم طوارئ.",
  confirmQ:(p)=>`هل تريد الحجز مع ${p.docAr} في ${p.clinicAr}، ${p.whenAr}؟`, confirmH:"مطلوب تأكيد صريح",
  confirmYes:"تأكيد الحجز التجريبي", confirmNo:"اختيار موعد آخر",
  booked:(r,p)=>`تم الحجز (تجريبي). الرقم المرجعي ${r} مع ${p.docAr}، ${p.whenAr}.\n\nالخطوة التالية: راجع ما ستتم مشاركته في لوحة لقطة الرعاية، ثم وافق عليه لإنشاء ملخص التسليم.`,
  cancelled:"لا مشكلة. لم يتم حجز أي موعد. اختر خياراً آخر من الأعلى.",
  handoff:"ملخص التسليم جاهز: ملخص بالإنجليزية للطبيب وملخص بالعربية لك أو لمقدم الرعاية. احتفظت فقط بلغتك وخيار الموافقة ورقم الموعد والخطوة التالية.",
  urgent:"لا يمكنني التشخيص، لكن ما تصفه (صداع شديد مفاجئ، وتدهور الرؤية، وضعف في جانب واحد) يطابق معايير الطوارئ في إرشادات الفرز المعتمدة.\n\nلا تنتظر موعداً روتينياً. لم أقم بحجز أي موعد.",
  urgentCall:"اتصل الآن بالرقم 998، أو توجّه إلى أقرب قسم طوارئ.",
  dose:"لا يمكنني التوصية بدواء أو جرعة. هذا القرار يحتاج إلى أخصائي رعاية صحية مرخّص. يمكنني مساعدتك في إيجاد الرعاية المناسبة، أو إعداد ملخص لموعدك، أو شرح خطوة التوجيه التالية. إذا كانت الأعراض تزداد سوءاً أو تبدو طارئة، يُرجى طلب الرعاية العاجلة أو الطارئة. هذه ليست نصيحة طبية.",
  dx:"لا يمكنني التشخيص أو تحديد السبب المحتمل لأعراضك. يجب أن يقيّمك طبيب مرخّص. يمكنني مساعدتك في إيجاد الرعاية المناسبة أو إعداد ملخص لموعدك. إذا كانت الأعراض تزداد سوءاً أو تبدو طارئة، يُرجى طلب الرعاية العاجلة أو الطارئة. هذه ليست نصيحة طبية.",
  nextBooked:(b)=>`خطوتك التالية: حضور موعدك التجريبي ${b.ref} مع ${b.p.docAr}، ${b.p.whenAr}، وإحضار ملخص التسليم. إذا ساءت الأعراض قبل ذلك، اتصل بالرقم 998.`,
  nextNone:"لا يوجد لديك موعد بعد. أخبرني بأعراضك ومنذ متى تعاني منها، وسأحدد الخطوة التالية المناسبة.",
  pickFirst:"اختر أحد المواعيد أولاً، ثم سأطلب تأكيدك.",
  fallback:"أساعدك في التوجيه إلى الرعاية المناسبة. صف أعراضك ومنذ متى تعاني منها، وسأحدد الخطوة التالية. هذه ليست نصيحة طبية."},
 footer:"يستخدم النموذج الأولي بيانات اصطناعية وأدوات مقدمي رعاية محاكاة. يدعم كير بريدج الإمارات التوجيه الصحي؛ ولا يقوم بالتشخيص أو وصف الأدوية أو استبدال الأطباء."
}};

/* ---------------- synthetic data (mock starter-kit records) ---------------- */
const PATIENT = {
  history:"Hypertension (since 2019)", historyAr:"ارتفاع ضغط الدم (منذ 2019)",
  meds:["Amlodipine 5 mg once daily","Ibuprofen as needed (self-reported, over the counter)"],
  medsAr:["أملوديبين 5 ملغ مرة يومياً","إيبوبروفين عند الحاجة (بإفادة المريض، دون وصفة)"],
  allergies:"Penicillin", allergiesAr:"البنسلين",
  fullHistory:["2019-03 · GP: hypertension diagnosed","2024-11 · GP: blood-pressure review"],
  fullHistoryAr:["2019-03 · طبيب عام: تشخيص ارتفاع ضغط الدم","2024-11 · طبيب عام: مراجعة ضغط الدم"],
  family:"Father: hypertension · Mother: type 2 diabetes", familyAr:"الأب: ارتفاع ضغط الدم · الأم: السكري من النوع الثاني",
  unrelated:"2016 · Knee arthroscopy", unrelatedAr:"2016 · تنظير الركبة"
};
const PROVIDERS = [
  {id:"PRV-NEU-014",doc:"Dr. Khalid Al Mansouri",docAr:"د. خالد المنصوري",clinic:"Creek Neurology Clinic",clinicAr:"عيادة الخور للأعصاب",area:"Dubai Healthcare City",areaAr:"مدينة دبي الطبية",when:"today 4:30 PM",whenAr:"اليوم 4:30 مساءً",short:"4:30 PM",km:6.2,langs:"Arabic, English",langsAr:"العربية، الإنجليزية"},
  {id:"PRV-NEU-027",doc:"Dr. Priya Nair",docAr:"د. بريا ناير",clinic:"Al Barsha Medical Centre",clinicAr:"مركز البرشاء الطبي",area:"Al Barsha",areaAr:"البرشاء",when:"tomorrow 10:00 AM",whenAr:"غداً 10:00 صباحاً",short:"10:00 AM",km:9.8,langs:"English, Hindi, Malayalam",langsAr:"الإنجليزية، الهندية، المالايالامية"},
  {id:"PRV-NEU-031",doc:"Dr. Omar Haddad",docAr:"د. عمر حداد",clinic:"Jumeirah Specialist Clinic",clinicAr:"عيادة جميرا التخصصية",area:"Jumeirah",areaAr:"جميرا",when:"tomorrow 2:00 PM",whenAr:"غداً 2:00 مساءً",short:"2:00 PM",km:12.4,langs:"Arabic, English, French",langsAr:"العربية، الإنجليزية، الفرنسية"}
];


const EVENTS = ["TRIAGE_GUIDANCE_RETRIEVED","RELEVANT_CONTEXT_RETRIEVED","MEDICATION_REFERENCE_CHECKED","PROVIDER_OPTIONS_FOUND","BOOKING_AWAITING_CONFIRMATION","MOCK_BOOKING_CONFIRMED","VISIT_SUMMARY_GENERATED","URGENT_ESCALATION_SHOWN"];
const SHARE_KEYS = ["symptoms","meds","history","medflag"];
const EXTRA_KEYS = ["fullHistory","family","unrelated"];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const now = () => performance.now();
const DUR = /(\d|day|week|hour|since|yesterday|ثلاث|يوم|أيام|ساع|أسبوع|أمس)/;

/* ------------------------------------------------------------------
   Agent adapter. Demo mode simulates the Strands loop in the browser.
   To go live, replace callTool() with a call to your backend that invokes
   AgentCore Runtime, and map the returned activity events onto onEvent().
------------------------------------------------------------------- */
const agent = {
  async callTool(name, args, ms) { await sleep(ms); return { ok: true }; },
};

function classify(txt, awaitingDuration) {
  const t = txt.toLowerCase();
  if (/(sudden|suddenly|worst|one side|weak|numb|slurred|speech|faint|confus|فجأة|ضعف|جانب واحد|خدر|إغماء)/.test(t)) return "red";
  if (/(dose|dosage|medication should|medicine should|what medication|which medication|should i take|prescri|stop my medication|twice my|جرعة|وصف|ما الدواء|أي دواء)/.test(t)) return "dose";
  if (/(diagnos|what is wrong|is this a|is it a|migraine|stroke|dehydrat|what's causing|تشخيص|سكتة|صداع نصفي|ما السبب)/.test(t)) return "dx";
  if (/(next step|what now|what should i do next|خطوتي التالية|الخطوة التالية)/.test(t)) return "next";
  if (/(book|4:30|confirm|yes|نعم|أكد|احجز)/.test(t)) return "book";
  if (awaitingDuration && DUR.test(t)) return "duration";
  if (/(headache|vision|blur|pain|dizz|nause|صداع|رؤية|الرؤية|تشوش|مشوشة|ألم|دوار)/.test(t)) return DUR.test(t) ? "symptoms" : "vague";
  return "other";
}

const initial = (lang = "en") => ({
  lang, tab: lang, route: null, loop: "idle", tools: 0, t0: null, t1: null,
  ev: {}, trace: [], msgs: [], busy: false, typing: false, awaitingDuration: false,
  optionsShown: false, selected: null, booking: null, approved: false,
  consent: { symptoms: true, meds: true, history: true, medflag: true, fullHistory: false, family: false, unrelated: false },
  memory: null,
});
const sharedCount = (c) => [...SHARE_KEYS, ...EXTRA_KEYS].filter((k) => c[k]).length;
const fmt = (ms) => { const s = Math.max(0, Math.floor(ms / 1000)); return String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0"); };

/* ---------------- small components ---------------- */
function Pill({ tone = "", children, style }) { return <span className={"pill " + tone} style={style}>{children}</span>; }

function Stats({ s, l, clock }) {
  const route = { null: ["", l.rNone], clarify: ["pause", l.rClarify], routine: ["ok", l.rRoutine], urgent: ["danger", l.rUrgent], refused: ["danger", l.rRefused] }[s.route];
  let elapsed = "00:00";
  if (s.t0) {
    const end = s.t1 || (s.route === "urgent" ? s.t0 + (s.ev.URGENT_ESCALATION_SHOWN?.at || 0) : clock);
    elapsed = fmt(end - s.t0);
  }
  return (
    <section className="stats" aria-label="Session summary">
      <div className="stat"><div className="k">{l.sRoute}</div><div className="v"><Pill tone={route[0]}>{route[1]}</Pill></div></div>
      <div className="stat"><div className="k">{l.sTools}</div><div className="v">{s.tools}</div></div>
      <div className="stat"><div className="k">{l.sTime}</div><div className="v">{elapsed} {s.t1 && <Pill tone="ok" style={{ fontSize: 11 }}>✓</Pill>}</div></div>
      <div className="stat"><div className="k">{l.sShared}</div><div className="v">{sharedCount(s.consent)} <small>{l.of} 7</small></div></div>
    </section>
  );
}

function ProviderOptions({ s, l, onPick }) {
  const ar = s.lang === "ar";
  return (
    <div className="msg agent" style={{ maxWidth: "100%", width: "100%" }}>
      <span className="who">{l.agent} · search_providers</span>
      <div className="opts">
        {PROVIDERS.map((p) => (
          <button key={p.id} type="button" className={"opt" + (s.selected?.id === p.id ? " sel" : "")}
            disabled={!!s.booking || s.route === "urgent"} onClick={() => onPick(p)}>
            <span className="n">{ar ? p.docAr : p.doc}</span><span className="t">{ar ? p.whenAr : p.when}</span>
            <span className="m">{ar ? p.clinicAr : p.clinic} · {ar ? p.areaAr : p.area} · {p.km} {ar ? "كم" : "km"} · {ar ? p.langsAr : p.langs} · {ar ? "مقدم تجريبي" : "mock provider"}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function Message({ m, s, l, actions }) {
  const a = l.a;
  if (m.role === "user") return <div className="msg user" dir="auto">{m.text}</div>;
  if (m.type === "options") return <ProviderOptions s={s} l={l} onPick={actions.pick} />;
  if (m.type === "confirm") {
    if (!s.selected) return null;
    return (
      <div className="msg agent" style={{ maxWidth: "100%", width: "100%" }}>
        <span className="who">{l.agent}</span>
        <div className="confirm">
          <div className="h">⏸ {a.confirmH}</div>
          <div>{a.confirmQ(s.selected)}</div>
          <div className="row">
            <button type="button" className="btn primary" onClick={actions.confirm}>{a.confirmYes}</button>
            <button type="button" className="btn ghost" onClick={actions.cancel}>{a.confirmNo}</button>
          </div>
        </div>
      </div>
    );
  }
  if (m.type === "urgent") return (
    <div className="msg agent urgent" role="alert">
      <span className="who">{l.agent} · URGENT_ESCALATION_SHOWN</span>{a.urgent}<br />
      <span className="call">{a.urgentCall}</span><span className="note">{a.safety}</span>
    </div>
  );
  let text = a[m.k];
  if (m.k === "booked") text = a.booked(s.booking.ref, s.booking.p);
  if (m.k === "nextBooked") text = a.nextBooked(s.booking);
  return (
    <div className={"msg agent" + (m.refusal ? " refusal" : "")}>
      <span className="who">{l.agent}</span>{text}{m.safety && <span className="note">{a.safety}</span>}
    </div>
  );
}

function Chat({ s, l, actions }) {
  const box = useRef(null);
  const [draft, setDraft] = useState("");
  useEffect(() => { if (box.current) box.current.scrollTop = box.current.scrollHeight; }, [s.msgs, s.typing, s.selected]);
  const submit = (e) => { e.preventDefault(); const v = draft; setDraft(""); actions.send(v); };
  return (
    <section className="panel chat" aria-label="Conversation">
      <h2><span>{l.pChat}</span><Pill tone="accent">{l.patient}</Pill></h2>
      <div className="msgs" ref={box} aria-live="polite">
        {!s.msgs.length && <div className="msg agent"><span className="who">{l.agent}</span>{l.a.fallback}</div>}
        {s.msgs.map((m, i) => <Message key={i} m={m} s={s} l={l} actions={actions} />)}
        {s.typing && <div className="typing"><span className="dots"><span /><span /><span /></span>{l.typing}</div>}
      </div>
      <div className="scen">
        <span className="lbl">{l.scenarios}</span>
        {l.chips.map(([k, v]) => (
          <button key={k} type="button" className={"chip" + (k === "red" ? " warn" : "")} disabled={s.busy} onClick={() => actions.send(l.msgs[k])}>{v}</button>
        ))}
      </div>
      <form className="composer" onSubmit={submit}>
        <textarea id="input" rows={1} aria-label="Message" placeholder={l.placeholder} value={draft} disabled={s.busy}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) submit(e); }} />
        <button className="btn primary" type="submit" disabled={s.busy}>{l.send}</button>
      </form>
    </section>
  );
}

function Activity({ s, l }) {
  const tr = useRef(null);
  useEffect(() => { if (tr.current) tr.current.scrollTop = tr.current.scrollHeight; }, [s.trace]);
  const st = { idle: ["", l.idle], thinking: ["accent", l.thinking], waiting: ["pause", l.waiting], done: ["ok", l.done], stopped: ["danger", l.stopped] }[s.loop];
  return (
    <section className="panel" aria-label="Agent activity">
      <h2><span>{l.pActivity}</span><Pill tone={st[0]}>{st[1]}</Pill></h2>
      <ol className="steps">
        {EVENTS.map((c, i) => {
          const e = s.ev[c]; let cls = "", mark = i + 1, extra = "";
          if (e?.state === "done") { cls = "done"; mark = "✓"; extra = `+${(e.at / 1000).toFixed(1)}s`; }
          else if (e?.state === "wait") { cls = "wait"; mark = "⏸"; }
          else if (e?.state === "alert") { cls = "alert"; mark = "!"; extra = `+${(e.at / 1000).toFixed(1)}s`; }
          else if (e?.state === "skip") { cls = "skip"; extra = c === "URGENT_ESCALATION_SHOWN" ? l.notTrig : l.skipped; }
          if (c === "URGENT_ESCALATION_SHOWN") mark = e?.state === "alert" ? "!" : "–";
          return (
            <li key={c} className={"step " + cls}>
              <span className="dot">{mark}</span>
              <span style={{ minWidth: 0 }}><span className="code">{c}</span><br /><span className="desc">{l.ev[c]}</span></span>
              <span className="ms">{extra}</span>
            </li>
          );
        })}
      </ol>
      <div className="trace" ref={tr}>
        {!s.trace.length ? <div className="empty">{l.traceEmpty}</div> : s.trace.map((r, i) => (
          <div key={i} className={"tr " + r.cls}>
            <span className="fn">{r.fn}<i>({r.args})</i></span>
            <span>{r.ms != null ? r.ms + " ms" : r.cls === "gate" ? "waiting" : ""}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function Memory({ s, l }) {
  const m = s.memory, ar = s.lang === "ar";
  let lang = "—", consent = "—", appt = "—", next = "—";
  if (m) {
    lang = m.lang === "ar" ? (ar ? "العربية" : "Arabic") : (ar ? "الإنجليزية" : "English");
    consent = m.consentN == null ? "—" : l.consentLimited(m.consentN);
    appt = m.ref ? `${m.ref} · ${ar ? "مؤكد (تجريبي)" : "confirmed (mock)"}` : "—";
    next = m.next === "attend" ? (ar ? "حضور الموعد مع ملخص التسليم" : "Attend appointment with handoff")
      : m.next === "emergency" ? (ar ? "طلب رعاية طارئة (998)" : "Seek emergency care (998)") : "—";
  }
  return (
    <section className="panel" aria-label="AgentCore Memory">
      <h2><span>{l.pMemory}</span></h2>
      <dl className="mem">
        <dt>{l.mLang}</dt><dd>{lang}</dd>
        <dt>{l.mConsent}</dt><dd>{consent}</dd>
        <dt>{l.mAppt}</dt><dd className="mono" style={{ fontSize: 12 }}>{appt}</dd>
        <dt>{l.mNext}</dt><dd>{next}</dd>
        <div className="foot">{l.memFoot}</div>
      </dl>
    </section>
  );
}

function Consent({ s, l, actions }) {
  const st = s.approved ? ["ok", l.cApproved] : s.booking ? ["pause", l.cReady] : ["", l.cPending];
  const Row = ({ k, extra }) => (
    <label className={"ck" + (extra ? " extra" : "") + (s.consent[k] ? " on" : "")}>
      <input type="checkbox" id={"ck-" + k} checked={s.consent[k]} disabled={s.route === "urgent"} onChange={(e) => actions.toggle(k, e.target.checked)} />
      <span>{l.cItems[k]}</span>
    </label>
  );
  return (
    <section className="panel" aria-label="Care snapshot">
      <h2><span>{l.pConsent}</span><Pill tone={st[0]}>{st[1]}</Pill></h2>
      <div className="consent">
        <h3>{l.share}</h3>{SHARE_KEYS.map((k) => <Row key={k} k={k} />)}
        <h3>{l.dontShare}</h3>{EXTRA_KEYS.map((k) => <Row key={k} k={k} extra />)}
        <div className="purpose"><span>{l.purpose}: <b>{l.purposeV}</b></span><span>{sharedCount(s.consent)} {l.of} 7</span></div>
        <button className="btn primary" id="approve" disabled={!s.booking || s.approved || s.busy} onClick={actions.approve}>{l.approve}</button>
        <div className="hint">{l.approveHint}</div>
      </div>
    </section>
  );
}

function Sec({ label, children, added }) {
  return <div className={"sec" + (added ? " added" : "")}><span className="l">{label}</span><div>{children}</div></div>;
}
function HandoffEN({ s }) {
  const c = s.consent, b = s.booking, p = b.p;
  return (<>
    <h4>Clinician Handoff — Prototype</h4>
    {c.symptoms && <Sec label="Reported symptoms and duration">Headache and blurry vision, 3 days (patient-reported). Onset Day 1; navigation request on Day 3.</Sec>}
    {c.history && <Sec label="Relevant patient-confirmed context">{PATIENT.history}</Sec>}
    {c.meds && <Sec label="Current medicines and allergies"><ul>{PATIENT.meds.map((x) => <li key={x}>{x}</li>)}<li>Allergy: {PATIENT.allergies}</li></ul></Sec>}
    {c.medflag && <Sec label="Medication-reference item for clinician / pharmacist">NSAID use (ibuprofen, as needed) alongside amlodipine: reference lists possible effect on blood-pressure control. For review only.</Sec>}
    {c.fullHistory && <Sec added label="Full consultation history (patient opted in)"><ul>{PATIENT.fullHistory.map((x) => <li key={x}>{x}</li>)}</ul></Sec>}
    {c.family && <Sec added label="Family history (patient opted in)">{PATIENT.family}</Sec>}
    {c.unrelated && <Sec added label="Other historical notes (patient opted in)">{PATIENT.unrelated}</Sec>}
    <Sec label="Appointment details">{p.doc} · Neurology · {p.clinic}, {p.area} · {p.when} · Ref <span className="mono">{b.ref}</span> (mock)</Sec>
    <Sec label="Patient questions for clinician"><ul><li>What signs mean I should go to emergency care?</li><li>Should I keep using ibuprofen for the headache?</li><li>Do I need a blood-pressure check today?</li></ul></Sec>
    <div className="safety">Safety note: navigation support only; not a diagnosis or treatment plan. Synthetic data · prototype.</div>
  </>);
}
function HandoffAR({ s }) {
  const c = s.consent, b = s.booking, p = b.p;
  const shared = [...SHARE_KEYS, ...EXTRA_KEYS].filter((k) => c[k]);
  const notShared = EXTRA_KEYS.filter((k) => !c[k]);
  return (<>
    <h4>ملخص الزيارة للمريض ومقدم الرعاية</h4>
    <Sec label="الخطوة التالية">حضور الموعد التجريبي وإحضار هذا الملخص. يُنصح بتقييم الطبيب خلال اليوم أو الغد وفقاً لإرشادات الفرز المعتمدة.</Sec>
    <Sec label="الموعد">{p.docAr} · طب الأعصاب · {p.clinicAr}، {p.areaAr} · {p.whenAr} · الرقم المرجعي <span className="mono" dir="ltr">{b.ref}</span> (تجريبي)</Sec>
    {c.symptoms && <Sec label="الأعراض كما وصفتها">صداع وتشوش في الرؤية منذ ثلاثة أيام.</Sec>}
    {c.medflag && <Sec label="سؤال للطبيب أو الصيدلي">هل يؤثر تناول الإيبوبروفين مع أملوديبين على ضغط الدم؟</Sec>}
    <Sec label="المعلومات التي ستتم مشاركتها مع الطبيب"><ul>{shared.length ? shared.map((k) => <li key={k}>{T.ar.cItems[k]}</li>) : <li>—</li>}</ul></Sec>
    {notShared.length > 0 && <Sec label="لن تتم مشاركتها"><ul>{notShared.map((k) => <li key={k}>{T.ar.cItems[k]}</li>)}</ul></Sec>}
    <div className="safety">كير بريدج لا يقوم بالتشخيص أو وصف الأدوية أو تحديد الجرعات. إذا ساءت الأعراض أو شعرت بأنها طارئة، اتصل بالرقم 998 أو توجّه إلى أقرب قسم طوارئ. هذه ليست نصيحة طبية. بيانات اصطناعية · نموذج أولي.</div>
  </>);
}
function Handoff({ s, l, actions }) {
  const doc = useRef(null);
  const [copied, setCopied] = useState(false);
  const copy = () => {
    const txt = doc.current?.innerText || "";
    const selectAll = () => { const r = document.createRange(); r.selectNodeContents(doc.current); const sel = getSelection(); sel.removeAllRanges(); sel.addRange(r); };
    try { navigator.clipboard.writeText(txt).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1400); }, selectAll); } catch (_) { selectAll(); }
  };
  const ar = s.tab === "ar";
  return (
    <section className="panel" aria-label="Handoff">
      <h2><span>{l.pHandoff}</span></h2>
      <div className="tabs" role="tablist">
        <button className="tab" role="tab" aria-selected={!ar} onClick={() => actions.tab("en")}>{l.tabEn}</button>
        <button className="tab" role="tab" aria-selected={ar} onClick={() => actions.tab("ar")}>{l.tabAr}</button>
      </div>
      {!s.approved ? <div className="doc"><div className="emptyst">{l.hEmpty}</div></div> : (<>
        <div className="doc" dir={ar ? "rtl" : "ltr"} lang={ar ? "ar" : "en"} ref={doc}>{ar ? <HandoffAR s={s} /> : <HandoffEN s={s} />}</div>
        <div className="doc" style={{ paddingTop: 0 }}><div className="docbar"><span>{l.proto}</span><button className="btn" onClick={copy}>{copied ? l.copied : l.copy}</button></div></div>
      </>)}
    </section>
  );
}

/* ---------------- main ---------------- */
export default function CareBridgeDashboard() {
  const [s, setS] = useState(() => {
    let lang = "en"; try { const v = localStorage.getItem("cb-lang"); if (v === "ar" || v === "en") lang = v; } catch (_) {}
    return initial(lang);
  });
  const ref = useRef(s); ref.current = s;
  const run = useRef(0);                  // bumps on reset so stale async flows stop
  const up = (fn) => setS((prev) => { const next = { ...prev, ...fn(prev) }; ref.current = next; return next; });
  const [clock, setClock] = useState(now());
  const l = T[s.lang];

  useEffect(() => {
    document.documentElement.lang = s.lang; document.documentElement.dir = s.lang === "ar" ? "rtl" : "ltr";
    try { localStorage.setItem("cb-lang", s.lang); } catch (_) {}
  }, [s.lang]);
  useEffect(() => {
    if (!s.t0 || s.t1 || s.route === "urgent") return;
    const id = setInterval(() => setClock(now()), 250); return () => clearInterval(id);
  }, [s.t0, s.t1, s.route]);

  /* helpers used by the simulated loop */
  const guard = (id) => run.current === id;
  const say = (type, extra) => up((p) => ({ msgs: [...p.msgs, { role: "agent", type, ...extra }] }));
  const mark = (code, state) => up((p) => ({ ev: { ...p.ev, [code]: { state, at: p.t0 ? Math.round(now() - p.t0) : 0 } } }));
  const trace = (row) => up((p) => ({ trace: [...p.trace, row] }));
  const startClock = () => up((p) => (p.t0 ? {} : { t0: now() }));
  const tool = async (id, fn, args, ms) => {
    const idx = ref.current.trace.length;
    up((p) => ({ tools: p.tools + 1, loop: "thinking", trace: [...p.trace, { fn, args, ms: null, cls: "" }] }));
    const st = now(); await agent.callTool(fn, args, ms);
    if (!guard(id)) return false;
    const took = Math.round(now() - st);
    up((p) => ({ trace: p.trace.map((r, i) => (i === idx ? { ...r, ms: took } : r)) }));
    return true;
  };
  const think = async (id, ms) => { up(() => ({ busy: true, typing: true })); await sleep(ms); if (!guard(id)) return false; up(() => ({ typing: false })); return true; };
  const finish = () => up((p) => ({ busy: false, loop: p.loop === "thinking" ? "idle" : p.loop }));

  async function clarify(id) {
    startClock(); up((p) => ({ route: p.route || "clarify" }));
    if (!(await think(id, 700))) return;
    say("text", { k: "clarify" });
    up(() => ({ awaitingDuration: true, loop: "waiting", busy: false }));
  }
  async function routineFlow(id) {
    startClock(); up(() => ({ awaitingDuration: false, busy: true, loop: "thinking" }));
    if (!(await tool(id, "knowledge_base.retrieve", "query=•••", 900))) return; mark("TRIAGE_GUIDANCE_RETRIEVED", "done");
    if (!(await tool(id, "get_patient_profile", "patient_id=•••, fields=[history, medications, allergies]", 700))) return; mark("RELEVANT_CONTEXT_RETRIEVED", "done");
    if (!(await tool(id, "check_medication_interactions", "medications=•••", 800))) return; mark("MEDICATION_REFERENCE_CHECKED", "done");
    up(() => ({ route: "routine" }));
    if (!(await tool(id, "search_providers", 'specialty="Neurology", location="Dubai", availability="≤24h"', 900))) return; mark("PROVIDER_OPTIONS_FOUND", "done");
    up((p) => ({ ev: { ...p.ev, URGENT_ESCALATION_SHOWN: { state: "skip" } } }));
    say("text", { k: "routine", safety: true }); say("text", { k: "medflag" }); say("options");
    trace({ fn: "⏸ human-in-the-loop", args: "await provider choice + confirmation", ms: null, cls: "gate" });
    mark("BOOKING_AWAITING_CONFIRMATION", "wait");
    up(() => ({ optionsShown: true, loop: "waiting", busy: false }));
  }
  async function urgentFlow(id) {
    startClock(); up(() => ({ busy: true, loop: "thinking", awaitingDuration: false }));
    if (!(await tool(id, "knowledge_base.retrieve", "query=•••", 900))) return;
    mark("TRIAGE_GUIDANCE_RETRIEVED", "done");
    up((p) => {
      const ev = { ...p.ev };
      EVENTS.slice(1, 7).forEach((c) => { if (ev[c]?.state !== "done") ev[c] = { state: "skip" }; });
      return { route: "urgent", ev, selected: null, msgs: p.msgs.filter((m) => m.type !== "confirm") };
    });
    trace({ fn: "route_decision", args: "red flag per retrieved guidance → routine booking blocked", ms: null, cls: "block" });
    mark("URGENT_ESCALATION_SHOWN", "alert");
    say("urgent");
    up((p) => ({ memory: { lang: p.lang, consentN: null, ref: p.booking?.ref || null, next: "emergency" }, loop: "stopped", busy: false }));
  }
  async function refusal(id, kind) {
    if (!(await think(id, 600))) return;
    trace({ fn: "guardrail / policy", args: `denied topic: ${kind === "dose" ? "medication dosing" : "medical diagnosis"} → refused`, ms: null, cls: "block" });
    up((p) => ({ route: !p.route || p.route === "clarify" ? "refused" : p.route }));
    say("text", { k: kind, refusal: true }); finish();
  }
  async function nextStep(id) {
    if (!(await think(id, 500))) return;
    up((p) => ({ tools: p.tools + 1, trace: [...p.trace, { fn: "memory.read", args: "language, consent_preference, appointment_ref, next_action", ms: 120, cls: "" }] }));
    say("text", { k: ref.current.booking ? "nextBooked" : "nextNone" }); finish();
  }

  const actions = {
    async send(text) {
      const cur = ref.current;
      if (cur.busy || !text || !text.trim()) return;
      const id = run.current;
      up((p) => ({ msgs: [...p.msgs, { role: "user", text }] }));
      const intent = classify(text, cur.awaitingDuration);
      if (intent === "red") return urgentFlow(id);
      if (intent === "dose" || intent === "dx") return refusal(id, intent);
      if (intent === "next") return nextStep(id);
      if (intent === "book") {
        if (!cur.optionsShown) { if (await think(id, 500)) { say("text", { k: "fallback" }); finish(); } return; }
        if (!cur.selected) {
          if (/4:30/.test(text)) return actions.pick(PROVIDERS[0]);
          if (await think(id, 400)) { say("text", { k: "pickFirst" }); finish(); } return;
        }
        return actions.confirm();
      }
      if (intent === "vague") return clarify(id);
      if (intent === "symptoms" || intent === "duration") return routineFlow(id);
      if (await think(id, 500)) { say("text", { k: "fallback" }); finish(); }
    },
    pick(p) {
      const cur = ref.current; if (cur.booking || cur.busy) return;
      up((prev) => ({ selected: p, msgs: [...prev.msgs.filter((m) => m.type !== "confirm"), { role: "agent", type: "confirm" }] }));
    },
    cancel() { up((p) => ({ selected: null, msgs: [...p.msgs.filter((m) => m.type !== "confirm"), { role: "agent", type: "text", k: "cancelled" }] })); },
    async confirm() {
      const cur = ref.current; if (!cur.selected || cur.booking) return;
      const id = run.current, p = cur.selected;
      up((prev) => ({ busy: true, msgs: [...prev.msgs.filter((m) => m.type !== "confirm"), { role: "user", text: prev.lang === "ar" ? "نعم، أكد الحجز." : "Yes, confirm the booking." }] }));
      mark("BOOKING_AWAITING_CONFIRMATION", "done");
      if (!(await tool(id, "book_appointment", `provider_id="${p.id}", patient_id=•••, date="${p.short}", user_confirmed=true`, 800))) return;
      up(() => ({ booking: { ref: "CB-" + (4200 + Math.floor(Math.random() * 700)), p } }));
      mark("MOCK_BOOKING_CONFIRMED", "done");
      trace({ fn: "⏸ human-in-the-loop", args: "await consent snapshot approval", ms: null, cls: "gate" });
      say("text", { k: "booked" });
      up(() => ({ loop: "waiting", busy: false }));
    },
    async approve() {
      const cur = ref.current; if (!cur.booking || cur.approved || cur.busy) return;
      const id = run.current;
      up(() => ({ busy: true, loop: "thinking" }));
      if (!(await tool(id, "generate_visit_summary", "patient_id=•••, symptoms=•••, duration=•••, consent=limited", 1000))) return;
      up(() => ({ approved: true })); mark("VISIT_SUMMARY_GENERATED", "done");
      if (!(await tool(id, "memory.write", "language, consent_preference, appointment_ref, next_action", 400))) return;
      up((p) => ({ memory: { lang: p.lang, consentN: sharedCount(p.consent), ref: p.booking.ref, next: "attend" }, t1: now() }));
      say("text", { k: "handoff" });
      up(() => ({ loop: "done", busy: false }));
    },
    toggle(k, v) {
      up((p) => {
        const consent = { ...p.consent, [k]: v };
        return { consent, memory: p.memory && p.memory.consentN != null ? { ...p.memory, consentN: sharedCount(consent) } : p.memory };
      });
    },
    tab(t) { up(() => ({ tab: t })); },
    lang(lang) { up((p) => ({ lang, tab: lang, memory: p.memory ? { ...p.memory, lang } : null })); },
    reset() { run.current++; setS((p) => { const n = initial(p.lang); ref.current = n; return n; }); },
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="wrap">
        <header className="top">
          <div className="brand">
            <div className="mark" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="var(--accent-ink)" strokeWidth="2.2" strokeLinecap="round"><path d="M3 16c3-6 6-6 9 0s6 6 9 0" /><path d="M12 4v6M9 7h6" /></svg>
            </div>
            <div><h1>CareBridge UAE</h1><p>{l.tagline}</p></div>
          </div>
          <div className="controls">
            <div className="seg" role="group" aria-label="Language">
              <button aria-pressed={s.lang === "en"} onClick={() => actions.lang("en")}>English</button>
              <button aria-pressed={s.lang === "ar"} lang="ar" onClick={() => actions.lang("ar")}>العربية</button>
            </div>
            <button className="btn" onClick={actions.reset}>{l.reset}</button>
          </div>
        </header>
        <div className="notice"><b>{l.demoTag}</b><span>{l.demoText}</span></div>
        <Stats s={s} l={l} clock={clock} />
        <main className="grid">
          <Chat s={s} l={l} actions={actions} />
          <div className="col"><Activity s={s} l={l} /><Memory s={s} l={l} /></div>
          <div className="col right"><Consent s={s} l={l} actions={actions} /><Handoff s={s} l={l} actions={actions} /></div>
        </main>
        <footer className="fine">{l.footer}</footer>
      </div>
    </>
  );
}
