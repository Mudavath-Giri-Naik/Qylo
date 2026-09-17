from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import agent, challenges, circuits

app = FastAPI(title="Qylo API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url],
    # Every Vercel deploy (production alias + every preview URL) gets its own
    # unique origin for the same project -- accept any of them, not just the
    # one pinned in FRONTEND_URL.
    allow_origin_regex=r"^https://qylo(-[a-zA-Z0-9]+)*\.vercel\.app$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(circuits.router)
app.include_router(agent.router)
app.include_router(challenges.router)


@app.get("/")
def root():
    return {"service": "qylo-api", "status": "ok"}


@app.get("/health")
def health():
    return {"status": "ok"}
