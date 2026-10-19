from __future__ import annotations

import json
import re
from datetime import date, datetime
from typing import Annotated, Any, Literal

from pydantic import (
    BaseModel,
    Field,
    TypeAdapter,
    ValidationError,
    field_validator,
    model_validator,
)

from app.common.schemas import ORMModel
from app.domains.tasks.schemas import (
    FormulaBlock,
    HeadingBlock,
    ListBlock,
    ParagraphBlock,
    QuoteBlock,
)

ArticleBlock = Annotated[
    ParagraphBlock | HeadingBlock | ListBlock | FormulaBlock | QuoteBlock,
    Field(discriminator="type"),
]

article_blocks_adapter: TypeAdapter[list[ArticleBlock]] = TypeAdapter(list[ArticleBlock])


MAX_CONTENT_BYTES = 512 * 1024
MAX_BLOCKS = 500
MAX_TEXT_LENGTH = 20_000
MAX_TEX_LENGTH = 4_096
MAX_LINK_LENGTH = 2_048
MAX_OPTIONS = 20
MAX_GRAPH_EXPRESSIONS = 20
MAX_GRAPH_PARAMETERS = 20
MAX_SOLUTION_STEPS = 100
MAX_EXPRESSION_LENGTH = 512

_ID_RE = re.compile(r"^[a-zA-Z0-9_-]{1,64}$")
_SLUG_RE = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
_RESERVED_SLUGS = {"page"}
_GRAPH_FUNCTIONS = {
    "sin",
    "cos",
    "tan",
    "asin",
    "acos",
    "atan",
    "exp",
    "ln",
    "log2",
    "log10",
    "sqrt",
    "abs",
}
_GRAPH_CONSTANTS = {"pi", "e"}
_GRAPH_TOKEN_RE = re.compile(r"\d+(?:\.\d+)?|[A-Za-z_][A-Za-z0-9_]*|[+\-*/^()]")


def _validate_id(value: str) -> str:
    if not _ID_RE.match(value):
        raise ValueError("id must match ^[a-zA-Z0-9_-]{1,64}$")
    return value


def _validate_link(value: str) -> str:
    if len(value) > MAX_LINK_LENGTH:
        raise ValueError("link is too long")
    if value.startswith("/") and not value.startswith("//"):
        return value
    if value.startswith("https://") and len(value) > len("https://"):
        return value
    raise ValueError("link must be a relative path (/...) or an https:// URL")


def _validate_expression(expr: str, parameter_ids: set[str]) -> str:
    if not expr or len(expr) > MAX_EXPRESSION_LENGTH:
        raise ValueError(f"expression must be 1..{MAX_EXPRESSION_LENGTH} characters")

    leftover = _GRAPH_TOKEN_RE.sub("", expr)
    if leftover.strip():
        raise ValueError("expression contains unsupported characters")

    for token in _GRAPH_TOKEN_RE.findall(expr):
        if token[0].isdigit():
            continue
        if token in {"+", "-", "*", "/", "^", "(", ")"}:
            continue
        if token in _GRAPH_FUNCTIONS or token in _GRAPH_CONSTANTS:
            continue
        if token == "x" or token in parameter_ids:
            continue
        raise ValueError(f"unknown identifier in expression: {token}")

    depth = 0
    for char in expr:
        if char == "(":
            depth += 1
        elif char == ")":
            depth -= 1
            if depth < 0:
                raise ValueError("unbalanced parentheses in expression")
    if depth != 0:
        raise ValueError("unbalanced parentheses in expression")
    return expr


class TextNode(BaseModel):
    type: Literal["text"]
    text: str = Field(min_length=1, max_length=MAX_TEXT_LENGTH)


class StrongNode(BaseModel):
    type: Literal["strong"]
    children: list[InlineNode] = Field(min_length=1)


class EmNode(BaseModel):
    type: Literal["em"]
    children: list[InlineNode] = Field(min_length=1)


class CodeNode(BaseModel):
    type: Literal["code"]
    text: str = Field(min_length=1, max_length=MAX_TEXT_LENGTH)


class LinkNode(BaseModel):
    type: Literal["link"]
    href: str
    children: list[InlineNode] = Field(min_length=1)

    @field_validator("href")
    @classmethod
    def _href(cls, value: str) -> str:
        return _validate_link(value)


class InlineMathNode(BaseModel):
    type: Literal["math"]
    tex: str = Field(min_length=1, max_length=MAX_TEX_LENGTH)


class BreakNode(BaseModel):
    type: Literal["br"]


InlineNode = Annotated[
    TextNode | StrongNode | EmNode | CodeNode | LinkNode | InlineMathNode | BreakNode,
    Field(discriminator="type"),
]

for _recursive_model in (StrongNode, EmNode, LinkNode):
    _recursive_model.model_rebuild()


class BlockBase(BaseModel):
    id: str

    @field_validator("id")
    @classmethod
    def _id(cls, value: str) -> str:
        return _validate_id(value)


class RichTextBlockData(BaseModel):
    kind: Literal["paragraph", "heading", "list"]
    children: list[InlineNode] | None = None
    level: Literal[2, 3] | None = None
    ordered: bool = False
    items: list[list[InlineNode]] | None = None

    @model_validator(mode="after")
    def _validate_kind(self) -> RichTextBlockData:
        if self.kind == "paragraph":
            if not self.children:
                raise ValueError("paragraph requires children")
            if self.level is not None or self.ordered or self.items is not None:
                raise ValueError("paragraph must not set level/ordered/items")
        elif self.kind == "heading":
            if not self.children:
                raise ValueError("heading requires children")
            if self.level not in (2, 3):
                raise ValueError("heading requires level 2 or 3")
            if self.ordered or self.items is not None:
                raise ValueError("heading must not set ordered/items")
        else:
            if not self.items:
                raise ValueError("list requires items")
            if any(not item for item in self.items):
                raise ValueError("list items must be non-empty")
            if self.children is not None or self.level is not None:
                raise ValueError("list must not set children/level")
        return self


class RichTextBlock(BlockBase):
    type: Literal["rich_text"]
    data: RichTextBlockData


class MathBlockData(BaseModel):
    tex: str = Field(min_length=1, max_length=MAX_TEX_LENGTH)
    display: bool = True
    caption: str | None = Field(default=None, max_length=512)


class MathBlock(BlockBase):
    type: Literal["math"]
    data: MathBlockData


class GraphExpression(BaseModel):
    id: str
    expr: str
    label: str | None = Field(default=None, max_length=128)
    color: str | None = None

    @field_validator("id")
    @classmethod
    def _id(cls, value: str) -> str:
        return _validate_id(value)

    @field_validator("color")
    @classmethod
    def _color(cls, value: str | None) -> str | None:
        if value is not None and not re.fullmatch(r"#[0-9a-fA-F]{6}", value):
            raise ValueError("color must be #rrggbb")
        return value


class GraphParameter(BaseModel):
    id: str
    label: str = Field(min_length=1, max_length=64)
    min: float
    max: float
    step: float = Field(gt=0)
    default: float

    @field_validator("id")
    @classmethod
    def _id(cls, value: str) -> str:
        return _validate_id(value)

    @model_validator(mode="after")
    def _range(self) -> GraphParameter:
        if self.min >= self.max:
            raise ValueError("parameter min must be < max")
        if not self.min <= self.default <= self.max:
            raise ValueError("parameter default must be within [min, max]")
        return self


class GraphViewport(BaseModel):
    x_min: float
    x_max: float
    y_min: float
    y_max: float

    @model_validator(mode="after")
    def _range(self) -> GraphViewport:
        if self.x_min >= self.x_max:
            raise ValueError("viewport x_min must be < x_max")
        if self.y_min >= self.y_max:
            raise ValueError("viewport y_min must be < y_max")
        return self


class InteractiveGraphBlockData(BaseModel):
    engine: Literal["svg"]
    expressions: list[GraphExpression] = Field(min_length=1, max_length=MAX_GRAPH_EXPRESSIONS)
    parameters: list[GraphParameter] = Field(default_factory=list, max_length=MAX_GRAPH_PARAMETERS)
    viewport: GraphViewport | None = None
    interactions: list[Literal["pan", "zoom", "trace"]] = Field(default_factory=list)

    @model_validator(mode="after")
    def _validate_graph(self) -> InteractiveGraphBlockData:
        expression_ids = [item.id for item in self.expressions]
        if len(expression_ids) != len(set(expression_ids)):
            raise ValueError("duplicate expression ids")
        parameter_ids = [item.id for item in self.parameters]
        if len(parameter_ids) != len(set(parameter_ids)):
            raise ValueError("duplicate parameter ids")
        if set(expression_ids) & set(parameter_ids):
            raise ValueError("expression ids and parameter ids must be distinct")
        allowed = set(parameter_ids)
        for expression in self.expressions:
            _validate_expression(expression.expr, allowed)
        return self


class InteractiveGraphBlock(BlockBase):
    type: Literal["interactive_graph"]
    data: InteractiveGraphBlockData


class ChoiceOption(BaseModel):
    id: str
    label: list[InlineNode] = Field(min_length=1)

    @field_validator("id")
    @classmethod
    def _id(cls, value: str) -> str:
        return _validate_id(value)


class SingleChoiceBlockData(BaseModel):
    prompt: list[InlineNode] = Field(min_length=1)
    options: list[ChoiceOption] = Field(min_length=2, max_length=MAX_OPTIONS)
    correct_option_id: str
    explanation: list[InlineNode] | None = None
    points: float = Field(default=1, ge=0)

    @model_validator(mode="after")
    def _validate_choice(self) -> SingleChoiceBlockData:
        option_ids = [option.id for option in self.options]
        if len(option_ids) != len(set(option_ids)):
            raise ValueError("duplicate option ids")
        if self.correct_option_id not in option_ids:
            raise ValueError("correct_option_id must reference an option")
        return self


class SingleChoiceBlock(BlockBase):
    type: Literal["single_choice"]
    data: SingleChoiceBlockData


class NumericInputBlockData(BaseModel):
    prompt: list[InlineNode] = Field(min_length=1)
    correct_value: float
    tolerance: float = Field(default=1e-9, ge=0)
    unit: str = Field(default="", max_length=64)
    explanation: list[InlineNode] | None = None
    points: float = Field(default=1, ge=0)


class NumericInputBlock(BlockBase):
    type: Literal["numeric_input"]
    data: NumericInputBlockData


class StepMath(BaseModel):
    tex: str = Field(min_length=1, max_length=MAX_TEX_LENGTH)
    display: bool = True


class SolutionStepV2(BaseModel):
    id: str
    note: list[InlineNode] = Field(min_length=1)
    math: StepMath | None = None

    @field_validator("id")
    @classmethod
    def _id(cls, value: str) -> str:
        return _validate_id(value)


class StepSolutionBlockData(BaseModel):
    steps: list[SolutionStepV2] = Field(min_length=1, max_length=MAX_SOLUTION_STEPS)

    @model_validator(mode="after")
    def _validate_steps(self) -> StepSolutionBlockData:
        step_ids = [step.id for step in self.steps]
        if len(step_ids) != len(set(step_ids)):
            raise ValueError("duplicate step ids")
        return self


class StepSolutionBlock(BlockBase):
    type: Literal["step_solution"]
    data: StepSolutionBlockData


class HintBlockData(BaseModel):
    title: str | None = Field(default=None, max_length=256)
    body: list[InlineNode] = Field(min_length=1)


class HintBlock(BlockBase):
    type: Literal["hint"]
    data: HintBlockData


class CalloutBlockData(BaseModel):
    kind: Literal["info", "tip", "warning", "danger"] = "info"
    title: str | None = Field(default=None, max_length=256)
    body: list[InlineNode] = Field(min_length=1)


class CalloutBlock(BlockBase):
    type: Literal["callout"]
    data: CalloutBlockData


class ImageBlockData(BaseModel):
    src: str
    alt: str = Field(min_length=1, max_length=512)
    caption: str | None = Field(default=None, max_length=512)
    width: int | None = Field(default=None, gt=0)
    height: int | None = Field(default=None, gt=0)

    @field_validator("src")
    @classmethod
    def _src(cls, value: str) -> str:
        return _validate_link(value)


class ImageBlock(BlockBase):
    type: Literal["image"]
    data: ImageBlockData


class DividerBlockData(BaseModel):
    variant: Literal["solid", "spaced"] = "solid"


class DividerBlock(BlockBase):
    type: Literal["divider"]
    data: DividerBlockData


ArticleBlockV2 = Annotated[
    RichTextBlock
    | MathBlock
    | InteractiveGraphBlock
    | SingleChoiceBlock
    | NumericInputBlock
    | StepSolutionBlock
    | HintBlock
    | CalloutBlock
    | ImageBlock
    | DividerBlock,
    Field(discriminator="type"),
]


class ArticleContent(BaseModel):
    pass

    version: Literal[2]
    blocks: list[ArticleBlockV2] = Field(max_length=MAX_BLOCKS)

    @model_validator(mode="after")
    def _validate_document(self) -> ArticleContent:
        block_ids = [block.id for block in self.blocks]
        if len(block_ids) != len(set(block_ids)):
            raise ValueError("duplicate block ids")
        serialized = json.dumps(self.model_dump(mode="json"), ensure_ascii=False)
        if len(serialized.encode("utf-8")) > MAX_CONTENT_BYTES:
            raise ValueError(f"content exceeds {MAX_CONTENT_BYTES} bytes")
        return self


class PublicSingleChoiceBlockData(BaseModel):
    prompt: list[InlineNode] = Field(min_length=1)
    options: list[ChoiceOption] = Field(min_length=2)
    points: float = 1


class PublicSingleChoiceBlock(BlockBase):
    type: Literal["single_choice"]
    data: PublicSingleChoiceBlockData


class PublicNumericInputBlockData(BaseModel):
    prompt: list[InlineNode] = Field(min_length=1)
    unit: str = ""
    points: float = 1


class PublicNumericInputBlock(BlockBase):
    type: Literal["numeric_input"]
    data: PublicNumericInputBlockData


PublicArticleBlock = Annotated[
    RichTextBlock
    | MathBlock
    | InteractiveGraphBlock
    | PublicSingleChoiceBlock
    | PublicNumericInputBlock
    | StepSolutionBlock
    | HintBlock
    | CalloutBlock
    | ImageBlock
    | DividerBlock,
    Field(discriminator="type"),
]


class PublicArticleContent(BaseModel):
    version: Literal[2]
    blocks: list[PublicArticleBlock]


_BLOCK_MODELS: dict[str, type[BaseModel]] = {
    "rich_text": RichTextBlock,
    "math": MathBlock,
    "interactive_graph": InteractiveGraphBlock,
    "single_choice": SingleChoiceBlock,
    "numeric_input": NumericInputBlock,
    "step_solution": StepSolutionBlock,
    "hint": HintBlock,
    "callout": CalloutBlock,
    "image": ImageBlock,
    "divider": DividerBlock,
}


def public_content_from_raw(raw: Any) -> PublicArticleContent | None:
    pass
    if not isinstance(raw, dict) or raw.get("version") != 2:
        return None
    raw_blocks = raw.get("blocks")
    if not isinstance(raw_blocks, list):
        return None

    public_blocks: list[Any] = []
    for raw_block in raw_blocks:
        if not isinstance(raw_block, dict):
            continue
        model = _BLOCK_MODELS.get(raw_block.get("type"))
        if model is None:
            continue
        try:
            block = model.model_validate(raw_block)
        except ValidationError:
            continue

        if isinstance(block, SingleChoiceBlock):
            public_blocks.append(
                PublicSingleChoiceBlock(
                    id=block.id,
                    type="single_choice",
                    data=PublicSingleChoiceBlockData(
                        prompt=block.data.prompt,
                        options=block.data.options,
                        points=block.data.points,
                    ),
                )
            )
        elif isinstance(block, NumericInputBlock):
            public_blocks.append(
                PublicNumericInputBlock(
                    id=block.id,
                    type="numeric_input",
                    data=PublicNumericInputBlockData(
                        prompt=block.data.prompt,
                        unit=block.data.unit,
                        points=block.data.points,
                    ),
                )
            )
        else:
            public_blocks.append(block)

    try:
        return PublicArticleContent(version=2, blocks=public_blocks)
    except ValidationError:
        return None


class ArticleRead(BaseModel):
    pass

    slug: str
    title: str
    description: str
    subject: str | None = None
    exam: str
    reading_minutes: int = Field(serialization_alias="readingMinutes")
    published: date | None = None
    updated: date | None = None
    blocks: list[ArticleBlock]
    content: PublicArticleContent | None = None
    is_demo: bool = Field(default=False, serialization_alias="isDemo")

    @classmethod
    def from_article(cls, article) -> ArticleRead:
        return cls(
            slug=article.slug,
            title=article.title,
            description=article.description,
            subject=article.subject.slug if article.subject else None,
            exam=article.exam,
            reading_minutes=article.reading_minutes,
            published=article.published_on,
            updated=article.updated_on,
            blocks=article_blocks_adapter.validate_python(article.blocks or []),
            content=public_content_from_raw(article.content),
            is_demo=False,
        )


class ArticleListItem(ORMModel):
    pass

    slug: str
    title: str
    description: str
    exam: str


class ArticleCreate(BaseModel):
    slug: str = Field(min_length=1, max_length=160)
    title: str = Field(min_length=1, max_length=256)
    description: str = Field(default="", max_length=1024)
    subject: str | None = Field(default=None, description="Slug предмета")
    exam: str = Field(default="ЕГЭ", max_length=64)
    reading_minutes: int = Field(default=5, ge=1)
    blocks: list[ArticleBlock] = Field(default_factory=list)
    content: ArticleContent | None = None

    @field_validator("slug")
    @classmethod
    def _slug(cls, value: str) -> str:
        if not _SLUG_RE.match(value):
            raise ValueError("slug must be lowercase latin letters/digits with hyphens")
        if value in _RESERVED_SLUGS:
            raise ValueError("slug is reserved")
        return value


class ArticleUpdate(BaseModel):
    slug: str | None = Field(default=None, min_length=1, max_length=160)
    title: str | None = Field(default=None, min_length=1, max_length=256)
    description: str | None = Field(default=None, max_length=1024)
    subject: str | None = Field(default=None, description="Slug предмета")
    exam: str | None = Field(default=None, max_length=64)
    reading_minutes: int | None = Field(default=None, ge=1)
    blocks: list[ArticleBlock] | None = None
    content: ArticleContent | None = None

    @field_validator("slug")
    @classmethod
    def _slug(cls, value: str | None) -> str | None:
        if value is None:
            return value
        if not _SLUG_RE.match(value):
            raise ValueError("slug must be lowercase latin letters/digits with hyphens")
        if value in _RESERVED_SLUGS:
            raise ValueError("slug is reserved")
        return value


class ArticleEditorRead(BaseModel):
    id: int
    slug: str
    title: str
    description: str
    subject: str | None = None
    exam: str
    reading_minutes: int = Field(serialization_alias="readingMinutes")
    blocks: list[ArticleBlock]
    content: dict[str, Any] | None = None
    content_version: int | None = Field(default=None, serialization_alias="contentVersion")
    is_published: bool = Field(serialization_alias="isPublished")
    published_on: date | None = Field(default=None, serialization_alias="publishedOn")
    updated_on: date | None = Field(default=None, serialization_alias="updatedOn")
    created_at: datetime = Field(serialization_alias="createdAt")
    updated_at: datetime = Field(serialization_alias="updatedAt")

    @classmethod
    def from_article(cls, article) -> ArticleEditorRead:
        return cls(
            id=article.id,
            slug=article.slug,
            title=article.title,
            description=article.description,
            subject=article.subject.slug if article.subject else None,
            exam=article.exam,
            reading_minutes=article.reading_minutes,
            blocks=article_blocks_adapter.validate_python(article.blocks or []),
            content=article.content,
            content_version=article.content_version,
            is_published=article.is_published,
            published_on=article.published_on,
            updated_on=article.updated_on,
            created_at=article.created_at,
            updated_at=article.updated_at,
        )


class ArticleExerciseCheckRequest(BaseModel):
    answer: str = Field(min_length=1, max_length=512, description="Ответ ученика")


class ArticleExerciseCheckResponse(BaseModel):
    is_correct: bool = Field(serialization_alias="isCorrect")
    checked_at: datetime = Field(serialization_alias="checkedAt")
    explanation: list[InlineNode] | None = None
    attempts: int | None = None
    solved: bool | None = None
