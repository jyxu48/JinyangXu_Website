document.addEventListener("DOMContentLoaded", () => {
  console.log("logo-animate.js loaded");
  let fadeStartTime = null;
  const FADE_DURATION = 600; // 毫秒，自己调（400–800 都好看）

  const svg = document.querySelector(".site-logo svg");
  if (!svg) return console.error("SVG not found");

  const mask = svg.querySelector("#ERASE_MASK");
  if (!mask) return console.error("FRONT MASK not found");

  const backMask = svg.querySelector("#ERASE_MASK_BACK");
  if (!backMask) return console.error("BACK MASK not found");

  const motionPaths = Array.from(
    svg.querySelectorAll("#Motion .motion-path")
  );
  console.log("MOTION PATH COUNT:", motionPaths.length);

  // ===== 参数（保持你原来的语义）=====
  const ERASER_WIDTH = 6;

  // ===============================
  // 正向：主 logo（原逻辑，不动）
  // ===============================
  const maskPaths = motionPaths.map((src, i) => {
    const p = src.cloneNode(true);
    p.removeAttribute("class");
    p.setAttribute("id", `MASK_PATH_${i}`);

    p.style.fill = "none";
    p.style.stroke = "black";
    p.style.strokeWidth = String(ERASER_WIDTH);
    p.style.strokeLinecap = "butt";
    p.style.strokeLinejoin = "miter";

    const len = src.getTotalLength();
    p.style.strokeDasharray = `${len}`;
    p.style.strokeDashoffset = `${len}`;

    mask.appendChild(p);
    return { el: p, len };
  });

  // ===============================
  // 反向：底层 logo（新增部分）
  // ===============================
  const backMaskPaths = motionPaths.map((src, i) => {
    const p = src.cloneNode(true);
    p.removeAttribute("class");
    p.setAttribute("id", `BACK_MASK_PATH_${i}`);

    p.style.fill = "none";
    p.style.stroke = "black";
    p.style.strokeWidth = String(ERASER_WIDTH);
    p.style.strokeLinecap = "butt";
    p.style.strokeLinejoin = "miter";

    const len = src.getTotalLength();
    p.style.strokeDasharray = `${len}`;
    p.style.strokeDashoffset = `0`; // ← 反向关键：从 0 开始

    backMask.appendChild(p);
    return { el: p, len };
  });

  // ===============================
  // Scroll → progress
  // ===============================
  function calcProgress() {
    const hero = document.getElementById("hero");
    if (!hero) return 0;

    const scrollY = window.scrollY;
    const vh = window.innerHeight;

    const start = vh * 0.05;  //key vairable
    const end   = vh * 0.2225;

    const raw = (scrollY - start) / (end - start);
    return {
	    t: Math.min(1, Math.max(0, raw)),
	    raw: raw
    };

  }

  // ===============================
  // 主渲染循环
  // ===============================
  function render() {
    const { t, raw } = calcProgress();


    // ---- 正向擦除（主 logo，原功能）----
    maskPaths.forEach(({ el, len }) => {
      el.style.strokeDashoffset = `${(1 - t) * len}`;
    });

    // ---- 反向擦除（底层 logo，只在后半段）----
    if (t > 0.6) {
      const t2 = (t - 0.6) / 0.4; // 0 → 1
      backMaskPaths.forEach(({ el, len }) => {
        const p = 1 - (1 - t2) * (1 - t2);
        el.style.strokeDashoffset = `${p * len}`;
      });
    }
    
    		// ---- t=1 之后的渐隐（与 scroll 无关）----
		// ---- 渐隐：由滚动控制（主动画完成之后）----
		const FADE_SCROLL_LENGTH = 1; // 👈 想慢就改大，想快就改小

		if (raw > 1) {
			const fadeT = (raw - 1) / FADE_SCROLL_LENGTH;
			const p = Math.min(Math.max(fadeT, 0), 1);

			svg.style.opacity = 1 - p;
		} else {
			svg.style.opacity = 1;
		}

    requestAnimationFrame(render);
  }

  render();
});
