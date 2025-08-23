// Global variables
let products = [];
let cart = [];
let currentSort = 'default';

// Localization
const translations = {
    en: {
        'title': 'Smart Agro - Premium Farm Products',
        'lang-button': 'Language',
        'hero-title': 'Premium Agricultural Products',
        'hero-subtitle': 'High-quality fertilizers and plant nutrients for maximum crop yield and healthy soil',
        'search-placeholder': 'Search products...',
        'products-heading': 'OUR PRODUCTS',
        'cart-heading': 'Your Cart',
        'continue-shopping': 'Continue Shopping',
        'empty-cart-title': 'Your cart is empty',
        'empty-cart-text': 'Add some fresh products to get started!',
        'browse-products': 'Browse Products',
        'summary-heading': 'Order Summary',
        'total-items': 'Total Items:',
        'total-amount': 'Total Amount:',
        'order-whatsapp': 'Order on WhatsApp',
        'card-label-size': 'Size:',
        'card-label-quantity': 'Quantity:',
        'add-to-cart': 'Add to Cart',
        'footer-text': 'Providing high-quality agricultural solutions to farmers. Committed to sustainable farming practices.',
        'quick-links': 'Quick Links',
        'link-home': 'Home',
        'link-products': 'Products',
        'link-cart': 'Cart',
        'copyright': '© 2025 Smart Agro. All rights reserved.',
        'toast-added-to-cart': 'added to cart!',
        'toast-cart-empty': 'Your cart is empty!'
    },
    hi: {
        'title': 'स्मार्ट एग्रो - प्रीमियम कृषि उत्पाद',
        'lang-button': 'भाषा',
        'hero-title': 'प्रीमियम कृषि उत्पाद',
        'hero-subtitle': 'अधिकतम फसल उपज और स्वस्थ मिट्टी के लिए उच्च गुणवत्ता वाले उर्वरक और पौध पोषक तत्व',
        'search-placeholder': 'उत्पादों को खोजें...',
        'products-heading': 'हमारे उत्पाद',
        'cart-heading': 'आपकी कार्ट',
        'continue-shopping': 'खरीदारी जारी रखें',
        'empty-cart-title': 'आपकी कार्ट खाली है',
        'empty-cart-text': 'शुरू करने के लिए कुछ ताजे उत्पाद जोड़ें!',
        'browse-products': 'उत्पादों को ब्राउज़ करें',
        'summary-heading': 'ऑर्डर सारांश',
        'total-items': 'कुल आइटम:',
        'total-amount': 'कुल राशि:',
        'order-whatsapp': 'व्हाट्सएप पर ऑर्डर करें',
        'card-label-size': 'आकार:',
        'card-label-quantity': 'मात्रा:',
        'add-to-cart': 'कार्ट में जोड़ें',
        'footer-text': 'किसानों को उच्च गुणवत्ता वाले कृषि समाधान प्रदान करना। टिकाऊ खेती के तरीकों के लिए प्रतिबद्ध।',
        'quick-links': 'त्वरित लिंक',
        'link-home': 'होम',
        'link-products': 'उत्पाद',
        'link-cart': 'कार्ट',
        'copyright': '© 2025 स्मार्ट एग्रो। सर्वाधिकार सुरक्षित।',
        'toast-added-to-cart': 'कार्ट में जोड़ा गया!',
        'toast-cart-empty': 'आपकी कार्ट खाली है!'
    }
};

let currentLanguage = 'en';

// Switch language
function switchLanguage(lang) {
    currentLanguage = lang;
    document.documentElement.lang = lang;
    
    // Update all static text with data-lang-key
    document.querySelectorAll('[data-lang-key]').forEach(element => {
        const key = element.getAttribute('data-lang-key');
        if (translations[lang][key]) {
            if (element.tagName === 'INPUT' && element.hasAttribute('placeholder')) {
                element.placeholder = translations[lang][key];
            } else {
                element.textContent = translations[lang][key];
            }
        }
    });

    // Update dynamically generated content
    displayProducts();
    displayCartItems();
    updateCartSummary();
}

// Initialize the app
async function init() {
    try {
        // Replace this URL with your published Google Sheet CSV URL
        const googleSheetUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTulUvh8oHP_3zL3k3z1dDFmVtbEOC86a2CDurhILvVEjJxclMKea-ITH1mazVyuoo2L_INaRBq8u5s/pub?gid=0&single=true&output=csv';
        const response = await fetch(googleSheetUrl);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const csvData = await response.text();
        products = parseCsvToProducts(csvData);

        loadCart();
        switchLanguage('en'); // Set initial language to English
        updateCartCount();
    } catch (error) {
        console.error("Initialization error:", error);
        showToast("Error initializing app. Please check the data source.");
    }
}

// Helper function to parse CSV from Google Sheet and convert to products array
function parseCsvToProducts(csv) {
    const rows = csv.split('\n').map(row => row.trim()).filter(row => row.length > 0);
    const headers = rows[0].split(',');
    const data = rows.slice(1);

    const productsArray = data.map(row => {
        const values = row.split(',');
        const product = {};
        headers.forEach((header, index) => {
            product[header.trim()] = values[index].trim();
        });

        // Convert data types
        product.id = parseInt(product.id);
        
        // Handle the sizes and discounts arrays
        if (product.sizes) {
            const sizeValues = product.sizes.split('|').map(sizePair => {
                const [size, price] = sizePair.split(':');
                return {
                    size: size,
                    price: parseFloat(price)
                };
            });
            const discountValues = product.discounts ? product.discounts.split('|').map(d => parseFloat(d) || 0) : new Array(sizeValues.length).fill(0);

            product.sizes = sizeValues.map((sizeObj, index) => ({
                ...sizeObj,
                discount: discountValues[index]
            }));
        }

        return product;
    });

    return productsArray;
}

// Display products
function displayProducts(productsToShow = products) {
    const grid = document.getElementById('products-grid');
    grid.innerHTML = '';

    let sortedProducts = [...productsToShow];
    if (currentSort === 'price-low') {
        sortedProducts.sort((a, b) => {
            const aPrice = a.sizes[0].price - a.sizes[0].discount;
            const bPrice = b.sizes[0].price - b.sizes[0].discount;
            return aPrice - bPrice;
        });
    } else if (currentSort === 'price-high') {
        sortedProducts.sort((a, b) => {
            const aPrice = a.sizes[0].price - a.sizes[0].discount;
            const bPrice = b.sizes[0].price - b.sizes[0].discount;
            return bPrice - aPrice;
        });
    } else if (currentSort === 'name') {
        sortedProducts.sort((a, b) => a.name.localeCompare(b.name));
    }

    sortedProducts.forEach(product => {
        const card = createProductCard(product);
        grid.appendChild(card);
    });
}

// Create product card
function createProductCard(product) {
    const col = document.createElement('div');
  col.className = 'col-xl-3 col-lg-4 col-md-6 col-sm-6 col-6 mb-4';

    const defaultSize = product.sizes[0];
    const originalPrice = Math.round(defaultSize.price);
    const discountedPrice = Math.round(originalPrice - defaultSize.discount);
    const discountAmount = defaultSize.discount;

    col.innerHTML = `
    <div class="card product-card h-100 position-relative">
  <img src="${product.image}" class="card-img-top product-image" alt="${product.name}">
      <div class="card-body d-flex flex-column">
        <div class="d-flex justify-content-between align-items-start">
          <h5 class="card-title">${product.name}</h5>
        </div>
        <p class="small text-muted mb-2">${product.category}</p>
        <div class="mb-3">
          <label class="form-label fw-medium" data-lang-key="card-label-size">${translations[currentLanguage]['card-label-size']}</label>
          <select class="form-select form-select-sm border-success" id="size-${product.id}" onchange="updatePrice(${product.id})">
            ${product.sizes.map(size => {
                const sizeOriginalPrice = Math.round(size.price);
                const sizeDiscountedPrice = Math.round(sizeOriginalPrice - size.discount);
                return `<option value="${size.size}" data-price="${size.price}" data-discount="${size.discount}">
                        ${size.size} - ₹${sizeDiscountedPrice}
                      </option>`;
            }).join('')}
          </select>
        </div>
        <div class="mb-3">
          <label class="form-label fw-medium" data-lang-key="card-label-quantity">${translations[currentLanguage]['card-label-quantity']}</label>
          <div class="quantity-controls">
            <button class="quantity-btn" onclick="changeQuantity(${product.id}, -1)">-</button>
            <input type="number" class="quantity-input" id="qty-${product.id}" value="1" min="1" max="99">
            <button class="quantity-btn" onclick="changeQuantity(${product.id}, 1)">+</button>
          </div>
        </div>
        <div class="mt-auto">
          <div class="d-flex align-items-center mb-1">
            ${discountAmount > 0 ? `<span class="discount-badge me-2">₹${discountAmount} OFF</span>` : ''}
          </div>
          <div class="d-flex align-items-center">
            ${discountAmount > 0 ? `<div class="me-2 text-decoration-line-through text-muted" id="original-price-${product.id}">₹${originalPrice}</div>` : ''}
            <div class="price-tag" id="price-${product.id}">₹${discountedPrice}</div>
          </div>
          <button class="btn btn-success w-100 mt-2 fw-medium" onclick="addToCart(${product.id})" data-lang-key="add-to-cart">
            <i class="fas fa-cart-plus me-2"></i>${translations[currentLanguage]['add-to-cart']}
          </button>
        </div>
      </div>
    </div>
  `;
    return col;
}

// Update price when size changes
function updatePrice(productId) {
    const product = products.find(p => p.id === productId);
    const sizeSelect = document.getElementById(`size-${productId}`);
    const selectedOption = sizeSelect.selectedOptions[0];
    const originalPrice = parseFloat(selectedOption.dataset.price);
    const discount = parseFloat(selectedOption.dataset.discount);
    
    const discountedPrice = Math.round(originalPrice - discount);

    document.getElementById(`price-${productId}`).innerHTML = `₹${discountedPrice}`;
    
    const originalPriceEl = document.getElementById(`original-price-${productId}`);
    if (originalPriceEl) {
        originalPriceEl.innerHTML = `₹${originalPrice}`;
    }

    const discountBadge = document.querySelector(`#products-grid .col-xl-3.col-lg-4.col-md-6.col-sm-6.col-12.mb-4:has(#size-${productId}) .discount-badge`);
    if (discountBadge) {
        if (discount > 0) {
            discountBadge.textContent = `₹${discount} OFF`;
            discountBadge.style.display = 'inline-block';
        } else {
            discountBadge.style.display = 'none';
        }
    }
}

// Change quantity
function changeQuantity(productId, change) {
    const qtyInput = document.getElementById(`qty-${productId}`);
    let newQty = parseInt(qtyInput.value) + change;
    if (newQty < 1) newQty = 1;
    if (newQty > 99) newQty = 99;
    qtyInput.value = newQty;
}

// Search products
function searchProducts() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm) ||
        product.category.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm)
    );
    displayProducts(filteredProducts);
}

// Add to cart
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    const sizeSelect = document.getElementById(`size-${productId}`);
    const selectedOption = sizeSelect.selectedOptions[0];
    const selectedSize = sizeSelect.value;
    const originalPrice = parseFloat(selectedOption.dataset.price);
    const discount = parseFloat(selectedOption.dataset.discount);
    
    const price = Math.round(originalPrice - discount);

    const cartItem = {
        id: productId,
        name: product.name,
        size: selectedSize,
        quantity: parseInt(document.getElementById(`qty-${product.id}`).value),
        price: price,
        total: price * parseInt(document.getElementById(`qty-${product.id}`).value),
        image: product.image
    };

    const existingIndex = cart.findIndex(item =>
        item.id === productId && item.size === selectedSize
    );

    if (existingIndex > -1) {
        cart[existingIndex].quantity += cartItem.quantity;
        cart[existingIndex].total = cart[existingIndex].price * cart[existingIndex].quantity;
    } else {
        cart.push(cartItem);
    }

    saveCart();
    updateCartCount();
    showToast(`${product.name} (${selectedSize}) ${translations[currentLanguage]['toast-added-to-cart']}`);
}

// Show toast notification
function showToast(message) {
    const existingToasts = document.querySelectorAll('.toast');
    existingToasts.forEach(toast => toast.remove());

    const toastEl = document.createElement('div');
    toastEl.className = 'toast align-items-center text-white bg-success border-0 position-fixed bottom-0 end-0 m-3';
    toastEl.setAttribute('role', 'alert');
    toastEl.setAttribute('aria-live', 'assertive');
    toastEl.setAttribute('aria-atomic', 'true');

    toastEl.innerHTML = `
    <div class="d-flex">
      <div class="toast-body d-flex align-items-center">
        <i class="fas fa-check-circle me-2"></i> ${message}
      </div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
    </div>
  `;

    document.body.appendChild(toastEl);

    const toast = new bootstrap.Toast(toastEl, {
        autohide: true,
        delay: 3000
    });
    toast.show();
}

// Show cart
function showCart() {
    document.getElementById('products-section').style.display = 'none';
    document.getElementById('cart-section').style.display = 'block';
    displayCartItems();
}

// Show products
function showProducts() {
    document.getElementById('cart-section').style.display = 'none';
    document.getElementById('products-section').style.display = 'block';
}

// Display cart items
function displayCartItems() {
    const cartItemsContainer = document.getElementById('cart-items');
    const cartSummary = document.getElementById('cart-summary');

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
      <div class="empty-cart">
        <i class="fas fa-shopping-cart fa-3x mb-3"></i>
        <h4>${translations[currentLanguage]['empty-cart-title']}</h4>
        <p class="mb-4">${translations[currentLanguage]['empty-cart-text']}</p>
        <button class="btn btn-success px-4 py-2 fw-medium" onclick="showProducts()">
          <i class="fas fa-leaf me-2"></i>${translations[currentLanguage]['browse-products']}
        </button>
      </div>
    `;
        cartSummary.style.display = 'none';
        return;
    }

    cartItemsContainer.innerHTML = cart.map((item, index) => `
    <div class="card mb-3 overflow-hidden">
      <div class="row g-0">
        <div class="col-md-2 col-4">
          <img src="${item.image}" class="cart-item-img w-100" alt="${item.name}">
        </div>
        <div class="col-md-10 col-8">
          <div class="card-body py-2">
            <div class="row">
              <div class="col-md-6 col-12 cart-item-details">
                <h5 class="card-title mb-1">${item.name}</h5>
                <p class="card-text mb-1">
                  <span class="text-muted">${translations[currentLanguage]['card-label-size']}: ${item.size}</span>
                </p>
                <p class="card-text mb-0">
                  <span class="text-success fw-medium">₹${item.price} each</span>
                </p>
              </div>
              <div class="col-md-3 col-12 mt-2 mt-md-0">
                <div class="quantity-controls">
                  <button class="quantity-btn" onclick="updateCartQuantity(${index}, -1)">-</button>
                  <input type="number" class="quantity-input" value="${item.quantity}" min="1" max="99" readonly>
                  <button class="quantity-btn" onclick="updateCartQuantity(${index}, 1)">+</button>
                </div>
              </div>
              <div class="col-md-2 col-6 mt-2 mt-md-0">
                <div class="price-tag">₹${item.total}</div>
              </div>
              <div class="col-md-1 col-6 mt-2 mt-md-0 text-end">
                <button class="btn btn-outline-danger btn-sm" onclick="removeFromCart(${index})">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `).join('');

    updateCartSummary();
    cartSummary.style.display = 'block';
}

// Update cart quantity
function updateCartQuantity(index, change) {
    cart[index].quantity += change;
    if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
    } else {
        cart[index].total = cart[index].price * cart[index].quantity;
    }

    saveCart();
    updateCartCount();
    displayCartItems();
}

// Remove from cart
function removeFromCart(index) {
    cart.splice(index, 1);
    saveCart();
    updateCartCount();
    displayCartItems();
}

// Update cart summary
function updateCartSummary() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalAmount = cart.reduce((sum, item) => sum + item.total, 0);

    document.getElementById('total-items').textContent = totalItems;
    document.getElementById('total-amount').textContent = `₹${totalAmount}`;
}

// Order on WhatsApp
function orderOnWhatsApp() {
    if (cart.length === 0) {
        showToast(translations[currentLanguage]['toast-cart-empty']);
        return;
    }

    let message = "🛒 *NEW ORDER - SMART AGRO PRODUCTS* 🛒\n\n";
    message += "*Order Details:*\n\n";

    cart.forEach((item, index) => {
        message += `➤ *${item.name}*\n`;
        message += `   ▫️ Size: ${item.size}\n`;
        message += `   ▫️ Quantity: ${item.quantity}\n`;
        message += `   ▫️ Price: ₹${item.total}\n\n`;
    });

    const totalAmount = cart.reduce((sum, item) => sum + item.total, 0);
    message += `*TOTAL ITEMS: ${cart.reduce((sum, item) => sum + item.quantity, 0)}*\n`;
    message += `*TOTAL AMOUNT: ₹${totalAmount}*\n\n`;
    message += "Please confirm this order and provide delivery address.\n\n";
    message += "_Thank you for choosing Smart Agro!_";

    const whatsappNumber = "919356579997";
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
}

// Update cart count
function updateCartCount() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    const badge = document.getElementById('cart-count');
    badge.textContent = count;

    if (count === 0) {
        badge.style.display = 'none';
    } else {
        badge.style.display = 'inline';
    }
}

// Save cart to localStorage
function saveCart() {
    try {
        localStorage.setItem('jilaniAgroCart', JSON.stringify(cart));
    } catch (error) {
        console.log('Error saving cart:', error);
    }
}

// Load cart from localStorage
function loadCart() {
    try {
        const cartData = localStorage.getItem('jilaniAgroCart');
        if (cartData) {
            cart = JSON.parse(cartData);
        }
    } catch (error) {
        console.log('Error loading cart:', error);
        cart = [];
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', init);
