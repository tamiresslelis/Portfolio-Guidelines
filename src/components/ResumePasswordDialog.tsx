import { useEffect, useId, useRef, useState } from "react";

interface ResumePasswordDialogProps {
  /** Red X / Cancel / Escape: closes immediately, no boot screen. */
  onClose: () => void;
  /** Called instead of `onClose` when the submitted password is correct. */
  onUnlock: () => void;
}

const BIO_TEXT_BEFORE_LINK =
  "I'm currently a Senior Product Designer at Insense. Here, you can explore my career journey from Computer Engineering to Product Design. This page is password-protected. To access my full resume, just send me a message on ";

const LINKEDIN_URL = "https://www.linkedin.com/in/tamireslelis/";

// Not a real secret (this is a static site with no backend) — just a
// lightweight, memorable gate in front of the full resume, matching the
// project owner's own direction.
const RESUME_PASSWORD = "simba";

/**
 * A small, non-resizable modal styled after the classic Windows XP network
 * credentials prompt ("Connect to <server>") — repurposed here as a
 * lightweight gate in front of the full resume. Typing the correct password
 * and submitting reveals the full resume (`onUnlock`); Cancel/close/Escape
 * dismiss the dialog without unlocking anything.
 */
export function ResumePasswordDialog({ onClose, onUnlock }: ResumePasswordDialogProps) {
  const titleId = useId();
  const passwordId = useId();
  const errorId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const [password, setPassword] = useState("");
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    previouslyFocused.current = document.activeElement as HTMLElement | null;
    dialogRef.current?.focus();

    return () => {
      previouslyFocused.current?.focus?.();
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      ref={dialogRef}
      className="absolute top-1/2 left-1/2 z-10 w-[min(420px,92vw)] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-xp-window border border-xp-window-border bg-xp-window-bg shadow-xp-window outline-none"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      tabIndex={-1}
    >
      <div className="flex h-8 flex-shrink-0 items-center gap-2 border-b border-xp-window-border bg-linear-to-b from-xp-titlebar-mid via-xp-titlebar-start via-45% to-xp-titlebar-end py-0 pr-1.5 pl-2.5">
        <span className="h-4 w-4 flex-shrink-0 rounded-[2px] bg-[#ffd45e]" aria-hidden="true" />
        <h2
          id={titleId}
          className="m-0 min-w-0 flex-1 overflow-hidden text-xp-base font-bold text-ellipsis whitespace-nowrap text-white"
          style={{ textShadow: "1px 1px 1px rgba(0, 0, 0, 0.35)" }}
        >
          Password required
        </h2>
        <div className="flex flex-shrink-0 gap-[3px]">
          {/* Decorative "help" button — authentic to this dialog style in
              XP, not wired to anything, same spirit as the disabled
              minimize button elsewhere in this app. */}
          <span
            className="flex h-5 w-[22px] items-center justify-center rounded-[2px] border border-[#b6bed2] bg-linear-to-b from-[#eef1f8] to-[#d6dceb] text-[11px] leading-none text-[#c1c9dc]"
            aria-hidden="true"
          >
            ?
          </span>
          <button
            type="button"
            onClick={onClose}
            className="flex h-5 w-[22px] items-center justify-center rounded-[2px] border border-[#7a1c14] bg-linear-to-b from-xp-close-start to-xp-close-end text-[11px] leading-none text-white hover:brightness-110 active:shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)]"
            aria-label="Close"
          >
            &#x2715;
          </button>
        </div>
      </div>

      <form
        className="px-5 py-4"
        onSubmit={(event) => {
          event.preventDefault();
          if (password.trim().toLowerCase() === RESUME_PASSWORD) {
            onUnlock();
            return;
          }
          setShowError(true);
          setPassword("");
          inputRef.current?.focus();
        }}
      >
        <div className="flex gap-4">
          <svg viewBox="0 0 48 48" width="40" height="40" className="mt-0.5 flex-shrink-0" aria-hidden="true">
            <g transform="rotate(-35 24 24) translate(2 5)">
              <circle cx="9" cy="10" r="6" fill="none" stroke="#8a6a12" strokeWidth="3.5" />
              <rect x="15" y="8.25" width="21" height="3.5" fill="#8a6a12" />
              <rect x="29" y="11.75" width="3" height="5" fill="#8a6a12" />
              <rect x="34" y="11.75" width="3" height="7" fill="#8a6a12" />
            </g>
            <g transform="rotate(15 24 24) translate(3 -2)">
              <circle cx="9" cy="10" r="6" fill="none" stroke="#e0b23c" strokeWidth="3.5" />
              <rect x="15" y="8.25" width="21" height="3.5" fill="#e0b23c" />
              <rect x="29" y="11.75" width="3" height="5" fill="#e0b23c" />
              <rect x="34" y="11.75" width="3" height="7" fill="#e0b23c" />
            </g>
          </svg>

          <p className="m-0 text-sm leading-relaxed text-[#1a1a1a]">
            {BIO_TEXT_BEFORE_LINK}
            <a
              href={LINKEDIN_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#0000ee] underline hover:text-[#0000aa]"
            >
              LinkedIn
            </a>
            .
          </p>
        </div>

        <label htmlFor={passwordId} className="mt-4 block text-sm text-[#1a1a1a]">
          Password required to see full resume
        </label>
        <input
          ref={inputRef}
          id={passwordId}
          type="password"
          autoComplete="off"
          value={password}
          onChange={(event) => {
            setPassword(event.target.value);
            if (showError) setShowError(false);
          }}
          aria-invalid={showError}
          aria-describedby={showError ? errorId : undefined}
          className={`mt-1.5 w-full rounded-[2px] border bg-white px-2 py-1 text-sm text-[#1a1a1a] outline-none focus-visible:border-xp-titlebar-start ${
            showError ? "border-[#c33]" : "border-[#7f9db9]"
          }`}
        />
        {showError && (
          <p id={errorId} role="alert" className="mt-1.5 text-xp-xs text-[#c33]">
            Incorrect password. Please try again.
          </p>
        )}

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="submit"
            className="min-w-[75px] rounded-[3px] border border-black/40 bg-linear-to-b from-xp-silver-start to-xp-silver-end px-3 py-1 text-sm text-[#1a1a1a] hover:from-white hover:to-xp-silver-mid active:shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)]"
          >
            OK
          </button>
          <button
            type="button"
            onClick={onClose}
            className="min-w-[75px] rounded-[3px] border border-black/40 bg-linear-to-b from-xp-silver-start to-xp-silver-end px-3 py-1 text-sm text-[#1a1a1a] hover:from-white hover:to-xp-silver-mid active:shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)]"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
