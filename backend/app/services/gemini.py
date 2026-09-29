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

# If the configured chat model stays overloaded through every retry (or has
# been retired), answer with the next model instead of failing the request.
# Hosted Gemini availability shifts minute to minute, so keep a few options.
_FALLBACK_CHAT_MODELS = ["gemini-3.5-flash", "gemini-3-flash-preview", "gemini-flash-latest"]
_FALLTHROUGH_STATUS_CODES = _RETRYABLE_STATUS_CODES | {404}

# The model that last answered successfully is tried first for a few minutes,
# so every request doesn't re-queue behind an overloaded model's retries.
_STICKY_SECONDS = 300
_last_good_model: tuple[str, float] | None = None

_client: genai.Client | None = None


def _get_client() -> genai.Client:
    global _client
    if _client is None:
        _client = genai.Client(api_key=settings.gemini_api_key)
    return _client


def _with_retries(call, attempts: int = _MAX_ATTEMPTS):
    last_error: Exception | None = None
    for attempt in range(1, attempts + 1):
        try:
            return call()
        except genai_errors.APIError as exc:
            last_error = exc
            if getattr(exc, "code", None) not in _RETRYABLE_STATUS_CODES or attempt == attempts:
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

    global _last_good_model
    sticky = [_last_good_model[0]] if _last_good_model and time.time() - _last_good_model[1] < _STICKY_SECONDS else []
    models = list(dict.fromkeys([*sticky, settings.gemini_chat_model, *_FALLBACK_CHAT_MODELS]))
    for index, model in enumerate(models):
        try:
            response = _with_retries(
                lambda: _get_client().models.generate_content(
                    model=model,
                    contents=contents,
                    config=types.GenerateContentConfig(system_instruction=system_instruction),
                ),
                # With other models to fall back on, don't sit through the
                # full retry backoff on a busy one.
                attempts=_MAX_ATTEMPTS if index == len(models) - 1 else 2,
            )
            _last_good_model = (model, time.time())
            return response.text or ""
        except genai_errors.APIError as exc:
            if getattr(exc, "code", None) not in _FALLTHROUGH_STATUS_CODES or index == len(models) - 1:
                raise
    raise RuntimeError("unreachable")  # pragma: no cover
