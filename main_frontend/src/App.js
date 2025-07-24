import React, { useState, useEffect } from 'react';
import './App.css';

// Color scheme
const COLORS = {
  bg: "#f5f5f7",
  sidebar: "#606c80",
  accent: "#606c80",
  primary: "#333333",
  textLight: "#f5f5f7",
  card: "#ffffff",
  warning: "#ffe5e0",
  border: "#e0e0e0"
};

// PUBLIC_INTERFACE
function App() {
  // State for analysis results, upload modal, UI
  const [analysis, setAnalysis] = useState([]);
  const [history, setHistory] = useState([]);
  const [sidebarTab, setSidebarTab] = useState("current");
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [theme, setTheme] = useState('light');
  const [uploadDir, setUploadDir] = useState("");

  // Switch sidebar tab
  const handleSidebarNav = (tab) => setSidebarTab(tab);

  // Theme auto-match or toggle
  useEffect(() => {
    if (theme === "auto") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      setTheme(mq.matches ? "dark" : "light");
      document.documentElement.setAttribute('data-theme', mq.matches ? "dark" : "light");
    } else {
      document.documentElement.setAttribute('data-theme', theme);
    }
  }, [theme]);

  // Example: Load history of uploads from backend
  useEffect(() => {
    fetch('/api/analyses')
      .then(r => r.ok ? r.json() : [])
      .then(data => setHistory(data))
      .catch(() => setHistory([]));
  }, []);

  // PUBLIC_INTERFACE
  const openUploadModal = () => setUploadModalOpen(true);
  // PUBLIC_INTERFACE
  const closeUploadModal = () => {
    setUploadModalOpen(false);
    setUploadError("");
    setUploadDir("");
  };

  // PUBLIC_INTERFACE
  async function handleUploadSubmit(e) {
    e.preventDefault();
    setUploading(true);
    setUploadError("");
    try {
      // Assume directory path is entered for MVP
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ directory: uploadDir })
      });
      if (!res.ok) throw new Error("Upload failed");
      const result = await res.json();
      setAnalysis(result.cards || []);
      setSidebarTab("current");
      setHistory(h => [result, ...h]);
      closeUploadModal();
    } catch (err) {
      setUploadError(err.message || "Failed to upload directory");
    }
    setUploading(false);
  }

  // PUBLIC_INTERFACE
  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Card rendering (modern/minimal)
  function renderCard(card, i) {
    if (card.type === "commit") {
      return (
        <ResultCard
          key={"commit-" + i}
          icon="📝"
          title="Git Commit Message"
          color={COLORS.accent}
          content={card.message}
        />
      );
    }
    if (card.type === "suggestion") {
      return (
        <ResultCard
          key={"suggestion-" + i}
          icon="💡"
          title="Code Optimization"
          color={COLORS.accent}
          content={card.suggestion}
        />
      );
    }
    if (card.type === "issue") {
      return (
        <ResultCard
          key={"issue-" + i}
          icon="⚠️"
          title="Potential Issue"
          warning
          content={card.issue}
        />
      );
    }
    // Fallback
    return (
      <ResultCard
        key={"card-" + i}
        title={card.title || "Result"}
        content={card.content}
      />
    );
  }

  // Workspace content
  let workspace;
  if (sidebarTab === "current") {
    workspace = (
      <div className="workspace-content">
        <div className="workspace-header">
          <h1>Results</h1>
          <button className="upload-btn" onClick={openUploadModal}>Upload Directory</button>
        </div>
        {analysis && analysis.length > 0 ? (
          <div className="cards-list">
            {analysis.map(renderCard)}
          </div>
        ) : (
          <div className="empty-state">
            <p>No results yet. Upload your repository directory to start code review!</p>
            <button className="upload-btn" onClick={openUploadModal}>Upload Directory</button>
          </div>
        )}
      </div>
    );
  } else if (sidebarTab === "history") {
    workspace = (
      <div className="workspace-content">
        <div className="workspace-header">
          <h1>History</h1>
        </div>
        {history.length > 0 ? (
          <div className="cards-list">
            {history.map((item, i) => (
              <ResultCard
                key={"history-" + i}
                title={`Analysis: ${item.directory || "Repo"}`}
                content={`Commit: ${item?.cards?.find(c => c.type === "commit")?.message || "N/A"} `}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>No analysis history yet.</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="kr-app-root">
      <SidebarNav
        active={sidebarTab}
        onNav={handleSidebarNav}
        accent={COLORS.accent}
        primary={COLORS.primary}
      />
      <div className="kr-main-area">
        <TopBar theme={theme} onThemeToggle={toggleTheme} onUpload={openUploadModal} />
        {workspace}
        {uploadModalOpen && (
          <UploadModal
            show={uploadModalOpen}
            onClose={closeUploadModal}
            onSubmit={handleUploadSubmit}
            uploading={uploading}
            value={uploadDir}
            onChange={(e) => setUploadDir(e.target.value)}
            error={uploadError}
          />
        )}
      </div>
    </div>
  );
}

// Sidebar Navigation
function SidebarNav({ active, onNav, accent, primary }) {
  return (
    <nav className="kr-sidebar" style={{ background: accent }}>
      <div className="kr-sidebar-logo">
        <span role="img" aria-label="logo" style={{fontSize: "1.8rem"}}>🔍</span>
        <span style={{ fontWeight: 600, fontSize: '1.1rem', color: "#f5f5f7", marginLeft: 8 }}>
          CodeReview
        </span>
      </div>
      <SidebarNavBtn
        label="Current"
        active={active === "current"}
        icon="📊"
        onClick={() => onNav("current")}
      />
      <SidebarNavBtn
        label="History"
        active={active === "history"}
        icon="🕑"
        onClick={() => onNav("history")}
      />
      <SidebarNavBtn
        label="Settings"
        active={active === "settings"}
        icon="⚙️"
        onClick={() => window.alert("Settings feature coming soon!")}
        disabled
      />
      <div style={{ flex: 1 }} />
      <div className="kr-sidebar-footer">
        <a href="https://github.com/" target="_blank" rel="noopener noreferrer" className="kr-sidebar-link">GitHub</a>
      </div>
    </nav>
  );
}
function SidebarNavBtn({ label, active, icon, onClick, disabled }) {
  return (
    <button
      className={`kr-sidebar-btn${active ? " active" : ""}`}
      onClick={onClick}
      disabled={disabled}
      tabIndex={0}
      type="button"
    >
      <span style={{marginRight: 12, fontSize: "1.1rem"}}>{icon}</span>
      {label}
    </button>
  );
}

// TopBar
function TopBar({ theme, onThemeToggle, onUpload }) {
  return (
    <header className="kr-topbar">
      <div />
      <div className="kr-topbar-actions">
        <button className="kr-topbar-btn" onClick={onUpload}>+ Upload Directory</button>
        <button className="kr-topbar-btn" onClick={onThemeToggle}>
          {theme === "light" ? "🌙 Dark" : "☀️ Light"}
        </button>
      </div>
    </header>
  );
}

// Workspace result card
function ResultCard({ icon, title, content, color, warning }) {
  return (
    <div
      className="kr-result-card"
      style={{
        borderLeft: `5px solid ${warning ? "#e87969" : (color || "#606c80")}`,
        background: warning ? "#ffe5e0" : "#fff"
      }}
    >
      {(icon || title) && (
        <div style={{ display: "flex", alignItems: "center", marginBottom: 6 }}>
          {icon && <span style={{ fontSize: "1.5rem", marginRight: 7 }}>{icon}</span>}
          <span style={{ fontWeight: 500, color: "#606c80" }}>{title}</span>
        </div>
      )}
      <div style={{
        color: "#333",
        fontFamily: "monospace",
        fontSize: "1rem",
        lineHeight: 1.5,
        overflowWrap: "anywhere"
      }}>
        {content}
      </div>
    </div>
  );
}

// Upload Directory Modal
function UploadModal({ show, onClose, onSubmit, uploading, value, onChange, error }) {
  return (
    <div className="kr-modal-overlay">
      <div className="kr-modal">
        <h2>Upload Repository Directory</h2>
        <form onSubmit={onSubmit}>
          <div className="kr-form-group">
            <label>Directory Path*</label>
            <input
              type="text"
              value={value}
              onChange={onChange}
              placeholder="e.g., /home/user/myrepo/"
              required
              disabled={uploading}
              autoFocus
            />
          </div>
          {error && <div className="kr-form-error">{error}</div>}
          <div className="kr-modal-actions">
            <button type="submit" className="upload-btn" disabled={uploading}>
              {uploading ? "Uploading..." : "Submit"}
            </button>
            <button type="button" className="kr-cancel-btn" onClick={onClose} disabled={uploading}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default App;
