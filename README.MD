# TecnoStock

Tienda local de productos tecnológicos desarrollada con HTML, CSS y JavaScript nativo. El catálogo se carga desde `data/products.json`; la API existente se conserva sin cambios.

## Ejecutar

Como el navegador requiere HTTP para `fetch()`, abre la carpeta con un servidor local. Por ejemplo, desde la raíz del proyecto:

```powershell
python -m http.server 8000
```

Después visita `http://localhost:8000`.

## Funcionalidades

- Búsqueda, categoría, disponibilidad y ordenamiento combinables.
- Carrito validado contra el inventario del catálogo, con persistencia local y descuento del 10 % desde $300.000 COP.
- Confirmación simulada del pedido, sin procesar pagos ni modificar inventario.
- Interfaz adaptable con una paleta de colores pastel.

La función `getProducts()` de la API actual devuelve un arreglo vacío tanto si el catálogo está vacío como si ocurre un error de carga; por eso, sin cambiar esa API, la interfaz no puede distinguir esos dos casos.