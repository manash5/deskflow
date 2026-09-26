import type { ReactNode } from "react";

function renderInline(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const pattern =
    /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g;
  let last = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = pattern.exec(text))) {
    if (match.index > last) {
      nodes.push(text.slice(last, match.index));
    }
    const token = match[0];
    if (token.startsWith("**")) {
      nodes.push(<strong key={key++}>{token.slice(2, -2)}</strong>);
    } else if (token.startsWith("`")) {
      nodes.push(
        <code key={key++} className="rounded bg-fill px-1 py-0.5 font-mono text-[12px]">
          {token.slice(1, -1)}
        </code>,
      );
    } else {
      const link = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (link) {
        nodes.push(
          <a
            key={key++}
            href={link[2]}
            className="underline"
            target="_blank"
            rel="noreferrer"
          >
            {link[1]}
          </a>,
        );
      }
    }
    last = match.index + token.length;
  }

  if (last < text.length) {
    nodes.push(text.slice(last));
  }
  return nodes;
}

function flushList(items: { ordered: boolean; nodes: ReactNode[] } | null) {
  if (!items || items.nodes.length === 0) {
    return null;
  }
  const Tag = items.ordered ? "ol" : "ul";
  return <Tag className={items.ordered ? "list-decimal" : "list-disc"}>{items.nodes}</Tag>;
}

export function MarkdownBody({ text }: { text: string }) {
  const source = (text || "").replace(/\r\n/g, "\n").trim();
  if (!source) {
    return <p className="text-muted">No reply.</p>;
  }

  const blocks: ReactNode[] = [];
  const lines = source.split("\n");
  let list: { ordered: boolean; nodes: ReactNode[] } | null = null;
  let fence: string[] | null = null;
  let key = 0;

  const pushList = () => {
    const node = flushList(list);
    if (node) {
      blocks.push(<div key={key++}>{node}</div>);
    }
    list = null;
  };

  for (const line of lines) {
    if (fence) {
      if (line.trim().startsWith("```")) {
        blocks.push(
          <pre key={key++}>
            <code className="font-mono">{fence.join("\n")}</code>
          </pre>,
        );
        fence = null;
      } else {
        fence.push(line);
      }
      continue;
    }

    if (line.trim().startsWith("```")) {
      pushList();
      fence = [];
      continue;
    }

    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      pushList();
      const level = heading[1].length;
      const className =
        level === 1
          ? "text-[16px] font-semibold"
          : level === 2
            ? "text-[15px] font-semibold"
            : "text-[14px] font-semibold";
      blocks.push(
        <p key={key++} className={className}>
          {renderInline(heading[2])}
        </p>,
      );
      continue;
    }

    const unordered = line.match(/^\s*[-*]\s+(.+)$/);
    if (unordered) {
      if (!list || list.ordered) {
        pushList();
        list = { ordered: false, nodes: [] };
      }
      list.nodes.push(<li key={list.nodes.length}>{renderInline(unordered[1])}</li>);
      continue;
    }

    const ordered = line.match(/^\s*\d+\.\s+(.+)$/);
    if (ordered) {
      if (!list || !list.ordered) {
        pushList();
        list = { ordered: true, nodes: [] };
      }
      list.nodes.push(<li key={list.nodes.length}>{renderInline(ordered[1])}</li>);
      continue;
    }

    if (!line.trim()) {
      pushList();
      continue;
    }

    pushList();
    blocks.push(<p key={key++}>{renderInline(line)}</p>);
  }

  if (fence) {
    blocks.push(
      <pre key={key++}>
        <code className="font-mono">{fence.join("\n")}</code>
      </pre>,
    );
  }
  pushList();

  return <div className="desk-prose text-[14px] leading-relaxed">{blocks}</div>;
}
