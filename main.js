/* ==========================================================================
   1. ОБЩИЙ ФУНКЦИОНАЛ (Уведомления)
   ========================================================================== */
// Глобальный контейнер для всех уведомлений (для настакивания)
let notificationContainer = null;

// Функция для отображения всплывающих уведомлений (toast)
function showNotification({ content }) {
    // Создаем контейнер стека, если его еще нет
    if (!notificationContainer) {
        notificationContainer = document.createElement('div');
        notificationContainer.id = 'notificationStack';
        document.body.appendChild(notificationContainer);
    }

    const note = document.createElement('div');
    note.className = 'notification-toast';
    // Добавляем крестик для ручного закрытия
    note.innerHTML = `${content} <span style="margin-left:10px; cursor:pointer;" onclick="this.parentElement.remove()">✖</span>`; 
    
    // Добавляем новое уведомление в НАЧАЛО контейнера (чтобы оно было сверху)
    notificationContainer.prepend(note);

    // Уведомления не удаляются автоматически, чтобы они настакивались.
}


/* ==========================================================================
   2. КАТАЛОГ (ТОВАРЫ + КОРЗИНА)
   ========================================================================== */
const initialProducts = [
    { 
        id: 1, name: "Кофемат Jetinno JL300", price: 399000, 
        img: "https://art-vending.ru/upload/iblock/314/jl_300_1.png",
        desc: "Профессиональный автомат с 2 кофемолками и 12 видами напитков." 
    },
    { 
        id: 2, name: "Снековый автомат TCN D720", price: 254000, 
        img: "https://art-vending.ru/upload/resize_cache/iblock/46e/320_480_1/TCN%20D720-66.jpeg",
        desc: "Антивандальный корпус, вместимость до 500 единиц товара." 
    },
    { 
        id: 3, name: "Комби-бар Rosso ToGo", price: 774000, 
        img: "https://art-vending.ru/upload/resize_cache/iblock/60e/320_480_1/%D0%9A%D0%BE%D0%BC%D0%B1%D0%B8%20%D1%82%D0%BE%D1%80%D0%B3%D0%BE%D0%B2%D1%8B%D0%B9%20%D0%B0%D0%B2%D1%82%D0%BE%D0%BC%D0%B0%D1%82%20ROSSO%20TOGO%20BAR.jpg",
        desc: "Идеальное решение 2в1: кофе из зерен и холодные снеки." 
    },
    { 
        id: 4, name: "Водомат AQUATIC WA-400N", price: 218800, 
        img: "images/water vending.jpg",
        desc: "Автомат очистки и продажи воды. Производительность: 2250 л/сутки. Габариты: 700х600х1850 мм. Вес: 150 кг." 
    },
    { 
        id: 5, name: "Снековый автомат NECTA TANGO 7-48", price: 424935, 
        img: "images/tango.png",
        desc: "Представитель новой линейки снековых автоматов от итальянской группы компаний N&W Global Vending. За счет увеличенных габаритов достигается большая загрузка товаров, обеспечен лучший обзор витрины и повышенная вандалозащищенность. Предназначен для автоматической торговли продуктами питания (закуски, кондитерские изделия, бутерброды, шоколад, банки, бутылки). Рабочая температура внутри: от 8° до 15°." 
    },
    { 
        id: 6, name: "Кофейный автомат Jetinno JL500", price: 600000, 
        img: "images/Jetinno.png",
        desc: " Продает напитки в модном формате «кофе с собой» (большой стакан 350 мл с крышкой). Предназначен для работы в местах с большой проходимостью посетителей."
    },
    {
        id: 7, name: 'Снековый автомат UNICUM FOODBOX LIFT LONG', price: 550000, 
        img: 'images/unicum.jpg',  
        desc: 'Не уступает конкурентам по качеству, надежности и функциональности. Продажа не только продуктов или напитков, но и любого штучного товара, включая хрупкий.'
    }
];

// Корзина теперь хранится в localStorage и доступна на всех страницах
let cart = JSON.parse(localStorage.getItem('vendingCart')) || {};

function saveCart() {
    localStorage.setItem('vendingCart', JSON.stringify(cart));
}

window.addToCart = function(productId) {
    const prod = initialProducts.find(p => p.id === productId);
    if (!prod) return;

    const idKey = String(productId); // Используем строковый ключ для объекта cart
    if (cart[idKey]) {
        cart[idKey].qty++;
    } else {
        // Создаем полную копию данных для корзины
        cart[idKey] = { 
            id: prod.id, 
            name: prod.name, 
            price: prod.price, 
            img: prod.img, 
            qty: 1 
        };
    }

    saveCart();
    updateCartDisplay();
    showNotification({content: `Добавлено: ${prod.name}`});
}

// Удаление товара из корзины
window.removeFromCart = function(productId) {
    const idKey = String(productId);
    if (cart[idKey]) {
        if (cart[idKey].qty > 1) {
            cart[idKey].qty--;
        } else {
            delete cart[idKey];
        }
    }
    saveCart();
    updateCartDisplay();
    showNotification({ content: `Удален из корзины (ID: ${productId})` });
}

// Очистка корзины
window.clearCart = function() {
    if (confirm("Вы уверены, что хотите очистить корзину?")) {
        cart = {};
        saveCart();
        updateCartDisplay();
        showNotification({ content: " Корзина очищена!" });
    }
}

// Обновление отображения корзины (для cart.html)
window.updateCartDisplay = function() {
    const listElement = document.getElementById('cartItemsList');
    const totalElement = document.getElementById('totalPrice');

    // Логика обновления счетчика колокольчика удалена

    if (!listElement || !totalElement) return;

    const itemKeys = Object.keys(cart);
    let totalPrice = 0;

    if (itemKeys.length === 0) {
        listElement.innerHTML = 'Пусто';
        totalElement.textContent = '0';
        return;
    }

    listElement.innerHTML = '';
    
    itemKeys.forEach(id => {
        const item = cart[id];
        const itemPrice = item.price * item.qty;
        totalPrice += itemPrice;

        const div = document.createElement('div');
        div.className = 'cart-item';
        div.innerHTML = `
            <span>${item.name} (${item.qty} шт.)</span>
            <span>${itemPrice.toLocaleString()} ₽
                <button class="item-remove" onclick="removeFromCart(${item.id})">✖</button>
            </span>
        `;
        listElement.appendChild(div);
    });

    totalElement.textContent = totalPrice.toLocaleString();
}


// Рендер карточек товаров
function renderProducts(products = initialProducts) {
    const container = document.getElementById('productsContainer');
    if (!container) return; 

    container.innerHTML = products.map(p => `
        <article class="product-card" draggable="true" data-product-id="${p.id}" ondragstart="dragStart(event)">
            <button class="like-btn" onclick="toggleLike(this)">🤍</button>
            <a href="product.html?id=${p.id}" class="product-image"><img src="${p.img}" alt="${p.name}"></a>
            <div class="product-info">
                <h3><a href="product.html?id=${p.id}" style="color:#fff;">${p.name}</a></h3>
                <p class="product-desc">${p.desc}</p>
                <div class="price">${p.price.toLocaleString()} ₽</div>
                <a href="product.html?id=${p.id}">Подробнее</a>
                <a href="#" onclick="event.preventDefault(); addToCart(${p.id})" style="margin-top: 10px; background: var(--primary-dark);">В корзину</a>
            </div>
        </article>
    `).join('');

    // Присвоение обработчиков перетаскивания (только на странице каталога)
    const cartDropZone = document.getElementById('cartDropZone');
    if (cartDropZone) {
        cartDropZone.addEventListener('dragover', dragOver);
        cartDropZone.addEventListener('drop', dropHandler);
        cartDropZone.addEventListener('dragenter', (e) => e.target.closest('.cart-area').classList.add('drag-over'));
        cartDropZone.addEventListener('dragleave', (e) => e.target.closest('.cart-area').classList.remove('drag-over'));
    }
}


function dropHandler(event) {
    event.preventDefault();
    const dropZone = event.target.closest('.cart-area');
    if(dropZone) dropZone.classList.remove('drag-over');

    const productId = event.dataTransfer.getData('productId');
    if (productId) {
        // Добавляем в корзину через функцию, которая ищет товар по ID
        addToCart(Number(productId));
    }
}

// Сортировка товаров
window.sortGoods = function(order) {
    const sorted = [...initialProducts];
    sorted.sort((a, b) => order === 'asc' ? a.price - b.price : b.price - a.price);
    renderProducts(sorted);
}

// Функции лайков
function toggleLike(btn) {
    btn.classList.toggle('liked');
    btn.textContent = btn.classList.contains('liked') ? '❤️' : '🤍';
    if(btn.classList.contains('liked')) showNotification({content: "Добавлено в избранное"});
}

// Запуск рендера товаров и корзины при загрузке
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('productsContainer')) {
        renderProducts();
    }
});


/* ==========================================================================
   3. СТРАНИЦА ТОВАРА (product.html)
   ========================================================================== */

function loadProductDetail() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = Number(urlParams.get('id'));
    const product = initialProducts.find(g => g.id === productId);

    if (product) {
        document.getElementById('prodName').textContent = product.name;
        document.getElementById('prodPrice').textContent = `${product.price.toLocaleString()} ₽`;
        document.getElementById('prodDesc').textContent = product.desc + " Полная гарантия 1 год. Страна-производитель: Россия.";
        document.getElementById('prodImg').src = product.img;

        document.getElementById('addBtn').onclick = () => {
            addToCart(product.id);
        };
    } else if (document.getElementById('productDetail')) {
        document.getElementById('productDetail').innerHTML = '<h2>Товар не найден</h2><p>Пожалуйста, вернитесь в <a href="catalog.html">каталог</a>.</p>';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('productDetail')) {
        loadProductDetail();
    }
});


/* ==========================================================================
   4. ПРОЧИЙ ФУНКЦИОНАЛ (Капча, Логин и прочее)
   ========================================================================== */
let captchaCode = "";
const captchaDisplay = document.getElementById('captchaText');
if (captchaDisplay) generateCaptcha();

function generateCaptcha() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
    captchaCode = "";
    for(let i=0; i<6; i++) captchaCode += chars.charAt(Math.floor(Math.random() * chars.length));
    if(captchaDisplay) captchaDisplay.textContent = captchaCode;
}

window.verifyCaptcha = () => {
    const input = document.getElementById('captchaInput');
    const btn = document.getElementById('submitBtn');
    const err = document.getElementById('captchaError');
    if (!input || !btn || !err) return; 

    if (input.value === captchaCode) {
        btn.disabled = false; btn.textContent = 'Отправить заявку (Капча верна)'; 
        err.style.display = "none"; 
        alert("Верно! Кнопка разблокирована.");
    } else {
        err.style.display = "block"; err.textContent = "Неверно! Попробуйте снова.";
        input.value = ""; generateCaptcha();
        showNotification({ content: " Ошибка Капчи" });
    }
}

window.checkRegistration = function() {
    let answer = prompt("Желаете пройти регистрацию на сайте? (Да/Нет)");
    if (answer && answer.trim().toLowerCase() === "да") showNotification({ content: " Добро пожаловать." });
    else showNotification({ content: " Отмена" });
}

window.startAdminLogin = function() {
    let login = prompt("Введите логин:");
    if (login === "Админ") {
        let pass = prompt("Введите пароль:");
        if (pass === "Админ") showNotification({ content: "Здравствуйте, Администратор!" });
        else showNotification({ content: " Неверный пароль" });
    } else showNotification({ content: " Неверный пароль" });
}


document.addEventListener('DOMContentLoaded', () => {
    const logoArea = document.querySelector('.logo');
    if (logoArea) {
        logoArea.addEventListener('mouseover', startFaviconScroll);
        logoArea.addEventListener('mouseout', stopFaviconScroll);
    }
});


/* ==========================================================================
   5. ФУНКЦИОНАЛ КОРЗИНЫ / ОФОРМЛЕНИЕ ЗАКАЗА
   ========================================================================== */

// Функция оформления заказа
window.checkout = function() {
    // Используем Object.keys(cart).length для проверки, так как cart - это объект
    if (typeof cart === 'undefined' || Object.keys(cart).length === 0) { 
        showNotification({ content: "🛒 Корзина пуста. Добавьте товары перед оформлением." });
        return;
    }

    let orderDetails = "Ваш заказ:\n";
    let total = 0;
    
    // Итерация по значениям объекта cart
    Object.values(cart).forEach(item => {
        const itemSubtotal = item.price * item.qty; // Учитываем количество
        // Используем toLocaleString для форматирования чисел
        orderDetails += `- ${item.name} (${item.qty} шт.) - ${itemSubtotal.toLocaleString()} ₽\n`; 
        total += itemSubtotal;
    });
    orderDetails += `\nИтого: ${total.toLocaleString()} ₽`;

    alert(orderDetails);
    
    // Имитация отправки заказа
    showNotification({ content: `✅ Заказ на сумму ${total.toLocaleString()} ₽ оформлен!` });
    
    // Очищаем корзину после оформления заказа
    if (typeof clearCart !== 'undefined') clearCart();
    // Принудительно обновляем содержимое корзины на странице cart.html
    if (document.getElementById('cartItemsList') && typeof updateCartDisplay !== 'undefined') updateCartDisplay(); 
}


// 6. АВТОЗАКРЫТИЕ МОБИЛЬНОГО МЕНЮ ПОСЛЕ КЛИКА
document.addEventListener('DOMContentLoaded', () => {
    // Получаем все ссылки внутри навигационного списка
    const navLinks = document.querySelectorAll('.nav-list a');
    const menuCheck = document.getElementById('menu-check');

    if (navLinks.length > 0 && menuCheck) {
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                // При клике на ссылку, снимаем галочку с чекбокса, 
                // что приводит к скрытию мобильного меню через CSS
                menuCheck.checked = false;
            });
        });
    }
});

/* ==========================================================================
   ФИКС МОБИЛЬНОЙ НАВИГАЦИИ (Управление через классы)
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
    const navList = document.getElementById('navList');      // Ваш список ссылок
    const menuToggle = document.getElementById('menuToggle'); // Ваша кнопка (Label)
    const navLinks = document.querySelectorAll('.nav-list a'); // Ваши ссылки

    // 1. Логика открытия/закрытия меню по клику на бургер
    if (menuToggle && navList) {
        menuToggle.addEventListener('click', () => {
            // Переключаем класс 'open' на списке и кнопке
            navList.classList.toggle('open');
            menuToggle.classList.toggle('open'); 
        });
    }
    
    // 2. Логика автозакрытия меню при переходе по ссылке
    if (navLinks.length > 0 && navList && menuToggle) {
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                // При клике на ссылку, принудительно убираем класс 'open'
                // Это закроет меню, прежде чем произойдет переход на новую страницу.
                navList.classList.remove('open');
                menuToggle.classList.remove('open');
            });
        });
    }

    // Дополнительный фикс: закрываем меню при загрузке страницы (для кнопки "Назад")
    if (navList && navList.classList.contains('open')) {
         navList.classList.remove('open');
         if (menuToggle) menuToggle.classList.remove('open');
    }
});