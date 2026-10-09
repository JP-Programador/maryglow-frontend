import React, { useState, useEffect } from 'react';
import { FaPlus, FaTrash, FaSave } from 'react-icons/fa';
import api, { mensagemErro } from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';

const TIPOS_BENEFICIO = [
  { value: 'COMISSAO_PERCENTUAL', label: 'Comissão (%) substitui a normal' },
  { value: 'TAXA_FIXA', label: 'Taxa fixa (R$) substitui a normal' },
  { value: 'FRETE_PERCENTUAL', label: 'Programa de frete (%) substitui o normal' }
];

const vazio = (v) => (v === null || v === undefined ? '' : v);
const dataCurta = (v) => (v ? String(v).slice(0, 10) : '');

/* Campo numérico simples ligado a um objeto em edição */
function Campo({ valor, onChange, step = '0.01', largura = 90, ...resto }) {
  return (
    <input
      type="number"
      step={step}
      min="0"
      className="form-control form-control-sm"
      style={{ minWidth: largura }}
      value={vazio(valor)}
      onChange={(e) => onChange(e.target.value)}
      {...resto}
    />
  );
}

function FaixasPlataforma({ plataforma, recarregar }) {
  const [faixas, setFaixas] = useState(plataforma.faixas);
  const [salvando, setSalvando] = useState(null);

  useEffect(() => setFaixas(plataforma.faixas), [plataforma]);

  const alterar = (i, campo, valor) => setFaixas(faixas.map((f, idx) => (idx === i ? { ...f, [campo]: valor } : f)));

  const salvar = async (faixa, i) => {
    try {
      setSalvando(i);
      const dados = { ...faixa, data_inicio: dataCurta(faixa.data_inicio) || null, data_fim: dataCurta(faixa.data_fim) || null };
      if (faixa.id) await api.put(`/precificacao/configuracao/taxas/${faixa.id}`, dados);
      else await api.post(`/precificacao/configuracao/plataformas/${plataforma.id}/taxas`, dados);
      await recarregar();
    } catch (error) {
      alert(mensagemErro(error));
    } finally {
      setSalvando(null);
    }
  };

  const remover = async (faixa, i) => {
    if (!faixa.id) return setFaixas(faixas.filter((_, idx) => idx !== i));
    if (!window.confirm('Excluir esta faixa de taxa?')) return;
    try {
      await api.delete(`/precificacao/configuracao/taxas/${faixa.id}`);
      await recarregar();
    } catch (error) {
      alert(mensagemErro(error));
    }
  };

  const nova = () => setFaixas([...faixas, {
    descricao: '', preco_minimo: '0', preco_maximo: '', comissao_percentual: '0', taxa_adicional_percentual: '0',
    tipo_taxa_fixa: 'VALOR_FIXO', taxa_fixa: '0', taxa_fixa_percentual: '0', data_inicio: '', data_fim: '', ativo: 1
  }]);

  return (
    <div className="table-responsive">
      <table className="table table-sm align-middle mb-2">
        <thead className="table-light">
          <tr>
            <th>Descrição</th><th>Preço mín.</th><th>Preço máx.</th><th>Comissão %</th><th>Adicional %</th>
            <th>Taxa fixa</th><th>Valor</th><th>Início</th><th>Fim</th><th>Ativa</th><th />
          </tr>
        </thead>
        <tbody>
          {faixas.map((f, i) => (
            <tr key={f.id || `n${i}`}>
              <td><input className="form-control form-control-sm" style={{ minWidth: 150 }} value={vazio(f.descricao)} onChange={(e) => alterar(i, 'descricao', e.target.value)} /></td>
              <td><Campo valor={f.preco_minimo} onChange={(v) => alterar(i, 'preco_minimo', v)} /></td>
              <td><Campo valor={f.preco_maximo} onChange={(v) => alterar(i, 'preco_maximo', v)} placeholder="sem teto" /></td>
              <td><Campo valor={f.comissao_percentual} step="0.01" onChange={(v) => alterar(i, 'comissao_percentual', v)} /></td>
              <td><Campo valor={f.taxa_adicional_percentual} onChange={(v) => alterar(i, 'taxa_adicional_percentual', v)} /></td>
              <td>
                <select className="form-select form-select-sm" style={{ minWidth: 120 }} value={f.tipo_taxa_fixa} onChange={(e) => alterar(i, 'tipo_taxa_fixa', e.target.value)}>
                  <option value="VALOR_FIXO">R$ fixo</option>
                  <option value="PERCENTUAL_DO_PRECO">% do preço</option>
                </select>
              </td>
              <td>
                {f.tipo_taxa_fixa === 'VALOR_FIXO'
                  ? <Campo valor={f.taxa_fixa} onChange={(v) => alterar(i, 'taxa_fixa', v)} />
                  : <Campo valor={f.taxa_fixa_percentual} onChange={(v) => alterar(i, 'taxa_fixa_percentual', v)} />}
              </td>
              <td><input type="date" className="form-control form-control-sm" value={dataCurta(f.data_inicio)} onChange={(e) => alterar(i, 'data_inicio', e.target.value)} /></td>
              <td><input type="date" className="form-control form-control-sm" value={dataCurta(f.data_fim)} onChange={(e) => alterar(i, 'data_fim', e.target.value)} /></td>
              <td className="text-center"><input type="checkbox" className="form-check-input" checked={!!f.ativo} onChange={(e) => alterar(i, 'ativo', e.target.checked ? 1 : 0)} /></td>
              <td className="text-nowrap">
                <button className="btn btn-sm btn-primary me-1" onClick={() => salvar(f, i)} disabled={salvando === i} title="Salvar"><FaSave /></button>
                <button className="btn btn-sm btn-outline-danger" onClick={() => remover(f, i)} title="Excluir"><FaTrash /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button className="btn btn-sm btn-outline-secondary" onClick={nova}><FaPlus /> Nova faixa</button>
    </div>
  );
}

function FretePlataforma({ plataforma, recarregar }) {
  const [frete, setFrete] = useState(plataforma.frete);
  useEffect(() => setFrete(plataforma.frete), [plataforma]);

  const salvar = async () => {
    try {
      await api.put(`/precificacao/configuracao/plataformas/${plataforma.id}/frete`, frete);
      await recarregar();
    } catch (error) {
      alert(mensagemErro(error));
    }
  };

  return (
    <div className="row g-3 align-items-end">
      <div className="col-auto">
        <div className="form-check form-switch">
          <input className="form-check-input" type="checkbox" id={`frete-${plataforma.id}`} checked={!!frete.ativo} onChange={(e) => setFrete({ ...frete, ativo: e.target.checked })} />
          <label className="form-check-label" htmlFor={`frete-${plataforma.id}`}>Programa de frete ativo</label>
        </div>
      </div>
      <div className="col-auto">
        <label className="form-label small mb-1">Percentual (%)</label>
        <Campo valor={frete.percentual} onChange={(v) => setFrete({ ...frete, percentual: v })} />
      </div>
      <div className="col-auto">
        <label className="form-label small mb-1">Limite por produto (R$)</label>
        <Campo valor={frete.limite} onChange={(v) => setFrete({ ...frete, limite: v })} placeholder="sem limite" />
      </div>
      <div className="col-auto"><button className="btn btn-sm btn-primary" onClick={salvar}><FaSave /> Salvar frete</button></div>
    </div>
  );
}

function BeneficiosPlataforma({ plataforma, recarregar }) {
  const [lista, setLista] = useState(plataforma.beneficios);
  useEffect(() => setLista(plataforma.beneficios), [plataforma]);

  const alterar = (i, campo, valor) => setLista(lista.map((b, idx) => (idx === i ? { ...b, [campo]: valor } : b)));

  const salvar = async (b) => {
    try {
      const dados = { ...b, data_inicio: dataCurta(b.data_inicio), data_fim: dataCurta(b.data_fim) };
      if (b.id) await api.put(`/precificacao/configuracao/beneficios/${b.id}`, dados);
      else await api.post(`/precificacao/configuracao/plataformas/${plataforma.id}/beneficios`, dados);
      await recarregar();
    } catch (error) {
      alert(mensagemErro(error));
    }
  };

  const remover = async (b, i) => {
    if (!b.id) return setLista(lista.filter((_, idx) => idx !== i));
    if (!window.confirm('Excluir este benefício?')) return;
    try {
      await api.delete(`/precificacao/configuracao/beneficios/${b.id}`);
      await recarregar();
    } catch (error) {
      alert(mensagemErro(error));
    }
  };

  const novo = () => setLista([...lista, { nome: '', tipo: 'COMISSAO_PERCENTUAL', valor_percentual: '0', valor_fixo: '', data_inicio: '', data_fim: '', ativo: 1 }]);

  return (
    <div className="table-responsive">
      <table className="table table-sm align-middle mb-2">
        <thead className="table-light">
          <tr><th>Nome</th><th>Tipo</th><th>Valor</th><th>Início</th><th>Fim</th><th>Ativo</th><th /></tr>
        </thead>
        <tbody>
          {lista.length === 0 && <tr><td colSpan="7" className="text-muted">Nenhum benefício temporário cadastrado.</td></tr>}
          {lista.map((b, i) => (
            <tr key={b.id || `n${i}`}>
              <td><input className="form-control form-control-sm" style={{ minWidth: 150 }} value={vazio(b.nome)} onChange={(e) => alterar(i, 'nome', e.target.value)} placeholder="Ex.: Comissão 0% (campanha)" /></td>
              <td>
                <select className="form-select form-select-sm" style={{ minWidth: 220 }} value={b.tipo} onChange={(e) => alterar(i, 'tipo', e.target.value)}>
                  {TIPOS_BENEFICIO.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </td>
              <td>
                {b.tipo === 'TAXA_FIXA'
                  ? <Campo valor={b.valor_fixo} onChange={(v) => alterar(i, 'valor_fixo', v)} />
                  : <Campo valor={b.valor_percentual} onChange={(v) => alterar(i, 'valor_percentual', v)} />}
              </td>
              <td><input type="date" className="form-control form-control-sm" value={dataCurta(b.data_inicio)} onChange={(e) => alterar(i, 'data_inicio', e.target.value)} /></td>
              <td><input type="date" className="form-control form-control-sm" value={dataCurta(b.data_fim)} onChange={(e) => alterar(i, 'data_fim', e.target.value)} /></td>
              <td className="text-center"><input type="checkbox" className="form-check-input" checked={!!b.ativo} onChange={(e) => alterar(i, 'ativo', e.target.checked ? 1 : 0)} /></td>
              <td className="text-nowrap">
                <button className="btn btn-sm btn-primary me-1" onClick={() => salvar(b)} title="Salvar"><FaSave /></button>
                <button className="btn btn-sm btn-outline-danger" onClick={() => remover(b, i)} title="Excluir"><FaTrash /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button className="btn btn-sm btn-outline-secondary" onClick={novo}><FaPlus /> Novo benefício</button>
      <small className="text-muted d-block mt-2">Benefícios só valem dentro da vigência e nunca alteram as faixas cadastradas acima: ao terminar, volta sozinho a taxa normal.</small>
    </div>
  );
}

function Margens({ regras, recarregar }) {
  const [lista, setLista] = useState(regras);
  useEffect(() => setLista(regras), [regras]);
  const alterar = (i, campo, valor) => setLista(lista.map((r, idx) => (idx === i ? { ...r, [campo]: valor } : r)));

  const salvar = async (r) => {
    try {
      await api.put(`/precificacao/configuracao/margens/${r.id}`, { margem_alvo: r.margem_alvo, margem_minima: r.margem_minima, ativo: !!r.ativo });
      await recarregar();
    } catch (error) {
      alert(mensagemErro(error));
    }
  };

  const rotulo = (r) => (r.quantidade_max === null ? `${r.quantidade_min} ou mais un.` : r.quantidade_min === r.quantidade_max ? `${r.quantidade_min} un.` : `${r.quantidade_min} a ${r.quantidade_max} un.`);

  return (
    <table className="table table-sm align-middle mb-0" style={{ maxWidth: 560 }}>
      <thead className="table-light"><tr><th>Quantidade</th><th>Margem alvo %</th><th>Margem mínima %</th><th /></tr></thead>
      <tbody>
        {lista.map((r, i) => (
          <tr key={r.id}>
            <td>{rotulo(r)}</td>
            <td><Campo valor={r.margem_alvo} onChange={(v) => alterar(i, 'margem_alvo', v)} /></td>
            <td><Campo valor={r.margem_minima} onChange={(v) => alterar(i, 'margem_minima', v)} /></td>
            <td><button className="btn btn-sm btn-primary" onClick={() => salvar(r)} title="Salvar"><FaSave /></button></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function Geral({ geral, recarregar }) {
  const [valores, setValores] = useState(geral);
  useEffect(() => setValores(geral), [geral]);

  const salvar = async (chave) => {
    try {
      await api.put(`/precificacao/configuracao/geral/${chave}`, { valor: valores[chave] });
      await recarregar();
    } catch (error) {
      alert(mensagemErro(error));
    }
  };

  const linha = (chave, rotulo, input) => (
    <div className="row g-2 align-items-end mb-3" key={chave}>
      <div className="col-md-5"><label className="form-label mb-1">{rotulo}</label>{input}</div>
      <div className="col-auto"><button className="btn btn-sm btn-primary" onClick={() => salvar(chave)}><FaSave /> Salvar</button></div>
    </div>
  );

  return (
    <>
      {linha('criterio_melhor_plataforma', 'Melhor plataforma é a de maior…',
        <select className="form-select form-select-sm" value={valores.criterio_melhor_plataforma || 'lucro'} onChange={(e) => setValores({ ...valores, criterio_melhor_plataforma: e.target.value })}>
          <option value="lucro">Lucro líquido (R$)</option>
          <option value="margem">Margem líquida (%)</option>
        </select>)}
      {linha('arredondamento_terminacao', 'Terminação do preço comercial (ex.: 0.90 gera 28,90)',
        <input className="form-control form-control-sm" value={valores.arredondamento_terminacao || ''} onChange={(e) => setValores({ ...valores, arredondamento_terminacao: e.target.value })} />)}
      {linha('farol_saudavel', 'Farol verde a partir de (% de margem)',
        <Campo valor={valores.farol_saudavel} onChange={(v) => setValores({ ...valores, farol_saudavel: v })} />)}
      {linha('farol_atencao', 'Farol amarelo a partir de (% de margem)',
        <Campo valor={valores.farol_atencao} onChange={(v) => setValores({ ...valores, farol_atencao: v })} />)}
    </>
  );
}

export default function ConfigPrecificacao() {
  const { ehAdmin } = useAuth();
  const [config, setConfig] = useState(null);
  const [aba, setAba] = useState('taxas');

  const carregar = async () => {
    try {
      const r = await api.get('/precificacao/configuracao');
      setConfig(r.data.configuracao);
    } catch (error) {
      alert(mensagemErro(error));
    }
  };

  useEffect(() => {
    carregar();
  }, []);

  if (!config) return <LoadingSpinner />;

  const abas = [
    { id: 'taxas', label: 'Taxas e faixas' },
    { id: 'frete', label: 'Frete' },
    { id: 'beneficios', label: 'Benefícios temporários' },
    { id: 'margens', label: 'Margens automáticas' },
    { id: 'geral', label: 'Geral' }
  ];

  return (
    <div className="container-fluid py-4">
      <h2 className="mb-1">Configuração de Precificação</h2>
      <p className="text-muted mb-3">
        Todas as taxas e margens usadas no cálculo automático ficam aqui, nada é fixo no sistema.
        {!ehAdmin && ' Somente administradores podem alterar.'}
      </p>

      <ul className="nav nav-tabs mb-3">
        {abas.map((a) => (
          <li className="nav-item" key={a.id}>
            <button className={`nav-link ${aba === a.id ? 'active' : ''}`} onClick={() => setAba(a.id)}>{a.label}</button>
          </li>
        ))}
      </ul>

      <fieldset disabled={!ehAdmin}>
        {(aba === 'taxas' || aba === 'frete' || aba === 'beneficios') && config.plataformas.map((p) => (
          <div className="card shadow-sm border-0 mb-3" key={p.id}>
            <div className="card-header bg-white"><h5 className="m-0">{p.nome}</h5></div>
            <div className="card-body">
              {aba === 'taxas' && <FaixasPlataforma plataforma={p} recarregar={carregar} />}
              {aba === 'frete' && <FretePlataforma plataforma={p} recarregar={carregar} />}
              {aba === 'beneficios' && <BeneficiosPlataforma plataforma={p} recarregar={carregar} />}
            </div>
          </div>
        ))}
        {aba === 'margens' && (
          <div className="card shadow-sm border-0"><div className="card-body">
            <p className="text-muted small">Margem calculada sobre o preço de venda. A margem alvo define o preço recomendado; a mínima define o preço promocional mais baixo permitido.</p>
            <Margens regras={config.regras_margem} recarregar={carregar} />
          </div></div>
        )}
        {aba === 'geral' && <div className="card shadow-sm border-0"><div className="card-body"><Geral geral={config.geral} recarregar={carregar} /></div></div>}
      </fieldset>
    </div>
  );
}
