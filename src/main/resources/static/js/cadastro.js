document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('register-form');
    const errorMessage = document.getElementById('error-message');

    registerForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const name = document.getElementById('name').value;
        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        errorMessage.textContent = '';

        try {
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
                alert('Cadastro realizado com sucesso! Você será redirecionado para o login.');
                window.location.href = 'login.html';
            } else {
                const errorData = await response.json();
                errorMessage.textContent = errorData.message || 'Ocorreu um erro ao tentar cadastrar.';
            }
        } catch (error) {
            errorMessage.textContent = 'Não foi possível conectar ao servidor. Tente novamente mais tarde.';
        }
    });
});
