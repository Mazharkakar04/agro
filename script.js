// Global variables
let products = [];
let cart = [];
let currentSort = 'default';
let adminLoggedIn = false;
let currentUser = null;
let isLoading = false;

// Simple, local data store
let localProducts = [
  {
    id: 1,
    name: 'Hot Pepper Hybrid (HPH-5531) Chilli Seeds',
    category: 'Seeds',
    basePrice: 150,
    description: 'High-quality seeds for maximum yield.',
    image: './images/product1.png',
    sizes: [{ size: '100g', multiplier: 1 }, { size: '200g', multiplier: 1.8 }]
  },
  {
    id: 2,
    name: 'Syngenta TO-1057 Tomato Seeds',
    category: 'Seeds',
    basePrice: 200,
    description: 'Produces firm, disease-resistant tomatoes.',
    image: './images/product2.png',
    sizes: [{ size: '50g', multiplier: 1 }, { size: '100g', multiplier: 1.9 }]
  },
  {
    id: 3,
    name: 'Cheramy RZ F1 (72-122) Cherry Tomato Seeds',
    category: 'Seeds',
    basePrice: 250,
    description: 'Sweet and juicy cherry tomatoes for a great harvest.',
    image: './images/product3.png',
    sizes: [{ size: '50g', multiplier: 1 }]
  },
  {
    id: 4,
    name: 'Hybrid Hot Pepper Sitara',
    category: 'Seeds',
    basePrice: 180,
    description: 'A robust hybrid pepper with high heat.',
    image: './images/product4.png',
    sizes: [{ size: '100g', multiplier: 1 }]
  },
  {
    id: 5,
    name: 'Dhaincha Seeds Sesbania aculeata',
    category: 'Seeds',
    basePrice: 120,
    description: 'Used for green manure and soil improvement.',
    image: './images/product5.png',
    sizes: [{ size: '1kg', multiplier: 1 }, { size: '5kg', multiplier: 4.5 }]
  },
  {
    id: 6,
    name: 'Sunrise BIO-FERTILIZER',
    category: 'Fertilizer',
    basePrice: 300,
    description: 'An organic bio-fertilizer that improves soil health.',
    image: './images/product6.png',
    sizes: [{ size: '1kg', multiplier: 1 }]
  }
];

// Simplified Authentication Functions
function loginAdmin(email, password) {
  if (email === 'admin' && password === 'admin123') {
    return { success: true };
  }
  return { success: false, error: 'Invalid credentials' };
}

// Simplified Product Management Functions
function getProducts() {
  return localProducts;
}

function addProduct(productData) {
  const newId = localProducts.length > 0 ? Math.max(...localProducts.map(p => p.id)) + 1 : 1;
  const newProduct = { ...productData, id: newId };
  localProducts.push(newProduct);
  return newProduct;
}

function updateProduct(productData) {
  const index = localProducts.findIndex(p => p.id === productData.id);
  if (index !== -1) {
    localProducts[index] = { ...localProducts[index], ...productData };
  }
  return productData;
}

function deleteProduct(productId) {
  localProducts = localProducts.filter(p => p.id !== parseInt(productId));
  return { success: true };
}

// Initialize the app
async function init() {
  showLoading();
  try {
    adminLoggedIn = false;
    document.querySelector('.admin-login-btn').style.display = 'flex';
    
    products = getProducts();
    
    loadCart();
    displayProducts();
    updateCartCount();
    updateSizeInputs();
  } catch (error) {
    console.error("Initialization error:", error);
    showToast("Error initializing app. Please refresh the page.");
  } finally {
    hideLoading();
  }
}

// Show loading spinner
function showLoading() {
  isLoading = true;
  document.getElementById('loading-spinner').style.display = 'flex';
}

// Hide loading spinner
function hideLoading() {
  isLoading = false;
  document.getElementById('loading-spinner').style.display = 'none';
}

// Display products
function displayProducts(productsToShow = products) {
  const grid = document.getElementById('products-grid');
  grid.innerHTML = '';

  let sortedProducts = [...productsToShow];
  if (currentSort === 'price-low') {
    sortedProducts.sort((a, b) => a.basePrice - b.basePrice);
  } else if (currentSort === 'price-high') {
    sortedProducts.sort((a, b) => b.basePrice - a.basePrice);
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
  col.className = 'col-xl-3 col-lg-4 col-md-6 col-sm-6 col-12 mb-4';
  
  const defaultSize = product.sizes[0];
  const defaultPrice = Math.round(product.basePrice * defaultSize.multiplier);
  
  col.innerHTML = `
    <div class="card product-card h-100 position-relative">
      <img src="${product.image}" class="card-img-top product-image" alt="${product.name}">
      <div class="card-body d-flex flex-column">
        <div class="d-flex justify-content-between align-items-start">
          <h5 class="card-title">${product.name}</h5>
        </div>
        <p class="small text-muted mb-2">${product.category}</p>
        <div class="mb-3">
          <label class="form-label fw-medium">Size:</label>
          <select class="form-select form-select-sm border-success" id="size-${product.id}" onchange="updatePrice(${product.id})">
            ${product.sizes.map(size => {
              const price = Math.round(product.basePrice * size.multiplier);
              return `<option value="${size.size}" data-multiplier="${size.multiplier}">
                        ${size.size} - ₹${price}
                      </option>`;
            }).join('')}
          </select>
        </div>
        <div class="mb-3">
          <label class="form-label fw-medium">Quantity:</label>
          <div class="quantity-controls">
            <button class="quantity-btn" onclick="changeQuantity(${product.id}, -1)">-</button>
            <input type="number" class="quantity-input" id="qty-${product.id}" value="1" min="1" max="99">
            <button class="quantity-btn" onclick="changeQuantity(${product.id}, 1)">+</button>
          </div>
        </div>
        <div class="mt-auto">
          <div class="d-flex align-items-center">
            <div class="price-tag me-2" id="price-${product.id}">₹${defaultPrice}</div>
          </div>
          <button class="btn btn-success w-100 mt-2 fw-medium" onclick="addToCart(${product.id})">
            <i class="fas fa-cart-plus me-2"></i>Add to Cart
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
  const multiplier = parseFloat(selectedOption.dataset.multiplier);
  const price = Math.round(product.basePrice * multiplier);
  
  document.getElementById(`price-${productId}`).innerHTML = `₹${price}`;
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
  const multiplier = parseFloat(selectedOption.dataset.multiplier);
  const quantity = parseInt(document.getElementById(`qty-${product.id}`).value);
  const price = Math.round(product.basePrice * multiplier);

  const cartItem = {
    id: productId,
    name: product.name,
    size: selectedSize,
    quantity: quantity,
    price: price,
    total: price * quantity,
    image: product.image
  };

  const existingIndex = cart.findIndex(item => 
    item.id === productId && item.size === selectedSize
  );

  if (existingIndex > -1) {
    cart[existingIndex].quantity += quantity;
    cart[existingIndex].total = cart[existingIndex].price * cart[existingIndex].quantity;
  } else {
    cart.push(cartItem);
  }

  saveCart();
  updateCartCount();
  showToast(`${product.name} (${selectedSize}) added to cart!`);
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
  document.getElementById('admin-section').style.display = 'none';
  displayCartItems();
}

// Show products
function showProducts() {
  document.getElementById('cart-section').style.display = 'none';
  document.getElementById('products-section').style.display = 'block';
  document.getElementById('admin-section').style.display = 'none';
}

// Display cart items
function displayCartItems() {
  const cartItemsContainer = document.getElementById('cart-items');
  const cartSummary = document.getElementById('cart-summary');

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = `
      <div class="empty-cart">
        <i class="fas fa-shopping-cart fa-3x mb-3"></i>
        <h4>Your cart is empty</h4>
        <p class="mb-4">Add some fresh products to get started!</p>
        <button class="btn btn-success px-4 py-2 fw-medium" onclick="showProducts()">
          <i class="fas fa-leaf me-2"></i>Browse Products
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
                  <span class="text-muted">Size: ${item.size}</span>
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
    showToast('Your cart is empty!');
    return;
  }

  let message = "🛒 *NEW ORDER - JILANI AGRO PRODUCTS* 🛒\n\n";
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
  message += "_Thank you for choosing Jilani Agro!_";

  const whatsappNumber = "919561768395"; 
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

// ADMIN FUNCTIONS

// Show admin login modal
function showAdminLogin() {
  document.getElementById('admin-login-modal').style.display = 'block';
}

// Hide admin login modal
function hideAdminLogin() {
  document.getElementById('admin-login-modal').style.display = 'none';
}

// Admin login with a simple check
function adminLogin(event) {
  event.preventDefault();
  showLoading();
  
  const email = document.getElementById('admin-email').value;
  const password = document.getElementById('admin-password').value;
  const errorElement = document.getElementById('login-error');
  
  try {
    const result = loginAdmin(email, password);
    if (result.success) {
      adminLoggedIn = true;
      hideAdminLogin();
      showAdminPanel();
      errorElement.style.display = 'none';
      document.querySelector('.admin-login-btn').style.display = 'none';
    } else {
      errorElement.textContent = result.error || 'Invalid credentials';
      errorElement.style.display = 'block';
    }
  } catch (error) {
    console.error("Login error:", error);
    errorElement.textContent = error.message || 'Login failed';
    errorElement.style.display = 'block';
  } finally {
    hideLoading();
  }
}

// Admin logout
function adminLogout() {
  showLoading();
  try {
    adminLoggedIn = false;
    showProducts();
    document.querySelector('.admin-login-btn').style.display = 'flex';
  } catch (error) {
    console.error("Logout error:", error);
    showToast('Error logging out');
  } finally {
    hideLoading();
  }
}

// Show admin panel
function showAdminPanel() {
  document.getElementById('products-section').style.display = 'none';
  document.getElementById('cart-section').style.display = 'none';
  document.getElementById('admin-section').style.display = 'block';
  updateAdminProductsList();
}

// Add size input fields
function addSizeInput(sizeValue = '', multiplierValue = '') {
  const sizeContainer = document.getElementById('size-container');
  const sizeId = Date.now();
  
  const sizeDiv = document.createElement('div');
  sizeDiv.className = 'size-controls';
  sizeDiv.innerHTML = `
    <div class="size-inputs">
      <input type="text" class="form-control" placeholder="Size (e.g., 1kg)" value="${sizeValue}" required>
      <input type="number" class="form-control" placeholder="Multiplier" min="0.1" step="0.1" value="${multiplierValue}" required>
    </div>
    <button type="button" class="btn-remove-size" onclick="removeSizeInput(this)">
      <i class="fas fa-times"></i>
    </button>
  `;
  
  sizeContainer.appendChild(sizeDiv);
}

// Remove size input
function removeSizeInput(button) {
  button.closest('.size-controls').remove();
}

// Update size inputs on page load
function updateSizeInputs() {
  const sizeContainer = document.getElementById('size-container');
  sizeContainer.innerHTML = `
    <div class="size-controls">
      <div class="size-inputs">
        <input type="text" class="form-control" placeholder="Size (e.g., 1kg)" required>
        <input type="number" class="form-control" placeholder="Multiplier" min="0.1" step="0.1" required>
      </div>
    </div>
  `;
}

// Add product locally
function handleAddProduct(event) {
  event.preventDefault();
  showLoading();
  
  try {
    const name = document.getElementById('product-name').value;
    const category = document.getElementById('product-category').value;
    const basePrice = parseFloat(document.getElementById('product-price').value);
    const description = document.getElementById('product-description').value;
    const imageUrl = document.getElementById('product-image').value;
    
    const sizes = [];
    const sizeControls = document.querySelectorAll('.size-controls');
    sizeControls.forEach(control => {
      const inputs = control.querySelectorAll('input');
      const size = inputs[0].value;
      const multiplier = parseFloat(inputs[1].value);
      
      if (size && multiplier) {
        sizes.push({ size, multiplier });
      }
    });
    
    if (!name || !category || isNaN(basePrice)) {
      showToast('Please fill all required fields!');
      return;
    }
    
    if (!imageUrl) {
      showToast('Please provide an image URL!');
      return;
    }
    
    if (sizes.length === 0) {
      showToast('Please add at least one size option!');
      return;
    }
    
    const newProduct = {
      name,
      basePrice,
      category,
      description,
      sizes,
      image: imageUrl
    };
    
    addProduct(newProduct);
    
    products = getProducts();
    
    document.getElementById('product-form').reset();
    document.getElementById('image-preview').style.display = 'none';
    updateSizeInputs();
    
    showToast(`${name} added successfully!`);
    updateAdminProductsList();
  } catch (error) {
    console.error("Error adding product:", error);
    showToast("Error adding product. Please try again.");
  } finally {
    hideLoading();
  }
}

// Update admin products list
function updateAdminProductsList() {
  const list = document.getElementById('admin-products-list');
  list.innerHTML = '';
  
  products.forEach(product => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${product.id}</td>
      <td>${product.name}</td>
      <td>${product.category}</td>
      <td class="price-tag">₹${product.basePrice}</td>
      <td>
        <button class="btn btn-sm btn-warning me-2" onclick="handleEditProduct('${product.id}')">
           <i class="fas fa-edit"></i> Edit
         </button>
         <button class="btn btn-sm btn-danger" onclick="handleDeleteProduct('${product.id}')">
           <i class="fas fa-trash"></i> Delete
         </button>
      </td>
    `;
    list.appendChild(row);
  });
}

// Edit product
let currentEditingProductId = null;

function handleEditProduct(productId) {
  currentEditingProductId = productId;
  const product = products.find(p => p.id === parseInt(productId));
  
  if (!product) return;
  
  document.getElementById('product-name').value = product.name;
  document.getElementById('product-category').value = product.category;
  document.getElementById('product-price').value = product.basePrice;
  document.getElementById('product-description').value = product.description;
  document.getElementById('product-image').value = product.image;
  
  document.getElementById('size-container').innerHTML = '';
  
  product.sizes.forEach(size => {
    addSizeInput(size.size, size.multiplier);
  });
  
  const submitButton = document.querySelector('#product-form button[type="submit"]');
  submitButton.innerHTML = '<i class="fas fa-save me-2"></i>Update Product';
  
  const form = document.getElementById('product-form');
  form.removeEventListener('submit', handleAddProduct);
  form.addEventListener('submit', handleUpdateProduct);
  
  form.scrollIntoView({ behavior: 'smooth' });
}

// Update product locally
function handleUpdateProduct(event) {
  event.preventDefault();
  showLoading();
  
  try {
    const name = document.getElementById('product-name').value;
    const category = document.getElementById('product-category').value;
    const basePrice = parseFloat(document.getElementById('product-price').value);
    const description = document.getElementById('product-description').value;
    const imageUrl = document.getElementById('product-image').value;
    
    const sizes = [];
    const sizeControls = document.querySelectorAll('.size-controls');
    sizeControls.forEach(control => {
      const inputs = control.querySelectorAll('input');
      const size = inputs[0].value;
      const multiplier = parseFloat(inputs[1].value);
      
      if (size && multiplier) {
        sizes.push({ size, multiplier });
      }
    });
    
    if (!name || !category || isNaN(basePrice)) {
      showToast('Please fill all required fields!');
      return;
    }
    
    if (sizes.length === 0) {
      showToast('Please add at least one size option!');
      return;
    }
    
    const updatedProduct = {
      id: parseInt(currentEditingProductId),
      name,
      basePrice,
      category,
      description,
      sizes,
      image: imageUrl
    };
    
    updateProduct(updatedProduct);
    
    products = getProducts();
    
    resetProductForm();
    
    showToast(`${name} updated successfully!`);
    updateAdminProductsList();
  } catch (error) {
    console.error("Error updating product:", error);
    showToast("Error updating product. Please try again.");
  } finally {
    hideLoading();
  }
}

// Reset product form
function resetProductForm() {
  document.getElementById('product-form').reset();
  document.getElementById('image-preview').style.display = 'none';
  updateSizeInputs();
  
  const submitButton = document.querySelector('#product-form button[type="submit"]');
  submitButton.innerHTML = '<i class="fas fa-plus-circle me-2"></i>Add Product';
  
  const form = document.getElementById('product-form');
  form.removeEventListener('submit', handleUpdateProduct);
  form.addEventListener('submit', handleAddProduct);
  
  currentEditingProductId = null;
}

// Delete product from local store
function handleDeleteProduct(productId) {
  if (confirm('Are you sure you want to delete this product?')) {
    showLoading();
    try {
      deleteProduct(productId);
      products = getProducts();
      updateAdminProductsList();
      showToast('Product deleted successfully!');
    } catch (error) {
      console.error("Error deleting product:", error);
      showToast("Error deleting product. Please try again.");
    } finally {
      hideLoading();
    }
  }
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
   init();
   document.getElementById('product-form').addEventListener('submit', handleAddProduct);
   
   document.getElementById('product-image').addEventListener('input', function(e) {
      const url = e.target.value;
      const preview = document.getElementById('image-preview');
      preview.src = url;
      preview.style.display = 'block';
   });
 });
