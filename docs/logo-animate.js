document.addEventListener("DOMContentLoaded", () => {
  console.log("logo-animate.js loaded");

  const svg = document.querySelector(".site-logo svg");
  if (!svg) return console.error("SVG not found");

  const mask = svg.querySelector("#ERASE_MASK");
  if (!mask) return console.error("MASK not found");

  const motionPaths = Array.from(
    svg.querySelectorAll("#Motion .motion-path")
  );
  console.log("MOTION PATH COUNT:", motionPaths.length);

  // ===== 合理、物理正确的参数范围 =====
  const START_EARLY = 1;   // ✅ 0.3 ~ 0.6
  const SPEED = 50;         // ✅ 1.5 ~ 3
  const ERASER_WIDTH = 6;   // ✅ 10 ~ 18（< logo 高度）

  // 在 mask 里创建“擦除轨迹”
  const maskPaths = motionPaths.map((src, i) => {
    const p = src.cloneNode(true);

    // 🔥 关键：不要继承 motion-path 的 CSS（它会把 stroke 变成 none）
    p.removeAttribute("class");

    // id 也建议换掉，避免重复
    p.setAttribute("id", `MASK_PATH_${i}`);

    // 用 style 强制，比 attribute 更强
    p.style.fill = "none";
    p.style.stroke = "black";
    p.style.strokeWidth = String(ERASER_WIDTH);
    p.style.strokeLinecap = "butt";   // 或 "square"
    p.style.strokeLinejoin = "miter";


    const len = src.getTotalLength();
    p.style.strokeDasharray = `${len}`;
    p.style.strokeDashoffset = `${len}`;

    mask.appendChild(p);
    return { el: p, len };
  });


  function calcProgress() {
    const hero = document.getElementById("hero");
    if (!hero) return 0;

    const scrollY = window.scrollY;
    const vh = window.innerHeight;

   // 当页面开始滚动就触发
    const start = vh * 0.05;
    const end = vh * 0.2;

    const raw = (scrollY - start) / (end - start);
    return Math.min(1, Math.max(0, raw));
  }

  setTimeout(() => {
    maskPaths.forEach(({ el }) => (el.style.strokeDashoffset = "0"));
    console.log("FORCE ERASE");
  }, 800);


  function render() {
    const t = calcProgress();
    maskPaths.forEach(({ el, len }) => {
      el.style.strokeDashoffset = `${(1 - t) * len}`;
    });

    requestAnimationFrame(render);
  }

  render();
});
