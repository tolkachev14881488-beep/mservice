(() => {
  const $ = (s, p = document) => p.querySelector(s);
  const $$ = (s, p = document) => Array.from(p.querySelectorAll(s));
  const root = $("#ms-root");
  if (!root) return;

  const CONFIG = {
    EMAIL_ENDPOINT: "https://formsubmit.co/ajax/a-prom01@mail.ru",
    TELEGRAM_ENDPOINT: ""
  };

  /* Smooth anchors */
  $$('a[href^="#"]', root).forEach((a) => {
    a.addEventListener("click", (e) => {
      const hash = a.getAttribute("href");
      if (!hash || hash === "#") return;
      const target = $(hash, root) || document.querySelector(hash);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      closeNav();
    });
  });

  /* Reveal */
  const reveals = $$(".reveal", root);
  if (reveals.length && "IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("visible", "in");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -30px 0px" });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("visible", "in"));
  }

  /* Burger */
  const burger = $("#burgerBtn", root);
  const mobileNav = $("#mobileNav", root);
  const closeNav = () => {
    mobileNav?.classList.remove("open");
    burger?.classList.remove("open");
    document.body.style.overflow = "";
  };
  burger?.addEventListener("click", () => {
    if (mobileNav?.classList.contains("open")) closeNav();
    else {
      mobileNav?.classList.add("open");
      burger?.classList.add("open");
      document.body.style.overflow = "hidden";
    }
  });
  mobileNav?.addEventListener("click", (e) => { if (e.target === mobileNav) closeNav(); });
  $$(".mobile-nav a", root).forEach((a) => a.addEventListener("click", closeNav));

  /* Progress + top */
  const progress = $("#msProgress", root);
  const topBtn = $("#msTop", root);
  const onScroll = () => {
    const d = document.documentElement;
    const max = d.scrollHeight - d.clientHeight;
    const p = max > 0 ? (d.scrollTop / max) * 100 : 0;
    if (progress) progress.style.width = p + "%";
    if (topBtn) topBtn.classList.toggle("show", d.scrollTop > 520);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  topBtn?.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  /* Counters */
  let statsDone = false;
  const about = $("#about", root);
  if (about && "IntersectionObserver" in window) {
    const statsIO = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !statsDone) {
          statsDone = true;
          $$(".num", root).forEach((el) => {
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
    }, { threshold: 0.35 });
    statsIO.observe(about);
  }

  /* Reviews slider */
  const track = $("#msRevTrack", root);
  const dots = $$("#msDots .dot", root);
  let idx = 0;
  let timer = null;
  const showRev = (i) => {
    idx = i;
    if (track) track.style.transform = `translateX(-${i * 100}%)`;
    dots.forEach((d, di) => d.classList.toggle("on", di === i));
  };
  const startAuto = () => {
    clearInterval(timer);
    if (dots.length) timer = setInterval(() => showRev((idx + 1) % dots.length), 4300);
  };
  dots.forEach((d, i) => d.addEventListener("click", () => { showRev(i); startAuto(); }));
  if (dots.length) { showRev(0); startAuto(); }

  /* FAQ */
  $$(".faq-q", root).forEach((btn) => {
    btn.addEventListener("click", () => {
      const item = btn.closest(".faq-item");
      const wasOpen = item?.classList.contains("open");
      $$(".faq-item", root).forEach((f) => f.classList.remove("open"));
      if (!wasOpen) item?.classList.add("open");
    });
  });

  /* Form tabs */
  $$(".form-tab", root).forEach((tab) => {
    tab.addEventListener("click", () => {
      $$(".form-tab", root).forEach((t) => t.classList.remove("on"));
      tab.classList.add("on");
      const rt = $("#requestType", root);
      if (rt) rt.value = tab.dataset.type || "Ремонт";
    });
  });

  $$('input[type="tel"]', root).forEach((inp) => {
    inp.addEventListener("focus", () => { if (!inp.value) inp.value = "+375 "; });
  });

  /* Modals */
  const modals = {
    callback: $("#callbackModal", root),
    vacancy: $("#vacancyModal", root),
    contacts: $("#contactsModal", root)
  };
  const openModal = (m, prefill) => {
    if (!m) return;
    m.classList.add("open");
    document.body.style.overflow = "hidden";
    if (prefill && m === modals.callback) {
      const car = $("#modalCar", root);
      if (car) car.value = prefill;
    }
  };
  const closeAll = () => {
    Object.values(modals).forEach((m) => m?.classList.remove("open"));
    document.body.style.overflow = "";
  };

  $$(".open-modal-btn", root).forEach((b) => {
    b.addEventListener("click", () => openModal(modals.callback, b.dataset.prefill || ""));
  });
  $$(".open-modal-part-btn", root).forEach((b) => {
    b.addEventListener("click", () => {
      openModal(modals.callback);
      const car = $("#modalCar", root);
      if (car) car.value = "Запчасти по VIN";
      const rt = $("#requestType", root);
      if (rt) rt.value = "Запчасти";
      $$(".form-tab", root).forEach((t) => t.classList.toggle("on", t.dataset.type === "Запчасти"));
    });
  });
  $$(".open-vacancy-modal", root).forEach((b) => b.addEventListener("click", () => openModal(modals.vacancy)));
  $$(".open-contacts-modal", root).forEach((b) => b.addEventListener("click", () => openModal(modals.contacts)));
  $$("[data-close]", root).forEach((b) => b.addEventListener("click", closeAll));
  Object.values(modals).forEach((m) => m?.addEventListener("click", (e) => { if (e.target === m) closeAll(); }));
  window.addEventListener("keydown", (e) => { if (e.key === "Escape") closeAll(); });

  /* Forms */
  async function sendEmail(fd) {
    const body = new FormData();
    for (const [k, v] of fd.entries()) body.append(k, v);
    body.append("_captcha", "false");
    try {
      return (await fetch(CONFIG.EMAIL_ENDPOINT, { method: "POST", body })).ok;
    } catch {
      return false;
    }
  }

  const fb = (el, html, t = 5000) => {
    if (!el) return;
    el.innerHTML = html;
    if (t) setTimeout(() => { el.innerHTML = ""; }, t);
  };

  function bindForm(sel, fbSel, getData, closeAfter) {
    const form = $(sel, root);
    const box = $(fbSel, root);
    if (!form || !box) return;
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const d = getData();
      if (!d.valid) {
        fb(box, '<span style="color:#ff9f9f">Заполните обязательные поля</span>', 3000);
        return;
      }
      fb(box, '<span style="color:#8ec1ff">Отправка...</span>', 0);
      if (!(await sendEmail(d.fd))) {
        fb(box, '<span style="color:#ff9f9f">Ошибка. Звоните: <a href="tel:+375339116611" style="color:#61a8ff">+375 33 911-66-11</a></span>', 8000);
        return;
      }
      fb(box, '<span style="color:#9fe0a5">✅ Принято! Перезвоним за 10 минут.</span>', 6000);
      form.reset();
      if (closeAfter) setTimeout(closeAll, 1400);
    });
  }

  bindForm("#mainForm", "#formFeedback", () => {
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
    return { valid: !!(name && phone), fd };
  });

  bindForm("#modalForm", "#modalFeedback", () => {
    const name = ($("#modalName", root)?.value || "").trim();
    const phone = ($("#modalPhone", root)?.value || "").trim();
    const car = ($("#modalCar", root)?.value || "").trim();
    const fd = new FormData();
    fd.append("Имя", name);
    fd.append("Телефон", phone);
    fd.append("Автомобиль / Запчасти", car);
    fd.append("_subject", "Быстрая запись");
    return { valid: !!(name && phone), fd };
  }, true);

  bindForm("#vacancyForm", "#vacancyFeedback", () => {
    const name = ($("#vacancyName", root)?.value || "").trim();
    const phone = ($("#vacancyPhone", root)?.value || "").trim();
    const exp = ($("#vacancyExp", root)?.value || "").trim();
    const msg = ($("#vacancyMsg", root)?.value || "").trim();
    const fd = new FormData();
    fd.append("Имя", name);
    fd.append("Телефон", phone);
    fd.append("Опыт (лет)", exp);
    fd.append("Сообщение", msg);
    fd.append("_subject", "Отклик на вакансию мастера");
    return { valid: !!(name && phone && exp), fd };
  }, true);
})();
