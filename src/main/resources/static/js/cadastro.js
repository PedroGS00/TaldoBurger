document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('register-form');
    const errorMessage = document.getElementById('error-message');

    registerForm.addEventListener('submit', async (event) => {
        // Impede que o formulário recarregue a página
        event.preventDefault();

        // Pega os valores dos campos do formulário
        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        // Limpa mensagens de erro antigas
        errorMessage.textContent = '';

        try {
            // Envia a requisição para a API
            const response = await fetch('http://localhost:8080/users/registro', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: username,
                    email: email,
                    password: password
                }),
            });

            if (response.status === 201) {
                // Se o cadastro for bem-sucedido
                alert('Cadastro realizado com sucesso! Você será redirecionado para o login.');
                window.location.href = 'login.html';
            } else {
                // Se houver algum erro retornado pela API
                const errorData = await response.json();
                errorMessage.textContent = errorData.message || 'Ocorreu um erro ao tentar cadastrar.';
            }
        } catch (error) {
            // Se houver um erro de rede
            errorMessage.textContent = 'Não foi possível conectar ao servidor. Tente novamente mais tarde.';
        }
    });
});