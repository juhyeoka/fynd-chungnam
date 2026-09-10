const body = document.body;
const menuToggle = document.querySelector("[data-menu-toggle]");
const mobileMenu = document.querySelector("[data-mobile-menu]");

function setMenu(open) {
  if (!menuToggle || !mobileMenu) return;
  menuToggle.setAttribute("aria-expanded", String(open));
  mobileMenu.classList.toggle("is-open", open);
  body.classList.toggle("menu-open", open);
}

menuToggle?.addEventListener("click", () => {
  setMenu(menuToggle.getAttribute("aria-expanded") !== "true");
});

document.querySelector("[data-menu-close]")?.addEventListener("click", () => setMenu(false));
mobileMenu?.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => setMenu(false)));
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") setMenu(false);
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
