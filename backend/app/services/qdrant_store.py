from qdrant_client import QdrantClient
from qdrant_client.models import (
    Distance,
    FieldCondition,
    Filter,
    MatchValue,
    PayloadSchemaType,
    PointStruct,
    VectorParams,
)

from app.config import settings
from app.services.gemini import EMBEDDING_DIM

COLLECTION_NAME = "qylo_lessons"

_client: QdrantClient | None = None


def get_client() -> QdrantClient:
    global _client
    if _client is None:
        _client = QdrantClient(url=settings.qdrant_url, api_key=settings.qdrant_api_key)
    return _client


def ensure_collection() -> None:
    client = get_client()
    existing = [c.name for c in client.get_collections().collections]
    if COLLECTION_NAME not in existing:
        client.create_collection(
            collection_name=COLLECTION_NAME,
            vectors_config=VectorParams(size=EMBEDDING_DIM, distance=Distance.COSINE),
        )
    # Filtering by module_code (e.g. scoping RAG search to the current lesson's
    # module) requires an explicit payload index on Qdrant Cloud.
    client.create_payload_index(
        collection_name=COLLECTION_NAME,
        field_name="module_code",
        field_schema=PayloadSchemaType.KEYWORD,
    )


def upsert_points(points: list[PointStruct]) -> None:
    if not points:
        return
    get_client().upsert(collection_name=COLLECTION_NAME, points=points)


def search(vector: list[float], limit: int = 5, module_code: str | None = None):
    query_filter = None
    if module_code:
        query_filter = Filter(
            must=[FieldCondition(key="module_code", match=MatchValue(value=module_code))]
        )
    result = get_client().query_points(
        collection_name=COLLECTION_NAME,
        query=vector,
        limit=limit,
        query_filter=query_filter,
        with_payload=True,
    )
    return result.points
