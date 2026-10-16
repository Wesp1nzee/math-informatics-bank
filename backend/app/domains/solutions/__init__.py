"""Solution domain: answer checking and attempt history.

Anonymous checks are allowed (no user required); authenticated checks also
update the user's progress via the progress domain service.
"""

from app.domains.solutions.router import router

__all__ = ["router"]
