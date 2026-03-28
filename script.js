/* =====================================================
   TASK 1: DATA STRUCTURE (Product Class)
   ===================================================== */
class Product {
    constructor(id, name, price, image, category) {
        this.id = id;
        this.name = name;
        this.price = price;
        this.image = image;
        this.category = category;
    }
}

const products = [
    new Product(1, "Blue Dog Harness", 280.00, "harness.jpg", "Dogs"),
    new Product(2, "Amber Dog Harness", 350.00, "amber.jpg", "Dogs"),
    new Product(3, "Pedigree Adult Beef", 130.00, "pedigree.jpg", "Dogs"),
    new Product(4, "Cat Laser Toy", 40.00, "laser.jpg", "Cats"),
    new Product(5, "KitKat Premium Food", 220.00, "kitkat.jpg", "Cats"),
    new Product(6, "Multi-Level Tower", 1250.00, "tower.jpg", "Cats"),
    new Product(7, "Natural Wood Perch", 227.00, "perch.jpg", "Birds"),
    new Product(8, "Elixir Bird Feeds", 35.00, "elixir.jpg", "Birds"),
    new Product(9, "Premium Bird Mix", 37.00, "premium.jpg", "Birds"),
    new Product(10, "Gardman Bird Feeds", 45.00, "gardman.jpg", "Birds"),
    new Product(11, "Fish Pellets", 69.00, "pellets.jpg", "Fish"),
    new Product(12, "Fish Flakes", 59.00, "flakes.jpg", "Fish"),
    new Product(13, "Quiet-Flow Filter", 268.00, "filter.jpg", "Fish")
];

// Initialize Cart from LocalStorage
let cart = JSON.parse(localStorage.getItem('petPalaceCart')) || [];

/* =====================================================
   TASK 2 & 7: DYNAMIC RENDERING (Products & Details)
   ===================================================== */

// Render Product List
const productContainer = document.querySelector('.product-list');
if (productContainer) {
    productContainer.innerHTML = ''; // Clear existing
    products.forEach(product => {
        const card = document.createElement('article');
        card.className = 'product-card';
        card.setAttribute('data-id', product.id);
        card.innerHTML = `
            <img src="${product.image}" alt="${product.name}">
            <h3>${product.name}</h3>
            <p class="price">${product.price.toFixed(2)}</p>
            <div class="card-buttons">
                <a href="detail.html?id=${product.id}" class="btn">View Details</a>
                <button class="add-to-cart-btn btn" data-id="${product.id}">Add to Cart</button>
            </div>
        `;
        productContainer.appendChild(card);
    });
}

// Product Details Logic
function loadProductDetails() {
    const detailPage = document.getElementById('detail-page');
    if (!detailPage) return;

    const urlParams = new URLSearchParams(window.location.search);
    const productId = parseInt(urlParams.get('id'));
    const product = products.find(p => p.id === productId);

    if (product) {
        document.getElementById('detail-img').src = product.image;
        document.getElementById('detail-name').textContent = product.name;
        document.getElementById('detail-price').textContent = product.price.toFixed(2);
        
        const addBtn = document.getElementById('detail-add-btn');
        if(addBtn) addBtn.setAttribute('data-id', product.id);
    }
}

/* =====================================================
   TASK 3 & 6: CART LOGIC & ANIMATIONS
   ===================================================== */

document.body.addEventListener('click', (e) => {
    if (e.target.classList.contains('add-to-cart-btn')) {
        const productId = parseInt(e.target.getAttribute('data-id'));
        const productToAdd = products.find(p => p.id === productId);
        
        if (productToAdd) {
            addToCart(productToAdd);
            
            // TASK 6: Class Toggling for Animation
            const card = e.target.closest('.product-card') || e.target.closest('.summary-card');
            if (card) {
                card.classList.add('fade-in');
                setTimeout(() => card.classList.remove('fade-in'), 600);
            }
        }
    }
});

function addToCart(product) {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    saveCart();
}

function saveCart() {
    localStorage.setItem('petPalaceCart', JSON.stringify(cart));
    // Requirement: Calculate total using .reduce()
    const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    localStorage.setItem('cartTotal', total);
}

function renderCart() {
    const cartList = document.querySelector('.cart-items');
    const totalDisplay = document.querySelector('.total-price');
    if (!cartList) return;

    cartList.innerHTML = '';
    
    if (cart.length === 0) {
        cartList.innerHTML = '<li class="empty-msg">Your cart is empty.</li>';
        if (totalDisplay) totalDisplay.textContent = '0.00';
        return;
    }

    cart.forEach((item, index) => {
        const li = document.createElement('li');
        li.className = 'cart-item';
        li.innerHTML = `
            <span>${item.name} (₱${item.price.toFixed(2)})</span>
            <div>
                <input type="number" value="${item.quantity}" min="0" data-index="${index}" class="qty-input">
                <span class="price-val">${(item.price * item.quantity).toFixed(2)}</span>
            </div>
        `;
        cartList.appendChild(li);
    });

    const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    if (totalDisplay) totalDisplay.textContent = total.toFixed(2);
}

// Handle quantity changes
document.body.addEventListener('change', (e) => {
    if (e.target.classList.contains('qty-input')) {
        const index = e.target.getAttribute('data-index');
        const newQty = parseInt(e.target.value);
        
        if (newQty <= 0) {
            cart.splice(index, 1);
        } else {
            cart[index].quantity = newQty;
        }
        saveCart();
        renderCart();
    }
});

/* =====================================================
   TASK 4: FORM VALIDATION & CHECKOUT
   ===================================================== */
function handleCheckout() {
    const checkoutForm = document.getElementById('checkout-form');
    if (!checkoutForm) return;

    checkoutForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const requiredFields = checkoutForm.querySelectorAll('input[required]');
        let isValid = true;

        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                field.classList.add('error');
                isValid = false;
            } else {
                field.classList.remove('error');
            }
        });

        if (isValid) {
            alert("Order placed successfully! Redirecting...");
            localStorage.removeItem('petPalaceCart');
            localStorage.setItem('cartTotal', 0);
            window.location.href = 'landing.html';
        }
    });
}

/* =====================================================
   CHECKOUT PAGE UI SYNC
   ===================================================== */
function loadCheckoutSummary() {
    const checkoutPage = document.getElementById('checkout-page');
    if (!checkoutPage) return;

    const cartTotal = parseFloat(localStorage.getItem('cartTotal')) || 0;
    const subtotalElem = document.getElementById('checkout-subtotal');
    const shippingElem = document.getElementById('checkout-shipping');
    const totalElem = document.getElementById('checkout-total');
    const orderBtn = document.getElementById('place-order-btn');
    const emptyMsg = document.getElementById('empty-msg');

    if (cartTotal > 0) {
        const shippingFee = 50.00;
        subtotalElem.innerText = cartTotal.toFixed(2);
        shippingElem.innerText = shippingFee.toFixed(2);
        totalElem.innerText = (cartTotal + shippingFee).toFixed(2);
        
        orderBtn.disabled = false;
        emptyMsg.style.display = 'none';
    } else {
        orderBtn.disabled = true;
        orderBtn.style.opacity = "0.4";
        emptyMsg.style.display = 'block';
        setTimeout(() => { window.location.href = 'cart.html'; }, 3000);
    }
}

// INITIALIZE ALL
document.addEventListener('DOMContentLoaded', () => {
    loadProductDetails();
    renderCart();
    handleCheckout();
    loadCheckoutSummary();

    // Task 5: User Greeting
    const greeting = document.getElementById('user-greeting');
    if (greeting) greeting.textContent = "Rence A. Escala";
});
