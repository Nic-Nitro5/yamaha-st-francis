/** Splits a heading into masked lines that slide up one after another. */
export function Lines({ lines }: { lines: string[] }) {
  return (
    <>
      {lines.map((l, i) => (
        <span key={i} className="line" style={{ "--i": i } as React.CSSProperties}>
          <span>{l}</span>
        </span>
      ))}
    </>
  );
}
