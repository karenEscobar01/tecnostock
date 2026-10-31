export class ProductCard extends HTMLElement {
  constructor() {
    super();
    this._product = null;
  }

  set product(data) {
    this._product = data;
    this.render();
  }

  get product() {
    return this._product;
  }

  render() {
    if (!this._product) return;

    const { id, name, category, price, stock, description, active, image } = this._product;
    const isAvailable = active && stock > 0;

    this.className = isAvailable ? '' : 'inactive';

    const formattedPrice = new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0
    }).format(price);

    this.innerHTML = `
      <div>
        ${image ? `<img class="product-image" src="${escapeHTML(image)}" alt="${escapeHTML(name)}" loading="lazy">` : ''}
        <span class="product-category">${escapeHTML(category)}</span>
        <h3 class="product-title">${escapeHTML(name)}</h3>
        <p class="product-description">${escapeHTML(description)}</p>
        <div class="product-price">${formattedPrice}</div>
        <div class="product-stock">
          ${isAvailable ? `Disponibles: ${stock}` : '<span class="badge-out">No disponible</span>'}
        </div>
      </div>
      <button class="btn btn-primary add-btn" ${!isAvailable ? 'disabled' : ''}>
        ${isAvailable ? 'Agregar al carrito' : 'Agotado'}
      </button>
    `;

    const btn = this.querySelector('.add-btn');
    const productImage = this.querySelector('.product-image');
    productImage?.addEventListener('error', () => {
      productImage.hidden = true;
    }, { once: true });

    if (btn && isAvailable) {
      btn.addEventListener('click', () => {
        // Emitir Evento Personalizado
        this.dispatchEvent(new CustomEvent('add-to-cart', {
          bubbles: true,
          composed: true,
          detail: { productId: id }
        }));
      });
    }
  }
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[character]);
}

customElements.define('product-card', ProductCard);