import { gsap } from "gsap";

/**
 * Creates a magnetic hover effect on the target element.
 */
export function initMagnetic(el: HTMLElement, strength = 0.3) {
  const onMouseMove = (e: MouseEvent) => {
    const bound = el.getBoundingClientRect();
    const x = e.clientX - (bound.left + bound.width / 2);
    const y = e.clientY - (bound.top + bound.height / 2);
    
    gsap.to(el, {
      x: x * strength,
      y: y * strength,
      duration: 0.3,
      ease: "power2.out",
      overwrite: "auto"
    });
  };

  const onMouseLeave = () => {
    gsap.to(el, {
      x: 0,
      y: 0,
      duration: 0.6,
      ease: "elastic.out(1.1, 0.4)",
      overwrite: "auto"
    });
  };

  el.addEventListener("mousemove", onMouseMove);
  el.addEventListener("mouseleave", onMouseLeave);

  return () => {
    el.removeEventListener("mousemove", onMouseMove);
    el.removeEventListener("mouseleave", onMouseLeave);
  };
}

/**
 * Adds a premium material ripple click effect to buttons.
 */
export function initRipple(el: HTMLElement) {
  const onClick = (e: MouseEvent) => {
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ripple = document.createElement("span");
    ripple.className = "btn-ripple";
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;

    el.appendChild(ripple);

    setTimeout(() => {
      ripple.remove();
    }, 600);
  };

  el.style.position = "relative";
  el.style.overflow = "hidden";
  el.addEventListener("click", onClick);

  return () => {
    el.removeEventListener("click", onClick);
  };
}

/**
 * 3D Holographic tilt card effect.
 */
export function initCardTilt(el: HTMLElement, maxTilt = 8) {
  const onMouseMove = (e: MouseEvent) => {
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const xc = rect.width / 2;
    const yc = rect.height / 2;
    
    const tiltX = ((yc - y) / yc) * maxTilt;
    const tiltY = ((x - xc) / xc) * maxTilt;
    
    gsap.to(el, {
      rotateX: tiltX,
      rotateY: tiltY,
      scale: 1.02,
      duration: 0.3,
      ease: "power2.out",
      transformPerspective: 1000,
      transformOrigin: "center center",
      overwrite: "auto"
    });
  };

  const onMouseLeave = () => {
    gsap.to(el, {
      rotateX: 0,
      rotateY: 0,
      scale: 1,
      duration: 0.5,
      ease: "power3.out",
      overwrite: "auto"
    });
  };

  el.addEventListener("mousemove", onMouseMove);
  el.addEventListener("mouseleave", onMouseLeave);

  return () => {
    el.removeEventListener("mousemove", onMouseMove);
    el.removeEventListener("mouseleave", onMouseLeave);
  };
}

/**
 * Custom Typewriter effect that types text character by character.
 */
export function initTypewriter(
  el: HTMLElement,
  text: string,
  speed = 30,
  onComplete?: () => void
) {
  let index = 0;
  el.textContent = "";

  const interval = setInterval(() => {
    if (index < text.length) {
      el.textContent += text.charAt(index);
      index++;
    } else {
      clearInterval(interval);
      if (onComplete) onComplete();
    }
  }, speed);

  return () => clearInterval(interval);
}

/**
 * Lightweight SVG confetti explosion burst.
 */
export function triggerConfetti(x: number, y: number) {
  const container = document.createElement("div");
  container.className = "fixed inset-0 pointer-events-none z-[99999]";
  document.body.appendChild(container);

  const colors = ["#6366f1", "#a855f7", "#10b981", "#ef4444", "#3b82f6", "#eab308"];
  const particleCount = 40;

  for (let i = 0; i < particleCount; i++) {
    const p = document.createElement("div");
    p.className = "absolute w-2 h-2 rounded-sm opacity-90";
    p.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    p.style.left = `${x}px`;
    p.style.top = `${y}px`;
    container.appendChild(p);

    const angle = Math.random() * Math.PI * 2;
    const velocity = 8 + Math.random() * 15;
    const tx = Math.cos(angle) * velocity * 15;
    const ty = Math.sin(angle) * velocity * 15 - (Math.random() * 100); // arc upwards

    gsap.to(p, {
      x: tx,
      y: ty,
      rotation: Math.random() * 360,
      opacity: 0,
      scale: Math.random() * 0.5 + 0.5,
      duration: 1.2 + Math.random() * 0.8,
      ease: "power2.out",
      onComplete: () => {
        p.remove();
      }
    });
  }

  setTimeout(() => {
    container.remove();
  }, 2500);
}
