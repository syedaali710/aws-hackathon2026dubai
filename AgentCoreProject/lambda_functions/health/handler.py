import boto3
REGION = "us-west-2"
ddb = boto3.resource("dynamodb", region_name=REGION)
ssm = boto3.client("ssm", region_name=REGION)
bar = boto3.client("bedrock-agent-runtime", region_name=REGION)
def _p(n): return ssm.get_parameter(Name=n)["Parameter"]["Value"]
PATIENTS = _p("/app/workshop/health-companion/patients-table")
PROVIDERS = _p("/app/workshop/health-companion/providers-table")
def _kb_retrieve(query, k=3):
    kb_id = _p("/app/workshop/health-companion/knowledge-base-id")
    res = bar.retrieve(knowledgeBaseId=kb_id, retrievalQuery={"text": query},
                       retrievalConfiguration={"vectorSearchConfiguration": {"numberOfResults": k}})
    return [r["content"]["text"] for r in res.get("retrievalResults", [])][:k]
def handler(event, context):
    raw = context.client_context.custom["bedrockAgentCoreToolName"]
    tool = raw.split("___")[-1] if "___" in raw else raw.split("__")[-1]
    return TOOLS[tool](**event)
def get_patient_profile(patient_id):
    return ddb.Table(PATIENTS).get_item(Key={"patient_id": patient_id}).get("Item", {"error": "not found"})
def check_medication_interactions(medications):
    try:
        ref = _kb_retrieve("medication interaction reference for: " + ", ".join(medications))
        return {"medications": medications, "reference": ref, "note": "Not a substitute for clinician/pharmacist review."}
    except Exception:
        return {"medications": medications, "reference": [], "note": "Reference unavailable; advise a pharmacist. Not a substitute for clinician/pharmacist review."}
def search_providers(specialty, location="", availability=""):
    rows = ddb.Table(PROVIDERS).scan().get("Items", [])
    return {"providers": [p for p in rows if p.get("specialty") == specialty]}
def book_appointment(provider_id, patient_id, date):
    return {"confirmed": True, "provider_id": provider_id, "date": date}
def generate_visit_summary(patient_id, symptoms, duration):
    return {"patient_id": patient_id, "symptoms": symptoms, "duration": duration, "note": "structured, no diagnosis"}
def get_triage_guidance(symptoms, duration=""):
    try:
        query = (symptoms + " " + duration).strip()
        guidance = _kb_retrieve(query)
        return {"guidance": guidance, "source": "health-companion-kb"}
    except Exception:
        return {"guidance": ["Guidance unavailable; advise the patient to seek appropriate professional care and escalate urgent red-flag symptoms."], "source": "fallback"}
TOOLS = {"get_patient_profile": get_patient_profile, "check_medication_interactions": check_medication_interactions,
         "search_providers": search_providers, "book_appointment": book_appointment,
         "generate_visit_summary": generate_visit_summary, "get_triage_guidance": get_triage_guidance}
