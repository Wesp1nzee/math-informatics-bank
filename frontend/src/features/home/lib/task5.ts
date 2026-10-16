export const TASK5_CODE: readonly string[] = [
  "def r(n):",
  "    s = bin(n)[2:]",
  "    s += str(s.count('1') % 2)",
  "    s += str(s.count('1') % 2)",
  "    return int(s, 2)",
  "",
  "n = 1",
  "while r(n) <= 83:",
  "    n += 1",
  "",
  "print(r(n))  # 86",
];

export const TASK5_THRESHOLD = 83;

export const TASK5_SOLUTION = { n: 21, r: 86 } as const;

export function isPythonKeyword(word: string): boolean {
  return word === "def" || word === "return" || word === "while";
}

export function isPythonBuiltin(word: string): boolean {
  return (
    word === "bin" ||
    word === "str" ||
    word === "int" ||
    word === "print" ||
    word === "count"
  );
}

export function countOnes(binary: string): number {
  let count = 0;
  for (const char of binary) {
    if (char === "1") count += 1;
  }
  return count;
}

export function rOf(n: number): number {
  let binary = n.toString(2);
  for (let step = 0; step < 2; step += 1) {
    binary += String(countOnes(binary) % 2);
  }
  return Number.parseInt(binary, 2);
}

export function highlightPython(line: string): string {
  const escaped = line
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  return escaped.replace(
    /(#.*$)|('[^']*')|\b(def|return|while)\b|\b(bin|str|int|print|count)\b|\b(\d+)\b/g,
    (
      match,
      comment?: string,
      string?: string,
      keyword?: string,
      fn?: string,
      num?: string,
    ) => {
      if (comment) return `<span class="tok-comment">${match}</span>`;
      if (string) return `<span class="tok-string">${match}</span>`;
      if (keyword && isPythonKeyword(keyword))
        return `<span class="tok-keyword">${match}</span>`;
      if (fn && isPythonBuiltin(fn)) return `<span class="tok-fn">${match}</span>`;
      if (num) return `<span class="tok-number">${match}</span>`;
      return match;
    },
  );
}

export type Task5Run = {
  n: number;
  binary: string;
  r: number;
  hit: boolean;
};

export function solveTask5(threshold = TASK5_THRESHOLD): Task5Run[] {
  const runs: Task5Run[] = [];
  for (let n = 1; n <= 10_000; n += 1) {
    const r = rOf(n);
    const hit = r > threshold;
    runs.push({ n, binary: n.toString(2), r, hit });
    if (hit) break;
  }
  return runs;
}
