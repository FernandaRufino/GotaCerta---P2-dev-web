/**
 * Controlador principal do GotaCerta.
 */
const CHAVE_CANTEIROS = 'gotacerta_canteiros';
let canteiros = [];

function carregarCanteiros() {
  try {
    const salvo = sessionStorage.getItem(CHAVE_CANTEIROS);
    canteiros = salvo ? JSON.parse(salvo) : [];
  } catch (e) {
    canteiros = [];
    exibirErroGlobal();
  }
}

function salvarCanteiros() {
  try {
    sessionStorage.setItem(CHAVE_CANTEIROS, JSON.stringify(canteiros));
  } catch (e) {
    exibirErroGlobal();
  }
}

function exibirErroGlobal() {
  const alerta = document.getElementById('alerta-erro-global');
  if (alerta) {
    alerta.textContent = 'Não foi possível carregar os dados. Tente novamente.';
    alerta.classList.remove('d-none');
  }
}

// --- OPERAÇÕES CRUD ---

function adicionarCanteiro(dadosLimpos, silencioso = false) {
  const bomba = calcularEstadoBomba(dadosLimpos.umidadeAtual, dadosLimpos.limiteMin, dadosLimpos.limiteMax);
  const novo = {
    id: Date.now() + Math.floor(Math.random() * 1000),
    ...dadosLimpos,
    bomba,
    atualizadoEm: obterDataHoraAtual()
  };

  canteiros.push(novo);
  salvarCanteiros();

  if (!silencioso) {
    registrarAtividade('Adicionar canteiro', `${novo.nome} (${novo.cultura})`, true);
  }
  atualizarInterfaces();
}

function editarCanteiro(id, dadosLimpos) {
  const indice = canteiros.findIndex((c) => c.id === id);
  if (indice === -1) return;

  const anterior = canteiros[indice];
  const bomba = calcularEstadoBomba(
    dadosLimpos.umidadeAtual,
    dadosLimpos.limiteMin,
    dadosLimpos.limiteMax,
    anterior.bomba
  );

  canteiros[indice] = {
    ...anterior,
    ...dadosLimpos,
    bomba,
    atualizadoEm: obterDataHoraAtual()
  };

  salvarCanteiros();
  registrarAtividade('Editar canteiro', `${dadosLimpos.nome}`, true);
  atualizarInterfaces();
}

function removerCanteiro(id) {
  const alvo = canteiros.find((c) => c.id === id);
  if (!alvo) return;

  canteiros = canteiros.filter((c) => c.id !== id);
  salvarCanteiros();
  registrarAtividade('Remover canteiro', `${alvo.nome}`, true);
  atualizarInterfaces();
}

function alternarBombaManual(id) {
  const item = canteiros.find((c) => c.id === id);
  if (!item) return;

  item.bomba = item.bomba === 'ligada' ? 'desligada' : 'ligada';
  item.atualizadoEm = obterDataHoraAtual();
  salvarCanteiros();

  const acao = item.bomba === 'ligada' ? 'Ligar bomba' : 'Desligar bomba';
  registrarAtividade(acao, `${item.nome}`, true);
  atualizarInterfaces();
}

function simularCicloUmidade() {
  if (canteiros.length === 0) return;

  canteiros.forEach((c) => {
    const variacao = c.bomba === 'ligada' ? Math.floor(Math.random() * 12) + 5 : -(Math.floor(Math.random() * 10) + 3);
    c.umidadeAtual = Math.max(0, Math.min(100, c.umidadeAtual + variacao));
    const novoEstado = calcularEstadoBomba(c.umidadeAtual, c.limiteMin, c.limiteMax, c.bomba);

    if (novoEstado !== c.bomba) {
      const acao = novoEstado === 'ligada' ? 'Ligar bomba (automático)' : 'Desligar bomba (automático)';
      registrarAtividade(acao, `${c.nome} — Umidade: ${c.umidadeAtual}%`, true);
    }

    c.bomba = novoEstado;
    c.atualizadoEm = obterDataHoraAtual();
  });

  salvarCanteiros();
  atualizarInterfaces();
}

// --- RENDERIZAÇÃO SEGURA NO DOM ---

function criarCardCanteiro(canteiro, modoGerenciamento = false) {
  const foraDaFaixa = canteiro.umidadeAtual < canteiro.limiteMin || canteiro.umidadeAtual > canteiro.limiteMax;

  const card = document.createElement('article');
  card.className = foraDaFaixa ? 'card gc-card gc-card-alerta' : 'card gc-card';

  const body = document.createElement('div');
  body.className = 'card-body d-flex flex-column justify-content-between';

  // Cabeçalho do card
  const topo = document.createElement('div');
  topo.className = 'd-flex justify-content-between align-items-start gap-2 mb-2';

  const tituloWrap = document.createElement('div');
  const titulo = document.createElement('h3');
  titulo.className = 'h6 fw-bold mb-0';
  titulo.textContent = canteiro.nome;

  const subtitulo = document.createElement('span');
  subtitulo.className = 'gc-label-apoio small';
  subtitulo.textContent = canteiro.cultura;

  tituloWrap.appendChild(titulo);
  tituloWrap.appendChild(subtitulo);

  const badge = document.createElement('span');
  badge.className = canteiro.bomba === 'ligada' ? 'gc-badge-ligada' : 'gc-badge-desligada';
  badge.textContent = canteiro.bomba === 'ligada' ? 'Bomba Ligada' : 'Bomba Desligada';

  topo.appendChild(tituloWrap);
  topo.appendChild(badge);

  // Dados de umidade
  const info = document.createElement('div');
  info.className = 'my-2';

  const umidadeTexto = document.createElement('p');
  umidadeTexto.className = 'mb-1 fw-bold';
  umidadeTexto.textContent = `Umidade atual: ${canteiro.umidadeAtual}%`;

  const limitesTexto = document.createElement('p');
  limitesTexto.className = 'gc-label-apoio small mb-0';
  limitesTexto.textContent = `Faixa ideal: ${canteiro.limiteMin}% a ${canteiro.limiteMax}%`;

  info.appendChild(umidadeTexto);
  info.appendChild(limitesTexto);

  // Mensagem de alerta quando ultrapassa a faixa ideal
  if (canteiro.umidadeAtual < canteiro.limiteMin) {
    const alertaEl = document.createElement('div');
    alertaEl.className = 'gc-alerta-faixa';
    alertaEl.setAttribute('role', 'alert');
    alertaEl.textContent = `Alerta: umidade abaixo do mínimo ideal (${canteiro.limiteMin}%).`;
    info.appendChild(alertaEl);
  } else if (canteiro.umidadeAtual > canteiro.limiteMax) {
    const alertaEl = document.createElement('div');
    alertaEl.className = 'gc-alerta-faixa';
    alertaEl.setAttribute('role', 'alert');
    alertaEl.textContent = `Alerta: umidade acima do máximo ideal (${canteiro.limiteMax}%).`;
    info.appendChild(alertaEl);
  }

  const atualizadoTexto = document.createElement('p');
  atualizadoTexto.className = 'gc-label-apoio small mb-0 mt-2';
  atualizadoTexto.textContent = `Atualizado: ${canteiro.atualizadoEm}`;
  info.appendChild(atualizadoTexto);

  // Ações
  const acoes = document.createElement('div');
  acoes.className = 'd-flex flex-wrap gap-2 mt-3 pt-2 border-top';

  const btnBomba = document.createElement('button');
  btnBomba.type = 'button';
  btnBomba.className = 'btn btn-sm gc-btn-secundario';
  btnBomba.textContent = canteiro.bomba === 'ligada' ? 'Desligar Bomba' : 'Ligar Bomba';
  btnBomba.addEventListener('click', () => alternarBombaManual(canteiro.id));
  acoes.appendChild(btnBomba);

  if (modoGerenciamento) {
    const btnEditar = document.createElement('button');
    btnEditar.type = 'button';
    btnEditar.className = 'btn btn-sm btn-outline-secondary';
    btnEditar.textContent = 'Editar';
    btnEditar.addEventListener('click', () => preencherFormularioEdicao(canteiro));

    const btnRemover = document.createElement('button');
    btnRemover.type = 'button';
    btnRemover.className = 'btn btn-sm btn-outline-danger';
    btnRemover.textContent = 'Remover';
    btnRemover.addEventListener('click', () => removerCanteiro(canteiro.id));

    acoes.appendChild(btnEditar);
    acoes.appendChild(btnRemover);
  }

  body.appendChild(topo);
  body.appendChild(info);
  body.appendChild(acoes);
  card.appendChild(body);

  return card;
}

function atualizarInterfaces() {
  renderizarPainelInicial();
  renderizarListaCanteiros();
  renderizarTabelaLogs();
}

function renderizarPainelInicial() {
  const estadoVazio = document.getElementById('estado-vazio-painel');
  const conteudoPainel = document.getElementById('conteudo-painel');
  if (!estadoVazio || !conteudoPainel) return;

  if (canteiros.length === 0) {
    estadoVazio.classList.remove('d-none');
    conteudoPainel.classList.add('d-none');
    return;
  }

  estadoVazio.classList.add('d-none');
  conteudoPainel.classList.remove('d-none');

  const totalBombas = canteiros.filter((c) => c.bomba === 'ligada').length;
  const somaUmidade = canteiros.reduce((acc, c) => acc + c.umidadeAtual, 0);
  const mediaUmidade = Math.round(somaUmidade / canteiros.length);

  document.getElementById('resumo-total').textContent = String(canteiros.length);
  document.getElementById('resumo-bombas').textContent = String(totalBombas);
  document.getElementById('resumo-umidade').textContent = `${mediaUmidade}%`;

  const grid = document.getElementById('lista-cards-painel');
  grid.replaceChildren();
  canteiros.forEach((c) => grid.appendChild(criarCardCanteiro(c, false)));
}

function renderizarListaCanteiros() {
  const listaEl = document.getElementById('lista-canteiros');
  const vazioEl = document.getElementById('estado-vazio-lista');
  const contadorEl = document.getElementById('contador-lista');
  if (!listaEl || !vazioEl) return;

  contadorEl.textContent = `${canteiros.length} ${canteiros.length === 1 ? 'item' : 'itens'}`;
  listaEl.replaceChildren();

  if (canteiros.length === 0) {
    vazioEl.classList.remove('d-none');
    return;
  }

  vazioEl.classList.add('d-none');
  canteiros.forEach((c) => listaEl.appendChild(criarCardCanteiro(c, true)));
}

function renderizarTabelaLogs() {
  const tbody = document.getElementById('tbody-logs');
  const vazioLogs = document.getElementById('estado-vazio-logs');
  const containerTabela = document.getElementById('container-tabela-logs');
  if (!tbody || !vazioLogs || !containerTabela) return;

  const logs = carregarLogs();
  tbody.replaceChildren();

  if (logs.length === 0) {
    vazioLogs.classList.remove('d-none');
    containerTabela.classList.add('d-none');
    return;
  }

  vazioLogs.classList.add('d-none');
  containerTabela.classList.remove('d-none');

  logs.forEach((log) => {
    const tr = document.createElement('tr');

    const tdData = document.createElement('td');
    tdData.textContent = log.dataHora;

    const tdAcao = document.createElement('td');
    tdAcao.className = 'fw-bold';
    tdAcao.textContent = log.acao;

    const tdDetalhes = document.createElement('td');
    tdDetalhes.textContent = log.detalhes;

    const tdResultado = document.createElement('td');
    const badge = document.createElement('span');
    badge.className = log.resultado === 'sucesso' ? 'badge bg-success' : 'badge bg-danger';
    badge.textContent = log.resultado;
    tdResultado.appendChild(badge);

    tr.appendChild(tdData);
    tr.appendChild(tdAcao);
    tr.appendChild(tdDetalhes);
    tr.appendChild(tdResultado);
    tbody.appendChild(tr);
  });
}

// --- FORMULÁRIO E EVENTOS ---

function preencherFormularioEdicao(canteiro) {
  document.getElementById('canteiro-id').value = canteiro.id;
  document.getElementById('nome').value = canteiro.nome;
  document.getElementById('cultura').value = canteiro.cultura;
  document.getElementById('umidadeAtual').value = canteiro.umidadeAtual;
  document.getElementById('limiteMin').value = canteiro.limiteMin;
  document.getElementById('limiteMax').value = canteiro.limiteMax;

  document.getElementById('titulo-form').textContent = 'Editar Canteiro';
  document.getElementById('btn-salvar').textContent = 'Atualizar Canteiro';
  document.getElementById('btn-cancelar-edicao').classList.remove('d-none');
  document.getElementById('nome').focus();
}

function resetarFormulario() {
  const form = document.getElementById('form-canteiro');
  if (!form) return;

  form.reset();
  document.getElementById('canteiro-id').value = '';
  document.getElementById('titulo-form').textContent = 'Cadastrar Canteiro';
  document.getElementById('btn-salvar').textContent = 'Salvar Canteiro';
  document.getElementById('btn-cancelar-edicao').classList.add('d-none');

  form.querySelectorAll('.is-invalid').forEach((el) => el.classList.remove('is-invalid'));
}

function mostrarFeedback(mensagem, sucesso = true) {
  const box = document.getElementById('feedback-operacao');
  if (!box) return;
  box.textContent = mensagem;
  box.className = `alert ${sucesso ? 'alert-success' : 'alert-danger'}`;
  setTimeout(() => box.classList.add('d-none'), 4000);
}

document.addEventListener('DOMContentLoaded', () => {
  carregarCanteiros();
  atualizarInterfaces();

  const btnSimular = document.getElementById('btn-simular-ciclo');
  if (btnSimular) {
    btnSimular.addEventListener('click', simularCicloUmidade);
  }

  const formCanteiro = document.getElementById('form-canteiro');
  if (formCanteiro) {
    formCanteiro.addEventListener('submit', (evento) => {
      evento.preventDefault();

      formCanteiro.querySelectorAll('.is-invalid').forEach((el) => el.classList.remove('is-invalid'));

      const entrada = {
        nome: document.getElementById('nome').value,
        cultura: document.getElementById('cultura').value,
        umidadeAtual: document.getElementById('umidadeAtual').value,
        limiteMin: document.getElementById('limiteMin').value,
        limiteMax: document.getElementById('limiteMax').value
      };

      const resultado = validarDadosCanteiro(entrada);

      if (!resultado.valido) {
        Object.entries(resultado.erros).forEach(([campo, msg]) => {
          const input = document.getElementById(campo);
          const erroDiv = document.getElementById(`erro-${campo}`);
          if (input) input.classList.add('is-invalid');
          if (erroDiv) erroDiv.textContent = msg;
        });
        registrarAtividade('Validar formulário', 'Tentativa com dados inválidos', false);
        return;
      }

      const idEdicao = document.getElementById('canteiro-id').value;
      if (idEdicao) {
        editarCanteiro(Number(idEdicao), resultado.dadosLimpos);
        mostrarFeedback('Canteiro atualizado com sucesso!', true);
      } else {
        adicionarCanteiro(resultado.dadosLimpos);
        mostrarFeedback('Canteiro cadastrado com sucesso!', true);
      }

      resetarFormulario();
    });
  }

  const btnCancelar = document.getElementById('btn-cancelar-edicao');
  if (btnCancelar) {
    btnCancelar.addEventListener('click', resetarFormulario);
  }

  const inputPdf = document.getElementById('input-pdf');
  if (inputPdf) {
    inputPdf.addEventListener('change', (e) => {
      const arquivo = e.target.files[0];
      processarArquivoPDF(arquivo, adicionarCanteiro);
      e.target.value = '';
    });
  }

  const btnLimparLogs = document.getElementById('btn-limpar-logs');
  if (btnLimparLogs) {
    btnLimparLogs.addEventListener('click', () => {
      limparLogs();
      renderizarTabelaLogs();
    });
  }
});
