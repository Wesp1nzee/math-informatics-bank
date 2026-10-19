from __future__ import annotations

import asyncio
import sys

from app.db.session import session_scope
from app.domains.leads.models import LeadStatus
from app.domains.leads.service import list_leads, update_lead_status


async def _list(status: LeadStatus | None) -> None:
    async with session_scope() as session:
        leads = await list_leads(session, status=status)
        if not leads:
            print("No leads.")
            return
        for lead in leads:
            print(
                f"#{lead.id}\t{lead.status.value}\t{lead.exam.value}\t"
                f"{lead.contact}\t{lead.name or '-'}"
            )


async def _set(lead_id: int, status: LeadStatus) -> None:
    async with session_scope() as session:
        lead = await update_lead_status(session, lead_id, status)
        print(f"Lead #{lead.id} -> {lead.status.value}")


def main() -> None:
    args = sys.argv[1:]
    if not args:
        print(__doc__)
        sys.exit(1)

    command = args[0]
    if command == "list":
        status = LeadStatus(args[1]) if len(args) > 1 else None
        asyncio.run(_list(status))
    elif command == "set" and len(args) == 3:
        asyncio.run(_set(int(args[1]), LeadStatus(args[2])))
    else:
        print(__doc__)
        sys.exit(1)


if __name__ == "__main__":
    main()
