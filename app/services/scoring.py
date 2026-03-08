from __future__ import annotations

from collections.abc import Iterable

from app.constants import OPTION_SCORES, RESULT_TYPE_RULES


def _extract_selected_option(answer: object) -> str:
    if isinstance(answer, dict):
        return str(answer["selected_option"])
    return str(getattr(answer, "selected_option"))


def calculate_total_score(answers: Iterable[object]) -> int:
    total_score = 0
    for answer in answers:
        selected_option = _extract_selected_option(answer)
        if selected_option not in OPTION_SCORES:
            raise ValueError(f"Unsupported option: {selected_option}")
        total_score += OPTION_SCORES[selected_option]
    return total_score


def determine_result_type(score: int) -> str:
    for rule in RESULT_TYPE_RULES:
        if rule["min_score"] <= score <= rule["max_score"]:
            return str(rule["name"])
    raise ValueError(f"Score out of supported range: {score}")
