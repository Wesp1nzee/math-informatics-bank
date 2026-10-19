import type { TaskSubject } from "@/features/tasks/types";

/** Legacy (v1) article blocks, still served in `Article.blocks`. */
export type ArticleBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading"; text: string; id: string }
  | { type: "list"; ordered?: boolean; items: string[] }
  | { type: "formula"; tex: string; caption?: string }
  | { type: "quote"; text: string };

/** Inline nodes of the structured rich text (contract v2). */
export type InlineNode =
  | { type: "text"; text: string }
  | { type: "strong"; children: InlineNode[] }
  | { type: "em"; children: InlineNode[] }
  | { type: "code"; text: string }
  | { type: "link"; href: string; children: InlineNode[] }
  | { type: "math"; tex: string }
  | { type: "br" };

export type RichTextBlockData = {
  kind: "paragraph" | "heading" | "list";
  children?: InlineNode[];
  level?: 2 | 3;
  ordered?: boolean;
  items?: InlineNode[][];
};

export type MathBlockData = {
  tex: string;
  display?: boolean;
  caption?: string;
};

export type GraphExpression = {
  id: string;
  expr: string;
  label?: string;
  color?: string;
};

export type GraphParameter = {
  id: string;
  label: string;
  min: number;
  max: number;
  step: number;
  default: number;
};

export type GraphViewport = {
  x_min: number;
  x_max: number;
  y_min: number;
  y_max: number;
};

export type InteractiveGraphBlockData = {
  engine: "svg";
  expressions: GraphExpression[];
  parameters?: GraphParameter[];
  viewport?: GraphViewport;
  interactions?: Array<"pan" | "zoom" | "trace">;
};

export type ChoiceOption = {
  id: string;
  label: InlineNode[];
};

/** Public projection: the backend strips the correct answer and explanation. */
export type SingleChoiceBlockData = {
  prompt: InlineNode[];
  options: ChoiceOption[];
  points?: number;
};

/** Public projection: the backend strips the correct value, tolerance and explanation. */
export type NumericInputBlockData = {
  prompt: InlineNode[];
  unit?: string;
  points?: number;
};

export type StepMath = {
  tex: string;
  display?: boolean;
};

export type SolutionStepV2 = {
  id: string;
  note: InlineNode[];
  math?: StepMath;
};

export type StepSolutionBlockData = {
  steps: SolutionStepV2[];
};

export type HintBlockData = {
  title?: string;
  body: InlineNode[];
};

export type CalloutKind = "info" | "tip" | "warning" | "danger";

export type CalloutBlockData = {
  kind?: CalloutKind;
  title?: string;
  body: InlineNode[];
};

export type ImageBlockData = {
  src: string;
  alt: string;
  caption?: string;
  width?: number;
  height?: number;
};

export type DividerBlockData = {
  variant?: "solid" | "spaced";
};

export type ArticleBlockV2 =
  | { id: string; type: "rich_text"; data: RichTextBlockData }
  | { id: string; type: "math"; data: MathBlockData }
  | { id: string; type: "interactive_graph"; data: InteractiveGraphBlockData }
  | { id: string; type: "single_choice"; data: SingleChoiceBlockData }
  | { id: string; type: "numeric_input"; data: NumericInputBlockData }
  | { id: string; type: "step_solution"; data: StepSolutionBlockData }
  | { id: string; type: "hint"; data: HintBlockData }
  | { id: string; type: "callout"; data: CalloutBlockData }
  | { id: string; type: "image"; data: ImageBlockData }
  | { id: string; type: "divider"; data: DividerBlockData };

export type ArticleContent = {
  version: 2;
  blocks: ArticleBlockV2[];
};

export type Article = {
  slug: string;
  title: string;
  description: string;
  subject: TaskSubject | null;
  exam: string;
  readingMinutes: number;
  published: string;
  updated?: string;
  /** Legacy (v1) blocks. */
  blocks: ArticleBlock[];
  /** Structured interactive content (contract v2), `null` for legacy articles. */
  content?: ArticleContent | null;
  isDemo: boolean;
};

export type ArticleTocItem = {
  id: string;
  text: string;
};
