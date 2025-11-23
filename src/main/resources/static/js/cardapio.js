document.addEventListener('DOMContentLoaded', () => {
    const menuGrid = document.querySelector('.menu-grid');
    const successMessageDiv = document.getElementById('success-message');
    let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
    let products = [];

    async function loadProducts() {
        try {
            const response = await fetch('http://localhost:8080/lanches');
            if (response.ok) {
                products = await response.json();
                // Mapear os dados da API para o formato esperado pelo frontend
                products = products.map(lanche => ({
                    id: lanche.id,
                    name: lanche.nome,
                    description: lanche.descricao,
                    price: lanche.preco,
                    imagePath: lanche.imagePath
                }));
                renderMenu(); // Renderizar o menu após carregar os produtos
            } else {
                console.error('Erro ao carregar produtos da API');
                // Fallback para dados locais se a API falhar
                loadLocalProducts();
            }
        } catch (error) {
            console.error('Erro ao conectar com a API:', error);
            // Fallback para dados locais se a API falhar
            loadLocalProducts();
        }
    }

    function loadLocalProducts() {
        products = JSON.parse(localStorage.getItem('products')) || [];
        if (products.length === 0) {
            products = [
                {id: 1, name: "Classic Burger", description: "Pão, carne 150g, queijo, alface, tomate e nosso molho especial.", price: 25.00, imageUrl: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?q=80&w=2072&auto=format&fit=crop"},
                {id: 2, name: "Bacon Paradise", description: "Pão, carne 180g, dobro de bacon, queijo cheddar e molho barbecue.", price: 32.50, imageUrl: "https://images.unsplash.com/photo-1561758033-d89a9ad46330?q=80&w=2070&auto=format&fit=crop"},
                {id: 3, name: "Veggie Dream", description: "Pão integral, burger de grão de bico, queijo vegano e salada fresca.", price: 28.00, imageUrl: "https://plus.unsplash.com/premium_photo-1675345026943-416a2a754117?q=80&w=2070&auto=format&fit=crop"},
                {id: 4, name: "Double Trouble", description: "Pão, duas carnes de 150g, dobro de queijo, picles e cebola roxa.", price: 38.00, imageUrl: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?q=80&w=2070&auto=format&fit=crop"},
                {id: 5, name: "Spicy Jalapeño", description: "Pão, carne 180g, queijo pepper jack, pimentas jalapeño e maionese picante.", price: 33.00, imageUrl: "https://images.unsplash.com/photo-1603614533240-36a1b7e4115c?q=80&w=1925&auto=format&fit=crop"},
                {id: 6, name: "Chicken Crispy", description: "Pão, filé de frango empanado, alface americana e maionese de ervas.", price: 29.50, imageUrl: "https://images.unsplash.com/photo-1604391215783-659779339d7b?q=80&w=1974&auto=format&fit=crop"},
                {id: 7, name: "Onion Rings Tower", description: "Pão, carne 180g, queijo suíço, anéis de cebola e molho especial.", price: 34.00, imageUrl: "https://images.unsplash.com/photo-1598642792341-4292150f2245?q=80&w=1974&auto=format&fit=crop"},
                {id: 8, name: "Mushroom Melt", description: "Pão brioche, carne 180g, cogumelos salteados e queijo provolone.", price: 35.50, imageUrl: "https://images.unsplash.com/photo-1551615593-ef5fe247e8f7?q=80&w=2070&auto=format&fit=crop"},
                {id: 9, name: "Taldo's Special", description: "Pão australiano, carne 200g, costela desfiada e queijo gouda.", price: 42.00, imageUrl: "https://images.unsplash.com/photo-1605789535382-72a3d3a015a9?q=80&w=2070&auto=format&fit=crop"},
                {id: 10, name: "Kids Burger", description: "Pão, carne 90g e queijo. Simples e delicioso para os pequenos.", price: 18.00, imageUrl: "https://images.unsplash.com/photo-1549611016-3a70d82b5040?q=80&w=2070&auto=format&fit=crop"}
            ];
            localStorage.setItem('products', JSON.stringify(products));
        }
    }

    function renderMenu() {
        menuGrid.innerHTML = '';
        products.forEach(product => {
            const menuItem = document.createElement('div');
            menuItem.classList.add('menu-item');
            const imageSrc = product.imagePath ? `/img/${product.imagePath}` : (product.imageUrl || '/img/placeholder.jpg');
            menuItem.innerHTML = `
                <img src="${imageSrc}" alt="${product.name}">
                <h3>${product.name}</h3>
                <p>${product.description}</p>
                <span class="price">R$ ${product.price.toFixed(2)}</span>
                <button class="add-to-cart-btn" data-name="${product.name}" data-price="${product.price}">Personalizar</button>
            `;
            menuGrid.appendChild(menuItem);
        });
    }

    function salvarCarrinho() {
        localStorage.setItem('carrinho', JSON.stringify(carrinho));
        if (window.renderHeader) renderHeader();
    }

    function iniciarPersonalizacao(name, price) {
        const loggedInUser = sessionStorage.getItem('loggedInUser');
        if (!loggedInUser) {
            const modal = document.createElement('div');
            modal.className = 'confirm-modal show';
            modal.setAttribute('aria-hidden', 'false');
            modal.setAttribute('role', 'dialog');
            modal.innerHTML = `
              <div class="confirm-backdrop" data-dismiss="login-required"></div>
              <div class="confirm-card">
                <div class="confirm-status"><div class="status-icon success"><i class="fas fa-user-lock"></i></div></div>
                <h3 class="confirm-title">Faça login para continuar</h3>
                <p class="confirm-message">Você precisa estar logado para personalizar seu pedido.</p>
                <div class="confirm-actions"><a class="btn" id="go-login-btn" href="login.html">Ir para login</a></div>
                <button type="button" class="confirm-close" title="Fechar" data-dismiss="login-required"><i class="fas fa-times"></i></button>
              </div>`;
            document.body.appendChild(modal);
            const dismissEls = modal.querySelectorAll('[data-dismiss="login-required"]');
            dismissEls.forEach(el => el.addEventListener('click', () => {
                modal.classList.remove('show');
                modal.setAttribute('aria-hidden', 'true');
                setTimeout(() => modal.remove(), 150);
            }));
            const goBtn = document.getElementById('go-login-btn');
            if (goBtn) {
                goBtn.addEventListener('click', (ev) => {
                    ev.preventDefault();
                    document.body.classList.add('page-leave');
                    setTimeout(() => { window.location.href = 'login.html'; }, 180);
                });
            }
            return;
        }
        const base = { name, price };
        sessionStorage.removeItem('pedidoPersonalizado');
        sessionStorage.setItem('customLanche', JSON.stringify(base));
        document.body.classList.add('page-leave');
        setTimeout(() => { window.location.href = 'customizacao.html'; }, 180);
    }

    if (menuGrid) {
        menuGrid.addEventListener('click', (event) => {
            const btn = event.target.closest('.add-to-cart-btn');
            if (btn) {
                iniciarPersonalizacao(
                    btn.dataset.name,
                    parseFloat(btn.dataset.price)
                );
            }
        });
    }

    if (sessionStorage.getItem('compraFinalizada') === 'true') {
        successMessageDiv.textContent = 'Compra finalizada com sucesso! Peça novamente:';
        successMessageDiv.style.display = 'block';
        sessionStorage.removeItem('compraFinalizada');
        setTimeout(() => {
            successMessageDiv.style.display = 'none';
        }, 4000);
    }

    loadProducts();
});
