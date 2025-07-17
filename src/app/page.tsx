export default function Home() {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      flexDirection: 'column',
      backgroundColor: 'var(--background)',
      color: 'var(--text)'
    }}>
      <h1 style={{ marginBottom: '20px', color: 'var(--text)' }}>L&D Course Platform</h1>
      <p style={{ marginBottom: '20px', color: 'var(--muted-foreground)' }}>
        Create and manage courses for your organization
      </p>
      <a
        href="/login"
        style={{
          padding: '10px 20px',
          backgroundColor: 'var(--primary)',
          color: 'var(--primary-foreground)',
          textDecoration: 'none',
          borderRadius: '4px'
        }}
      >
        Get Started
      </a>
    </div>
  );
}
