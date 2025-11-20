document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('register-form');
    const errorMessage = document.getElementById('error-message');
    const modal = document.getElementById('register-modal');
    const confirmMessage = document.getElementById('confirm-message');
    const confirmHint = document.getElementById('confirm-hint');
    const dismissEls = document.querySelectorAll('[data-dismiss="register-modal"]');
    const goLoginBtn = document.getElementById('go-login-btn');
    const submitBtn = registerForm.querySelector('.btn');

    registerForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const name = document.getElementById('name').value;
        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        errorMessage.textContent = '';

        try {
            submitBtn.classList.add('loading');
            submitBtn.setAttribute('disabled', 'true');
            const response = await fetch('http://localhost:8080/users/registro', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: name,
                    username: username,
                    email: email,
                    password: password
                }),
            });

            if (response.status === 201) {
                const firstName = name.split(' ')[0];
                confirmMessage.textContent = `Conta criada com sucesso, ${firstName}! Seja bem-vindo ao Taldo Burger.`;
                let seconds = 5;
                confirmHint.textContent = `Você será redirecionado em ${seconds}s ou clique em "Ir para login".`;
                modal.classList.add('show');
                modal.setAttribute('aria-hidden', 'false');
                const countdown = setInterval(() => {
                    seconds--;
                    confirmHint.textContent = `Você será redirecionado em ${seconds}s ou clique em "Ir para login".`;
                    if (seconds <= 0) {
                        clearInterval(countdown);
                        document.body.classList.add('page-leave');
                        setTimeout(() => { window.location.href = 'login.html'; }, 180);
                    }
                }, 1000);
                dismissEls.forEach(el => el.addEventListener('click', () => {
                    modal.classList.remove('show');
                    modal.setAttribute('aria-hidden', 'true');
                }));
                document.addEventListener('keyup', (e) => {
                    if (e.key === 'Escape') {
                        modal.classList.remove('show');
                        modal.setAttribute('aria-hidden', 'true');
                    }
                });
                if (goLoginBtn) {
                    goLoginBtn.addEventListener('click', (e) => {
                        e.preventDefault();
                        document.body.classList.add('page-leave');
                        setTimeout(() => { window.location.href = 'login.html'; }, 180);
                    });
                }
            } else {
                const errorData = await response.json();
                errorMessage.textContent = errorData.message || 'Ocorreu um erro ao tentar cadastrar.';
            }
        } catch (error) {
            errorMessage.textContent = 'Não foi possível conectar ao servidor. Tente novamente mais tarde.';
        }
        finally {
            submitBtn.classList.remove('loading');
            submitBtn.removeAttribute('disabled');
        }
    });
});
