/* ============================================================
   УТИЛИТЫ
   ============================================================ */

function debounce(fn, delay) {
    let timer = null;
    return function (...args) {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), delay);
    };
}

/* ============================================================
   КАРУСЕЛЬ НОВОСТЕЙ
   ============================================================ */

function initEventsCarousel() {
    const wrapper  = document.getElementById('cards');
    const leftBtn  = document.getElementById('eventBtn_Left');
    const rightBtn = document.getElementById('eventBtn_Right');
    const allCards = document.querySelectorAll('.events__card');

    if (!wrapper || !leftBtn || !rightBtn || allCards.length === 0) return;

    const countCards = allCards.length;
    let index = 0;
    let step = 0;

    function calcStep() {
        const card = allCards[0];
        const cs = getComputedStyle(card);
        const ml = parseFloat(cs.marginLeft)  || 0;
        const mr = parseFloat(cs.marginRight) || 0;
        return card.offsetWidth + ml + mr;
    }

    function applyTransform() {
        wrapper.style.transform = `translateX(${-step * index}px)`;
    }

    function drawAnimate(centerIndex) {
        allCards.forEach((card, i) => {
            card.classList.remove('events__card--dimmed', 'events__card--active');
            card.classList.add(i === centerIndex
                ? 'events__card--active'
                : 'events__card--dimmed');
        });
    }

    function updateButtons() {
        leftBtn.disabled  = index === 0;
        rightBtn.disabled = index === countCards - 1;
        leftBtn.classList.toggle('is-disabled',  index === 0);
        rightBtn.classList.toggle('is-disabled', index === countCards - 1);
    }

    function pulseButton(btn) {
        if (!btn) return;
        btn.classList.remove('active');
        void btn.offsetWidth;
        btn.classList.add('active');
        const removeActive = () => btn.classList.remove('active');
        btn.addEventListener('animationend', removeActive, { once: true });
        setTimeout(removeActive, 400);
    }

    function goTo(newIndex) {
        if (newIndex < 0 || newIndex >= countCards) return;
        index = newIndex;
        drawAnimate(index);
        updateButtons();
        applyTransform();
    }

    leftBtn.addEventListener('click', function () {
        if (leftBtn.disabled) return;
        pulseButton(leftBtn);
        goTo(index - 1);
    });

    rightBtn.addEventListener('click', function () {
        if (rightBtn.disabled) return;
        pulseButton(rightBtn);
        goTo(index + 1);
    });

    document.addEventListener('keydown', function (event) {
        const tag = (event.target.tagName || '').toLowerCase();
        if (tag === 'input' || tag === 'textarea' || event.target.isContentEditable) return;

        if (event.key === 'ArrowLeft') {
            if (leftBtn.disabled) return;
            event.preventDefault();
            pulseButton(leftBtn);
            goTo(index - 1);
        } else if (event.key === 'ArrowRight') {
            if (rightBtn.disabled) return;
            event.preventDefault();
            pulseButton(rightBtn);
            goTo(index + 1);
        }
    });

    allCards.forEach((card, i) => {
        card.addEventListener('click', function () {
            if (i === index) return;
            goTo(i);
        });
    });

    const recalc = debounce(function () {
        step = calcStep();
        applyTransform();
    }, 120);

    window.addEventListener('resize', recalc);
    window.addEventListener('load', recalc);

    step = calcStep();
    drawAnimate(index);
    updateButtons();
    applyTransform();
}

/* ============================================================
   КНОПКА НАВЕРХ
   ============================================================ */

function initScrollToTop() {
    const btn = document.getElementById('scrollToTopBtn');
    if (!btn) return;

    function toggle() {
        btn.classList.toggle('show', window.scrollY > 400);
    }

    window.addEventListener('scroll', toggle);
    btn.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    toggle();
}

/* ============================================================
   БУРГЕР-МЕНЮ
   ============================================================ */

function initBurgerMenu() {
    const burger   = document.getElementById('burgerMenu');
    const overlay  = document.getElementById('menuOverlay');
    const items    = document.querySelectorAll('.menu-overlay__item');
    const joinBtn  = document.querySelector('.menu-overlay__join .join-button');

    if (!burger || !overlay) return;

    let isOpen = false;

    function toggle() {
        isOpen = !isOpen;
        burger.classList.toggle('active');
        overlay.classList.toggle('active');
        document.body.style.overflow = isOpen ? 'hidden' : '';
        burger.setAttribute('aria-label', isOpen ? 'Закрыть меню' : 'Открыть меню');
    }

    burger.addEventListener('click', toggle);

    items.forEach(item => {
        item.addEventListener('click', () => {
            items.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            if (isOpen) toggle();
        });
    });

    if (joinBtn) {
        joinBtn.addEventListener('click', () => {
            if (isOpen) toggle();
        });
    }

    document.addEventListener('click', (e) => {
        if (isOpen && e.target === overlay) toggle();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isOpen) toggle();
    });

    window.addEventListener('resize', debounce(() => {
        if (window.innerWidth > 1024 && isOpen) toggle();
    }, 250));
}

/* ============================================================
   ЛУПА НА КАРТЕ
   ============================================================ */

function initMapLoupe() {
    const wrapper = document.getElementById('mapImageWrapper');
    const img     = document.getElementById('mapImage');
    const loupe   = document.getElementById('mapLoupe');

    if (!wrapper || !img || !loupe) return;

    const ZOOM = 2.5;
    const LONG_PRESS_MS = 350;

    let pressTimer = null;
    let isActive = false;
    let imgRect = null;

    function loupeSize() {
        return loupe.offsetWidth || 180;
    }

    function showLoupe() {
        isActive = true;
        wrapper.classList.add('is-zooming');
        loupe.classList.add('show');
        imgRect = img.getBoundingClientRect();
        loupe.style.backgroundImage = `url("${img.src}")`;
        loupe.style.backgroundSize =
            `${imgRect.width * ZOOM}px ${imgRect.height * ZOOM}px`;
    }

    function hideLoupe() {
        isActive = false;
        wrapper.classList.remove('is-zooming');
        loupe.classList.remove('show');
        imgRect = null;
    }

    function moveLoupe(clientX, clientY) {
        if (!isActive || !imgRect) return;

        let x = clientX - imgRect.left;
        let y = clientY - imgRect.top;
        x = Math.max(0, Math.min(imgRect.width,  x));
        y = Math.max(0, Math.min(imgRect.height, y));

        const size = loupeSize();

        let left = x - size / 2;
        let top  = y - size / 2;
        left = Math.max(0, Math.min(imgRect.width  - size, left));
        top  = Math.max(0, Math.min(imgRect.height - size, top));

        loupe.style.left = `${left}px`;
        loupe.style.top  = `${top}px`;

        const bgX = -(x * ZOOM - size / 2);
        const bgY = -(y * ZOOM - size / 2);
        loupe.style.backgroundPosition = `${bgX}px ${bgY}px`;
    }

    function cancelPress() {
        clearTimeout(pressTimer);
        pressTimer = null;
    }

    // Мышь
    wrapper.addEventListener('mousedown', function (e) {
        if (e.button !== 0) return;
        e.preventDefault();
        pressTimer = setTimeout(function () {
            showLoupe();
            moveLoupe(e.clientX, e.clientY);
        }, LONG_PRESS_MS);
    });

    window.addEventListener('mousemove', function (e) {
        if (!isActive) return;
        moveLoupe(e.clientX, e.clientY);
    });

    window.addEventListener('mouseup', function () {
        cancelPress();
        if (isActive) hideLoupe();
    });

    // Тач
    wrapper.addEventListener('touchstart', function (e) {
        if (e.touches.length !== 1) return;
        const t = e.touches[0];
        pressTimer = setTimeout(function () {
            showLoupe();
            moveLoupe(t.clientX, t.clientY);
        }, LONG_PRESS_MS);
    }, { passive: true });

    wrapper.addEventListener('touchmove', function (e) {
        if (!isActive) return;
        e.preventDefault();
        const t = e.touches[0];
        moveLoupe(t.clientX, t.clientY);
    }, { passive: false });

    wrapper.addEventListener('touchend', function () {
        cancelPress();
        if (isActive) hideLoupe();
    });

    wrapper.addEventListener('touchcancel', function () {
        cancelPress();
        if (isActive) hideLoupe();
    });

    window.addEventListener('resize', function () {
        if (isActive) hideLoupe();
    });
}

/* ============================================================
   ЗАПУСК
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {
    initEventsCarousel();
    initScrollToTop();
    initBurgerMenu();
    initMapLoupe();
});