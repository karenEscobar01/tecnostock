import { getProducts } from './api.js';
import { CartManager } from '../cart.js';
import { saveCartToStorage, loadCartFromStorage } from '../storage.js';

import './compones/procut--card.js';
import './compones/product-list.js';
import './compones/shopping-cart.js';

document.addEventListener('DOMContentLoaded', async () => {
  let catalog = [];
  const cartManager = new CartManager();

  // Referencias a elementos del DOM
  const productListComponent = document.getElementById('product-list-component');
  const shoppingCartComponent = document.getElementById('shopping-cart-component');
  const searchInput = document.getElementById('search-input');
  const categorySelect = document.getElementById('category-select');
  const availableCheckbox = document.getElementById('available-checkbox');
  const sortSelect = document.getElementById('sort-select');
  const clearFiltersBtn = document.getElementById('clear-filters-btn');
  const headerCartCount = document.getElementById('header-cart-count');
  const notificationArea = document.getElementById('notification-area');
  const checkoutBtn = document.getElementById('checkout-btn');
  const orderModal = document.getElementById('order-modal');
  const modalBody = document.getElementById('modal-body');
  const closeModalBtn = document.getElementById('close-modal-btn');

  // Notificaciones al usuario
  function showNotification(message, type = 'error') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notificationArea.replaceChildren(notification);
    setTimeout(() => {
      notificationArea.replaceChildren();
    }, 4000);
  }

  // Carga inicial
  productListComponent.showLoading();

  try {
    catalog = await getProducts();
    const productIds = new Set();
    if (!Array.isArray(catalog) || catalog.some(product => {
      const invalid = !product ||
        !Number.isInteger(product.id) ||
        productIds.has(product.id) ||
        typeof product.name !== 'string' ||
        !product.name.trim() ||
        typeof product.category !== 'string' ||
        !product.category.trim() ||
        !Number.isInteger(product.price) ||
        product.price <= 0 ||
        !Number.isInteger(product.stock) ||
        product.stock < 0 ||
        typeof product.description !== 'string' ||
        typeof product.active !== 'boolean';

      if (!invalid) productIds.add(product.id);
      return invalid;
    })) {
      throw new Error("El catálogo contiene datos inválidos.");
    }
    cartManager.setCatalog(catalog);

    if (catalog.length === 0) {
      productListComponent.showEmpty("El catálogo está vacío actualmente.");
      shoppingCartComponent.data = cartManager.getCalculations();
      headerCartCount.textContent = '0';
      return;
    }

    populateCategories(catalog);

    // Cargar y validar carrito desde localStorage
    const savedCart = loadCartFromStorage(catalog);
    cartManager.setItems(savedCart);

    renderCatalog();
    updateCartUI();
  } catch (error) {
    productListComponent.showError(error.message);
    showNotification(error.message, 'error');
    checkoutBtn.disabled = true;
  }

  // Llenar selector de categorías dinámicamente
  function populateCategories(products) {
    const categories = [...new Set(products.map(p => p.category))];
    categories.forEach(cat => {
      const option = document.createElement('option');
      option.value = cat;
      option.textContent = cat;
      categorySelect.appendChild(option);
    });
  }

  // Filtrado y Ordenamiento
  function getFilteredProducts() {
    const search = searchInput.value.toLowerCase().trim();
    const selectedCat = categorySelect.value;
    const onlyAvailable = availableCheckbox.checked;
    const sortOrder = sortSelect.value;

    return catalog.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(search) || 
                            product.description.toLowerCase().includes(search);
      const matchesCategory = selectedCat === '' || product.category === selectedCat;
      const matchesAvailability = !onlyAvailable || (product.active && product.stock > 0);

      return matchesSearch && matchesCategory && matchesAvailability;
    }).sort((a, b) => {
      if (sortOrder === 'asc') return a.price - b.price;
      if (sortOrder === 'desc') return b.price - a.price;
      return 0;
    });
  }

  function renderCatalog() {
    productListComponent.products = getFilteredProducts();
  }

  function updateCartUI() {
    const calculations = cartManager.getCalculations();
    shoppingCartComponent.data = calculations;
    headerCartCount.textContent = cartManager.getTotalUnits();
    saveCartToStorage(cartManager.getItems());
  }

  // Listeners para Filtros
  searchInput.addEventListener('input', renderCatalog);
  categorySelect.addEventListener('change', renderCatalog);
  availableCheckbox.addEventListener('change', renderCatalog);
  sortSelect.addEventListener('change', renderCatalog);

  clearFiltersBtn.addEventListener('click', () => {
    searchInput.value = '';
    categorySelect.value = '';
    availableCheckbox.checked = false;
    sortSelect.value = '';
    renderCatalog();
  });

  // Event Listeners de Componentes Personalizados
  document.addEventListener('add-to-cart', (e) => {
    const { productId } = e.detail;
    try {
      cartManager.addItem(productId, 1);
      updateCartUI();
      showNotification('Producto agregado al carrito con éxito', 'success');
    } catch (err) {
      showNotification(err.message, 'error');
    }
  });

  document.addEventListener('update-cart-item', (e) => {
    const { productId, action } = e.detail;
    const currentItem = cartManager.getItems().find(i => i.id === productId);

    if (!currentItem) return;

    try {
      if (action === 'increase') {
        cartManager.updateQuantity(productId, currentItem.quantity + 1);
      } else if (action === 'decrease') {
        if (currentItem.quantity === 1) {
          cartManager.removeItem(productId);
        } else {
          cartManager.updateQuantity(productId, currentItem.quantity - 1);
        }
      } else if (action === 'remove') {
        cartManager.removeItem(productId);
      } else {
        throw new Error("La acción solicitada no es válida.");
      }
      updateCartUI();
    } catch (err) {
      showNotification(err.message, 'error');
    }
  });

  document.addEventListener('clear-cart', () => {
    cartManager.clearCart();
    updateCartUI();
  });

  // Confirmación de Pedido (Modal)
  checkoutBtn.addEventListener('click', () => {
    const items = cartManager.getItems();

    if (items.length === 0) {
      showNotification("El carrito está vacío. Agrega productos para realizar un pedido.", "error");
      return;
    }

    // Revalidar disponibilidad e inventario antes del cierre
    try {
      for (const item of items) {
        const prod = catalog.find(p => p.id === item.id);
        if (!prod || !prod.active || prod.stock < item.quantity) {
          throw new Error(`El producto "${prod ? prod.name : 'Desconocido'}" sobrepasa el inventario o no está activo.`);
        }
      }

      const calculations = cartManager.getCalculations();
      const orderId = `ORD-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

      const formatCurrency = (val) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val);

      modalBody.innerHTML = `
        <h2 id="modal-title">¡Pedido confirmado!</h2>
        <p><strong>ID de Pedido:</strong> ${orderId}</p>
        <hr style="margin: 1rem 0;">
        <h3>Resumen del Pedido:</h3>
        <ul>
          ${calculations.lines.map(l => `<li>${escapeHTML(l.name)} x ${l.quantity} - ${formatCurrency(l.subtotal)}</li>`).join('')}
        </ul>
        <br>
        <p>Subtotal: ${formatCurrency(calculations.subtotal)}</p>
        <p>Descuento: ${formatCurrency(calculations.discount)}</p>
        <p><strong>Total Final: ${formatCurrency(calculations.total)}</strong></p>
      `;

      orderModal.showModal();
      
      // Vaciar carrito tras confirmación exitosa
      cartManager.clearCart();
      updateCartUI();
    } catch (err) {
      showNotification(`Error en la confirmación: ${err.message}`, 'error');
    }
  });

  closeModalBtn.addEventListener('click', () => {
    orderModal.close();
  });

  function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, character => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    })[character]);
  }
});