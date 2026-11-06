// A fila fica neste navegador. Abas abertas acompanham as mesmas mudanças.
const chave = 'filazero-fila';
const $ = seletor => document.querySelector(seletor);
const lerFila = () => JSON.parse(localStorage.getItem(chave)) || { ultimo: 0, pessoas: [], atual: null, finalizados: [] };
let fila = lerFila();
let minhaSenha = Number(sessionStorage.getItem('filazero-senha'));
const numero = senha => 'A' + String(senha).padStart(3, '0');
const textoSeguro = texto => texto.replace(/[&<>"']/g, letra => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[letra]));

function salvar() {
  localStorage.setItem(chave, JSON.stringify(fila));
  mostrar();
}

function mostrar() {
  const posicao = fila.pessoas.findIndex(pessoa => pessoa.senha === minhaSenha);
  const chamado = fila.atual?.senha === minhaSenha;
  $('#entrada').hidden = !!minhaSenha;
  $('#senha').hidden = !minhaSenha;
  if (minhaSenha) {
    const terminou = !chamado && posicao < 0;
    $('#senha').innerHTML = `<span class="rotulo">SEU LUGAR ESTÁ AQUI</span><h2>${chamado ? 'É a sua vez!' : terminou ? 'Até a próxima!' : 'Pronto. Pode respirar.'}</h2><div class="bilhete"><span>SUA SENHA</span><div class="numero">${numero(minhaSenha)}</div><span>${chamado ? 'Pode ir ao balcão.' : terminou ? 'Seu atendimento foi encerrado.' : 'Acompanhe esta tela.'}</span></div>${posicao >= 0 ? `<div class="metricas"><div><strong>${posicao + 1}º</strong>na fila</div><div><strong>~${(posicao + (fila.atual ? 1 : 0)) * 5} min</strong>espera estimada</div></div><small>Estimativa de 5 minutos por atendimento.</small>` : ''}<button class="secundario" id="sair">${terminou ? 'Voltar ao início' : 'Sair da fila'}</button>`;
    $('#sair').onclick = sair;
  }
  $('#quantidade').textContent = fila.pessoas.length;
  $('#resumo').textContent = `${fila.pessoas.length} ${fila.pessoas.length === 1 ? 'pessoa esperando' : 'pessoas esperando'}`;
  $('#atual').innerHTML = fila.atual ? `EM ATENDIMENTO<strong>${numero(fila.atual.senha)} · ${textoSeguro(fila.atual.nome)}</strong>` : 'Ninguém em atendimento por enquanto.';
  $('#proximo').textContent = fila.pessoas.length ? 'Chamar próximo →' : fila.atual ? 'Finalizar atendimento ✓' : 'Aguardando pessoas';
  $('#proximo').disabled = !fila.pessoas.length && !fila.atual;
  $('#lista').innerHTML = fila.pessoas.length ? fila.pessoas.map(pessoa => `<li><strong>${numero(pessoa.senha)}</strong> ${textoSeguro(pessoa.nome)} <span>aguardando</span></li>`).join('') : '<li class="vazio">A fila está livre. Tudo em dia.</li>';
}

$('#formulario').onsubmit = evento => {
  evento.preventDefault();
  const nome = $('#nome').value.trim();
  if (!nome) return $('#nome').focus();
  fila = lerFila();
  minhaSenha = ++fila.ultimo;
  fila.pessoas.push({ senha: minhaSenha, nome });
  sessionStorage.setItem('filazero-senha', minhaSenha);
  salvar();
};

function sair() {
  fila = lerFila();
  fila.pessoas = fila.pessoas.filter(pessoa => pessoa.senha !== minhaSenha);
  if (fila.atual?.senha === minhaSenha) fila.atual = null;
  minhaSenha = 0;
  sessionStorage.removeItem('filazero-senha');
  $('#formulario').reset();
  salvar();
}

$('#proximo').onclick = () => {
  fila = lerFila();
  fila.atual = fila.pessoas.shift() || null;
  salvar();
};

document.querySelectorAll('[data-tela]').forEach(botao => {
  botao.onclick = () => {
    document.querySelectorAll('[data-tela]').forEach(item => item.classList.toggle('ativo', item === botao));
    $('#cliente').hidden = botao.dataset.tela !== 'cliente';
    $('#atendente').hidden = botao.dataset.tela !== 'atendente';
  };
});
window.addEventListener('storage', evento => {
  if (evento.key === chave) { fila = lerFila(); mostrar(); }
});
mostrar();
