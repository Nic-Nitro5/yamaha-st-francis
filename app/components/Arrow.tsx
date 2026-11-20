export function ArrowUpRight({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 12 12"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      aria-hidden="true"
      className={`inline-block h-2.5 w-2.5 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 ${className}`}
    >
      <path d="M3 9 9 3M4 3h5v5" />
    </svg>
  );
}

export function ArrowDown({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 12 12"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      aria-hidden="true"
      className={`inline-block h-2.5 w-2.5 ${className}`}
    >
      <path d="M6 2v8M2.5 6.5 6 10l3.5-3.5" />
    </svg>
  );
}
