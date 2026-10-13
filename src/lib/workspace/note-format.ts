// Notion-style notes stored as plain text with light Markdown. Parsed into blocks and
// rendered as React elements (never raw HTML), so note content cannot inject markup.

export type Block =
  | { type: "h1" | "h2" | "h3" | "quote" | "p"; text: string; line: number }
  | { type: "bullet" | "number"; text: string; line: number }
  | { type: "todo"; text: string; done: boolean; line: number }
  | { type: "divider" | "blank"; line: number }
  | { type: "code"; text: string; line: number };

export function parseBlocks(body: string): Block[] {
  const lines = body.replace(/\r\n?/g, "\n").split("\n");
  const blocks: Block[] = [];
  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i]!;
    const line = raw.trimEnd();
    // Keep the empty lines people type, so spacing reads as written.
    if (line.trim() === "") {
      if (blocks.length) blocks.push({ type: "blank", line: i });
      continue;
    }
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
  while (blocks.at(-1)?.type === "blank") blocks.pop();
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

// ---------- Editing helpers for the toolbar and keyboard shortcuts ----------

export type Edit = { text: string; start: number; end: number };

/** Wraps the selection in a marker (**bold**, _italic_, `code`), or unwraps it. */
export function toggleWrap(
  text: string,
  start: number,
  end: number,
  marker: string,
  placeholder = "text",
): Edit {
  const before = text.slice(start - marker.length, start);
  const after = text.slice(end, end + marker.length);
  if (before === marker && after === marker)
    return {
      text:
        text.slice(0, start - marker.length) +
        text.slice(start, end) +
        text.slice(end + marker.length),
      start: start - marker.length,
      end: end - marker.length,
    };
  const inner = text.slice(start, end) || placeholder;
  return {
    text: text.slice(0, start) + marker + inner + marker + text.slice(end),
    start: start + marker.length,
    end: start + marker.length + inner.length,
  };
}

/** Turns the selection into a link, selecting the URL to replace. */
export function insertLink(text: string, start: number, end: number): Edit {
  const label = text.slice(start, end) || "link text";
  const url = "https://";
  const inserted = `[${label}](${url})`;
  const urlStart = start + label.length + 3;
  return {
    text: text.slice(0, start) + inserted + text.slice(end),
    start: urlStart,
    end: urlStart + url.length,
  };
}

const prefixPattern = /^(#{1,3} |- \[[ xX]\] |\[[ xX]\] |[-*] |\d+[.)] |> )/;

/** Sets (or removes, if already set) a block prefix on every selected line. */
export function togglePrefix(
  text: string,
  start: number,
  end: number,
  prefix: string,
): Edit {
  const lineStart = text.lastIndexOf("\n", start - 1) + 1;
  const nextBreak = text.indexOf("\n", Math.max(end - 1, start));
  const lineEnd = nextBreak === -1 ? text.length : nextBreak;
  const lines = text.slice(lineStart, lineEnd).split("\n");
  const allHave = lines.every((l) => l.startsWith(prefix));
  const changed = lines
    .map((l, i) => {
      const bare = l.replace(prefixPattern, "");
      if (allHave) return bare;
      return (prefix === "1. " ? `${i + 1}. ` : prefix) + bare;
    })
    .join("\n");
  const out = text.slice(0, lineStart) + changed + text.slice(lineEnd);
  return {
    text: out,
    start:
      lineStart +
      (lines.length === 1
        ? Math.max(
            0,
            changed.length - lines[0]!.replace(prefixPattern, "").length,
          )
        : 0),
    end: lineStart + changed.length,
  };
}

/** Enter inside a list continues it; Enter on an empty item ends the list. */
export function continueList(text: string, caret: number): Edit | null {
  const lineStart = text.lastIndexOf("\n", caret - 1) + 1;
  const line = text.slice(lineStart, caret);
  const m = line.match(
    /^(\s*)(- \[[ xX]\] |\[[ xX]\] |[-*] |(\d+)([.)]) )(.*)$/,
  );
  if (!m) return null;
  const [, indent, marker, num, sep, rest] = m;
  if (!rest!.trim()) {
    // Empty item: drop the marker instead of adding another.
    const out = text.slice(0, lineStart) + text.slice(caret);
    return { text: out, start: lineStart, end: lineStart };
  }
  const next = num
    ? `${Number(num) + 1}${sep} `
    : marker!.includes("[")
      ? marker!.replace(/\[[xX]\]/, "[ ]")
      : marker!;
  const insert = `\n${indent}${next}`;
  const out = text.slice(0, caret) + insert + text.slice(caret);
  return {
    text: out,
    start: caret + insert.length,
    end: caret + insert.length,
  };
}
