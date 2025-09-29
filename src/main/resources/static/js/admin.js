document.addEventListener('DOMContentLoaded', () => {
    const productForm = document.getElementById('product-form');
    const productTableBody = document.querySelector('#product-table tbody');
    const productIdInput = document.getElementById('productId');
    const cancelBtn = document.getElementById('cancel-btn');
    const formTitle = document.getElementById('form-title');

    const userForm = document.getElementById('user-form');
    const userTableBody = document.querySelector('#user-table tbody');
    const userIdInput = document.getElementById('userId');
    const userCancelBtn = document.getElementById('user-cancel-btn');
    const userFormTitle = document.getElementById('user-form-title');

    const loggedInUser = JSON.parse(sessionStorage.getItem('loggedInUser'));
    if (!loggedInUser || loggedInUser.role !== 'ADMIN') {
        alert('Acesso negado. Esta área é apenas para administradores.');
        window.location.href = 'index.html';
        return;
    }

    let products = JSON.parse(localStorage.getItem('products')) || [];
    let users = [];

    async function loadUsers() {
        try {
            const response = await fetch('http://localhost:8080/users');
            if (response.ok) {
                users = await response.json();
                renderUsers();
            } else {
                console.error('Erro ao carregar usuários:', response.status);
            }
        } catch (error) {
            console.error('Erro ao conectar com a API:', error);
        }
    }

    function saveProducts() {
        localStorage.setItem('products', JSON.stringify(products));
    }

    function saveUsers() {
        localStorage.setItem('users', JSON.stringify(users));
    }

    function renderProducts() {
        productTableBody.innerHTML = '';
        products.forEach(product => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${product.name}</td>
                <td>R$ ${product.price.toFixed(2)}</td>
                <td class="action-buttons">
                    <button class="edit-btn" data-id="${product.id}">Editar</button>
                    <button class="delete-btn product-delete-btn" data-id="${product.id}">Excluir</button>
                </td>
            `;
            productTableBody.appendChild(tr);
        });
    }

    function renderUsers() {
        userTableBody.innerHTML = '';
        users.forEach(user => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td>
                    <select class="role-select" data-id="${user.id}">
                        <option value="USER" ${user.role === 'USER' ? 'selected' : ''}>Cliente</option>
                        <option value="ADMIN" ${user.role === 'ADMIN' ? 'selected' : ''}>Admin</option>
                    </select>
                </td>
                <td class="action-buttons">
                    <button class="edit-btn user-edit-btn" data-id="${user.id}">Editar</button>
                    <button class="delete-btn user-delete-btn" data-id="${user.id}">Excluir</button>
                </td>
            `;
            userTableBody.appendChild(tr);
        });
    }

    // Event listener para o formulário de usuários
    userForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = parseInt(userIdInput.value);
        const userData = {
            name: document.getElementById('userName').value,
            username: document.getElementById('userUsername').value,
            email: document.getElementById('userEmail').value,
            password: document.getElementById('userPassword').value,
            role: document.getElementById('userRole').value
        };

        try {
            let response;
            if (id) {
                response = await fetch(`http://localhost:8080/users/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(userData)
                });
            } else {
                // Criar novo usuário
                response = await fetch('http://localhost:8080/users/create', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(userData)
                });
            }

            if (response.ok) {
                alert(id ? 'Usuário atualizado com sucesso!' : 'Usuário criado com sucesso!');
                resetUserForm();
                loadUsers(); // Recarrega a lista de usuários
            } else {
                const errorText = await response.text();
                alert('Erro ao salvar usuário: ' + errorText);
            }
        } catch (error) {
            alert('Erro ao conectar com o servidor: ' + error.message);
        }
    });

    productForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = parseInt(productIdInput.value);
        const newProductData = {
            id: id || Date.now(),
            name: document.getElementById('name').value,
            description: document.getElementById('description').value,
            price: parseFloat(document.getElementById('price').value),
            imageUrl: document.getElementById('imageUrl').value,
        };
        if (id) {
            products = products.map(p => p.id === id ? newProductData : p);
        } else {
            products.push(newProductData);
        }
        saveProducts();
        renderProducts();
        resetForm();
    });

    productTableBody.addEventListener('click', (e) => {
        const target = e.target;
        if (!target.dataset.id) return;
        const id = parseInt(target.dataset.id);

        if (target.classList.contains('product-delete-btn')) {
            if (confirm('Tem certeza que deseja excluir este item do cardápio?')) {
                products = products.filter(p => p.id !== id);
                saveProducts();
                renderProducts();
            }
        }
        if (target.classList.contains('edit-btn')) {
            const product = products.find(p => p.id === id);
            if (product) {
                productIdInput.value = product.id;
                document.getElementById('name').value = product.name;
                document.getElementById('description').value = product.description;
                document.getElementById('price').value = product.price;
                document.getElementById('imageUrl').value = product.imageUrl;
                formTitle.textContent = 'Editar Lanche';
                cancelBtn.style.display = 'inline-block';
                window.scrollTo(0, 0);
            }
        }
    });

    userTableBody.addEventListener('click', async (e) => {
        const target = e.target;
        if (!target.dataset.id) return;
        const id = parseInt(target.dataset.id);

        if (target.classList.contains('user-delete-btn')) {
            const userToDelete = users.find(u => u.id === id);
            if (userToDelete && userToDelete.username === loggedInUser.username) {
                alert('Você não pode excluir sua própria conta de administrador.');
                return;
            }
            if (confirm('Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.')) {
                try {
                    const response = await fetch(`http://localhost:8080/users/${id}`, {
                        method: 'DELETE'
                    });
                    
                    if (response.ok) {
                        alert('Usuário excluído com sucesso!');
                        loadUsers(); // Recarrega a lista
                    } else {
                        const errorText = await response.text();
                        alert('Erro ao excluir usuário: ' + errorText);
                    }
                } catch (error) {
                    alert('Erro ao conectar com o servidor: ' + error.message);
                }
            }
        }

        if (target.classList.contains('user-edit-btn')) {
            const user = users.find(u => u.id === id);
            if (user) {
                userIdInput.value = user.id;
                document.getElementById('userName').value = user.name;
                document.getElementById('userUsername').value = user.username;
                document.getElementById('userEmail').value = user.email;
                document.getElementById('userPassword').value = '';
                document.getElementById('userRole').value = user.role;
                userFormTitle.textContent = 'Editar Usuário';
                userCancelBtn.style.display = 'inline-block';
                document.getElementById('userPassword').required = false;
                window.scrollTo(0, document.getElementById('user-form').offsetTop - 100);
            }
        }
    });

    userTableBody.addEventListener('change', async (e) => {
        const target = e.target;
        if (!target.dataset.id) return;
        const id = parseInt(target.dataset.id);
        if (target.classList.contains('role-select')) {
            const newRole = target.value;
            const userToUpdate = users.find(u => u.id === id);

            if (userToUpdate && userToUpdate.username === 'root' && newRole === 'USER') {
                 alert('Não é possível remover o cargo de Admin do usuário principal.');
                 target.value = 'ADMIN';
                 return;
            }
            
            if(userToUpdate) {
                try {
                    const response = await fetch(`http://localhost:8080/users/${id}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            name: userToUpdate.name,
                            username: userToUpdate.username,
                            email: userToUpdate.email,
                            role: newRole
                        })
                    });
                    
                    if (response.ok) {
                        userToUpdate.role = newRole;
                        alert('Cargo do usuário atualizado com sucesso!');
                    } else {
                        const errorText = await response.text();
                        alert('Erro ao atualizar cargo: ' + errorText);
                        target.value = userToUpdate.role;
                    }
                } catch (error) {
                    alert('Erro ao conectar com o servidor: ' + error.message);
                    target.value = userToUpdate.role; /
                }
            }
        }
    });

    function resetForm() {
        productForm.reset();
        productIdInput.value = '';
        formTitle.textContent = 'Adicionar Novo Lanche';
        cancelBtn.style.display = 'none';
    }

    function resetUserForm() {
        userForm.reset();
        userIdInput.value = '';
        userFormTitle.textContent = 'Adicionar Novo Usuário';
        userCancelBtn.style.display = 'none';
        document.getElementById('userPassword').required = true;
    }

    cancelBtn.addEventListener('click', resetForm);
    userCancelBtn.addEventListener('click', resetUserForm);
    renderProducts();
    loadUsers();
});