import { useState } from 'react';
import { ResourceCard } from './components/ResourceCard.jsx';
import { ResourceForm } from './components/ResourceForm.jsx';
import styles from './App.module.css';

export default function App() {
  const [resources, setResources] = useState([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing]   = useState(null);

  function openAdd()   { setEditing(null); setFormOpen(true); }
  function openEdit(r) { setEditing(r);    setFormOpen(true); }
  function closeForm() { setFormOpen(false); setEditing(null); }

  function handleSubmit(data) {
    if (editing) {
      setResources(prev => prev.map(r => r.id === editing.id ? { ...r, ...data } : r));
    } else {
      const item = { ...data, id: crypto.randomUUID(), starred: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      setResources(prev => [item, ...prev]);
    }
    closeForm();
  }

  function handleDelete(id) {
    setResources(prev => prev.filter(r => r.id !== id));
  }

  function handleToggleStar(id, current) {
    setResources(prev => prev.map(r => r.id === id ? { ...r, starred: !current } : r));
  }

  function handleCycleStatus(id, current) {
    const cycle = ['queued', 'in-progress', 'done'];
    const next = cycle[(cycle.indexOf(current) + 1) % cycle.length];
    setResources(prev => prev.map(r => r.id === id ? { ...r, status: next } : r));
  }

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.logo}>Dev Queue</h1>
        </div>
        <div className={styles.headerRight}>
          <button className={styles.addBtn} onClick={openAdd} title="Add resource">+ Add</button>
        </div>
      </header>

      <main className={styles.main}>
        {resources.length === 0 ? (
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
                onDelete={handleDelete}
                onToggleStar={handleToggleStar}
                onCycleStatus={handleCycleStatus}
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
