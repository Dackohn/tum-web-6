import { useEffect, useState } from 'react';
import styles from './ResourceForm.module.css';

export const CATEGORIES = ['article', 'video', 'docs', 'course', 'book', 'podcast', 'other'];
export const CATEGORY_ICONS = {
  article: '📄', video: '🎬', docs: '📚', course: '🎓',
  book: '📖', podcast: '🎙️', other: '🔗',
};

const EMPTY = { title: '', url: '', category: 'article', status: 'queued', tags: '', notes: '', rating: 0, folderId: '' };

function StarRating({ value, onChange }) {
  return (
    <div className={styles.stars}>
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          className={`${styles.star} ${n <= value ? styles.starFilled : ''}`}
          onClick={() => onChange(n === value ? 0 : n)}
          aria-label={`${n} star${n !== 1 ? 's' : ''}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

export function ResourceForm({ initial, onSubmit, onCancel, folders = [] }) {
  const [form, setForm] = useState(EMPTY);

  useEffect(() => {
    if (initial) {
      setForm({
        title: initial.title,
        url: initial.url || '',
        category: initial.category,
        status: initial.status,
        tags: initial.tags.join(', '),
        notes: initial.notes,
        rating: initial.rating,
        folderId: initial.folderId || '',
      });
    } else {
      setForm(EMPTY);
    }
  }, [initial]);

  function set(field) {
    return e => setForm(f => ({ ...f, [field]: e.target.value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim()) return;
    onSubmit({
      ...form,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      rating: Number(form.rating),
      folderId: form.folderId || null,
    });
  }

  const isEdit = !!initial;

  return (
    <div className={styles.overlay} onClick={e => e.target === e.currentTarget && onCancel()}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>{isEdit ? 'Edit resource' : 'Add resource'}</h2>
          <button className={styles.closeBtn} onClick={onCancel} aria-label="Close">✕</button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <label className={styles.label}>
            Title <span className={styles.required}>*</span>
            <input
              className={styles.input}
              value={form.title}
              onChange={set('title')}
              placeholder="What is this resource?"
              autoFocus
              required
            />
          </label>

          <label className={styles.label}>
            URL
            <input
              className={styles.input}
              type="url"
              value={form.url}
              onChange={set('url')}
              placeholder="https://…"
            />
          </label>

          <div className={styles.row}>
            <label className={styles.label}>
              Category
              <select className={styles.select} value={form.category} onChange={set('category')}>
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{CATEGORY_ICONS[c]} {c}</option>
                ))}
              </select>
            </label>

            <label className={styles.label}>
              Status
              <select className={styles.select} value={form.status} onChange={set('status')}>
                <option value="queued">Queued</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </label>
          </div>

          {form.status === 'done' && (
            <div className={styles.labelRow}>
              <span className={styles.labelText}>Rating</span>
              <StarRating
                value={Number(form.rating)}
                onChange={r => setForm(f => ({ ...f, rating: r }))}
              />
            </div>
          )}

          <label className={styles.label}>
            Tags <span className={styles.hint}>(comma-separated)</span>
            <input
              className={styles.input}
              value={form.tags}
              onChange={set('tags')}
              placeholder="react, performance, security…"
            />
          </label>

          {folders.length > 0 && (
            <label className={styles.label}>
              Pipeline
              <select className={styles.select} value={form.folderId} onChange={set('folderId')}>
                <option value="">No pipeline</option>
                {folders.map(f => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            </label>
          )}

          <label className={styles.label}>
            Notes
            <textarea
              className={styles.textarea}
              value={form.notes}
              onChange={set('notes')}
              placeholder="Why is this useful? Key takeaways…"
              rows={3}
            />
          </label>

          <div className={styles.formActions}>
            <button type="button" className={styles.btnCancel} onClick={onCancel}>Cancel</button>
            <button type="submit" className={styles.btnSubmit} disabled={!form.title.trim()}>
              {isEdit ? 'Save changes' : 'Add resource'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
