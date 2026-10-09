(function () {
  "use strict";

  const data = window.AURORA;
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const DAY_NAMES = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
  const DAY_SHORT = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];
  const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
  const formatPrice = (n) => brl.format(n);
  const shortPrice = (n) => (Number.isInteger(n) ? "R$ " + n : formatPrice(n));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const itemsById = new Map();
  data.categories.forEach((c) => c.items.forEach((i) => itemsById.set(i.id, i)));

  /* ---------- Horários ---------- */

  const toMinutes = (hhmm) => {
    const [h, m] = hhmm.split(":").map(Number);
    return h * 60 + m;
  };
  const formatHour = (mins) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m ? `${h}h${String(m).padStart(2, "0")}` : `${h}h`;
  };
  const minutesNow = (d) => d.getHours() * 60 + d.getMinutes();

  function openingState(now = new Date()) {
    const day = now.getDay();
    const today = data.hours[day];
    const mins = minutesNow(now);
    if (today) {
      const [open, close] = today.map(toMinutes);
      if (mins >= open && mins < close) {
        return { open: true, closingSoon: close - mins <= 60, text: `Aberto agora · fecha às ${formatHour(close)}` };
      }
      if (mins < open) {
        return { open: false, text: `Fechado agora · abre hoje às ${formatHour(open)}` };
      }
    }
    for (let i = 1; i <= 7; i++) {
      const d = (day + i) % 7;
      if (data.hours[d]) {
        const label = i === 1 ? "amanhã" : DAY_SHORT[d];
        return { open: false, text: `Fechado agora · abre ${label} às ${formatHour(toMinutes(data.hours[d][0]))}` };
      }
    }
    return { open: false, text: "Fechado" };
  }

  function renderStatus() {
    const el = $("[data-status]");
    if (!el) return;
    const s = openingState();
    el.classList.toggle("is-open", s.open);
    el.classList.toggle("is-soon", Boolean(s.closingSoon));
    $("[data-status-text]", el).textContent = s.text;
  }

  function renderHours() {
    const body = $("[data-hours]");
    if (!body) return;
    const today = new Date().getDay();
    const order = [1, 2, 3, 4, 5, 6, 0];
    body.innerHTML = order
      .map((d) => {
        const h = data.hours[d];
        const value = h ? `${formatHour(toMinutes(h[0]))} – ${formatHour(toMinutes(h[1]))}` : "Fechado";
        const isToday = d === today;
        return `<tr${isToday ? ' class="is-today"' : ""}>
          <th scope="row">${DAY_NAMES[d]}${isToday ? ' <span class="today-tag">hoje</span>' : ""}</th>
          <td>${value}</td></tr>`;
      })
      .join("");
  }

  /* ---------- Cardápio ---------- */

  const photoUrl = (id, w) =>
    /^(https?:|assets\/)/.test(id) ? id : `https://images.unsplash.com/photo-${id}?w=${w}&q=70&auto=format&fit=crop`;

  function renderMenu() {
    const tabs = $("[data-menu-tabs]");
    const panels = $("[data-menu-panels]");
    if (!tabs || !panels) return;

    tabs.innerHTML = data.categories
      .map(
        (c, i) => `<button type="button" role="tab" id="tab-${c.id}" aria-controls="panel-${c.id}"
          aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}">${c.name}</button>`
      )
      .join("");

    panels.innerHTML = data.categories
      .map((c, i) => {
        const featured = c.items.filter((it) => it.photo);
        const list = c.items.filter((it) => !it.photo);
        return `<div class="menu-panel" role="tabpanel" id="panel-${c.id}" aria-labelledby="tab-${c.id}" tabindex="0"${i === 0 ? "" : " hidden"}>
          <p class="panel-desc">${c.description}</p>
          <div class="menu-layout">
            <ul class="featured">${featured.map(featuredItem).join("")}</ul>
            <ul class="menu-list">${list.map(listItem).join("")}</ul>
          </div>
        </div>`;
      })
      .join("");

    const tabButtons = $$("[role=tab]", tabs);
    const select = (btn, focus) => {
      tabButtons.forEach((b) => {
        const on = b === btn;
        b.setAttribute("aria-selected", on);
        b.tabIndex = on ? 0 : -1;
        $("#" + b.getAttribute("aria-controls")).hidden = !on;
      });
      if (focus) btn.focus();
    };
    tabButtons.forEach((btn, i) => {
      btn.addEventListener("click", () => select(btn));
      btn.addEventListener("keydown", (e) => {
        let next = null;
        if (e.key === "ArrowRight") next = tabButtons[(i + 1) % tabButtons.length];
        if (e.key === "ArrowLeft") next = tabButtons[(i - 1 + tabButtons.length) % tabButtons.length];
        if (e.key === "Home") next = tabButtons[0];
        if (e.key === "End") next = tabButtons[tabButtons.length - 1];
        if (next) {
          e.preventDefault();
          select(next, true);
        }
      });
    });

    panels.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-add]");
      if (!btn) return;
      addToCart(btn.dataset.add);
    });
  }

  const tagHtml = (it) => (it.tag ? `<span class="tag">${it.tag}</span>` : "");
  const addBtn = (it) =>
    `<button type="button" class="add-btn" data-add="${it.id}" aria-label="Adicionar ${it.name} ao pedido">
      <svg viewBox="0 0 24 24" aria-hidden="true" class="icon"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
      <span>Adicionar</span><span class="in-cart" data-in-cart="${it.id}" hidden></span>
    </button>`;

  function featuredItem(it) {
    return `<li class="featured-item">
      <figure><img src="${photoUrl(it.photo, 640)}" srcset="${photoUrl(it.photo, 420)} 420w, ${photoUrl(it.photo, 640)} 640w, ${photoUrl(it.photo, 900)} 900w"
        sizes="(max-width: 640px) 92vw, (max-width: 1100px) 45vw, 340px" alt="${it.alt || ""}" width="640" height="480" loading="lazy"></figure>
      <div class="featured-body">
        <div class="item-line"><h3>${it.name}</h3><span class="price">${shortPrice(it.price)}</span></div>
        <p>${it.desc}</p>
        <div class="item-foot">${tagHtml(it)}${addBtn(it)}</div>
      </div>
    </li>`;
  }

  function listItem(it) {
    return `<li class="menu-item">
      <div class="item-line"><h3>${it.name}</h3><span class="leader" aria-hidden="true"></span><span class="price">${shortPrice(it.price)}</span></div>
      <p>${it.desc} ${tagHtml(it)}</p>
      ${addBtn(it)}
    </li>`;
  }

  /* ---------- Carrinho ---------- */

  const STORAGE_KEY = "aurora-cart-v1";
  let cart = loadCart();

  function loadCart() {
    try {
      const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      const clean = {};
      Object.entries(raw).forEach(([id, q]) => {
        if (itemsById.has(id) && Number.isInteger(q) && q > 0) clean[id] = Math.min(q, 20);
      });
      return clean;
    } catch (_) {
      return {};
    }
  }
  function saveCart() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch (_) {
      /* armazenamento indisponível: o carrinho continua na memória */
    }
  }

  const cartCount = () => Object.values(cart).reduce((a, b) => a + b, 0);
  const cartTotal = () => Object.entries(cart).reduce((sum, [id, q]) => sum + itemsById.get(id).price * q, 0);

  function addToCart(id) {
    const item = itemsById.get(id);
    if (!item) return;
    if ((cart[id] || 0) >= 20) {
      toast("Limite de 20 unidades por item. Para encomendas maiores, ligue para a loja.");
      return;
    }
    cart[id] = (cart[id] || 0) + 1;
    saveCart();
    renderCart();
    toast(`${item.name} adicionado · ${cartCount()} ${cartCount() === 1 ? "item" : "itens"} no pedido`, true);
  }

  function setQty(id, q) {
    if (q <= 0) delete cart[id];
    else cart[id] = Math.min(q, 20);
    saveCart();
    renderCart();
  }

  function renderCart() {
    const count = cartCount();
    $$("[data-cart-count]").forEach((b) => {
      b.textContent = count;
      b.hidden = count === 0;
    });
    $$(".order-trigger").forEach((b) =>
      b.setAttribute("aria-label", count ? `Pedido, ${count} ${count === 1 ? "item" : "itens"}` : "Pedido, vazio")
    );
    $$("[data-in-cart]").forEach((el) => {
      const q = cart[el.dataset.inCart] || 0;
      el.hidden = q === 0;
      el.innerHTML = q ? `${q}<span class="sr-only"> no pedido</span>` : "";
    });

    const list = $("[data-cart-list]");
    const empty = $("[data-order-empty]");
    const form = $("[data-order-form]");
    if (!list) return;
    const entries = Object.entries(cart);
    empty.hidden = entries.length > 0;
    form.hidden = entries.length === 0;
    list.hidden = entries.length === 0;
    list.innerHTML = entries
      .map(([id, q]) => {
        const it = itemsById.get(id);
        return `<li class="cart-item">
          <div class="cart-item-info">
            <p class="cart-item-name">${it.name}</p>
            <p class="muted">${formatPrice(it.price)} cada</p>
          </div>
          <div class="qty" role="group" aria-label="Quantidade de ${it.name}">
            <button type="button" data-qty="${id}" data-delta="-1" aria-label="${q === 1 ? "Remover" : "Diminuir"} ${it.name}">${
              q === 1
                ? '<svg viewBox="0 0 24 24" aria-hidden="true" class="icon"><path d="M5 7h14M10 7V5h4v2M7 7l1 12h8l1-12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>'
                : "−"
            }</button>
            <output aria-live="polite">${q}</output>
            <button type="button" data-qty="${id}" data-delta="1" aria-label="Aumentar ${it.name}">+</button>
          </div>
          <p class="cart-item-sub">${formatPrice(it.price * q)}</p>
        </li>`;
      })
      .join("");
    $("[data-cart-total]").textContent = formatPrice(cartTotal());
  }

  /* ---------- Horários de retirada ---------- */

  function pickupSlots(now = new Date()) {
    const { leadMinutes, stepMinutes, lastBeforeCloseMinutes } = data.pickup;
    for (let offset = 0; offset < 8; offset++) {
      const date = new Date(now);
      date.setDate(now.getDate() + offset);
      const hours = data.hours[date.getDay()];
      if (!hours) continue;
      const [open, close] = hours.map(toMinutes);
      let start = open + leadMinutes;
      if (offset === 0) start = Math.max(start, minutesNow(now) + leadMinutes);
      start = Math.ceil(start / stepMinutes) * stepMinutes;
      const end = close - lastBeforeCloseMinutes;
      const slots = [];
      for (let m = start; m <= end; m += stepMinutes) slots.push(m);
      if (slots.length) return { offset, day: date.getDay(), slots };
    }
    return null;
  }

  function renderPickup() {
    const select = $("[data-pickup]");
    const hint = $("[data-pickup-hint]");
    if (!select) return;
    const prev = select.value;
    const res = pickupSlots();
    if (!res) {
      select.innerHTML = '<option value="">Sem horários disponíveis</option>';
      hint.textContent = "Não há horários de retirada nos próximos dias.";
      return;
    }
    const dayLabel = res.offset === 0 ? "Hoje" : res.offset === 1 ? "Amanhã" : DAY_NAMES[res.day];
    select.innerHTML =
      '<option value="">Escolha um horário</option>' +
      res.slots.map((m) => `<option value="${res.offset}|${m}">${dayLabel}, ${formatHour(m)}</option>`).join("");
    if ([...select.options].some((o) => o.value === prev)) select.value = prev;
    hint.textContent =
      res.offset === 0
        ? `Preparo mínimo de ${data.pickup.leadMinutes} minutos.`
        : `Hoje não há mais horários de retirada. Próxima janela: ${dayLabel.toLowerCase()}.`;
  }

  /* ---------- Formulários ---------- */

  function setError(input, message) {
    const err = $("#" + input.id + "-error");
    input.setAttribute("aria-invalid", message ? "true" : "false");
    if (message) input.setAttribute("aria-describedby", err.id);
    else input.removeAttribute("aria-describedby");
    err.textContent = message || "";
    err.hidden = !message;
    return !message;
  }

  const phoneDigits = (v) => v.replace(/\D/g, "");
  function maskPhone(v) {
    const d = phoneDigits(v).slice(0, 11);
    if (d.length <= 2) return d.length ? `(${d}` : "";
    if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
    if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  }

  function setupOrderForm() {
    const form = $("[data-order-form]");
    if (!form) return;
    const name = $("#o-name");
    const phone = $("#o-phone");
    const time = $("#o-time");
    const submit = $("[data-order-submit]");
    const errorBox = $("[data-order-error]");

    const validators = {
      "o-name": () => setError(name, name.value.trim().length >= 2 ? "" : "Informe um nome com pelo menos 2 letras."),
      "o-phone": () => {
        const n = phoneDigits(phone.value).length;
        return setError(phone, n === 10 || n === 11 ? "" : "Informe o celular com DDD, ex.: (11) 91234-5678.");
      },
      "o-time": () => setError(time, time.value ? "" : "Escolha um horário de retirada."),
    };

    phone.addEventListener("input", () => {
      phone.value = maskPhone(phone.value);
    });
    [name, phone, time].forEach((el) => {
      el.addEventListener("blur", () => el.value && validators[el.id]());
      el.addEventListener("input", () => el.getAttribute("aria-invalid") === "true" && validators[el.id]());
      el.addEventListener("change", () => el.getAttribute("aria-invalid") === "true" && validators[el.id]());
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      errorBox.textContent = "";
      renderPickup();
      const results = Object.values(validators).map((v) => v());
      if (results.includes(false)) {
        const firstInvalid = form.querySelector('[aria-invalid="true"]');
        if (firstInvalid) firstInvalid.focus();
        return;
      }
      if (!cartCount()) return;

      submit.disabled = true;
      submit.classList.add("is-loading");
      submit.textContent = "Registrando…";

      const [offset, mins] = time.value.split("|").map(Number);
      const dayLabel = offset === 0 ? "hoje" : offset === 1 ? "amanhã" : DAY_NAMES[(new Date().getDay() + offset) % 7].toLowerCase();
      const total = formatPrice(cartTotal());
      const firstName = name.value.trim().split(/\s+/)[0];

      setTimeout(() => {
        const code = "A" + Math.floor(100 + Math.random() * 900);
        $("[data-done-code]").textContent = code;
        $("[data-done-text]").textContent =
          `${firstName}, seu pedido de ${total} ficaria pronto ${dayLabel} às ${formatHour(mins)}. ` +
          "Como esta é uma demonstração, nada foi enviado à loja.";
        cart = {};
        saveCart();
        renderCart();
        form.reset();
        form.hidden = true;
        $("[data-order-empty]").hidden = true;
        const done = $("[data-order-done]");
        done.hidden = false;
        done.focus();
        submit.disabled = false;
        submit.classList.remove("is-loading");
        submit.textContent = "Confirmar pedido";
      }, reduceMotion ? 300 : 900);
    });
  }

  function setupSignup() {
    const form = $("[data-signup]");
    if (!form) return;
    const ev = $("#ev-event");
    const email = $("#ev-email");
    const status = $("[data-signup-status]");
    const checks = {
      "ev-event": () => setError(ev, ev.value ? "" : "Escolha um encontro."),
      "ev-email": () =>
        setError(email, /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value.trim()) ? "" : "Informe um e-mail válido, ex.: nome@email.com."),
    };
    [ev, email].forEach((el) => {
      el.addEventListener("blur", () => el.value && checks[el.id]());
      el.addEventListener("input", () => el.getAttribute("aria-invalid") === "true" && checks[el.id]());
    });
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      status.textContent = "";
      status.className = "form-status";
      const ok = Object.values(checks).map((c) => c());
      if (ok.includes(false)) {
        form.querySelector('[aria-invalid="true"]').focus();
        return;
      }
      const btn = form.querySelector("button[type=submit]");
      btn.disabled = true;
      btn.textContent = "Reservando…";
      setTimeout(() => {
        status.textContent = `Pronto! Reserva para “${ev.value}” registrada (simulação — nenhum e-mail é enviado nesta demonstração).`;
        status.className = "form-status form-status-ok";
        form.reset();
        btn.disabled = false;
        btn.textContent = "Reservar";
      }, reduceMotion ? 200 : 700);
    });
  }

  /* ---------- Diálogo do pedido ---------- */

  function setupOrderDialog() {
    const dialog = $("[data-order]");
    if (!dialog) return;
    let lastTrigger = null;

    const open = (trigger) => {
      lastTrigger = trigger;
      renderPickup();
      $("[data-order-done]").hidden = true;
      renderCart();
      if (typeof dialog.showModal === "function") dialog.showModal();
      else dialog.setAttribute("open", "");
      document.documentElement.classList.add("has-dialog");
      const focusTarget = cartCount() ? $("#o-name") : $("[data-order-empty] .btn");
      if (focusTarget && cartCount()) focusTarget.focus();
    };
    const close = () => {
      if (dialog.open) dialog.close();
    };

    dialog.addEventListener("close", () => {
      document.documentElement.classList.remove("has-dialog");
      if (lastTrigger && document.contains(lastTrigger)) lastTrigger.focus();
    });

    document.addEventListener("click", (e) => {
      const opener = e.target.closest("[data-open-order]");
      if (opener) {
        closeNav();
        open(opener);
        return;
      }
      if (e.target.closest("[data-close-order]")) {
        const link = e.target.closest("a[href^='#']");
        lastTrigger = null;
        close();
        if (link) {
          e.preventDefault();
          $(link.getAttribute("href")).scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
        }
      }
      const qty = e.target.closest("[data-qty]");
      if (qty) {
        const id = qty.dataset.qty;
        const next = (cart[id] || 0) + Number(qty.dataset.delta);
        setQty(id, next);
        // mantém o foco em um controle existente depois de re-renderizar
        const again = $(`[data-qty="${id}"][data-delta="${qty.dataset.delta}"]`) || $(`[data-qty="${id}"]`);
        (again || $("[data-cart-list] [data-qty]") || $("[data-order-empty] .btn") || dialog).focus();
      }
    });

    // Fecha ao clicar no fundo escuro
    dialog.addEventListener("click", (e) => {
      if (e.target === dialog) close();
    });
  }

  /* ---------- Navegação ---------- */

  const navToggle = $("[data-nav-toggle]");
  const nav = $("[data-nav]");
  function closeNav() {
    if (!navToggle) return;
    navToggle.setAttribute("aria-expanded", "false");
    $(".sr-only", navToggle).textContent = "Abrir menu";
    nav.classList.remove("is-open");
  }
  function setupNav() {
    if (!navToggle) return;
    navToggle.addEventListener("click", () => {
      const isOpen = navToggle.getAttribute("aria-expanded") === "true";
      if (isOpen) return closeNav();
      navToggle.setAttribute("aria-expanded", "true");
      $(".sr-only", navToggle).textContent = "Fechar menu";
      nav.classList.add("is-open");
      const first = $("a", nav);
      if (first) first.focus();
    });
    nav.addEventListener("click", (e) => e.target.closest("a") && closeNav());
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && nav.classList.contains("is-open")) {
        closeNav();
        navToggle.focus();
      }
    });
    window.matchMedia("(min-width: 900px)").addEventListener("change", (m) => m.matches && closeNav());

    const header = $("[data-header]");
    const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    // Destaca a seção visível na navegação
    const links = $$("a", nav);
    const sections = links.map((a) => $(a.getAttribute("href"))).filter(Boolean);
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((en) => {
            if (!en.isIntersecting) return;
            links.forEach((a) => {
              const on = a.getAttribute("href") === "#" + en.target.id;
              if (on) a.setAttribute("aria-current", "true");
              else a.removeAttribute("aria-current");
            });
          });
        },
        { rootMargin: "-45% 0px -50% 0px" }
      );
      sections.forEach((s) => io.observe(s));
    }
  }

  /* ---------- Toast ---------- */

  let toastTimer;
  function toast(message, withAction) {
    const el = $("[data-toast]");
    el.innerHTML = "";
    const text = document.createElement("span");
    text.textContent = message;
    el.appendChild(text);
    if (withAction) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = "Ver pedido";
      btn.setAttribute("data-open-order", "");
      el.appendChild(btn);
    }
    el.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("is-visible"), 4000);
  }

  /* ---------- Revelação suave ---------- */

  function setupReveal() {
    if (reduceMotion || !("IntersectionObserver" in window)) return;
    const targets = $$(".section-head, .process-step, .featured-item, .event, .gallery figure, .beans-card");
    targets.forEach((t) => t.classList.add("reveal"));
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add("is-in");
            io.unobserve(en.target);
          }
        }),
      { rootMargin: "0px 0px -8% 0px" }
    );
    targets.forEach((t) => io.observe(t));
  }

  /* ---------- Início ---------- */

  $$("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));
  renderStatus();
  renderHours();
  renderMenu();
  renderCart();
  setupNav();
  setupOrderDialog();
  setupOrderForm();
  setupSignup();
  setupReveal();
  setInterval(renderStatus, 60 * 1000);
})();
