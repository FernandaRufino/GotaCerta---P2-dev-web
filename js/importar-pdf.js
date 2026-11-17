/**
 * Lê um arquivo PDF no navegador sem envio a servidores e extrai linhas
 * no formato: Nome | Cultura | Umidade atual | Limite mínimo | Limite máximo
 */
const TAMANHO_MAX_PDF = 5 * 1024 * 1024; // 5 MB

async function processarArquivoPDF(arquivo, callbackAdicionar) {
  const statusEl = document.getElementById('status-pdf');

  try {
    if (!arquivo) return;

    if (arquivo.type !== 'application/pdf') {
      throw new Error('Formato inválido');
    }

    if (arquivo.size > TAMANHO_MAX_PDF) {
      throw new Error('Arquivo excede 5 MB');
    }

    if (typeof pdfjsLib === 'undefined') {
      throw new Error('Biblioteca PDF indisponível');
    }

    pdfjsLib.GlobalWorkerOptions.workerSrc =
      'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

    statusEl.textContent = 'Lendo arquivo PDF no navegador...';
    statusEl.className = 'small mt-2 text-muted';

    const arrayBuffer = await arquivo.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    let textoCompleto = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const pagina = await pdf.getPage(i);
      const conteudo = await pagina.getTextContent();
      const linhasPagina = conteudo.items.map((item) => item.str).join(' ');
      textoCompleto += linhasPagina + '\n';
    }

    if (!textoCompleto.trim()) {
      registrarAtividade('Importar PDF', 'PDF sem texto selecionável', false);
      statusEl.textContent = 'Não foi possível carregar os dados. Tente novamente.';
      statusEl.className = 'small mt-2 text-danger';
      return;
    }

    const regexLinha = /([A-Za-zÀ-ÿ0-9\s\-]{3,40}?)\s+([A-Za-zÀ-ÿ\s]{3,30}?)\s+(\d{1,3})%?\s+(\d{1,3})%?\s+(\d{1,3})%?/g;
    let match;
    let importados = 0;
    let invalidos = 0;

    while ((match = regexLinha.exec(textoCompleto)) !== null) {
      const candidato = {
        nome: match[1].trim(),
        cultura: match[2].trim(),
        umidadeAtual: match[3],
        limiteMin: match[4],
        limiteMax: match[5]
      };

      if (candidato.nome.toLowerCase().includes('nome')) continue;

      const validacao = validarDadosCanteiro(candidato);
      if (validacao.valido) {
        callbackAdicionar(validacao.dadosLimpos, true);
        importados++;
      } else {
        invalidos++;
        registrarAtividade('Importar PDF (linha)', `Linha ignorada: ${candidato.nome}`, false);
      }
    }

    if (importados > 0) {
      registrarAtividade('Importar PDF', `${importados} canteiro(s) importado(s)`, true);
      statusEl.textContent = `Importação concluída: ${importados} válido(s), ${invalidos} ignorado(s).`;
      statusEl.className = 'small mt-2 text-success';
    } else {
      registrarAtividade('Importar PDF', 'Nenhuma linha válida encontrada', false);
      statusEl.textContent = 'Não foi possível carregar os dados. Tente novamente.';
      statusEl.className = 'small mt-2 text-danger';
    }
  } catch (erro) {
    registrarAtividade('Importar PDF', 'Falha na leitura do arquivo', false);
    statusEl.textContent = 'Não foi possível carregar os dados. Tente novamente.';
    statusEl.className = 'small mt-2 text-danger';
  }
}
