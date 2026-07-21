import { FiAlertCircle } from 'react-icons/fi';

export default function ErrorAlert({ mensagem }) {
  if (!mensagem) return null;
  return (
    <div className="alert d-flex align-items-center gap-2 badge-soft-danger border-0" role="alert">
      <FiAlertCircle size={18} />
      <span>{mensagem}</span>
    </div>
  );
}
