from __future__ import annotations

import math

from app.domains.articles.schemas import ArticleContent
from scripts.seed_content import ARTICLES

EXPECTED_NUMERIC_ANSWERS = {
    "oge6-num-1": 7,
    "oge11-num-1": 3,
    "oge15-num-1": 15,
    "oge19-num-1": 1080,
    "ogeinf5-num-1": 12,
    "egeinf2-num-1": 16,
    "egeinf4-num-1": 3,
    "egeinf5-num-1": 24,
    "egeinf8-num-1": 50,
    "fsum-num-1": 200,
    "powers-num-1": 4,
    "logic-num-1": 8,
    "ogescores-num-1": 22,
    "egeinfstruct-num-1": 29,
}


def test_article_slugs_are_unique() -> None:
    slugs = [article["slug"] for article in ARTICLES]
    assert len(slugs) == len(set(slugs))


def test_every_seed_article_matches_article_content_v2() -> None:
    for article in ARTICLES:
        content = ArticleContent.model_validate(article["content"])
        assert content.version == 2
        assert len(content.blocks) > 0


def test_numeric_seed_answers_are_verified() -> None:
    found: dict[str, float] = {}
    for article in ARTICLES:
        for block in article["content"]["blocks"]:
            if block["type"] != "numeric_input":
                continue
            value = block["data"]["correct_value"]
            assert math.isfinite(value)
            found[block["id"]] = value

    for block_id, expected in EXPECTED_NUMERIC_ANSWERS.items():
        assert found[block_id] == expected, block_id


def test_internal_seed_links_are_relative_paths() -> None:
    for article in ARTICLES:
        for block in article["content"]["blocks"]:
            for href in _hrefs(block):
                assert href.startswith("/") or href.startswith("https://"), href
                assert not href.startswith("//"), href


def _hrefs(value: object) -> list[str]:
    if isinstance(value, dict):
        result: list[str] = []
        if value.get("type") == "link" and isinstance(value.get("href"), str):
            result.append(value["href"])
        for nested in value.values():
            result.extend(_hrefs(nested))
        return result
    if isinstance(value, list):
        result = []
        for item in value:
            result.extend(_hrefs(item))
        return result
    return []
