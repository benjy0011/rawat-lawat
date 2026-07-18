"""Rawat Lawat AI service.

A small FastAPI backend for the AI features that need a server-side key. It
verifies the caller's Supabase session, then calls Groq (via the OpenAI-
compatible API) to draft a doctor's admission recommendation.
"""
import datetime
import json
import os
import random
import string

import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, Header, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from openai import AsyncOpenAI
from pydantic import BaseModel

from gl_pdf import build_guarantee_letter

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_PUBLISHABLE_KEY = os.getenv("SUPABASE_PUBLISHABLE_KEY", "")
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GROQ_MODEL = os.getenv("GROQ_MODEL", "openai/gpt-oss-20b")
GROQ_BASE_URL = os.getenv("GROQ_BASE_URL", "https://api.groq.com/openai/v1")
CORS_ORIGINS = [
    origin.strip()
    for origin in os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
    if origin.strip()
]

# The OpenAI client points at Groq's OpenAI-compatible endpoint.
groq_client = (
    AsyncOpenAI(api_key=GROQ_API_KEY, base_url=GROQ_BASE_URL)
    if GROQ_API_KEY
    else None
)

app = FastAPI(title="Rawat Lawat AI service")
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SYSTEM_PROMPT = (
    "You are a clinical documentation assistant helping a doctor draft a concise "
    "admission recommendation for an inpatient insurance guarantee letter. "
    "Write two to three professional sentences that justify admission and "
    "treatment based on the diagnosis and estimated cost, and note that it is "
    "subject to insurer approval. Do not invent clinical details beyond what is "
    "provided. Return only the recommendation text, with no preamble."
)


class RecommendationRequest(BaseModel):
    diagnosis: str
    estimatedCost: str
    admissionReason: str | None = None


async def verify_user(authorization: str | None) -> dict:
    """Validate the Supabase access token by asking Supabase who it belongs to."""
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Missing bearer token")

    token = authorization.split(" ", 1)[1]
    async with httpx.AsyncClient(timeout=10) as client:
        response = await client.get(
            f"{SUPABASE_URL}/auth/v1/user",
            headers={
                "Authorization": f"Bearer {token}",
                "apikey": SUPABASE_PUBLISHABLE_KEY,
            },
        )

    if response.status_code != 200:
        raise HTTPException(status_code=401, detail="Invalid or expired session")
    return response.json()


@app.get("/health")
async def health() -> dict:
    return {
        "status": "ok",
        "model": GROQ_MODEL,
        "groq_configured": groq_client is not None,
    }


@app.post("/ai/recommendation")
async def recommendation(
    body: RecommendationRequest,
    authorization: str | None = Header(default=None),
) -> dict:
    await verify_user(authorization)

    if groq_client is None:
        raise HTTPException(
            status_code=500,
            detail="GROQ_API_KEY is not configured on the server.",
        )

    user_prompt = (
        f"Diagnosis: {body.diagnosis}\n"
        f"Estimated treatment cost: {body.estimatedCost}\n"
        f"Admission reason: {body.admissionReason or 'Not specified'}\n\n"
        "Draft the doctor's recommendation."
    )

    try:
        completion = await groq_client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_prompt},
            ],
            temperature=0.4,
        )
    except Exception as exc:  # noqa: BLE001 - surface any provider error to the client
        raise HTTPException(status_code=502, detail=f"AI service error: {exc}")

    text = (completion.choices[0].message.content or "").strip()
    return {"recommendation": text}


class GuaranteeLetterRequest(BaseModel):
    patientName: str
    memberId: str
    insurer: str
    hospitalName: str
    guaranteedAmount: str
    nric: str | None = None
    policyPlan: str | None = None
    diagnosis: str | None = None
    admissionReason: str | None = None
    admissionId: str | None = None


@app.post("/gl/pdf")
async def guarantee_letter(
    body: GuaranteeLetterRequest,
    authorization: str | None = Header(default=None),
) -> Response:
    await verify_user(authorization)

    today = datetime.date.today()
    reference = "GL-{date}-{suffix}".format(
        date=today.strftime("%Y%m%d"),
        suffix="".join(random.choices(string.ascii_uppercase + string.digits, k=4)),
    )
    valid_until = today + datetime.timedelta(days=30)

    data = {
        **body.model_dump(),
        "glReference": reference,
        "issueDate": today.strftime("%d %B %Y"),
        "validUntil": valid_until.strftime("%d %B %Y"),
    }

    pdf = build_guarantee_letter(data)
    filename = f"guarantee-letter-{reference}.pdf"
    return Response(
        content=pdf,
        media_type="application/pdf",
        headers={"Content-Disposition": f'inline; filename="{filename}"'},
    )


class ChatMessage(BaseModel):
    role: str
    content: str


class AssistantRequest(BaseModel):
    messages: list[ChatMessage]
    context: dict | None = None


ASSISTANT_SYSTEM = (
    "You are the Rawat Lawat claims assistant, helping a patient understand "
    "their hospital admission and insurance guarantee-letter status. Answer "
    "ONLY using the context provided below. If the answer is not in the "
    "context, say you do not have that information and suggest contacting the "
    "hospital admissions team. Be concise, warm, and clear. Do not give medical "
    "or legal advice; for clinical questions, advise contacting the hospital or "
    "doctor. Never invent statuses, amounts, or dates.\n\nCONTEXT:\n{context}"
)


@app.post("/ai/assistant")
async def assistant(
    body: AssistantRequest,
    authorization: str | None = Header(default=None),
) -> dict:
    await verify_user(authorization)

    if groq_client is None:
        raise HTTPException(
            status_code=500,
            detail="GROQ_API_KEY is not configured on the server.",
        )

    system = ASSISTANT_SYSTEM.format(
        context=json.dumps(body.context or {}, ensure_ascii=False, indent=2)
    )
    # Only forward valid user/assistant turns, and cap the history length.
    history = [
        {"role": message.role, "content": message.content}
        for message in body.messages
        if message.role in ("user", "assistant") and message.content.strip()
    ][-12:]

    try:
        completion = await groq_client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[{"role": "system", "content": system}, *history],
            temperature=0.3,
        )
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=502, detail=f"AI service error: {exc}")

    reply = (completion.choices[0].message.content or "").strip()
    return {"reply": reply}
