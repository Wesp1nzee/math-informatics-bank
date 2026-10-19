from __future__ import annotations

import asyncio
import getpass
import sys

from sqlalchemy import select

from app.core.security import hash_password
from app.db.session import session_scope
from app.domains.users.models import User, UserRole


async def create_admin(email: str, password: str, display_name: str | None) -> None:
    normalized = email.strip().lower()
    async with session_scope() as session:
        existing = await session.scalar(select(User).where(User.email == normalized))
        if existing is not None:
            existing.role = UserRole.ADMIN
            await session.flush()
            print(f"User {existing.email} already exists — promoted to admin.")
            return

        session.add(
            User(
                email=normalized,
                hashed_password=hash_password(password),
                display_name=display_name,
                role=UserRole.ADMIN,
            )
        )
        print(f"Admin {normalized} created.")


def main() -> None:
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)

    email = sys.argv[1]
    display_name = sys.argv[2] if len(sys.argv) > 2 else None
    password = getpass.getpass("Password: ")
    if len(password) < 8:
        print("Password must be at least 8 characters.")
        sys.exit(1)

    asyncio.run(create_admin(email, password, display_name))


if __name__ == "__main__":
    main()
