import type { Message } from "@/lib/types";

export default function TranscriptView({ messages }: { messages: Message[] }) {
  if (messages.length === 0) {
    return <p className="text-sm text-zinc-400">No messages in this conversation.</p>;
  }

  return (
    <div className="flex max-h-96 flex-col gap-3 overflow-y-auto rounded-md border border-zinc-100 p-3 dark:border-zinc-800">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
        >
          <div
            className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm leading-relaxed ${
              message.role === "user"
                ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                : "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
            }`}
          >
            {message.content}
          </div>
        </div>
      ))}
    </div>
  );
}
