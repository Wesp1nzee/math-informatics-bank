/** Runtime guards and helpers shared by the article renderer and the TOC. */

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

export function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

/** Allow only internal paths and absolute HTTPS links (defence in depth). */
export function safeHref(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  if (value.startsWith("/") && !value.startsWith("//")) return value;
  if (value.startsWith("https://") && value.length > "https://".length) {
    return value;
  }
  return undefined;
}

export function isExternalHref(href: string): boolean {
  return href.startsWith("https://");
}

/** Flatten structured inline nodes to plain text (used for TOC and labels). */
export function inlineNodesToText(nodes: unknown): string {
  if (!Array.isArray(nodes)) return "";

  return nodes
    .map((node) => {
      if (!isRecord(node)) return "";
      switch (node.type) {
        case "text":
        case "code":
          return asString(node.text);
        case "math":
          return asString(node.tex);
        case "br":
          return " ";
        case "strong":
        case "em":
        case "link":
          return inlineNodesToText(node.children);
        default:
          return "";
      }
    })
    .join("")
    .replace(/\s+/g, " ")
    .trim();
}
