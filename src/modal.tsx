import type { ComponentChildren } from "preact";
import { useLayoutEffect, useRef } from "preact/hooks";

interface ModalProps {
  title: string;
  className: string;
  onRequestClose: () => void;
  children: ComponentChildren;
}

export default function Modal({
  title,
  className,
  onRequestClose,
  children,
}: ModalProps) {
  const dialog = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const previousFocus = document.activeElement;
    dialog.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onRequestClose();
      if (event.key !== "Tab") return;
      const elements = dialog.current?.querySelectorAll<HTMLElement>(
        "button:not(:disabled), input, textarea, a[href], [tabindex='0']",
      );
      const first = elements?.[0];
      const last = elements?.[elements.length - 1];
      if (!first || !last) return;
      if (
        event.shiftKey &&
        (document.activeElement === first ||
          document.activeElement === dialog.current)
      ) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      if (previousFocus instanceof HTMLElement) previousFocus.focus();
    };
  }, [onRequestClose]);

  return (
    <div
      className="encounter-details-overlay w-100 h-100 flex items-center justify-center top-0 left-0"
      onClick={onRequestClose}
    >
      <div
        ref={dialog}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className={className}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between mt0 mb1 mh2">
          <h3 className="f5 w-50 ma0">{title}</h3>
          <button
            type="button"
            aria-label={`Close ${title}`}
            className="pointer bg-black bn white"
            onClick={onRequestClose}
          >
            &times;
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
