from typing import Any

PASS_SCORE = 100.0
FAIL_SCORE = 0.0


def grade_quiz(grading_rule: dict[str, Any], selected_index: int) -> tuple[bool, float]:
    passed = selected_index == grading_rule.get("correct_index")
    return passed, (PASS_SCORE if passed else FAIL_SCORE)


def grade_circuit_result(
    grading_rule: dict[str, Any], counts: dict[str, int]
) -> tuple[bool, float, dict[str, float]]:
    """Compare a real Qiskit Aer run's counts against the expected distribution.
    Quantum results are probabilistic, so this checks each expected outcome is
    within `tolerance` of its expected probability, and that outcomes outside
    the expected set don't carry more than `tolerance` of the probability mass."""
    expected_counts: dict[str, float] = grading_rule.get("expected_counts", {})
    tolerance: float = grading_rule.get("tolerance", 0.15)

    total = sum(counts.values()) or 1
    actual_probs = {outcome: count / total for outcome, count in counts.items()}

    for outcome, expected_prob in expected_counts.items():
        actual_prob = actual_probs.get(outcome, 0.0)
        if abs(actual_prob - expected_prob) > tolerance:
            return False, FAIL_SCORE, actual_probs

    unexpected_mass = sum(
        prob for outcome, prob in actual_probs.items() if outcome not in expected_counts
    )
    if unexpected_mass > tolerance:
        return False, FAIL_SCORE, actual_probs

    return True, PASS_SCORE, actual_probs
