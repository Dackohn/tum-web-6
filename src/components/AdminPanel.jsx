import { useEffect, useState } from 'react';
import { deleteUser, listUsers, registerUser } from '../api/authClient.js';
import styles from './AdminPanel.module.css';

const ROLES = ['ADMIN', 'WRITER', 'VISITOR'];

const ROLE_BADGE = {
  ADMIN:   styles.badgeAdmin,
  WRITER:  styles.badgeWriter,
  VISITOR: styles.badgeVisitor,
};

export function AdminPanel({ currentUser, onClose }) {
  const [users, setUsers]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole]         = useState('VISITOR');
  const [creating, setCreating]       = useState(false);
  const [createError, setCreateError] = useState('');

  useEffect(() => {
    listUsers()
      .then(setUsers)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleRegister(e) {
    e.preventDefault();
    if (!newUsername.trim() || !newPassword) {
      setCreateError('Username and password are required.');
      return;
    }
    setCreateError('');
    setCreating(true);
    try {
      const user = await registerUser(newUsername.trim(), newPassword, newRole);
      setUsers(prev => [...prev, user].sort((a, b) => a.username.localeCompare(b.username)));
      setNewUsername('');
      setNewPassword('');
      setNewRole('VISITOR');
    } catch (e) {
      setCreateError(e.message);
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(username) {
    if (!window.confirm(`Delete user "${username}"? Their data will remain on the server.`)) return;
    try {
      await deleteUser(username);
      setUsers(prev => prev.filter(u => u.username !== username));
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <div className={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={styles.panel}>
        <div className={styles.header}>
          <h2 className={styles.title}>User Management</h2>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        {/* User list */}
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Registered users</h3>
          {loading && <p className={styles.muted}>Loading…</p>}
          {error   && <p className={styles.error}>{error}</p>}
          {!loading && !error && (
            <ul className={styles.userList}>
              {users.map(u => (
                <li key={u.username} className={styles.userRow}>
                  <span className={styles.username}>{u.username}</span>
                  <span className={`${styles.badge} ${ROLE_BADGE[u.role]}`}>{u.role}</span>
                  <span className={styles.perms}>{u.permissions.join(', ')}</span>
                  {u.username !== currentUser && (
                    <button
                      className={styles.deleteBtn}
                      onClick={() => handleDelete(u.username)}
                      title={`Delete ${u.username}`}
                    >
                      ✕
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Register form */}
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Register new user</h3>
          <form onSubmit={handleRegister} className={styles.form}>
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
              {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <button className={styles.createBtn} type="submit" disabled={creating}>
              {creating ? 'Creating…' : '+ Create'}
            </button>
          </form>
          {createError && <p className={styles.error}>{createError}</p>}
        </section>
      </div>
    </div>
  );
}
