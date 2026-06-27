export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[0.7rem] tracking-[0.35em] uppercase text-rose-400 font-medium">
      {children}
    </p>
  );
}
