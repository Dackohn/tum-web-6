import { useMemo, useState } from 'react';
import { useResources } from './hooks/useResources.js';
import { useTheme } from './hooks/useTheme.js';
import { ResourceCard } from './components/ResourceCard.jsx';
import { ResourceForm } from './components/ResourceForm.jsx';
import { FilterBar } from './components/FilterBar.jsx';
import styles from './App.module.css';

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

export default function App() {
  const { resources, loading, add, edit, remove, toggleStar, cycleStatus } = useResources();
  const { theme, toggle: toggleTheme } = useTheme();

  const [formOpen, setFormOpen]       = useState(false);
  const [editing, setEditing]         = useState(null);
  const [search, setSearch]           = useState('');
  const [category, setCategory]       = useState('');
  const [status, setStatus]           = useState('');
  const [starredOnly, setStarredOnly] = useState(false);
  const [sort, setSort]               = useState('newest');

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    const list = resources.filter(r => {
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
  }, [resources, search, category, status, starredOnly, sort]);

  function openAdd()   { setEditing(null); setFormOpen(true); }
  function openEdit(r) { setEditing(r); setFormOpen(true); }
  function closeForm() { setFormOpen(false); setEditing(null); }

  async function handleSubmit(data) {
    if (editing) await edit(editing.id, data);
    else         await add(data);
    closeForm();
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

      <main className={styles.main}>
        {resources.length > 0 && (
          <FilterBar
            search={search} onSearch={setSearch}
            category={category} onCategory={setCategory}
            status={status} onStatus={setStatus}
            starredOnly={starredOnly} onStarredOnly={setStarredOnly}
            sort={sort} onSort={setSort}
            total={resources.length} filtered={filtered.length}
          />
        )}

        {loading ? (
          <p className={styles.loading}>Loading…</p>
        ) : filtered.length === 0 ? (
          <div className={styles.empty}>
            {search || category || status || starredOnly ? (
              <><span className={styles.emptyIcon}>🔍</span><p>No resources match your filters.</p></>
            ) : (
              <>
                <span className={styles.emptyIcon}>📚</span>
                <p>Nothing queued yet.</p>
                <p className={styles.emptySub}>Add articles, videos, courses, and docs — then actually read them.</p>
                <button className={styles.emptyBtn} onClick={openAdd}>+ Add resource</button>
              </>
            )}
          </div>
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
        <ResourceForm initial={editing} onSubmit={handleSubmit} onCancel={closeForm} />
      )}
    </div>
  );
}
