# TecnoStock

Aplicación web local para consultar productos tecnológicos y preparar pedidos. Está construida con HTML, CSS y JavaScript nativo, sin frameworks ni dependencias externas.

El catálogo se carga por HTTP con `fetch()` desde `data/products.json`. La aplicación valida los productos antes de usarlos y mantiene separado el estado del carrito.

## Requisitos

- Python 3, o cualquier servidor HTTP local sencillo.
- Un navegador moderno con soporte para JavaScript ES modules, Web Components y `localStorage`.

## Puesta en marcha

Desde la carpeta raíz del proyecto, inicia un servidor local:

```powershell
python -m http.server 8000
```

Abre [http://localhost:8000](http://localhost:8000) en el navegador. No abras `index.html` directamente como archivo: `fetch()` requiere que la aplicación se sirva mediante HTTP.

Para detener el servidor, vuelve a la terminal y presiona `Ctrl+C`.

## Funcionalidades

- Catálogo de productos con estado de carga, mensajes de error y aviso cuando no hay resultados.
- Búsqueda por nombre o descripción, filtro por categoría y disponibilidad, y ordenamiento por precio. Los filtros se pueden combinar.
- Tarjetas de producto con imágenes locales y productos agotados o inactivos claramente identificados.
- Carrito que permite agregar, aumentar, disminuir, eliminar y vaciar productos; las cantidades se validan frente al inventario disponible.
- Persistencia del carrito en `localStorage`, con validación de los datos recuperados al iniciar.
- Subtotal por producto, subtotal general y descuento del 10 % para compras desde $300.000 COP.
- Confirmación simulada con identificador y resumen del pedido. No procesa pagos ni actualiza el inventario.
- Diseño adaptable a pantallas estrechas y escritorio, con colores pastel.

## Pruebas manuales

1. **Catálogo e imágenes:** al abrir la página, espera a que carguen las tarjetas y sus imágenes.
2. **Filtros:** busca por nombre o descripción, selecciona una categoría y combina el filtro “Solo disponibles”. Usa “Limpiar filtros” para restablecer el catálogo.
3. **Inventario:** agrega un producto varias veces y aumenta su cantidad hasta el límite disponible. Comprueba que no se permita excederlo y que los productos agotados no se puedan agregar.
4. **Cálculos:** verifica el subtotal de línea y el subtotal del carrito. Agrega productos hasta alcanzar $300.000 COP y comprueba que se aplique el descuento del 10 %.
5. **Persistencia:** agrega productos y recarga la página; el carrito debe conservarse. Vacíalo con el botón correspondiente.
6. **Pedido:** confirma un carrito con productos y revisa el identificador, las líneas, el descuento y el total. La confirmación debe vaciar el carrito. Intenta confirmar también con el carrito vacío.
7. **Errores del catálogo:** para probar estados de error o catálogo vacío, modifica temporalmente `data/products.json` o detén el servidor; restaura el archivo antes de continuar.

## Estructura principal

```text
index.html
css/styles.css
data/products.json
images/
js/
  api.js
  app.js
  compones/
cart.js
storage.js
```

Los errores de red, HTTP y JSON inválido se muestran separadamente de una respuesta válida con un catálogo vacío.