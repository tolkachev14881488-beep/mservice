(() => {
  const $ = (s, p = document) => p.querySelector(s);
  const $$ = (s, p = document) => Array.from(p.querySelectorAll(s));

  const root = $("#ms-root");
  if (!root) return;

  // FormSubmit — основной канал. Telegram — только через serverless endpoint (не хранить токен в клиенте).
  // Пример: разверните api/telegram.js на Vercel/Netlify и укажите URL ниже.
  const CONFIG = {
    EMAIL_ENDPOINT: "https://formsubmit.co/ajax/a-prom01@mail.ru",
    TELEGRAM_ENDPOINT: "" // например: "https://your-domain.vercel.app/api/telegram"
  };

  // Smooth anchors
  $$('a[href^="#"]', root).forEach((a) => {
    a.addEventListener("click", (e) => {
      const hash = a.getAttribute("href");
      if (!hash || hash === "#") return;
      const target = $(hash, root) || document.querySelector(hash);
      if (!target) return;
      e.preventDefault();
      closeMobileNav();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  // Reveal on scroll
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  $$(".reveal", root).forEach((el) => io.observe(el));

  // Stagger delays for grid children
  $$(".bento .reveal", root).forEach((el, i) => el.style.setProperty("--d", i));
  $$(".parts-scroll .reveal", root).forEach((el, i) => el.style.setProperty("--d", i));
  $$(".gallery-grid .reveal", root).forEach((el, i) => el.style.setProperty("--d", i));
  $$(".stats-grid .stat-card", root).forEach((el, i) => el.style.setProperty("--d", i));

  // 3D tilt on service cards
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reduceMotion) {
    $$("[data-tilt]", root).forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `perspective(900px) rotateX(${y * -8}deg) rotateY(${x * 8}deg) translateY(-4px)`;
      });
      card.addEventListener("mouseleave", () => { card.style.transform = ""; });
    });
  }

  // Active nav link on scroll
  const navLinks = $$(".nav-desktop a[href^='#']", root);
  const sectionIds = navLinks.map((a) => a.getAttribute("href")?.slice(1)).filter(Boolean);
  const sections = sectionIds.map((id) => $("#" + id, root)).filter(Boolean);
  if (sections.length && navLinks.length) {
    const navIO = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = entry.target.id;
          navLinks.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === "#" + id));
        });
      },
      { rootMargin: "-35% 0px -55% 0px", threshold: 0 }
    );
    sections.forEach((s) => navIO.observe(s));
  }

  // Header scroll
  const header = $("#siteHeader", root);
  const onScroll = () => {
    const d = document.documentElement;
    const max = d.scrollHeight - d.clientHeight;
    const p = max > 0 ? (d.scrollTop / max) * 100 : 0;
    const progress = $("#msProgress", root);
    if (progress) progress.style.width = p + "%";
    header?.classList.toggle("scrolled", d.scrollTop > 40);
    const topBtn = $("#msTop", root);
    topBtn?.classList.toggle("show", d.scrollTop > 520);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  $("#msTop", root)?.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  // Hero image subtle parallax
  const heroImg = $("#heroImg", root);
  if (heroImg && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    window.addEventListener(
      "scroll",
      () => {
        const y = window.scrollY;
        if (y < window.innerHeight) heroImg.style.transform = `translateY(${y * 0.15}px) scale(1.04)`;
      },
      { passive: true }
    );
  }

  // Burger menu
  const burger = $("#burgerBtn", root);
  const mobileNav = $("#mobileNav", root);

  function openMobileNav() {
    mobileNav?.classList.add("open");
    burger?.classList.add("open");
    burger?.setAttribute("aria-expanded", "true");
    mobileNav?.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeMobileNav() {
    mobileNav?.classList.remove("open");
    burger?.classList.remove("open");
    burger?.setAttribute("aria-expanded", "false");
    mobileNav?.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  burger?.addEventListener("click", () => {
    mobileNav?.classList.contains("open") ? closeMobileNav() : openMobileNav();
  });
  mobileNav?.addEventListener("click", (e) => {
    if (e.target === mobileNav) closeMobileNav();
  });
  $$(".mobile-nav a, .mobile-nav .btn", root).forEach((el) => {
    el.addEventListener("click", closeMobileNav);
  });

  // Stats counters
  let statsDone = false;
  const about = $("#about", root);
  if (about) {
    const statsIO = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !statsDone) {
            statsDone = true;
            $$(".num", about).forEach((el) => {
              const target = Number(el.dataset.target || 0);
              const start = performance.now();
              const dur = 1200;
              const tick = (t) => {
                const prog = Math.min((t - start) / dur, 1);
                const val = Math.floor(target * (1 - Math.pow(1 - prog, 3)));
                el.textContent = val + (target >= 100 ? "+" : target === 12 ? "" : "+");
                if (prog < 1) requestAnimationFrame(tick);
              };
              requestAnimationFrame(tick);
            });
          }
        });
      },
      { threshold: 0.35 }
    );
    statsIO.observe(about);
  }

  // Reviews slider + swipe
  const track = $("#msRevTrack", root);
  const shell = $("#revShell", root);
  const dots = $$("#msDots .dot", root);
  let idx = 0;
  let timer = null;
  let touchStartX = 0;

  const show = (i) => {
    if (!dots.length) return;
    idx = ((i % dots.length) + dots.length) % dots.length;
    if (track) track.style.transform = `translateX(-${idx * 100}%)`;
    dots.forEach((d, di) => d.classList.toggle("on", di === idx));
  };

  const startAuto = () => {
    clearInterval(timer);
    timer = setInterval(() => show(idx + 1), 4500);
  };

  dots.forEach((d, i) => d.addEventListener("click", () => { show(i); startAuto(); }));

  if (shell) {
    shell.addEventListener("touchstart", (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
    shell.addEventListener("touchend", (e) => {
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) { show(idx + (diff > 0 ? 1 : -1)); startAuto(); }
    }, { passive: true });
  }

  if (dots.length) { show(0); startAuto(); }

  // Modals
  const modals = {
    callback: $("#callbackModal", root),
    vacancy: $("#vacancyModal", root),
    contacts: $("#contactsModal", root)
  };
  let lastFocus = null;

  const openModal = (m) => {
    if (!m) return;
    lastFocus = document.activeElement;
    m.classList.add("open");
    document.body.style.overflow = "hidden";
    const first = $("input, button, textarea, [tabindex]", m);
    first?.focus();
  };

  const closeAll = () => {
    Object.values(modals).forEach((m) => m?.classList.remove("open"));
    if (!mobileNav?.classList.contains("open")) document.body.style.overflow = "";
    lastFocus?.focus?.();
  };

  $$(".open-modal-btn", root).forEach((b) => b.addEventListener("click", () => openModal(modals.callback)));
  $$(".open-modal-part-btn", root).forEach((b) => b.addEventListener("click", () => {
    openModal(modals.callback);
    const car = $("#modalCar", root);
    if (car) car.placeholder = "Марка авто / нужные запчасти";
  }));
  $$(".open-vacancy-modal", root).forEach((b) => b.addEventListener("click", () => openModal(modals.vacancy)));
  $$(".open-contacts-modal", root).forEach((b) => b.addEventListener("click", () => openModal(modals.contacts)));
  $$("[data-close]", root).forEach((b) => b.addEventListener("click", closeAll));
  Object.values(modals).forEach((m) => m?.addEventListener("click", (e) => { if (e.target === m) closeAll(); }));
  window.addEventListener("keydown", (e) => { if (e.key === "Escape") closeAll(); });

  // Form tabs
  const requestTypeInput = $("#requestType", root);
  $$(".form-tab", root).forEach((tab) => {
    tab.addEventListener("click", () => {
      $$(".form-tab", root).forEach((t) => {
        t.classList.remove("on");
        t.setAttribute("aria-selected", "false");
      });
      tab.classList.add("on");
      tab.setAttribute("aria-selected", "true");
      if (requestTypeInput) requestTypeInput.value = tab.dataset.type || "Ремонт";
    });
  });

  // Phone hint on focus
  const phoneInputs = $$('input[type="tel"]', root);
  phoneInputs.forEach((inp) => {
    inp.addEventListener("focus", () => {
      if (!inp.value) inp.value = "+375 ";
    });
  });

  async function sendToEmail(formData) {
    const body = new FormData();
    for (const [k, v] of formData.entries()) body.append(k, v);
    body.append("_captcha", "false");
    body.append("_subject", formData.get("_subject") || "Новая заявка");
    try {
      const res = await fetch(CONFIG.EMAIL_ENDPOINT, { method: "POST", body });
      return res.ok;
    } catch {
      return false;
    }
  }

  async function sendToTelegram(text) {
    if (!CONFIG.TELEGRAM_ENDPOINT || !text) return null;
    try {
      const res = await fetch(CONFIG.TELEGRAM_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text })
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  const feedback = (el, html, timeout = 4500) => {
    if (!el) return;
    el.innerHTML = html;
    if (timeout) setTimeout(() => { el.innerHTML = ""; }, timeout);
  };

  function bindForm({ form, fb, payload, closeModalId }) {
    const formEl = $(form, root);
    const fbEl = $(fb, root);
    if (!formEl || !fbEl) return;

    formEl.addEventListener("submit", async (e) => {
      e.preventDefault();
      const data = payload();
      if (!data.valid) {
        feedback(fbEl, '<span style="color:#ff9f9f">Заполните обязательные поля</span>', 3000);
        return;
      }

      feedback(fbEl, '<span style="color:#8ec1ff">Отправка...</span>', 0);

      const emailOk = await sendToEmail(data.formData);
      if (!emailOk) {
        feedback(fbEl, '<span style="color:#ff9f9f">Ошибка отправки. Попробуйте позже или позвоните нам.</span>');
        return;
      }

      const tgResult = await sendToTelegram(data.telegramText);
      let msg = '<span style="color:#9fe0a5">Заявка отправлена! Мы свяжемся с вами.</span>';
      if (CONFIG.TELEGRAM_ENDPOINT && tgResult === false) {
        msg += '<div style="margin-top:6px;color:#f7c86a;">Email доставлен, Telegram — проверьте endpoint.</div>';
      }
      feedback(fbEl, msg);

      formEl.reset();
      if (requestTypeInput) requestTypeInput.value = "Ремонт";
      $$(".form-tab", root).forEach((t, i) => {
        t.classList.toggle("on", i === 0);
        t.setAttribute("aria-selected", i === 0 ? "true" : "false");
      });

      if (closeModalId) {
        setTimeout(() => {
          $(closeModalId, root)?.classList.remove("open");
          if (!mobileNav?.classList.contains("open")) document.body.style.overflow = "";
        }, 1200);
      }
    });
  }

  bindForm({
    form: "#mainForm",
    fb: "#formFeedback",
    payload: () => {
      const name = ($("#userName", root)?.value || "").trim();
      const phone = ($("#userPhone", root)?.value || "").trim();
      const car = ($("#carModel", root)?.value || "").trim();
      const issue = ($("#issueDesc", root)?.value || "").trim();
      const type = ($("#requestType", root)?.value || "Ремонт").trim();

      const formData = new FormData();
      formData.append("Тип заявки", type);
      formData.append("Имя", name);
      formData.append("Телефон", phone);
      formData.append("Автомобиль", car);
      formData.append("Проблема", issue);
      formData.append("_subject", `Заявка: ${type}`);

      const telegramText =
        `<b>НОВАЯ ЗАЯВКА</b>\n` +
        `Тип: ${type}\n` +
        `Имя: ${name}\n` +
        `Телефон: ${phone}\n` +
        `Авто: ${car || "не указано"}\n` +
        `Проблема: ${issue || "не указана"}`;

      return { valid: !!(name && phone), formData, telegramText };
    }
  });

  bindForm({
    form: "#modalForm",
    fb: "#modalFeedback",
    closeModalId: "#callbackModal",
    payload: () => {
      const name = ($("#modalName", root)?.value || "").trim();
      const phone = ($("#modalPhone", root)?.value || "").trim();
      const car = ($("#modalCar", root)?.value || "").trim();

      const formData = new FormData();
      formData.append("Имя", name);
      formData.append("Телефон", phone);
      formData.append("Автомобиль / Запчасти", car);
      formData.append("_subject", "Быстрая запись");

      const telegramText =
        `<b>БЫСТРАЯ ЗАПИСЬ</b>\n` +
        `Имя: ${name}\n` +
        `Телефон: ${phone}\n` +
        `Авто/запчасти: ${car || "не указано"}`;

      return { valid: !!(name && phone), formData, telegramText };
    }
  });

  bindForm({
    form: "#vacancyForm",
    fb: "#vacancyFeedback",
    closeModalId: "#vacancyModal",
    payload: () => {
      const name = ($("#vacancyName", root)?.value || "").trim();
      const phone = ($("#vacancyPhone", root)?.value || "").trim();
      const exp = ($("#vacancyExp", root)?.value || "").trim();
      const msg = ($("#vacancyMsg", root)?.value || "").trim();

      const formData = new FormData();
      formData.append("Имя", name);
      formData.append("Телефон", phone);
      formData.append("Опыт (лет)", exp);
      formData.append("Сообщение", msg);
      formData.append("_subject", "Отклик на вакансию мастера");

      const telegramText =
        `<b>ОТКЛИК НА ВАКАНСИЮ</b>\n` +
        `Имя: ${name}\n` +
        `Телефон: ${phone}\n` +
        `Опыт: ${exp} лет\n` +
        `О себе: ${msg || "не указано"}`;

      return { valid: !!(name && phone && exp), formData, telegramText };
    }
  });
})();
