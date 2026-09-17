import httpx

from app.config import settings


def _headers() -> dict[str, str]:
    return {
        "apikey": settings.supabase_service_role_key,
        "Authorization": f"Bearer {settings.supabase_service_role_key}",
        "Content-Type": "application/json",
    }


def _get(path: str, params: dict[str, str]) -> list[dict]:
    resp = httpx.get(
        f"{settings.supabase_url}/rest/v1/{path}",
        params=params,
        headers=_headers(),
        timeout=15,
    )
    resp.raise_for_status()
    return resp.json()


def get_user(user_id: str) -> dict | None:
    rows = _get("users", {"id": f"eq.{user_id}", "select": "id,email,role,preferred_language"})
    return rows[0] if rows else None


def get_progress(user_id: str) -> list[dict]:
    return _get("progress", {"user_id": f"eq.{user_id}", "select": "*"})


def get_submissions(user_id: str) -> list[dict]:
    return _get("submissions", {"user_id": f"eq.{user_id}", "select": "*"})


def get_all_lessons() -> list[dict]:
    return _get(
        "lessons",
        {"select": "id,module_code,title,body_markdown,language,order_index"},
    )


def get_first_lesson() -> dict | None:
    rows = get_lesson_directory()
    return rows[0] if rows else None


def get_lesson_directory() -> list[dict]:
    """English lesson titles for every module, in order -- used to ground the
    progress/next-lesson tool so it can only recommend real content."""
    return _get(
        "lessons",
        {
            "select": "module_code,title,order_index",
            "language": "eq.en",
            "order": "module_code.asc,order_index.asc",
        },
    )
