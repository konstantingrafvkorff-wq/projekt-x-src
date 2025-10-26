import { useMemo, useState } from "react";

export default function Sidebar({
  folder,
  folders,
  onSelectFolder,
  notes = [],
  selectedId,
  onSelect,
  onNew,
  onMoveNote,
  onToggleSidebar,
}) {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return notes;
    return notes.filter((n) => {
      const t = (n.title || "").toLowerCase();
      const c = (n.content || "").toLowerCase();
      return t.includes(s) || c.includes(s);
    });
  }, [q, notes]);

  return (
    <aside className="sidebar">
      <div className="sidebar-head">
        <select
          className="folder-select"
          value={folder?.id || ""}
          onChange={(e) => onSelectFolder(e.target.value)}
        >
          {(folders || []).map((f) => (
            <option key={f.id} value={f.id}>
              {f.name}
            </option>
          ))}
        </select>

        <button className="ghost" onClick={onToggleSidebar} title="Sidebar ein/aus">
          ⇤
        </button>
      </div>

      <div className="sidebar-search">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Suchen…"
        />
        <button onClick={onNew} className="pri">+ Neu</button>
      </div>

      <div className="sidebar-list">
        {filtered.length === 0 ? (
          <div className="sidebar-empty">Keine Notizen.</div>
        ) : (
          filtered.map((n) => (
            <div key={n.id} className="note-row">
              <button
                className={"note-btn" + (n.id === selectedId ? " is-active" : "")}
                onClick={() => onSelect(n.id)}
                title={n.title || "Ohne Titel"}
              >
                <div className="note-title">{n.title || "Ohne Titel"}</div>
                <div className="note-preview">
                  {(n.content || "").split("\n")[0].slice(0, 60) || "…"}
                </div>
              </button>

              <select
                className="move-select"
                onChange={(e) => {
                  const target = e.target.value;
                  if (target) onMoveNote(n.id, target);
                  e.target.value = "";
                }}
                defaultValue=""
                title="In anderen Ordner verschieben"
              >
                <option value="" disabled>
                  • • •
                </option>
                {(folders || []).map((f) => (
                  <option key={f.id} value={f.id}>
                    nach: {f.name}
                  </option>
                ))}
              </select>
            </div>
          ))
        )}
      </div>
    </aside>
  );
}