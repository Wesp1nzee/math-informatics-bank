"""Lead domain: заявки на репетиторские занятия (форма «подобрать занятие»)."""

from app.domains.leads.models import TutorLead
from app.domains.leads.router import router

__all__ = ["TutorLead", "router"]
