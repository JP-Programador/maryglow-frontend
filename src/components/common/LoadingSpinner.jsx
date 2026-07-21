export default function LoadingSpinner({ texto = 'Carregando...' }) {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center py-5 text-muted">
      <div className="spinner-border" role="status" style={{ color: 'var(--mg-primary)' }}>
        <span className="visually-hidden">{texto}</span>
      </div>
      <p className="mt-3 mb-0 small">{texto}</p>
    </div>
  );
}
