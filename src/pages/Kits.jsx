import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { formatCurrency } from '../utils/format';
import { FaPlus, FaTrash, FaEye, FaEyeSlash } from 'react-icons/fa';
import KitForm from '../components/kits/KitForm';

const API_ORIGIN = (import.meta.env.VITE_API_URL || 'https://maryglow-backend.onrender.com/api').replace(/\/api$/, '');

export default function Kits() {
  const [kits, setKits] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);
      const [resKits, resProdutos] = await Promise.all([
        api.get('/kits'),
        api.get('/produtos')
      ]);
      setKits(resKits.data.kits);
      setProdutos(resProdutos.data.produtos.filter((p) => p.estoque_atual > 0));
    } catch (error) {
      console.error('Erro ao carregar kits:', error);
      alert('Erro ao carregar kits. Verifique sua conexão.');
    } finally {
      setLoading(false);
    }
  };

  const handleSalvar = async (dadosKit, imagemArquivo) => {
    try {
      let payload = { ...dadosKit, itens: JSON.stringify(dadosKit.itens) };
      let config = {};

      if (imagemArquivo) {
        const form = new FormData();
        Object.entries(payload).forEach(([chave, valor]) => form.append(chave, valor));
        form.append('imagem', imagemArquivo);
        payload = form;
        config = { headers: { 'Content-Type': 'multipart/form-data' } };
      }

      await api.post('/kits', payload, config);
      setShowModal(false);
      carregarDados();
    } catch (error) {
      console.error('Erro ao salvar kit:', error);
      alert(error.response?.data?.mensagem || 'Erro ao salvar kit. Verifique os dados e tente novamente.');
    }
  };

  const alternarVisibilidade = async (kit) => {
    try {
      await api.patch(`/kits/${kit.id}/status`, {
        ativo: kit.ativo,
        visivel_catalogo: !kit.visivel_catalogo
      });
      carregarDados();
    } catch (error) {
      console.error('Erro ao atualizar kit:', error);
      alert('Não foi possível atualizar a visibilidade do kit.');
    }
  };

  const handleExcluir = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este kit?')) {
      try {
        await api.delete(`/kits/${id}`);
        carregarDados();
      } catch (error) {
        console.error('Erro ao excluir kit:', error);
        alert('Não foi possível excluir o kit.');
      }
    }
  };

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Kits Promocionais</h2>
        <button className="btn btn-primary d-flex align-items-center gap-2" onClick={() => setShowModal(true)}>
          <FaPlus /> Novo Kit
        </button>
      </div>

      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body">
          {loading ? (
            <div className="text-center py-4">Carregando kits...</div>
          ) : kits.length === 0 ? (
            <div className="text-center py-4 text-muted">
              Nenhum kit cadastrado ainda. Clique em "Novo Kit" para montar o primeiro combo.
            </div>
          ) : (
            <div className="row g-3">
              {kits.map((kit) => (
                <div className="col-md-6 col-lg-4" key={kit.id}>
                  <div className="card h-100 border">
                    {kit.imagem_url && (
                      <img src={`${API_ORIGIN}${kit.imagem_url}`} alt={kit.nome} className="card-img-top" style={{ height: 160, objectFit: 'cover' }} />
                    )}
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-start">
                        <h6 className="fw-bold mb-1">{kit.nome}</h6>
                        {kit.destaque && <span className="badge bg-warning text-dark">{kit.destaque}</span>}
                      </div>
                      <p className="text-pink fw-bold mb-2">{formatCurrency(kit.preco)}</p>
                      <ul className="small text-muted ps-3 mb-3">
                        {kit.itens.map((item) => (
                          <li key={item.id}>{item.rotulo} — {item.opcoes.length} opção(ões)</li>
                        ))}
                      </ul>
                      <div className="d-flex justify-content-between align-items-center">
                        <button
                          className={`btn btn-sm ${kit.visivel_catalogo ? 'btn-outline-success' : 'btn-outline-secondary'} d-flex align-items-center gap-1`}
                          onClick={() => alternarVisibilidade(kit)}
                        >
                          {kit.visivel_catalogo ? <FaEye /> : <FaEyeSlash />}
                          {kit.visivel_catalogo ? 'Visível no catálogo' : 'Oculto no catálogo'}
                        </button>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleExcluir(kit.id)}>
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <KitForm
        show={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSalvar}
        produtos={produtos}
      />
    </div>
  );
}
