import { useState } from 'react';
import { login, registerAdmin } from '../api/authClient.js';
import styles from './LoginPage.module.css';

export function LoginPage({ onLogin }) {
  const [tab, setTab]           = useState('login'); // 'login' | 'register'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  function switchTab(t) { setTab(t); setError(''); }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!username.trim() || !password) { setError('Enter your username and password.'); return; }
    setError('');
    setLoading(true);
    try {
      const user = tab === 'login'
        ? await login(username.trim(), password)
        : await registerAdmin(username.trim(), password);
      onLogin(user);
    } catch (err) {
      setError(err.message || 'Could not reach the server.');
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

        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${tab === 'login' ? styles.tabActive : ''}`}
            onClick={() => switchTab('login')}
            type="button"
          >
            Log in
          </button>
          <button
            className={`${styles.tab} ${tab === 'register' ? styles.tabActive : ''}`}
            onClick={() => switchTab('register')}
            type="button"
          >
            Create workspace
          </button>
        </div>

        {tab === 'register' && (
          <p className={styles.hint}>
            Creates a new admin workspace. You can invite writers and visitors after logging in.
          </p>
        )}

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
              autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
            />
          </label>

          {error && <p className={styles.error}>{error}</p>}

          <button className={styles.btn} type="submit" disabled={loading}>
            {loading
              ? 'Connecting…'
              : tab === 'login' ? 'Log in →' : 'Create workspace →'}
          </button>
        </form>
      </div>
    </div>
  );
}
