/**
 * Gerencia o registro de atividades em sessionStorage para manter o log
 * entre as páginas durante a sessão, iniciando sempre limpo.
 */
const CHAVE_LOGS = 'gotacerta_logs';

function obterDataHoraAtual() {
  const agora = new Date();
  const data = agora.toLocaleDateString('pt-BR');
  const hora = agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  return `${data} ${hora}`;
}

function registrarAtividade(acao, detalhes, sucesso = true) {
  try {
    const logs = carregarLogs();
    logs.unshift({
      dataHora: obterDataHoraAtual(),
      acao: String(acao),
      detalhes: String(detalhes),
      resultado: sucesso ? 'sucesso' : 'erro'
    });
    sessionStorage.setItem(CHAVE_LOGS, JSON.stringify(logs));
  } catch (e) {
    // Falha silenciosa no armazenamento para não interromper o fluxo
  }
}

function carregarLogs() {
  try {
    const dados = sessionStorage.getItem(CHAVE_LOGS);
    return dados ? JSON.parse(dados) : [];
  } catch (e) {
    return [];
  }
}

function limparLogs() {
  sessionStorage.removeItem(CHAVE_LOGS);
}
