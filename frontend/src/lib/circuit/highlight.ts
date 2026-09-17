export interface Token {
  text: string;
  cls: string;
}

const KEYWORDS = new Set([
  // OpenQASM 3
  "OPENQASM", "include", "qubit", "bit", "gate", "reset", "measure",
  // Python (Qiskit / Cirq / PennyLane exports)
  "import", "from", "as", "def", "return", "in", "range", "pass",
]);

const MASTER_PATTERN =
  /(#.*$|\/\/.*$)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')|(\b\d+\.?\d*\b)|([A-Za-z_][A-Za-z0-9_.]*)(?=\s*\()|(\b[A-Za-z_][A-Za-z0-9_]*\b)|(\[|\]|\(|\)|[,;:@])/gm;

/**
 * Splits source into styled tokens per line for the code editor's highlight
 * overlay. Deliberately simple (single regex, no AST) so it never throws on
 * incomplete/invalid text while the user is mid-edit -- unrecognized spans
 * just render as plain text.
 */
export function tokenizeLines(code: string): Token[][] {
  return code.split("\n").map((line) => tokenizeLine(line));
}

function tokenizeLine(line: string): Token[] {
  const tokens: Token[] = [];
  let lastIndex = 0;
  MASTER_PATTERN.lastIndex = 0;

  let match: RegExpExecArray | null;
  while ((match = MASTER_PATTERN.exec(line))) {
    if (match.index > lastIndex) {
      tokens.push({ text: line.slice(lastIndex, match.index), cls: "" });
    }
    const [full, comment, string, number, call, word, punct] = match;
    if (comment !== undefined) tokens.push({ text: full, cls: "tok-comment" });
    else if (string !== undefined) tokens.push({ text: full, cls: "tok-string" });
    else if (number !== undefined) tokens.push({ text: full, cls: "tok-number" });
    else if (call !== undefined) tokens.push({ text: full, cls: "tok-call" });
    else if (word !== undefined) tokens.push({ text: full, cls: KEYWORDS.has(full) ? "tok-keyword" : "" });
    else if (punct !== undefined) tokens.push({ text: full, cls: "tok-punct" });
    lastIndex = match.index + full.length;
  }
  if (lastIndex < line.length) {
    tokens.push({ text: line.slice(lastIndex), cls: "" });
  }
  return tokens;
}
