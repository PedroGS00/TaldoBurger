function renderHeader() {
    const header = document.querySelector('.header');
    if (!header) return;

    const loggedInUser = JSON.parse(sessionStorage.getItem('loggedInUser'));

    let headerContent = `<div class="container"><a href="index.html" class="logo">Taldo Burger</a><nav><ul>`;

    if (loggedInUser) {
        // --- USUÁRIO LOGADO ---
        headerContent += `
            <li><a href="index.html">Início</a></li>
            <li><a href="cardapio.html">Cardápio</a></li>`;

        // Se o email do usuário for o de admin, mostra o link especial
        if (loggedInUser.email === 'admin@taldoburger.com') {
            headerContent += `<li><a href="admin.html" style="color: var(--color-accent); font-weight: bold;">Admin</a></li>`;
        }

        headerContent += `
            <li class="welcome-user">Olá, ${loggedInUser.name}</li>
            <li><a href="#" id="logout-link" class="logout-link">Sair</a></li>
            <li><a href="carrinho.html" class="cart-icon"><i class="fas fa-shopping-cart"></i><span id="cart-counter" class="cart-counter">0</span></a></li>`;

    } else {
        // --- USUÁRIO DESLOGADO ---
        headerContent += `
            <li><a href="index.html">Início</a></li>
            <li><a href="cardapio.html">Cardápio</a></li>
            <li><a href="login.html">Login</a></li>
            <li><a href="cadastro.html" class="btn">Cadastre-se</a></li>`;
    }

    headerContent += `</ul></nav></div>`;
    header.innerHTML = headerContent;

    const logoutLink = document.getElementById('logout-link');
    if (logoutLink) {
        logoutLink.addEventListener('click', (e) => {
            e.preventDefault();
            sessionStorage.removeItem('loggedInUser');
            localStorage.removeItem('carrinho');
            alert('Você saiu da sua conta.');
            window.location.href = 'index.html';
        });
    }

    const cartCounter = document.getElementById('cart-counter');
    if (cartCounter) {
        const carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
        const totalItems = carrinho.reduce((sum, item) => sum + item.quantity, 0);
        cartCounter.textContent = totalItems;
    }
}
document.addEventListener('DOMContentLoaded', renderHeader);