type SectionSlotProps = {
  id: string;
  title: string;
  note?: string;
};

/** Empty placeholder until you define this section. */
export function SectionSlot({ id, title, note }: SectionSlotProps) {
  return (
    <section
      id={id}
      className="flex min-h-[70vh] flex-col justify-center border-b border-border px-5 py-24"
    >
      <div className="mx-auto w-full max-w-6xl">
        <p className="mb-3 text-xs tracking-[0.2em] uppercase text-muted">
          Section · {id}
        </p>
        <h2 className="font-[family-name:var(--font-display)] text-3xl md:text-5xl">
          {title}
        </h2>
        <p className="mt-4 max-w-xl text-muted">
          {note ??
            "Awaiting your definition. Tell me layout, copy, visuals, and motion for this section."}
        </p>
      </div>
    </section>
  );
}
