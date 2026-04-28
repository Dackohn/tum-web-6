import { useState } from 'react';
import { CATEGORY_ICONS } from './ResourceForm.jsx';
import styles from './ResourceCard.module.css';

const STATUS_LABEL = { queued: 'Queued', 'in-progress': 'In Progress', done: 'Done' };
const STATUS_NEXT  = { queued: 'in-progress', 'in-progress': 'done', done: 'queued' };

function StarDisplay({ value }) {
  if (!value) return null;
  return (
    <span className={styles.rating} title={`${value}/5`}>
      {'★'.repeat(value)}{'☆'.repeat(5 - value)}
    </span>
  );
}

export function ResourceCard({ resource, onEdit, onDelete, onToggleStar, onCycleStatus }) {
  const [confirmDel, setConfirmDel] = useState(false);

  function handleDelete() {
    if (confirmDel) { onDelete(resource.id); }
    else { setConfirmDel(true); setTimeout(() => setConfirmDel(false), 2500); }
  }

  return (
    <div
      className={`${styles.card} ${styles[resource.status.replace('-', '_')]}`}
      id={`card-${resource.id}`}
    >
      <div className={styles.header}>
        <div className={styles.meta}>
          <span className={styles.category}>
            {CATEGORY_ICONS[resource.category]} {resource.category}
          </span>
          <button
            className={`${styles.statusPill} ${styles['s_' + resource.status.replace('-', '_')]}`}
            onClick={() => onCycleStatus(resource.id, resource.status)}
            title={`Mark as "${STATUS_NEXT[resource.status]}"`}
          >
            {STATUS_LABEL[resource.status]}
          </button>
          {resource.starred && <span className={styles.priorityBadge} title="Priority">★</span>}
        </div>
        <div className={styles.actions}>
          <button
            className={`${styles.iconBtn} ${resource.starred ? styles.starred : ''}`}
            onClick={() => onToggleStar(resource.id, resource.starred)}
            title={resource.starred ? 'Remove priority' : 'Mark as priority'}
          >
            ★
          </button>
          <button className={styles.iconBtn} onClick={() => onEdit(resource)} title="Edit">✎</button>
          <button
            className={`${styles.iconBtn} ${confirmDel ? styles.danger : ''}`}
            onClick={handleDelete}
            title={confirmDel ? 'Click again to confirm' : 'Delete'}
          >
            {confirmDel ? '?' : '✕'}
          </button>
        </div>
      </div>

      <div className={styles.titleRow}>
        {resource.url ? (
          <a
            className={styles.titleLink}
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            {resource.title} ↗
          </a>
        ) : (
          <span className={styles.titleText}>{resource.title}</span>
        )}
        {resource.status === 'done' && <StarDisplay value={resource.rating} />}
      </div>

      {resource.notes && (
        <p className={styles.notes}>{resource.notes}</p>
      )}

      {resource.tags.length > 0 && (
        <div className={styles.tags}>
          {resource.tags.map(tag => (
            <span key={tag} className={styles.tag}>#{tag}</span>
          ))}
        </div>
      )}

      <p className={styles.date}>
        Added {new Date(resource.createdAt).toLocaleDateString('en-US', {
          month: 'short', day: 'numeric', year: 'numeric',
        })}
      </p>
    </div>
  );
}
