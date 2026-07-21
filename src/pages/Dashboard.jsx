import { useEffect, useState } from 'react';
import {
  FiPackage,
  FiAlertTriangle,
  FiShoppingBag,
  FiCalendar,
  FiDollarSign,
  FiTrendingUp
} from 'react-icons/fi';
import * as dashboardService from '../services/dashboardService';
import { mensagemErro } from '../services/api';
import { formatarMoeda, formatarNumero, formatarDataHora, PLATAFORMAS_LABEL } from '../utils/format';
import KpiCard from '../components/common/KpiCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorAlert from '../components/common/ErrorAlert';

export default function Dashboard() {
  const [dados, setDados] = useState(null);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    dashboardService
      .buscarDashboard()
      .then(setDados)
      .catch((err) => setErro(mensagemErro(err)))
      .finally(() => setCarregando(false));
  }, []);

  if (carregando) return <LoadingSpinner texto="Carregando dashboard..." />;
  if (erro) return <ErrorAlert mensagem={erro} />;
  if (!dados) return null;

  return (
    <div>
      <div className="row g-3 mb-3">
        <div className="col-6 col-lg-3">
          <KpiCard icon={FiPackage} label="Valor em estoque" value={formatarMoeda(dados.valor_total_estoque)} tone="primary" />
        </div>
        <div className="col-6 col-lg-3">
          <KpiCard icon={FiShoppingBag} label="Produtos cadastrados" value={formatarNumero(dados.produtos_cadastrados)} tone="gold" />
        </div>
        <div className="col-6 col-lg-3">
          <KpiCard
            icon={FiAlertTriangle}
            label="Estoque baixo"
            value={formatarNumero(dados.produtos_estoque_baixo)}
            tone="danger"
            hint={dados.produtos_estoque_baixo > 0 ? 'Atenção necessária' : 'Tudo certo'}
          />
        </div>
        <div className="col-6 col-lg-3">
          <KpiCard icon={FiCalendar} label="Vendido hoje" value={formatarNumero(dados.quantidade_vendida_hoje)} tone="success" hint="unidades" />
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <KpiCard icon={FiShoppingBag} label="Vendido no mês" value={`${formatarNumero(dados.quantidade_vendida_mes)} un.`} tone="primary" />
        </div>
        <div className="col-md-4">
          <KpiCard icon={FiDollarSign} label="Faturamento no mês" value={formatarMoeda(dados.valor_vendido_mes)} tone="gold" />
        </div>
        <div className="col-md-4">
          <KpiCard icon={FiTrendingUp} label="Lucro no mês" value={formatarMoeda(dados.lucro_mes)} tone="success" />
        </div>
      </div>

      <div className="row g-3">
        <div className="col-lg-7">
          <div className="card h-100">
            <div className="card-header bg-white border-0 pt-3 pb-0">
              <h2 className="h6 mb-0">Últimas vendas</h2>
            </div>
            <div className="card-body pt-2">
              {dados.ultimas_vendas.length === 0 ? (
                <p className="text-muted small mb-0">Nenhuma venda registrada ainda.</p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-sm align-middle mb-0">
                    <thead>
                      <tr className="text-muted small">
                        <th>Plataforma</th>
                        <th>Itens</th>
                        <th>Valor</th>
                        <th>Lucro</th>
                        <th>Data</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dados.ultimas_vendas.map((venda) => (
                        <tr key={venda.id}>
                          <td>
                            <span className="badge badge-soft-primary">{PLATAFORMAS_LABEL[venda.plataforma] || venda.plataforma}</span>
                          </td>
                          <td className="text-muted">{venda.qtd_itens}</td>
                          <td className="text-mono-num">{formatarMoeda(venda.valor_total)}</td>
                          <td className="text-mono-num text-success">{formatarMoeda(venda.lucro_total)}</td>
                          <td className="text-muted small">{formatarDataHora(venda.data_venda)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-lg-5">
          <div className="card h-100">
            <div className="card-header bg-white border-0 pt-3 pb-0">
              <h2 className="h6 mb-0">Mais vendidos no mês</h2>
            </div>
            <div className="card-body pt-2">
              {dados.produtos_mais_vendidos.length === 0 ? (
                <p className="text-muted small mb-0">Sem vendas registradas neste mês.</p>
              ) : (
                <ul className="list-unstyled mb-0">
                  {dados.produtos_mais_vendidos.map((produto, index) => (
                    <li key={produto.id} className="d-flex align-items-center gap-3 py-2 border-bottom">
                      <span className="badge-soft-gold rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 fw-semibold" style={{ width: 28, height: 28, fontSize: '0.8rem' }}>
                        {index + 1}
                      </span>
                      <div className="min-w-0 flex-grow-1">
                        <div className="small fw-semibold text-truncate">{produto.nome}</div>
                        <div className="text-muted" style={{ fontSize: '0.78rem' }}>{produto.sku}</div>
                      </div>
                      <span className="text-mono-num small fw-semibold">{formatarNumero(produto.total_vendido)} un.</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>

      {dados.produtos_estoque_baixo_lista.length > 0 && (
        <div className="card mt-3">
          <div className="card-header bg-white border-0 pt-3 pb-0 d-flex align-items-center gap-2">
            <FiAlertTriangle size={16} className="text-danger" />
            <h2 className="h6 mb-0">Produtos com estoque baixo</h2>
          </div>
          <div className="card-body pt-2">
            <div className="table-responsive">
              <table className="table table-sm align-middle mb-0">
                <thead>
                  <tr className="text-muted small">
                    <th>Produto</th>
                    <th>SKU</th>
                    <th>Estoque atual</th>
                    <th>Estoque mínimo</th>
                  </tr>
                </thead>
                <tbody>
                  {dados.produtos_estoque_baixo_lista.map((produto) => (
                    <tr key={produto.id}>
                      <td>{produto.nome}</td>
                      <td className="text-muted">{produto.sku}</td>
                      <td className="text-mono-num text-danger fw-semibold">{produto.estoque_atual}</td>
                      <td className="text-mono-num text-muted">{produto.estoque_minimo}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
