"""One-off (but safe-to-re-run) ingestion of every `lessons` row into Qdrant.

Run from the backend/ directory with the venv active:
    python -m scripts.ingest_lessons
"""

import sys
import uuid

from qdrant_client.models import PointStruct

from app.services import db, gemini, qdrant_store
from app.services.chunking import split_into_chunks

# Lesson titles include Hindi/Telugu script; make sure the console can print them
# regardless of the platform's default stdout encoding (e.g. Windows cp1252).
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")


def point_id_for(lesson_id: str, chunk_index: int) -> str:
    return str(uuid.uuid5(uuid.NAMESPACE_URL, f"{lesson_id}:{chunk_index}"))


def main() -> None:
    qdrant_store.ensure_collection()

    lessons = db.get_all_lessons()
    print(f"Fetched {len(lessons)} lessons from Supabase.")

    points: list[PointStruct] = []
    for lesson in lessons:
        chunks = split_into_chunks(lesson["body_markdown"])
        for i, chunk_text in enumerate(chunks):
            vector = gemini.embed_text(chunk_text, task_type="RETRIEVAL_DOCUMENT")
            points.append(
                PointStruct(
                    id=point_id_for(lesson["id"], i),
                    vector=vector,
                    payload={
                        "module_code": lesson["module_code"],
                        "lesson_id": lesson["id"],
                        "language": lesson["language"],
                        "chunk_text": chunk_text,
                    },
                )
            )
        print(f"  {lesson['module_code']} [{lesson['language']}] \"{lesson['title']}\": {len(chunks)} chunks")

    qdrant_store.upsert_points(points)
    print(f"\nDone. Ingested {len(lessons)} lessons into {len(points)} chunks in Qdrant.")


if __name__ == "__main__":
    main()
