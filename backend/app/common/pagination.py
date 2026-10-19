from __future__ import annotations

import math
from collections.abc import Sequence

from fastapi import Query
from pydantic import BaseModel, Field

DEFAULT_PAGE_SIZE = 10
MAX_PAGE_SIZE = 100


class PaginationParams:
    pass

    def __init__(
        self,
        page: int = Query(1, ge=1, description="Номер страницы, начиная с 1"),
        page_size: int = Query(
            DEFAULT_PAGE_SIZE, ge=1, le=MAX_PAGE_SIZE, description="Элементов на странице"
        ),
    ) -> None:
        self.page = page
        self.page_size = page_size

    @property
    def offset(self) -> int:
        return (self.page - 1) * self.page_size

    @property
    def limit(self) -> int:
        return self.page_size

    def page_count(self, total: int) -> int:
        return max(1, math.ceil(total / self.page_size)) if total else 1


class Page[T](BaseModel):
    pass

    items: list[T]
    total: int
    page: int
    page_size: int
    page_count: int = Field(description="Всего страниц, минимум 1")


def build_page[T](items: Sequence[T], total: int, params: PaginationParams) -> Page[T]:
    return Page(
        items=list(items),
        total=total,
        page=params.page,
        page_size=params.page_size,
        page_count=params.page_count(total),
    )
