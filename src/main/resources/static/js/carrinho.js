document.addEventListener('DOMContentLoaded', () => {
    const cartItemsContainer = document.getElementById('cart-items-container');
    const cartTotalValue = document.getElementById('cart-total-value');
    const checkoutBtn = document.getElementById('checkout-btn');
    const cartEmptyMessage = document.getElementById('cart-empty-message');
    let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
    function salvarCarrinho() {
        localStorage.setItem('carrinho', JSON.stringify(carrinho));
        renderizarCarrinho();
        if (window.renderHeader) {
            renderHeader();
        }
    }
    function renderizarCarrinho() {
        cartItemsContainer.innerHTML = '';
        if (carrinho.length === 0) {
            if(cartEmptyMessage) {
                cartEmptyMessage.style.display = 'block';
                cartItemsContainer.appendChild(cartEmptyMessage);
            }
        } else {
            if(cartEmptyMessage) cartEmptyMessage.style.display = 'none';
            carrinho.forEach(item => {
                const cartItemElement = document.createElement('div');
                cartItemElement.classList.add('cart-item');
                cartItemElement.innerHTML = `
                    <div class="cart-item-details">
                        <h4>${item.name} (x${item.quantity})</h4>
                        <p>Preço: R$ ${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                    <button class="remove-from-cart-btn" data-name="${item.name}">Remover</button>
                `;
                cartItemsContainer.appendChild(cartItemElement);
            });
        }
        cartTotalValue.textContent = calcularTotal().toFixed(2);
    }
    function calcularTotal() {
        return carrinho.reduce((total, item) => total + (item.price * item.quantity), 0);
    }
    function removerDoCarrinho(name) {
        carrinho = carrinho.filter(item => item.name !== name);
        salvarCarrinho();
    }
    cartItemsContainer.addEventListener('click', (event) => {
        if (event.target.classList.contains('remove-from-cart-btn')) {
            const name = event.target.dataset.name;
            removerDoCarrinho(name);
        }
    });
    checkoutBtn.addEventListener('click', () => {
        if (carrinho.length === 0) {
            alert('Seu carrinho está vazio!');
            return;
        }
        sessionStorage.setItem('checkoutFromCart', 'true');
        document.body.classList.add('page-leave');
        setTimeout(() => { window.location.href = 'resumo.html'; }, 180);
    });
    renderizarCarrinho();
});
