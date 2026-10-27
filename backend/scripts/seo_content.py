from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from app.domains.articles.schemas import ArticleContent

CONTENT_DIR = Path(__file__).resolve().parent.parent / "content" / "seo"


def load_seo_articles() -> list[dict[str, Any]]:
    """Load long-form SEO articles stored as JSON files.

    Keeping deep articles out of seed_content.py makes them easier to generate,
    review and update from the research pipeline.
    """

    articles: list[dict[str, Any]] = []
    if not CONTENT_DIR.exists():
        return articles

    for path in sorted(CONTENT_DIR.glob("*.json")):
        data = json.loads(path.read_text(encoding="utf-8"))
        required = {"slug", "title", "description", "subject", "exam", "reading_minutes", "content"}
        missing = required - data.keys()
        if missing:
            raise ValueError(f"{path}: missing fields {sorted(missing)}")
        ArticleContent.model_validate(data["content"])
        articles.append(data)

    slugs = [article["slug"] for article in articles]
    if len(slugs) != len(set(slugs)):
        raise ValueError("duplicate slugs in content/seo")
    return articles
