<script>
const hero = document.getElementById("hero");

const start = 10;
const range = 150;
const ease = 0.5;
const deadZone = 0.00;

let target = 0;
let current = 0;
let ticking = false;
let hasScrolled = false;   // ⭐ 新增：首帧锁

// ⛔ 初始化：强制首帧为 0
hero.style.setProperty("--t", 0);
hero.style.setProperty("--p", 0);

window.addEventListener("scroll", () => {
  // ⭐ 第一次滚动才解锁
  if (!hasScrolled) {
    hasScrolled = true;
    hero.classList.add("has-scrolled");
  }

  const y = window.scrollY;
  target = (y - start) / range;   // 原始进度（可 > 1）

  if (!ticking) {
    ticking = true;
    requestAnimationFrame(update);
  }
}, { passive: true });

function update() {
  const diff = target - current;

  if (Math.abs(diff) > deadZone) {
    current += diff * ease;

    // 原始进度（reveal 用）
    hero.style.setProperty("--t", current);

    // clamp 进度（keywords 用）
    hero.style.setProperty(
      "--p",
      Math.min(Math.max(current, 0), 1)
    );

    requestAnimationFrame(update);
  } else {
    current = target;

    hero.style.setProperty("--t", current);
    hero.style.setProperty(
      "--p",
      Math.min(Math.max(current, 0), 1)
    );

    ticking = false;
  }
}
</script>
