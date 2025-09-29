document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('login-form');
    const errorMessage = document.getElementById('error-message');
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorMessage.textContent = '';
        
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
                
                if (user.role === 'ADMIN') {
                    window.location.href = 'admin.html';
                } else {
                    window.location.href = 'cardapio.html';
                }
            } else if (response.status === 401) {
                errorMessage.textContent = 'Username ou senha inválidos.';
            } else {
                errorMessage.textContent = 'Ocorreu um erro ao tentar fazer login.';
            }
        } catch (error) {
            errorMessage.textContent = 'Não foi possível conectar ao servidor. Tente novamente mais tarde.';
        }
    });
});