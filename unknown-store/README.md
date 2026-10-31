# UNKNOWN — Showroom

Tienda online de una sola página con estética minimalista de showroom. Sin
frameworks ni dependencias: HTML, CSS y JavaScript vanilla.

## Cómo correrlo

Cualquier servidor estático sirve. Desde esta carpeta:

```bash
python3 -m http.server 4173
```

Abre `http://localhost:4173`.

> También funciona abriendo `index.html` directamente, pero se recomienda el
> servidor local para que `localStorage` (carrito y moneda) funcione igual en
> todos los navegadores.

## Estructura

```
unknown-store/
├── index.html          # Marcado: header, hero, vista producto, carrito, diálogos
├── css/
│   └── styles.css      # Estilos, animaciones, responsive y reduced-motion
├── js/
│   ├── data.js         # Productos, tallas/stock, monedas, WhatsApp
│   ├── garments.js     # Generador SVG de prendas (frente/espalda) y percha
│   ├── cart.js         # Estado del carrito + persistencia en localStorage
│   └── app.js          # Interacciones: rack, carrusel, tallas, búsqueda, teclado
└── README.md
```

## Personalizar

- **Productos**: edita `PRODUCTS` en `js/data.js` (`name`, `category`, `type`
  — `hoodie` / `tee` / `jacket` —, `price`, `color.hex`, `sizes` con stock).
- **WhatsApp**: cambia `CONFIG.whatsappNumber` en `js/data.js` por el número real
  (solo dígitos, formato internacional).
- **Monedas**: los precios base están en NGN. Ajusta tasas y locales en
  `CONFIG.currencies`. El botón del header rota entre NGN → USD → EUR → COP.
- **Imágenes**: las prendas se dibujan como SVG en `js/garments.js` y se
  convierten a data URI. Para usar fotos reales, reemplaza `G.image()` por rutas
  a archivos PNG con fondo transparente y ajusta el marcado de `.hang`.

## Interacciones

- Click en una prenda del rack, scroll o swipe vertical → zoom y apertura de la
  vista de producto (~600 ms).
- Carrusel: flechas, teclado (`←` / `→`), arrastre con mouse y swipe táctil.
- `FRONT / BACK` alterna las vistas; las tallas agotadas aparecen tachadas.
- El botón principal se habilita al elegir talla. `SEE AVAILABILITY` abre el
  detalle de stock por talla.
- Carrito lateral con cantidades, subtotal y checkout por WhatsApp; persiste en
  `localStorage` (`unknown.cart.v1`).
- `Esc` cierra carrito/diálogos y vuelve del producto al showroom.

## Accesibilidad y rendimiento

- `aria-label` en controles, `aria-pressed` en tallas/vistas, diálogos nativos
  con manejo de foco, foco visible y `prefers-reduced-motion` respetado.
- Animaciones basadas en `transform`/`opacity`; imágenes precargadas al inicio
  para evitar parpadeos al cambiar de prenda.
