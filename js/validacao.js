/**
 * Valida os campos de um canteiro (tanto via formulário quanto via PDF)
 * e calcula o estado inicial da bomba.
 */
function validarDadosCanteiro(dados) {
  const erros = {};

  const nome = typeof dados.nome === 'string' ? dados.nome.trim() : '';
  const cultura = typeof dados.cultura === 'string' ? dados.cultura.trim() : '';
  const umidadeAtual = Number(dados.umidadeAtual);
  const limiteMin = Number(dados.limiteMin);
  const limiteMax = Number(dados.limiteMax);

  if (nome.length < 3 || nome.length > 40) {
    erros.nome = 'O nome deve ter entre 3 e 40 caracteres.';
  }

  if (cultura.length < 3 || cultura.length > 30) {
    erros.cultura = 'A cultura deve ter entre 3 e 30 caracteres.';
  }

  if (dados.umidadeAtual === '' || Number.isNaN(umidadeAtual) || umidadeAtual < 0 || umidadeAtual > 100) {
    erros.umidadeAtual = 'Informe uma umidade entre 0% e 100%.';
  }

  if (dados.limiteMin === '' || Number.isNaN(limiteMin) || limiteMin < 0 || limiteMin >= 100) {
    erros.limiteMin = 'O limite mínimo deve estar entre 0% e 99%.';
  }

  if (dados.limiteMax === '' || Number.isNaN(limiteMax) || limiteMax <= 0 || limiteMax > 100) {
    erros.limiteMax = 'O limite máximo deve estar entre 1% e 100%.';
  }

  if (!erros.limiteMin && !erros.limiteMax && limiteMin >= limiteMax) {
    erros.limiteMin = 'O limite mínimo deve ser menor que o máximo.';
  }

  return {
    valido: Object.keys(erros).length === 0,
    erros,
    dadosLimpos: {
      nome,
      cultura,
      umidadeAtual,
      limiteMin,
      limiteMax
    }
  };
}

function calcularEstadoBomba(umidadeAtual, limiteMin, limiteMax, estadoAnterior = 'desligada') {
  if (umidadeAtual < limiteMin) return 'ligada';
  if (umidadeAtual >= limiteMax) return 'desligada';
  return estadoAnterior;
}
