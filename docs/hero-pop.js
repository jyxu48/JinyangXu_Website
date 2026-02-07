<script>
const hero = document.getElementById("hero");

const start = 10;
const range = 150;
const ease = 0.5;
const deadZone = 0.00;

let target = 0;
let current = 0;
let ticking = false;

window.addEventListener("scroll", () => {
  const y = window.scrollY;

  const raw = (y - start) / range;      // 原始进度（可 > 1）
  target = raw;                         // 用 raw 做 easing

  if (!ticking) {
    ticking = true;
    requestAnimationFrame(update);
  }
}, { passive: true });

function update() {
  const diff = target - current;

  if (Math.abs(diff) > deadZone) {
    current += diff * ease;

    // ✅ 1. 原始连续进度（给 reveal）
    hero.style.setProperty("--t", current);

    // ✅ 2. clamp 后的进度（给 keywords）
    hero.style.setProperty("--p", Math.min(Math.max(current, 0), 1));

    requestAnimationFrame(update);
  } else {
    current = target;

    hero.style.setProperty("--t", current);
    hero.style.setProperty("--p", Math.min(Math.max(current, 0), 1));

    ticking = false;
  }
}

</script>
