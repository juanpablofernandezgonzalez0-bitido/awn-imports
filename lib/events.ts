/** Eventos globales de la tienda (comunican componentes que no comparten estado). */
export const OPEN_SEARCH_EVENT = "awn:open-search";
export const OPEN_CART_EVENT = "awn:open-cart";

/** Enlace directo a una prenda: /#prenda-<id> */
export const productHash = (id: string) => `#prenda-${id}`;
export const productIdFromHash = (hash: string) =>
  hash.startsWith("#prenda-") ? decodeURIComponent(hash.slice("#prenda-".length)) : null;
