const body = document.body;
const header = document.querySelector("[data-header]");
const menuToggle = document.querySelector("[data-menu-toggle]");
const mobileMenu = document.querySelector("[data-mobile-menu]");

function setMenu(open) {
  if (!menuToggle || !mobileMenu || !header) return;
  menuToggle.setAttribute("aria-expanded", String(open));
  mobileMenu.classList.toggle("is-open", open);
  header.classList.toggle("menu-active", open);
  body.classList.toggle("menu-open", open);
}

menuToggle?.addEventListener("click", () => {
  setMenu(menuToggle.getAttribute("aria-expanded") !== "true");
});

document.querySelector("[data-menu-close]")?.addEventListener("click", () => {
  setMenu(false);
});

mobileMenu?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => setMenu(false));
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") setMenu(false);
});

if (header && !header.classList.contains("inner-header")) {
  const updateHeader = () => header.classList.toggle("is-scrolled", window.scrollY > 40);
  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });
}

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add("is-visible");
    revealObserver.unobserve(entry.target);
  });
}, { threshold: 0.12, rootMargin: "0px 0px -40px" });

document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));

document.querySelector("[data-inquiry-form]")?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const data = new FormData(form);
  const status = form.querySelector("[data-form-status]");
  const submitButton = form.querySelector("button[type='submit']");
  const statusBaseClass = status?.className || "";
  data.append("_captcha", "false");
  data.append("_template", "table");

  if (status) {
    status.textContent = "보내는 중입니다.";
    status.className = statusBaseClass;
  }
  if (submitButton) submitButton.disabled = true;

  try {
    const response = await fetch("https://formsubmit.co/ajax/fyndcom@gmail.com", {
      method: "POST",
      headers: { "Accept": "application/json" },
      body: data
    });
    if (!response.ok) throw new Error("submit failed");
    form.reset();
    if (status) {
      status.textContent = "문의가 접수되었습니다. 확인 후 연락드리겠습니다.";
      status.classList.add("success");
    }
  } catch (error) {
    if (status) {
      status.textContent = "전송하지 못했습니다. 잠시 후 다시 시도해 주세요.";
      status.classList.add("error");
    }
  } finally {
    if (submitButton) submitButton.disabled = false;
  }
});
