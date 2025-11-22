document.addEventListener('DOMContentLoaded', () => {
  const lista = document.getElementById('lista-itens');
  const subtotalEl = document.getElementById('subtotal');
  const ajustesEl = document.getElementById('ajustes');
  const totalEl = document.getElementById('total');
  const form = document.getElementById('form-finalizacao');

  const loggedInUser = sessionStorage.getItem('loggedInUser');
  if (!loggedInUser) { window.location.href = 'login.html'; return; }

  const state = JSON.parse(sessionStorage.getItem('pedidoPersonalizado'));
  if (!state) { window.location.href = 'cardapio.html'; return; }

  function formatMoney(v) { return `R$ ${v.toFixed(2)}`; }

  function desenharItens() {
    const itens = [];
    itens.push({ k: 'Lanche', v: state.lanche.name, p: state.lanche.price });
    if (state.batata.tamanho) {
      const PRECO_BATATA = { media: 8.00, grande: 12.00 };
      const PRECO_OPCIONAIS = { cheddar: 3.00, bacon: 4.00 };
      itens.push({ k: `Batata (${state.batata.tamanho})`, v: '', p: PRECO_BATATA[state.batata.tamanho] });
      if (state.batata.cheddar) itens.push({ k: 'Cheddar', v: '', p: PRECO_OPCIONAIS.cheddar });
      if (state.batata.bacon) itens.push({ k: 'Bacon', v: '', p: PRECO_OPCIONAIS.bacon });
    }
    if (state.refrigerante.tipo) itens.push({ k: `Refrigerante (${state.refrigerante.tipo})`, v: '', p: 6.00 });
    if (Array.isArray(state.sobremesas) && state.sobremesas.length) {
      const PRECO_SOBREMESAS = { Brownie: 12.00, Sorvete: 10.00, Milkshake: 12.00 };
      state.sobremesas.forEach(item => {
        itens.push({ k: `Sobremesa (${item})`, v: '', p: PRECO_SOBREMESAS[item] });
      });
    }
    lista.innerHTML = itens.map(i => `<li><span>${i.k}${i.v?': '+i.v:''}</span><span>${formatMoney(i.p)}</span></li>`).join('');
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

  form.addEventListener('change', (ev) => {
    if (ev.target.name === 'finalizacao') { opcao = ev.target.value; recalcularTotais(); }
  });

  form.addEventListener('submit', (ev) => {
    ev.preventDefault();
    if (!opcao) { alert('Selecione uma opção de finalização.'); return; }
    const { subtotal, total } = recalcularTotais();
    const pedidoFinal = {
      ...state,
      finalizacao: { opcao, desconto, taxa, subtotal, total },
      cupom: opcao === 'cupom' ? { codigo: gerarCodigoCupom() } : null
    };
    sessionStorage.setItem('pedidoFinal', JSON.stringify(pedidoFinal));
    try {
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
      if (window.renderHeader) renderHeader();
    } catch {}
    document.body.classList.add('page-leave');
    setTimeout(() => { window.location.href = 'confirmacao.html'; }, 180);
  });

  function gerarCodigoCupom() {
    const base = 'TALDO5';
    const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${base}-${rand}`;
  }

  desenharItens();
  recalcularTotais();
});
