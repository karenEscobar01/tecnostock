export class CartManager {
  constructor(catalog = []) {
    this.catalog = catalog;
    this.items = []; // Formato: [{ id, quantity }]
  }

  setCatalog(catalog) {
    this.catalog = catalog;
  }

  getItems() {
    return this.items.map(item => ({ ...item }));
  }

  setItems(items) {
    if (!Array.isArray(items)) {
      throw new Error("El contenido del carrito no es válido.");
    }

    const validatedItems = [];
    const seenIds = new Set();

    for (const item of items) {
      const product = this.catalog.find(candidate => candidate.id === item?.id);
      if (
        !product ||
        !product.active ||
        !Number.isInteger(item.quantity) ||
        item.quantity < 1 ||
        item.quantity > product.stock ||
        seenIds.has(item.id)
      ) {
        throw new Error("El contenido del carrito no es válido.");
      }

      seenIds.add(item.id);
      validatedItems.push({ id: item.id, quantity: item.quantity });
    }

    this.items = validatedItems;
  }

  addItem(productId, quantity = 1) {
    if (!Number.isInteger(quantity) || quantity < 1) {
      throw new Error("La cantidad debe ser un entero mayor o igual a 1.");
    }

    const product = this.catalog.find(p => p.id === productId);

    if (!product) {
      throw new Error("El producto solicitado no existe.");
    }
    if (!product.active) {
      throw new Error("El producto seleccionado se encuentra inactivo.");
    }
    if (product.stock <= 0) {
      throw new Error("El producto seleccionado está agotado.");
    }

    const existingIndex = this.items.findIndex(item => item.id === productId);

    if (existingIndex > -1) {
      const newQty = this.items[existingIndex].quantity + quantity;
      if (newQty > product.stock) {
        throw new Error(`No puedes agregar más unidades. Inventario máximo disponible: ${product.stock}`);
      }
      this.items[existingIndex].quantity = newQty;
    } else {
      if (quantity > product.stock) {
        throw new Error(`La cantidad supera el stock disponible (${product.stock}).`);
      }
      this.items.push({ id: productId, quantity });
    }
  }

  updateQuantity(productId, newQuantity) {
    const product = this.catalog.find(p => p.id === productId);
    const itemIndex = this.items.findIndex(item => item.id === productId);

    if (itemIndex === -1) return;

    if (!Number.isInteger(newQuantity) || newQuantity < 1) {
      throw new Error("La cantidad debe ser un entero mayor o igual a 1.");
    }

    if (!product || !product.active) {
      throw new Error("El producto ya no está disponible.");
    }

    if (newQuantity > product.stock) {
      throw new Error(`La cantidad supera el inventario disponible de ${product.stock} unidades.`);
    }

    this.items[itemIndex].quantity = newQuantity;
  }

  removeItem(productId) {
    this.items = this.items.filter(item => item.id !== productId);
  }

  clearCart() {
    this.items = [];
  }

  getTotalUnits() {
    return this.items.reduce((acc, item) => acc + item.quantity, 0);
  }

  getCalculations() {
    let subtotal = 0;
    const detailedLines = [];

    for (const item of this.items) {
      const product = this.catalog.find(p => p.id === item.id);
      if (product) {
        const lineSubtotal = product.price * item.quantity;
        subtotal += lineSubtotal;
        detailedLines.push({
          id: product.id,
          name: product.name,
          price: product.price,
          quantity: item.quantity,
          subtotal: lineSubtotal
        });
      }
    }

    const discount = subtotal >= 300000 ? subtotal * 0.10 : 0;
    const total = subtotal - discount;

    return {
      lines: detailedLines,
      subtotal,
      discount,
      total
    };
  }
}