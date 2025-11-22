document.addEventListener('DOMContentLoaded', () => {
  const detalhesEl = document.getElementById('detalhes');
  const subtotalEl = document.getElementById('subtotal');
  const ajustesEl = document.getElementById('ajustes');
  const totalEl = document.getElementById('total');
  const tituloInstrucao = document.getElementById('titulo-instrucao');
  const conteudoInstrucao = document.getElementById('conteudo-instrucao');

  const loggedInUser = sessionStorage.getItem('loggedInUser');
  if (!loggedInUser) { window.location.href = 'login.html'; return; }

  const pedidoFinal = JSON.parse(sessionStorage.getItem('pedidoFinal'));
  if (!pedidoFinal) { window.location.href = 'cardapio.html'; return; }

  function formatMoney(v) { return `R$ ${v.toFixed(2)}`; }

  function desenharDetalhes() {
    const itens = [];
    itens.push({ k: 'Lanche', v: pedidoFinal.lanche.name, p: pedidoFinal.lanche.price });
    if (pedidoFinal.batata.tamanho) {
      const PRECO_BATATA = { media: 8.00, grande: 12.00 };
      const PRECO_OPCIONAIS = { cheddar: 3.00, bacon: 4.00 };
      itens.push({ k: `Batata (${pedidoFinal.batata.tamanho})`, v: '', p: PRECO_BATATA[pedidoFinal.batata.tamanho] });
      if (pedidoFinal.batata.cheddar) itens.push({ k: 'Cheddar', v: '', p: PRECO_OPCIONAIS.cheddar });
      if (pedidoFinal.batata.bacon) itens.push({ k: 'Bacon', v: '', p: PRECO_OPCIONAIS.bacon });
    }
    if (pedidoFinal.refrigerante.tipo) itens.push({ k: `Refrigerante (${pedidoFinal.refrigerante.tipo})`, v: '', p: 6.00 });
    if (Array.isArray(pedidoFinal.sobremesas) && pedidoFinal.sobremesas.length) {
      const PRECO_SOBREMESAS = { Brownie: 12.00, Sorvete: 10.00, Milkshake: 12.00 };
      pedidoFinal.sobremesas.forEach(item => {
        itens.push({ k: `Sobremesa (${item})`, v: '', p: PRECO_SOBREMESAS[item] });
      });
    }
    detalhesEl.innerHTML = itens.map(i => `<li><span>${i.k}${i.v?': '+i.v:''}</span><span>${formatMoney(i.p)}</span></li>`).join('');
    subtotalEl.textContent = formatMoney(pedidoFinal.finalizacao.subtotal);
    const linhas = [];
    if (pedidoFinal.finalizacao.desconto) linhas.push(`Desconto: - ${formatMoney(pedidoFinal.finalizacao.desconto)}`);
    if (pedidoFinal.finalizacao.taxa) linhas.push(`Taxa: + ${formatMoney(pedidoFinal.finalizacao.taxa)}`);
    ajustesEl.innerHTML = linhas.map(l => `<div>${l}</div>`).join('');
    totalEl.textContent = formatMoney(pedidoFinal.finalizacao.total);
  }

  function desenharInstrucao() {
    const opcao = pedidoFinal.finalizacao.opcao;
    if (opcao === 'cupom') {
      tituloInstrucao.textContent = 'Cupom de Desconto';
      const wrap = document.createElement('div');
      wrap.innerHTML = `<p>Apresente o QR Code abaixo no restaurante para garantir 5% de desconto.</p><p>Código: <strong>${pedidoFinal.cupom.codigo}</strong></p><div id="qrcode"></div><p class="hint">Válido apenas para consumo no salão.</p>`;
      conteudoInstrucao.appendChild(wrap);
      const qr = new QRCode(document.getElementById('qrcode'), {
        text: `Cupom Taldo Burger: ${pedidoFinal.cupom.codigo}`,
        width: 180,
        height: 180,
        colorDark: '#000000',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.M
      });
    } else if (opcao === 'retirada') {
      tituloInstrucao.textContent = 'Retirada no Local';
      conteudoInstrucao.innerHTML = `<p>Dirija-se ao balcão com seu nome e número do pedido.</p><p>Previsão de preparo: 15–20 minutos.</p>`;
    } else {
      tituloInstrucao.textContent = 'Delivery';
      conteudoInstrucao.innerHTML = `<p>Taxa de entrega de R$ 5,00 aplicada.</p><p>Previsão de entrega: 45–60 minutos.</p>`;
    }
  }

  desenharDetalhes();
  desenharInstrucao();

  sessionStorage.removeItem('pedidoPersonalizado');
  sessionStorage.removeItem('customLanche');
});
