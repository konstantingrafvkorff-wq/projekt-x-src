export function findWikiLinks(text = "") {
  const re = /\[\[([^[\]]+)\]\]/g;
  const out = new Set();
  let m;
  while ((m = re.exec(text)) !== null) {
    out.add(m[1].trim());
  }
  return Array.from(out);
}

/**
 * Sucht in einer Note-Liste nach Titel; wenn nicht vorhanden → erzeugt sie
 * setNotes: updater(prevNotes) -> newNotes
 */
export function getOrCreateNoteByTitle(title, notes, setNotes) {
  const clean = (title || "").trim();
  if (!clean) return null;

  const hit = (notes || []).find(
    (n) => (n.title || "").trim().toLowerCase() === clean.toLowerCase()
  );
  if (hit) return hit;

  const created = {
    id: crypto.randomUUID(),
    title: clean,
    content: "",
    tags: [],
    createdAt: Date.now(),
  };

  if (typeof setNotes === "function") {
    setNotes((prev) => [created, ...(prev || [])]);
  }
  return created;
}