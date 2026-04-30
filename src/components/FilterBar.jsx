import styles from './FilterBar.module.css';
import { CATEGORIES, CATEGORY_ICONS } from './ResourceForm.jsx';

export function FilterBar({
  search, onSearch,
  category, onCategory,
  status, onStatus,
  starredOnly, onStarredOnly,
  total, filtered,
}) {
  const hasFilter = search || category || status || starredOnly;

  return (
    <div className={styles.wrap}>
      <div className={styles.bar}>
        <input
          className={styles.search}
          type="search"
          placeholder="Search title, notes, tags…"
          value={search}
          onChange={e => onSearch(e.target.value)}
        />

        <select className={styles.select} value={category} onChange={e => onCategory(e.target.value)}>
          <option value="">All categories</option>
          {CATEGORIES.map(c => (
            <option key={c} value={c}>{CATEGORY_ICONS[c]} {c}</option>
          ))}
        </select>

        <select className={styles.select} value={status} onChange={e => onStatus(e.target.value)}>
          <option value="">All statuses</option>
          <option value="queued">Queued</option>
          <option value="in-progress">In Progress</option>
          <option value="done">Done</option>
        </select>

        <button
          className={`${styles.starBtn} ${starredOnly ? styles.active : ''}`}
          onClick={() => onStarredOnly(v => !v)}
          title="Show priority only"
        >
          ★ Priority
        </button>

        {hasFilter && (
          <button
            className={styles.clearBtn}
            onClick={() => { onSearch(''); onCategory(''); onStatus(''); }}
          >
            Clear
          </button>
        )}
      </div>

      <p className={styles.count}>
        {filtered === total
          ? `${total} resource${total !== 1 ? 's' : ''}`
          : `${filtered} of ${total} resources`}
      </p>
    </div>
  );
}
