"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  NetworkError,
  createSession,
  endSession,
  getSession,
  giveConsent,
  listMessages,
  listRoles,
  sendMessage,
} from "@/lib/api";
import type { Message, Role, Session, SessionStatus } from "@/lib/types";
import RoleSelector from "@/components/screening/RoleSelector";
import ConsentScreen from "@/components/screening/ConsentScreen";
import RefusedScreen from "@/components/screening/RefusedScreen";
import ChatPanel from "@/components/screening/ChatPanel";

function inactiveReason(status: SessionStatus): string {
  switch (status) {
    case "completed":
      return "This screening has ended. Thank you for your time!";
    case "consent_refused":
      return "The candidate declined the AI screen.";
    case "abandoned":
      return "This screening was abandoned.";
    default:
      return "This screening is no longer active.";
  }
}

export default function Home() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [rolesLoading, setRolesLoading] = useState(true);

  const [session, setSession] = useState<Session | null>(null);
  const [startLoading, setStartLoading] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [consentLoading, setConsentLoading] = useState<"accept" | "decline" | null>(null);
  const [consentError, setConsentError] = useState<string | null>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [messageError, setMessageError] = useState<string | null>(null);

  const [ending, setEnding] = useState(false);

  useEffect(() => {
    listRoles()
      .then((res) => setRoles(res.data.roles ?? []))
      .catch(() => setStartError("Could not load roles. Refresh to try again."))
      .finally(() => setRolesLoading(false));
  }, []);

  function resetToRoleSelector(noticeMessage?: string) {
    setSession(null);
    setMessages([]);
    setConsentError(null);
    setSendError(null);
    setNotice(noticeMessage ?? null);
  }

  async function handleStart(roleId: string, candidateName: string) {
    setStartLoading(true);
    setStartError(null);
    try {
      const res = await createSession(roleId, candidateName);
      if (res.status === 201) {
        setSession(res.data.session);
        return;
      }
      if (res.status === 404) {
        setStartError("That role no longer exists. Please choose another.");
        listRoles().then((r) => setRoles(r.data.roles ?? []));
        return;
      }
      setStartError(res.data.error ?? "Could not start the session, try again.");
    } catch {
      setStartError("Network error, please try again.");
    } finally {
      setStartLoading(false);
    }
  }

  async function handleAccept() {
    if (!session) return;
    setConsentLoading("accept");
    setConsentError(null);
    try {
      const res = await giveConsent(session.id, true);
      if (res.status === 200) {
        setSession(res.data.session);
        if (res.data.greeting) setMessages([res.data.greeting]);
        return;
      }
      if (res.status === 502) {
        setConsentError(res.data.error ?? "Could not start the screen, try again.");
        return;
      }
      if (res.status === 409) {
        const fresh = await getSession(session.id);
        if (fresh.status === 200) setSession(fresh.data.session);
        return;
      }
      if (res.status === 404) {
        resetToRoleSelector("That session no longer exists. Please start again.");
        return;
      }
      setConsentError(res.data.error ?? "Something went wrong, try again.");
    } catch {
      setConsentError("Could not start the screen, try again.");
    } finally {
      setConsentLoading(null);
    }
  }

  async function handleDecline() {
    if (!session) return;
    setConsentLoading("decline");
    setConsentError(null);
    try {
      const res = await giveConsent(session.id, false);
      if (res.status === 200) {
        setSession(res.data.session);
        return;
      }
      if (res.status === 409) {
        const fresh = await getSession(session.id);
        if (fresh.status === 200) setSession(fresh.data.session);
        return;
      }
      if (res.status === 404) {
        resetToRoleSelector("That session no longer exists. Please start again.");
        return;
      }
      setConsentError(res.data.error ?? "Something went wrong, try again.");
    } catch {
      setConsentError("Network error, please try again.");
    } finally {
      setConsentLoading(null);
    }
  }

  async function handleSend(content: string) {
    if (!session) return;
    setSending(true);
    setSendError(null);

    try {
      const res = await sendMessage(session.id, content);
      if (res.status === 200) {
        setMessages((prev) => [...prev, res.data.message, res.data.reply]);
        setSession(res.data.session);
        return;
      }
      if (res.status === 409) {
        const fresh = await getSession(session.id);
        if (fresh.status === 200) setSession(fresh.data.session);
        return;
      }
      if (res.status === 400) {
        setSendError("Something went wrong sending that message. Please try again.");
        return;
      }
      if (res.status === 502) {
        setSendError("Nova did not get back to you, try sending your next message.");
        const fresh = await listMessages(session.id);
        if (fresh.status === 200) setMessages(fresh.data.messages);
        return;
      }
      setSendError(res.data.error ?? "Something went wrong, try again.");
    } catch {
      setSendError("Network error, please try again.");
    } finally {
      setSending(false);
    }
  }

  async function handleEnd() {
    if (!session) return;
    setEnding(true);
    setMessageError(null);
    try {
      const res = await endSession(session.id);
      if (res.status === 200 || res.status === 409) {
        const fresh = await getSession(session.id);
        if (fresh.status === 200) setSession(fresh.data.session);
      } else if (res.status === 404) {
        resetToRoleSelector("That session no longer exists. Please start again.");
      } else {
        setMessageError(res.data.error ?? "Could not end the screening, try again.");
      }
    } catch (err) {
      if (err instanceof NetworkError) {
        const fresh = await getSession(session.id);
        if (fresh.status === 200) setSession(fresh.data.session);
      }
    } finally {
      setEnding(false);
    }
  }

  const roleName = session ? roles.find((r) => r.id === session.role_id)?.name ?? "" : "";

  let mainContent: React.ReactNode;

  if (!session) {
    mainContent = rolesLoading ? (
      <p className="text-sm text-zinc-500">Loading roles…</p>
    ) : (
      <RoleSelector roles={roles} loading={startLoading} error={startError} onStart={handleStart} />
    );
  } else if (session.status === "awaiting_consent") {
    mainContent = (
      <ConsentScreen
        candidateName={session.candidate_name}
        roleName={roleName}
        loading={consentLoading}
        error={consentError}
        onAccept={handleAccept}
        onDecline={handleDecline}
      />
    );
  } else if (session.status === "consent_refused") {
    mainContent = (
      <RefusedScreen
        candidateName={session.candidate_name}
        onStartNew={() => resetToRoleSelector()}
      />
    );
  } else {
    const active = session.status === "active";
    mainContent = (
      <div className="flex flex-col gap-4">
        <div className="h-[65vh]">
          <ChatPanel
            messages={messages}
            inputEnabled={active}
            disabledReason={active ? null : inactiveReason(session.status)}
            sending={sending}
            sendError={sendError}
            onSend={handleSend}
            endButton={active ? { onClick: handleEnd, loading: ending } : null}
          />
        </div>
        {messageError && (
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
            {messageError}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-black">
      <header className="flex items-center justify-between border-b border-zinc-200 bg-white px-6 py-3 dark:border-zinc-800 dark:bg-zinc-950">
        <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Nova Screening</span>
        <div className="flex items-center gap-4">
          {session && (
            <button
              type="button"
              onClick={() => resetToRoleSelector()}
              className="text-xs font-medium text-zinc-500 hover:text-[#6C3FD1] dark:text-zinc-400 dark:hover:text-[#a78bfa]"
            >
              New session
            </button>
          )}
          <Link
            href="/recruiter"
            className="rounded-full border border-[#6C3FD1] px-3 py-1.5 text-xs font-semibold text-[#6C3FD1] transition-colors hover:bg-[#6C3FD1] hover:text-white"
          >
            Recruiter view →
          </Link>
          <Link
            href="/"
            className="rounded-full border border-[#6C3FD1] px-3 py-1.5 text-xs font-semibold text-[#6C3FD1] transition-colors hover:bg-[#6C3FD1] hover:text-white"
          >
            Thinking →
          </Link>
        </div>
      </header>

      {notice && (
        <div className="border-b border-amber-200 bg-amber-50 px-6 py-2 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300">
          {notice}
        </div>
      )}

      <main className="mx-auto w-full max-w-2xl flex-1 p-6">{mainContent}</main>
    </div>
  );
}
