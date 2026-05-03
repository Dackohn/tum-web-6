import { useMemo, useState } from 'react';
import { useResources } from './hooks/useResources.js';
import { useFolders } from './hooks/useFolders.js';
import { useTheme } from './hooks/useTheme.js';
import { ResourceCard } from './components/ResourceCard.jsx';
import { ResourceForm, CATEGORY_ICONS } from './components/ResourceForm.jsx';
import { FilterBar } from './components/FilterBar.jsx';
import { FolderModal } from './components/FolderModal.jsx';
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

// ── App ────────────────────────────────────────────────────────────────────

export default function App() {
  const { resources, loading, add, edit, remove, toggleStar, cycleStatus } = useResources();
  const { folders, add: addFolder, edit: editFolder, remove: removeFolder } = useFolders();
  const { theme, toggle: toggleTheme } = useTheme();

  const [formOpen, setFormOpen]       = useState(false);
  const [editing, setEditing]         = useState(null);
  const [folderModal, setFolderModal] = useState(null);
  const [editingFolder, setEditingFolder] = useState(null);

  const [activeFolderId, setActiveFolderId] = useState(null);
  const [search, setSearch]         = useState('');
  const [category, setCategory]     = useState('');
  const [status, setStatus]         = useState('');
  const [starredOnly, setStarredOnly] = useState(false);
  const [sort, setSort]             = useState('newest');

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

  function openAdd()   { setEditing(null); setFormOpen(true); }
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

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.logo}>Dev Queue</h1>
        </div>
        <div className={styles.headerRight}>
          <button className={styles.themeBtn} onClick={toggleTheme} title="Toggle theme">
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <button className={styles.addBtn} onClick={openAdd} title="Add resource">+ Add</button>
        </div>
      </header>

      {(folders.length > 0 || resources.length > 0) && (
        <PipelineTabs
          folders={folders}
          activeFolderId={activeFolderId}
          onSelect={setActiveFolderId}
          onNewFolder={() => { setEditingFolder(null); setFolderModal('new'); }}
          resources={resources}
        />
      )}

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
        {scopedResources.length > 0 && (
          <StatsRow
            stats={scopedStats}
            statusFilter={status}
            onStatusFilter={setStatus}
            folder={activeFolder}
          />
        )}

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
              />
            ))}
          </div>
        )}
      </main>

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
    </div>
  );
}
