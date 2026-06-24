export function Logo({ mark = false }: { mark?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-primary to-accent shadow-glow">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M12 2L21 7v10l-9 5-9-5V7l9-5z" stroke="white" strokeWidth="1.6" strokeLinejoin="round" />
          <path d="M12 7l4.5 2.5v5L12 17l-4.5-2.5v-5L12 7z" fill="white" fillOpacity=".92" />
        </svg>
      </span>
      {!mark && <span className="text-[17px] font-extrabold tracking-tight">SpacePilot<span className="text-primary"> AI</span></span>}
    </span>
  );
}
