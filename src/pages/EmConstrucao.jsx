import { FiTool } from 'react-icons/fi';

export default function EmConstrucao({ titulo }) {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center text-center py-5 my-5">
      <div
        className="d-flex align-items-center justify-content-center rounded-circle mb-3 badge-soft-gold"
        style={{ width: 64, height: 64 }}
      >
        <FiTool size={26} />
      </div>
      <h2 className="page-title h4 mb-1">{titulo}</h2>
      <p className="text-muted mb-0">Este módulo está sendo construído e chega em breve.</p>
    </div>
  );
}
