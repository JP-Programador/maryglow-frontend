import { formatCurrency, formatDate, PLATAFORMAS_LABEL, PAGAMENTOS_LABEL } from './format';

/* Dados do Pix que vão no recibo de pendência (os mesmos do catálogo) */
export const PIX = { chave: 'maryglow01@gmail.com', titular: 'João Pedro Silva' };

export function nomeDoItem(item) {
  const cor = item.produto_cor ? ` - ${item.produto_cor}` : '';
  const tom = item.produto_tom ? ` (${item.produto_tom})` : '';
  return `${item.produto_nome}${cor}${tom}`;
}

/* Soma só o que ainda falta pagar (vendas pendentes) */
export function totalAPagar(vendas) {
  return vendas
    .filter((v) => v.status_pagamento === 'pendente')
    .reduce((soma, v) => soma + Number(v.valor_total), 0);
}

/* Texto pronto para colar/enviar no WhatsApp (mesmo estilo da mensagem do catálogo) */
export function montarTextoRecibo({ cliente, vendas }) {
  const pendente = vendas.some((v) => v.status_pagamento === 'pendente');
  const linhas = [`💖 *${pendente ? 'Recibo' : 'Comprovante'} • Mary Glow* 💖`, ''];
  linhas.push(cliente ? `Oi, ${cliente}! 🥰` : 'Oi! 🥰', pendente ? 'Segue o que você pegou:' : 'Segue a sua compra:', '');

  vendas.forEach((v) => {
    v.itens.forEach((i) => {
      linhas.push(`💄 *${nomeDoItem(i)}*`);
      linhas.push(`   Qtd: ${i.quantidade} × ${formatCurrency(i.preco_unitario)} = *${formatCurrency(i.subtotal)}*`, '');
    });
  });

  if (pendente) {
    linhas.push(`💰 *Total a pagar: ${formatCurrency(totalAPagar(vendas))}*`, '');
    linhas.push('💳 *Pix*', `🔑 Chave: ${PIX.chave}`, `👤 Titular: ${PIX.titular}`, '');
    linhas.push('Depois de pagar, me envie o comprovante, por favor 💗');
  } else {
    linhas.push(`💰 *Total pago: ${formatCurrency(vendas.reduce((s, v) => s + Number(v.valor_total), 0))}* ✅`, '', 'Obrigada pela compra! 💗');
  }
  return linhas.join('\n');
}

/* Número para o wa.me: só dígitos, com DDI 55 quando vier só DDD+número */
export function telefoneWhatsApp(valor) {
  const digitos = String(valor || '').replace(/\D/g, '');
  if (!digitos) return '';
  return digitos.length <= 11 ? `55${digitos}` : digitos;
}

// No computador, o WhatsApp Desktop troca os emojis por "�" quando o texto vem de um link wa.me.
// Por isso, fora do celular abrimos o WhatsApp Web, que preserva os emojis (igual ao catálogo).
function ehCelular() {
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

export function linkWhatsApp(texto, telefone) {
  const numero = telefoneWhatsApp(telefone);
  const params = `text=${encodeURIComponent(texto)}`;
  if (ehCelular()) return `https://wa.me/${numero}?${params}`;
  return `https://web.whatsapp.com/send?${numero ? `phone=${numero}&` : ''}${params}`;
}

function esc(valor) {
  return String(valor ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

/* HTML do recibo para imprimir / salvar em PDF (abre numa janela própria, sem o resto do ERP) */
export function montarHtmlRecibo({ cliente, vendas, logoUrl }) {
  const pendente = vendas.some((v) => v.status_pagamento === 'pendente');
  const blocos = vendas.map((v) => `
    <section class="venda">
      <div class="venda-topo">
        <strong>Venda #${esc(v.id)}</strong>
        <span>${esc(formatDate(v.data_venda))} • ${esc(PLATAFORMAS_LABEL[v.plataforma] || v.plataforma)} • ${esc(PAGAMENTOS_LABEL[v.forma_pagamento] || v.forma_pagamento)}</span>
        <span class="tag ${v.status_pagamento === 'pendente' ? 'pendente' : 'pago'}">${v.status_pagamento === 'pendente' ? 'Pendente' : 'Pago'}</span>
      </div>
      <table>
        <thead><tr><th>Produto</th><th class="n">Qtd</th><th class="n">Unitário</th><th class="n">Subtotal</th></tr></thead>
        <tbody>
          ${v.itens.map((i) => `<tr><td>${esc(nomeDoItem(i))}</td><td class="n">${esc(i.quantidade)}</td><td class="n">${esc(formatCurrency(i.preco_unitario))}</td><td class="n">${esc(formatCurrency(i.subtotal))}</td></tr>`).join('')}
        </tbody>
        <tfoot><tr><td colspan="3" class="n">Total da venda</td><td class="n"><strong>${esc(formatCurrency(v.valor_total))}</strong></td></tr></tfoot>
      </table>
    </section>`).join('');

  const total = pendente
    ? `<div class="total"><span>Total a pagar</span><strong>${esc(formatCurrency(totalAPagar(vendas)))}</strong></div>
       <div class="pix"><b>Pagamento via Pix</b><br>Chave: ${esc(PIX.chave)}<br>Titular: ${esc(PIX.titular)}<br><small>Depois de pagar, envie o comprovante, por favor.</small></div>`
    : `<div class="total pago"><span>Total pago</span><strong>${esc(formatCurrency(vendas.reduce((s, v) => s + Number(v.valor_total), 0)))}</strong></div>`;

  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Recibo Mary Glow${cliente ? ` - ${esc(cliente)}` : ''}</title>
<style>
  *{box-sizing:border-box} body{font-family:Poppins,Arial,sans-serif;color:#2a2230;margin:0;padding:24px;max-width:720px;margin:auto}
  header{display:flex;align-items:center;gap:14px;border-bottom:2px solid #a8456b;padding-bottom:12px;margin-bottom:16px}
  header img{width:56px;height:56px;border-radius:50%;object-fit:cover} h1{font-size:20px;margin:0;color:#7d3350} header p{margin:2px 0 0;color:#8b7e87;font-size:13px}
  .cliente{margin:0 0 14px;font-size:14px} .venda{margin-bottom:16px;break-inside:avoid}
  .venda-topo{display:flex;flex-wrap:wrap;gap:6px 12px;align-items:center;font-size:13px;margin-bottom:6px} .venda-topo span{color:#8b7e87}
  .tag{padding:2px 10px;border-radius:999px;font-size:11px;font-weight:600;color:#2a2230!important} .tag.pendente{background:#f6ead3} .tag.pago{background:#dcf0e6}
  table{width:100%;border-collapse:collapse;font-size:13px} th{background:#fbf8f6;text-align:left;font-weight:600} th,td{padding:7px 8px;border-bottom:1px solid #ece3e7}
  .n{text-align:right;white-space:nowrap} tfoot td{border-bottom:none}
  .total{display:flex;justify-content:space-between;align-items:center;background:#f3dce4;border-radius:10px;padding:14px 16px;font-size:16px;margin-top:8px}
  .total strong{font-size:24px;color:#7d3350} .total.pago{background:#dcf0e6}
  .pix{margin-top:12px;border:1px dashed #a8456b;border-radius:10px;padding:12px 16px;font-size:14px;line-height:1.6} small{color:#8b7e87}
  footer{margin-top:22px;text-align:center;color:#8b7e87;font-size:12px}
  @media print{body{padding:0}}
</style></head><body>
  <header>${logoUrl ? `<img src="${esc(logoUrl)}" alt="">` : ''}<div><h1>Mary Glow</h1><p>${pendente ? 'Recibo de pendência' : 'Recibo de compra'}</p></div></header>
  ${cliente ? `<p class="cliente"><b>Cliente:</b> ${esc(cliente)}</p>` : ''}
  ${blocos}
  ${total}
  <footer>Obrigada pela preferência! 💗</footer>
  <script>window.onload=function(){setTimeout(function(){window.print()},300)}</script>
</body></html>`;
}
