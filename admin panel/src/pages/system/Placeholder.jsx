export default function Placeholder({ title, icon, desc }) {
  return (
    <div className="page-content">
      <div className="page-header">
        <h1 className="page-title">{title}</h1>
        <p className="page-subtitle">{desc}</p>
      </div>
      <div className="dash-card" style={{ textAlign: 'center', padding: '80px 20px' }}>
        <div style={{
          width: 80, height: 80, borderRadius: 20,
          background: 'rgba(99,102,241,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px',
        }}>
          <i className={`bi ${icon}`} style={{ fontSize: 36, color: 'var(--accent)' }} />
        </div>
        <h4 style={{ color: 'var(--text-primary)', marginBottom: 8 }}>{title}</h4>
        <p style={{ color: 'var(--text-muted)', fontSize: 14, maxWidth: 340, margin: '0 auto 24px' }}>
          This page is under active development. Check back soon for exciting new features!
        </p>
        <button className="btn-accent"><i className="bi bi-bell" /> Notify Me</button>
      </div>
    </div>
  );
}
