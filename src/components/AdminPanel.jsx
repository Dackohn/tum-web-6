import { useEffect, useState } from 'react';
import { addMember, deleteMember, listMembers } from '../api/authClient.js';
import styles from './AdminPanel.module.css';

const ROLE_BADGE = {
  ADMIN:   styles.badgeAdmin,
  WRITER:  styles.badgeWriter,
  VISITOR: styles.badgeVisitor,
};

export function AdminPanel({ currentUser, workspace, onClose }) {
  const [members, setMembers]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole]         = useState('VISITOR');
  const [creating, setCreating]       = useState(false);
  const [createError, setCreateError] = useState('');

  useEffect(() => {
    listMembers()
      .then(setMembers)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleAdd(e) {
    e.preventDefault();
    if (!newUsername.trim() || !newPassword) { setCreateError('Username and password required.'); return; }
    setCreateError('');
    setCreating(true);
    try {
      const member = await addMember(newUsername.trim(), newPassword, newRole);
      setMembers(prev => [...prev, member].sort((a, b) => a.username.localeCompare(b.username)));
      setNewUsername('');
      setNewPassword('');
      setNewRole('VISITOR');
    } catch (e) {
      setCreateError(e.message);
    } finally {
      setCreating(false);
    }
  }

  async function handleRemove(username) {
    if (!window.confirm(`Remove "${username}" from this workspace?`)) return;
    try {
      await deleteMember(username);
      setMembers(prev => prev.filter(m => m.username !== username));
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <div className={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={styles.panel}>
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>Workspace members</h2>
            <p className={styles.subtitle}>{workspace}</p>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <section className={styles.section}>
          {loading && <p className={styles.muted}>Loading…</p>}
          {error   && <p className={styles.error}>{error}</p>}
          {!loading && !error && (
            <ul className={styles.userList}>
              {members.map(m => (
                <li key={m.username} className={styles.userRow}>
                  <span className={styles.username}>{m.username}</span>
                  <span className={`${styles.badge} ${ROLE_BADGE[m.role]}`}>{m.role}</span>
                  <span className={styles.perms}>{m.permissions.join(', ')}</span>
                  {m.username !== currentUser && (
                    <button
                      className={styles.deleteBtn}
                      onClick={() => handleRemove(m.username)}
                      title={`Remove ${m.username}`}
                    >
                      ✕
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Invite member</h3>
          <p className={styles.muted} style={{ marginTop: 0 }}>
            Members share this workspace's resources and folders.
          </p>
          <form onSubmit={handleAdd} className={styles.form}>
            <input
              className={styles.input}
              type="text"
              placeholder="Username"
              value={newUsername}
              onChange={e => setNewUsername(e.target.value)}
              autoComplete="off"
            />
            <input
              className={styles.input}
              type="password"
              placeholder="Password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              autoComplete="new-password"
            />
            <select
              className={styles.select}
              value={newRole}
              onChange={e => setNewRole(e.target.value)}
            >
              <option value="WRITER">WRITER</option>
              <option value="VISITOR">VISITOR</option>
            </select>
            <button className={styles.createBtn} type="submit" disabled={creating}>
              {creating ? 'Adding…' : '+ Add'}
            </button>
          </form>
          {createError && <p className={styles.error}>{createError}</p>}
        </section>
      </div>
    </div>
  );
}
