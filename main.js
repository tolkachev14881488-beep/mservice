(() => {
  const $ = (s, p = document) => p.querySelector(s);
  const $$ = (s, p = document) => Array.from(p.querySelectorAll(s));

  const root = $("#ms-root");
  if (!root) return;

  const CONFIG = {
    EMAIL_ENDPOINT: "https://formsubmit.co/ajax/a-prom01@mail.ru",
    TELEGRAM_ENDPOINT: ""
  };

  const mobileNav = $("#mobileNav", root);
  const burger = $("#burgerBtn", root);

  function closeMobileNav() {
    mobileNav?.classList.remove("open");
    burger?.classList.remove("open");
    burger?.setAttribute("aria-expanded", "false");
    mobileNav?.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  function openMobileNav() {
    mobileNav?.classList.add("open");
    burger?.classList.add("open");
    burger?.setAttribute("aria-expanded", "true");
    mobileNav?.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

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
    { threshold: 0.1 }
  );
  $$(".reveal", root).forEach((el) => io.observe(el));

  // Stagger
  const stagger = (sel) => $$(sel, root).forEach((el, i) => el.style.setProperty("--d", i));
  stagger(".trust-grid .reveal");
  stagger(".process-grid .reveal");
  stagger(".bento .reveal");
  stagger(".parts-grid .reveal");
  stagger(".gallery-grid .reveal");
  stagger(".faq-list .reveal");

  // Scroll: progress, header, top btn, sticky CTA
  const header = $("#siteHeader", root);
  const scrollCta = $("#scrollCta", root);

  const onScroll = () => {
    const d = document.documentElement;
    const max = d.scrollHeight - d.clientHeight;
    const p = max > 0 ? (d.scrollTop / max) * 100 : 0;
    $("#msProgress", root) && ($("#msProgress", root).style.width = p + "%");
    header?.classList.toggle("scrolled", d.scrollTop > 40);
    $("#msTop", root)?.classList.toggle("show", d.scrollTop > 520);
    scrollCta?.classList.toggle("show", d.scrollTop > window.innerHeight * 0.65);
    scrollCta?.setAttribute("aria-hidden", scrollCta?.classList.contains("show") ? "false" : "true");
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  $("#msTop", root)?.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  // Hero parallax
  const heroImg = $("#heroImg", root);
  if (heroImg && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    window.addEventListener("scroll", () => {
      const y = window.scrollY;
      if (y < window.innerHeight) heroImg.style.transform = `translateY(${y * 0.12}px) scale(1.03)`;
    }, { passive: true });
  }

  // Burger
  burger?.addEventListener("click", () => {
    mobileNav?.classList.contains("open") ? closeMobileNav() : openMobileNav();
  });
  mobileNav?.addEventListener("click", (e) => { if (e.target === mobileNav) closeMobileNav(); });
  $$(".mobile-nav a, .mobile-nav .btn", root).forEach((el) => el.addEventListener("click", closeMobileNav));

  // Active nav
  const navLinks = $$(".nav-desktop a[href^='#']", root);
  const sectionIds = navLinks.map((a) => a.getAttribute("href")?.slice(1)).filter(Boolean);
  const sections = sectionIds.map((id) => $("#" + id, root)).filter(Boolean);
  if (sections.length) {
    const navIO = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = entry.target.id;
          navLinks.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === "#" + id));
        });
      },
      { rootMargin: "-30% 0px -55% 0px", threshold: 0 }
    );
    sections.forEach((s) => navIO.observe(s));
  }

  // Reviews slider
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
    timer = setInterval(() => show(idx + 1), 5000);
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
    vacancy: $("#vacancyModal", root)
  };
  let lastFocus = null;

  const setService = (name) => {
    const svc = name || "";
    const modalSvc = $("#modalService", root);
    const mainSvc = $("#serviceName", root);
    const issue = $("#issueDesc", root);
    if (modalSvc) modalSvc.value = svc;
    if (mainSvc) mainSvc.value = svc;
    if (svc && issue && !issue.value) issue.placeholder = `Интересует: ${svc}. Опишите проблему...`;
  };

  const openModal = (m, service) => {
    if (!m) return;
    if (service) setService(service);
    lastFocus = document.activeElement;
    m.classList.add("open");
    document.body.style.overflow = "hidden";
    $("input:not([type=hidden])", m)?.focus();
  };

  const closeAll = () => {
    Object.values(modals).forEach((m) => m?.classList.remove("open"));
    if (!mobileNav?.classList.contains("open")) document.body.style.overflow = "";
    lastFocus?.focus?.();
  };

  $$(".open-modal-btn", root).forEach((b) => {
    b.addEventListener("click", () => openModal(modals.callback, b.dataset.service || ""));
  });

  $$(".open-modal-part-btn", root).forEach((b) => {
    b.addEventListener("click", () => {
      openModal(modals.callback, "Запчасти");
      const car = $("#modalCar", root);
      if (car) car.placeholder = "Марка авто / VIN / нужные запчасти";
      const mainForm = $("#mainForm", root);
      if (mainForm) {
        $$(".form-tab", root).forEach((t) => {
          const isParts = t.dataset.type === "Запчасти";
          t.classList.toggle("on", isParts);
          t.setAttribute("aria-selected", isParts ? "true" : "false");
        });
        const rt = $("#requestType", root);
        if (rt) rt.value = "Запчасти";
        mainForm.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    });
  });

  $$(".svc-book-btn", root).forEach((b) => {
    b.addEventListener("click", () => {
      const svc = b.dataset.service || b.closest("[data-service]")?.dataset.service || "";
      openModal(modals.callback, svc);
    });
  });

  $$(".open-vacancy-modal", root).forEach((b) => b.addEventListener("click", () => openModal(modals.vacancy)));
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

  // Phone hint
  $$('input[type="tel"]', root).forEach((inp) => {
    inp.addEventListener("focus", () => { if (!inp.value) inp.value = "+375 "; });
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

  function bindForm({ form, fb, payload, closeModalId, onSuccess }) {
    const formEl = $(form, root);
    const fbEl = $(fb, root);
    if (!formEl || !fbEl) return;

    formEl.addEventListener("submit", async (e) => {
      e.preventDefault();
      const data = payload();
      if (!data.valid) {
        feedback(fbEl, '<span style="color:#ff9f9f">Заполните имя и телефон</span>', 3000);
        return;
      }

      feedback(fbEl, '<span style="color:#8ec1ff">Отправка...</span>', 0);
      const emailOk = await sendToEmail(data.formData);
      if (!emailOk) {
        feedback(fbEl, '<span style="color:#ff9f9f">Ошибка. Позвоните: +375 33 911-66-11</span>');
        return;
      }

      await sendToTelegram(data.telegramText);
      feedback(fbEl, '<span style="color:#3dd68c">✓ Принято! Перезвоним за 10 минут.</span>');
      formEl.reset();
      onSuccess?.();

      if (closeModalId) {
        setTimeout(() => {
          $(closeModalId, root)?.classList.remove("open");
          if (!mobileNav?.classList.contains("open")) document.body.style.overflow = "";
        }, 1400);
      }
    });
  }

  const resetMainTabs = () => {
    if (requestTypeInput) requestTypeInput.value = "Ремонт";
    $$(".form-tab", root).forEach((t, i) => {
      t.classList.toggle("on", i === 0);
      t.setAttribute("aria-selected", i === 0 ? "true" : "false");
    });
    setService("");
  };

  bindForm({
    form: "#heroForm",
    fb: "#heroFeedback",
    payload: () => {
      const name = ($("#heroName", root)?.value || "").trim();
      const phone = ($("#heroPhone", root)?.value || "").trim();
      const car = ($("#heroCar", root)?.value || "").trim();
      const formData = new FormData();
      formData.append("Тип заявки", "Консультация (Hero)");
      formData.append("Имя", name);
      formData.append("Телефон", phone);
      formData.append("Автомобиль", car);
      formData.append("_subject", "Заявка с Hero — консультация");
      const telegramText = `<b>HERO ЗАЯВКА</b>\nИмя: ${name}\nТелефон: ${phone}\nАвто: ${car || "—"}`;
      return { valid: !!(name && phone), formData, telegramText };
    }
  });

  bindForm({
    form: "#mainForm",
    fb: "#formFeedback",
    onSuccess: resetMainTabs,
    payload: () => {
      const name = ($("#userName", root)?.value || "").trim();
      const phone = ($("#userPhone", root)?.value || "").trim();
      const car = ($("#carModel", root)?.value || "").trim();
      const issue = ($("#issueDesc", root)?.value || "").trim();
      const type = ($("#requestType", root)?.value || "Ремонт").trim();
      const service = ($("#serviceName", root)?.value || "").trim();
      const formData = new FormData();
      formData.append("Тип заявки", type);
      formData.append("Услуга", service);
      formData.append("Имя", name);
      formData.append("Телефон", phone);
      formData.append("Автомобиль", car);
      formData.append("Проблема", issue);
      formData.append("_subject", `Заявка: ${type}${service ? " — " + service : ""}`);
      const telegramText = `<b>ЗАЯВКА</b>\nТип: ${type}\nУслуга: ${service || "—"}\nИмя: ${name}\nТелефон: ${phone}\nАвто: ${car || "—"}\nПроблема: ${issue || "—"}`;
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
      const service = ($("#modalService", root)?.value || "").trim();
      const formData = new FormData();
      formData.append("Имя", name);
      formData.append("Телефон", phone);
      formData.append("Автомобиль / Запчасти", car);
      formData.append("Услуга", service);
      formData.append("_subject", `Быстрая запись${service ? ": " + service : ""}`);
      const telegramText = `<b>БЫСТРАЯ ЗАПИСЬ</b>\nУслуга: ${service || "—"}\nИмя: ${name}\nТелефон: ${phone}\nАвто: ${car || "—"}`;
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
      formData.append("_subject", "Отклик на вакансию");
      const telegramText = `<b>ВАКАНСИЯ</b>\nИмя: ${name}\nТелефон: ${phone}\nОпыт: ${exp}\nО себе: ${msg || "—"}`;
      return { valid: !!(name && phone && exp), formData, telegramText };
    }
  });
})();
