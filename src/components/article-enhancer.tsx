"use client";

import { useEffect } from "react";

const LANGUAGES: Record<string, string> = {
  ts: "TypeScript",
  tsx: "TSX",
  js: "JavaScript",
  jsx: "JSX",
  py: "Python",
  python: "Python",
  rust: "Rust",
  go: "Go",
  sh: "Shell",
  bash: "Shell",
  json: "JSON",
  yaml: "YAML",
  sql: "SQL",
  text: "Text",
  plaintext: "Text",
  c: "C",
  cpp: "C++",
};

function labelFor(language: string): string {
  return LANGUAGES[language] ?? language.toUpperCase();
}

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const area = document.createElement("textarea");
      area.value = text;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(area);
      return ok;
    } catch {
      return false;
    }
  }
}

/**
 * Code blocks are rendered on the server as plain <pre><code>. This adds the
 * copy control once JavaScript is available; without it, the code is still
 * fully readable and selectable.
 */
export function ArticleEnhancer({ targetId }: { targetId: string }) {
  useEffect(() => {
    const root = document.getElementById(targetId);
    if (!root) return;

    const cleanups: (() => void)[] = [];

    root.querySelectorAll("pre").forEach((pre) => {
      if (pre.dataset.enhanced === "true") return;
      pre.dataset.enhanced = "true";
      pre.tabIndex = 0;

      const language = pre.getAttribute("data-language") ?? "text";
      const label = labelFor(language);
      pre.setAttribute("aria-label", `${label} code sample`);

      const bar = document.createElement("div");
      bar.className = "code-bar not-prose";

      const lang = document.createElement("span");
      lang.className = "code-lang";
      lang.textContent = label;

      const button = document.createElement("button");
      button.type = "button";
      button.className = "code-copy";
      button.textContent = "Copy";
      button.setAttribute("aria-label", `Copy ${label} code to clipboard`);

      let timer: number | undefined;
      const onClick = async () => {
        const code = pre.querySelector("code")?.textContent ?? "";
        const ok = await copyText(code);
        button.textContent = ok ? "Copied" : "Press ⌘C";
        button.dataset.copied = ok ? "true" : "false";
        if (timer) window.clearTimeout(timer);
        timer = window.setTimeout(() => {
          button.textContent = "Copy";
          delete button.dataset.copied;
        }, 1800);
      };

      button.addEventListener("click", onClick);
      cleanups.push(() => {
        button.removeEventListener("click", onClick);
        if (timer) window.clearTimeout(timer);
      });

      bar.append(lang, button);
      pre.prepend(bar);
    });

    return () => {
      cleanups.forEach((cleanup) => cleanup());
    };
  }, [targetId]);

  return null;
}
