document.addEventListener('DOMContentLoaded', () => {
  const baseEl = document.getElementById('pedido-base');
  const form = document.getElementById('form-customizacao');
  const resumoParcial = document.getElementById('resumo-parcial');
  const subtotalEl = document.getElementById('subtotal');

  const loggedInUser = sessionStorage.getItem('loggedInUser');
  if (!loggedInUser) {
    const modal = document.createElement('div');
    modal.className = 'confirm-modal show';
    modal.setAttribute('aria-hidden', 'false');
    modal.setAttribute('role', 'dialog');
    modal.innerHTML = `
      <div class="confirm-backdrop" data-dismiss="login-required"></div>
      <div class="confirm-card">
        <div class="confirm-status"><div class="status-icon success"><i class="fas fa-user-lock"></i></div></div>
        <h3 class="confirm-title">Faça login para continuar</h3>
        <p class="confirm-message">Você precisa estar logado para personalizar seu pedido.</p>
        <div class="confirm-actions"><a class="btn" id="go-login-btn" href="login.html">Ir para login</a></div>
        <button type="button" class="confirm-close" title="Fechar" data-dismiss="login-required"><i class="fas fa-times"></i></button>
      </div>`;
    document.body.appendChild(modal);
    const dismissEls = modal.querySelectorAll('[data-dismiss="login-required"]');
    dismissEls.forEach(el => el.addEventListener('click', () => {
      modal.classList.remove('show');
      modal.setAttribute('aria-hidden', 'true');
      setTimeout(() => modal.remove(), 150);
    }));
    const goBtn = document.getElementById('go-login-btn');
    if (goBtn) {
      goBtn.addEventListener('click', (ev) => {
        ev.preventDefault();
        document.body.classList.add('page-leave');
        setTimeout(() => { window.location.href = 'login.html'; }, 180);
      });
    }
    return;
  }

  const base = JSON.parse(sessionStorage.getItem('customLanche'));
  if (!base) {
    window.location.href = 'cardapio.html';
    return;
  }

  const PRECO_BATATA = { media: 8.00, grande: 12.00 };
  const PRECO_OPCIONAIS = { cheddar: 3.00, bacon: 4.00 };
  const PRECO_REFRIGERANTE = 6.00;
  const PRECO_SOBREMESAS = { Brownie: 12.00, Sorvete: 10.00, Milkshake: 12.00 };

  const state = JSON.parse(sessionStorage.getItem('pedidoPersonalizado')) || {
    lanche: { name: base.name, price: base.price },
    batata: { tamanho: null, cheddar: false, bacon: false },
    refrigerante: { tipo: null },
    sobremesas: [],
    subtotal: 0
  };
  state.lanche = { name: base.name, price: base.price };
  sessionStorage.setItem('pedidoPersonalizado', JSON.stringify(state));

  function renderBaseInfo() {
    const LANCHES_INFO = {
      'Taldo Classic': { img: 'img/taldo_classic.png', desc: 'Hambúrguer clássico com queijo, alface, tomate e molho especial.' },
      'Taldo Cheddar': { img: 'img/taldo_cheddar.png', desc: 'Hambúrguer com cheddar derretido e cebola caramelizada.' },
      'Taldo Bacon': { img: 'img/taldo_bacon.png', desc: 'Hambúrguer suculento com fatias crocantes de bacon.' },
      'Taldo Chicken': { img: 'img/taldo_chicken.png', desc: 'Sanduíche de frango empanado com maionese de ervas.' },
      'Taldo Veggie': { img: 'img/taldo_veggie.png', desc: 'Opção vegetariana com blend de legumes e molho leve.' },
      'Taldo Double': { img: 'img/taldo_double.png', desc: 'Dois hambúrgueres, queijo duplo e muito sabor.' },
      'Taldo Special': { img: 'img/taldo_special.png', desc: 'Receita especial da casa com toque picante.' },
      'Taldo Onion': { img: 'img/taldo_onion.png', desc: 'Hambúrguer com onion rings crocantes e molho barbecue.' },
      'Taldo Cogu': { img: 'img/taldo_cogu.png', desc: 'Blend com cogumelos salteados e queijo especial.' },
      'Taldo Kids': { img: 'img/taldo_kids.png', desc: 'Versão kids com porção ideal e sabor equilibrado.' },
      'Taldo Jalapeño': { img: 'img/taldo_jalapeño.png', desc: 'Apimentado com jalapeño e queijo suave.' },
    };
    const info = LANCHES_INFO[state.lanche.name] || { img: 'img/logo.png', desc: 'Lanche selecionado com ingredientes frescos e preparados na hora.' };
    baseEl.innerHTML = `
      <div class="base-info">
        <img src="${info.img}" alt="${state.lanche.name}" loading="lazy" decoding="async" width="140" height="140">
        <div class="base-text">
          <h3>${state.lanche.name}</h3>
          <p>Preço base do lanche: <strong>R$ ${state.lanche.price.toFixed(2)}</strong></p>
          <p class="lanche-desc">${info.desc}</p>
        </div>
      </div>`;
  }
  renderBaseInfo();

  const batataRadios = document.querySelectorAll('input[name="batata-tamanho"]');
  const batataCheddar = document.getElementById('batata-cheddar');
  const batataBacon = document.getElementById('batata-bacon');
  const batataOptions = document.querySelectorAll('.option-with-image');
  const batataFeedback = document.getElementById('batata-feedback');
  const refriCards = document.querySelectorAll('.refri-card');
  const refriFeedback = document.getElementById('refrigerante-feedback');
  const dessertCards = document.querySelectorAll('.dessert-card');

  function aplicarStateNoForm() {
    if (state.batata.tamanho) {
      [...batataRadios].find(r => r.value === state.batata.tamanho)?.setAttribute('checked', 'checked');
    }
    batataCheddar.checked = !!state.batata.cheddar;
    batataBacon.checked = !!state.batata.bacon;
    updateRefriUI();
    updateDessertsUI();
    
    updateBatataUI();
  }

  function salvarState() {
    sessionStorage.setItem('pedidoPersonalizado', JSON.stringify(state));
  }

  function formatMoney(v) {
    return `R$ ${v.toFixed(2)}`;
  }

  function calcular() {
    const itens = [];
    let total = 0;
    itens.push({ k: 'Lanche', v: state.lanche.name, p: state.lanche.price });
    total += state.lanche.price;

    if (state.batata.tamanho) {
      const p = PRECO_BATATA[state.batata.tamanho];
      itens.push({ k: `Batata (${state.batata.tamanho})`, v: '', p });
      total += p;
      if (state.batata.cheddar) { itens.push({ k: 'Cheddar', v: '', p: PRECO_OPCIONAIS.cheddar }); total += PRECO_OPCIONAIS.cheddar; }
      if (state.batata.bacon) { itens.push({ k: 'Bacon', v: '', p: PRECO_OPCIONAIS.bacon }); total += PRECO_OPCIONAIS.bacon; }
    }

    if (state.refrigerante.tipo) {
      itens.push({ k: `Refrigerante (${state.refrigerante.tipo})`, v: '', p: PRECO_REFRIGERANTE });
      total += PRECO_REFRIGERANTE;
    }

    if (state.sobremesas.length) {
      state.sobremesas.forEach(item => {
        const p = PRECO_SOBREMESAS[item];
        itens.push({ k: `Sobremesa (${item})`, v: '', p });
        total += p;
      });
    }

    resumoParcial.innerHTML = itens.map(i => `<li><span>${i.k}${i.v?': '+i.v:''}</span><span>${formatMoney(i.p)}</span></li>`).join('');
    state.subtotal = total;
    subtotalEl.textContent = formatMoney(total);
    salvarState();
  }

  function updateRefriUI() {
    const selectedType = state.refrigerante.tipo;
    refriCards.forEach(card => {
      const isSelected = !!selectedType && card.dataset.refri === selectedType;
      card.classList.toggle('selected', isSelected);
      const existingBtn = card.querySelector('.remove-item');
      if (isSelected && !existingBtn) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'remove-item';
        btn.setAttribute('aria-label', 'Remover refrigerante');
        btn.innerHTML = '<i class="fas fa-trash-alt" aria-hidden="true"></i>';
        btn.addEventListener('click', (ev) => {
          ev.preventDefault(); ev.stopPropagation();
          state.refrigerante.tipo = null;
          updateRefriUI();
          calcular();
          showRefriFeedback('Refrigerante removido do pedido');
        });
        card.appendChild(btn);
      } else if (!isSelected && existingBtn) {
        existingBtn.remove();
      }
    });
  }

  function updateBatataUI() {
    batataOptions.forEach(label => label.classList.remove('selected'));
    const selected = [...batataRadios].find(r => r.checked)?.closest('.option-with-image');
    if (selected) selected.classList.add('selected');
    const enabled = !!state.batata.tamanho;
    batataCheddar.disabled = !enabled;
    batataBacon.disabled = !enabled;
    batataCheddar.parentElement.style.opacity = enabled ? '' : '.6';
    batataBacon.parentElement.style.opacity = enabled ? '' : '.6';
  }

  batataRadios.forEach(r => r.addEventListener('change', () => { state.batata.tamanho = r.value; updateBatataUI(); calcular(); }));
  batataCheddar.addEventListener('change', () => { state.batata.cheddar = batataCheddar.checked; calcular(); });
  batataBacon.addEventListener('change', () => { state.batata.bacon = batataBacon.checked; calcular(); });
  refriCards.forEach(card => {
    const type = card.dataset.refri;
    card.addEventListener('click', () => {
      state.refrigerante.tipo = (state.refrigerante.tipo === type) ? null : type;
      updateRefriUI();
      calcular();
      if (!state.refrigerante.tipo) showRefriFeedback('Refrigerante removido do pedido');
    });
    card.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); card.click(); }
    });
    const removeBtn = card.querySelector('.remove-item');
    if (removeBtn) {
      removeBtn.addEventListener('click', (ev) => {
        ev.preventDefault(); ev.stopPropagation();
        state.refrigerante.tipo = null;
        updateRefriUI();
        calcular();
        showRefriFeedback('Refrigerante removido do pedido');
      });
    }
  });
  function updateDessertsUI() {
    dessertCards.forEach(card => {
      const type = card.dataset.dessert;
      const selected = state.sobremesas.includes(type);
      card.classList.toggle('selected', selected);
      const checkbox = card.querySelector('input[type="checkbox"]');
      if (checkbox) checkbox.checked = selected;
    });
  }
  dessertCards.forEach(card => {
    const type = card.dataset.dessert;
    const checkbox = card.querySelector('input[type="checkbox"]');
    const toggle = () => {
      const idx = state.sobremesas.indexOf(type);
      if (idx >= 0) state.sobremesas.splice(idx, 1); else state.sobremesas.push(type);
      updateDessertsUI();
      calcular();
    };
    card.addEventListener('click', (ev) => { if (ev.target.tagName !== 'INPUT') toggle(); });
    card.addEventListener('keydown', (ev) => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); toggle(); } });
    if (checkbox) checkbox.addEventListener('change', toggle);
  });


  batataOptions.forEach(label => {
    const btn = label.querySelector('.remove-batata');
    if (btn) {
      btn.addEventListener('click', (ev) => {
        ev.preventDefault();
        state.batata.tamanho = null;
        state.batata.cheddar = false;
        state.batata.bacon = false;
        batataRadios.forEach(r => { r.checked = false; r.removeAttribute('checked'); });
        batataCheddar.checked = false;
        batataBacon.checked = false;
        updateBatataUI();
        calcular();
        showBatataFeedback('Batata removida do pedido');
      });
    }
  });

  function showBatataFeedback(msg) {
    if (!batataFeedback) return;
    batataFeedback.textContent = msg;
    batataFeedback.classList.add('show');
    setTimeout(() => { batataFeedback.classList.remove('show'); batataFeedback.textContent = ''; }, 1600);
  }

  function showRefriFeedback(msg) {
    if (!refriFeedback) return;
    refriFeedback.textContent = msg;
    refriFeedback.classList.add('show');
    setTimeout(() => { refriFeedback.classList.remove('show'); refriFeedback.textContent = ''; }, 1600);
  }

  form.addEventListener('submit', (ev) => {
    ev.preventDefault();
    const erros = [];
    if (!state.lanche || !state.lanche.name || typeof state.lanche.price !== 'number') {
      erros.push('Selecione um lanche válido.');
    }
    if (erros.length) { alert(erros.join('\n')); return; }
    document.body.classList.add('page-leave');
    setTimeout(() => { window.location.href = 'resumo.html'; }, 180);
  });

  aplicarStateNoForm();
  calcular();
});
