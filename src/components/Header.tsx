"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoMark } from "@/components/icons";

const NAV = [
  { href: "/", label: "Identify" },
  { href: "/browse", label: "Browse" },
  { href: "/list", label: "My List" },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-10 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-2 px-3 py-4 sm:px-4">
        <Link href="/" className="flex shrink-0 items-center gap-1.5 font-semibold tracking-tight sm:gap-2">
          <LogoMark className="h-6 w-6 shrink-0 text-accent" />
          AniScreener
        </Link>
        <nav className="flex gap-0.5 sm:gap-1">
          {NAV.map((item) => {
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`whitespace-nowrap rounded-full px-1.5 py-1.5 text-[13px] transition-colors sm:px-3.5 sm:text-sm ${
                  active ? "bg-surface text-foreground" : "text-muted hover:text-foreground"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
