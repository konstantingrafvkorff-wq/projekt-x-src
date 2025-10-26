export default function TopNavBar({
  activePage,
  onChangePage,
  username,
  grade,
  level,
  xp,
  xpToNext,
  streakDays,
  saveStatus,
  onExport,
}) {
  const tabs = [
    { id: "home", label: "Home" },
    { id: "notes", label: "Notizen" },
  ];

  return (
    <header className="topbar">
      <div className="topbar-left">
        <div className="brand">📝 Projekt-X</div>
        <nav className="tabs">
          {tabs.map((t) => (
            <button
              key={t.id}
              className={"tab" + (activePage === t.id ? " is-active" : "")}
              onClick={() => onChangePage(t.id)}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="topbar-right">
        <span className="save-dot">
          {saveStatus === "saving" ? "Speichert…" : "Gespeichert"}
        </span>
        <button className="ghost" onClick={onExport} title="Backup (.json)">
          Backup
        </button>
        <div className="user-pill">
          {username} · {grade} · L{level} · {xp}/{xpToNext} XP · 🔥 {streakDays}
        </div>
      </div>
    </header>
  );
}