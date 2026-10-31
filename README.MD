# TecnoStock

Tienda local de productos tecnológicos desarrollada con HTML, CSS y JavaScript nativo. El catálogo se carga mediante `fetch()` desde `data/products.json`; la capa API propaga errores de red, HTTP y JSON para que la interfaz pueda informarlos.

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

Los errores de red, HTTP y JSON inválido se muestran por separado de una respuesta válida con el catálogo vacío.