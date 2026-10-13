"use client";

import { createContext, Fragment, useContext } from "react";
import { memberName, type Member } from "@/lib/workspace/model";
import { parseInline } from "@/lib/workspace/note-format";

type TeamValue = { team: Member[]; me: Member | null };
const TeamContext = createContext<TeamValue>({ team: [], me: null });

export function TeamProvider({
  team,
  me,
  children,
}: TeamValue & { children: React.ReactNode }) {
  return <TeamContext value={{ team, me }}>{children}</TeamContext>;
}

export const useTeam = () => useContext(TeamContext);

/** A mention always shows the person's current display name. */
export function Mention({
  email,
  fallback,
}: {
  email: string;
  fallback: string;
}) {
  const { team, me } = useTeam();
  const known = team.some((m) => m.email === email);
  return (
    <span
      className={`ws-mention${me?.email === email ? " me" : ""}`}
      title={email}
    >
      @{known ? memberName(team, email) : fallback}
    </span>
  );
}

/** Inline Markdown (bold, italic, code, links, @mentions) as React elements. */
export function InlineText({ text }: { text: string }) {
  return parseInline(text).map((part, i) => {
    switch (part.type) {
      case "bold":
        return <strong key={i}>{part.text}</strong>;
      case "italic":
        return <em key={i}>{part.text}</em>;
      case "code":
        return <code key={i}>{part.text}</code>;
      case "link":
        return (
          <a key={i} href={part.href} target="_blank" rel="noopener noreferrer">
            {part.text}
          </a>
        );
      case "mention":
        return <Mention key={i} email={part.email} fallback={part.text} />;
      default:
        return <Fragment key={i}>{part.text}</Fragment>;
    }
  });
}

/** Multi-line plain text with inline formatting (chat messages, task descriptions). */
export function RichText({ text }: { text: string }) {
  return text.split("\n").map((line, i) => (
    <Fragment key={i}>
      {i > 0 && <br />}
      <InlineText text={line} />
    </Fragment>
  ));
}
