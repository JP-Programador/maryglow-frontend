export default function KpiCard({ icon: Icon, label, value, tone = 'primary', hint }) {
  return (
    <div className="card h-100">
      <div className="card-body d-flex align-items-start gap-3">
        <div className={`badge-soft-${tone} rounded-3 d-flex align-items-center justify-content-center flex-shrink-0`} style={{ width: 44, height: 44 }}>
          <Icon size={20} />
        </div>
        <div className="min-w-0">
          <div className="text-muted small mb-1">{label}</div>
          <div className="fs-5 fw-semibold text-mono-num text-truncate">{value}</div>
          {hint && <div className="text-muted small mt-1">{hint}</div>}
        </div>
      </div>
    </div>
  );
}
