'use client';
import { useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';

function DownloadContent() {
    const searchParams = useSearchParams();
    const sessionId = searchParams.get('session_id');
    const [state, setState] = useState({ status: 'loading', data: null, error: null });

    useEffect(() => {
        if (!sessionId) {
            setState({ status: 'error', error: 'No session ID provided.' });
            return;
        }
        fetch(`/api/download?session_id=${sessionId}`)
            .then(r => r.json())
            .then(data => {
                if (data.error) setState({ status: 'error', error: data.error });
                else setState({ status: 'ready', data });
            })
            .catch(() => setState({ status: 'error', error: 'Failed to verify your purchase.' }));
    }, [sessionId]);

    if (state.status === 'loading') {
        return (
            <div className="download-page">
                <div className="download-card">
                    <div className="download-icon">⏳</div>
                    <h1>Verifying your purchase...</h1>
                    <p className="download-loading">Please wait while we confirm your payment.</p>
                </div>
            </div>
        );
    }

    if (state.status === 'error') {
        return (
            <div className="download-page">
                <div className="download-card">
                    <div className="download-icon">⚠️</div>
                    <h1>Something went wrong</h1>
                    <p className="download-error">{state.error}</p>
                    <br />
                    <a href="/" className="btn btn-outline">← Back to RuleForge</a>
                </div>
            </div>
        );
    }

    const { productName, files } = state.data;

    return (
        <div className="download-page">
            <div className="download-card">
                <div className="download-icon">🎉</div>
                <h1>Your files are ready!</h1>
                <p className="download-sub">Thank you for purchasing <strong>{productName}</strong>.</p>
                <div className="download-files">
                    {files.map((file) => (
                        <div key={file.slug} className="download-file">
                            <div className="download-file-info">
                                <span className="download-file-icon">📄</span>
                                <div>
                                    <div className="download-file-name">{file.name}</div>
                                    <div className="download-file-size">CSV • Implementation Rules</div>
                                </div>
                            </div>
                            <a href={`/api/download/${file.slug}?session_id=${sessionId}`} className="btn-download">Download</a>
                        </div>
                    ))}
                </div>
                <p className="download-help">
                    Files also sent to your email. Questions? <a href="mailto:hello@example.com">Contact us</a>
                </p>
            </div>
        </div>
    );
}

export default function DownloadPage() {
    return (
        <Suspense fallback={
            <div className="download-page">
                <div className="download-card">
                    <div className="download-icon">⏳</div>
                    <h1>Loading...</h1>
                </div>
            </div>
        }>
            <DownloadContent />
        </Suspense>
    );
}
