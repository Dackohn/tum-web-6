import { useState } from 'react';
import { login } from '../api/authClient.js';
import styles from './LoginPage.module.css';

const ROLES = [
  { value: 'ADMIN',   label: 'Admin',   desc: 'Read, write & delete' },
  { value: 'WRITER',  label: 'Writer',  desc: 'Read & write' },
  { value: 'VISITOR', label: 'Visitor', desc: 'Read only' },
];

export function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('');
  const [role, setRole]         = useState('ADMIN');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    const name = username.trim();
    if (!name) { setError('Enter a username to continue.'); return; }
    setError('');
    setLoading(true);
    try {
      const user = await login(name, role);
      onLogin(user);
    } catch {
      setError('Could not reach the server. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logoRow}>
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="32" height="32" rx="7" fill="#6d6af0"/>
            <path d="M9 5h14a1.5 1.5 0 0 1 1.5 1.5V26l-8.5-5-8.5 5V6.5A1.5 1.5 0 0 1 9 5Z" fill="white" opacity="0.9"/>
            <path d="M12.5 15.5l2.5 2.5 4.5-4.5" stroke="#6d6af0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className={styles.logoText}>Dev Queue</span>
        </div>

        <h1 className={styles.title}>Welcome back</h1>
        <p className={styles.subtitle}>Your learning tracker. Your data.</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <label className={styles.label}>
            Username
            <input
              className={styles.input}
              type="text"
              placeholder="e.g. alice"
              value={username}
              onChange={e => setUsername(e.target.value)}
              autoFocus
              autoComplete="username"
            />
          </label>

          <fieldset className={styles.fieldset}>
            <legend className={styles.label}>Role</legend>
            <div className={styles.roleGroup}>
              {ROLES.map(r => (
                <label
                  key={r.value}
                  className={`${styles.roleOption} ${role === r.value ? styles.roleActive : ''}`}
                >
                  <input
                    type="radio"
                    name="role"
                    value={r.value}
                    checked={role === r.value}
                    onChange={() => setRole(r.value)}
                    className={styles.roleRadio}
                  />
                  <span className={styles.roleName}>{r.label}</span>
                  <span className={styles.roleDesc}>{r.desc}</span>
                </label>
              ))}
            </div>
          </fieldset>

          {error && <p className={styles.error}>{error}</p>}

          <button className={styles.btn} type="submit" disabled={loading}>
            {loading ? 'Connecting…' : 'Log in →'}
          </button>
        </form>
      </div>
    </div>
  );
}
