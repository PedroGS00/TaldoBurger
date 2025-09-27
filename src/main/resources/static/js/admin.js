document.addEventListener('DOMContentLoaded', () => {
    const productForm = document.getElementById('product-form');
    const productTableBody = document.querySelector('#product-table tbody');
    const productIdInput = document.getElementById('productId');
    const cancelBtn = document.getElementById('cancel-btn');
    const formTitle = document.getElementById('form-title');

    const userTableBody = document.querySelector('#user-table tbody');

    const loggedInUser = JSON.parse(sessionStorage.getItem('loggedInUser'));
    if (!loggedInUser || loggedInUser.email !== 'admin@taldoburger.com') {
        alert('Acesso negado. Esta área é apenas para administradores.');
        window.location.href = 'index.html';
        return;
    }

    let products = JSON.parse(localStorage.getItem('products')) || [];
    let users = JSON.parse(localStorage.getItem('users')) || [];

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
                        <option value="customer" ${user.role === 'customer' ? 'selected' : ''}>Cliente</option>
                        <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Admin</option>
                    </select>
                </td>
                <td class="action-buttons">
                    <button class="delete-btn user-delete-btn" data-id="${user.id}">Excluir</button>
                </td>
            `;
            userTableBody.appendChild(tr);
        });
    }

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

    userTableBody.addEventListener('click', (e) => {
        const target = e.target;
        if (!target.dataset.id) return;
        const id = parseInt(target.dataset.id);

        if (target.classList.contains('user-delete-btn')) {
            const userToDelete = users.find(u => u.id === id);
            if (userToDelete && userToDelete.email === loggedInUser.email) {
                alert('Você não pode excluir sua própria conta de administrador.');
                return;
            }
            if (confirm('Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.')) {
                users = users.filter(u => u.id !== id);
                saveUsers();
                renderUsers();
            }
        }
    });

    userTableBody.addEventListener('change', (e) => {
        const target = e.target;
        if (!target.dataset.id) return;
        const id = parseInt(target.dataset.id);
        if (target.classList.contains('role-select')) {
            const newRole = target.value;
            const userToUpdate = users.find(u => u.id === id);

            if (userToUpdate && userToUpdate.email === 'admin@taldoburger.com' && newRole === 'customer') {
                 alert('Não é possível remover o cargo de Admin do usuário principal.');
                 target.value = 'admin';
                 return;
            }
            if(userToUpdate) {
                userToUpdate.role = newRole;
                saveUsers();
            }
        }
    });

    function resetForm() {
        productForm.reset();
        productIdInput.value = '';
        formTitle.textContent = 'Adicionar Novo Lanche';
        cancelBtn.style.display = 'none';
    }

    cancelBtn.addEventListener('click', resetForm);
    renderProducts();
    renderUsers();
});