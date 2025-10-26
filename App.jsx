import { useEffect, useMemo, useRef, useState } from "react";
import TopNavBar from "./components/TopNavBar/TopNavBar.jsx";
import Sidebar from "./components/Sidebar/Sidebar.jsx";
import NoteEditor from "./components/Editor/NoteEditor.jsx";
import { useLocalStorage } from "./hooks/useLocalStorage.js";
import { getOrCreateNoteByTitle } from "./utils/textParser.js";
import getBacklinks from "./utils/getBacklinks.js";

/** --------- Demo-Startdaten: Ordner → Notizen --------- */
const demoFolders = [
  {
    id: "f-allg",
    name: "Allgemein",
    notes: [
      {
        id: "n-welcome",
        title: "Welcome 👋",
        content:
          "Hallo Konstantin!\n\nDas ist deine erste Notiz.\n\nProbier mal [[Julius]] oder [[Mathe LK]].",
        tags: ["#ErsteNotiz"],
        createdAt: Date.now(),
      },
    ],
    subfolders: [],
  },
  {
    id: "f-schule",
    name: "Schule / Geschichte",
    notes: [],
    subfolders: [],
  },
];

export default function App() {
  /** --------- Globaler App-State --------- */
  const [folders, setFolders] = useLocalStorage("px:folders", demoFolders);
  const [activePage, setActivePage] = useState("home"); // "home" | "notes"
  const [activeFolderId, setActiveFolderId] = useLocalStorage(
    "px:activeFolderId",
    folders?.[0]?.id || null
  );
  const [selectedNoteId, setSelectedNoteId] = useLocalStorage(
    "px:selectedNoteId",
    folders?.[0]?.notes?.[0]?.id || null
  );
  const [sidebarOpen, setSidebarOpen] = useLocalStorage("px:sidebar", true);

  // Fake-User oben rechts
  const username = "Konstantin";
  const grade = "12. Klasse";
  const [streakDays] = useState(3);
  const [level] = useState(2);
  const [xp] = useState(120);
  const [xpToNext] = useState(200);
  const [saveStatus, setSaveStatus] = useState("saved"); // "saving" | "saved"
  const saveTimerRef = useRef(null);

  function bumpSaving() {
    setSaveStatus("saving");
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => setSaveStatus("saved"), 800);
  }

  /** --------- Ableitungen --------- */
  const activeFolder = useMemo(
    () => (folders || []).find((f) => f.id === activeFolderId) || null,
    [folders, activeFolderId]
  );

  const flatNotes = useMemo(() => {
    // alle Notizen aller Ordner – z.B. für Backlinks oder Suche
    return (folders || []).flatMap((f) =>
      Array.isArray(f.notes) ? f.notes.map((n) => ({ ...n, _folderId: f.id })) : []
    );
  }, [folders]);

  const selectedNote =
    activeFolder?.notes?.find((n) => n.id === selectedNoteId) || null;

  /** --------- Folder / Note Aktionen --------- */
  function createFolder(name = "Neuer Ordner") {
    const nf = { id: crypto.randomUUID(), name, notes: [], subfolders: [] };
    setFolders((prev) => [nf, ...prev]);
    setActivePage("notes");
    setActiveFolderId(nf.id);
  }

  function renameFolder(folderId, name) {
    setFolders((prev) =>
      prev.map((f) => (f.id === folderId ? { ...f, name } : f))
    );
  }

  function deleteFolder(folderId) {
    setFolders((prev) => prev.filter((f) => f.id !== folderId));
    if (activeFolderId === folderId) {
      setActiveFolderId(prev => (folders?.[0]?.id && folders[0].id !== folderId ? folders[0].id : null));
      setSelectedNoteId(null);
    }
  }

  function createNote() {
    if (!activeFolder) return;
    bumpSaving();
    const n = {
      id: crypto.randomUUID(),
      title: "Neue Notiz",
      content: "",
      tags: [],
      createdAt: Date.now(),
    };
    setFolders((prev) =>
      prev.map((f) =>
        f.id === activeFolder.id ? { ...f, notes: [n, ...(f.notes || [])] } : f
      )
    );
    setActivePage("notes");
    setSelectedNoteId(n.id);
  }

  function moveNoteToFolder(noteId, targetFolderId) {
    if (!noteId || !targetFolderId) return;
    setFolders((prev) => {
      // Note aus altem Ordner herausnehmen
      let moved = null;
      const without = prev.map((f) => {
        if (!Array.isArray(f.notes)) return f;
        const idx = f.notes.findIndex((n) => n.id === noteId);
        if (idx >= 0) {
          moved = f.notes[idx];
          const newNotes = [...f.notes];
          newNotes.splice(idx, 1);
          return { ...f, notes: newNotes };
        }
        return f;
      });
      if (!moved) return prev;

      // In Zielordner einsetzen
      return without.map((f) =>
        f.id === targetFolderId
          ? { ...f, notes: [moved, ...(f.notes || [])] }
          : f
      );
    });
    setActiveFolderId(targetFolderId);
  }

  function updateNote(patch) {
    if (!selectedNote || !activeFolder) return;
    bumpSaving();
    setFolders((prev) =>
      prev.map((f) =>
        f.id === activeFolder.id
          ? {
              ...f,
              notes: (f.notes || []).map((n) =>
                n.id === selectedNote.id ? { ...n, ...patch } : n
              ),
            }
          : f
      )
    );
  }

  function updateTags(next) {
    updateNote({ tags: next });
  }

  /** --------- Backlinks für ausgewählte Notiz --------- */
  const backlinks = useMemo(() => {
    if (!selectedNote) return [];
    return getBacklinks(selectedNote, flatNotes);
  }, [selectedNote, flatNotes]);

  /** --------- EXPORT --------- */
  function handleExport() {
    const blob = new Blob([JSON.stringify({ folders }, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `projekt-x-backup-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  /** --------- HOME (Figma-ähnlich) --------- */
  function HomeCard({ title, desc, onClick, pill }) {
    return (
      <button
        onClick={onClick}
        className="home-card"
        title={title}
      >
        <div className="home-card-title">
          {title}
          {pill ? <span className="home-pill">{pill}</span> : null}
        </div>
        <div className="home-card-desc">{desc}</div>
      </button>
    );
  }

  function renderHome() {
    return (
      <div className="home-wrap">
        <div className="home-left">
          <div className="welcome">
            <div className="welcome-title">
              Willkommen {username} <span className="xp-badge">+10 XP</span>
            </div>
            <div className="welcome-sub">
              {grade} · Level {level} · {xp}/{xpToNext} XP · Streak {streakDays} Tage
            </div>
          </div>

          <div className="folders-panel">
            <div className="panel-head">
              Deine Fächer / Ordner
              <button className="ghost" onClick={() => setActivePage("notes")}>
                Alle Notizen →
              </button>
            </div>
            <div className="folders-list">
              {(folders || []).map((f) => (
                <button
                  key={f.id}
                  className="folder-item"
                  onClick={() => {
                    setActiveFolderId(f.id);
                    setActivePage("notes");
                  }}
                >
                  <div className="folder-name">{f.name}</div>
                  <div className="folder-meta">
                    {(f.notes?.length || 0)} Notizen · {(f.subfolders?.length || 0)} Unterordner
                  </div>
                </button>
              ))}
            </div>
            <div className="panel-actions">
              <button className="soft" onClick={() => createFolder("Neuer Ordner")}>
                + Neuer Ordner
              </button>
            </div>
          </div>
        </div>

        <div className="home-right">
          <div className="grid">
            <HomeCard
              title="Lernplan"
              desc="Tägliche To-Dos, Lernblöcke, Wiederholung. Vorschläge inklusive."
              onClick={() => setActivePage("notes")}
            />
            <HomeCard
              title="Tests / Prüfungstraining"
              desc="Alte Prüfungen einscannen → neue Aufgaben auf gleichem Niveau."
              onClick={() => setActivePage("notes")}
            />
            <HomeCard
              title="Mindmap"
              desc="Verknüpfungen zwischen deinen Notizen als Wissensnetz."
              onClick={() => setActivePage("notes")}
            />
            <HomeCard
              title="Wiederholung"
              desc="Active Recall / Spaced Repetition."
              onClick={() => setActivePage("notes")}
            />
            <HomeCard
              title="Prüfungsphase"
              desc="Countdown, Fokus, keine Ablenkung."
              onClick={() => setActivePage("notes")}
            />
            <HomeCard
              title="Marketplace"
              desc="Zusammenfassungen kaufen/verkaufen."
              onClick={() => setActivePage("notes")}
              pill="Neu"
            />
          </div>
        </div>
      </div>
    );
  }

  /** --------- NOTES --------- */
  function renderNotes() {
    return (
      <div className="notes-wrap">
        {/* Sidebar links */}
        {sidebarOpen && (
          <div className="notes-sidebar">
            <Sidebar
              folder={activeFolder}
              folders={folders}
              onSelectFolder={setActiveFolderId}
              notes={activeFolder?.notes || []}
              selectedId={selectedNoteId}
              onSelect={setSelectedNoteId}
              onNew={createNote}
              onMoveNote={(noteId, targetFolderId) =>
                moveNoteToFolder(noteId, targetFolderId)
              }
              onToggleSidebar={() => setSidebarOpen((v) => !v)}
            />
          </div>
        )}

        {/* Editor rechts */}
        <div className="notes-editor-area">
          {!selectedNote ? (
            <div className="note-empty">
              Wähle links eine Notiz oder klicke „Neu“.
            </div>
          ) : (
            <NoteEditor
              note={selectedNote}
              onChange={updateNote}
              onUpdateTags={updateTags}
              allNotes={flatNotes}
              backlinks={backlinks}
              onOpenLink={(label) => {
                // [[Label]] anklicken → Notiz im selben Ordner öffnen/erstellen
                const target = getOrCreateNoteByTitle(
                  label,
                  activeFolder?.notes || [],
                  (updater) => {
                    setFolders((prev) =>
                      prev.map((f) =>
                        f.id === activeFolder.id
                          ? { ...f, notes: updater(f.notes || []) }
                          : f
                      )
                    );
                  }
                );
                setSelectedNoteId(target.id);
              }}
              sidebarOpen={sidebarOpen}
              onToggleSidebar={() => setSidebarOpen((v) => !v)}
            />
          )}
        </div>
      </div>
    );
  }

  /** --------- PAGE SWITCH --------- */
  function renderMainArea() {
    if (activePage === "home") return renderHome();
    return renderNotes();
  }

  /** --------- RENDER ROOT LAYOUT --------- */
  return (
    <>
      <TopNavBar
        activePage={activePage}
        onChangePage={setActivePage}
        username={username}
        grade={grade}
        level={level}
        xp={xp}
        xpToNext={xpToNext}
        streakDays={streakDays}
        saveStatus={saveStatus}
        onExport={handleExport}
      />

      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "rgb(18,18,22)",
          backgroundImage:
            "radial-gradient(circle at 20% 20%, rgba(96,96,160,0.18) 0%, rgba(0,0,0,0) 60%)",
          color: "white",
        }}
      >
        {renderMainArea()}
      </div>
    </>
  );
}