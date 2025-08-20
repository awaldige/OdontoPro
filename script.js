document.addEventListener('DOMContentLoaded', () => {
  // --- Tema escuro/claro ---
  const btnTema = document.getElementById('btn-tema');
  btnTema.addEventListener('click', () => {
    document.body.classList.toggle('escuro');
    btnTema.innerHTML = document.body.classList.contains('escuro') ? '☀️' : '🌙';
  });

  // --- Carrinho ---
  const carrinhoBtn = document.getElementById('carrinho-btn');
  const carrinho = document.getElementById('area-carrinho');
  const fecharCarrinho = document.getElementById('fechar-carrinho');
  const listaCarrinho = document.getElementById('lista-itens-carrinho');
  const contadorCarrinho = document.getElementById('contador-carrinho');

  // Botões do carrinho
  const btnLimpar = document.createElement('button');
  btnLimpar.id = 'limpar-carrinho';
  btnLimpar.textContent = 'Limpar Carrinho';
  const btnFinalizar = document.createElement('button');
  btnFinalizar.id = 'finalizar-compra';
  btnFinalizar.textContent = 'Finalizar Compra';
  carrinho.appendChild(btnLimpar);
  carrinho.appendChild(btnFinalizar);

  // Abrir/fechar carrinho
  carrinhoBtn.addEventListener('click', () => {
    carrinho.toggleAttribute('hidden');
  });
  fecharCarrinho.addEventListener('click', () => {
    carrinho.setAttribute('hidden', '');
  });

  // --- Itens do carrinho ---
  let itensCarrinho = [];

  function atualizarCarrinho() {
    listaCarrinho.innerHTML = '';

    if (itensCarrinho.length === 0) {
      listaCarrinho.innerHTML = `<li style="text-align:center; padding:1rem; color:#777;">Seu carrinho está vazio</li>`;
      contadorCarrinho.textContent = 0;
      btnLimpar.style.display = "none";
      btnFinalizar.style.display = "none";
      return;
    }

    itensCarrinho.forEach((item, index) => {
      const li = document.createElement('li');
      li.className = 'item-carrinho';
      li.innerHTML = `
        <img class="imagem-carrinho" src="${item.img}" alt="${item.nome}" />
        <div class="info-carrinho">
          <strong>${item.nome}</strong>
          <p>R$ ${item.preco.toFixed(2)}</p>
        </div>
        <button class="remover-item" aria-label="Remover ${item.nome}">✖</button>
      `;
      li.querySelector('.remover-item').addEventListener('click', () => {
        removerDoCarrinho(index);
      });
      listaCarrinho.appendChild(li);
    });

    contadorCarrinho.textContent = itensCarrinho.length;
    btnLimpar.style.display = "block";
    btnFinalizar.style.display = "block";
  }

  function adicionarAoCarrinho(nome, preco, img) {
    itensCarrinho.push({ nome, preco, img });
    atualizarCarrinho();
    carrinho.removeAttribute('hidden'); // abre sempre que adiciona
  }

  function removerDoCarrinho(index) {
    itensCarrinho.splice(index, 1);
    atualizarCarrinho();
    if (itensCarrinho.length === 0) {
      carrinho.setAttribute('hidden', '');
    }
  }

  btnLimpar.addEventListener('click', () => {
    itensCarrinho = [];
    atualizarCarrinho();
    carrinho.setAttribute('hidden', '');
  });

  btnFinalizar.addEventListener('click', () => {
    if(itensCarrinho.length === 0){
      alert('Carrinho vazio!');
      return;
    }
    const total = itensCarrinho.reduce((a,b)=>a+b.preco,0).toFixed(2);
    alert('Compra finalizada! Total: R$ ' + total);
    itensCarrinho = [];
    atualizarCarrinho();
    carrinho.setAttribute('hidden', '');
  });

  // --- Paginação ---
  const listaProdutosContainer = document.getElementById("lista-produtos");
  const paginacaoContainer = document.getElementById("paginacao");
  const produtosPorPagina = 6;
  let paginaAtual = 1;
  let produtosFiltrados = Array.from(listaProdutosContainer.querySelectorAll(".produto"));

  function atualizarListaProdutos() {
    const totalPaginas = Math.ceil(produtosFiltrados.length / produtosPorPagina);
    const start = (paginaAtual - 1) * produtosPorPagina;
    const end = paginaAtual * produtosPorPagina;

    produtosFiltrados.forEach((prod, index) => {
      prod.style.display = index >= start && index < end ? '' : 'none';
    });

    criarPaginacao(totalPaginas);
  }

  function criarPaginacao(totalPaginas) {
    paginacaoContainer.innerHTML = "";
    if (totalPaginas <= 1) return;

    for (let i = 1; i <= totalPaginas; i++) {
      const btn = document.createElement("button");
      btn.textContent = i;
      btn.className = i === paginaAtual ? "ativo" : "";
      btn.addEventListener("click", () => {
        paginaAtual = i;
        atualizarListaProdutos();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
      paginacaoContainer.appendChild(btn);
    }
  }

  // --- Busca ---
  const campoBusca = document.getElementById('campo-busca');
  campoBusca.addEventListener('input', () => {
    const filtro = campoBusca.value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    produtosFiltrados = Array.from(listaProdutosContainer.querySelectorAll(".produto")).filter(prod => {
      const nome = prod.getAttribute('data-nome').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      return nome.includes(filtro);
    });
    paginaAtual = 1;
    atualizarListaProdutos();
  });

  // Inicializa
  atualizarListaProdutos();

  // Exponha função global para uso em HTML
  window.adicionarAoCarrinho = adicionarAoCarrinho;
});
