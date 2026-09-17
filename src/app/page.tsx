import Link from "next/link";
import Screener from "@/components/Screener";
import { SearchIcon } from "@/components/icons";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center px-4 py-16 sm:py-20">
      <main className="flex w-full max-w-xl flex-col items-center gap-10">
        <header className="flex flex-col items-center gap-3 text-center">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Identify any anime character
          </h1>
          <p className="max-w-sm text-muted">
            Upload a picture and find out which anime it&apos;s from. Free, instant, no sign-up.
          </p>
          <Link
            href="/browse"
            className="mt-1 inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground"
          >
            <SearchIcon className="h-4 w-4" />
            Or browse and search anime directly
          </Link>
        </header>

        <Screener />
      </main>
    </div>
  );
}
