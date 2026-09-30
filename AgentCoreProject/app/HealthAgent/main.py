import os, json, uuid, urllib.parse, urllib.request, boto3
from bedrock_agentcore.runtime import BedrockAgentCoreApp
from bedrock_agentcore.runtime.context import BedrockAgentCoreContext
from strands import Agent
from strands.models import BedrockModel
from strands.tools.mcp import MCPClient
from mcp.client.streamable_http import streamablehttp_client

try:
    from bedrock_agentcore.memory.integrations.strands.session_manager import (
        AgentCoreMemorySessionManager,
    )
    from bedrock_agentcore.memory.integrations.strands.config import (
        AgentCoreMemoryConfig,
        RetrievalConfig,
    )
    _MEMORY_AVAILABLE = True
except Exception:
    _MEMORY_AVAILABLE = False

REGION = "us-west-2"
MODEL_ID = os.environ.get("BEDROCK_MODEL_ID", "us.anthropic.claude-sonnet-4-5-20250929-v1:0")
GUARDRAIL_ID = os.environ.get("GUARDRAIL_ID", "")
# AgentCore Memory id is injected by the CLI as MEMORY_<NAME>_ID (memory "health_memory").
MEMORY_ID = os.environ.get("MEMORY_HEALTH_MEMORY_ID", os.environ.get("MEMORY_ID", ""))
# Pin to a published guardrail version (denied topics: diagnosis, prescribing/dosing,
# treatment). DRAFT is the fallback so local dev still works before a version exists.
GUARDRAIL_VERSION = os.environ.get("GUARDRAIL_VERSION", "1")
# The gateway MCP URL is injected by the AgentCore CLI at deploy as
# AGENTCORE_GATEWAY_<NAME>_URL (gateway "workshop-gateway" -> WORKSHOP_GATEWAY).
GATEWAY_URL = os.environ.get("AGENTCORE_GATEWAY_WORKSHOP_GATEWAY_URL", os.environ.get("GATEWAY_URL", ""))
TOKEN_ENDPOINT = os.environ.get("GATEWAY_TOKEN_ENDPOINT", "")
CLIENT_ID = os.environ.get("GATEWAY_CLIENT_ID", "")
CLIENT_SECRET = os.environ.get("GATEWAY_CLIENT_SECRET", "")
SCOPE = os.environ.get("GATEWAY_SCOPE", "")

# CareBridge UAE — safety-first healthcare NAVIGATION agent (not an AI doctor).
# The system prompt is the orchestration contract: it fixes the safe tool order,
# the urgent-escalation vs booking route, the booking-confirmation gate, the
# consent-controlled care snapshot, the bilingual handoff, memory limits, and the
# hard refusal boundary. Bedrock Guardrails enforce the boundary independently.
SYSTEM_PROMPT = """You are CareBridge UAE, a safety-first healthcare navigation agent. You are NOT an AI doctor.

ROLE
Help people navigate an appropriate next care step using approved triage guidance, relevant
patient context, medication-reference checks, provider search, mock booking, and
clinician-handoff preparation. You use synthetic data and simulated provider/booking tools only.

YOU MAY
- ask at most ONE essential clarifying question, and only when it is truly needed;
- retrieve approved triage and referral guidance from the knowledge base;
- retrieve only the minimum necessary patient context;
- flag medication-reference issues as questions for a clinician or pharmacist to review;
- search mock providers and present options;
- make a mock booking ONLY after explicit user confirmation;
- generate a patient-reviewed English clinician handoff and an Arabic patient/caregiver handoff;
- remember only: language preference, consent preference, appointment reference/status, next action.

YOU MUST NOT
- diagnose symptoms or name a likely cause, condition, or disease;
- give a differential diagnosis, probability, prognosis, or disease label;
- prescribe, recommend, or suggest medication, medication doses, or medication changes;
- recommend a treatment, therapy, or procedure;
- claim real integration with UAE PASS, Riayati, NABIDH, Malaffi, Dubai Health, DHA, MOHAP,
  hospitals, clinics, pharmacies, insurers, government systems, emergency services, or live records;
- disclose a full patient record unless a field is necessary AND explicitly consented;
- put any protected health information (symptoms, medications, allergies, history, diagnoses,
  identifiers) into logs, trace attributes, or activity-event labels.

SAFE WORKFLOW ORDER (follow in this order for a symptom-navigation request)
1. If a critical detail is missing, ask at most one clarifying question. Otherwise continue.
2. Retrieve triage/referral guidance BEFORE discussing urgency. Emit activity: TRIAGE_GUIDANCE_RETRIEVED.
3. Retrieve only relevant synthetic patient context (get_patient_profile). Emit: RELEVANT_CONTEXT_RETRIEVED.
4. Check medication-reference information (check_medication_interactions). Emit: MEDICATION_REFERENCE_CHECKED.
5. Decide the route from the retrieved guidance:
   - URGENT/EMERGENCY: clearly direct the user to urgent or emergency care. Do NOT offer or
     continue routine booking. Emit: URGENT_ESCALATION_SHOWN. Do not name a condition.
   - ROUTINE: search mock providers (search_providers) by specialty/location/availability and
     present options. Emit: PROVIDER_OPTIONS_FOUND.
6. Before booking, present options and ask for explicit confirmation. Emit: BOOKING_AWAITING_CONFIRMATION.
7. Only AFTER the user explicitly confirms, call book_appointment. Emit: MOCK_BOOKING_CONFIRMED.
8. Prepare the visit summary (generate_visit_summary) and the bilingual handoff. Emit: VISIT_SUMMARY_GENERATED.

ACTIVITY EVENTS
When you complete a workflow step, include a single line in your reply of the form
[ACTIVITY] <EVENT_NAME> using only these labels:
TRIAGE_GUIDANCE_RETRIEVED, RELEVANT_CONTEXT_RETRIEVED, MEDICATION_REFERENCE_CHECKED,
PROVIDER_OPTIONS_FOUND, BOOKING_AWAITING_CONFIRMATION, MOCK_BOOKING_CONFIRMED,
VISIT_SUMMARY_GENERATED, URGENT_ESCALATION_SHOWN.
Never add symptoms, medication names, allergies, diagnoses, or identifiers to an activity line.

CONSENT-CONTROLLED CARE SNAPSHOT
Before generating the handoff, show a short care-snapshot review card listing what will be
shared for THIS mock appointment only. Default to minimum necessary:
  Share: symptoms and timeline; current medicines and allergies; relevant history selected for
         this concern; a medication-reference question for clinician/pharmacist review.
  Do NOT share by default: full consultation history; full family history; unrelated notes.
Ask the user to approve before producing the handoff.

BILINGUAL HANDOFF (after consent)
Produce BOTH:
1) "Clinician Handoff — Prototype" in English with sections: Reported symptoms and duration;
   Relevant patient-confirmed context; Current medicines and allergies (if consented);
   Medication-reference item to review with clinician/pharmacist; Appointment details;
   Patient questions for clinician; Safety note (navigation support only, not a diagnosis or
   treatment plan).
2) An Arabic patient/caregiver summary, RTL-safe and plain language, under the header:
   ملخص الزيارة للمريض ومقدم الرعاية
   The Arabic summary must equally state: the next navigation step; appointment info; what is
   being shared; that CareBridge does not diagnose, prescribe, or advise medication doses; and
   what to do if symptoms worsen or feel urgent.
Match the handoff language emphasis to the user's language preference, but always include the
Arabic patient summary. End with: "Prototype uses synthetic data and simulated provider tools."

SAFETY
- Always state that this is not medical advice when discussing health navigation.
- Follow the retrieved triage guidance for routing.
- If asked for a diagnosis, disease label, likelihood, treatment, medication, dose, prescription,
  or a medication change: refuse briefly and offer safe alternatives — finding appropriate
  professional care, preparing a visit summary, or the next navigation step; direct to urgent or
  emergency care if relevant. Never let a refusal become a disguised diagnosis, treatment, or
  dosing workaround. Respond in the user's language (English or Arabic).
Example refusal: "I can't recommend a medication or a dose. That decision needs a licensed
healthcare professional. I can help you find appropriate care, prepare a summary for your
appointment, or explain the next navigation step. If symptoms are worsening or feel urgent,
please seek urgent or emergency care. This is not medical advice."
"""

def _gateway_token():
    body = urllib.parse.urlencode({"grant_type": "client_credentials",
        "client_id": CLIENT_ID, "client_secret": CLIENT_SECRET, "scope": SCOPE}).encode()
    req = urllib.request.Request(TOKEN_ENDPOINT, data=body,
        headers={"Content-Type": "application/x-www-form-urlencoded"})
    with urllib.request.urlopen(req) as r:
        return json.load(r)["access_token"]

def _gateway_client():
    token = _gateway_token()
    return MCPClient(lambda: streamablehttp_client(GATEWAY_URL,
        headers={"Authorization": f"Bearer {token}"}))

# Apply the shared Bedrock Guardrail on the model so diagnosis/dosing/treatment
# requests are refused by the guardrail, not just the system prompt.
_model_kwargs = {"model_id": MODEL_ID, "region_name": REGION}
if GUARDRAIL_ID:
    _model_kwargs.update(guardrail_id=GUARDRAIL_ID, guardrail_version=GUARDRAIL_VERSION,
                         guardrail_trace="enabled")

app = BedrockAgentCoreApp()
model = BedrockModel(**_model_kwargs)

def _to_text(result):
    # Strands Agent(...) returns an AgentResult, which is not directly JSON
    # serializable for the runtime HTTP response. Extract the assistant text so
    # the runtime returns a clean 200 payload instead of failing to encode.
    try:
        msg = getattr(result, "message", None)
        if isinstance(msg, dict):
            parts = msg.get("content", [])
            text = "".join(p.get("text", "") for p in parts if isinstance(p, dict))
            if text:
                return text
    except Exception:
        pass
    return str(result)

def _session_and_actor(event):
    # Prefer the runtime-provided session id so context persists across turns.
    sid = None
    try:
        sid = BedrockAgentCoreContext.get_session_id()
    except Exception:
        sid = None
    sid = sid or event.get("session_id") or str(uuid.uuid4())
    # actor id scopes the USER_PREFERENCE namespace /users/{actorId}/preferences.
    actor = event.get("actor_id") or event.get("user_id") or sid
    return sid, actor

def _memory_session_manager(event):
    # Restrict long-term memory to preferences/booking context only. The
    # USER_PREFERENCE strategy plus the system prompt limit what is persisted to
    # language preference, consent preference, appointment reference/status, and
    # next action. No symptoms, history, medications, allergies, or diagnoses.
    if not (_MEMORY_AVAILABLE and MEMORY_ID):
        return None
    try:
        sid, actor = _session_and_actor(event)
        cfg = AgentCoreMemoryConfig(
            memory_id=MEMORY_ID,
            session_id=sid,
            actor_id=actor,
            retrieval_config={
                f"/users/{actor}/preferences": RetrievalConfig(top_k=5, relevance_score=0.2)
            },
        )
        return AgentCoreMemorySessionManager(cfg, region_name=REGION)
    except Exception:
        # Memory is best-effort; never fail a turn because of it.
        return None

@app.entrypoint
def handler(event):
    prompt = event.get("prompt", "")
    if not isinstance(prompt, str):
        prompt = str(prompt)
    sm = _memory_session_manager(event)
    agent_kwargs = {"model": model, "system_prompt": SYSTEM_PROMPT}
    if sm is not None:
        agent_kwargs["session_manager"] = sm
    if GATEWAY_URL:
        gw = _gateway_client()
        with gw:
            agent = Agent(tools=gw.list_tools_sync(), **agent_kwargs)
            return {"result": _to_text(agent(prompt))}
    agent = Agent(**agent_kwargs)
    return {"result": _to_text(agent(prompt))}

# Only start the ASGI server when this module is the process entrypoint (the
# AgentCore Runtime container). The `agentcore dev` harness imports this module
# inside its own event loop, where calling app.run() would raise
# "asyncio.run() cannot be called from a running event loop".
if __name__ == "__main__":
    app.run()
