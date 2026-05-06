import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useResources } from './hooks/useResources.js';
import { useFolders } from './hooks/useFolders.js';
import { useTheme } from './hooks/useTheme.js';
import { ResourceCard } from './components/ResourceCard.jsx';
import { ResourceForm, CATEGORY_ICONS } from './components/ResourceForm.jsx';
import { FilterBar } from './components/FilterBar.jsx';
import { FolderModal } from './components/FolderModal.jsx';
import { LoginPage } from './components/LoginPage.jsx';
import { AdminPanel } from './components/AdminPanel.jsx';
import { checkSession, logout, setUnauthorizedHandler } from './api/authClient.js';
import styles from './App.module.css';

// ── Helpers ────────────────────────────────────────────────────────────────

function applySort(list, sort) {
  const copy = [...list];
  switch (sort) {
    case 'oldest': return copy.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    case 'a-z':    return copy.sort((a, b) => a.title.localeCompare(b.title));
    case 'z-a':    return copy.sort((a, b) => b.title.localeCompare(a.title));
    case 'rating': return copy.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    default:       return copy.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
}

function getStats(list) {
  return {
    queued:     list.filter(r => r.status === 'queued').length,
    inProgress: list.filter(r => r.status === 'in-progress').length,
    done:       list.filter(r => r.status === 'done').length,
    total:      list.length,
  };
}

function exportJSON(resources) {
  const blob = new Blob([JSON.stringify(resources, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `devqueue-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Progress bar ───────────────────────────────────────────────────────────

function ProgressBar({ stats, color }) {
  const { queued, inProgress, done, total } = stats;
  if (total === 0) return null;
  const pct = n => `${Math.round((n / total) * 100)}%`;
  const donePct = Math.round((done / total) * 100);

  return (
    <div className={styles.progressWrap}>
      <div className={styles.progressBar}>
        <div className={styles.progDone}     style={{ width: pct(done), background: color || '#22c55e' }} />
        <div className={styles.progProgress} style={{ width: pct(inProgress) }} />
        <div className={styles.progQueued}   style={{ width: pct(queued) }} />
      </div>
      <span className={styles.progressLabel}>
        {donePct > 0 ? `${donePct}% done` : `${total} resource${total !== 1 ? 's' : ''}`}
      </span>
    </div>
  );
}

// ── Pipeline tabs ──────────────────────────────────────────────────────────

function PipelineTabs({ folders, activeFolderId, onSelect, onNewFolder, resources }) {
  const allStats  = getStats(resources);
  const doneRatio = allStats.total ? allStats.done / allStats.total : 0;

  return (
    <div className={styles.tabs}>
      <button
        className={`${styles.tab} ${!activeFolderId ? styles.tabActive : ''}`}
        onClick={() => onSelect(null)}
      >
        <span className={styles.tabDot} style={{ background: '#6366f1' }} />
        All
        <span className={styles.tabCount}>{allStats.total}</span>
        <span className={styles.tabBar}>
          <span className={styles.tabBarFill} style={{ width: `${doneRatio * 100}%`, background: '#22c55e' }} />
        </span>
      </button>

      {folders.map(f => {
        const folderResources = resources.filter(r => r.folderId === f.id);
        const fs = getStats(folderResources);
        const ratio = fs.total ? fs.done / fs.total : 0;
        return (
          <button
            key={f.id}
            className={`${styles.tab} ${activeFolderId === f.id ? styles.tabActive : ''}`}
            onClick={() => onSelect(f.id)}
          >
            <span className={styles.tabDot} style={{ background: f.color }} />
            {f.name}
            <span className={styles.tabCount}>{fs.total}</span>
            <span className={styles.tabBar}>
              <span className={styles.tabBarFill} style={{ width: `${ratio * 100}%`, background: f.color }} />
            </span>
          </button>
        );
      })}

      {resources.some(r => !r.folderId) && (
        <button
          className={`${styles.tab} ${activeFolderId === 'unfiled' ? styles.tabActive : ''}`}
          onClick={() => onSelect('unfiled')}
        >
          <span className={styles.tabDot} style={{ background: '#8b949e' }} />
          Unfiled
          <span className={styles.tabCount}>{resources.filter(r => !r.folderId).length}</span>
        </button>
      )}

      <button className={styles.newFolderBtn} onClick={onNewFolder} title="New pipeline">
        + Pipeline
      </button>
    </div>
  );
}

// ── Stats row ──────────────────────────────────────────────────────────────

function StatsRow({ stats, statusFilter, onStatusFilter, folder }) {
  const color = folder?.color;
  return (
    <div className={styles.statsSection}>
      <div className={styles.stats}>
        <button
          className={`${styles.stat} ${statusFilter === 'queued' ? styles.statActive : ''}`}
          onClick={() => onStatusFilter(s => s === 'queued' ? '' : 'queued')}
        >
          <span className={styles.statNum}>{stats.queued}</span>
          <span className={styles.statLabel}>Queued</span>
        </button>
        <button
          className={`${styles.stat} ${statusFilter === 'in-progress' ? styles.statActive : ''}`}
          onClick={() => onStatusFilter(s => s === 'in-progress' ? '' : 'in-progress')}
        >
          <span className={`${styles.statNum} ${styles.blue}`}>{stats.inProgress}</span>
          <span className={styles.statLabel}>In Progress</span>
        </button>
        <button
          className={`${styles.stat} ${statusFilter === 'done' ? styles.statActive : ''}`}
          onClick={() => onStatusFilter(s => s === 'done' ? '' : 'done')}
        >
          <span className={`${styles.statNum} ${styles.green}`}>{stats.done}</span>
          <span className={styles.statLabel}>Done</span>
        </button>
      </div>
      <ProgressBar stats={stats} color={color} />
    </div>
  );
}

// ── Random pick modal ──────────────────────────────────────────────────────

function RandomPickModal({ resource, onClose, onPickAnother, onStartReading, canPickAnother }) {
  return (
    <div className={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={styles.pickModal}>
        <div className={styles.pickHeader}>
          <span>🎲</span>
          <h2 className={styles.pickTitle}>Your next read</h2>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>
        <div className={styles.pickBody}>
          <span className={styles.pickCategory}>{CATEGORY_ICONS[resource.category]} {resource.category}</span>
          <h3 className={styles.pickName}>
            {resource.url
              ? <a href={resource.url} target="_blank" rel="noopener noreferrer" className={styles.pickLink}>{resource.title} ↗</a>
              : resource.title}
          </h3>
          {resource.notes && <p className={styles.pickNotes}>{resource.notes}</p>}
          {resource.tags.length > 0 && (
            <div className={styles.pickTags}>
              {resource.tags.map(t => <span key={t} className={styles.tag}>#{t}</span>)}
            </div>
          )}
        </div>
        <div className={styles.pickActions}>
          {canPickAnother && (
            <button className={styles.btnSecondary} onClick={onPickAnother}>🎲 Another</button>
          )}
          <button className={styles.btnPrimary} onClick={() => onStartReading(resource)}>
            Start reading →
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Empty state ────────────────────────────────────────────────────────────

function EmptyState({ hasFilter, onAdd }) {
  return (
    <div className={styles.empty}>
      {hasFilter ? (
        <><span className={styles.emptyIcon}>🔍</span><p>No resources match your filters.</p></>
      ) : (
        <>
          <span className={styles.emptyIcon}>📚</span>
          <p>Nothing queued yet.</p>
          <p className={styles.emptySub}>Add articles, videos, courses, and docs — then actually read them.</p>
          <button className={styles.emptyBtn} onClick={onAdd}>+ Add resource</button>
        </>
      )}
    </div>
  );
}

// ── Auth gate ──────────────────────────────────────────────────────────────

export default function App() {
  const [user, setUser]           = useState(null);
  const [authChecked, setChecked] = useState(false);

  useEffect(() => {
    setUnauthorizedHandler(() => setUser(null));
    checkSession().then(u => { setUser(u); setChecked(true); });
  }, []);

  if (!authChecked) return <p className={styles.loading}>Connecting…</p>;
  if (!user)        return <LoginPage onLogin={setUser} />;
  return <DevQueue user={user} onLogout={() => { logout(); setUser(null); }} />;
}

// ── Main app ───────────────────────────────────────────────────────────────

function DevQueue({ user, onLogout }) {
  const { resources, loading, add, edit, remove, toggleStar, cycleStatus } = useResources();
  const { folders, add: addFolder, edit: editFolder, remove: removeFolder } = useFolders();
  const { theme, toggle: toggleTheme } = useTheme();

  const [formOpen, setFormOpen]       = useState(false);
  const [editing, setEditing]         = useState(null);
  const [folderModal, setFolderModal] = useState(null);
  const [adminOpen, setAdminOpen]     = useState(false);
  const [editingFolder, setEditingFolder] = useState(null);

  const [activeFolderId, setActiveFolderId] = useState(null);
  const [search, setSearch]         = useState('');
  const [category, setCategory]     = useState('');
  const [status, setStatus]         = useState('');
  const [starredOnly, setStarredOnly] = useState(false);
  const [sort, setSort]             = useState('newest');
  const [randomPick, setRandomPick] = useState(null);
  const [highlightId, setHighlightId] = useState(null);
  const importRef = useRef(null);

  // Keyboard shortcut N = new resource
  useEffect(() => {
    function handler(e) {
      if (formOpen || randomPick || folderModal !== null) return;
      const tag = e.target.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (e.key === 'n' || e.key === 'N') openAdd();
    }
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [formOpen, randomPick, folderModal]);

  const scopedResources = useMemo(() => {
    if (!activeFolderId) return resources;
    if (activeFolderId === 'unfiled') return resources.filter(r => !r.folderId);
    return resources.filter(r => r.folderId === activeFolderId);
  }, [resources, activeFolderId]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    const list = scopedResources.filter(r => {
      if (starredOnly && !r.starred) return false;
      if (category && r.category !== category) return false;
      if (status && r.status !== status) return false;
      if (q && !(
        r.title.toLowerCase().includes(q) ||
        r.notes.toLowerCase().includes(q) ||
        r.tags.some(t => t.includes(q)) ||
        r.url.toLowerCase().includes(q)
      )) return false;
      return true;
    });
    return applySort(list, sort);
  }, [scopedResources, search, category, status, starredOnly, sort]);

  const scopedStats = useMemo(() => getStats(scopedResources), [scopedResources]);
  const activeFolder = folders.find(f => f.id === activeFolderId) || null;

  function openAdd()   {
    setEditing(null);
    setFormOpen(true);
  }
  function openEdit(r) { setEditing(r); setFormOpen(true); }
  function closeForm() { setFormOpen(false); setEditing(null); }

  async function handleSubmit(data) {
    const folderId = data.folderId || (activeFolderId && activeFolderId !== 'unfiled' ? activeFolderId : null);
    if (editing) await edit(editing.id, { ...data, folderId });
    else         await add({ ...data, folderId });
    closeForm();
  }

  async function handleFolderSubmit({ name, color }) {
    if (editingFolder) {
      await editFolder(editingFolder.id, { name, color });
    } else {
      const f = await addFolder(name, color);
      setActiveFolderId(f.id);
    }
    setFolderModal(null);
    setEditingFolder(null);
  }

  async function handleDeleteFolder(folderId) {
    if (!window.confirm('Delete this pipeline? Resources will become unfiled.')) return;
    await removeFolder(folderId);
    const affected = resources.filter(r => r.folderId === folderId);
    for (const r of affected) await edit(r.id, { ...r, folderId: null });
    if (activeFolderId === folderId) setActiveFolderId(null);
  }

  // Random pick
  const pickRandom = useCallback(() => {
    const queued = scopedResources.filter(r => r.status === 'queued');
    if (!queued.length) return;
    setRandomPick(queued[Math.floor(Math.random() * queued.length)]);
  }, [scopedResources]);

  function handlePickAnother() {
    const queued = scopedResources.filter(r => r.status === 'queued' && r.id !== randomPick?.id);
    if (!queued.length) return;
    setRandomPick(queued[Math.floor(Math.random() * queued.length)]);
  }

  async function handleStartReading(resource) {
    await cycleStatus(resource.id, resource.status);
    setRandomPick(null);
    setHighlightId(resource.id);
    setTimeout(() => setHighlightId(null), 4000);
    setTimeout(() => {
      document.getElementById(`card-${resource.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  }

  // Import / Export
  function handleExport() { exportJSON(resources); }

  function handleImportFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (!Array.isArray(data)) throw new Error();
        const replace = window.confirm(
          `Import ${data.length} resources?\n\nOK = replace all\nCancel = merge (skip duplicates)`
        );
        if (replace) {
          for (const r of resources) await remove(r.id);
          for (const r of data)      await add(r);
        } else {
          const ids = new Set(resources.map(r => r.id));
          for (const r of data) if (!ids.has(r.id)) await add(r);
        }
      } catch {
        alert('Invalid file — expected a Dev Queue JSON export.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  const hasQueued = scopedResources.some(r => r.status === 'queued');
  const canPickAnother = scopedResources.filter(r => r.status === 'queued' && r.id !== randomPick?.id).length > 0;

  return (
    <div className={styles.app}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.logo}>
            <svg width="22" height="22" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <rect width="32" height="32" rx="7" fill="#6d6af0"/>
              <path d="M9 5h14a1.5 1.5 0 0 1 1.5 1.5V26l-8.5-5-8.5 5V6.5A1.5 1.5 0 0 1 9 5Z" fill="white" opacity="0.9"/>
              <path d="M12.5 15.5l2.5 2.5 4.5-4.5" stroke="#6d6af0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Dev Queue</span>
          </h1>
          <div className={styles.divider} />
          <p className={styles.tagline}>// track what you're learning</p>
        </div>
        <div className={styles.headerRight}>
          {scopedResources.length > 0 && (
            <button
              className={styles.iconToolBtn}
              onClick={pickRandom}
              disabled={!hasQueued}
              title={hasQueued ? 'Pick a random queued resource' : 'No queued resources'}
            >
              🎲 Surprise me
            </button>
          )}
          {resources.length > 0 && (
            <button className={styles.iconToolBtn} onClick={handleExport} title="Export as JSON">↓ Export</button>
          )}
          <button className={styles.iconToolBtn} onClick={() => importRef.current?.click()} title="Import JSON">
            ↑ Import
          </button>
          <input ref={importRef} type="file" accept=".json" style={{ display: 'none' }} onChange={handleImportFile} />
          <button className={styles.themeBtn} onClick={toggleTheme} title="Toggle theme">
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <span className={styles.userChip} title={`Logged in as ${user.username} (${user.role})`}>
            {user.username}
          </span>
          {user.role === 'ADMIN' && (
            <button className={styles.iconToolBtn} onClick={() => setAdminOpen(true)} title="User management">
              Users
            </button>
          )}
          <button className={styles.iconToolBtn} onClick={onLogout} title="Log out">
            Log out
          </button>
          <button className={styles.addBtn} onClick={openAdd} title="Add resource (N)">+ Add</button>
        </div>
      </header>

      {/* Pipeline tabs */}
      {(folders.length > 0 || resources.length > 0) && (
        <PipelineTabs
          folders={folders}
          activeFolderId={activeFolderId}
          onSelect={setActiveFolderId}
          onNewFolder={() => { setEditingFolder(null); setFolderModal('new'); }}
          resources={resources}
        />
      )}

      {/* Active folder header with edit/delete */}
      {activeFolder && (
        <div className={styles.folderHeader} style={{ borderLeftColor: activeFolder.color }}>
          <span className={styles.folderDot} style={{ background: activeFolder.color }} />
          <span className={styles.folderName}>{activeFolder.name}</span>
          <button
            className={styles.folderEditBtn}
            onClick={() => { setEditingFolder(activeFolder); setFolderModal('edit'); }}
          >
            Rename
          </button>
          <button
            className={`${styles.folderEditBtn} ${styles.folderDeleteBtn}`}
            onClick={() => handleDeleteFolder(activeFolder.id)}
          >
            Delete
          </button>
        </div>
      )}

      <main className={styles.main}>
        {/* Stats + progress */}
        {scopedResources.length > 0 && (
          <StatsRow
            stats={scopedStats}
            statusFilter={status}
            onStatusFilter={setStatus}
            folder={activeFolder}
          />
        )}

        {/* Filters */}
        {scopedResources.length > 0 && (
          <FilterBar
            search={search} onSearch={setSearch}
            category={category} onCategory={setCategory}
            status={status} onStatus={setStatus}
            starredOnly={starredOnly} onStarredOnly={setStarredOnly}
            sort={sort} onSort={setSort}
            total={scopedResources.length} filtered={filtered.length}
          />
        )}

        {/* Grid */}
        {loading ? (
          <p className={styles.loading}>Loading…</p>
        ) : filtered.length === 0 ? (
          <EmptyState hasFilter={!!(search || category || status || starredOnly)} onAdd={openAdd} />
        ) : (
          <div className={styles.grid}>
            {filtered.map(r => (
              <ResourceCard
                key={r.id}
                resource={r}
                onEdit={openEdit}
                onDelete={remove}
                onToggleStar={toggleStar}
                onCycleStatus={cycleStatus}
                highlight={r.id === highlightId}
              />
            ))}
          </div>
        )}
      </main>

      {/* Modals */}
      {formOpen && (
        <ResourceForm
          initial={editing}
          onSubmit={handleSubmit}
          onCancel={closeForm}
          folders={folders}
        />
      )}

      {folderModal && (
        <FolderModal
          initial={editingFolder}
          onSubmit={handleFolderSubmit}
          onCancel={() => { setFolderModal(null); setEditingFolder(null); }}
        />
      )}

      {randomPick && (
        <RandomPickModal
          resource={randomPick}
          onClose={() => setRandomPick(null)}
          onPickAnother={handlePickAnother}
          onStartReading={handleStartReading}
          canPickAnother={canPickAnother}
        />
      )}

      {adminOpen && (
        <AdminPanel
          currentUser={user.username}
          workspace={user.workspace}
          onClose={() => setAdminOpen(false)}
        />
      )}
    </div>
  );
}
