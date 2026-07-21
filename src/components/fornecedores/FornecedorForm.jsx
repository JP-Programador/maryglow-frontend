import React, { useState, useEffect } from 'react';

export default function FornecedorForm({ show, onClose, onSave, fornecedorEditado }) {
  const [formData, setFormData] = useState({
    razao_social: '',
    nome_fantasia: '',
    cnpj: '',
    telefone: '',
    email: '',
    endereco: ''
  });

  useEffect(() => {
    if (fornecedorEditado) {
      setFormData(fornecedorEditado);
    } else {
      setFormData({
        razao_social: '', nome_fantasia: '', cnpj: '', telefone: '', email: '', endereco: ''
      });
    }
  }, [fornecedorEditado, show]);

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
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <form onSubmit={handleSubmit}>
            <div className="modal-header">
              <h5 className="modal-title">{fornecedorEditado ? 'Editar Fornecedor' : 'Novo Fornecedor'}</h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>
            
            <div className="modal-body">
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Razão Social *</label>
                  <input type="text" className="form-control" name="razao_social" value={formData.razao_social} onChange={handleChange} required />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Nome Fantasia</label>
                  <input type="text" className="form-control" name="nome_fantasia" value={formData.nome_fantasia} onChange={handleChange} />
                </div>

                <div className="col-md-6">
                  <label className="form-label">CNPJ</label>
                  <input type="text" className="form-control" name="cnpj" value={formData.cnpj} onChange={handleChange} placeholder="00.000.000/0000-00" />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Telefone</label>
                  <input type="text" className="form-control" name="telefone" value={formData.telefone} onChange={handleChange} placeholder="(00) 00000-0000" />
                </div>

                <div className="col-md-12">
                  <label className="form-label">E-mail</label>
                  <input type="email" className="form-control" name="email" value={formData.email} onChange={handleChange} />
                </div>

                <div className="col-md-12">
                  <label className="form-label">Endereço Completo</label>
                  <input type="text" className="form-control" name="endereco" value={formData.endereco} onChange={handleChange} />
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
              <button type="submit" className="btn btn-primary">Salvar Fornecedor</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}