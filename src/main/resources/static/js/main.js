document.addEventListener('DOMContentLoaded', () => {

    const cartCounter = document.getElementById('cart-counter');

    // Função para ler o carrinho do localStorage e atualizar o contador
    function atualizarContador() {
        const carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
        const totalItems = carrinho.reduce((sum, item) => sum + item.quantity, 0);
        cartCounter.textContent = totalItems;
    }

    // Atualiza o contador assim que a página carrega
    atualizarContador();
});