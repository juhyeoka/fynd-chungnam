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

document.querySelector("[data-inquiry-form]")?.addEventListener("submit", (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const data = new FormData(form);
  const services = data.getAll("service");
  const subject = `[FYND 상담] ${data.get("name") || "새 문의"}`;
  const lines = [
    `이름 또는 상호: ${data.get("name") || ""}`,
    `연락처: ${data.get("contact") || ""}`,
    `관심 항목: ${services.length ? services.join(", ") : "선택하지 않음"}`,
    "",
    "현재 고민:",
    data.get("message") || ""
  ];

  window.location.href = `mailto:fyndcom@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join("\n"))}`;
});
