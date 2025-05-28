document.addEventListener('DOMContentLoaded', () => {
  const botaoCarrinho = document.getElementById('carrinho-btn');
  const areaCarrinho = document.getElementById('area-carrinho');
  const listaItensCarrinho = document.getElementById('lista-itens-carrinho');
  const fecharCarrinho = document.getElementById('fechar-carrinho');
  const contadorCarrinho = document.getElementById('contador-carrinho');
  const botaoTema = document.getElementById('btn-tema');
  let contador = 0;

  // Ativar tema salvo no localStorage
  if (localStorage.getItem('tema') === 'escuro') {
    document.body.classList.add('escuro'); // classe 'escuro' conforme CSS
    botaoTema.textContent = '☀️';
  } else {
    botaoTema.textContent = '🌙';
  }

  // Alternar tema claro/escuro
  botaoTema.addEventListener('click', () => {
    document.body.classList.toggle('escuro');
    const temaAtual = document.body.classList.contains('escuro') ? 'escuro' : 'claro';
    localStorage.setItem('tema', temaAtual);
    botaoTema.textContent = temaAtual === 'escuro' ? '☀️' : '🌙';
  });

  // Mostrar/ocultar área do carrinho
  botaoCarrinho.addEventListener('click', () => {
    const visivel = !areaCarrinho.hasAttribute('hidden');
    areaCarrinho.toggleAttribute('hidden', visivel);
    botaoCarrinho.setAttribute('aria-expanded', !visivel);
  });

  // Fechar carrinho ao clicar no botão fechar
  fecharCarrinho.addEventListener('click', () => {
    areaCarrinho.setAttribute('hidden', true);
    botaoCarrinho.setAttribute('aria-expanded', false);
  });

  // Função para adicionar item ao carrinho
  window.adicionarAoCarrinho = (nome, preco) => {
    const produto = Array.from(document.querySelectorAll('.produto')).find(
      p => p.dataset.nome === nome
    );

    if (!produto) return;

    const imagemSrc = produto.querySelector('img').getAttribute('src');
    const imagemAlt = produto.querySelector('img').getAttribute('alt');

    const li = document.createElement('li');
    li.className = 'item-carrinho';
    li.innerHTML = `
      <img src="${imagemSrc}" alt="${imagemAlt}" class="imagem-carrinho" />
      <div class="info-carrinho">
        <strong>${nome}</strong>
        <p>R$ ${preco.toFixed(2)}</p>
      </div>
      <button class="remover-item" aria-label="Remover ${nome} do carrinho">❌</button>
    `;

    li.querySelector('.remover-item').addEventListener('click', () => {
      li.remove();
      contador--;
      atualizarContador();
    });

    listaItensCarrinho.appendChild(li);
    contador++;
    atualizarContador();
  };

  // Atualiza contador visual do carrinho
  function atualizarContador() {
    contadorCarrinho.textContent = contador;
  }
});












