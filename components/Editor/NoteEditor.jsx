import { useEffect, useMemo, useRef, useState } from "react";
import { findWikiLinks } from "../../utils/textParser.js";

function formatDateDisplay(ts) {
  const d = new Date(ts);
  const day = d.toLocaleDateString("de-DE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const time = d.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
  return `${day} – ${time}`;
}

export default function NoteEditor({
  note,
  onChange,
  onUpdateTags,
  allNotes,
  backlinks = [],
  onOpenLink,
  sidebarOpen,
  onToggleSidebar,
}) {
  const [title, setTitle] = useState(note.title || "");
  const [content, setContent] = useState(note.content || "");
  const [tags, setTags] = useState(note.tags || []);
  const [tagDraft, setTagDraft] = useState("");
  const [preview, setPreview] = useState(false);
  const taRef = useRef(null);

  useEffect(() => {
    setTitle(note.title || "");
    setContent(note.content || "");
    setTags(note.tags || []);
    setTagDraft("");
    setPreview(false);
  }, [note.id]);

  useEffect(() => {
    const t = setTimeout(() => onChange?.({ title }), 200);
    return () => clearTimeout(t);
  }, [title]);

  useEffect(() => {
    const t = setTimeout(() => onChange?.({ content }), 200);
    return () => clearTimeout(t);
  }, [content]);

  useEffect(() => {
    onUpdateTags?.(tags);
  }, [tags]);

  const wikiLinks = useMemo(() => findWikiLinks(content), [content]);

  function commitTag() {
    const clean = tagDraft.trim();
    if (!clean) return;
    if (!tags.includes(clean)) setTags((prev) => [...prev, clean]);
    setTagDraft("");
  }
  function onTagKey(e) {
    if (e.key === "Enter" || e.key === "," || e.key === " ") {
      e.preventDefault();
      commitTag();
    }
    if (e.key === "Backspace" && tagDraft === "" && tags.length > 0) {
      setTags((prev) => prev.slice(0, -1));
    }
  }
  function removeTag(t) {
    setTags((prev) => prev.filter((x) => x !== t));
  }

  function handleContentKeyDown(e) {
    if (e.key === "[") {
      const ta = e.currentTarget;
      const pos = ta.selectionStart;
      const before = content.slice(0, pos);
      if (before.endsWith("[")) {
        e.preventDefault();
        const after = content.slice(ta.selectionEnd);
        const next = before.slice(0, -1) + "[[]]" + after;
        setContent(next);
        requestAnimationFrame(() => {
          taRef.current.focus();
          const p = before.length + 1; // zwischen [[|]]
          taRef.current.selectionStart = p;
          taRef.current.selectionEnd = p;
        });
      }
    }
  }

  return (
    <div className="editor-wrap">
      {/* Top stripe: Datum + Tags + Sidebar toggle */}
      <div className="editor-top">
        <div className="date-txt">{formatDateDisplay(note.createdAt || Date.now())}</div>
        <div className="tags-row">
          {tags.map((t) => (
            <button key={t} className="tag-chip" onClick={() => removeTag(t)}>
              {t} <span className="x">×</span>
            </button>
          ))}
          <input
            className="tag-input"
            value={tagDraft}
            onChange={(e) => setTagDraft(e.target.value)}
            onKeyDown={onTagKey}
            placeholder="Tag + Enter"
          />
        </div>
        <button className="ghost" onClick={onToggleSidebar} title="Sidebar ein/aus">
          {sidebarOpen ? "Sidebar aus" : "Sidebar an"}
        </button>
      </div>

      {/* Titel */}
      <input
        className="title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Titel…"
      />

      {/* Inhalt */}
      <div className="content-wrap">
        {preview ? (
          <div className="content-preview">
            {renderPretty(content, (label) => onOpenLink?.(label))}
          </div>
        ) : (
          <textarea
            ref={taRef}
            className="content-input"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleContentKeyDown}
            placeholder="Schreibe hier deine Notiz… Tippe [[ für Link ]]"
          />
        )}
      </div>

      <div className="editor-actions">
        <button className="ghost" onClick={() => setPreview((v) => !v)}>
          {preview ? "Bearbeiten" : "Preview öffnen"}
        </button>
      </div>

      {/* Verlinkte Seiten & Backlinks */}
      <div className="info-grid">
        <div className="info-box">
          <div className="info-head">Verlinkte Seiten</div>
          {wikiLinks.length === 0 ? (
            <div className="muted">Keine [[Links]] in dieser Notiz.</div>
          ) : (
            <ul className="plain">
              {wikiLinks.map((l) => (
                <li key={l}>
                  <button className="link" onClick={() => onOpenLink?.(l)}>
                    {l}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="info-box">
          <div className="info-head">Backlinks</div>
          {backlinks.length === 0 ? (
            <div className="muted">Keine andere Notiz verweist hierher.</div>
          ) : (
            <ul className="plain">
              {backlinks.map((b) => (
                <li key={b.id}>
                  <span className="muted">{b._folderName ? b._folderName + " · " : ""}</span>
                  {b.title || "Ohne Titel"}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

/** Pretty-Renderer ohne [[ ]] */
function renderPretty(raw, onClick) {
  const out = [];
  const re = /\[\[([^[\]]+)\]\]/g;
  let last = 0;
  let m;
  while ((m = re.exec(raw)) !== null) {
    const start = m.index;
    const end = start + m[0].length;
    if (start > last) out.push(<span key={"t" + start}>{raw.slice(last, start)}</span>);
    const label = m[1].trim();
    out.push(
      <button
        key={"l" + start}
        onClick={() => onClick?.(label)}
        className="link"
        title={`Öffne oder erstelle „${label}“`}
      >
        {label}
      </button>
    );
    last = end;
  }
  if (last < raw.length) out.push(<span key="rest">{raw.slice(last)}</span>);
  return out.length ? out : <span>{raw}</span>;
}