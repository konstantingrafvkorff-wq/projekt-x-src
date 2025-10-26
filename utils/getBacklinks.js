// currentNote: { id, title }, allNotes: Array<note + {_folderId?}>
export default function getBacklinks(currentNote, allNotes) {
  if (!currentNote || !currentNote.title) return [];
  const target = (currentNote.title || "").trim().toLowerCase();
  if (!target) return [];
  const hay = Array.isArray(allNotes) ? allNotes : [];

  return hay.filter((n) => {
    if (!n || n.id === currentNote.id) return false;
    const c = (n.content || "").toLowerCase();
    return c.includes(`[[${target}]]`);
  });
}