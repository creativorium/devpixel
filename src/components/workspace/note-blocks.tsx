import { type Block } from "@/lib/workspace/note-format";
import { InlineText } from "./team-context";

// Renders parsed note blocks as plain React elements (no HTML injection).
export default function NoteBlocks({
  blocks,
  onToggle,
}: {
  blocks: Block[];
  onToggle?: (line: number) => void;
}) {
  const out: React.ReactNode[] = [];
  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i]!;
    if (block.type === "bullet" || block.type === "number") {
      const items: Block[] = [];
      while (blocks[i]?.type === block.type) items.push(blocks[i++]!);
      i--;
      const List = block.type === "bullet" ? "ul" : "ol";
      out.push(
        <List key={block.line}>
          {items.map((item) => (
            <li key={item.line}>
              {"text" in item && <InlineText text={item.text} />}
            </li>
          ))}
        </List>,
      );
      continue;
    }
    switch (block.type) {
      case "h1":
        out.push(
          <h2 key={block.line} className="ws-doc-h1">
            <InlineText text={block.text} />
          </h2>,
        );
        break;
      case "h2":
        out.push(
          <h3 key={block.line} className="ws-doc-h2">
            <InlineText text={block.text} />
          </h3>,
        );
        break;
      case "h3":
        out.push(
          <h4 key={block.line} className="ws-doc-h3">
            <InlineText text={block.text} />
          </h4>,
        );
        break;
      case "quote":
        out.push(
          <blockquote key={block.line}>
            <InlineText text={block.text} />
          </blockquote>,
        );
        break;
      case "divider":
        out.push(<hr key={block.line} />);
        break;
      case "blank":
        out.push(
          <div key={block.line} className="ws-doc-blank" aria-hidden="true" />,
        );
        break;
      case "code":
        out.push(
          <pre key={block.line}>
            <code>{block.text}</code>
          </pre>,
        );
        break;
      case "todo":
        out.push(
          <label
            key={block.line}
            className={`ws-todo${block.done ? " done" : ""}`}
          >
            <input
              type="checkbox"
              checked={block.done}
              disabled={!onToggle}
              onChange={() => onToggle?.(block.line)}
            />
            <span>
              <InlineText text={block.text} />
            </span>
          </label>,
        );
        break;
      default:
        out.push(
          <p key={block.line}>
            <InlineText text={block.text} />
          </p>,
        );
    }
  }
  return <div className="ws-doc-body">{out}</div>;
}
