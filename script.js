
document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  // =========================================================
  // CONFIGURAÇÕES E ELEMENTOS
  // =========================================================

  const CHAVE_TEMA = "odontopro-theme";
  const CHAVE_CARRINHO = "odontopro-cart";
  const PRODUTOS_POR_PAGINA = 8;

  const body = document.body;

  const btnTema = document.querySelector("#btn-tema");
  const btnCarrinho = document.querySelector("#carrinho-btn");
  const contadorCarrinho = document.querySelector("#contador-carrinho");

  const areaCarrinho = document.querySelector("#area-carrinho");
  const overlayCarrinho = document.querySelector("#carrinho-overlay");
  const listaCarrinho = document.querySelector("#lista-itens-carrinho");
  const totalCarrinho = document.querySelector("#total-carrinho");
  const btnLimparCarrinho = document.querySelector("#limpar-carrinho");
  const btnFinalizarCompra = document.querySelector("#finalizar-compra");
  const btnFecharCarrinho = document.querySelector(
    "#fechar-carrinho, [data-fechar-carrinho]"
  );

  const resumoModal = document.querySelector("#resumo-modal");
  const resumoItens = document.querySelector("#resumo-itens");
  const resumoTotal = document.querySelector("#resumo-total");
  const btnFecharResumo = document.querySelector("#fechar-resumo");
  const btnContinuarComprando = document.querySelector(
    "#continuar-comprando"
  );

  // Formulário da compra simulada
  const formCheckout = document.querySelector("#form-checkout");
  const checkoutStatus = document.querySelector("#checkout-status");
  const checkoutNome = document.querySelector("#checkout-nome");
  const checkoutEmail = document.querySelector("#checkout-email");
  const metodoPagamento = document.querySelector("#metodo-pagamento");
  const btnConfirmarSimulacao = document.querySelector(
    "#confirmar-simulacao"
  );

  const campoBusca = document.querySelector("#campo-busca");
  const btnLimparBusca = document.querySelector("#limpar-busca");
  const filtrosCategorias = document.querySelector("#filtros-categorias");
  const paginacao = document.querySelector("#paginacao");
  const mensagemProdutos = document.querySelector("#mensagem-produtos");
  const secaoProdutos = document.querySelector("#produtos");

  const toastContainer = document.querySelector("#toast-container");
  const anoAtual = document.querySelector("#ano-atual");

  // =========================================================
  // FUNÇÕES AUXILIARES
  // =========================================================

  function lerArmazenamento(chave, valorPadrao) {
    try {
      const valor = localStorage.getItem(chave);
      return valor ? JSON.parse(valor) : valorPadrao;
    } catch (erro) {
      console.warn(`Não foi possível ler ${chave}:`, erro);
      return valorPadrao;
    }
  }

  function salvarArmazenamento(chave, valor) {
    try {
      localStorage.setItem(chave, JSON.stringify(valor));
      return true;
    } catch (erro) {
      console.warn(`Não foi possível salvar ${chave}:`, erro);
      return false;
    }
  }

  function formatarMoeda(valor) {
    return Number(valor).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    });
  }

  function normalizarTexto(valor) {
    return String(valor)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  }

  function criarElemento(tag, classe, texto) {
    const elemento = document.createElement(tag);

    if (classe) {
      elemento.className = classe;
    }

    if (texto !== undefined && texto !== null) {
      elemento.textContent = texto;
    }

    return elemento;
  }

  function exibirToast(mensagem, tipo = "info") {
    if (!toastContainer) {
      console.info(mensagem);
      return;
    }

    const toast = criarElemento("div", `toast ${tipo}`, mensagem);
    toast.setAttribute("role", "status");

    toastContainer.appendChild(toast);

    window.setTimeout(() => {
      toast.classList.add("removendo");

      window.setTimeout(() => {
        toast.remove();
      }, 300);
    }, 3000);
  }

  // =========================================================
  // TEMA CLARO E ESCURO
  // =========================================================

  function aplicarTema(tema) {
    const temaEscuro = tema === "escuro";

    body.classList.toggle("escuro", temaEscuro);

    if (btnTema) {
      btnTema.setAttribute(
        "aria-label",
        temaEscuro ? "Ativar tema claro" : "Ativar tema escuro"
      );

      btnTema.setAttribute(
        "title",
        temaEscuro ? "Ativar tema claro" : "Ativar tema escuro"
      );

      const icone = btnTema.querySelector("[data-theme-icon]");

      if (icone) {
        icone.textContent = temaEscuro ? "☀️" : "🌙";
      }
    }
  }

  const temaSalvo = lerArmazenamento(CHAVE_TEMA, "claro");

  aplicarTema(temaSalvo === "escuro" ? "escuro" : "claro");

  if (btnTema) {
    btnTema.addEventListener("click", () => {
      const novoTema = body.classList.contains("escuro")
        ? "claro"
        : "escuro";

      aplicarTema(novoTema);
      salvarArmazenamento(CHAVE_TEMA, novoTema);
    });
  }

  // =========================================================
  // CARRINHO
  // =========================================================

  function imagemValida(caminho) {
    if (typeof caminho !== "string" || !caminho.trim()) {
      return false;
    }

    const valor = caminho.trim();

    return (
      !/^(https?:|data:|javascript:|\/\/)/i.test(valor) &&
      !valor.includes("..")
    );
  }

  function validarCarrinho(dados) {
    if (!Array.isArray(dados)) {
      return [];
    }

    return dados
      .filter((item) => {
        return (
          item &&
          typeof item.nome === "string" &&
          item.nome.trim() !== "" &&
          Number.isFinite(Number(item.preco)) &&
          Number(item.preco) >= 0 &&
          imagemValida(item.img) &&
          Number.isSafeInteger(Number(item.quantidade)) &&
          Number(item.quantidade) > 0
        );
      })
      .map((item) => ({
        nome: item.nome.trim(),
        preco: Number(item.preco),
        img: item.img.trim(),
        quantidade: Number(item.quantidade)
      }));
  }

  let carrinho = validarCarrinho(
    lerArmazenamento(CHAVE_CARRINHO, [])
  );

  function salvarCarrinho() {
    salvarArmazenamento(CHAVE_CARRINHO, carrinho);
  }

  function calcularTotal() {
    return carrinho.reduce((total, item) => {
      return total + item.preco * item.quantidade;
    }, 0);
  }

  function calcularQuantidadeTotal() {
    return carrinho.reduce((total, item) => {
      return total + item.quantidade;
    }, 0);
  }

  function atualizarCarrinho() {
    if (!listaCarrinho) {
      return;
    }

    listaCarrinho.replaceChildren();

    if (carrinho.length === 0) {
      const itemVazio = criarElemento(
        "li",
        "carrinho-vazio",
        "Seu carrinho está vazio."
      );

      listaCarrinho.appendChild(itemVazio);
    } else {
      carrinho.forEach((produto, indice) => {
        const item = criarElemento("li", "item-carrinho");

        const imagem = criarElemento("img", "imagem-carrinho");
        imagem.src = produto.img;
        imagem.alt = produto.nome;
        imagem.loading = "lazy";

        const informacoes = criarElemento("div", "info-carrinho");

        const nome = criarElemento(
          "strong",
          "nome-carrinho",
          produto.nome
        );

        const subtotal = criarElemento(
          "p",
          "preco-carrinho",
          formatarMoeda(produto.preco * produto.quantidade)
        );

        const controles = criarElemento("div", "cart-quantity");

        const btnDiminuir = criarElemento("button", "", "−");
        btnDiminuir.type = "button";

        btnDiminuir.setAttribute(
          "aria-label",
          `Diminuir quantidade de ${produto.nome}`
        );

        const quantidade = criarElemento(
          "span",
          "",
          String(produto.quantidade)
        );

        const btnAumentar = criarElemento("button", "", "+");
        btnAumentar.type = "button";

        btnAumentar.setAttribute(
          "aria-label",
          `Aumentar quantidade de ${produto.nome}`
        );

        btnDiminuir.addEventListener("click", () => {
          alterarQuantidade(indice, -1);
        });

        btnAumentar.addEventListener("click", () => {
          alterarQuantidade(indice, 1);
        });

        controles.append(
          btnDiminuir,
          quantidade,
          btnAumentar
        );

        const btnRemover = criarElemento(
          "button",
          "remover-item",
          "Remover"
        );

        btnRemover.type = "button";

        btnRemover.addEventListener("click", () => {
          removerItem(indice);
        });

        informacoes.append(
          nome,
          subtotal,
          controles,
          btnRemover
        );

        item.append(imagem, informacoes);
        listaCarrinho.appendChild(item);
      });
    }

    if (contadorCarrinho) {
      contadorCarrinho.textContent = String(calcularQuantidadeTotal());
    }

    if (totalCarrinho) {
      totalCarrinho.textContent = formatarMoeda(calcularTotal());
    }

    if (btnLimparCarrinho) {
      btnLimparCarrinho.hidden = carrinho.length === 0;
      btnLimparCarrinho.style.display =
        carrinho.length === 0 ? "none" : "";
    }

    // Botão de finalizar aparece somente com produtos.
    if (btnFinalizarCompra) {
      const carrinhoVazio = carrinho.length === 0;

      btnFinalizarCompra.hidden = carrinhoVazio;
      btnFinalizarCompra.style.display = carrinhoVazio ? "none" : "";
      btnFinalizarCompra.disabled = carrinhoVazio;
    }

    salvarCarrinho();
  }

  function adicionarAoCarrinho(nome, preco, imagem) {
    const valor = Number(preco);

    if (
      typeof nome !== "string" ||
      !nome.trim() ||
      !Number.isFinite(valor) ||
      valor < 0 ||
      !imagemValida(imagem)
    ) {
      exibirToast("Não foi possível adicionar este produto.", "info");
      return;
    }

    const produtoExistente = carrinho.find((item) => {
      return item.nome === nome.trim();
    });

    if (produtoExistente) {
      produtoExistente.quantidade += 1;
    } else {
      carrinho.push({
        nome: nome.trim(),
        preco: valor,
        img: imagem.trim(),
        quantidade: 1
      });
    }

    atualizarCarrinho();
    abrirCarrinho();

    exibirToast(`${nome} adicionado ao carrinho.`, "success");
  }

  function alterarQuantidade(indice, alteracao) {
    const produto = carrinho[indice];

    if (!produto) {
      return;
    }

    produto.quantidade += alteracao;

    if (produto.quantidade <= 0) {
      carrinho.splice(indice, 1);
    }

    atualizarCarrinho();
  }

  function removerItem(indice) {
    if (!carrinho[indice]) {
      return;
    }

    const nome = carrinho[indice].nome;

    carrinho.splice(indice, 1);

    atualizarCarrinho();

    exibirToast(`${nome} removido do carrinho.`, "info");
  }

  function limparCarrinho() {
    carrinho = [];

    atualizarCarrinho();
    fecharCarrinho();

    exibirToast("Carrinho limpo.", "info");
  }

  // =========================================================
  // ABRIR E FECHAR CARRINHO
  // =========================================================

  function abrirCarrinho() {
    if (!areaCarrinho) {
      return;
    }

    areaCarrinho.hidden = false;
    areaCarrinho.style.display = "";
    areaCarrinho.setAttribute("aria-hidden", "false");

    if (overlayCarrinho) {
      overlayCarrinho.hidden = false;
      overlayCarrinho.style.display = "";
      overlayCarrinho.setAttribute("aria-hidden", "false");
    }

    body.classList.add("no-scroll");

    if (btnCarrinho) {
      btnCarrinho.setAttribute("aria-expanded", "true");
    }

    if (btnFecharCarrinho) {
      btnFecharCarrinho.focus();
    }
  }

  function fecharCarrinho() {
    if (areaCarrinho) {
      areaCarrinho.hidden = true;
      areaCarrinho.style.display = "none";
      areaCarrinho.setAttribute("aria-hidden", "true");
    }

    if (overlayCarrinho) {
      overlayCarrinho.hidden = true;
      overlayCarrinho.style.display = "none";
      overlayCarrinho.setAttribute("aria-hidden", "true");
    }

    body.classList.remove("no-scroll");

    if (btnCarrinho) {
      btnCarrinho.setAttribute("aria-expanded", "false");
    }
  }

  if (btnCarrinho) {
    btnCarrinho.setAttribute("aria-expanded", "false");
    btnCarrinho.addEventListener("click", abrirCarrinho);
  }

  if (btnFecharCarrinho) {
    btnFecharCarrinho.addEventListener("click", fecharCarrinho);
  }

  if (overlayCarrinho) {
    overlayCarrinho.addEventListener("click", fecharCarrinho);
  }

  if (btnLimparCarrinho) {
    btnLimparCarrinho.addEventListener("click", limparCarrinho);
  }

  // Liga os botões dos produtos ao carrinho.
  document.querySelectorAll("[data-adicionar]").forEach((botao) => {
    botao.addEventListener("click", () => {
      adicionarAoCarrinho(
        botao.dataset.nome,
        botao.dataset.preco,
        botao.dataset.img
      );
    });
  });

  // =========================================================
  // RESUMO E FINALIZAÇÃO SIMULADA
  // =========================================================

  function fecharResumo() {
    if (!resumoModal) {
      return;
    }

    resumoModal.hidden = true;
    resumoModal.style.display = "none";

    body.classList.remove("no-scroll");
  }

  function abrirResumo() {
    if (!resumoModal || !resumoItens || carrinho.length === 0) {
      return;
    }

    resumoItens.replaceChildren();

    carrinho.forEach((produto) => {
      const item = criarElemento(
        "li",
        "summary-item",
        `${produto.nome} — ${produto.quantidade} un. — ${formatarMoeda(
          produto.preco * produto.quantidade
        )}`
      );

      resumoItens.appendChild(item);
    });

    if (resumoTotal) {
      resumoTotal.textContent = formatarMoeda(calcularTotal());
    }

    if (checkoutStatus) {
      checkoutStatus.textContent = "";
    }

    if (formCheckout) {
      formCheckout.reset();
    }

    // Restaura o botão para uma nova simulação.
    if (btnConfirmarSimulacao) {
      btnConfirmarSimulacao.disabled = false;
      btnConfirmarSimulacao.textContent = "Concluir simulação";
    }

    fecharCarrinho();

    resumoModal.hidden = false;
    resumoModal.style.display = "";

    body.classList.add("no-scroll");

    if (btnFecharResumo) {
      btnFecharResumo.focus();
    }
  }

  if (btnFinalizarCompra) {
    btnFinalizarCompra.addEventListener("click", abrirResumo);
  }

  if (btnFecharResumo) {
    btnFecharResumo.addEventListener("click", fecharResumo);
  }

  if (btnContinuarComprando) {
    btnContinuarComprando.addEventListener("click", () => {
      fecharResumo();

      if (secaoProdutos) {
        secaoProdutos.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      }
    });
  }

  // =========================================================
  // FORMULÁRIO DA COMPRA SIMULADA
  // =========================================================

  if (formCheckout) {
    formCheckout.addEventListener("submit", (evento) => {
      evento.preventDefault();

      if (carrinho.length === 0) {
        if (checkoutStatus) {
          checkoutStatus.textContent =
            "Adicione pelo menos um produto antes de continuar.";

          checkoutStatus.setAttribute("role", "alert");
        }

        return;
      }

      if (!formCheckout.checkValidity()) {
        formCheckout.reportValidity();
        return;
      }

      const nome = checkoutNome?.value.trim() || "";
      const email = checkoutEmail?.value.trim() || "";
      const pagamento = metodoPagamento?.value || "";

      if (!nome || !email || !pagamento) {
        if (checkoutStatus) {
          checkoutStatus.textContent =
            "Preencha os campos e selecione uma forma de pagamento.";

          checkoutStatus.setAttribute("role", "alert");
        }

        return;
      }

      const formasPagamento = {
        pix: "Pix",
        cartao: "Cartão de crédito",
        boleto: "Boleto"
      };

      const formaEscolhida = formasPagamento[pagamento];

      if (!formaEscolhida) {
        if (checkoutStatus) {
          checkoutStatus.textContent =
            "Selecione uma forma de pagamento válida.";

          checkoutStatus.setAttribute("role", "alert");
        }

        return;
      }

      // Guarda o total antes de esvaziar o carrinho.
      const totalSimulado = calcularTotal();

      // Exibe a confirmação da simulação.
      if (checkoutStatus) {
        checkoutStatus.textContent =
          `Simulação concluída, ${nome}! Forma de pagamento escolhida: ${formaEscolhida}. Total demonstrativo: ${formatarMoeda(totalSimulado)}. Nenhum pedido real foi criado e nenhum pagamento foi realizado.`;

        checkoutStatus.setAttribute("role", "status");
        checkoutStatus.setAttribute("aria-live", "polite");
      }
// Limpa o carrinho após a conclusão.
carrinho = [];
atualizarCarrinho();

// Desativa o botão para evitar envio repetido.
if (btnConfirmarSimulacao) {
  btnConfirmarSimulacao.textContent = "Simulação concluída";
  btnConfirmarSimulacao.disabled = true;
}

// Fecha automaticamente a janela de finalização.
window.setTimeout(() => {
  fecharResumo();
  formCheckout.reset();

  if (checkoutStatus) {
    checkoutStatus.textContent = "";
  }

  if (btnConfirmarSimulacao) {
    btnConfirmarSimulacao.textContent = "Concluir simulação";
    btnConfirmarSimulacao.disabled = false;
  }
}, 2500);

      exibirToast(
        "Simulação concluída! Carrinho limpo com sucesso.",
        "success"
      );
    });

    // Só permite reiniciar o botão enquanto houver itens no carrinho.
    function restaurarFormularioSeNecessario() {
      if (carrinho.length > 0 && btnConfirmarSimulacao?.disabled) {
        btnConfirmarSimulacao.disabled = false;
        btnConfirmarSimulacao.textContent = "Concluir simulação";
      }

      if (carrinho.length > 0 && checkoutStatus) {
        checkoutStatus.textContent = "";
      }
    }

    formCheckout.addEventListener(
      "input",
      restaurarFormularioSeNecessario
    );

    formCheckout.addEventListener(
      "change",
      restaurarFormularioSeNecessario
    );
  }

  // =========================================================
  // BUSCA, FILTROS E PAGINAÇÃO
  // =========================================================

  const todosOsProdutos = Array.from(
    document.querySelectorAll(".produto")
  );

  let categoriaSelecionada = "todos";
  let paginaAtual = 1;

  function obterProdutosFiltrados() {
    const termo = normalizarTexto(campoBusca?.value || "");

    return todosOsProdutos.filter((produto) => {
      const nome = normalizarTexto(
        produto.dataset.nome || produto.textContent
      );

      const categoria = produto.dataset.categoria || "todos";

      const correspondeBusca = !termo || nome.includes(termo);

      const correspondeCategoria =
        categoriaSelecionada === "todos" ||
        categoria === categoriaSelecionada;

      return correspondeBusca && correspondeCategoria;
    });
  }

  function renderizarPaginacao(totalPaginas) {
    if (!paginacao) {
      return;
    }

    paginacao.replaceChildren();

    if (totalPaginas <= 1) {
      paginacao.hidden = true;
      paginacao.style.display = "none";
      return;
    }

    paginacao.hidden = false;
    paginacao.style.display = "";

    for (let numero = 1; numero <= totalPaginas; numero += 1) {
      const botao = criarElemento(
        "button",
        numero === paginaAtual ? "ativo" : "",
        String(numero)
      );

      botao.type = "button";

      botao.setAttribute(
        "aria-label",
        `Ir para a página ${numero}`
      );

      if (numero === paginaAtual) {
        botao.setAttribute("aria-current", "page");
      }

      botao.addEventListener("click", () => {
        paginaAtual = numero;
        atualizarCatalogo();

        if (secaoProdutos) {
          secaoProdutos.scrollIntoView({
            behavior: "smooth",
            block: "start"
          });
        }
      });

      paginacao.appendChild(botao);
    }
  }

  function atualizarCatalogo() {
    const produtosFiltrados = obterProdutosFiltrados();

    const totalProdutos = produtosFiltrados.length;

    const totalPaginas = Math.ceil(
      totalProdutos / PRODUTOS_POR_PAGINA
    );

    if (paginaAtual > totalPaginas) {
      paginaAtual = Math.max(1, totalPaginas);
    }

    const inicio = (paginaAtual - 1) * PRODUTOS_POR_PAGINA;
    const fim = inicio + PRODUTOS_POR_PAGINA;

    const produtosVisiveis = new Set(
      produtosFiltrados.slice(inicio, fim)
    );

    todosOsProdutos.forEach((produto) => {
      const visivel = produtosVisiveis.has(produto);

      produto.hidden = !visivel;
      produto.style.display = visivel ? "" : "none";
    });

    if (mensagemProdutos) {
      if (totalProdutos === 0) {
        mensagemProdutos.textContent =
          "Nenhum produto encontrado. Experimente outra busca ou categoria.";
      } else {
        mensagemProdutos.textContent =
          `Exibindo ${produtosVisiveis.size} de ${totalProdutos} produto(s).`;
      }

      mensagemProdutos.hidden = false;
      mensagemProdutos.style.display = "";
    }

    renderizarPaginacao(totalPaginas);

    if (btnLimparBusca) {
      const existeBusca = Boolean(campoBusca?.value.trim());

      btnLimparBusca.hidden = !existeBusca;
      btnLimparBusca.style.display = existeBusca ? "" : "none";
    }
  }

  if (campoBusca) {
    campoBusca.addEventListener("input", () => {
      paginaAtual = 1;
      atualizarCatalogo();
    });
  }

  if (btnLimparBusca) {
    btnLimparBusca.addEventListener("click", () => {
      if (campoBusca) {
        campoBusca.value = "";
        campoBusca.focus();
      }

      paginaAtual = 1;
      atualizarCatalogo();
    });
  }

  if (filtrosCategorias) {
    filtrosCategorias.addEventListener("click", (evento) => {
      const botao = evento.target.closest("[data-categoria]");

      if (!botao || !filtrosCategorias.contains(botao)) {
        return;
      }

      categoriaSelecionada = botao.dataset.categoria || "todos";
      paginaAtual = 1;

      filtrosCategorias
        .querySelectorAll("[data-categoria]")
        .forEach((filtro) => {
          const selecionado = filtro === botao;

          filtro.classList.toggle("ativo", selecionado);

          filtro.setAttribute(
            "aria-pressed",
            String(selecionado)
          );
        });

      atualizarCatalogo();
    });
  }

  // =========================================================
  // TECLADO E ACESSIBILIDADE
  // =========================================================

  document.addEventListener("keydown", (evento) => {
    if (evento.key !== "Escape") {
      return;
    }

    if (resumoModal && !resumoModal.hidden) {
      fecharResumo();
      return;
    }

    if (areaCarrinho && !areaCarrinho.hidden) {
      fecharCarrinho();
    }
  });

  // =========================================================
  // INICIALIZAÇÃO
  // =========================================================

  if (anoAtual) {
    anoAtual.textContent = String(new Date().getFullYear());
  }

  fecharCarrinho();

  if (resumoModal) {
    resumoModal.hidden = true;
    resumoModal.style.display = "none";
  }

  atualizarCarrinho();
  atualizarCatalogo();

  console.info(
    "OdontoPro demonstrativo inicializado com sucesso."
  );
});
