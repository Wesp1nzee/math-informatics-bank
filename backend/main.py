"""Local development entrypoint: ``uv run python main.py``.

Delegates to uvicorn with autoreload. In production the Docker image runs
``uvicorn app.main:app`` directly after applying migrations.
"""

from __future__ import annotations

import uvicorn

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
