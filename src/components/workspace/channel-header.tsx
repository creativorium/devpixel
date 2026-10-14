"use client";

import { useState, useTransition } from "react";
import { renameChannel } from "@/app/(workspace)/teams/actions";
import { channelSlug, isAdmin, privateChatName, type Channel } from "@/lib/workspace/model";
import { useTeam } from "./team-context";
import ResourceVisibility from "./resource-visibility";
import VisibilityBadge from "./visibility-badge";
import PrivateChatControls from "./private-chat-controls";

export default function ChannelHeader({ channel }: { channel: Channel }) {
  const { me, team } = useTeam();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(channel.name);
  const [topic, setTopic] = useState(channel.topic);
  const [error, setError] = useState("");
  const [pending, start] = useTransition();

  if (channel.direct_members) return <header className="ws-chat-head">
    <h1>{privateChatName(channel, team, me?.email ?? "")}</h1>
    <span className="ws-meta">Private · {channel.direct_members.length === 2 ? "Only you two" : `${channel.direct_members.length} participants`}</span>
    <div className="ws-resource-actions"><PrivateChatControls channel={channel}/></div>
  </header>;

  if (!editing)
    return (
      <header className="ws-chat-head">
        <h1>
          <span aria-hidden="true">#</span>
          {channel.name}
        </h1>
        <VisibilityBadge visibleTo={channel.visible_to} />
        {channel.topic && <p>{channel.topic}</p>}
        {isAdmin(me) && (
          <div className="ws-resource-actions">
            <ResourceVisibility kind="channel" id={channel.id} />
            <button
              type="button"
              className="ws-button ghost small"
              onClick={() => {
                setName(channel.name);
                setTopic(channel.topic);
                setError("");
                setEditing(true);
              }}
            >
              Edit channel
            </button>
          </div>
        )}
      </header>
    );

  const slug = channelSlug(name);
  return (
    <form
      className="ws-chat-head ws-chat-rename"
      onSubmit={(event) => {
        event.preventDefault();
        start(async () => {
          const result = await renameChannel(channel.id, name, topic);
          if (result.ok) setEditing(false);
          else setError(result.message);
        });
      }}
    >
      <label className="ws-field">
        Channel name
        <input
          className="ws-input"
          value={name}
          maxLength={60}
          required
          autoFocus
          onChange={(event) => setName(event.target.value)}
          onKeyDown={(event) => event.key === "Escape" && setEditing(false)}
        />
        {slug && slug !== name && (
          <span className="ws-meta">Will be saved as #{slug}</span>
        )}
      </label>
      <label className="ws-field ws-grow">
        Topic
        <input
          className="ws-input"
          value={topic}
          maxLength={200}
          placeholder="What is this channel for?"
          onChange={(event) => setTopic(event.target.value)}
          onKeyDown={(event) => event.key === "Escape" && setEditing(false)}
        />
      </label>
      <div className="ws-form-actions">
        <button type="submit" className="ws-button small" disabled={pending}>
          {pending ? "Saving…" : "Save"}
        </button>
        <button
          type="button"
          className="ws-button ghost small"
          onClick={() => setEditing(false)}
        >
          Cancel
        </button>
        {error && (
          <span className="ws-error-text" role="alert">
            {error}
          </span>
        )}
      </div>
    </form>
  );
}
