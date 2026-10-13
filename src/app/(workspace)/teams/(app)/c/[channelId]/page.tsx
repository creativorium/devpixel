import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ChatChannel from "@/components/workspace/chat-channel";
import { getChannel, getMessages } from "@/lib/workspace/queries";
import { requireMember } from "@/lib/workspace/session";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ channelId: string }>;
}): Promise<Metadata> {
  const channel = await getChannel((await params).channelId);
  return { title: channel ? `#${channel.name}` : "Channel" };
}

export default async function ChannelPage({
  params,
}: {
  params: Promise<{ channelId: string }>;
}) {
  const { me, team } = await requireMember();
  const { channelId } = await params;
  const channel = await getChannel(channelId);
  if (!channel) notFound();
  const messages = await getMessages(channel.id);
  return (
    <ChatChannel
      key={channel.id}
      channel={channel}
      initial={messages}
      team={team}
      me={me}
    />
  );
}
