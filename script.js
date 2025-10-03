const apiUrl = 'https://simple-shopping-cart-backend-o3bs.onrender.com';
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Fetch products from backend
async function fetchProducts() {
  try {
    const res = await fetch(`${apiUrl}/products`);
    const products = await res.json();
    renderProducts(products);
  } catch (error) {
    console.error("Failed to fetch products:", error);
  }
}

// Render products grid
function renderProducts(products) {
  const container = document.getElementById('products');
  container.innerHTML = '';
  products.forEach(p => {
    const div = document.createElement('div');
    div.className = 'product';
    div.innerHTML = `
      <img src="${apiUrl + p.imageUrl}" alt="${p.name}">
      <div class="price-tag">
        <h4>${p.name}</h4>
        <p>&#8377;${p.discountedPrice.toLocaleString('en-IN')}&nbsp;
          <span>&#8377;${p.originalPrice.toLocaleString('en-IN')}</span>&nbsp;
          <span>${p.discountPercent}%off</span>
        </p>
        <button onclick="addToCart(${p.id}, '${p.name}', ${p.discountedPrice}, '${apiUrl + p.imageUrl}', ${p.originalPrice}, ${p.discountPercent})">
          <i class="fa-solid fa-cart-shopping"></i>&nbsp;&nbsp;Add to Cart
        </button>
      </div>
    `;
    container.appendChild(div);
  });
}


// Add to cart
function addToCart(id, name, price, imageUrl, oldPrice, discountPercent) {
  const existing = cart.find(item => item.id === id);
  if (existing) existing.quantity += 1;
  else cart.push({ id, name, price, oldPrice, discountPercent, imageUrl, quantity: 1 });
  saveCart();
  alert(`${name} added to cart!`);
}

// Save cart & update UI
function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartUI();
}

// Render cart modal
function updateCartUI() {
  const cartItems = document.getElementById('cart-items');
  const priceDetails = document.querySelector('.price-details'); // Right panel
  cartItems.innerHTML = '';

  if(cart.length === 0) {
    cartItems.innerHTML = `
      <div style="text-align:center; padding:50px;">
        <img src="https://simple-shopping-cart-backend-o3bs.onrender.com/images/carterror.png" alt="Empty Cart" style="width:150px; margin-bottom:20px;">
        <h3>Your cart is empty!</h3>
        <p>Explore our wide selection and find something you like</p>
      </div>
    `;

    // Hide the entire price details panel
    priceDetails.style.display = 'none';
    document.getElementById('cart-count').innerText = 0;
    return;
  }

  // Show price details if cart has items
  priceDetails.style.display = 'block';

  let totalPrice = 0;
  let totalDiscount = 0;
  let totalQty = 0;

  cart.forEach(item => {
    totalPrice += item.price * item.quantity;
    totalDiscount += (item.oldPrice - item.price) * item.quantity;
    totalQty += item.quantity;

    const div = document.createElement('div');
    div.className = 'cart-item';
    div.innerHTML = `
      <img src="${item.imageUrl}" alt="${item.name}">
      <div class="item-details">
        <h4>${item.name}</h4>
        <div class="price">
          <span class="old-price">₹${item.oldPrice.toLocaleString('en-IN')}</span>
          ₹${item.price.toLocaleString('en-IN')}
          <span class="discount">${item.discountPercent}% Off</span>
        </div>
        <div class="qty">
          <button onclick="changeQty(${item.id}, -1)">-</button>
          <span>${item.quantity}</span>
          <button onclick="changeQty(${item.id}, 1)">+</button>
        </div>
        <div class="actions">
          <button onclick="removeFromCart(${item.id})">REMOVE</button>
        </div>
      </div>
    `;
    cartItems.appendChild(div);
  });

  const platformFee = cart.length ? 7 : 0;
  document.getElementById('total-items').innerText = totalQty;
  document.getElementById('total-price').innerText = totalPrice.toLocaleString('en-IN');
  document.getElementById('total-discount').innerText = totalDiscount.toLocaleString('en-IN');
  document.getElementById('final-total').innerText = (totalPrice - totalDiscount + platformFee).toLocaleString('en-IN');

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  document.getElementById('cart-count').innerText = cartCount;
}


// Change quantity
function changeQty(id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.quantity += delta;
  if (item.quantity <= 0) removeFromCart(id);
  saveCart();
}

// Remove item
function removeFromCart(id) {
  cart = cart.filter(item => item.id !== id);
  saveCart();
}

// Cart modal functionality
const cartBtn = document.getElementById('cart-btn');
const cartModal = document.getElementById('cart-modal');
const closeCart = document.getElementById('close-cart');

cartBtn.onclick = () => cartModal.style.display = 'block';
closeCart.onclick = () => cartModal.style.display = 'none';
window.onclick = e => { if(e.target === cartModal) cartModal.style.display = 'none'; }

// Checkout
document.getElementById('checkout').onclick = async () => {
  if(cart.length === 0) return alert('Cart is empty!');
  try {
    const res = await fetch(`${apiUrl}/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cart })
    });
    const data = await res.json();
    alert('Order placed successfully!');
    cart = [];
    saveCart();
  } catch (error) {
    console.error("Checkout failed:", error);
  }
}

// Initialize
fetchProducts();
updateCartUI();
