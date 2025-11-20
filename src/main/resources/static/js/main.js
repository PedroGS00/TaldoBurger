document.addEventListener('DOMContentLoaded', () => {

    const cartCounter = document.getElementById('cart-counter');

    function atualizarContador() {
        const carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
        const totalItems = carrinho.reduce((sum, item) => sum + item.quantity, 0);
        if (cartCounter) {
            cartCounter.textContent = totalItems;
        }
    }

    atualizarContador();

    const heroVideo = document.querySelector('.hero-bg');
    if (heroVideo) {
        const showVideo = () => heroVideo.classList.add('visible');
        heroVideo.addEventListener('canplay', showVideo);
        heroVideo.addEventListener('loadeddata', showVideo);
        heroVideo.addEventListener('playing', showVideo);
        heroVideo.addEventListener('error', () => {
            heroVideo.remove();
        });
        const tryPlay = () => {
            const p = heroVideo.play();
            if (p && typeof p.then === 'function') {
                p.then(showVideo).catch(() => {});
            }
        };
        tryPlay();
    }
});