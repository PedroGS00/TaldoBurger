document.addEventListener('DOMContentLoaded', () => {
  const lista = document.getElementById('lista-itens');
  const subtotalEl = document.getElementById('subtotal');
  const ajustesEl = document.getElementById('ajustes');
  const totalEl = document.getElementById('total');
  const form = document.getElementById('form-finalizacao');
  const addToCartBtn = document.getElementById('add-to-cart-btn');

  const loggedInUser = sessionStorage.getItem('loggedInUser');
  if (!loggedInUser) { window.location.href = 'login.html'; return; }

  let state = JSON.parse(sessionStorage.getItem('pedidoPersonalizado'));
  let renderFromCart = false;
  if (!state) {
    const carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
    if (!carrinho.length) { window.location.href = 'cardapio.html'; return; }
    const subtotalCarrinho = carrinho.reduce((t,i)=>t + (i.price * i.quantity), 0);
    state = { lanche: { name: 'Itens do Carrinho', price: subtotalCarrinho }, batata: { tamanho: null, cheddar: false, bacon: false }, refrigerante: { tipo: null }, sobremesas: [], subtotal: subtotalCarrinho };
    renderFromCart = true;
  }

  function formatMoney(v) { return `R$ ${v.toFixed(2)}`; }

  function desenharItens() {
    const itens = [];
    if (!renderFromCart) {
      itens.push({ k: 'Lanche', v: state.lanche.name, p: state.lanche.price });
    }
    if (state.batata.tamanho) {
      const PRECO_BATATA = { media: 8.00, grande: 12.00 };
      const PRECO_OPCIONAIS = { cheddar: 3.00, bacon: 4.00 };
      itens.push({ k: `Batata (${state.batata.tamanho})`, v: '', p: PRECO_BATATA[state.batata.tamanho] });
      if (state.batata.cheddar) itens.push({ k: 'Cheddar', v: '', p: PRECO_OPCIONAIS.cheddar });
      if (state.batata.bacon) itens.push({ k: 'Bacon', v: '', p: PRECO_OPCIONAIS.bacon });
    }
    if (state.refrigerante.tipo) itens.push({ k: `Refrigerante (${state.refrigerante.tipo})`, v: '', p: 6.00 });
    if (!renderFromCart && Array.isArray(state.sobremesas) && state.sobremesas.length) {
      const PRECO_SOBREMESAS = { Brownie: 12.00, Sorvete: 10.00, Milkshake: 12.00 };
      state.sobremesas.forEach(item => {
        itens.push({ k: `Sobremesa (${item})`, v: '', p: PRECO_SOBREMESAS[item] });
      });
    }
    if (renderFromCart) {
      const carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
      const linhas = carrinho.map(i => ({ k: i.name, v: `x${i.quantity}`, p: i.price * i.quantity }));
      lista.innerHTML = linhas.map(i => `<li><span>${i.k}${i.v?': '+i.v:''}</span><span>${formatMoney(i.p)}</span></li>`).join('');
    } else {
      lista.innerHTML = itens.map(i => `<li><span>${i.k}${i.v?': '+i.v:''}</span><span>${formatMoney(i.p)}</span></li>`).join('');
    }
    subtotalEl.textContent = formatMoney(state.subtotal || 0);
  }

  let opcao = null;
  let desconto = 0;
  let taxa = 0;

  function recalcularTotais() {
    const subtotal = state.subtotal || 0;
    let total = subtotal;
    const linhas = [];
    if (opcao === 'cupom') { desconto = +(subtotal * 0.05).toFixed(2); linhas.push(`Desconto cupom: - ${formatMoney(desconto)}`); total -= desconto; taxa = 0; }
    else if (opcao === 'delivery') { taxa = 5.00; linhas.push(`Taxa de entrega: + ${formatMoney(taxa)}`); total += taxa; desconto = 0; }
    else { desconto = 0; taxa = 0; }
    ajustesEl.innerHTML = linhas.map(l => `<div>${l}</div>`).join('');
    totalEl.textContent = formatMoney(total);
    return { subtotal, total };
  }

  function showModal({ title, message, icon }) {
    const modal = document.createElement('div');
    modal.className = 'confirm-modal show';
    modal.setAttribute('aria-hidden', 'false');
    modal.setAttribute('role', 'dialog');
    modal.innerHTML = `
      <div class="confirm-backdrop" data-dismiss="confirm-modal"></div>
      <div class="confirm-card">
        <div class="confirm-status"><div class="status-icon success"><i class="${icon}"></i></div></div>
        <h3 class="confirm-title">${title}</h3>
        <p class="confirm-message">${message}</p>
        <div class="confirm-actions"><button class="btn" data-dismiss="confirm-modal">OK</button></div>
        <button type="button" class="confirm-close" title="Fechar" data-dismiss="confirm-modal"><i class="fas fa-times"></i></button>
      </div>`;
    document.body.appendChild(modal);
    const dismissEls = modal.querySelectorAll('[data-dismiss="confirm-modal"]');
    dismissEls.forEach(el => el.addEventListener('click', () => {
      modal.classList.remove('show');
      modal.setAttribute('aria-hidden', 'true');
      setTimeout(() => modal.remove(), 150);
    }));
    document.addEventListener('keyup', (e) => { if (e.key === 'Escape') { modal.classList.remove('show'); modal.setAttribute('aria-hidden', 'true'); setTimeout(() => modal.remove(), 150); } }, { once: true });
  }

  function animateToCart(fromEl) {
    const cart = document.querySelector('.cart-icon');
    if (!cart) { document.body.classList.add('page-leave'); setTimeout(() => { window.location.href = 'cardapio.html'; }, 180); return; }
    const s = fromEl.getBoundingClientRect();
    const c = cart.getBoundingClientRect();
    const fly = document.createElement('div');
    fly.className = 'fly-to-cart';
    fly.style.left = `${s.left + s.width / 2 - 10}px`;
    fly.style.top = `${s.top + window.scrollY + s.height / 2 - 10}px`;
    document.body.appendChild(fly);
    requestAnimationFrame(() => {
      const dx = c.left + c.width / 2 - (s.left + s.width / 2);
      const dy = c.top + window.scrollY + c.height / 2 - (s.top + window.scrollY + s.height / 2);
      fly.style.transform = `translate(${dx}px, ${dy}px) scale(.4)`;
      fly.style.opacity = '0';
    });
    setTimeout(() => {
      fly.remove();
      document.body.classList.add('page-leave');
      setTimeout(() => { window.location.href = 'cardapio.html'; }, 180);
    }, 650);
  }

  if (addToCartBtn) {
    addToCartBtn.addEventListener('click', () => {
      try {
        addToCartBtn.classList.add('loading');
        addToCartBtn.setAttribute('disabled', 'true');
        const pedidosSalvos = JSON.parse(localStorage.getItem('pedidosSalvos')) || [];
        const pedido = { ...state, savedAt: new Date().toISOString() };
        pedidosSalvos.push(pedido);
        localStorage.setItem('pedidosSalvos', JSON.stringify(pedidosSalvos));
        const partes = [];
        partes.push(state.lanche.name);
        if (state.batata.tamanho) partes.push(`Batata ${state.batata.tamanho}`);
        if (state.refrigerante.tipo) partes.push(`Refri ${state.refrigerante.tipo}`);
        if (Array.isArray(state.sobremesas) && state.sobremesas.length) partes.push(`Sobremesas: ${state.sobremesas.join(', ')}`);
        const nomeItem = partes.join(' + ');
        const carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
        const price = state.subtotal || 0;
        const existente = carrinho.find(i => i.name === nomeItem && i.price === price);
        if (existente) existente.quantity += 1; else carrinho.push({ name: nomeItem, price, quantity: 1 });
        localStorage.setItem('carrinho', JSON.stringify(carrinho));
        if (window.renderHeader) renderHeader();
        animateToCart(addToCartBtn);
      } catch (e) {
        showModal({ title: 'Erro ao adicionar', message: 'Não foi possível adicionar ao carrinho.', icon: 'fas fa-circle-exclamation' });
        addToCartBtn.classList.remove('loading');
        addToCartBtn.removeAttribute('disabled');
      }
    });
  }

  form.addEventListener('change', (ev) => {
    if (ev.target.name === 'finalizacao') { opcao = ev.target.value; recalcularTotais(); }
  });

  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    if (!opcao) { alert('Selecione uma opção de finalização.'); return; }
    const submitBtn = form.querySelector('.btn[type="submit"]') || form.querySelector('.btn');
    if (submitBtn) { submitBtn.classList.add('loading'); submitBtn.setAttribute('disabled', 'true'); }
    const { subtotal, total } = recalcularTotais();
    const pedidoFinal = {
      ...state,
      finalizacao: { opcao, desconto, taxa, subtotal, total },
      cupom: opcao === 'cupom' ? { codigo: gerarCodigoCupom() } : null
    };
    sessionStorage.setItem('pedidoFinal', JSON.stringify(pedidoFinal));
    const loggedUser = JSON.parse(sessionStorage.getItem('loggedInUser')) || {};
    const payload = {
      username: loggedUser.username || null,
      name: loggedUser.name || null,
      pedido: pedidoFinal
    };
    const prevCarrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
    try {
      const resp = await fetch('http://localhost:8080/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!resp.ok) throw new Error('Falha ao processar pedido');
      const partes = [];
      partes.push(state.lanche.name);
      if (state.batata.tamanho) partes.push(`Batata ${state.batata.tamanho}`);
      if (state.refrigerante.tipo) partes.push(`Refri ${state.refrigerante.tipo}`);
      if (Array.isArray(state.sobremesas) && state.sobremesas.length) partes.push(`Sobremesas: ${state.sobremesas.join(', ')}`);
      const nomeItem = partes.join(' + ');
      const carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
      const existente = carrinho.find(i => i.name === nomeItem && i.price === total);
      if (existente) existente.quantity += 1; else carrinho.push({ name: nomeItem, price: total, quantity: 1 });
      localStorage.setItem('carrinho', JSON.stringify(carrinho));
      localStorage.removeItem('carrinho');
      if (window.renderHeader) renderHeader();
      showModal({ title: 'Pedido confirmado', message: 'Seu pedido foi finalizado com sucesso!', icon: 'fas fa-check-circle' });
      setTimeout(() => {
        document.body.classList.add('page-leave');
        setTimeout(() => { window.location.href = 'confirmacao.html'; }, 200);
      }, 800);
    } catch (err) {
      localStorage.setItem('carrinho', JSON.stringify(prevCarrinho));
      showModal({ title: 'Falha na finalização', message: 'Não foi possível concluir seu pedido. Tente novamente.', icon: 'fas fa-triangle-exclamation' });
      if (submitBtn) { submitBtn.classList.remove('loading'); submitBtn.removeAttribute('disabled'); }
    }
  });

  function gerarCodigoCupom() {
    const base = 'TALDO5';
    const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${base}-${rand}`;
  }

  desenharItens();
  recalcularTotais();
});
