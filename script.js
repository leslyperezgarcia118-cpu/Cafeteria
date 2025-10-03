// Carrito
let cart = JSON.parse(localStorage.getItem('cart')) || [];
const prices = {
  'Expresso': 35, 'Americano': 40, 'Capuchino': 50, 'Latte': 50, 'Lechero': 45,
  'Caramel Macchiato': 65, 'Moka Oscuro': 60, 'Moka Blanco': 60, 'Espresso Macchiato': 40,
  'Flat White': 55, 'Cortado': 40, 'Affogato': 55, 'Chocolate Caliente': 50, 'Chocolate Blanco': 55,
  'Matcha Latte': 70, 'Taro Latte': 60, 'Chai Latte': 65, 'Tisana Frutal': 50, 'Té Herbal': 33,
  'Soda Italiana': 50, 'Golden Milk': 60, 'Lemonade': 45, 'Frappé Moka': 60, 'Frappé Caramel': 65,
  'Frappé Matcha': 70, 'Frappé Taro': 65, 'Frappé Chai': 70, 'Pack de Galletas': 100,
  'Galletas Nuez Canela': 38.50, 'Orejitas de Hojaldre': 38.50, 'Galletas Nuez Azúcar Glass': 38.50,
  'Croissant Clásico': 45, 'Pan Dulce Variado': 30, 'Muffin de Chocolate': 40, 'Brownie con Nuez': 35,
  'Cookie Gigante': 50, 'Barra de Granola': 25, 'Mezcla de la Casa': 110, 'Mezcla Oscura': 120,
  'Mezcla Arábica': 200, 'Mezcla Descafeinada': 130, 'Mezcla Espresso': 220, 'Mezcla Orgánica': 150,
  'Tisana Herbal': 33, 'Tisana Manzanilla': 40, 'Tisana Menta': 45, 'Tisana Jengibre': 55, 'Tisana Verde': 60
};

function addToCart(item) {
  cart.push(item);
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
  updateCartTotal();
  alert(`${item} agregado al carrito`);
}

function updateCartCount() {
  document.getElementById('cart-count').innerText = cart.length;
}

function updateCartTotal() {
  const total = cart.reduce((sum, item) => sum + (prices[item] || 0), 0);
  document.getElementById('cart-total').innerText = total.toFixed(2);
}

function showCart() {
  const modal = document.getElementById('cart-modal');
  const list = document.getElementById('cart-items');
  list.innerHTML = '';
  cart.forEach(item => {
    const li = document.createElement('li');
    li.innerText = `${item} - $${prices[item] || 'N/A'}`;
    list.appendChild(li);
  });
  updateCartTotal();
  modal.style.display = 'block';
}

function closeCart() {
  document.getElementById('cart-modal').style.display = 'none';
}

function clearCart() {
  cart = [];
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
  updateCartTotal();
  showCart();
}

function checkout() {
  closeCart();
  window.location.href = '/checkout';
}

// Búsqueda
function searchProducts() {
  const input = document.getElementById('search').value.toLowerCase();
  const products = document.querySelectorAll('.product');
  products.forEach(product => {
    const text = product.innerText.toLowerCase();
    product.style.display = text.includes(input) ? 'block' : 'none';
  });
}

// Chequeo de login para nav
function checkLogin() {
  fetch('/is-logged')
    .then(res => res.json())
    .then(logged => {
      const accountLink = document.getElementById('account-link');
      if (logged) {
        accountLink.innerHTML = '<a href="/logout">Cerrar Sesión</a>';
      } else {
        accountLink.innerHTML = '<a href="/login">Iniciar Sesión</a>';
      }
    });
}

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
  updateCartCount();
  updateCartTotal();
  checkLogin();
});