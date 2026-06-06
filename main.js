(() => {
  const $ = (s, p = document) => p.querySelector(s);
  const $$ = (s, p = document) => Array.from(p.querySelectorAll(s));
  const root = $("#ms-root");
  if (!root) return;

  const CONFIG = { EMAIL_ENDPOINT: "https://formsubmit.co/ajax/a-prom01@mail.ru", TELEGRAM_ENDPOINT: "" };
  const page = document.body.dataset.page || "home";

  $$("[data-nav]", root).forEach((a) => a.classList.toggle("active", a.dataset.nav === page));
  if ($(".mob-bar", root)) document.body.classList.add("has-mob-bar");

  const header = $(".site-header", root);
  const hasSplit = !!$(".hero-split", root);
  const hasDarkHero = !!$(".hero-page", root);
  if (header && hasDarkHero) header.classList.add("on-hero");

  const onScroll = () => {
    const y = window.scrollY;
    if (header) {
      header.classList.toggle("scrolled", y > 40);
      if (hasDarkHero) header.classList.toggle("on-hero", y < 120);
    }
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  const burger = $("#burgerBtn", root);
  const mobileNav = $("#mobileNav", root);
  const closeNav = () => {
    mobileNav?.classList.remove("open");
    burger?.classList.remove("open");
    document.body.style.overflow = "";
  };
  burger?.addEventListener("click", () => mobileNav?.classList.contains("open") ? closeNav() : (mobileNav?.classList.add("open"), burger?.classList.add("open"), document.body.style.overflow = "hidden"));
  mobileNav?.addEventListener("click", (e) => { if (e.target === mobileNav) closeNav(); });
  $$(".mobile-nav a", root).forEach((a) => a.addEventListener("click", closeNav));

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

  const reveals = $$(".reveal", root);
  if (reveals.length && "IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("visible"); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("visible"));
  }

  async function sendEmail(fd) {
    const body = new FormData();
    for (const [k, v] of fd.entries()) body.append(k, v);
    body.append("_captcha", "false");
    try { return (await fetch(CONFIG.EMAIL_ENDPOINT, { method: "POST", body })).ok; } catch { return false; }
  }

  const fb = (el, html, t = 5000) => {
    if (!el) return;
    el.innerHTML = html;
    if (t) setTimeout(() => { el.innerHTML = ""; }, t);
  };

  function bindForm(sel, fbSel, getData) {
    const form = $(sel, root);
    const box = $(fbSel, root);
    if (!form || !box) return;
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const d = getData();
      if (!d.valid) { fb(box, '<span style="color:#dc2626">Заполните имя и телефон</span>', 3000); return; }
      fb(box, '<span style="color:#2563eb">Отправка...</span>', 0);
      if (!(await sendEmail(d.fd))) {
        fb(box, '<span style="color:#dc2626">Ошибка. Звоните: +375 33 911-66-11</span>');
        return;
      }
      fb(box, '<span style="color:#16a34a">✓ Принято! Перезвоним за 10 мин.</span>');
      form.reset();
    });
  }

  bindForm("#heroForm", "#heroFeedback", () => {
    const name = ($("#heroName", root)?.value || "").trim();
    const phone = ($("#heroPhone", root)?.value || "").trim();
    const car = ($("#heroCar", root)?.value || "").trim();
    const fd = new FormData();
    fd.append("Имя", name); fd.append("Телефон", phone); fd.append("Автомобиль", car);
    fd.append("_subject", "Заявка с главной");
    return { valid: !!(name && phone), fd };
  });

  bindForm("#mainForm", "#formFeedback", () => {
    const name = ($("#userName", root)?.value || "").trim();
    const phone = ($("#userPhone", root)?.value || "").trim();
    const car = ($("#carModel", root)?.value || "").trim();
    const issue = ($("#issueDesc", root)?.value || "").trim();
    const type = ($("#requestType", root)?.value || "Ремонт").trim();
    const fd = new FormData();
    fd.append("Тип", type); fd.append("Имя", name); fd.append("Телефон", phone);
    fd.append("Автомобиль", car); fd.append("Проблема", issue);
    fd.append("_subject", `Заявка: ${type}`);
    return { valid: !!(name && phone), fd };
  });
})();
