'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/admin/auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            if (res.ok) {
                router.push('/admin-04e3521103a54579');
            } else {
                setError('Invalid credentials');
            }
        } catch {
            setError('Connection failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="download-page">
            <div className="download-card" style={{ maxWidth: '400px' }}>
                <div className="download-icon">🔐</div>
                <h1>Admin Access</h1>
                <p className="download-sub">LINK KYT Operations Hub</p>
                {error && <p style={{ color: 'var(--warning)', marginBottom: '16px', fontSize: '14px' }}>{error}</p>}
                <form onSubmit={handleLogin} style={{ textAlign: 'left' }}>
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            autoComplete="username"
                            style={{
                                width: '100%', padding: '12px 16px', fontSize: '14px',
                                background: 'var(--bg-surface)', border: '1px solid var(--border-light)',
                                borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)',
                                outline: 'none',
                            }}
                        />
                    </div>
                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            autoComplete="current-password"
                            style={{
                                width: '100%', padding: '12px 16px', fontSize: '14px',
                                background: 'var(--bg-surface)', border: '1px solid var(--border-light)',
                                borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)',
                                outline: 'none',
                            }}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-primary"
                        style={{ width: '100%' }}
                    >
                        {loading ? 'Authenticating...' : 'Sign In'}
                    </button>
                </form>
            </div>
        </div>
    );
}
