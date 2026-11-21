// Все лучшие языка программирования - Java и JavaScript, 
// объединяет одна вещь - Java)))




// КНОПКА СКРОЛЛА НАВЕРХ
(function () {
    const scrollBtn = document.getElementById('scrollToTopBtn');

    // Функция показа/скрытия кнопки
    function toggleScrollButton() {
        if (window.scrollY > 400) {
            scrollBtn.classList.add('show');
        } else {
            scrollBtn.classList.remove('show');
        }
    }

    // Функция плавной прокрутки наверх
    function scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    // Слушаем событие прокрутки
    window.addEventListener('scroll', toggleScrollButton);

    // Слушаем клик по кнопке
    scrollBtn.addEventListener('click', scrollToTop);

    // Проверяем состояние при загрузке страницы
    toggleScrollButton();
})();






// ===== БУРГЕР-МЕНЮ =====
(function() {
    const burgerMenu = document.getElementById('burgerMenu');
    const menuOverlay = document.getElementById('menuOverlay');
    const menuItems = document.querySelectorAll('.menu-overlay__item');
    const joinButton = document.querySelector('.menu-overlay__join .join-button');
    let isMenuOpen = false;

    function toggleMenu() {
        isMenuOpen = !isMenuOpen;
        
        burgerMenu.classList.toggle('active');
        menuOverlay.classList.toggle('active');
        
        document.body.style.overflow = isMenuOpen ? 'hidden' : '';
        burgerMenu.setAttribute('aria-label', isMenuOpen ? 'Закрыть меню' : 'Открыть меню');
    }

    burgerMenu.addEventListener('click', toggleMenu);

    menuItems.forEach(item => {
        item.addEventListener('click', () => {
            menuItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            if (isMenuOpen) toggleMenu();
        });
    });

    if (joinButton) {
        joinButton.addEventListener('click', () => {
            if (isMenuOpen) toggleMenu();
        });
    }

    // Закрытие по клику на затемнение (фон)
    document.addEventListener('click', (e) => {
        if (isMenuOpen && e.target === menuOverlay) {
            toggleMenu();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isMenuOpen) {
            toggleMenu();
        }
    });

    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            if (window.innerWidth > 1024 && isMenuOpen) {
                toggleMenu();
            }
        }, 250);
    });
})();