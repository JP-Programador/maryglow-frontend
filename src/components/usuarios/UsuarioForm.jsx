import React, { useState, useEffect } from 'react';

export default function UsuarioForm({ show, onClose, onSave, usuarioEditado }) {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    nivel: 'funcionario'
  });

  useEffect(() => {
    if (usuarioEditado) {
      // Deixamos a senha vazia na edição para não sobrescrever caso não seja alterada
      setFormData({ ...usuarioEditado, senha: '' });
    } else {
      setFormData({ nome: '', email: '', senha: '', nivel: 'funcionario' });
    }
  }, [usuarioEditado, show]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!show) return null;

  return (
    <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <form onSubmit={handleSubmit}>
            <div className="modal-header">
              <h5 className="modal-title">{usuarioEditado ? 'Editar Usuário' : 'Novo Usuário'}</h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>
            
            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label">Nome *</label>
                <input type="text" className="form-control" name="nome" value={formData.nome} onChange={handleChange} required />
              </div>
              <div className="mb-3">
                <label className="form-label">E-mail *</label>
                <input type="email" className="form-control" name="email" value={formData.email} onChange={handleChange} required />
              </div>
              <div className="mb-3">
                <label className="form-label">
                  Senha {usuarioEditado ? <small className="text-muted">(Deixe em branco para manter a atual)</small> : '*'}
                </label>
                <input 
                  type="password" 
                  className="form-control" 
                  name="senha" 
                  value={formData.senha} 
                  onChange={handleChange} 
                  required={!usuarioEditado} 
                  placeholder={usuarioEditado ? '*******' : 'Digite a senha'}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Nível de Acesso *</label>
                <select className="form-select" name="nivel" value={formData.nivel} onChange={handleChange} required>
                  <option value="funcionario">Funcionário</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
              <button type="submit" className="btn btn-primary">Salvar Usuário</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}