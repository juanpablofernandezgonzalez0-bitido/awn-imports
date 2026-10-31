/* ==========================================================================
   UNKNOWN — app
   Hero rack, product carousel, size/front-back selection, cart drawer,
   availability dialog, search, currency switching and keyboard/drag/swipe.
   ========================================================================== */

(() => {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const prefersReduced = () => reduceMotion.matches;

  /* ── generate & preload artwork ──────────────────────────────────────── */

  const IMAGES = {};
  PRODUCTS.forEach((p) => {
    IMAGES[p.id] = { front: G.image(p, "front"), back: G.image(p, "back") };
  });

  // Preload every front/back bitmap so carousel swaps are instant.
  Object.values(IMAGES).forEach(({ front, back }) => {
    [front, back].forEach((src) => {
      const img = new Image();
      img.decoding = "async";
      img.src = src;
    });
  });

  /* ── state ───────────────────────────────────────────────────────────── */

  let storedCurrency = null;
  try {
    storedCurrency = localStorage.getItem("unknown.currency.v1");
  } catch {
    /* ignore */
  }

  const state = {
    view: "hero",
    index: 0,
    side: "front",
    size: null,
    currency:
      storedCurrency && CONFIG.currencies[storedCurrency]
        ? storedCurrency
        : CONFIG.defaultCurrency,
    changing: false,
    opening: false,
    wheelLocked: false,
  };

  /* ── elements ────────────────────────────────────────────────────────── */

  const els = {
    app: $("#app"),
    hero: $("#heroView"),
    product: $("#productView"),
    rack: $("#rack"),
    stageItems: $("#stageItems"),
    stageCenter: $("#stageCenter"),
    stagePrev: $("#stagePrev"),
    stageNext: $("#stageNext"),
    prevBtn: $("#prevBtn"),
    nextBtn: $("#nextBtn"),
    backBtn: $("#backBtn"),
    pieceIndex: $("#pieceIndex"),
    pCategory: $("#pCategory"),
    pName: $("#pName"),
    pPrice: $("#pPrice"),
    productInfo: $("#productInfo"),
    frontback: $(".frontback"),
    sizes: $("#sizes"),
    addBtn: $("#addBtn"),
    availabilityBtn: $("#availabilityBtn"),
    availabilityDialog: $("#availabilityDialog"),
    availabilityProduct: $("#availabilityProduct"),
    availabilityList: $("#availabilityList"),
    searchBtn: $("#searchBtn"),
    searchDialog: $("#searchDialog"),
    searchInput: $("#searchInput"),
    searchResults: $("#searchResults"),
    menuBtn: $("#menuBtn"),
    menuDialog: $("#menuDialog"),
    homeBtn: $("#homeBtn"),
    currencyBtn: $("#currencyBtn"),
    cartBtn: $("#cartBtn"),
    cartCount: $("#cartCount"),
    cartDrawer: $("#cartDrawer"),
    cartClose: $("#cartClose"),
    cartItems: $("#cartItems"),
    cartCountDrawer: $("#cartCountDrawer"),
    cartSubtotal: $("#cartSubtotal"),
    checkoutBtn: $("#checkoutBtn"),
    scrim: $("#scrim"),
    toast: $("#toast"),
  };

  /* ── tiny helpers ────────────────────────────────────────────────────── */

  let toastTimer;
  function toast(message) {
    els.toast.textContent = message;
    els.toast.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => els.toast.classList.remove("is-visible"), 2200);
  }

  const product = () => PRODUCTS[state.index];
  const pad = (n) => String(n).padStart(2, "0");
  const anyDialogOpen = () => !!document.querySelector("dialog[open]");
  const cartOpen = () => els.cartDrawer.classList.contains("is-open");
  const overlayOpen = () => anyDialogOpen() || cartOpen();

  function isTyping(target) {
    return (
      target &&
      (target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable)
    );
  }

  /* ── hero rack ───────────────────────────────────────────────────────── */

  function renderRack() {
    els.rack.innerHTML = PRODUCTS.map(
      (p, i) => `
      <button class="rack-item" data-index="${i}" role="listitem"
              aria-label="View ${p.name}, ${formatPrice(p.price, state.currency)}">
        <span class="hang">
          <span class="hanger" aria-hidden="true">${G.hanger()}</span>
          <img class="garment" src="${IMAGES[p.id].front}"
               alt="${p.name}" draggable="false" decoding="async" />
        </span>
      </button>`
    ).join("");

    $$(".rack-item", els.rack).forEach((btn) => {
      btn.addEventListener("click", () => openProduct(Number(btn.dataset.index)));
      btn.addEventListener("focus", () => {
        btn.scrollIntoView({
          inline: "center",
          block: "nearest",
          behavior: prefersReduced() ? "auto" : "smooth",
        });
      });
    });

    updateRackFocus();
  }

  /** Index of the garment closest to the horizontal centre of the screen. */
  function focusedIndex() {
    const items = Array.from(els.rack.children);
    if (!items.length) return 0;
    const center = window.innerWidth / 2;
    let best = 0;
    let bestDist = Infinity;
    items.forEach((el, i) => {
      const r = el.getBoundingClientRect();
      const d = Math.abs(r.left + r.width / 2 - center);
      if (d < bestDist) {
        bestDist = d;
        best = i;
      }
    });
    return best;
  }

  let focusTicking = false;
  function updateRackFocus() {
    if (focusTicking) return;
    focusTicking = true;
    requestAnimationFrame(() => {
      const idx = focusedIndex();
      Array.from(els.rack.children).forEach((el, i) =>
        el.classList.toggle("is-focused", i === idx)
      );
      focusTicking = false;
    });
  }

  /* ── product rendering ───────────────────────────────────────────────── */

  function tagMarkup(p) {
    return `
      <span class="tag" aria-hidden="true">
        <span class="tag-string"></span>
        <span class="tag-body">
          <span class="tag-brand">UNKNOWN</span>
          <span class="tag-rule"></span>
          <span class="tag-meta">${p.category}<br />${p.color.name.toUpperCase()}</span>
          <span class="tag-foot">SS26 — Nº 01</span>
        </span>
      </span>`;
  }

  function hangMarkup(p, side, withTag) {
    const label = side === "back" ? "back view" : "front view";
    return `
      <div class="hang">
        <span class="hanger" aria-hidden="true">${G.hanger()}</span>
        <img class="garment" src="${IMAGES[p.id][side]}"
             alt="${p.name} — ${label}" draggable="false" decoding="async" />
        ${withTag ? tagMarkup(p) : ""}
      </div>`;
  }

  function renderProduct() {
    const p = product();
    const n = PRODUCTS.length;

    els.pieceIndex.textContent = `${pad(state.index + 1)} / ${pad(n)}`;
    els.pCategory.textContent = `${p.category} — ${p.color.name.toUpperCase()}`;
    els.pName.textContent = p.name;
    els.pPrice.textContent = formatPrice(p.price, state.currency);

    els.stageCenter.innerHTML = hangMarkup(p, state.side, true);
    els.stagePrev.innerHTML = hangMarkup(
      PRODUCTS[(state.index - 1 + n) % n],
      "front",
      false
    );
    els.stageNext.innerHTML = hangMarkup(
      PRODUCTS[(state.index + 1) % n],
      "front",
      false
    );

    updateFrontBack();
    renderSizes();
    updateAddBtn();
  }

  function updateFrontBack() {
    $$(".frontback-btn", els.frontback).forEach((btn) => {
      const active = btn.dataset.side === state.side;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-pressed", String(active));
    });
  }

  function renderSizes() {
    const p = product();
    els.sizes.innerHTML = Object.entries(p.sizes)
      .map(([size, stock]) => {
        const soldOut = stock === 0;
        const selected = state.size === size;
        return `<button class="size-btn${selected ? " is-selected" : ""}${
          soldOut ? " is-soldout" : ""
        }" data-size="${size}" type="button"
          aria-pressed="${selected}" ${soldOut ? "disabled" : ""}
          title="${soldOut ? "Sold out" : `${stock} available`}">${size}</button>`;
      })
      .join("");
  }

  function selectSize(size) {
    const p = product();
    if (!p.sizes[size]) return;
    state.size = size;
    $$(".size-btn", els.sizes).forEach((btn) => {
      const active = btn.dataset.size === size;
      btn.classList.toggle("is-selected", active);
      btn.setAttribute("aria-pressed", String(active));
    });
    updateAddBtn();
  }

  function updateAddBtn() {
    if (!state.size) {
      els.addBtn.disabled = true;
      els.addBtn.textContent = "SELECT A SIZE";
      return;
    }
    els.addBtn.disabled = false;
    els.addBtn.textContent = "ADD TO CART";
  }

  /* ── view transitions ────────────────────────────────────────────────── */

  function openProduct(index) {
    if (state.opening) return;

    // Already in the product view → animate straight to the chosen piece.
    if (state.view === "product") {
      if (index !== state.index) transitionProduct(index);
      return;
    }

    state.opening = true;
    state.index = index;
    state.side = "front";
    state.size = null;
    state.view = "product";
    renderProduct();

    els.hero.classList.add("is-leaving");
    els.product.inert = false;
    els.product.setAttribute("aria-hidden", "false");
    els.product.scrollTop = 0;
    els.product.classList.add("is-entering");
    // Force a frame so the entering state is painted before animating in.
    void els.product.offsetWidth;
    els.product.classList.add("is-active");
    els.product.classList.remove("is-entering");

    const finish = () => {
      els.hero.classList.remove("is-active", "is-leaving");
      els.hero.inert = true;
      els.hero.setAttribute("aria-hidden", "true");
      els.backBtn.focus({ preventScroll: true });
      state.opening = false;
    };

    if (prefersReduced()) {
      finish();
      return;
    }
    setTimeout(finish, 640);
  }

  function goHome() {
    if (state.view !== "product" || state.opening) return;
    state.view = "hero";
    state.opening = true;

    els.product.classList.add("is-leaving");
    els.hero.classList.remove("is-leaving");
    els.hero.inert = false;
    els.hero.setAttribute("aria-hidden", "false");
    els.hero.classList.add("is-returning");
    void els.hero.offsetWidth;
    els.hero.classList.add("is-active");
    els.hero.classList.remove("is-returning");

    const finish = () => {
      els.product.classList.remove("is-active", "is-leaving");
      els.product.inert = true;
      els.product.setAttribute("aria-hidden", "true");
      state.opening = false;
      const item = els.rack.children[state.index];
      if (item) item.focus({ preventScroll: true });
    };

    if (prefersReduced()) {
      finish();
      return;
    }
    setTimeout(finish, 640);
  }

  /* ── product switching ───────────────────────────────────────────────── */

  function transitionProduct(nextIndex) {
    if (state.changing || state.opening || state.view !== "product") return;
    state.changing = true;

    const apply = () => {
      state.index = nextIndex;
      state.side = "front";
      state.size = null;
      els.stageCenter.style.setProperty("--drag", "0px");
      renderProduct();

      els.stageCenter.classList.remove("is-leaving");
      els.productInfo.classList.remove("is-leaving");
      els.stageCenter.classList.add("is-entering");
      els.productInfo.classList.add("is-entering");

      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          els.stageCenter.classList.remove("is-entering");
          els.productInfo.classList.remove("is-entering");
        })
      );
    };

    if (prefersReduced()) {
      apply();
      state.changing = false;
      return;
    }

    els.stageCenter.classList.add("is-leaving");
    els.productInfo.classList.add("is-leaving");

    setTimeout(apply, 250);
    setTimeout(() => {
      state.changing = false;
    }, 760);
  }

  function switchProduct(dir) {
    transitionProduct((state.index + dir + PRODUCTS.length) % PRODUCTS.length);
  }

  /* ── front / back ────────────────────────────────────────────────────── */

  let flipTimer;
  function setSide(side) {
    if (state.side === side) return;
    const p = product();
    const img = $(".garment", els.stageCenter);
    if (!img) {
      state.side = side;
      renderProduct();
      return;
    }

    if (prefersReduced()) {
      state.side = side;
      img.src = IMAGES[p.id][side];
      img.alt = `${p.name} — ${side} view`;
      updateFrontBack();
      return;
    }

    clearTimeout(flipTimer);
    els.stageCenter.classList.add("is-flipping");
    flipTimer = setTimeout(() => {
      state.side = side;
      img.src = IMAGES[p.id][side];
      img.alt = `${p.name} — ${side} view`;
      updateFrontBack();
      els.stageCenter.classList.remove("is-flipping");
    }, 180);
  }

  /* ── drag / swipe on the stage ───────────────────────────────────────── */

  let drag = null;

  els.stageItems.addEventListener("pointerdown", (e) => {
    if (state.view !== "product" || state.changing) return;
    if (e.target.closest("button, a")) return;
    drag = { id: e.pointerId, x: e.clientX, y: e.clientY, active: false };
    try {
      els.stageItems.setPointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  });

  els.stageItems.addEventListener("pointermove", (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    const dx = e.clientX - drag.x;
    const dy = e.clientY - drag.y;

    if (!drag.active && Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy)) {
      drag.active = true;
      els.stageCenter.classList.add("is-dragging");
    }
    if (!drag.active) return;

    els.stageCenter.style.setProperty("--drag", `${dx * 0.26}px`);
  });

  function endDrag(e) {
    if (!drag || e.pointerId !== drag.id) return;
    const dx = e.clientX - drag.x;
    const active = drag.active;
    drag = null;
    els.stageCenter.classList.remove("is-dragging");
    try {
      els.stageItems.releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }

    if (active && Math.abs(dx) > 55) switchProduct(dx < 0 ? 1 : -1);
    requestAnimationFrame(() =>
      els.stageCenter.style.setProperty("--drag", "0px")
    );
  }

  els.stageItems.addEventListener("pointerup", endDrag);
  els.stageItems.addEventListener("pointercancel", endDrag);

  /* ── wheel + swipe on the hero ───────────────────────────────────────── */

  els.hero.addEventListener(
    "wheel",
    (e) => {
      if (state.view !== "hero" || state.opening || overlayOpen()) return;
      e.preventDefault();
      if (state.wheelLocked || Math.abs(e.deltaY) < 6) return;
      state.wheelLocked = true;
      openProduct(focusedIndex());
      setTimeout(() => {
        state.wheelLocked = false;
      }, 1000);
    },
    { passive: false }
  );

  let touchStart = null;
  els.hero.addEventListener(
    "touchstart",
    (e) => {
      if (e.touches.length !== 1 || overlayOpen()) return;
      touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    },
    { passive: true }
  );

  els.hero.addEventListener(
    "touchend",
    (e) => {
      if (!touchStart || state.view !== "hero" || state.opening) {
        touchStart = null;
        return;
      }
      const dx = e.changedTouches[0].clientX - touchStart.x;
      const dy = e.changedTouches[0].clientY - touchStart.y;
      touchStart = null;
      // A near-vertical swipe up/down opens the focused piece.
      if (Math.abs(dy) > 70 && Math.abs(dx) < 55) {
        openProduct(focusedIndex());
      }
    },
    { passive: true }
  );

  /* ── sizes / add to cart / availability ──────────────────────────────── */

  els.sizes.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-size]");
    if (!btn || btn.disabled) return;
    selectSize(btn.dataset.size);
  });

  els.addBtn.addEventListener("click", () => {
    if (!state.size) return;
    const p = product();
    const ok = Cart.add(p, state.size);
    if (!ok) {
      toast(`SIZE ${state.size} — STOCK LIMIT REACHED`);
      return;
    }
    toast(`ADDED — SIZE ${state.size}`);
    openCart();
  });

  els.availabilityBtn.addEventListener("click", () => {
    const p = product();
    els.availabilityProduct.textContent = `${p.name} — ${formatPrice(
      p.price,
      state.currency
    )}`;
    els.availabilityList.innerHTML = Object.entries(p.sizes)
      .map(([size, stock]) => {
        const out = stock === 0;
        return `<li class="availability-row">
          <span class="availability-size${out ? " is-out" : ""}">${size}</span>
          <span class="availability-stock${out ? " is-out" : ""}">${
            out ? "SOLD OUT" : `${stock} AVAILABLE`
          }</span>
        </li>`;
      })
      .join("");
    els.availabilityDialog.showModal();
  });

  /* ── arrow buttons & front/back ──────────────────────────────────────── */

  els.prevBtn.addEventListener("click", () => switchProduct(-1));
  els.nextBtn.addEventListener("click", () => switchProduct(1));
  els.backBtn.addEventListener("click", goHome);
  els.homeBtn.addEventListener("click", () => {
    if (state.view === "product") goHome();
  });

  els.frontback.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-side]");
    if (!btn) return;
    setSide(btn.dataset.side);
  });

  /* ── search ──────────────────────────────────────────────────────────── */

  function renderSearch(query) {
    const q = query.trim().toLowerCase();
    const matches = PRODUCTS.map((p, i) => ({ p, i })).filter(
      ({ p }) =>
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    );

    els.searchResults.innerHTML = matches.length
      ? matches
          .map(
            ({ p, i }) => `
          <li>
            <button class="search-row" data-index="${i}" type="button">
              <span class="search-thumb"><img src="${IMAGES[p.id].front}" alt="" /></span>
              <span class="search-name">${p.name}</span>
              <span class="search-price">${formatPrice(p.price, state.currency)}</span>
            </button>
          </li>`
          )
          .join("")
      : `<li class="search-empty">NO PIECES FOUND.</li>`;
  }

  function openSearch() {
    if (cartOpen()) return;
    els.searchInput.value = "";
    renderSearch("");
    els.searchDialog.showModal();
    els.searchInput.focus({ preventScroll: true });
  }

  els.searchBtn.addEventListener("click", openSearch);
  els.searchInput.addEventListener("input", () =>
    renderSearch(els.searchInput.value)
  );

  els.searchResults.addEventListener("click", (e) => {
    const row = e.target.closest("[data-index]");
    if (!row) return;
    const i = Number(row.dataset.index);
    els.searchDialog.close();
    setTimeout(() => openProduct(i), 0);
  });

  /* ── menu ────────────────────────────────────────────────────────────── */

  els.menuBtn.addEventListener("click", () => {
    if (cartOpen()) return;
    els.menuDialog.showModal();
  });

  els.menuDialog.addEventListener("click", (e) => {
    const link = e.target.closest("[data-menu-link]");
    if (!link) return;
    const action = link.dataset.menuLink;
    els.menuDialog.close();

    if (action === "shop" && state.view === "product") {
      setTimeout(goHome, 40);
    } else if (action === "cart") {
      setTimeout(openCart, 60);
    } else if (action === "contact") {
      const msg = "UNKNOWN — hello. I have a question about a piece.";
      window.open(
        `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(msg)}`,
        "_blank",
        "noopener"
      );
    }
  });

  /* ── dialog helpers ──────────────────────────────────────────────────── */

  $$("dialog.sheet").forEach((dialog) => {
    $$("[data-close-dialog]", dialog).forEach((btn) =>
      btn.addEventListener("click", () => dialog.close())
    );
    // Close only when the backdrop is clicked (not the panel padding).
    dialog.addEventListener("click", (e) => {
      if (e.target !== dialog) return;
      const r = dialog.getBoundingClientRect();
      if (
        e.clientX < r.left ||
        e.clientX > r.right ||
        e.clientY < r.top ||
        e.clientY > r.bottom
      ) {
        dialog.close();
      }
    });
  });

  /* ── cart drawer ─────────────────────────────────────────────────────── */

  function renderCart() {
    const lines = Cart.lines();
    const count = Cart.count();

    els.cartCount.textContent = `(${count})`;
    els.cartCountDrawer.textContent = `(${count})`;
    els.cartBtn.setAttribute(
      "aria-label",
      `Open cart, ${count} item${count === 1 ? "" : "s"}`
    );

    if (!lines.length) {
      els.cartItems.innerHTML = `
        <div class="cart-empty">
          <p>YOUR CART IS EMPTY.</p>
          <button class="text-link" data-cart-shop type="button">CONTINUE BROWSING</button>
        </div>`;
    } else {
      els.cartItems.innerHTML = lines
        .map(
          ({ product: p, size, qty }) => `
          <article class="cart-item">
            <div class="cart-thumb">
              <img src="${IMAGES[p.id].front}" alt="${p.name}" />
            </div>
            <div class="cart-item-main">
              <div class="cart-item-top">
                <p class="cart-item-name">${p.name}</p>
                <button class="cart-remove" data-remove="${p.id}" data-size="${size}"
                        aria-label="Remove ${p.name}, size ${size}">✕</button>
              </div>
              <p class="cart-item-meta">SIZE ${size} — ${p.color.name.toUpperCase()}</p>
              <div class="cart-item-bottom">
                <div class="qty" role="group" aria-label="Quantity, ${p.name}, size ${size}">
                  <button data-qty="-1" data-id="${p.id}" data-size="${size}"
                          aria-label="Decrease quantity" ${qty <= 1 ? "disabled" : ""}>−</button>
                  <span aria-live="polite">${qty}</span>
                  <button data-qty="1" data-id="${p.id}" data-size="${size}"
                          aria-label="Increase quantity" ${
                            qty >= p.sizes[size] ? "disabled" : ""
                          }>+</button>
                </div>
                <p class="cart-item-price">${formatPrice(p.price * qty, state.currency)}</p>
              </div>
            </div>
          </article>`
        )
        .join("");
    }

    els.cartSubtotal.textContent = formatPrice(Cart.subtotal(), state.currency);
    els.checkoutBtn.disabled = lines.length === 0;
  }

  let lastFocus = null;

  function openCart() {
    if (anyDialogOpen() || cartOpen()) return;
    renderCart();
    lastFocus = document.activeElement;
    els.scrim.hidden = false;
    els.cartDrawer.classList.add("is-open");
    els.toast.classList.add("is-raised");
    els.cartDrawer.setAttribute("aria-hidden", "false");
    els.cartBtn.setAttribute("aria-expanded", "true");
    requestAnimationFrame(() => els.scrim.classList.add("is-open"));
    els.app.inert = true;
    els.cartClose.focus({ preventScroll: true });
  }

  function closeCart() {
    if (!cartOpen()) return;
    els.cartDrawer.classList.remove("is-open");
    els.scrim.classList.remove("is-open");
    els.toast.classList.remove("is-raised");
    els.cartDrawer.setAttribute("aria-hidden", "true");
    els.cartBtn.setAttribute("aria-expanded", "false");
    els.app.inert = false;
    setTimeout(() => {
      if (!cartOpen()) els.scrim.hidden = true;
    }, 500);
    if (lastFocus && document.contains(lastFocus)) {
      lastFocus.focus({ preventScroll: true });
    } else {
      els.cartBtn.focus({ preventScroll: true });
    }
  }

  els.cartBtn.addEventListener("click", openCart);
  els.cartClose.addEventListener("click", closeCart);
  els.scrim.addEventListener("click", closeCart);

  els.cartDrawer.addEventListener("keydown", (e) => {
    if (e.key !== "Tab") return;
    const focusables = $$(
      'button:not([disabled]), a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      els.cartDrawer
    ).filter((el) => el.offsetParent !== null);
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });

  els.cartItems.addEventListener("click", (e) => {
    if (e.target.closest("[data-cart-shop]")) {
      closeCart();
      if (state.view === "product") setTimeout(goHome, 30);
      return;
    }

    const removeBtn = e.target.closest("[data-remove]");
    if (removeBtn) {
      Cart.remove(removeBtn.dataset.remove, removeBtn.dataset.size);
      return;
    }

    const qtyBtn = e.target.closest("[data-qty]");
    if (qtyBtn) {
      const { id, size } = qtyBtn.dataset;
      const line = Cart.lines().find((l) => l.id === id && l.size === size);
      if (!line) return;
      Cart.setQty(id, size, line.qty + Number(qtyBtn.dataset.qty));
    }
  });

  els.checkoutBtn.addEventListener("click", () => {
    const lines = Cart.lines();
    if (!lines.length) return;
    const items = lines
      .map(
        (l) =>
          `• ${l.product.name} — ${l.size} × ${l.qty} — ${formatPrice(
            l.product.price * l.qty,
            state.currency
          )}`
      )
      .join("\n");
    const message = `UNKNOWN — NEW ORDER\n\n${items}\n\nSUBTOTAL — ${formatPrice(
      Cart.subtotal(),
      state.currency
    )}\n\nPlease confirm availability and shipping. Thank you.`;
    window.open(
      `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener"
    );
  });

  Cart.subscribe(renderCart);

  /* ── currency ────────────────────────────────────────────────────────── */

  function syncCurrencyButton() {
    els.currencyBtn.textContent = state.currency;
    els.currencyBtn.setAttribute(
      "aria-label",
      `Change currency, currently ${state.currency}`
    );
  }

  els.currencyBtn.addEventListener("click", () => {
    if (state.changing) return;
    const i = CURRENCY_ORDER.indexOf(state.currency);
    state.currency = CURRENCY_ORDER[(i + 1) % CURRENCY_ORDER.length];
    try {
      localStorage.setItem("unknown.currency.v1", state.currency);
    } catch {
      /* ignore */
    }
    syncCurrencyButton();
    renderProduct();
    renderCart();
    toast(`CURRENCY — ${state.currency}`);
  });

  /* ── keyboard ────────────────────────────────────────────────────────── */

  document.addEventListener("keydown", (e) => {
    if (anyDialogOpen()) return; // native Escape handling

    if (cartOpen()) {
      if (e.key === "Escape") {
        e.preventDefault();
        closeCart();
      }
      return;
    }

    if (state.view !== "product" || isTyping(e.target)) return;

    if (e.key === "ArrowLeft") {
      e.preventDefault();
      switchProduct(-1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      switchProduct(1);
    } else if (e.key === "Escape") {
      e.preventDefault();
      goHome();
    }
  });

  /* ── boot ────────────────────────────────────────────────────────────── */

  function init() {
    syncCurrencyButton();
    renderRack();
    renderProduct();
    renderCart();

    els.rack.parentElement.addEventListener("scroll", updateRackFocus, {
      passive: true,
    });
    window.addEventListener("resize", updateRackFocus);
    els.rack.addEventListener("scroll", updateRackFocus, { passive: true });
  }

  init();
})();
