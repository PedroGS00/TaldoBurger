document.addEventListener('DOMContentLoaded', () => {

    const cartCounter = document.getElementById('cart-counter');

    function atualizarContador() {
        const carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
        const totalItems = carrinho.reduce((sum, item) => sum + item.quantity, 0);
        if (cartCounter) {
            cartCounter.textContent = totalItems;
        }
    }

    atualizarContador();
});