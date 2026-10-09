import { PDFDocument, EncryptedPDFError } from 'pdf-lib';

/* Central de Etiquetas: somente ORGANIZA páginas PDF.
   As páginas originais são incorporadas (embedPage) e apenas posicionadas com escala
   proporcional. Nada é recriado, recortado, convertido em imagem nem lido por OCR. */

const MM = 72 / 25.4; // pontos por milímetro

export const A4_PAISAGEM = { largura: 297 * MM, altura: 210 * MM };
export const A4_RETRATO = { largura: 210 * MM, altura: 297 * MM };

const MARGEM = 10 * MM;       // margem de impressão em todos os lados
const ESPACO_CENTRAL = 5 * MM; // espaço entre os dois documentos
const ESCALA_MINIMA_LEGIVEL = 0.55; // abaixo disso o texto miúdo da DANFE deixa de ser confiável
const TAMANHO_MAXIMO = 20 * 1024 * 1024; // 20 MB por arquivo

export class ErroPdf extends Error {}

/* Lê o arquivo e valida: é PDF de verdade, não está protegido, tem páginas.
   Devolve { bytes, doc, paginas } sem alterar o arquivo original. */
export async function lerPdf(arquivo, rotulo) {
  if (!arquivo) throw new ErroPdf(`Selecione o PDF da ${rotulo}.`);
  if (arquivo.size === 0) throw new ErroPdf(`O arquivo da ${rotulo} está vazio.`);
  if (arquivo.size > TAMANHO_MAXIMO) throw new ErroPdf(`O arquivo da ${rotulo} é grande demais (máximo 20 MB).`);

  const bytes = new Uint8Array(await arquivo.arrayBuffer());
  const cabecalho = String.fromCharCode(...bytes.slice(0, 5));
  if (cabecalho !== '%PDF-') throw new ErroPdf(`O arquivo da ${rotulo} não é um PDF válido.`);

  let doc;
  try {
    doc = await PDFDocument.load(bytes); // não ignora criptografia de propósito
  } catch (err) {
    if (err instanceof EncryptedPDFError) {
      throw new ErroPdf(`O PDF da ${rotulo} é protegido por senha/criptografia. Gere um arquivo sem proteção e tente de novo.`);
    }
    throw new ErroPdf(`Não foi possível ler o PDF da ${rotulo}. O arquivo pode estar corrompido.`);
  }

  const paginas = doc.getPageCount();
  if (paginas === 0) throw new ErroPdf(`O PDF da ${rotulo} não tem páginas.`);
  return { doc, paginas };
}

/* Caixa visível da página (CropBox, que é o que qualquer leitor de PDF mostra) */
function caixaVisivel(pagina) {
  const { x, y, width, height } = pagina.getCropBox();
  return { left: x, bottom: y, right: x + width, top: y + height };
}

function dimensoes(pagina) {
  const { x, y, width, height } = pagina.getCropBox();
  return { x, y, largura: width, altura: height };
}

/* Páginas com rotação gravada no PDF não são suportadas: girar mudaria o documento */
function exigirSemRotacao(pagina, rotulo) {
  const angulo = ((pagina.getRotation().angle % 360) + 360) % 360;
  if (angulo !== 0) {
    throw new ErroPdf(`A página do PDF da ${rotulo} está rotacionada (${angulo}°). Para não alterar o documento, gere o PDF sem rotação e tente de novo.`);
  }
}

/* Calcula onde cada documento ficaria, sem gerar nada. Usado para avisar antes de gerar. */
export function planejarLadoALado(paginaA, paginaB) {
  const area = {
    largura: (A4_PAISAGEM.largura - 2 * MARGEM - ESPACO_CENTRAL) / 2,
    altura: A4_PAISAGEM.altura - 2 * MARGEM
  };
  const escalaDe = (p) => {
    const d = dimensoes(p);
    // Nunca amplia além do tamanho original; só reduz o necessário para caber inteiro
    return Math.min(1, area.largura / d.largura, area.altura / d.altura);
  };
  const escalaA = escalaDe(paginaA);
  const escalaB = escalaDe(paginaB);
  return { area, escalaA, escalaB, legivel: Math.min(escalaA, escalaB) >= ESCALA_MINIMA_LEGIVEL };
}

function posicionar(pagina, escala, caixa) {
  const d = dimensoes(pagina);
  const largura = d.largura * escala;
  const altura = d.altura * escala;
  return {
    x: caixa.x + (caixa.largura - largura) / 2,
    y: caixa.y + (caixa.altura - altura) / 2,
    width: largura,
    height: altura
  };
}

/* Garantia final: o documento inteiro precisa estar dentro da área de impressão */
function conferirDentro(desenho, caixa, rotulo) {
  const folga = 0.01;
  const dentro =
    desenho.x >= caixa.x - folga &&
    desenho.y >= caixa.y - folga &&
    desenho.x + desenho.width <= caixa.x + caixa.largura + folga &&
    desenho.y + desenho.height <= caixa.y + caixa.altura + folga;
  if (!dentro) {
    throw new ErroPdf(`O documento da ${rotulo} ficaria fora da área de impressão. Geração interrompida.`);
  }
}

/* modo 'lado' = A4 paisagem com etiqueta à esquerda e nota à direita;
   modo 'separadas' = uma página A4 retrato para cada documento. */
export async function gerarPdf({ etiqueta, nota, modo = 'lado' }) {
  const saida = await PDFDocument.create();

  const origemEtiqueta = etiqueta.doc.getPage(etiqueta.pagina);
  const origemNota = nota.doc.getPage(nota.pagina);
  exigirSemRotacao(origemEtiqueta, 'etiqueta de envio');
  exigirSemRotacao(origemNota, 'nota fiscal');

  const incorporadaEtiqueta = await saida.embedPage(origemEtiqueta, caixaVisivel(origemEtiqueta));
  const incorporadaNota = await saida.embedPage(origemNota, caixaVisivel(origemNota));

  if (modo === 'lado') {
    const plano = planejarLadoALado(origemEtiqueta, origemNota);
    if (!plano.legivel) {
      throw new ErroPdf('Os documentos não cabem lado a lado com legibilidade. Use a opção de páginas separadas.');
    }
    const pagina = saida.addPage([A4_PAISAGEM.largura, A4_PAISAGEM.altura]);
    const alturaUtil = A4_PAISAGEM.altura - 2 * MARGEM;
    const caixaEsq = { x: MARGEM, y: MARGEM, largura: plano.area.largura, altura: alturaUtil };
    const caixaDir = { x: MARGEM + plano.area.largura + ESPACO_CENTRAL, y: MARGEM, largura: plano.area.largura, altura: alturaUtil };

    const desenhoEtiqueta = posicionar(origemEtiqueta, plano.escalaA, caixaEsq);
    const desenhoNota = posicionar(origemNota, plano.escalaB, caixaDir);
    conferirDentro(desenhoEtiqueta, caixaEsq, 'etiqueta de envio');
    conferirDentro(desenhoNota, caixaDir, 'nota fiscal');

    pagina.drawPage(incorporadaEtiqueta, desenhoEtiqueta);
    pagina.drawPage(incorporadaNota, desenhoNota);
  } else {
    const caixa = {
      x: MARGEM,
      y: MARGEM,
      largura: A4_RETRATO.largura - 2 * MARGEM,
      altura: A4_RETRATO.altura - 2 * MARGEM
    };
    for (const [origem, incorporada, rotulo] of [
      [origemEtiqueta, incorporadaEtiqueta, 'etiqueta de envio'],
      [origemNota, incorporadaNota, 'nota fiscal']
    ]) {
      const d = dimensoes(origem);
      const escala = Math.min(1, caixa.largura / d.largura, caixa.altura / d.altura);
      const desenho = posicionar(origem, escala, caixa);
      conferirDentro(desenho, caixa, rotulo);
      const pagina = saida.addPage([A4_RETRATO.largura, A4_RETRATO.altura]);
      pagina.drawPage(incorporada, desenho);
    }
  }

  return saida.save();
}
