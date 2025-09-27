document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('login-form');
    const errorMessage = document.getElementById('error-message');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        errorMessage.textContent = '';
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const user = users.find(u => u.email === email && u.password === password);
        if (user) {
            sessionStorage.setItem('loggedInUser', JSON.stringify(user));
            window.location.href = 'cardapio.html';
        } else {
            errorMessage.textContent = 'Email ou senha inválidos.';
        }
    });
});