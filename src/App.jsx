import { useState } from 'react';
import { useResources } from './hooks/useResources.js';
import { useTheme } from './hooks/useTheme.js';
import { ResourceCard } from './components/ResourceCard.jsx';
import { ResourceForm } from './components/ResourceForm.jsx';
import styles from './App.module.css';

export default function App() {
  const { resources, loading, add, edit, remove, toggleStar, cycleStatus } = useResources();
  const { theme, toggle: toggleTheme } = useTheme();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing]   = useState(null);

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
        {loading ? (
          <p className={styles.loading}>Loading…</p>
        ) : resources.length === 0 ? (
          <div className={styles.empty}>
            <span className={styles.emptyIcon}>📚</span>
            <p>Nothing queued yet.</p>
            <p className={styles.emptySub}>Add articles, videos, courses, and docs — then actually read them.</p>
            <button className={styles.emptyBtn} onClick={openAdd}>+ Add resource</button>
          </div>
        ) : (
          <div className={styles.grid}>
            {resources.map(r => (
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
