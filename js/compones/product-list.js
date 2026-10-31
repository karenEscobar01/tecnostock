export class ProductList extends HTMLElement {
  set products(items) {
    this.render(items);
  }

  render(items) {
    this.replaceChildren();

    if (!items || items.length === 0) {
      this.showEmpty('No se encontraron productos que coincidan con la búsqueda.');
      return;
    }

    items.forEach(product => {
      const card = document.createElement('product-card');
      card.product = product;
      this.appendChild(card);
    });
  }

  showLoading() {
    this.textContent = 'Cargando productos del catálogo...';
  }

  showError(message) {
    const messageElement = document.createElement('p');
    messageElement.className = 'notification notification-error';
    messageElement.textContent = message;
    this.replaceChildren(messageElement);
  }

  showEmpty(message) {
    const messageElement = document.createElement('p');
    messageElement.className = 'catalog-message';
    messageElement.textContent = message;
    this.replaceChildren(messageElement);
  }
}

customElements.define('product-list', ProductList);