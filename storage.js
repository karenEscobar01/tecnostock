const CART_KEY = 'tecnostock_cart_data';

export function saveCartToStorage(cartItems) {
  try {
    const serialized = JSON.stringify(cartItems);
    localStorage.setItem(CART_KEY, serialized);
  } catch (e) {
    console.error("No se pudo guardar el carrito en localStorage", e);
  }
}

export function loadCartFromStorage(validCatalog = []) {
  try {
    const serialized = localStorage.getItem(CART_KEY);
    if (!serialized) return [];

    const parsed = JSON.parse(serialized);
    if (!Array.isArray(parsed)) {
      console.error("El carrito guardado no tiene una estructura válida.");
      return [];
    }

    const validatedCart = [];
    const seenIds = new Set();

    for (const item of parsed) {
      if (!item || !Number.isInteger(item.id) || !Number.isInteger(item.quantity) || item.quantity < 1) {
        continue;
      }

      const productInCatalog = validCatalog.find(p => p.id === item.id);
      if (
        seenIds.has(item.id) ||
        !productInCatalog ||
        !productInCatalog.active ||
        productInCatalog.stock < 1 ||
        item.quantity > productInCatalog.stock
      ) {
        continue;
      }

      validatedCart.push({
        id: productInCatalog.id,
        quantity: item.quantity
      });
      seenIds.add(item.id);
    }

    return validatedCart;
  } catch (e) {
    console.error("Error al parsear el carrito guardado, restableciendo...", e);
    return [];
  }
}