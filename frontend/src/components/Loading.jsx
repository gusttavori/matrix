export default function Loading({ size = 'md', text = 'Carregando...' }) {
  return (
    <div className={`loading ${size === 'sm' ? 'loading--sm' : ''}`}>
      <div style={{ textAlign: 'center' }}>
        <div className="loading__spinner"></div>
        {text && <p style={{ marginTop: 'var(--space-3)', fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>{text}</p>}
      </div>
    </div>
  );
}
