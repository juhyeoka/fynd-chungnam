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

document.querySelector("[data-inquiry-form]")?.addEventListener("submit", (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const data = new FormData(form);
  const services = data.getAll("service");
  const subject = `[FYND 참여 문의] ${data.get("name") || "새 문의"}`;
  const lines = [
    `상호 또는 담당자: ${data.get("name") || ""}`,
    `지역·업종: ${data.get("region") || ""}`,
    `연락처: ${data.get("contact") || ""}`,
    `희망 참여 방식: ${services.length ? services.join(", ") : "선택하지 않음"}`,
    "",
    "가게와 상품 소개:",
    data.get("message") || ""
  ];

  window.location.href = `mailto:fyndcom@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join("\n"))}`;
});
