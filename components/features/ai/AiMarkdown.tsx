"use client";

/**
 * Tiny, dependency-free Markdown renderer for AI output. Handles the subset
 * models actually emit — bold/italic/inline-code, bullet and numbered lists,
 * simple headings, and paragraphs. Builds React nodes (no dangerouslySetInnerHTML),
 * and tolerates partial/streaming text with unbalanced markers.
 */
import { Fragment, type ReactNode } from "react";

const INLINE = /(\*\*.+?\*\*|__.+?__|\*.+?\*|`.+?`)/g;

function renderInline(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let last = 0;
  let key = 0;
  let m: RegExpExecArray | null;
  INLINE.lastIndex = 0;
  while ((m = INLINE.exec(text))) {
    if (m.index > last) nodes.push(text.slice(last, m.index));
    const tok = m[0];
    if (tok.startsWith("**") || tok.startsWith("__")) {
      nodes.push(<strong key={key++}>{tok.slice(2, -2)}</strong>);
    } else if (tok.startsWith("`")) {
      nodes.push(
        <code
          key={key++}
          className="rounded bg-surface px-1 py-0.5 text-[0.85em] text-ink"
        >
          {tok.slice(1, -1)}
        </code>,
      );
    } else {
      nodes.push(<em key={key++}>{tok.slice(1, -1)}</em>);
    }
    last = m.index + tok.length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

export function AiMarkdown({ text, className }: { text: string; className?: string }) {
  const lines = text.split("\n");
  const blocks: ReactNode[] = [];
  let key = 0;

  let para: string[] = [];
  let list: string[] | null = null;
  let ordered = false;

  const flushPara = () => {
    if (!para.length) return;
    const ls = para;
    para = [];
    blocks.push(
      <p key={key++} className="leading-relaxed">
        {ls.map((l, i) => (
          <Fragment key={i}>
            {i > 0 && <br />}
            {renderInline(l)}
          </Fragment>
        ))}
      </p>,
    );
  };

  const flushList = () => {
    if (!list) return;
    const items = list;
    const isOrdered = ordered;
    list = null;
    blocks.push(
      isOrdered ? (
        <ol key={key++} className="ml-4 list-decimal space-y-1">
          {items.map((it, i) => (
            <li key={i} className="leading-relaxed">
              {renderInline(it)}
            </li>
          ))}
        </ol>
      ) : (
        <ul key={key++} className="ml-4 list-disc space-y-1 marker:text-ink-3">
          {items.map((it, i) => (
            <li key={i} className="leading-relaxed">
              {renderInline(it)}
            </li>
          ))}
        </ul>
      ),
    );
  };

  for (const raw of lines) {
    const line = raw.replace(/\s+$/, "");
    if (!line.trim()) {
      flushPara();
      flushList();
      continue;
    }
    const heading = /^(#{1,6})\s+(.*)$/.exec(line);
    const bullet = /^\s*[-*•]\s+(.*)$/.exec(line);
    const numbered = /^\s*\d+\.\s+(.*)$/.exec(line);

    if (heading) {
      flushPara();
      flushList();
      blocks.push(
        <div key={key++} className="mt-1 text-sm font-semibold text-ink">
          {renderInline(heading[2])}
        </div>,
      );
      continue;
    }
    if (bullet || numbered) {
      flushPara();
      const isOrdered = Boolean(numbered);
      if (list && ordered !== isOrdered) flushList();
      list ??= [];
      ordered = isOrdered;
      list.push((bullet ? bullet[1] : numbered![1]).trim());
      continue;
    }
    flushList();
    para.push(line);
  }
  flushPara();
  flushList();

  return <div className={className ?? "space-y-2 text-sm text-ink"}>{blocks}</div>;
}
