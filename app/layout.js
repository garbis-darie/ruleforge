import './globals.css';

export const metadata = {
    title: 'RuleForge — Transaction Monitoring Threshold Templates',
    description: 'Pre-built alert rules for crypto compliance. 11 risk categories, 58 rules. Import-ready CSV templates for Chainalysis KYT, Elliptic, and any TMS.',
    icons: { icon: '/favicon.svg' },
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
            </head>
            <body>{children}</body>
        </html>
    );
}
