'use client'

export default function Home() {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: 'var(--background)',
      color: 'var(--text)',
    }}>
      <div style={{
        background: 'var(--card)',
        color: 'var(--card-foreground)',
        boxShadow: '0 4px 24px 0 rgba(31, 58, 96, 0.08)',
        borderRadius: '16px',
        padding: '48px 32px',
        minWidth: '340px',
        maxWidth: '90vw',
        textAlign: 'center',
        border: '1px solid var(--border)',
      }}>
        <h1 style={{ marginBottom: '20px', color: 'var(--primary)' }}>L&D Course Platform</h1>
        <p style={{ marginBottom: '28px', color: 'var(--muted-foreground)', fontSize: '1.1rem' }}>
          Create and manage courses for your organization
        </p>
        <a
          href="/login"
          style={{
            display: 'inline-block',
            padding: '12px 32px',
            backgroundColor: 'var(--primary)',
            color: 'var(--primary-foreground)',
            textDecoration: 'none',
            borderRadius: '8px',
            fontWeight: 600,
            fontSize: '1rem',
            boxShadow: '0 2px 8px 0 rgba(31, 58, 96, 0.10)',
            transition: 'background 0.2s, box-shadow 0.2s',
            border: 'none',
          }}
          onMouseOver={e => {
            (e.currentTarget as HTMLAnchorElement).style.backgroundColor = 'var(--accent)';
            (e.currentTarget as HTMLAnchorElement).style.color = 'var(--accent-foreground)';
            (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 4px 16px 0 rgba(31, 58, 96, 0.15)';
          }}
          onMouseOut={e => {
            (e.currentTarget as HTMLAnchorElement).style.backgroundColor = 'var(--primary)';
            (e.currentTarget as HTMLAnchorElement).style.color = 'var(--primary-foreground)';
            (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 2px 8px 0 rgba(31, 58, 96, 0.10)';
          }}
        >
          Get Started
        </a>
      </div>
    </div>
  );
}
