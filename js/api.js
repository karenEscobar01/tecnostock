// Definimos la URL base como una constante global del archivo para fácil mantenimiento
const url = "data/products.json";

/*Traer el catalogo de la url y hacer un array de objetos, o dejarlo vacio si falla*/

export async function getProducts() {
    try {
        // 1. Realizamos la petición HTTP
        const response = await fetch(url);

        // 2. Verificamos que el servidor respondió
        if (!response.ok) {
            throw new Error(`Error de red o servidor: HTTP ${response.status}`);
        }

        // 3. Convertimos la respuesta a un arreglo de objetos JavaScript
        const products = await response.json();

        // Retornamos los datos para los archivos  app.js y ui.js los usen
        return products;

    } catch (error) {
        // Capturamos el error y lo imprimimos en consola
        console.error("Fallo al obtener los productos del catálogo:", error.message);

        // Retornamos un arreglo vacío para que la aplicación no colapse
        return [];
    }
}
