import { formatCurrency } from './format';

export const LINK_CATALOGO = 'https://maryglowcatalogo.netlify.app';

/* Título "Nome - Cor", sem repetir a cor se o nome já a contém (mesma regra do catálogo online) */
function titulo(nome, cor) {
  const corLimpa = (cor || '').trim();
  if (!corLimpa || nome.toLowerCase().includes(corLimpa.toLowerCase())) return nome;
  return `${nome} - ${corLimpa}`;
}

function precoTexto(precos) {
  const min = Math.min(...precos);
  const max = Math.max(...precos);
  return min === max ? formatCurrency(min) : `${formatCurrency(min)} a ${formatCurrency(max)}`;
}

/* Agrupa os produtos do ERP em itens de catálogo: cada nome + cor vira uma linha, com os tons dentro */
export function agruparParaCatalogo(produtos, { soComEstoque = true } = {}) {
  const grupos = new Map();
  for (const p of produtos) {
    if (!p.ativo) continue;
    if (soComEstoque && !(p.estoque_atual > 0)) continue;
    const chave = `${p.categoria_nome || ''}||${p.nome}||${(p.cor || '').trim().toLowerCase()}`;
    if (!grupos.has(chave)) {
      grupos.set(chave, { categoria: p.categoria_nome || 'Outros', titulo: titulo(p.nome, p.cor), precos: [], tons: [] });
    }
    const g = grupos.get(chave);
    g.precos.push(Number(p.preco_venda));
    if (p.tom && !g.tons.includes(p.tom)) g.tons.push(p.tom);
  }
  return Array.from(grupos.values());
}

/* Texto do catálogo para colar/enviar no WhatsApp, agrupado por categoria */
export function montarTextoCatalogo(itens, { mostrarTons = true, incluirLink = true } = {}) {
  const linhas = ['💖 *Catálogo Mary Glow* 💖', ''];

  const porCategoria = new Map();
  for (const item of itens) {
    if (!porCategoria.has(item.categoria)) porCategoria.set(item.categoria, []);
    porCategoria.get(item.categoria).push(item);
  }

  [...porCategoria.keys()].sort((a, b) => a.localeCompare(b, 'pt-BR')).forEach((categoria) => {
    linhas.push(`🌸 *${categoria}*`);
    porCategoria
      .get(categoria)
      .sort((a, b) => a.titulo.localeCompare(b.titulo, 'pt-BR'))
      .forEach((item) => {
        linhas.push(`💄 ${item.titulo} — *${precoTexto(item.precos)}*`);
        if (mostrarTons && item.tons.length > 0) {
          linhas.push(`   ✨ Tons: ${item.tons.sort((a, b) => String(a).localeCompare(String(b), 'pt-BR', { numeric: true })).join(', ')}`);
        }
      });
    linhas.push('');
  });

  if (incluirLink) linhas.push(`🛍️ Veja as fotos e peça pelo catálogo: ${LINK_CATALOGO}`, '');
  linhas.push('Me chama para fazer seu pedido! 🥰');
  return linhas.join('\n');
}
