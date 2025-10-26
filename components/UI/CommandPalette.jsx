import React from "react";

export default function CommandPalette({
  open,
  onClose,
  onNew,
  notes,
  onSelect,
}) {
  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        zIndex: 9999,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        paddingTop: "10vh",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "SF Pro Text", Inter, system-ui, sans-serif',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "480px",
          backgroundColor: "rgb(20,20,28)",
          borderRadius: "12px",
          border: "1px solid rgba(255,255,255,0.15)",
          boxShadow: "0 40px 140px rgba(0,0,0,0.9)",
          color: "white",
          padding: "1rem",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            fontSize: "0.8rem",
            fontWeight: 500,
            color: "rgba(255,255,255,0.8)",
            marginBottom: "0.75rem",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <span>Befehle</span>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "1px solid rgba(255,255,255,0.3)",
              borderRadius: "4px",
              color: "rgba(255,255,255,0.7)",
              fontSize: "0.7rem",
              lineHeight: 1.2,
              padding: "2px 6px",
              cursor: "pointer",
            }}
          >
            ESC
          </button>
        </div>

        {/* Quick Actions */}
        <div
          style={{
            backgroundColor: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "8px",
            padding: "0.75rem",
            marginBottom: "1rem",
          }}
        >
          <div
            style={{
              fontSize: "0.7rem",
              color: "rgba(255,255,255,0.6)",
              textTransform: "uppercase",
              letterSpacing: ".08em",
              marginBottom: "0.5rem",
              fontWeight: 600,
            }}
          >
            Aktionen
          </div>

          <button
            onClick={() => {
              onNew?.();
              onClose?.();
            }}
            style={{
              width: "100%",
              textAlign: "left",
              backgroundColor: "rgba(255,255,255,0.07)",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: "6px",
              color: "#fff",
              fontSize: "0.8rem",
              lineHeight: 1.4,
              padding: "8px",
              cursor: "pointer",
              marginBottom: "6px",
            }}
          >
            + Neue Notiz anlegen
          </button>

          <div
            style={{
              fontSize: "0.7rem",
              color: "rgba(255,255,255,0.45)",
              lineHeight: 1.4,
            }}
          >
            Bald: „Lernplan generieren“, „Prüfungsvorbereitung starten“,
            „Zusammenfassung bauen“, „Mindmap anzeigen“ …
          </div>
        </div>

        {/* Notes list */}
        <div
          style={{
            backgroundColor: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "8px",
            padding: "0.75rem",
            maxHeight: "240px",
            overflowY: "auto",
          }}
        >
          <div
            style={{
              fontSize: "0.7rem",
              color: "rgba(255,255,255,0.6)",
              textTransform: "uppercase",
              letterSpacing: ".08em",
              marginBottom: "0.5rem",
              fontWeight: 600,
            }}
          >
            Notizen
          </div>

          {(!notes || notes.length === 0) ? (
            <div
              style={{
                fontSize: "0.8rem",
                color: "rgba(255,255,255,0.4)",
                fontStyle: "italic",
              }}
            >
              Keine Notizen gefunden.
            </div>
          ) : (
            notes.map((n) => (
              <button
                key={n.id}
                onClick={() => {
                  onSelect?.(n.id);
                  onClose?.();
                }}
                style={{
                  width: "100%",
                  textAlign: "left",
                  backgroundColor: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: "6px",
                  color: "#fff",
                  cursor: "pointer",
                  padding: "8px",
                  fontSize: "0.8rem",
                  lineHeight: 1.4,
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px",
                  marginBottom: "6px",
                }}
              >
                <div
                  style={{
                    fontWeight: 500,
                    fontSize: "0.8rem",
                    whiteSpace: "nowrap",
                    textOverflow: "ellipsis",
                    overflow: "hidden",
                  }}
                >
                  {n.title || "Ohne Titel"}
                </div>
                <div
                  style={{
                    fontSize: "0.7rem",
                    color: "rgba(255,255,255,0.6)",
                    lineHeight: 1.4,
                    maxHeight: "2.8rem",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "pre-line",
                  }}
                >
                  {n.content || "Kein Inhalt"}
                </div>

                <div
                  style={{
                    fontSize: "0.65rem",
                    color: "rgba(255,255,255,0.4)",
                  }}
                >
                  {n._folderName} → {n._subName}
                </div>
              </button>
            ))
          )}
        </div>

        <div
          style={{
            fontSize: "0.7rem",
            lineHeight: 1.4,
            color: "rgba(255,255,255,0.4)",
            marginTop: "0.75rem",
            textAlign: "center",
          }}
        >
          ⌘K öffnen · ESC schließen
        </div>
      </div>
    </div>
  );
}