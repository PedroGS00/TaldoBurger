function renderHeader() {
    const header = document.querySelector('.header');
    if (!header) return;

    const loggedInUser = JSON.parse(sessionStorage.getItem('loggedInUser'));

    let headerContent = `<div class="container"><a href="index.html" class="logo"><img src="img/logo.png" alt="Taldo Burger Logo" style="height: 3.5rem; margin-right: 15px; vertical-align: middle;">Taldo Burger</a><nav><ul>`;

    if (loggedInUser) {
        headerContent += `
            <li><a href="index.html">Início</a></li>
            <li><a href="cardapio.html">Cardápio</a></li>`;

        if (loggedInUser.role === 'ADMIN') {
            headerContent += `<li><a href="admin.html" style="color: var(--color-accent); font-weight: bold;">Admin</a></li>`;
        }

        if (loggedInUser.role !== 'ADMIN') {
            headerContent += `<li class="welcome-user">Olá, ${loggedInUser.name}</li>`;
        }

        headerContent += `
            <li><a href="#" id="logout-link" class="logout-link">Sair</a></li>
            <li><a href="carrinho.html" class="cart-icon"><i class="fas fa-shopping-cart"></i><span id="cart-counter" class="cart-counter">0</span></a></li>`;

    } else {
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
            const modal = document.createElement('div');
            modal.id = 'logout-modal';
            modal.className = 'confirm-modal show';
            modal.setAttribute('aria-hidden', 'false');
            modal.setAttribute('role', 'dialog');
            modal.innerHTML = `
              <div class="confirm-backdrop" data-dismiss="logout-modal"></div>
              <div class="confirm-card">
                <div class="confirm-status">
                  <div class="status-icon success"><i class="fas fa-sign-out-alt"></i></div>
                </div>
                <h3 class="confirm-title">Sessão encerrada</h3>
                <p class="confirm-message">Você saiu da sua conta.</p>
                <div class="confirm-actions"><a class="btn" id="go-home-btn" href="index.html">Ir para início</a></div>
                <p class="confirm-hint" id="logout-hint"></p>
                <button type="button" class="confirm-close" title="Fechar" data-dismiss="logout-modal"><i class="fas fa-times"></i></button>
              </div>
            `;
            document.body.appendChild(modal);
            let seconds = 4;
            const hint = modal.querySelector('#logout-hint');
            hint.textContent = `Você será redirecionado em ${seconds}s.`;
            const countdown = setInterval(() => {
                seconds--;
                hint.textContent = `Você será redirecionado em ${seconds}s.`;
                if (seconds <= 0) {
                    clearInterval(countdown);
                    document.body.classList.add('page-leave');
                    setTimeout(() => { window.location.href = 'index.html'; }, 180);
                }
            }, 1000);
            const dismissEls = modal.querySelectorAll('[data-dismiss="logout-modal"]');
            dismissEls.forEach(el => el.addEventListener('click', () => {
                modal.classList.remove('show');
                modal.setAttribute('aria-hidden', 'true');
            }));
            const goHomeBtn = document.getElementById('go-home-btn');
            if (goHomeBtn) {
                goHomeBtn.addEventListener('click', (ev) => {
                    ev.preventDefault();
                    document.body.classList.add('page-leave');
                    setTimeout(() => { window.location.href = 'index.html'; }, 180);
                });
            }
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