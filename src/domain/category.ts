// Interfaces de categoría con su tipado y la extensión de la interfaz para la estructura del árbol

export interface Category {
    id: string;
    name: string;
    active: boolean;
}

export interface CategoryTree extends Category {
    subcategories: CategoryTree[];
}

export type TreePath = string[]; // Ejemplo: ["Electrónica", "Computadoras", "Laptops"]