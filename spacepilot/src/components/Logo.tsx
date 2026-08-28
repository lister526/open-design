export function Logo({ className = '', mark = false }: { className?: string; mark?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <span className="relative grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 shadow-glow">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M12 2L21 7v10l-9 5-9-5V7l9-5z" stroke="white" strokeWidth="1.6" strokeLinejoin="round" />
          <path d="M12 7l4.5 2.5v5L12 17l-4.5-2.5v-5L12 7z" fill="white" fillOpacity=".9" />
        </svg>
      </span>
      {!mark && (
        <span className="text-[17px] font-extrabold tracking-tight text-ink-900">
          SpacePilot<span className="text-brand-600"> AI</span>
        </span>
      )}
    </span>
  );
}
