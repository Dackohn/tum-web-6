import { useState } from 'react';
import { login } from '../api/authClient.js';
import styles from './LoginPage.module.css';

const TEST_ACCOUNTS = [
  { username: 'alice',   password: 'alice123',   role: 'Admin',   desc: 'read, write & delete' },
  { username: 'bob',     password: 'bob123',     role: 'Writer',  desc: 'read & write' },
  { username: 'charlie', password: 'charlie123', role: 'Visitor', desc: 'read only' },
];

export function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!username.trim() || !password) { setError('Enter your username and password.'); return; }
    setError('');
    setLoading(true);
    try {
      const user = await login(username.trim(), password);
      onLogin(user);
    } catch (err) {
      setError(err.message || 'Could not reach the server.');
    } finally {
      setLoading(false);
    }
  }

  function fillAccount(account) {
    setUsername(account.username);
    setPassword(account.password);
    setError('');
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

          <label className={styles.label}>
            Password
            <input
              className={styles.input}
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </label>

          {error && <p className={styles.error}>{error}</p>}

          <button className={styles.btn} type="submit" disabled={loading}>
            {loading ? 'Connecting…' : 'Log in →'}
          </button>
        </form>

        <div className={styles.accounts}>
          <p className={styles.accountsLabel}>Test accounts</p>
          <div className={styles.accountList}>
            {TEST_ACCOUNTS.map(a => (
              <button
                key={a.username}
                className={styles.accountChip}
                type="button"
                onClick={() => fillAccount(a)}
                title={`Log in as ${a.username} (${a.role})`}
              >
                <span className={styles.accountName}>{a.username}</span>
                <span className={styles.accountRole}>{a.role}</span>
                <span className={styles.accountDesc}>{a.desc}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
