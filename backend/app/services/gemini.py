import time

from google import genai
from google.genai import errors as genai_errors
from google.genai import types

from app.config import settings

EMBEDDING_MODEL = "gemini-embedding-001"
EMBEDDING_DIM = 768

# Gemini's hosted models occasionally return a transient 503 ("high demand") that
# clears up within a couple seconds -- worth a couple retries before giving up.
_RETRYABLE_STATUS_CODES = {429, 503}
_MAX_ATTEMPTS = 3
_RETRY_BACKOFF_SECONDS = 2

_client: genai.Client | None = None


def _get_client() -> genai.Client:
    global _client
    if _client is None:
        _client = genai.Client(api_key=settings.gemini_api_key)
    return _client


def _with_retries(call):
    last_error: Exception | None = None
    for attempt in range(1, _MAX_ATTEMPTS + 1):
        try:
            return call()
        except genai_errors.APIError as exc:
            last_error = exc
            if getattr(exc, "code", None) not in _RETRYABLE_STATUS_CODES or attempt == _MAX_ATTEMPTS:
                raise
            time.sleep(_RETRY_BACKOFF_SECONDS * attempt)
    raise last_error  # pragma: no cover - unreachable, satisfies type checkers


def embed_text(text: str, task_type: str = "RETRIEVAL_DOCUMENT") -> list[float]:
    """Embed text with gemini-embedding-001 at 768 dims (must match every call site
    and the Qdrant collection). Truncated (non-native-3072) outputs aren't
    pre-normalized by the API, so we L2-normalize here for cosine search to work."""
    result = _with_retries(
        lambda: _get_client().models.embed_content(
            model=EMBEDDING_MODEL,
            contents=text,
            config=types.EmbedContentConfig(
                output_dimensionality=EMBEDDING_DIM,
                task_type=task_type,
            ),
        )
    )
    vector = list(result.embeddings[0].values)
    norm = sum(v * v for v in vector) ** 0.5
    if norm > 0:
        vector = [v / norm for v in vector]
    return vector


def generate(system_instruction: str, prompt: str, history: list[dict] | None = None) -> str:
    contents: list[types.Content] = []
    for turn in history or []:
        role = "model" if turn.get("role") == "model" else "user"
        contents.append(types.Content(role=role, parts=[types.Part(text=turn.get("content", ""))]))
    contents.append(types.Content(role="user", parts=[types.Part(text=prompt)]))

    response = _with_retries(
        lambda: _get_client().models.generate_content(
            model=settings.gemini_chat_model,
            contents=contents,
            config=types.GenerateContentConfig(system_instruction=system_instruction),
        )
    )
    return response.text or ""
