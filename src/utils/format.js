// --- MOEDAS E NÚMEROS ---
export function formatarMoeda(valor) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(valor) || 0);
}
export const formatCurrency = formatarMoeda;

export function formatarNumero(valor) {
  return new Intl.NumberFormat('pt-BR').format(Number(valor) || 0);
}
export const formatNumber = formatarNumero;


// --- DATAS E HORAS ---
// O backend (MySQL/mysql2) devolve datas como Date, que viram string ISO
// (ex: "2026-09-18T14:15:59.000Z") ao serem convertidas pra JSON — usamos
// o construtor Date pra interpretar isso corretamente, em vez de fatiar a string.
function paraData(dataStr) {
  if (!dataStr) return null;
  const d = new Date(dataStr);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function formatarData(dataStr) {
  const d = paraData(dataStr);
  if (!d) return '-';
  const dia = String(d.getUTCDate()).padStart(2, '0');
  const mes = String(d.getUTCMonth() + 1).padStart(2, '0');
  return `${dia}/${mes}/${d.getUTCFullYear()}`;
}
export const formatDate = formatarData;

export function formatarDataHora(dataStr) {
  const d = paraData(dataStr);
  if (!d) return '-';
  const dia = String(d.getUTCDate()).padStart(2, '0');
  const mes = String(d.getUTCMonth() + 1).padStart(2, '0');
  const hora = String(d.getUTCHours()).padStart(2, '0');
  const min = String(d.getUTCMinutes()).padStart(2, '0');
  return `${dia}/${mes}/${d.getUTCFullYear()} ${hora}:${min}`;
}
export const formatDateTime = formatarDataHora;


// --- LABELS / MAPAS ---
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