import Link from "next/link";

export function Header() {
  return (
    <header className="w-full">
      <div className="mx-auto flex max-w-2xl items-center justify-between px-5 py-5">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold text-foreground">
          <span className="text-2xl">🎭</span>
          Facette
        </Link>
        <Link
          href="/mes-tests"
          className="tap-target flex items-center rounded-full border border-border bg-surface px-4 text-sm font-medium text-foreground/80 transition hover:border-primary hover:text-primary"
        >
          Mes tests
        </Link>
      </div>
    </header>
  );
}
