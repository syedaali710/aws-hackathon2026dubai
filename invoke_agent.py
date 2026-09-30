#!/usr/bin/env python3
"""Invoke the deployed Health Companion AgentCore runtime directly."""
import sys, json, uuid, boto3

REGION = "us-west-2"
RUNTIME_ARN = "arn:aws:bedrock-agentcore:us-west-2:233337493171:runtime/AgentCoreProject_HealthAgent-DFikuE3ZhO"

prompt = sys.argv[1] if len(sys.argv) > 1 else "Hello"

client = boto3.client("bedrock-agentcore", region_name=REGION)

resp = client.invoke_agent_runtime(
    agentRuntimeArn=RUNTIME_ARN,
    runtimeSessionId=uuid.uuid4().hex + uuid.uuid4().hex,  # >=33 chars
    payload=json.dumps({"prompt": prompt}).encode("utf-8"),
    contentType="application/json",
    accept="application/json",
)

# Response body is a streaming payload
body = resp.get("response")
if body is None:
    print(json.dumps({k: str(v) for k, v in resp.items()}, indent=2))
else:
    data = body.read()
    try:
        parsed = json.loads(data)
        print(json.dumps(parsed, indent=2))
    except Exception:
        print(data.decode("utf-8", errors="replace"))
