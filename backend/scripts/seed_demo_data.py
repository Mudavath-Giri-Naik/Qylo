"""Seed one account with realistic demo activity so every page has data.

Writes ~6 weeks of learning history for a single user: completed lessons,
challenge submissions (a few failed-then-retried), and saved circuits, all
built from the real seeded lessons/challenges so every derived view (dashboard,
learn progress, streaks, heatmap, skills radar, achievements, sidebar qubits)
stays consistent. Dates are relative to "now", so re-run before a demo to keep
the streak current.

Demo circuits and submissions carry `"demo": true` in their JSON, so a re-run
replaces only them and `--remove` deletes only them. Lesson progress has no
spare field to tag, so the lessons this script covers get their completion
rows replaced (a lesson stays completed either way; only its date changes).

Usage (from backend/, with the venv active):
    python -m scripts.seed_demo_data --email you@example.com
    python -m scripts.seed_demo_data --email you@example.com --remove
"""

import argparse
import sys
from datetime import datetime, timedelta, timezone

import httpx
from dotenv import load_dotenv

load_dotenv()

from app.config import settings  # noqa: E402 -- reads env at import time


def _headers(extra: dict[str, str] | None = None) -> dict[str, str]:
    return {
        "apikey": settings.supabase_service_role_key,
        "Authorization": f"Bearer {settings.supabase_service_role_key}",
        "Content-Type": "application/json",
        **(extra or {}),
    }


def _url(table: str) -> str:
    return f"{settings.supabase_url}/rest/v1/{table}"


def _get(table: str, params: dict[str, str]) -> list[dict]:
    resp = httpx.get(_url(table), params=params, headers=_headers(), timeout=20)
    resp.raise_for_status()
    return resp.json()


def _insert(table: str, rows: list[dict]) -> None:
    if not rows:
        return
    resp = httpx.post(_url(table), json=rows, headers=_headers({"Prefer": "return=minimal"}), timeout=30)
    resp.raise_for_status()


def _delete(table: str, params: dict[str, str]) -> None:
    resp = httpx.delete(_url(table), params=params, headers=_headers(), timeout=20)
    resp.raise_for_status()


# ---------------------------------------------------------------------------
# Timeline helpers
# ---------------------------------------------------------------------------

NOW = datetime.now().astimezone()


def at(days_ago: int, hour: int, minute: int = 0) -> str:
    """A local-time timestamp `days_ago` days back, never later than now."""
    moment = (NOW - timedelta(days=days_ago)).replace(hour=hour, minute=minute, second=0, microsecond=0)
    moment = min(moment, NOW - timedelta(minutes=5))
    return moment.astimezone(timezone.utc).isoformat()


# ---------------------------------------------------------------------------
# Demo circuits -- the ones the lessons actually teach. Gate format matches
# frontend/src/lib/circuit/types.ts (CNOT/CZ qubits = [control, target]).
# ---------------------------------------------------------------------------

def g(gate_type: str, qubits: list[int], step: int, angle: float | None = None) -> dict:
    gate = {"type": gate_type, "qubits": qubits, "step": step}
    if angle is not None:
        gate["angle"] = angle
    return gate


def measure_all(n: int, step: int) -> list[dict]:
    return [g("MEASURE", [q], step) for q in range(n)]


SUPERPOSITION = {"num_qubits": 1, "gates": [g("H", [0], 0), *measure_all(1, 1)]}
BELL = {"num_qubits": 2, "gates": [g("H", [0], 0), g("CNOT", [0, 1], 1), *measure_all(2, 2)]}
BELL_CZ = {"num_qubits": 2, "gates": [g("H", [0], 0), g("H", [1], 0), g("CZ", [0, 1], 1), g("H", [1], 2), *measure_all(2, 3)]}
GHZ_3 = {"num_qubits": 3, "gates": [g("H", [0], 0), g("CNOT", [0, 1], 1), g("CNOT", [1, 2], 2), *measure_all(3, 3)]}
GHZ_4 = {"num_qubits": 4, "gates": [g("H", [0], 0), g("CNOT", [0, 1], 1), g("CNOT", [1, 2], 2), g("CNOT", [2, 3], 3), *measure_all(4, 4)]}
MINUS_STATE = {"num_qubits": 1, "gates": [g("X", [0], 0), g("H", [0], 1), g("Z", [0], 2), g("H", [0], 3), *measure_all(1, 4)]}
RY_ROTATION = {"num_qubits": 1, "gates": [g("RY", [0], 0, 1.0472), *measure_all(1, 1)]}
DEUTSCH_JOZSA_2 = {
    "num_qubits": 2,
    "gates": [g("X", [1], 0), g("H", [0], 1), g("H", [1], 1), g("CNOT", [0, 1], 2), g("H", [0], 3), g("MEASURE", [0], 4)],
}
DEUTSCH_JOZSA_3 = {
    "num_qubits": 3,
    "gates": [
        g("X", [2], 0), g("H", [0], 1), g("H", [1], 1), g("H", [2], 1),
        g("CNOT", [0, 2], 2), g("CNOT", [1, 2], 3),
        g("H", [0], 4), g("H", [1], 4), g("MEASURE", [0], 5), g("MEASURE", [1], 5),
    ],
}
GROVER_2 = {
    "num_qubits": 2,
    "gates": [
        g("H", [0], 0), g("H", [1], 0), g("CZ", [0, 1], 1),
        g("H", [0], 2), g("H", [1], 2), g("X", [0], 3), g("X", [1], 3),
        g("CZ", [0, 1], 4), g("X", [0], 5), g("X", [1], 5), g("H", [0], 6), g("H", [1], 6),
        *measure_all(2, 7),
    ],
}
TELEPORTATION = {
    "num_qubits": 3,
    "gates": [
        g("RY", [0], 0, 1.1), g("H", [1], 1), g("CNOT", [1, 2], 2), g("CNOT", [0, 1], 3), g("H", [0], 4),
        g("MEASURE", [0], 5), g("MEASURE", [1], 5), g("CNOT", [1, 2], 6), g("CZ", [0, 2], 7), g("MEASURE", [2], 8),
    ],
}
PHASE_KICKBACK = {
    "num_qubits": 3,
    "gates": [
        g("H", [0], 0), g("H", [1], 0), g("X", [2], 0), g("T", [0], 1), g("S", [1], 1),
        g("CZ", [0, 2], 2), g("CZ", [1, 2], 3), g("H", [0], 4), g("H", [1], 4), *measure_all(2, 5),
    ],
}

# (days_ago, hour, circuit) -- five in the last week so the sidebar's
# "Qubits Executed" bars have something to show.
CIRCUIT_TIMELINE = [
    (41, 19, SUPERPOSITION), (38, 20, BELL), (35, 18, GHZ_3), (33, 21, MINUS_STATE),
    (29, 19, DEUTSCH_JOZSA_2), (26, 20, BELL_CZ), (21, 17, TELEPORTATION), (17, 21, GROVER_2),
    (13, 19, PHASE_KICKBACK), (10, 20, GHZ_4), (6, 18, BELL), (5, 21, RY_ROTATION),
    (3, 19, DEUTSCH_JOZSA_3), (1, 20, GROVER_2), (0, 9, TELEPORTATION),
]

# Lessons completed per module, as (days_ago, hour) per lesson in order.
# M1 and M2 finished, M3 in progress, M4 not started yet.
LESSON_TIMELINE = {
    "QT-M1": [(40, 19), (39, 20), (37, 18), (36, 21)],
    "QT-M2": [(30, 19), (28, 20), (27, 21)],
    "QT-M3": [(9, 19), (7, 20), (5, 20), (2, 21), (0, 8)],
    "QT-M4": [],
}

# Challenge attempts, matched by the start of each seeded challenge's prompt
# (they were all inserted in one statement, so created_at can't order them):
# (prompt prefix, days_ago, hour, passed). A failed attempt followed by a pass
# reads as a learner retrying. Unlisted challenges -- the last QT-M3 one and
# all of QT-M4 -- stay unattempted, which is where "next up" points.
CHALLENGE_TIMELINE = [
    ("What does it mean for a qubit", 38, 21, True),
    ("What happens to a qubit", 38, 21, True),
    ("Two qubits are in the entangled", 36, 21, False),
    ("Two qubits are in the entangled", 35, 19, True),
    ("Build a circuit that puts 1 qubit", 34, 20, True),
    ("In a circuit diagram", 27, 21, True),
    ("Which gate, applied", 26, 20, True),
    ("What does a dashed", 8, 19, True),
    ("Build a Bell state", 6, 18, False),
    ("Build a Bell state", 6, 19, True),
    ("Using only one oracle", 4, 20, True),
    ("What speedup does Grover", 3, 21, False),
    ("What speedup does Grover", 1, 20, True),
]

FAILED_CIRCUIT_FEEDBACK = (
    "Close! Your circuit puts the first qubit into superposition, but the two qubits never interact, "
    "so you get all four outcomes instead of just 00 and 11. Add a CNOT with the superposed qubit "
    "as control to entangle them."
)


def circuit_attempt(grading_rule: dict, passed: bool) -> tuple[dict, dict]:
    """A plausible circuit + Aer-style counts for a circuit challenge attempt."""
    n = grading_rule.get("num_qubits", 1)
    if n == 1:
        return SUPERPOSITION, {"0": 509, "1": 515}
    if passed:
        return BELL, {"00": 498, "11": 526}
    return {"num_qubits": 2, "gates": [g("H", [0], 0), *measure_all(2, 1)]}, {"00": 507, "01": 517}


def build_submission(user_id: str, challenge: dict, passed: bool, timestamp: str) -> dict:
    rule = challenge.get("grading_rule") or {}
    if rule.get("type") == "circuit":
        circuit, counts = circuit_attempt(rule, passed)
        submitted = {"type": "circuit", "circuit_json": circuit, "counts": counts, "demo": True}
        feedback = None if passed else FAILED_CIRCUIT_FEEDBACK
    else:
        correct = rule.get("correct_index", 0)
        options = rule.get("options") or [None, None]
        wrong = next(i for i in range(len(options)) if i != correct)
        submitted = {"type": "quiz", "selected_index": correct if passed else wrong, "demo": True}
        feedback = None
    return {
        "user_id": user_id,
        "challenge_id": challenge["id"],
        "submitted_data": submitted,
        "score": 100.0 if passed else 0.0,
        "ai_feedback": feedback,
        "timestamp": timestamp,
    }


# ---------------------------------------------------------------------------


def find_user(email: str) -> dict:
    rows = _get("users", {"select": "id,email", "email": f"eq.{email}"})
    if not rows:
        sys.exit(f"No Qylo account found for {email} -- sign in to the site once first.")
    return rows[0]


def remove_demo(user_id: str, lesson_ids: list[str]) -> None:
    _delete("circuits", {"user_id": f"eq.{user_id}", "circuit_json->>demo": "eq.true"})
    _delete("submissions", {"user_id": f"eq.{user_id}", "submitted_data->>demo": "eq.true"})
    if lesson_ids:
        _delete("progress", {"user_id": f"eq.{user_id}", "lesson_id": f"in.({','.join(lesson_ids)})"})


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--email", required=True, help="email of the account to seed")
    parser.add_argument("--remove", action="store_true", help="delete this script's demo data instead")
    args = parser.parse_args()

    user = find_user(args.email)
    user_id = user["id"]

    lessons = _get("lessons", {"select": "id,module_code,order_index", "language": "eq.en", "order": "order_index.asc"})
    challenges = _get("challenges", {"select": "id,module_code,prompt,grading_rule"})

    lesson_rows: list[dict] = []
    for module_code, schedule in LESSON_TIMELINE.items():
        module_lessons = [l for l in lessons if l["module_code"] == module_code]
        for lesson, (days_ago, hour) in zip(module_lessons, schedule):
            lesson_rows.append({
                "user_id": user_id,
                "module_code": module_code,
                "lesson_id": lesson["id"],
                "status": "completed",
                "last_accessed": at(days_ago, hour, 15),
            })

    remove_demo(user_id, [row["lesson_id"] for row in lesson_rows])
    if args.remove:
        print(f"Removed demo data for {user['email']}.")
        return

    submission_rows: list[dict] = []
    for prefix, days_ago, hour, passed in CHALLENGE_TIMELINE:
        challenge = next((c for c in challenges if c["prompt"].startswith(prefix)), None)
        if challenge is None:
            print(f"  skipped: no challenge starting with {prefix!r}")
            continue
        submission_rows.append(build_submission(user_id, challenge, passed, at(days_ago, hour, 40 if passed else 20)))

    circuit_rows = [
        {"user_id": user_id, "circuit_json": {**circuit, "demo": True}, "created_at": at(days_ago, hour, 30)}
        for days_ago, hour, circuit in CIRCUIT_TIMELINE
    ]

    _insert("progress", lesson_rows)
    _insert("submissions", submission_rows)
    _insert("circuits", circuit_rows)

    solved = len({s["challenge_id"] for s in submission_rows if s["score"] >= 70})
    print(
        f"Seeded {user['email']}: {len(lesson_rows)} lessons completed, "
        f"{len(submission_rows)} challenge attempts ({solved} solved), {len(circuit_rows)} circuits."
    )


if __name__ == "__main__":
    main()
