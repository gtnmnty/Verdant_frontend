"use client";

import { useEffect, useState, type ReactNode } from "react";

/** Fades and lifts its children in once, right after mount. No external libs required. */
export function MountFade({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div
      className={`transition-all duration-500 ease-out ${
        shown ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
      } ${className}`}
    >
      {children}
    </div>
  );
}

/**
 * Cross-fades between children whenever `activeKey` changes — used to animate
 * the Login ⇄ Sign up ⇄ Forgot password switch without a layout jump.
 */
export function FadeSwitch({ activeKey, children }: { activeKey: string; children: ReactNode }) {
  const [renderedKey, setRenderedKey] = useState(activeKey);
  const [content, setContent] = useState(children);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (activeKey === renderedKey) {
      setContent(children);
      return;
    }
    setVisible(false);
    const timeout = setTimeout(() => {
      setRenderedKey(activeKey);
      setContent(children);
      setVisible(true);
    }, 180);
    return () => clearTimeout(timeout);
    // We intentionally only react to activeKey changes; `children` is applied above.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeKey]);

  return (
    <div
      className={`transition-all duration-300 ease-out ${
        visible ? "translate-y-0 opacity-100" : "translate-y-1.5 opacity-0"
      }`}
    >
      {content}
    </div>
  );
}
