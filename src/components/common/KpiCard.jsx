export default function KpiCard({ icon: Icon, label, value, tone = 'primary', hint }) {
  return (
    <div className="card h-100">
      <div className="card-body d-flex align-items-start gap-3">
        <div className={`badge-soft-${tone} kpi-icon rounded-3 d-flex align-items-center justify-content-center flex-shrink-0`}>
          <Icon size={20} />
        </div>
        <div className="min-w-0 flex-grow-1">
          <div className="text-muted small mb-1 text-truncate">{label}</div>
          <div className="kpi-value fw-semibold text-mono-num">{value}</div>
          {hint && <div className="text-muted small mt-1">{hint}</div>}
        </div>
      </div>
    </div>
  );
}
