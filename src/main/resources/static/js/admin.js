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

    function loadProducts() {
        products = JSON.parse(localStorage.getItem('products')) || [];
        if (products.length === 0) {
            products = [
                {id: 1, name: "Classic Burger", description: "Pão, carne 150g, queijo, alface, tomate e nosso molho especial.", price: 25.00, estoque: 50, imageUrl: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?q=80&w=2072&auto=format&fit=crop"},
                {id: 2, name: "Bacon Paradise", description: "Pão, carne 180g, dobro de bacon, queijo cheddar e molho barbecue.", price: 32.50, estoque: 30, imageUrl: "https://images.unsplash.com/photo-1561758033-d89a9ad46330?q=80&w=2070&auto=format&fit=crop"},
                {id: 3, name: "Veggie Dream", description: "Pão integral, burger de grão de bico, queijo vegano e salada fresca.", price: 28.00, estoque: 25, imageUrl: "https://plus.unsplash.com/premium_photo-1675345026943-416a2a754117?q=80&w=2070&auto=format&fit=crop"},
                {id: 4, name: "Double Trouble", description: "Pão, duas carnes de 150g, dobro de queijo, picles e cebola roxa.", price: 38.00, estoque: 20, imageUrl: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?q=80&w=2070&auto=format&fit=crop"},
                {id: 5, name: "Spicy Jalapeño", description: "Pão, carne 180g, queijo pepper jack, pimentas jalapeño e maionese picante.", price: 33.00, estoque: 35, imageUrl: "https://images.unsplash.com/photo-1603614533240-36a1b7e4115c?q=80&w=1925&auto=format&fit=crop"},
                {id: 6, name: "Chicken Crispy", description: "Pão, filé de frango empanado, alface americana e maionese de ervas.", price: 29.50, estoque: 40, imageUrl: "https://images.unsplash.com/photo-1604391215783-659779339d7b?q=80&w=1974&auto=format&fit=crop"},
                {id: 7, name: "Onion Rings Tower", description: "Pão, carne 180g, queijo suíço, anéis de cebola e molho especial.", price: 34.00, estoque: 25, imageUrl: "https://images.unsplash.com/photo-1598642792341-4292150f2245?q=80&w=1974&auto=format&fit=crop"},
                {id: 8, name: "Mushroom Melt", description: "Pão brioche, carne 180g, cogumelos salteados e queijo provolone.", price: 35.50, estoque: 30, imageUrl: "https://images.unsplash.com/photo-1551615593-ef5fe247e8f7?q=80&w=2070&auto=format&fit=crop"},
                {id: 9, name: "Taldo's Special", description: "Pão australiano, carne 200g, costela desfiada e queijo gouda.", price: 42.00, estoque: 15, imageUrl: "https://images.unsplash.com/photo-1605789535382-72a3d3a015a9?q=80&w=2070&auto=format&fit=crop"},
                {id: 10, name: "Kids Burger", description: "Pão, carne 90g e queijo. Simples e delicioso para os pequenos.", price: 18.00, estoque: 60, imageUrl: "https://images.unsplash.com/photo-1549611016-3a70d82b5040?q=80&w=2070&auto=format&fit=crop"}
            ];
            saveProducts();
        }
        renderProducts();
    }

    function saveProducts() {
        localStorage.setItem('products', JSON.stringify(products));
    }

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

    productForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = parseInt(productIdInput.value);
        
        const formData = new FormData();
        formData.append('nome', document.getElementById('name').value);
        formData.append('descricao', document.getElementById('description').value);
        formData.append('preco', parseFloat(document.getElementById('price').value));
        formData.append('estoque', parseInt(document.getElementById('stock').value) || 0);
        
        const fileInput = document.getElementById('imageFile');
        if (fileInput.files[0]) {
            formData.append('file', fileInput.files[0]);
        }

        try {
            const response = await fetch('http://localhost:8080/lanches', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                const newLanche = await response.json();
                alert('Lanche criado com sucesso!');
                resetForm();
                loadLanches(); // Função para recarregar a lista de lanches
            } else {
                const errorText = await response.text();
                alert('Erro ao salvar lanche: ' + errorText);
            }
        } catch (error) {
            alert('Erro ao conectar com o servidor: ' + error.message);
        }
    });

    productTableBody.addEventListener('click', (e) => {
        const target = e.target;
        if (!target.dataset.id) return;
        const id = parseInt(target.dataset.id);

        if (target.classList.contains('product-delete-btn')) {
            if (confirm('Tem certeza que deseja excluir este item do cardápio?')) {
                const index = products.findIndex(p => p.id === id);
                if (index !== -1) {
                    products.splice(index, 1);
                    saveProducts();
                    renderProducts();
                    alert('Produto excluído com sucesso!');
                }
            }
        }
        if (target.classList.contains('edit-btn')) {
            const product = products.find(p => p.id === id);
            if (product) {
                productIdInput.value = product.id;
                document.getElementById('name').value = product.name;
                document.getElementById('description').value = product.description;
                document.getElementById('price').value = product.price;
                document.getElementById('stock').value = product.estoque || 0;
                document.getElementById('imageFile').value = ''; // Limpar o campo de arquivo
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
                    target.value = userToUpdate.role; 
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
    async function loadLanches() {
        try {
            const response = await fetch('http://localhost:8080/lanches');
            if (response.ok) {
                const lanches = await response.json();
                products = lanches.map(lanche => ({
                    id: lanche.id,
                    name: lanche.nome,
                    description: lanche.descricao,
                    price: lanche.preco,
                    estoque: lanche.estoque,
                    imagePath: lanche.imagePath
                }));
                renderProducts();
            } else {
                console.error('Erro ao carregar lanches');
            }
        } catch (error) {
            console.error('Erro ao conectar com o servidor:', error);
        }
    }

    loadProducts();
    loadUsers();
    loadLanches(); // Carregar lanches da API
});