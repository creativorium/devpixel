// Notion-style notes stored as plain text with light Markdown. Parsed into blocks and
// rendered as React elements (never raw HTML), so note content cannot inject markup.

export type Block =
  | { type: "h1" | "h2" | "h3" | "quote" | "p"; text: string; line: number }
  | { type: "bullet" | "number"; text: string; line: number }
  | { type: "todo"; text: string; done: boolean; line: number }
  | { type: "divider"; line: number }
  | { type: "code"; text: string; line: number };

export function parseBlocks(body: string): Block[] {
  const lines = body.replace(/\r\n?/g, "\n").split("\n");
  const blocks: Block[] = [];
  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i]!;
    const line = raw.trimEnd();
    if (line.trim() === "") continue;
    if (line.startsWith("```")) {
      const start = i;
      const code: string[] = [];
      while (++i < lines.length && !lines[i]!.startsWith("```"))
        code.push(lines[i]!);
      blocks.push({ type: "code", text: code.join("\n"), line: start });
      continue;
    }
    let m: RegExpMatchArray | null;
    if ((m = line.match(/^(#{1,3})\s+(.*)$/)))
      blocks.push({
        type: (["h1", "h2", "h3"] as const)[m[1]!.length - 1]!,
        text: m[2]!,
        line: i,
      });
    else if (/^(-{3,}|\*{3,})$/.test(line.trim()))
      blocks.push({ type: "divider", line: i });
    else if ((m = line.match(/^\s*[-*]?\s*\[( |x|X)\]\s+(.*)$/)))
      blocks.push({ type: "todo", done: m[1] !== " ", text: m[2]!, line: i });
    else if ((m = line.match(/^\s*[-*•]\s+(.*)$/)))
      blocks.push({ type: "bullet", text: m[1]!, line: i });
    else if ((m = line.match(/^\s*\d+[.)]\s+(.*)$/)))
      blocks.push({ type: "number", text: m[1]!, line: i });
    else if ((m = line.match(/^>\s?(.*)$/)))
      blocks.push({ type: "quote", text: m[1]!, line: i });
    else blocks.push({ type: "p", text: line, line: i });
  }
  return blocks;
}

/** Flip the checkbox on one line, leaving every other character untouched. */
export function toggleTodo(body: string, line: number): string {
  const lines = body.split("\n");
  const current = lines[line];
  if (current === undefined) return body;
  lines[line] = current.replace(/\[( |x|X)\]/, (_, mark: string) =>
    mark === " " ? "[x]" : "[ ]",
  );
  return lines.join("\n");
}

export type Inline =
  | { type: "text"; text: string }
  | { type: "bold" | "italic" | "code"; text: string }
  | { type: "link"; text: string; href: string }
  | { type: "mention"; text: string; email: string };

const inlinePattern =
  /(\*\*([^*]+)\*\*)|(`([^`]+)`)|(\[([^\]]+)\]\((https?:\/\/[^\s)]+)\))|(https?:\/\/[^\s)]+)|(_([^_]+)_)|(@\[([^\]]{1,80})\]\(([^()\s]+@[^()\s]+)\))/g;

/** Bold, italic, code, http(s) links and @mentions; anything else stays plain text. */
export function parseInline(text: string): Inline[] {
  const parts: Inline[] = [];
  let last = 0;
  for (const m of text.matchAll(inlinePattern)) {
    if (m.index! > last)
      parts.push({ type: "text", text: text.slice(last, m.index) });
    if (m[2]) parts.push({ type: "bold", text: m[2] });
    else if (m[4]) parts.push({ type: "code", text: m[4] });
    else if (m[6]) parts.push({ type: "link", text: m[6], href: m[7]! });
    else if (m[8]) parts.push({ type: "link", text: m[8], href: m[8] });
    else if (m[10]) parts.push({ type: "italic", text: m[10] });
    else if (m[12])
      parts.push({ type: "mention", text: m[12], email: m[13]!.toLowerCase() });
    last = m.index! + m[0].length;
  }
  if (last < text.length) parts.push({ type: "text", text: text.slice(last) });
  return parts;
}

export function todoProgress(blocks: Block[]) {
  const todos = blocks.filter((b) => b.type === "todo");
  return {
    total: todos.length,
    done: todos.filter((b) => b.type === "todo" && b.done).length,
  };
}

/** A stable accent colour per project, like ClickUp's space colours. */
const palette = [
  "#e2554f",
  "#e8913a",
  "#d4b13b",
  "#4fa36b",
  "#3f8fc4",
  "#7b6cd9",
  "#c45fa3",
  "#5e8c8a",
];
export function projectColor(id: string) {
  let hash = 0;
  for (const ch of id) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return palette[hash % palette.length]!;
}
