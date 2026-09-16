document.documentElement.classList.add("js-ready");

const body = document.body;
const siteHeader = document.querySelector("[data-header]");
const menuToggle = document.querySelector("[data-menu-toggle]");
const mobileMenu = document.querySelector("[data-mobile-menu]");
const menuClose = document.querySelector("[data-menu-close]");

function updateHeader() {
  siteHeader?.classList.toggle("is-scrolled", window.scrollY > 24);
}

updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });

const homeSections = [...document.querySelectorAll(".page-home main > section:not(.brand-hero)")];

if (homeSections.length && "IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      sectionObserver.unobserve(entry.target);
    });
  }, { threshold: 0.16 });
  homeSections.forEach((section) => sectionObserver.observe(section));
} else {
  homeSections.forEach((section) => section.classList.add("is-visible"));
}

function setMenu(open, restoreFocus = true) {
  if (!menuToggle || !mobileMenu) return;
  menuToggle.setAttribute("aria-expanded", String(open));
  mobileMenu.setAttribute("aria-hidden", String(!open));
  mobileMenu.classList.toggle("is-open", open);
  body.classList.toggle("menu-open", open);
  if (open) {
    requestAnimationFrame(() => menuClose?.focus());
  } else if (restoreFocus) {
    menuToggle.focus();
  }
}

menuToggle?.addEventListener("click", () => {
  setMenu(menuToggle.getAttribute("aria-expanded") !== "true");
});

menuClose?.addEventListener("click", () => setMenu(false));
mobileMenu?.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => setMenu(false, false)));
document.addEventListener("keydown", (event) => {
  if (menuToggle?.getAttribute("aria-expanded") !== "true") return;
  if (event.key === "Escape") {
    setMenu(false);
    return;
  }
  if (event.key !== "Tab" || !mobileMenu) return;
  const focusable = [...mobileMenu.querySelectorAll("a[href], button:not([disabled])")];
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last?.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first?.focus();
  }
});

const countGroup = document.querySelector("[data-count-group]");
const countItems = [...document.querySelectorAll("[data-count]")];
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function writeCount(element, value) {
  element.textContent = new Intl.NumberFormat("ko-KR").format(value);
}

function animateCounts() {
  if (!countItems.length) return;
  if (reduceMotion) {
    countItems.forEach((item) => writeCount(item, Number(item.dataset.count)));
    return;
  }

  const duration = 900;
  const start = performance.now();
  countItems.forEach((item) => writeCount(item, 0));

  function frame(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    countItems.forEach((item) => {
      const target = Number(item.dataset.count);
      writeCount(item, Math.round(target * eased));
    });
    if (progress < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

if (countGroup && "IntersectionObserver" in window) {
  const countObserver = new IntersectionObserver((entries) => {
    if (!entries.some((entry) => entry.isIntersecting)) return;
    animateCounts();
    countObserver.disconnect();
  }, { threshold: 0.35 });
  countObserver.observe(countGroup);
} else {
  animateCounts();
}

document.querySelector("[data-inquiry-form]")?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const data = new FormData(form);
  const status = form.querySelector("[data-form-status]");
  const submitButton = form.querySelector("button[type='submit']");
  data.append("_captcha", "false");
  data.append("_template", "table");

  if (status) {
    status.textContent = "보내는 중입니다.";
    status.classList.remove("success", "error");
  }
  if (submitButton) submitButton.disabled = true;

  try {
    const response = await fetch("https://formsubmit.co/ajax/fyndcom@gmail.com", {
      method: "POST",
      headers: { Accept: "application/json" },
      body: data
    });
    if (!response.ok) throw new Error("submit failed");
    form.reset();
    if (status) {
      status.textContent = "문의가 접수됐습니다. 확인 후 연락드리겠습니다.";
      status.classList.add("success");
    }
  } catch (error) {
    if (status) {
      status.textContent = "지금은 전송되지 않습니다. 잠시 후 다시 시도해주세요.";
      status.classList.add("error");
    }
  } finally {
    if (submitButton) submitButton.disabled = false;
  }
});
