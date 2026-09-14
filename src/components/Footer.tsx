export default function Footer() {
  return (
    <footer className="mt-auto border-t border-border px-4 py-6 text-center text-xs text-muted">
      Character tagging by{" "}
      <a
        href="https://huggingface.co/spaces/SmilingWolf/wd-tagger"
        target="_blank"
        rel="noopener noreferrer"
        className="underline underline-offset-2 hover:text-foreground"
      >
        WD Tagger
      </a>{" "}
      · anime data by{" "}
      <a
        href="https://anilist.co"
        target="_blank"
        rel="noopener noreferrer"
        className="underline underline-offset-2 hover:text-foreground"
      >
        AniList
      </a>
    </footer>
  );
}
