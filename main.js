(() => {
  const $ = (s, p = document) => p.querySelector(s);
  const $$ = (s, p = document) => Array.from(p.querySelectorAll(s));
  const root = $("#ms-root");
  if (!root) return;

  const CONFIG = {
    EMAIL_ENDPOINT: "https://formsubmit.co/ajax/a-prom01@mail.ru",
    TELEGRAM_ENDPOINT: ""
  };

  const page = document.body.dataset.page || "home";
  $$("[data-nav]", root).forEach((a) => a.classList.toggle("active", a.dataset.nav === page));

  const burger = $("#burgerBtn", root);
  const mobileNav = $("#mobileNav", root);

  const closeMobileNav = () => {
    mobileNav?.classList.remove("open");
    burger?.classList.remove("open");
    burger?.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  };

  const openMobileNav = () => {
    mobileNav?.classList.add("open");
    burger?.classList.add("open");
    burger?.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
  };

  burger?.addEventListener("click", () => {
    mobileNav?.classList.contains("open") ? closeMobileNav() : openMobileNav();
  });
  mobileNav?.addEventListener("click", (e) => { if (e.target === mobileNav) closeMobileNav(); });
  $$(".mobile-nav a", root).forEach((a) => a.addEventListener("click", closeMobileNav));

  // Modal
  const modal = $("#callbackModal", root);
  let lastFocus = null;

  const openModal = () => {
    if (!modal) return;
    lastFocus = document.activeElement;
    modal.classList.add("open");
    document.body.style.overflow = "hidden";
    $("input", modal)?.focus();
  };

  const closeModal = () => {
    modal?.classList.remove("open");
    if (!mobileNav?.classList.contains("open")) document.body.style.overflow = "";
    lastFocus?.focus?.();
  };

  $$(".open-modal-btn", root).forEach((b) => b.addEventListener("click", openModal));
  $$("[data-close]", root).forEach((b) => b.addEventListener("click", closeModal));
  modal?.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });
  window.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });

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

  $$('input[type="tel"]', root).forEach((inp) => {
    inp.addEventListener("focus", () => { if (!inp.value) inp.value = "+375 "; });
  });

  async function sendToEmail(formData) {
    const body = new FormData();
    for (const [k, v] of formData.entries()) body.append(k, v);
    body.append("_captcha", "false");
    try {
      const res = await fetch(CONFIG.EMAIL_ENDPOINT, { method: "POST", body });
      return res.ok;
    } catch { return false; }
  }

  const feedback = (el, html, t = 5000) => {
    if (!el) return;
    el.innerHTML = html;
    if (t) setTimeout(() => { el.innerHTML = ""; }, t);
  };

  function bindForm({ form, fb, payload, closeOnSuccess }) {
    const formEl = $(form, root);
    const fbEl = $(fb, root);
    if (!formEl || !fbEl) return;

    formEl.addEventListener("submit", async (e) => {
      e.preventDefault();
      const data = payload();
      if (!data.valid) {
        feedback(fbEl, '<span style="color:#dc2626">Заполните имя и телефон</span>', 3000);
        return;
      }
      feedback(fbEl, '<span style="color:#2563eb">Отправка...</span>', 0);
      const ok = await sendToEmail(data.formData);
      if (!ok) {
        feedback(fbEl, '<span style="color:#dc2626">Ошибка. Позвоните: +375 33 911-66-11</span>');
        return;
      }
      feedback(fbEl, '<span style="color:#16a34a">✓ Заявка принята! Перезвоним за 10 минут.</span>');
      formEl.reset();
      if (closeOnSuccess) setTimeout(closeModal, 1500);
    });
  }

  bindForm({
    form: "#heroForm",
    fb: "#heroFeedback",
    payload: () => {
      const name = ($("#heroName", root)?.value || "").trim();
      const phone = ($("#heroPhone", root)?.value || "").trim();
      const car = ($("#heroCar", root)?.value || "").trim();
      const fd = new FormData();
      fd.append("Имя", name);
      fd.append("Телефон", phone);
      fd.append("Автомобиль", car);
      fd.append("_subject", "Заявка с главной");
      return { valid: !!(name && phone), formData: fd };
    }
  });

  bindForm({
    form: "#mainForm",
    fb: "#formFeedback",
    payload: () => {
      const name = ($("#userName", root)?.value || "").trim();
      const phone = ($("#userPhone", root)?.value || "").trim();
      const car = ($("#carModel", root)?.value || "").trim();
      const issue = ($("#issueDesc", root)?.value || "").trim();
      const type = ($("#requestType", root)?.value || "Ремонт").trim();
      const fd = new FormData();
      fd.append("Тип", type);
      fd.append("Имя", name);
      fd.append("Телефон", phone);
      fd.append("Автомобиль", car);
      fd.append("Проблема", issue);
      fd.append("_subject", `Заявка: ${type}`);
      return { valid: !!(name && phone), formData: fd };
    }
  });

  bindForm({
    form: "#modalForm",
    fb: "#modalFeedback",
    closeOnSuccess: true,
    payload: () => {
      const name = ($("#modalName", root)?.value || "").trim();
      const phone = ($("#modalPhone", root)?.value || "").trim();
      const car = ($("#modalCar", root)?.value || "").trim();
      const fd = new FormData();
      fd.append("Имя", name);
      fd.append("Телефон", phone);
      fd.append("Автомобиль", car);
      fd.append("_subject", "Быстрая запись");
      return { valid: !!(name && phone), formData: fd };
    }
  });
})();
