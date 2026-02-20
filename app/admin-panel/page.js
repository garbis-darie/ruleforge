'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
    const router = useRouter();
    const [authenticated, setAuthenticated] = useState(null);
    const [products, setProducts] = useState(null);
    const [activeTab, setActiveTab] = useState('products');
    const [saving, setSaving] = useState(null);
    const [message, setMessage] = useState('');

    // Check auth
    useEffect(() => {
        fetch('/api/admin/auth')
            .then(r => r.json())
            .then(d => {
                if (!d.authenticated) router.push('/admin-panel/login');
                else setAuthenticated(true);
            })
            .catch(() => router.push('/admin-panel/login'));
    }, [router]);

    // Load products
    const loadProducts = useCallback(() => {
        fetch('/api/admin/products')
            .then(r => r.json())
            .then(d => setProducts(d))
            .catch(err => console.error('Load products error:', err));
    }, []);

    useEffect(() => {
        if (authenticated) loadProducts();
    }, [authenticated, loadProducts]);

    const showMessage = (msg) => {
        setMessage(msg);
        setTimeout(() => setMessage(''), 3000);
    };

    const toggleProduct = async (slug, enabled) => {
        setSaving(slug);
        await fetch('/api/admin/products', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ slug, enabled: !enabled }),
        });
        loadProducts();
        setSaving(null);
        showMessage(`${slug}: ${!enabled ? 'enabled' : 'disabled'}`);
    };

    const updatePrice = async (slug, price) => {
        await fetch('/api/admin/products', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ slug, price: parseInt(price) }),
        });
        loadProducts();
        showMessage(`${slug}: price updated`);
    };

    const publishCategory = async (slug) => {
        setSaving(slug);
        const res = await fetch('/api/admin/publish', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ slug }),
        });
        const result = await res.json();
        setSaving(null);
        if (result.success) {
            showMessage(`Published ${slug}: ${result.rules} rules exported`);
        } else {
            showMessage(`Error: ${result.error}`);
        }
    };

    const logout = async () => {
        await fetch('/api/admin/auth', { method: 'DELETE' });
        router.push('/admin-panel/login');
    };

    if (!authenticated) {
        return (
            <div className="download-page">
                <div className="download-card"><p className="download-loading">Checking authentication...</p></div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
            {/* Admin Nav */}
            <nav className="nav">
                <div className="nav-inner">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <span className="logo-text">◈ LINK <span className="logo-accent">KYT</span></span>
                        <span style={{ padding: '4px 12px', fontSize: '11px', fontWeight: 700, background: 'rgba(245,158,11,0.15)', color: 'var(--warning)', borderRadius: '100px', border: '1px solid rgba(245,158,11,0.3)' }}>ADMIN</span>
                    </div>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                        <button onClick={() => setActiveTab('products')} className="btn btn-ghost" style={{ padding: '8px 16px', fontSize: '13px', background: activeTab === 'products' ? 'var(--bg-card)' : 'transparent' }}>Products</button>
                        <button onClick={() => setActiveTab('overview')} className="btn btn-ghost" style={{ padding: '8px 16px', fontSize: '13px', background: activeTab === 'overview' ? 'var(--bg-card)' : 'transparent' }}>Overview</button>
                        <button onClick={logout} className="btn btn-ghost" style={{ padding: '8px 16px', fontSize: '13px', color: 'var(--warning)' }}>Logout</button>
                    </div>
                </div>
            </nav>

            {/* Content */}
            <div className="container" style={{ paddingTop: '100px' }}>
                {message && (
                    <div style={{ position: 'fixed', top: '80px', right: '24px', padding: '12px 20px', background: 'var(--bg-card)', border: '1px solid var(--success)', borderRadius: 'var(--radius-sm)', fontSize: '13px', fontWeight: 600, color: 'var(--success)', zIndex: 200 }}>
                        {message}
                    </div>
                )}

                {activeTab === 'products' && products && (
                    <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                            <div>
                                <h1 style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-0.02em' }}>Products</h1>
                                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                                    {products.categories?.length || 0} categories • {products.categories?.filter(c => c.enabled).length || 0} enabled
                                </p>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gap: '12px' }}>
                            {(products.categories || []).map((cat) => (
                                <div key={cat.slug} style={{
                                    padding: '20px 24px', borderRadius: 'var(--radius)',
                                    background: 'var(--bg-card)', border: `1px solid ${cat.enabled ? 'var(--border)' : 'rgba(245,158,11,0.3)'}`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    opacity: cat.enabled ? 1 : 0.6,
                                    transition: 'all 0.2s',
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
                                        <span style={{ fontSize: '24px' }}>{cat.icon}</span>
                                        <div>
                                            <div style={{ fontSize: '15px', fontWeight: 700 }}>{cat.name}</div>
                                            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                                {cat.slug} • {cat.rules || 0} rules • £{((cat.price || 7900) / 100).toFixed(0)}
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <span style={{
                                            padding: '4px 10px', fontSize: '11px', fontWeight: 600,
                                            borderRadius: '100px',
                                            background: cat.enabled ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
                                            color: cat.enabled ? 'var(--success)' : 'var(--warning)',
                                            border: `1px solid ${cat.enabled ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)'}`,
                                        }}>
                                            {cat.enabled ? 'LIVE' : 'DISABLED'}
                                        </span>

                                        <button
                                            onClick={() => toggleProduct(cat.slug, cat.enabled)}
                                            disabled={saving === cat.slug}
                                            style={{
                                                padding: '6px 14px', fontSize: '12px', fontWeight: 600,
                                                background: cat.enabled ? 'rgba(245,158,11,0.1)' : 'rgba(16,185,129,0.1)',
                                                color: cat.enabled ? 'var(--warning)' : 'var(--success)',
                                                border: `1px solid ${cat.enabled ? 'rgba(245,158,11,0.2)' : 'rgba(16,185,129,0.2)'}`,
                                                borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                                            }}
                                        >
                                            {saving === cat.slug ? '...' : cat.enabled ? 'Disable' : 'Enable'}
                                        </button>

                                        <button
                                            onClick={() => publishCategory(cat.slug)}
                                            disabled={saving === cat.slug}
                                            className="btn-download"
                                            style={{ fontSize: '12px', padding: '6px 14px' }}
                                        >
                                            {saving === cat.slug ? 'Publishing...' : 'Publish'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {(!products.categories || products.categories.length === 0) && (
                            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
                                <p>No products configured yet.</p>
                                <p style={{ fontSize: '13px', marginTop: '8px' }}>Upload your products.json to get started.</p>
                            </div>
                        )}
                    </>
                )}

                {activeTab === 'overview' && (
                    <div>
                        <h1 style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '24px' }}>Overview</h1>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' }}>
                            <div style={{ padding: '24px', background: 'var(--bg-card)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                                <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--accent-bright)' }}>{products?.categories?.length || 0}</div>
                                <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '4px' }}>Total Categories</div>
                            </div>
                            <div style={{ padding: '24px', background: 'var(--bg-card)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                                <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--success)' }}>{products?.categories?.filter(c => c.enabled).length || 0}</div>
                                <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '4px' }}>Live Products</div>
                            </div>
                            <div style={{ padding: '24px', background: 'var(--bg-card)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                                <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--warning)' }}>{products?.categories?.reduce((sum, c) => sum + (c.rules || 0), 0) || 0}</div>
                                <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '4px' }}>Total Rules</div>
                            </div>
                        </div>

                        <div style={{ padding: '24px', background: 'var(--bg-card)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '12px' }}>Quick Links</h3>
                            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                <a href="https://dashboard.stripe.com" target="_blank" rel="noopener" className="btn btn-ghost" style={{ fontSize: '13px', padding: '8px 16px' }}>Stripe Dashboard ↗</a>
                                <a href="https://vercel.com/your-project/ruleforge" target="_blank" rel="noopener" className="btn btn-ghost" style={{ fontSize: '13px', padding: '8px 16px' }}>Vercel Dashboard ↗</a>
                                <a href="https://ruleforge.io" target="_blank" rel="noopener" className="btn btn-ghost" style={{ fontSize: '13px', padding: '8px 16px' }}>Live Site ↗</a>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
