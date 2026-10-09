import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { FaArrowLeft, FaTrophy, FaCalculator } from 'react-icons/fa';
import api, { mensagemErro } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { formatCurrency, formatarDataHora } from '../utils/format';

/* Ficha de precificação (produto ou kit). Todo o cálculo vem pronto do backend;
   esta tela só exibe os resultados e envia os dados do simulador. */

const COR_FAROL = { verde: 'success', amarelo: 'warning', vermelho: 'danger', preto: 'dark' };

function Farol({ farol }) {
  if (!farol) return <span className="text-muted">-</span>;
  return <span className={`badge bg-${COR_FAROL[farol.cor] || 'secondary'}`}>{farol.rotulo}</span>;
}

const pct = (v) => (v === null || v === undefined ? '-' : `${Number(v).toFixed(2).replace('.', ',')}%`);
const brl = (v) => (v === null || v === undefined ? '-' : formatCurrency(v));

function CartaoPlataforma({ p, melhor, produtoId, onAplicar }) {
  const d = p.detalhe;
  const aplicar = async () => {
    if (!window.confirm(`Definir ${formatCurrency(p.preco_recomendado)} como PREÇO DE VENDA deste produto (usado no PDV e no catálogo)?`)) return;
    await onAplicar(p.codigo);
  };
  return (
    <div className="card shadow-sm border-0 h-100">
      <div className="card-header bg-white d-flex justify-content-between align-items-center">
        <h5 className="m-0">{p.nome}</h5>
        {melhor && <span className="badge bg-warning text-dark"><FaTrophy className="me-1" />Melhor</span>}
      </div>
      <div className="card-body">
        {p.aviso && <div className="alert alert-warning py-2 small">{p.aviso}</div>}
        {d && (
          <>
            <div className="d-flex justify-content-between align-items-end mb-3">
              <div>
                <div className="text-muted small">Preço recomendado</div>
                <div className="fs-2 fw-bold text-primary">{brl(p.preco_recomendado)}</div>
              </div>
              <Farol farol={d.farol} />
            </div>
            <table className="table table-sm mb-0">
              <tbody>
                <tr><td>Preço mínimo promocional</td><td className="text-end fw-semibold">{brl(p.preco_minimo)}</td></tr>
                <tr><td>Desconto máximo</td><td className="text-end fw-semibold">{pct(p.desconto_maximo)}</td></tr>
                <tr><td>Total de taxas</td><td className="text-end">{brl(d.total_taxas)}</td></tr>
                <tr><td className="ps-4 text-muted small">Comissão</td><td className="text-end text-muted small">{brl(d.taxas.comissao)}</td></tr>
                <tr><td className="ps-4 text-muted small">Taxa fixa</td><td className="text-end text-muted small">{brl(d.taxas.taxa_fixa)}</td></tr>
                <tr><td className="ps-4 text-muted small">Programa de frete</td><td className="text-end text-muted small">{brl(d.taxas.frete)}</td></tr>
                <tr><td>Recebimento líquido</td><td className="text-end">{brl(d.liquido)}</td></tr>
                <tr><td>Custo total</td><td className="text-end">{brl(d.custo)}</td></tr>
                <tr><td>Lucro líquido</td><td className="text-end fw-bold text-success">{brl(d.lucro)}</td></tr>
                <tr><td>Margem líquida</td><td className="text-end fw-bold">{pct(d.margem)}</td></tr>
              </tbody>
            </table>
            {produtoId && (
              <button className="btn btn-sm btn-outline-primary mt-3" onClick={aplicar}>
                Usar como preço de venda
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function Comparativo({ plataformas, melhor }) {
  const [a, b] = plataformas;
  if (!a || !b) return null;
  const linhas = [
    ['Preço recomendado', (p) => brl(p.preco_recomendado)],
    ['Total de taxas', (p) => brl(p.detalhe?.total_taxas)],
    ['Recebimento líquido', (p) => brl(p.detalhe?.liquido)],
    ['Custo', (p) => brl(p.detalhe?.custo)],
    ['Lucro', (p) => brl(p.detalhe?.lucro)],
    ['Margem', (p) => pct(p.detalhe?.margem)],
    ['Preço mínimo', (p) => brl(p.preco_minimo)],
    ['Desconto máximo', (p) => pct(p.desconto_maximo)],
    ['Comissão máx. de afiliado', (p) => pct(p.afiliados?.comissao_maxima_recomendada)]
  ];
  return (
    <div className="card shadow-sm border-0 mb-4">
      <div className="card-header bg-white d-flex justify-content-between align-items-center flex-wrap gap-2">
        <h5 className="m-0">Comparativo</h5>
        {melhor && <span className="badge bg-warning text-dark fs-6"><FaTrophy className="me-1" />Melhor plataforma: {plataformas.find((p) => p.codigo === melhor)?.nome}</span>}
      </div>
      <div className="table-responsive">
        <table className="table mb-0">
          <thead className="table-light"><tr><th>Indicador</th><th>{a.nome}</th><th>{b.nome}</th></tr></thead>
          <tbody>
            {linhas.map(([rotulo, f]) => (
              <tr key={rotulo}><td>{rotulo}</td><td>{f(a)}</td><td>{f(b)}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TabelaCombos({ combos, plataformas }) {
  return (
    <div className="card shadow-sm border-0 mb-4">
      <div className="card-header bg-white"><h5 className="m-0">Combos automáticos</h5></div>
      <div className="table-responsive">
        <table className="table table-sm align-middle mb-0 text-nowrap">
          <thead className="table-light">
            <tr>
              <th>Qtd</th><th>Custo</th><th>Margem alvo</th>
              {plataformas.map((p) => <th key={p.codigo}>Preço {p.nome}</th>)}
              {plataformas.map((p) => <th key={`l${p.codigo}`}>Lucro {p.nome}</th>)}
              {plataformas.map((p) => <th key={`m${p.codigo}`}>Margem {p.nome}</th>)}
            </tr>
          </thead>
          <tbody>
            {combos.map((c) => (
              <tr key={c.quantidade}>
                <td className="fw-bold">{c.quantidade} un{c.quantidade === 4 ? '+' : ''}</td>
                <td>{brl(c.custo)}</td>
                <td>{pct(c.margem_alvo)}</td>
                {plataformas.map((p) => (
                  <td key={p.codigo} className={c.melhor_plataforma === p.codigo ? 'fw-bold' : ''}>
                    {brl(c.plataformas[p.codigo]?.preco)}
                    <div className="small text-muted">{brl(c.plataformas[p.codigo]?.preco_unidade)}/un</div>
                  </td>
                ))}
                {plataformas.map((p) => <td key={`l${p.codigo}`}>{brl(c.plataformas[p.codigo]?.lucro)}</td>)}
                {plataformas.map((p) => (
                  <td key={`m${p.codigo}`}>{pct(c.plataformas[p.codigo]?.margem)} <Farol farol={c.plataformas[p.codigo]?.farol} /></td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="card-footer bg-white small text-muted">A taxa fixa da plataforma é cobrada uma vez por pedido, por isso o combo sai mais barato que unidades avulsas.</div>
    </div>
  );
}

function CampoAfiliado({ p, onSalvar }) {
  const [valor, setValor] = useState(String(p.afiliados?.percentual_cadastrado ?? 0));
  return (
    <div className="d-flex gap-1" style={{ minWidth: 150 }}>
      <input type="number" min="0" max="99" step="0.5" className="form-control form-control-sm" value={valor} onChange={(e) => setValor(e.target.value)} />
      <button className="btn btn-sm btn-primary" onClick={() => onSalvar(p.plataforma_id, valor)}>Salvar</button>
    </div>
  );
}

function Afiliados({ plataformas, onSalvar }) {
  return (
    <div className="card shadow-sm border-0 mb-4">
      <div className="card-header bg-white"><h5 className="m-0">Afiliados</h5></div>
      <div className="table-responsive">
        <table className="table table-sm align-middle mb-0 text-nowrap">
          <thead className="table-light">
            <tr><th>Plataforma</th>{[0, 5, 10, 15, 20].map((n) => <th key={n}>{n === 0 ? 'Sem afiliado' : `${n}%`}</th>)}<th>Comissão máxima recomendada</th>{onSalvar && <th>Comissão cadastrada (%)</th>}</tr>
          </thead>
          <tbody>
            {plataformas.map((p) => (
              <tr key={p.codigo}>
                <td className="fw-semibold">{p.nome}</td>
                {(p.afiliados?.tabela || []).map((t) => (
                  <td key={t.percentual}>{pct(t.margem)} <Farol farol={t.farol} /></td>
                ))}
                <td className="fw-bold text-success">{pct(p.afiliados?.comissao_maxima_recomendada)}</td>
                {onSalvar && <td><CampoAfiliado p={p} onSalvar={onSalvar} /></td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="card-footer bg-white small text-muted">Margem líquida do preço recomendado em cada nível de comissão. A comissão máxima é a maior que ainda respeita a margem mínima.</div>
    </div>
  );
}

function Simulador({ ficha, tipo, id }) {
  const [plataforma, setPlataforma] = useState(ficha.plataformas[0]?.codigo || '');
  const [desconto, setDesconto] = useState('10');
  const [afiliado, setAfiliado] = useState('0');
  const [res, setRes] = useState(null);
  const [erro, setErro] = useState('');
  const [calculando, setCalculando] = useState(false);

  const simular = async () => {
    setErro('');
    setCalculando(true);
    try {
      const r = await api.post('/precificacao/simular', {
        [tipo === 'kit' ? 'kit_id' : 'produto_id']: Number(id),
        plataforma,
        desconto_percentual: Number(desconto || 0),
        afiliado_percentual: Number(afiliado || 0)
      });
      setRes(r.data.simulacao);
    } catch (e) {
      setRes(null);
      setErro(mensagemErro(e));
    } finally {
      setCalculando(false);
    }
  };

  return (
    <div className="card shadow-sm border-0 mb-4">
      <div className="card-header bg-white"><h5 className="m-0">Simular promoção</h5></div>
      <div className="card-body">
        <div className="row g-3 align-items-end mb-3">
          <div className="col-md-3">
            <label className="form-label">Plataforma</label>
            <select className="form-select" value={plataforma} onChange={(e) => setPlataforma(e.target.value)}>
              {ficha.plataformas.map((p) => <option key={p.codigo} value={p.codigo}>{p.nome}</option>)}
            </select>
          </div>
          <div className="col-md-3 col-6">
            <label className="form-label">Desconto (%)</label>
            <input type="number" min="0" max="99" step="0.5" className="form-control" value={desconto} onChange={(e) => setDesconto(e.target.value)} />
          </div>
          <div className="col-md-3 col-6">
            <label className="form-label">Comissão de afiliado (%)</label>
            <input type="number" min="0" max="99" step="0.5" className="form-control" value={afiliado} onChange={(e) => setAfiliado(e.target.value)} />
          </div>
          <div className="col-md-3">
            <button className="btn btn-primary w-100 d-flex align-items-center justify-content-center gap-2" onClick={simular} disabled={calculando || !plataforma}>
              <FaCalculator /> {calculando ? 'Calculando...' : 'Simular promoção'}
            </button>
          </div>
        </div>

        {erro && <div className="alert alert-danger py-2">{erro}</div>}

        {res && (
          <>
            {res.alertas.map((a) => (
              <div key={a} className={`alert ${res.lucro < 0 ? 'alert-danger' : 'alert-warning'} py-2`}>{a}</div>
            ))}
            <div className="row g-3">
              {[
                ['Preço original', brl(res.preco_original)],
                ['Preço promocional', brl(res.preco_promocional)],
                ['Total de taxas', brl(res.total_taxas)],
                ['Comissão de afiliado', brl(res.taxas.afiliado)],
                ['Recebimento líquido', brl(res.liquido)],
                ['Custo', brl(res.custo)],
                ['Lucro', brl(res.lucro)],
                ['Margem', pct(res.margem)]
              ].map(([rotulo, valor]) => (
                <div className="col-6 col-md-3" key={rotulo}>
                  <div className="border rounded-3 p-2">
                    <div className="text-muted small">{rotulo}</div>
                    <div className="fw-bold">{valor}</div>
                  </div>
                </div>
              ))}
              <div className="col-12"><Farol farol={res.farol} /> <span className="small text-muted ms-2">Margem mínima configurada: {pct(res.margem_minima)}. A simulação não altera o cadastro.</span></div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Historico({ produtoId }) {
  const [linhas, setLinhas] = useState(null);
  useEffect(() => {
    api.get('/precificacao/historico', { params: { produto_id: produtoId } })
      .then((r) => setLinhas(r.data.historico))
      .catch(() => setLinhas([]));
  }, [produtoId]);

  if (!linhas || linhas.length === 0) return null;
  return (
    <div className="card shadow-sm border-0 mb-4">
      <div className="card-header bg-white"><h5 className="m-0">Histórico de preços</h5></div>
      <div className="table-responsive">
        <table className="table table-sm mb-0 text-nowrap">
          <thead className="table-light"><tr><th>Data</th><th>Plataforma</th><th>Preço anterior</th><th>Preço novo</th><th>Custo</th><th>Margem</th><th>Motivo</th></tr></thead>
          <tbody>
            {linhas.map((h) => (
              <tr key={h.id}>
                <td>{formatarDataHora(h.criado_em)}</td>
                <td>{h.plataforma_nome}</td>
                <td>{brl(h.preco_anterior)}</td>
                <td>{brl(h.preco_novo)}</td>
                <td>{brl(h.custo_no_momento)}</td>
                <td>{pct(h.margem_anterior)} → {pct(h.margem_nova)}</td>
                <td>{h.motivo}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function FichaPrecificacao() {
  const { id } = useParams();
  const navigate = useNavigate();
  const tipo = useLocation().pathname.includes('/kit/') ? 'kit' : 'produto';
  const [ficha, setFicha] = useState(null);
  const [erro, setErro] = useState('');

  useEffect(() => {
    setFicha(null);
    setErro('');
    api.get(`/precificacao/${tipo === 'kit' ? 'kits' : 'produtos'}/${id}`)
      .then((r) => setFicha(r.data.precificacao))
      .catch((e) => setErro(mensagemErro(e)));
  }, [id, tipo]);

  const carregar = () =>
    api.get(`/precificacao/${tipo === 'kit' ? 'kits' : 'produtos'}/${id}`)
      .then((r) => setFicha(r.data.precificacao))
      .catch((e) => setErro(mensagemErro(e)));

  const aplicarPreco = async (plataforma) => {
    try {
      await api.post(`/precificacao/produtos/${id}/aplicar-preco`, { plataforma });
      await carregar();
    } catch (e) {
      alert(mensagemErro(e));
    }
  };

  const salvarAfiliado = async (plataformaId, percentual) => {
    try {
      await api.put(`/precificacao/produtos/${id}/afiliado/${plataformaId}`, { percentual_comissao: Number(percentual || 0) });
      await carregar();
    } catch (e) {
      alert(mensagemErro(e));
    }
  };

  const voltar = () => navigate(tipo === 'kit' ? '/kits' : '/produtos');

  if (erro) {
    return (
      <div className="container-fluid py-4">
        <button className="btn btn-outline-secondary btn-sm mb-3" onClick={voltar}><FaArrowLeft /> Voltar</button>
        <div className="alert alert-danger">{erro}</div>
      </div>
    );
  }
  if (!ficha) return <LoadingSpinner />;

  const nome = tipo === 'kit' ? ficha.kit.nome : ficha.produto.nome;
  const atual = tipo === 'kit' ? ficha.kit.preco_atual : ficha.produto.preco_venda_atual;

  return (
    <div className="container-fluid py-4">
      <div className="d-flex align-items-center gap-3 mb-3 flex-wrap">
        <button className="btn btn-outline-secondary btn-sm" onClick={voltar}><FaArrowLeft /> Voltar</button>
        <div>
          <h2 className="m-0">Precificação: {nome}</h2>
          <small className="text-muted">
            {tipo === 'produto' && ficha.produto.sku ? `SKU ${ficha.produto.sku} · ` : ''}
            Preço de venda cadastrado hoje: {brl(atual)} · Taxas vigentes em {String(ficha.data_referencia).split('-').reverse().join('/')}
          </small>
        </div>
      </div>

      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body d-flex flex-wrap gap-4">
          {tipo === 'produto' ? (
            <>
              <div><div className="text-muted small">Custo do produto</div><div className="fw-bold">{brl(ficha.custo.produto)}</div></div>
              <div><div className="text-muted small">Embalagem</div><div className="fw-bold">{brl(ficha.custo.embalagem)}</div></div>
              <div><div className="text-muted small">Outros custos</div><div className="fw-bold">{brl(ficha.custo.outros)}</div></div>
            </>
          ) : (
            ficha.custo.itens.map((i) => (
              <div key={i.rotulo}><div className="text-muted small">{i.rotulo}</div><div className="fw-bold">{brl(i.custo)}</div></div>
            ))
          )}
          <div><div className="text-muted small">Custo total</div><div className="fw-bold text-primary">{brl(ficha.custo.total)}</div></div>
          <div><div className="text-muted small">Margem alvo / mínima</div><div className="fw-bold">{pct(ficha.margem.alvo)} / {pct(ficha.margem.minima)}</div></div>
        </div>
      </div>

      <div className="row g-3 mb-4">
        {ficha.plataformas.map((p) => (
          <div className="col-lg-6" key={p.codigo}>
            <CartaoPlataforma p={p} melhor={ficha.melhor_plataforma === p.codigo} produtoId={tipo === 'produto' ? id : null} onAplicar={aplicarPreco} />
          </div>
        ))}
      </div>

      <Comparativo plataformas={ficha.plataformas} melhor={ficha.melhor_plataforma} />
      {tipo === 'produto' && <TabelaCombos combos={ficha.combos} plataformas={ficha.plataformas} />}
      <Afiliados plataformas={ficha.plataformas} onSalvar={tipo === 'produto' ? salvarAfiliado : null} />
      <Simulador ficha={ficha} tipo={tipo} id={id} />
      {tipo === 'produto' && <Historico produtoId={id} />}
    </div>
  );
}
