export type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  outOfStock?: boolean;
  image: string;
  images?: string[];
  tag?: string;
  description: string;
  sizes: string[];
};

export const products: Product[] = [
  {
    id: "awn-hoodie-classic",
    name: "Sudadera Clásica AWN",
    category: "Sudadera",
    price: 139000,
    image: "/ropa/product-1.jpeg",
    tag: "Más vendido",
    description: "Sudadera oversize con tejido premium y estampado AWN.",
    sizes: ["S", "M", "L", "XL"],
  },
  {
    id: "awn-street-tee",
    name: "Camiseta Urbana AWN",
    category: "Camiseta",
    price: 69000,
    image: "/ropa/product-2.jpeg",
    description: "Camiseta oversize de algodón peinado, corte urbano.",
    sizes: ["S", "M", "L", "XL"],
  },
  {
    id: "awn-cargo-pants",
    name: "Pantalón Cargo AWN",
    category: "Pantalón",
    price: 99000,
    image: "/ropa/product-3.jpeg",
    tag: "Nuevo",
    description: "Pantalón cargo con bolsillos amplios y tiro medio.",
    sizes: ["28", "30", "32", "34"],
  },
  {
    id: "awn-bomber-jacket",
    name: "Chamarra Bomber AWN",
    category: "Chamarra",
    price: 159000,
    image: "/ropa/product-4.jpeg",
    description: "Chamarra bomber con acabados premium y forro térmico.",
    sizes: ["S", "M", "L", "XL"],
  },
];