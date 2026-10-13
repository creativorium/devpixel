"use client";

import { useState, useTransition } from "react";
import { renameChannel } from "@/app/(workspace)/teams/actions";
import { channelSlug, isAdmin, type Channel } from "@/lib/workspace/model";
import { useTeam } from "./team-context";

export default function ChannelHeader({ channel }: { channel: Channel }) {
  const { me } = useTeam();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(channel.name);
  const [topic, setTopic] = useState(channel.topic);
  const [error, setError] = useState("");
  const [pending, start] = useTransition();

  if (!editing)
    return (
      <header className="ws-chat-head">
        <h1>
          <span aria-hidden="true">#</span>
          {channel.name}
        </h1>
        {channel.topic && <p>{channel.topic}</p>}
        {isAdmin(me) && (
          <button
            type="button"
            className="ws-button ghost small ws-chat-edit"
            onClick={() => {
              setName(channel.name);
              setTopic(channel.topic);
              setError("");
              setEditing(true);
            }}
          >
            Edit channel
          </button>
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
