export class ShoppingCart extends HTMLElement {
  set data(cartData) {
    this._cartData = cartData;
    this.render();
  }

  render() {
    if (!this._cartData || this._cartData.lines.length === 0) {
      this.innerHTML = '<p>El carrito está vacío.</p>';
      return;
    }

    const { lines, subtotal, discount, total } = this._cartData;

    const formatCurrency = (val) => new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0
    }).format(val);

    let itemsHTML = lines.map(item => `
      <div class="cart-item">
        <div>
          <strong>${escapeHTML(item.name)}</strong><br>
          <small>${formatCurrency(item.price)} x ${item.quantity}</small><br>
          <span class="cart-line-subtotal">Subtotal: ${formatCurrency(item.subtotal)}</span>
        </div>
        <div class="cart-item-controls">
          <button type="button" data-id="${item.id}" data-action="decrease" aria-label="Disminuir ${escapeHTML(item.name)}">−</button>
          <span>${item.quantity}</span>
          <button type="button" data-id="${item.id}" data-action="increase" aria-label="Aumentar ${escapeHTML(item.name)}">+</button>
          <button type="button" data-id="${item.id}" data-action="remove" class="btn-danger" aria-label="Eliminar ${escapeHTML(item.name)}">×</button>
        </div>
      </div>
    `).join('');

    this.innerHTML = `
      <div class="cart-items-container">${itemsHTML}</div>
      <div class="cart-summary">
        <div class="summary-row">
          <span>Subtotal:</span>
          <span>${formatCurrency(subtotal)}</span>
        </div>
        ${discount > 0 ? `
        <div class="summary-row summary-discount">
          <span>Descuento (10%):</span>
          <span>-${formatCurrency(discount)}</span>
        </div>` : ''}
        <div class="summary-row summary-total">
          <span>Total:</span>
          <span>${formatCurrency(total)}</span>
        </div>
        <button id="clear-cart-btn" class="btn btn-secondary btn-block">Vaciar carrito</button>
      </div>
    `;

    this.querySelectorAll('button[data-action]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = Number(btn.dataset.id);
        const action = btn.dataset.action;

        this.dispatchEvent(new CustomEvent('update-cart-item', {
          bubbles: true,
          composed: true,
          detail: { productId: id, action }
        }));
      });
    });

    const clearBtn = this.querySelector('#clear-cart-btn');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        this.dispatchEvent(new CustomEvent('clear-cart', {
          bubbles: true,
          composed: true
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

customElements.define('shopping-cart', ShoppingCart);