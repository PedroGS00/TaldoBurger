document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('login-form');
    const errorMessage = document.getElementById('error-message');
    const submitBtn = form.querySelector('.btn');
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorMessage.textContent = '';
        submitBtn.classList.add('loading');
        submitBtn.setAttribute('disabled', 'true');
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        try {
            const response = await fetch('http://localhost:8080/users/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: username,
                    password: password
                }),
            });

            if (response.status === 200) {
                const user = await response.json();
                sessionStorage.setItem('loggedInUser', JSON.stringify(user));
                const nextUrl = user.role === 'ADMIN' ? 'admin.html' : 'cardapio.html';
                const nextLabel = user.role === 'ADMIN' ? 'Ir para admin' : 'Ir para cardápio';
                const modal = document.createElement('div');
                modal.id = 'login-modal';
                modal.className = 'confirm-modal show';
                modal.setAttribute('aria-hidden', 'false');
                modal.setAttribute('role', 'dialog');
                const firstName = (user.name || username).split(' ')[0];
                modal.innerHTML = `
                  <div class="confirm-backdrop" data-dismiss="login-modal"></div>
                  <div class="confirm-card">
                    <div class="confirm-status">
                      <div class="status-icon success"><i class="fas fa-user-check"></i></div>
                    </div>
                    <h3 class="confirm-title">Login realizado</h3>
                    <p class="confirm-message">Bem-vindo, ${firstName}!</p>
                    <div class="confirm-actions"><a class="btn" id="go-next-btn" href="${nextUrl}">${nextLabel}</a></div>
                    <p class="confirm-hint" id="login-hint"></p>
                    <button type="button" class="confirm-close" title="Fechar" data-dismiss="login-modal"><i class="fas fa-times"></i></button>
                  </div>
                `;
                document.body.appendChild(modal);
                let seconds = 4;
                const hint = modal.querySelector('#login-hint');
                hint.textContent = `Você será redirecionado em ${seconds}s.`;
                const countdown = setInterval(() => {
                    seconds--;
                    hint.textContent = `Você será redirecionado em ${seconds}s.`;
                    if (seconds <= 0) {
                        clearInterval(countdown);
                        document.body.classList.add('page-leave');
                        setTimeout(() => { window.location.href = nextUrl; }, 180);
                    }
                }, 1000);
                const dismissEls = modal.querySelectorAll('[data-dismiss="login-modal"]');
                dismissEls.forEach(el => el.addEventListener('click', () => {
                    modal.classList.remove('show');
                    modal.setAttribute('aria-hidden', 'true');
                }));
                const goNextBtn = document.getElementById('go-next-btn');
                if (goNextBtn) {
                    goNextBtn.addEventListener('click', (ev) => {
                        ev.preventDefault();
                        document.body.classList.add('page-leave');
                        setTimeout(() => { window.location.href = nextUrl; }, 180);
                    });
                }
            } else if (response.status === 401) {
                errorMessage.textContent = 'Username ou senha inválidos.';
            } else {
                errorMessage.textContent = 'Ocorreu um erro ao tentar fazer login.';
            }
        } catch (error) {
            errorMessage.textContent = 'Não foi possível conectar ao servidor. Tente novamente mais tarde.';
        } finally {
            submitBtn.classList.remove('loading');
            submitBtn.removeAttribute('disabled');
        }
    });
});