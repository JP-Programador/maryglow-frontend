export function formatarMoeda(valor) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(valor) || 0);
}
export const formatCurrency = formatarMoeda;
export function formatarNumero(valor) {
  return new Intl.NumberFormat('pt-BR').format(Number(valor) || 0);
}

export function formatarData(dataStr) {
  if (!dataStr) return '-';
  const [dataParte] = dataStr.split(' ');
  const [ano, mes, dia] = dataParte.split('-');
  return `${dia}/${mes}/${ano}`;
}

export function formatarDataHora(dataStr) {
  if (!dataStr) return '-';
  const [dataParte, horaParte] = dataStr.split(' ');
  const [ano, mes, dia] = dataParte.split('-');
  const hora = horaParte ? horaParte.slice(0, 5) : '';
  return `${dia}/${mes}/${ano} ${hora}`;
}

export const PLATAFORMAS_LABEL = {
  loja_fisica: 'Loja Física',
  site: 'Site',
  instagram: 'Instagram',
  whatsapp: 'WhatsApp',
  shopee: 'Shopee',
  mercado_livre: 'Mercado Livre',
  tiktok_shop: 'TikTok Shop'
};

export const PAGAMENTOS_LABEL = {
  dinheiro: 'Dinheiro',
  pix: 'Pix',
  cartao_credito: 'Cartão de Crédito',
  cartao_debito: 'Cartão de Débito',
  boleto: 'Boleto',
  outro: 'Outro'
};
