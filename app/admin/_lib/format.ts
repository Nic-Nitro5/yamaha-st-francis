import type { Block } from "../../lib/listings";

/**
 * Listing descriptions are edited as plain text:
 *   - blank lines separate paragraphs
 *   - lines starting with "-", "*" or "•" become a bullet list
 */
export function blocksToText(blocks: Block[]) {
  return blocks.map((b) => (b.type === "p" ? b.text : b.items.map((i) => `- ${i}`).join("\n"))).join("\n\n");
}

const BULLET = /^\s*[-*•]\s+/;

export function textToBlocks(text: string): Block[] {
  const blocks: Block[] = [];
  // Each blank-line-separated chunk starts fresh; inside it, runs of bullet / non-bullet lines merge.
  for (const chunk of text.replace(/\r\n?/g, "\n").split(/\n\s*\n/)) {
    const own: Block[] = [];
    for (const raw of chunk.split("\n")) {
      const line = raw.trim();
      if (!line) continue;
      const last = own.at(-1);
      if (BULLET.test(line)) {
        const item = line.replace(BULLET, "");
        if (last?.type === "ul") last.items.push(item);
        else own.push({ type: "ul", items: [item] });
      } else if (last?.type === "p") {
        last.text += ` ${line}`;
      } else {
        own.push({ type: "p", text: line });
      }
    }
    blocks.push(...own);
  }
  return blocks;
}

export function slugify(title: string) {
  return (
    title
      .toLowerCase()
      .replace(/&/g, " and ")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80)
      .replace(/-+$/, "") || "listing"
  );
}

/** "R 84 999" → 84999. Empty → null. */
export function parseAmount(value: string) {
  const digits = value.replace(/[^\d]/g, "");
  return digits ? Number(digits) : null;
}
