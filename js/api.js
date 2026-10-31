const url = "data/products.json";

export async function getProducts() {
    let response;

    try {
        response = await fetch(url);
    } catch (error) {
        throw new Error("No se pudo conectar con el catálogo. Verifica tu conexión y vuelve a intentarlo.", {
            cause: error
        });
    }

    if (!response.ok) {
        throw new Error(`No se pudo cargar el catálogo (HTTP ${response.status}).`);
    }

    try {
        return await response.json();
    } catch (error) {
        throw new Error("La respuesta del catálogo no contiene un JSON válido.", {
            cause: error
        });
    }
}
