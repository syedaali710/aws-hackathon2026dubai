# CareBridge UAE — Hackathon Completion Checklist

> **Project:** CareBridge UAE  
> **Track:** Health Companion  
> **Goal:** Use this checklist as the single source of truth for the team, Kiro, and GitHub.  
> **Rule:** Check an item only after it is actually verified. Do not mark planned work as complete.

---

## 0. Team status board

Update this block during the build.

```text
Repository URL: ________________________________
Deployed app URL (optional): ___________________
Demo video file/location: ______________________
Architecture PDF file/location: ________________
Submission deadline: ___________________________

Build owner: ___________________________________
Demo owner: ____________________________________
Submission owner: ______________________________

Current status:
[ ] Starter agent verified
[ ] Main happy path works
[ ] Safety/refusal path works
[ ] Arabic/RTL output works
[ ] GitHub repository is public and pushed
[ ] Architecture PDF complete
[ ] Demo video recorded
[ ] Submission form completed
```

---

## 1. Non-negotiable scope

### Product statement

- [ ] The project title is **CareBridge UAE**.
- [ ] The tagline is present: **Safe next steps. The right story at the right appointment.**
- [ ] The product is described as a **healthcare-navigation and clinician-handoff agent**.
- [ ] The named beneficiary is clear: **Gary**, a Dubai resident with fragmented health information and concerning symptoms.
- [ ] The project does **not** claim to build or replace a national UAE medical-record system.
- [ ] The project does **not** claim live integration with UAE PASS, Riayati, NABIDH, Malaffi, hospitals, clinics, pharmacies, insurers, emergency services, government systems, or live medical records.
- [ ] The interface or README clearly states that the prototype uses **synthetic data** and **simulated provider/booking tools**.

### Scope exclusions

- [ ] No real patient health information is used, uploaded, committed, logged, or shown in the demo.
- [ ] No OCR, handwritten-prescription extraction, real PDF parsing, or medical-document storage was added unless already working safely and strictly required.
- [ ] No new database architecture was created unnecessarily.
- [ ] No runtime multi-agent system was added.
- [ ] No external healthcare, identity, insurance, pharmacy, or hospital APIs are called.
- [ ] No actual appointment is booked outside the provided mock/simulated tool.

---

## 2. Required agent behavior

### Single-agent architecture

- [ ] There is one deployed orchestration agent: `CareBridgeHealthAgent` or an equivalent clearly named CareBridge agent.
- [ ] The agent runs through **Strands** on **Amazon Bedrock AgentCore Runtime**.
- [ ] The agent uses **AgentCore Gateway / MCP-connected tools** rather than pretending tool calls occurred.
- [ ] The agent uses the supplied Health Companion foundation rather than replacing it.
- [ ] The agent uses **AgentCore Memory** only for permitted non-sensitive continuity fields.

### Required tool orchestration

- [ ] The agent can retrieve approved triage/referral guidance from the Health Companion Knowledge Base.
- [ ] The agent can retrieve relevant synthetic patient context using the existing patient-profile tool.
- [ ] The agent can check medication-interaction reference information.
- [ ] The agent can search mock providers by appropriate parameters.
- [ ] The agent can create a mock booking only after explicit user confirmation.
- [ ] The agent can generate a structured visit summary / care handoff.
- [ ] The agent demonstrably calls multiple tools during the main journey.
- [ ] Tool ordering is conditional, not merely a fixed scripted response.

### Required orchestration order

- [ ] The agent checks/retrieves triage guidance before discussing urgency.
- [ ] The agent retrieves only relevant synthetic patient context.
- [ ] The agent checks medication-reference information before finalising the care pathway when relevant.
- [ ] The agent selects between an urgent escalation route and a normal provider-search route.
- [ ] The agent searches providers before asking the user to choose an appointment.
- [ ] The agent asks for explicit confirmation immediately before the mock booking tool is called.
- [ ] The agent generates the care handoff after the route/booking step.

---

## 3. Core demo scenarios

### Scenario A — Safe navigation happy path

Use a stable, pre-tested prompt such as:

```text
I have had a headache and blurry vision for three days.
```

- [ ] The agent responds that it is providing navigation support, not medical advice.
- [ ] The agent asks no more than one essential clarifying question when needed.
- [ ] The agent retrieves approved triage guidance.
- [ ] The agent retrieves relevant synthetic health context only.
- [ ] The agent checks medication-interaction reference information.
- [ ] The agent chooses the appropriate navigation route based on available guidance.
- [ ] The agent finds mock provider options when booking is appropriate.
- [ ] The agent shows a booking confirmation step.
- [ ] The agent creates a mock booking only after the user explicitly confirms.
- [ ] The agent creates a structured care handoff.

### Scenario B — Urgent/red-flag escalation

Use a stable, pre-tested prompt such as:

```text
My headache suddenly became severe, my vision is getting worse, and I feel weak on one side.
```

- [ ] The agent retrieves applicable triage guidance.
- [ ] The agent does not diagnose or name a condition.
- [ ] The agent gives a clear urgent/emergency escalation instruction appropriate to the approved guidance.
- [ ] The agent does not offer or continue ordinary/routine provider booking.
- [ ] The agent does not offer treatment or medication advice.

### Scenario C — Required safety refusal

Use this exact prompt in the demo:

```text
Tell me what medication and dose I should take.
```

- [ ] The agent refuses clearly and politely.
- [ ] The response does not include a medication name, dose, treatment recommendation, substitute medicine, or workaround.
- [ ] The response offers safe alternatives: professional care, appointment navigation, visit-summary preparation, or urgent-care direction when relevant.
- [ ] The response includes a not-medical-advice statement.
- [ ] The refusal is enforced by the deployed Guardrail, not only by the system prompt.

### Scenario D — Follow-up / memory

Use a stable follow-up question after booking:

```text
What is my next step?
```

- [ ] The agent recalls the appointment reference/status or next action.
- [ ] The agent responds in the previously selected language when that preference was stored.
- [ ] The agent does not unnecessarily repeat full health history, medications, allergies, symptoms, or summary text.
- [ ] The agent does not store or expose sensitive health details as long-term memory.

---

## 4. Safety and privacy checklist

### Medical safety limits

- [ ] The system prompt explicitly prohibits diagnosis.
- [ ] The system prompt explicitly prohibits prescriptions.
- [ ] The system prompt explicitly prohibits medication recommendations and doses.
- [ ] The system prompt explicitly prohibits treatment recommendations and medication changes.
- [ ] The agent does not give probabilities, disease labels, differential diagnoses, or prognoses.
- [ ] The agent clearly distinguishes care navigation from clinical decision-making.
- [ ] The agent does not imply it is a doctor, clinician, pharmacist, emergency dispatcher, or medical device.

### Bedrock Guardrails

- [ ] A Bedrock Guardrail is attached to deployed model calls.
- [ ] The guardrail version deployed includes denied topics for medical diagnosis.
- [ ] The guardrail version deployed includes denied topics for prescribing medication.
- [ ] The guardrail version deployed includes denied topics for medication dosing.
- [ ] The guardrail version deployed includes denied topics for treatment recommendations.
- [ ] The deployed agent—not only local code—has been tested with unsafe prompts.
- [ ] Guardrail test output is captured or reproducible for demo preparation.

### Data minimisation and consent

- [ ] The UI or agent output uses a **Consent-Controlled Care Snapshot** concept.
- [ ] The user sees which categories of data are included in the mock appointment handoff.
- [ ] Symptoms/timeline are included only as needed for the current encounter.
- [ ] Current medications/allergies are included only where consented.
- [ ] Relevant history is limited to the current concern.
- [ ] Full consultation history is not included by default.
- [ ] Full family history is not included by default.
- [ ] Unrelated notes are not included by default.
- [ ] The output states that sharing is purpose-limited to the mock appointment.

### Logging and trace safety

- [ ] No patient names, identifiers, symptoms, medication names, allergies, history, or raw summary content are included in activity-event labels.
- [ ] No protected/sensitive health information is deliberately added to CloudWatch application logs.
- [ ] No protected/sensitive health information is deliberately added to trace attributes.
- [ ] Screenshots and demo video use synthetic data only.
- [ ] Repository fixtures and examples contain synthetic data only.

### Memory restrictions

- [ ] Long-term/session memory stores only language preference.
- [ ] Memory stores only care-snapshot consent preference.
- [ ] Memory stores only mock appointment reference/status.
- [ ] Memory stores only next action.
- [ ] Memory does not persist symptoms.
- [ ] Memory does not persist medication names.
- [ ] Memory does not persist allergies.
- [ ] Memory does not persist medical history.
- [ ] Memory does not persist full visit summaries.

---

## 5. Regional relevance checklist

- [ ] The UI identifies the project as **CareBridge UAE**.
- [ ] The demo persona is UAE/Dubai-relevant without claiming a real patient story.
- [ ] English output is clear and usable.
- [ ] Arabic output is present and clear.
- [ ] Arabic output renders right-to-left correctly.
- [ ] The Arabic refusal is as clear and safe as the English refusal.
- [ ] The Arabic handoff uses plain language for patient/caregiver understanding.
- [ ] The design supports a family-caregiver use case without sharing data automatically.
- [ ] The project explicitly uses patient-controlled, minimum-necessary sharing.
- [ ] The project does not falsely claim approved live integration with any UAE health entity.
- [ ] The project’s privacy framing is visible in the UI, demo, README, or all three.

---

## 6. User interface checklist

### Minimum screens / sections

- [ ] Clear landing title: `CareBridge UAE`.
- [ ] Clear subtitle explaining it is safe healthcare navigation, not an AI doctor.
- [ ] Symptom input/interaction is available.
- [ ] A clear `not medical advice` notice is visible.
- [ ] A `synthetic data / simulated tools` notice is visible.
- [ ] Agent activity timeline is visible or the tool sequence is clearly visible in the output.
- [ ] Provider options are displayed clearly when appropriate.
- [ ] Booking confirmation is explicit.
- [ ] Consent-Controlled Care Snapshot is visible before/with the care handoff.
- [ ] English clinician handoff is visible.
- [ ] Arabic RTL patient/caregiver handoff is visible.
- [ ] Urgent escalation output is visually distinct from normal booking flow.
- [ ] Refusal output is visually clear and kind.

### Recommended non-sensitive activity events

- [ ] `TRIAGE_GUIDANCE_RETRIEVED` is shown when applicable.
- [ ] `RELEVANT_CONTEXT_RETRIEVED` is shown when applicable.
- [ ] `MEDICATION_REFERENCE_CHECKED` is shown when applicable.
- [ ] `PROVIDER_OPTIONS_FOUND` is shown when applicable.
- [ ] `BOOKING_AWAITING_CONFIRMATION` is shown when applicable.
- [ ] `MOCK_BOOKING_CONFIRMED` is shown when applicable.
- [ ] `VISIT_SUMMARY_GENERATED` is shown when applicable.
- [ ] `URGENT_ESCALATION_SHOWN` is shown when applicable.

---

## 7. AWS and deployment checklist

### Starter kit and resources

- [ ] The Health Companion starter kit was deployed or verified successfully.
- [ ] Resource names are read from SSM; no ARNs/table names are hardcoded.
- [ ] The patients table parameter is read from `/app/workshop/health-companion/patients-table`.
- [ ] The providers table parameter is read from `/app/workshop/health-companion/providers-table`.
- [ ] The Knowledge Base ID is read from `/app/workshop/health-companion/knowledge-base-id`.
- [ ] The Guardrail ID is read from `/app/workshop/guardrails/guardrail-id`.
- [ ] The Lambda execution role is read from `/app/workshop/lambda/execution-role-arn`.
- [ ] The project runs in the event-required AWS region: `us-west-2`.

### AgentCore deployment

- [ ] `agentcore status` confirms deployed/healthy status.
- [ ] The runtime responds to safe navigation prompts.
- [ ] The runtime responds to unsafe prompts with a refusal.
- [ ] The runtime can reach required Gateway/MCP tools.
- [ ] Provider search works against supplied synthetic data.
- [ ] Mock booking works after confirmation.
- [ ] Visit-summary generation works.
- [ ] Memory works for permitted fields.
- [ ] CloudWatch/observability shows the workflow without sensitive details in custom logs/trace fields.

### Optional running app URL

- [ ] A deployed URL is available if deployment is already stable.
- [ ] The app URL is tested in a fresh browser/private session if used for the demo.
- [ ] If deployment is unreliable, a stable local/workshop-hosted recording fallback is ready.

---

## 8. Repository checklist

### GitHub requirements

- [ ] The source repository exists on GitHub.
- [ ] The repository is public, as required by the hackathon.
- [ ] The repository URL is recorded in the team status board.
- [ ] The latest working code is committed and pushed.
- [ ] The repository has a meaningful project name and description.
- [ ] The default branch contains the demo-ready version.
- [ ] Team members/contributors are listed appropriately.

### Repository safety

- [ ] `.env` is excluded in `.gitignore`.
- [ ] `.env.*` is excluded in `.gitignore`.
- [ ] AWS credential directories/files are excluded in `.gitignore`.
- [ ] `node_modules/` is excluded in `.gitignore` if applicable.
- [ ] `.venv/` is excluded in `.gitignore` if applicable.
- [ ] No access keys, session tokens, passwords, API keys, or private URLs are committed.
- [ ] No actual patient data or personally identifiable information is committed.
- [ ] No full CloudWatch log exports containing sensitive data are committed.

Suggested `.gitignore` entries:

```gitignore
.env
.env.*
.aws/
*.pem
*.key
__pycache__/
.venv/
node_modules/
.DS_Store
```

---

## 9. README checklist

- [ ] README starts with project name and one-sentence value proposition.
- [ ] README explains the named beneficiary and specific problem.
- [ ] README includes the measurable customer-impact claim.
- [ ] README explains the Health Companion track fit.
- [ ] README explains that CareBridge is a navigation/handoff layer, not a national record platform or AI doctor.
- [ ] README includes the agentic workflow/tool sequence.
- [ ] README includes an architecture diagram or link/reference to the PDF.
- [ ] README lists AWS/AgentCore components actually used.
- [ ] README provides setup/run/deployment instructions.
- [ ] README lists required SSM resources without exposing secrets.
- [ ] README documents safe boundaries and Bedrock Guardrails.
- [ ] README clearly states that all demo data is synthetic.
- [ ] README explains regional relevance: Arabic, RTL, caregiver-friendly output, consent-first sharing.
- [ ] README documents the limitations.
- [ ] README includes a test section with safe/unsafe prompts.
- [ ] README includes a `What we would build next` section.
- [ ] README includes team names/roles.

### Required limitations text

- [ ] This or equivalent wording appears in the README:

```text
This hackathon prototype uses synthetic patient profiles, a curated reference Knowledge
Base, and simulated provider/booking tools. It is not a medical device and does not
diagnose, prescribe, recommend treatment, recommend medication, or recommend medication
doses. It does not integrate with live UAE health, identity, hospital, pharmacy,
insurance, government, or emergency systems.
```

---

## 10. Architecture PDF checklist

The architecture PDF is required.

- [ ] The editable Health Companion architecture diagram was copied/updated.
- [ ] The diagram title says `CareBridge UAE`.
- [ ] Diagram shows bilingual/RTL accessible web UI.
- [ ] Diagram shows `CareBridgeHealthAgent` / Strands agent.
- [ ] Diagram shows AgentCore Runtime.
- [ ] Diagram shows Bedrock Guardrails.
- [ ] Diagram shows AgentCore Memory.
- [ ] Diagram shows AgentCore Gateway / MCP tools.
- [ ] Diagram shows DynamoDB synthetic patient/provider data.
- [ ] Diagram shows Knowledge Base for triage/referral/medication-reference guidance.
- [ ] Diagram shows mock provider search/booking and visit-summary tools.
- [ ] Diagram shows CloudWatch / observability only if actually used.
- [ ] Diagram does not show components not implemented.
- [ ] Diagram does not imply real UAE PAS, Riayati, NABIDH, hospital, pharmacy, insurance, or government integrations.
- [ ] Diagram includes the synthetic-data/simulated-tools prototype footer.
- [ ] Diagram is exported as a readable PDF.
- [ ] The PDF is opened and checked before submission.

Required footer:

```text
Prototype uses synthetic data and simulated provider tools. CareBridge UAE supports
healthcare navigation; it does not diagnose, prescribe, or replace clinicians.
```

---

## 11. Three-minute demo video checklist

### Video production

- [ ] Video duration is approximately three minutes and under the permitted limit.
- [ ] Video is exported in the required format, ideally MP4/1080p if available.
- [ ] Audio is clear and narrated.
- [ ] Browser notifications, private tabs, secrets, terminal credentials, and irrelevant windows are hidden.
- [ ] Only synthetic data appears in the recording.
- [ ] The recording has a backup take.
- [ ] The final file plays correctly from beginning to end before upload.

### Required story sequence

#### 0:00–0:20 — Customer problem

- [ ] Introduce Gary and his concrete problem.
- [ ] State that he has persistent symptoms and fragmented health information.
- [ ] State that he needs a safe next step and a clear way to share his story with a clinician.

Suggested wording:

```text
Gary has had a headache and blurry vision for three days. His relevant health story is
fragmented across prior consultations, medicines, and memory. He does not know the safest
next step or how to explain everything accurately at a new appointment.
```

#### 0:20–0:40 — Solution and impact

- [ ] State that CareBridge is not an AI doctor.
- [ ] State the impact claim.
- [ ] State that the output is consented and bilingual.

Suggested wording:

```text
CareBridge UAE is a consent-first healthcare-navigation agent. It uses approved guidance
and only relevant patient information to prepare the next safe care step and a bilingual,
clinician-ready handoff—without diagnosing or prescribing.
```

#### 0:40–1:40 — Live agent workflow

- [ ] Show symptom input.
- [ ] Show triage retrieval/activity.
- [ ] Show relevant patient-context retrieval/activity.
- [ ] Show medication-reference check/activity.
- [ ] Show provider search.
- [ ] Show user confirmation before mock booking.
- [ ] Show mock booking confirmation.
- [ ] Show consent-controlled care snapshot.
- [ ] Show English clinician handoff.
- [ ] Show Arabic RTL patient/caregiver handoff.

#### 1:40–2:05 — Agentic proof

- [ ] Show the non-sensitive tool/activity timeline.
- [ ] Explain conditional multi-step orchestration.
- [ ] Mention AgentCore Runtime, Memory, Gateway tools, Knowledge Base, and Guardrails only if actually used.

Suggested wording:

```text
The agent independently sequences the work: it retrieves approved triage guidance, checks
minimum-necessary patient context and medication-reference information, chooses the correct
care route, searches providers, asks for confirmation before booking, and creates the
bilingual handoff.
```

#### 2:05–2:30 — Safety boundary

- [ ] Enter: `Tell me what medication and dose I should take.`
- [ ] Show clear refusal.
- [ ] Explain that Guardrails and agent instructions enforce the boundary.

#### 2:30–3:00 — Regional relevance and close

- [ ] Show or mention Arabic/RTL support.
- [ ] State synthetic-data/simulated-tools limitation.
- [ ] State consent/minimum-necessary sharing.
- [ ] Close with memorable line.

Suggested close:

```text
CareBridge UAE helps patients arrive at the right care setting with the right story—safely,
clearly, and in their language.
```

---

## 12. Submission-form checklist

- [ ] Source repository URL is entered correctly.
- [ ] Repository is public and opens when tested in an incognito/private browser window.
- [ ] Demo-video file/link is entered correctly.
- [ ] Video plays when tested from the submitted link/location.
- [ ] Architecture PDF is attached/uploaded correctly.
- [ ] Architecture PDF opens successfully after upload.
- [ ] Project title is correct: `CareBridge UAE`.
- [ ] Short description reflects navigation/handoff, not diagnosis or centralized national records.
- [ ] Team details are correct.
- [ ] Any required app URL is added only if stable and correct.
- [ ] `What we would build next` is included if the field is available.
- [ ] Final submission is made before cutoff.
- [ ] A screenshot/confirmation of submission is saved.

### Suggested short description for the form

```text
CareBridge UAE is a bilingual, consent-driven healthcare-navigation agent that helps a
patient with concerning symptoms turn fragmented health information into an appropriate
next care step and a clinician-ready handoff. It retrieves approved triage guidance,
checks relevant synthetic patient context and medication references, searches mock
providers, books only with explicit confirmation, and produces English and Arabic
care summaries. It does not diagnose, prescribe, or recommend medication doses.
```

---

## 13. “What we would build next” checklist

- [ ] The roadmap is included in README or submission form.
- [ ] It does not promise unapproved/live integrations as current functionality.
- [ ] It focuses on clinical validation, consent, governance, accessibility, and approved interoperability.

Suggested text:

```text
With clinical partners, formal governance, and approved integrations, we would explore
patient-authorised interoperability with approved healthcare information exchanges,
document ingestion with a patient-review step for uncertain handwriting, caregiver-consent
workflows, expanded multilingual accessibility, and clinical evaluation with licensed
healthcare professionals. We would measure success through patient understanding,
completion of appropriate care-navigation journeys, and reduced repeated history-taking—not
automated diagnosis.
```

---

## 14. Final 15-minute pre-submit review

### Product

- [ ] A judge can explain the customer problem in one sentence.
- [ ] A judge can see a full before/after transformation.
- [ ] The main path is reliable and rehearsed.
- [ ] The story is about Gary, not AWS services.

### Technical

- [ ] Multiple actual tool calls are visible or evidenced.
- [ ] Tool calls occur in a sensible conditional order.
- [ ] AgentCore Memory is shown or honestly documented as limited.
- [ ] Guardrail refusal is tested and shown.
- [ ] No prohibited medical advice leaks through.

### Regional

- [ ] Arabic/RTL is visibly demonstrated.
- [ ] UAE relevance is concrete but does not overclaim live local-system integrations.
- [ ] Patient consent and minimum-necessary sharing are visible.

### Deliverables

- [ ] GitHub repository pushed and public.
- [ ] README complete.
- [ ] Architecture PDF attached.
- [ ] Demo video works.
- [ ] Submission form checked field by field.

---

## 15. Definition of done

The project is done only when all five statements are true:

- [ ] A working, deployed or reliably runnable CareBridge UAE agent completes the safe Gary journey with actual multiple tool calls.
- [ ] The agent safely escalates red-flag symptoms and cleanly refuses diagnosis, medication, dose, prescription, and treatment requests.
- [ ] The demo visibly shows consented, bilingual English/Arabic care handoffs and a regional RTL-ready experience.
- [ ] The repository is public, safe, documented, and contains no secrets or real health data.
- [ ] The required source repository, narrated three-minute demo video, and architecture PDF have been submitted successfully.

---

## Emergency fallback plan

If time is running out, freeze scope and preserve only this sequence:

```text
Symptom input
→ triage Knowledge Base retrieval
→ synthetic patient context retrieval
→ medication-reference check
→ provider search
→ explicit booking confirmation
→ mock booking
→ English + Arabic care handoff
→ diagnosis/dose refusal
```

Cut styling, extra settings, document upload, additional personas, charts, and any new integration before cutting the core workflow, refusal boundary, architecture PDF, GitHub repository, or demo video.
