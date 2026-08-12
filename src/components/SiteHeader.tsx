import Link from "next/link";
import { siteConfig } from "@/content/site";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-5">
        <Link href="/" className="font-[family-name:var(--font-display)] text-sm tracking-[0.18em] uppercase">
          {siteConfig.name}
        </Link>
        <nav className="flex items-center gap-5 text-sm text-muted">
          {siteConfig.nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
