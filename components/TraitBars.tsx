interface Trait {
  key: string;
  label: string;
  value: number;
}

export function TraitBars({ traits }: { traits: Trait[] }) {
  return (
    <div className="flex flex-col gap-3">
      {traits.map((t) => (
        <div key={t.key} className="flex flex-col gap-1">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-foreground/80">{t.label}</span>
            <span className="text-foreground/50">{t.value}%</span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-surface-muted">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
              style={{ width: `${Math.max(4, t.value)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
