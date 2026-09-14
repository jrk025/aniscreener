export function cleanCharacterName(tag: string): string {
  return tag.replace(/\s*\([^)]*\)\s*$/, "").trim();
}

export function extractSeriesHint(tag: string): string | null {
  const match = tag.match(/\(([^)]+)\)\s*$/);
  return match ? match[1].trim() : null;
}
