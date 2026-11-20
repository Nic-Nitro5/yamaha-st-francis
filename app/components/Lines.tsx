import { stagger } from "../lib/motion";

/** Splits a heading into masked lines that slide up one after another. */
export function Lines({ lines }: { lines: string[] }) {
  return (
    <>
      {lines.map((l, i) => (
        <span key={i} className="line" style={stagger(i)}>
          <span>{l}</span>
        </span>
      ))}
    </>
  );
}
