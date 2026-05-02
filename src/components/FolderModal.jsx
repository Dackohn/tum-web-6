import { useEffect, useState } from 'react';
import { FOLDER_COLORS } from '../api/folderService.js';
import styles from './FolderModal.module.css';

export function FolderModal({ initial, onSubmit, onCancel }) {
  const [name, setName]   = useState('');
  const [color, setColor] = useState(FOLDER_COLORS[0]);

  useEffect(() => {
    if (initial) { setName(initial.name); setColor(initial.color); }
    else         { setName(''); setColor(FOLDER_COLORS[0]); }
  }, [initial]);

  function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({ name, color });
  }

  return (
    <div className={styles.overlay} onClick={e => e.target === e.currentTarget && onCancel()}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>{initial ? 'Edit pipeline' : 'New pipeline'}</h2>
          <button className={styles.closeBtn} onClick={onCancel}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <label className={styles.label}>
            Name
            <input
              className={styles.input}
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. React Deep Dive, System Design…"
              autoFocus
              required
            />
          </label>

          <div className={styles.colorRow}>
            <span className={styles.colorLabel}>Color</span>
            <div className={styles.swatches}>
              {FOLDER_COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  className={`${styles.swatch} ${color === c ? styles.swatchActive : ''}`}
                  style={{ background: c }}
                  onClick={() => setColor(c)}
                  aria-label={c}
                />
              ))}
            </div>
          </div>

          <div className={styles.actions}>
            <button type="button" className={styles.btnCancel} onClick={onCancel}>Cancel</button>
            <button type="submit" className={styles.btnSubmit} disabled={!name.trim()}>
              {initial ? 'Save' : 'Create pipeline'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
