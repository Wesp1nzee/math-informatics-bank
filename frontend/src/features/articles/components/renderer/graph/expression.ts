/**
 * Safe evaluator for the declarative graph grammar.
 *
 * Only the operators/functions allowed by the article contract are parsed. There
 * is no `eval`, `new Function`, property access or arbitrary code: unknown
 * identifiers and characters are rejected before evaluation.
 */

export class ExpressionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ExpressionError";
  }
}

const FUNCTION_NAMES = new Set([
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
]);

const CONSTANTS: Record<string, number> = {
  pi: Math.PI,
  e: Math.E,
};

const FUNCTIONS: Record<string, (value: number) => number> = {
  sin: Math.sin,
  cos: Math.cos,
  tan: Math.tan,
  asin: Math.asin,
  acos: Math.acos,
  atan: Math.atan,
  exp: Math.exp,
  ln: Math.log,
  log2: Math.log2,
  log10: Math.log10,
  sqrt: Math.sqrt,
  abs: Math.abs,
};

type Token =
  | { kind: "number"; value: number }
  | { kind: "identifier"; value: string }
  | { kind: "operator"; value: "+" | "-" | "*" | "/" | "^" }
  | { kind: "paren"; value: "(" | ")" };

type Node =
  | { kind: "number"; value: number }
  | { kind: "constant"; name: string }
  | { kind: "variable"; name: string }
  | { kind: "negate"; operand: Node }
  | {
      kind: "binary";
      op: "+" | "-" | "*" | "/" | "^";
      left: Node;
      right: Node;
    }
  | { kind: "call"; name: string; argument: Node };

const TOKEN_PATTERN = /\s*(\d+(?:\.\d+)?|[A-Za-z_][A-Za-z0-9_]*|[+\-*/^()])/g;
const MAX_EXPRESSION_LENGTH = 512;

function tokenize(expression: string): Token[] {
  const tokens: Token[] = [];
  let index = 0;

  while (index < expression.length) {
    if (/\s/.test(expression[index])) {
      index += 1;
      continue;
    }

    TOKEN_PATTERN.lastIndex = index;
    const match = TOKEN_PATTERN.exec(expression);
    if (!match || match.index !== index) {
      throw new ExpressionError(
        `Неподдерживаемый символ в выражении: «${expression[index]}»`,
      );
    }

    const raw = match[1];
    if (/^\d/.test(raw)) {
      tokens.push({ kind: "number", value: Number(raw) });
    } else if (/^[A-Za-z_]/.test(raw)) {
      tokens.push({ kind: "identifier", value: raw });
    } else if (raw === "(" || raw === ")") {
      tokens.push({ kind: "paren", value: raw });
    } else {
      tokens.push({
        kind: "operator",
        value: raw as "+" | "-" | "*" | "/" | "^",
      });
    }

    index = TOKEN_PATTERN.lastIndex;
  }

  return tokens;
}

class Parser {
  private position = 0;

  constructor(
    private readonly tokens: Token[],
    private readonly parameters: Set<string>,
  ) {}

  parse(): Node {
    const node = this.parseExpression();
    if (this.position < this.tokens.length) {
      throw new ExpressionError("Лишние символы в конце выражения");
    }
    return node;
  }

  private peek(): Token | undefined {
    return this.tokens[this.position];
  }

  private consume(): Token | undefined {
    const token = this.tokens[this.position];
    this.position += 1;
    return token;
  }

  private startsPrimary(token: Token | undefined): boolean {
    if (!token) return false;
    return (
      token.kind === "number" ||
      token.kind === "identifier" ||
      (token.kind === "paren" && token.value === "(")
    );
  }

  private parseExpression(): Node {
    let node = this.parseTerm();
    while (true) {
      const token = this.peek();
      if (token?.kind === "operator" && (token.value === "+" || token.value === "-")) {
        this.consume();
        node = {
          kind: "binary",
          op: token.value,
          left: node,
          right: this.parseTerm(),
        };
      } else {
        break;
      }
    }
    return node;
  }

  private parseTerm(): Node {
    let node = this.parseUnary();
    while (true) {
      const token = this.peek();
      if (token?.kind === "operator" && (token.value === "*" || token.value === "/")) {
        this.consume();
        node = {
          kind: "binary",
          op: token.value,
          left: node,
          right: this.parseUnary(),
        };
      } else if (this.startsPrimary(token)) {
        // Implicit multiplication: 2x, 2(x+1), (x+1)(x-1).
        node = {
          kind: "binary",
          op: "*",
          left: node,
          right: this.parseUnary(),
        };
      } else {
        break;
      }
    }
    return node;
  }

  private parseUnary(): Node {
    const token = this.peek();
    if (token?.kind === "operator" && (token.value === "+" || token.value === "-")) {
      this.consume();
      const operand = this.parseUnary();
      return token.value === "-" ? { kind: "negate", operand } : operand;
    }
    return this.parsePower();
  }

  private parsePower(): Node {
    let node = this.parsePrimary();
    const token = this.peek();
    if (token?.kind === "operator" && token.value === "^") {
      this.consume();
      node = {
        kind: "binary",
        op: "^",
        left: node,
        right: this.parseUnary(),
      };
    }
    return node;
  }

  private parsePrimary(): Node {
    const token = this.consume();
    if (!token) throw new ExpressionError("Неожиданный конец выражения");

    if (token.kind === "number") {
      return { kind: "number", value: token.value };
    }

    if (token.kind === "identifier") {
      const name = token.value;

      if (FUNCTION_NAMES.has(name)) {
        const open = this.consume();
        if (!open || open.kind !== "paren" || open.value !== "(") {
          throw new ExpressionError(`После функции ${name} ожидается «(»`);
        }
        const argument = this.parseExpression();
        const close = this.consume();
        if (!close || close.kind !== "paren" || close.value !== ")") {
          throw new ExpressionError("Не закрыта скобка");
        }
        return { kind: "call", name, argument };
      }

      if (name in CONSTANTS) {
        return { kind: "constant", name };
      }

      if (name === "x" || this.parameters.has(name)) {
        return { kind: "variable", name };
      }

      throw new ExpressionError(`Неизвестная переменная: ${name}`);
    }

    if (token.kind === "paren" && token.value === "(") {
      const node = this.parseExpression();
      const close = this.consume();
      if (!close || close.kind !== "paren" || close.value !== ")") {
        throw new ExpressionError("Не закрыта скобка");
      }
      return node;
    }

    throw new ExpressionError("Ожидалось число, переменная или «(»");
  }
}

type Evaluator = (x: number, parameters: Record<string, number>) => number;

/**
 * Compile the parsed AST into a tree of closures once. This removes the
 * recursive switch and `hasOwnProperty` lookup from the hot sampling loop:
 * every node becomes a plain function call, and missing parameters simply
 * produce `NaN` (the plot layer filters non-finite values).
 */
function compileNode(node: Node): Evaluator {
  switch (node.kind) {
    case "number": {
      const value = node.value;
      return () => value;
    }
    case "constant": {
      const value = CONSTANTS[node.name];
      return () => value;
    }
    case "variable": {
      if (node.name === "x") return (x) => x;
      const name = node.name;
      return (_x, parameters) => {
        const value = parameters[name];
        return typeof value === "number" ? value : Number.NaN;
      };
    }
    case "negate": {
      const operand = compileNode(node.operand);
      return (x, parameters) => -operand(x, parameters);
    }
    case "binary": {
      const left = compileNode(node.left);
      const right = compileNode(node.right);
      switch (node.op) {
        case "+":
          return (x, parameters) => left(x, parameters) + right(x, parameters);
        case "-":
          return (x, parameters) => left(x, parameters) - right(x, parameters);
        case "*":
          return (x, parameters) => left(x, parameters) * right(x, parameters);
        case "/":
          return (x, parameters) => left(x, parameters) / right(x, parameters);
        case "^":
          return (x, parameters) => left(x, parameters) ** right(x, parameters);
      }
      break;
    }
    case "call": {
      const fn = FUNCTIONS[node.name];
      const argument = compileNode(node.argument);
      return (x, parameters) => fn(argument(x, parameters));
    }
  }

  throw new ExpressionError("Некорректное выражение");
}

export type CompiledExpression = {
  evaluate: (x: number, parameters: Record<string, number>) => number;
};

export function compileExpression(
  expression: string,
  parameterIds: Iterable<string> = [],
): CompiledExpression {
  if (typeof expression !== "string" || expression.trim() === "") {
    throw new ExpressionError("Пустое выражение");
  }
  if (expression.length > MAX_EXPRESSION_LENGTH) {
    throw new ExpressionError("Выражение слишком длинное");
  }

  const tokens = tokenize(expression);
  const ast = new Parser(tokens, new Set(parameterIds)).parse();
  const evaluate = compileNode(ast);

  return { evaluate };
}
