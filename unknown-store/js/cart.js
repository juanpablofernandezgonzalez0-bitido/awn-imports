/* ==========================================================================
   UNKNOWN — cart state
   Small observable store, persisted to localStorage. Items are kept as
   { id, size, qty }; product data is resolved from PRODUCTS on read.
   ========================================================================== */

const Cart = (() => {
  const KEY = "unknown.cart.v1";
  const listeners = new Set();
  let items = load();

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      // Keep only entries that still exist in the catalogue and cap their
      // quantity at the currently available stock.
      return parsed
        .filter(
          (it) =>
            it &&
            typeof it.id === "string" &&
            typeof it.size === "string" &&
            Number.isInteger(it.qty) &&
            it.qty > 0 &&
            PRODUCTS.some((p) => p.id === it.id)
        )
        .map((it) => {
          const p = PRODUCTS.find((prod) => prod.id === it.id);
          const stock = p && p.sizes ? p.sizes[it.size] ?? 0 : 0;
          return {
            id: it.id,
            size: it.size,
            qty: Math.min(it.qty, stock),
          };
        })
        .filter((it) => it.qty > 0);
    } catch {
      return [];
    }
  }

  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
    } catch {
      /* storage may be unavailable — cart still works in-memory */
    }
    listeners.forEach((fn) => fn());
  }

  function product(id) {
    return PRODUCTS.find((p) => p.id === id);
  }

  function stockFor(id, size) {
    const p = product(id);
    return p && p.sizes ? p.sizes[size] ?? 0 : 0;
  }

  function qtyFor(id, size) {
    const found = items.find((it) => it.id === id && it.size === size);
    return found ? found.qty : 0;
  }

  /** Add one unit. Returns true when the item was added. */
  function add(p, size) {
    if (!size || !p.sizes[size]) return false;
    const existing = items.find((it) => it.id === p.id && it.size === size);
    const nextQty = (existing ? existing.qty : 0) + 1;
    if (nextQty > p.sizes[size]) return false;

    if (existing) existing.qty = nextQty;
    else items.push({ id: p.id, size, qty: 1 });

    save();
    return true;
  }

  /** Set an absolute quantity (0 removes the line). */
  function setQty(id, size, qty) {
    const line = items.find((it) => it.id === id && it.size === size);
    if (!line) return;
    const max = stockFor(id, size);
    if (qty <= 0) {
      items = items.filter((it) => it !== line);
    } else {
      line.qty = Math.min(qty, max || 0);
      if (line.qty <= 0) items = items.filter((it) => it !== line);
    }
    save();
  }

  function remove(id, size) {
    items = items.filter((it) => !(it.id === id && it.size === size));
    save();
  }

  function clear() {
    items = [];
    save();
  }

  function count() {
    return items.reduce((sum, it) => sum + it.qty, 0);
  }

  function subtotal() {
    return items.reduce((sum, it) => {
      const p = product(it.id);
      return sum + (p ? p.price * it.qty : 0);
    }, 0);
  }

  /** Items enriched with their product record. */
  function lines() {
    return items
      .map((it) => ({ ...it, product: product(it.id) }))
      .filter((it) => it.product);
  }

  function subscribe(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  }

  return {
    add,
    setQty,
    remove,
    clear,
    count,
    subtotal,
    lines,
    qtyFor,
    stockFor,
    subscribe,
  };
})();
